import https from 'https';

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
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Token ${token}`,
                'Accept': 'application/json',
                'Content-Length': Buffer.byteLength(body),
            },
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch {
                    resolve({ raw: data });
                }
            });
        });

        req.on('error', reject);
        req.write(body);
        req.end();
    });
}

export const createDelhiveryOrder = async (order: any) => {
    if (process.env.ENABLE_DELHIVERY !== 'true') {
        console.log(`[DELHIVERY DISABLED via .env] Skipped logistics sync for Order ${order.orderNumber}`);
        return null;
    }

    const clientName = process.env.DELHIVERY_CLIENT_NAME || '';
    const warehouseName = process.env.DELHIVERY_WAREHOUSE_NAME || '';
    const apiUrl = process.env.DELHIVERY_API_URL || '';
    const apiKey = process.env.DELHIVERY_API_KEY || '';

    try {
        const totalQty = order.items.reduce((sum: number, i: any) => sum + i.quantity, 0);

        const shipment = {
            waybill: "",
            client: clientName,
            name: `${order.customerFirstName} ${order.customerLastName}`,
            add: order.shippingAddress?.street || "",
            pin: order.shippingAddress?.zipCode || "",
            city: order.shippingAddress?.city || "",
            state: order.shippingAddress?.state || "",
            country: "India",
            phone: order.customerPhone || "",
            order: order.orderNumber,
            payment_mode: "Prepaid",
            cod_amount: "0",
            products_desc: order.items.map((i: any) => i.productName).join(", "),
            hsn_code: "",
            total_amount: order.total?.toString() || "0",
            seller_add: "Gujri Bazar, Kirana Market, Kamptee",
            seller_name: "Hickoku Perfumes",
            seller_inv: order.orderNumber,
            quantity: totalQty.toString(),
            weight: (totalQty * 200).toString(),
            return_pin: "441002",
            return_city: "Nagpur",
            return_phone: "9960528119",
            return_add: "Gujri Bazar, Kirana Market, Kamptee",
            return_state: "Maharashtra",
            return_country: "India",
            return_name: "Hickoku Perfumes",
            shipping_mode: "Surface",
            order_date: new Date().toISOString(),
            pickup_location: warehouseName,
        };

        const payload = {
            shipments: [shipment],
            pickup_location: {
                name: warehouseName,
            }
        };

        const payloadString = JSON.stringify(payload);
        const rawBody = `format=json&data=${payloadString}`;

        // Log outgoing payload for debugging
        console.log(`[Delhivery] Outgoing raw body for ${order.orderNumber}:`, rawBody);

        const data = await rawPost(apiUrl, apiKey, rawBody);

        // Deep-log the full response including remarks for debugging
        console.log(`Delhivery API Response for ${order.orderNumber}:`, JSON.stringify(data, null, 2));

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
