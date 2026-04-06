import https from "https";

/**
 * Makes a raw HTTPS POST request to Delhivery.
 * We use the native Node.js `https` module instead of `fetch` because
 * Delhivery's API requires the `data` param to be raw un-encoded JSON
 * in a form-urlencoded body, and `fetch` silently re-encodes it.
 */
function rawPost(url: string, token: string, body: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const options = {
      hostname: parsed.hostname,
      port: 443,
      path: parsed.pathname + parsed.search,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
        Accept: "application/json",
        "Content-Length": Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          resolve({ raw: data });
        }
      });
    });

    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

export const createDelhiveryOrder = async (order: any) => {
  if (process.env.ENABLE_DELHIVERY !== "true") {
    console.log(
      `[DELHIVERY DISABLED via .env] Skipped logistics sync for Order ${order.orderNumber}`,
    );
    return null;
  }

  const isProd = process.env.APP_ENV === "prod";
  const clientName = isProd
    ? process.env.DELHIVERY_CLIENT_NAME_PROD
    : process.env.DELHIVERY_CLIENT_NAME_STAGE;
  const warehouseName = isProd
    ? process.env.DELHIVERY_WAREHOUSE_NAME_PROD
    : process.env.DELHIVERY_WAREHOUSE_NAME_STAGE;
  const apiUrl = isProd
    ? process.env.DELHIVERY_API_URL_PROD
    : process.env.DELHIVERY_API_URL_STAGE;
  const apiKey = isProd
    ? process.env.DELHIVERY_API_KEY_PROD
    : process.env.DELHIVERY_API_KEY_STAGE;

  if (!apiUrl || !apiKey) {
    console.error(
      `Missing Delhivery configuration: apiUrl=${apiUrl} apiKey=${apiKey}`,
    );
    return null;
  }

  try {
    const totalQty = order.items.reduce(
      (sum: number, i: any) => sum + i.quantity,
      0,
    );

    const shipment = {
      name: `${order.customerFirstName} ${order.customerLastName}`,
      add: order.shippingAddress?.street || "",
      pin: order.shippingAddress?.zipCode || "",
      city: order.shippingAddress?.city || "",
      state: order.shippingAddress?.state || "",
      country: "India",
      phone: order.customerPhone || "",
      order: order.orderNumber,
      payment_mode: "Prepaid",
      return_pin: "441002",
      return_city: "Nagpur",
      return_phone: "9960528119",
      return_add: "Gujri Bazar, Kirana Market, Kamptee",
      return_state: "Maharashtra",
      return_country: "India",
      return_name: "Hickoku Perfumes",
      products_desc: order.items.map((i: any) => i.productName).join(", "),
      hsn_code: "",
      cod_amount: "0",
      order_date: new Date().toISOString(),
      total_amount: order.total?.toString() || "0",
      seller_add: "Gujri Bazar, Kirana Market, Kamptee",
      seller_name: "Hickoku Perfumes",
      seller_inv: order.orderNumber,
      quantity: totalQty.toString(),
      waybill: "",
      shipment_width: "100",
      shipping_mode: "Surface",
      address_type: "",
    };

    const payload = {
      shipments: [shipment],
      pickup_location: {
        name: warehouseName,
      },
    };

    const payloadString = JSON.stringify(payload);
    const rawBody = `format=json&data=${payloadString}`;

    // Log outgoing payload for debugging
    console.log(
      `[Delhivery] Outgoing raw body for ${order.orderNumber}:`,
      rawBody,
    );

    const data = await rawPost(apiUrl, apiKey, rawBody);

    // Deep-log the full response including remarks for debugging
    console.log(
      `Delhivery API Response for ${order.orderNumber}:`,
      JSON.stringify(data, null, 2),
    );

    // Log individual package remarks if any failed
    if (data.packages && data.packages.length > 0) {
      data.packages.forEach((pkg: any, i: number) => {
        if (pkg.remarks && pkg.remarks.length > 0) {
          console.log(`  Package ${i + 1} remarks:`, pkg.remarks);
        }
        if (pkg.waybill) {
          console.log(`  ✅ AWB Tracking ID: ${pkg.waybill}`);
        }
      });
    }

    return data;
  } catch (error) {
    console.error("Failed to sync order with Delhivery:", error);
    return null;
  }
};

/**
 * Checks if a pincode is serviceable by Delhivery.
 */
export const checkPincodeServiceability = async (pincode: string) => {
  if (process.env.ENABLE_DELHIVERY !== "true") return true;

  const isProd = process.env.APP_ENV === "prod";
  const apiKey = isProd
    ? process.env.DELHIVERY_API_KEY_PROD
    : process.env.DELHIVERY_API_KEY_STAGE;
  const baseUrl = isProd
    ? "https://track.delhivery.com"
    : "https://staging-express.delhivery.com";
  // const baseUrl = "https://track.delhivery.com";


  try {
    const url = `${baseUrl}/c/api/pin-codes/json/?filter_codes=${pincode}`;
    console.log("url", url)
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Token ${apiKey}`,
        Accept: "application/json",
      },
    });
    if (!response.ok) return false;
    const data = await response.json();
    console.log(`[Delhivery] Pincode check for ${pincode}:`, JSON.stringify(data, null, 2));

    // Delhivery returns an array of delivery_codes. 
    // If it's empty or doesn't exist, it's not serviceable.
    if (data.delivery_codes && data.delivery_codes.length > 0) {
      // Check if any of the entries allow delivery
      return data.delivery_codes.some((code: any) =>
        code.postal_code.pre_paid === "Y" && code.postal_code.cash === "Y" &&
        code.postal_code.pin === parseInt(pincode)
      );
    }

    return false;
  } catch (error) {
    console.error("Failed to check pincode serviceability:", error);
    return true; // Fallback to true to not block users on API error
  }
};

/**
 * Creates a pickup request for a location.
 */
export const createDelhiveryPickup = async () => {
  if (process.env.ENABLE_DELHIVERY !== "true") {
    console.log("[DELHIVERY DISABLED] Skipped pickup request");
    return { success: true, message: "Disabled via config" };
  }
  const isProd = process.env.APP_ENV === "prod";
  const apiKey = isProd
    ? process.env.DELHIVERY_API_KEY_PROD
    : process.env.DELHIVERY_API_KEY_STAGE;
  const apiUrl = isProd
    ? process.env.DELHIVERY_API_URL_PROD
    : process.env.DELHIVERY_API_URL_STAGE;

  if (!apiUrl) throw new Error("Delhivery API URL not configured.");
  const baseUrl = new URL(apiUrl).origin;

  const warehouseName = isProd
    ? process.env.DELHIVERY_WAREHOUSE_NAME_PROD
    : process.env.DELHIVERY_WAREHOUSE_NAME_STAGE;

  try {
    const payload = {
      pickup_location: warehouseName,
      pickup_date: new Date().toISOString().split("T")[0],
      pickup_time: "16:00:00",
      expected_package_count: 1,
    };

    // As per the user's latest example, the pickup API uses /fm/request/new/
    // and expects standard raw JSON (application/json).
    const response = await fetch(`${baseUrl}/fm/request/new/`, {
      method: "POST",
      headers: {
        Authorization: `Token ${apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      console.log("[Delhivery Pickup Response]:", JSON.stringify(data, null, 2));
      return data;
    } else {
      const rawText = await response.text();
      console.error(`[Delhivery Pickup Error] Status: ${response.status}. Expected JSON but got:`, rawText);
      throw new Error(`Delhivery returned ${response.status}: ${rawText.substring(0, 100)}...`);
    }
  } catch (error: any) {
    console.error("Failed to create Delhivery pickup:", error);
    throw error;
  }
};

/**
 * Cancels a shipment by AWB.
 */
export const cancelDelhiveryShipment = async (awb: string) => {
  if (process.env.ENABLE_DELHIVERY !== "true" || !awb) {
    console.log("[DELHIVERY DISABLED] Skipped cancellation for AWB:", awb);
    return { success: true, status: "Cancelled" };
  }
  const isProd = process.env.APP_ENV === "prod";
  const apiKey = isProd
    ? process.env.DELHIVERY_API_KEY_PROD
    : process.env.DELHIVERY_API_KEY_STAGE;
  const apiUrl = isProd
    ? process.env.DELHIVERY_API_URL_PROD
    : process.env.DELHIVERY_API_URL_STAGE;

  if (!apiUrl) throw new Error("Delhivery API URL not configured.");
  const baseUrl = new URL(apiUrl).origin;

  try {
    const payload = {
      waybill: awb,
      cancellation: "true",
    };

    const payloadString = JSON.stringify(payload);

    const response = await fetch(`${baseUrl}/api/p/edit`, {
      method: "POST",
      headers: {
        Authorization: `Token ${apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: payloadString,
    });

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      console.log("[Delhivery Cancel Response]:", JSON.stringify(data, null, 2));

      if (data.success || data.status === "Success" || (data.packages && data.packages[0]?.status === "Cancelled")) {
        console.log(`✅ Delhivery Shipment ${awb} cancelled successfully.`);
      } else {
        console.warn(`⚠️ Delhivery Shipment ${awb} cancellation request sent but response indicates it might not be processed:`, data.remarks || data.message || "No specific remarks");
      }
      return data;
    } else {
      const rawText = await response.text();
      console.error(`[Delhivery Cancel Error] Status: ${response.status}. Expected JSON but got:`, rawText);
      throw new Error(`Delhivery returned ${response.status}: ${rawText.substring(0, 100)}...`);
    }
  } catch (error: any) {
    console.error("Failed to cancel Delhivery shipment:", error);
    throw error;
  }
};

/**
 * Calculates shipping cost using Delhivery Threshold API.
 * @param destinationPincode 6-digit destination pincode
 * @param weightInGrams Weight of shipment in grams
 */
export const getDelhiveryShippingCost = async (destinationPincode: string, weightInGrams: number = 180) => {
  if (process.env.ENABLE_DELHIVERY !== "true") return 0;

  const isProd = process.env.APP_ENV === "prod";
  const apiKey = isProd
    ? process.env.DELHIVERY_API_KEY_PROD
    : process.env.DELHIVERY_API_KEY_STAGE;
  const baseUrl = isProd
    ? "https://track.delhivery.com"
    : "https://staging-express.delhivery.com";


  // Origin pincode for Kamptee warehouse
  const originPincode = "441002";

  try {
    // Standard Threshold API: md=S (Surface), ss=Delivered (to see total cost estimate)
    // Params: md, ss, o_pin, d_pin, cgm (chargeable grams)
    const url = `${baseUrl}/api/kinko/v1/invoice/charges/.json?md=S&ss=Delivered&o_pin=${originPincode}&d_pin=${destinationPincode}&cgm=${weightInGrams}`;
    console.log(`[Delhivery Cost] Fetching from URL: ${url}`);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Token ${apiKey}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      console.error(`[Delhivery Cost] API Error: ${response.status}`);
      const errorText = await response.text();
      console.error(`[Delhivery Cost] Error Body: ${errorText}`);
      return 0; // Fallback to 0 if API fails
    }

    const data = await response.json();
    console.log(`[Delhivery Cost] Full Response for ${destinationPincode}:`, JSON.stringify(data, null, 2));

    // The API usually returns an array. We look for the first entry's total_amount.
    if (Array.isArray(data) && data.length > 0) {
      const entry = data[0];
      return parseFloat(entry.total_amount || entry.gross_amount || entry.amount || 0);
    }

    // Sometimes it's a direct object if parameters are slightly different
    if (data.total_amount) return parseFloat(data.total_amount);
    if (data.gross_amount) return parseFloat(data.gross_amount);

    return 0;
  } catch (error) {
    console.error("Failed to calculate Delhivery shipping cost:", error);
    return 0;
  }
};
