"use client";

import { motion } from "motion/react";
import { useContext, useState, useEffect } from "react";
import { CheckoutContext } from "../../context/CheckoutContext";
import { useCart } from "../../hooks/useCart";
import { ArrowRight, MapPin, Loader2, Check } from "lucide-react";

export function AddressForm() {
  const context = useContext(CheckoutContext);
  const { items, getCartItemCount } = useCart();
  if (!context) return null;

  const { state, dispatch } = context;
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLocating, setIsLocating] = useState(false);
  const [isPincodeValidating, setIsPincodeValidating] = useState(false);
  const [pincodeStatus, setPincodeStatus] = useState<"idle" | "valid" | "invalid">("idle");

  const validatePincode = async (zip: string) => {
    if (!zip || zip.length < 6) return;
    
    // Skip all Delhivery network calls if disabled
    if (!state.isDelhiveryEnabled) {
      return;
    }
    try {
      setIsPincodeValidating(true);
      const res = await fetch(`/api/checkout/pincode?pincode=${zip}`);
      const data = await res.json();
      
      if (data.serviceable) {
        setPincodeStatus("valid");
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.zipCode;
          return newErrors;
        });

        // NEW: Fetch dynamic shipping cost after pincode is validated
        const totalQty = getCartItemCount() || 1;
        const weightInGrams = totalQty * 500; // Estimate 500g per bottle
        
        dispatch({ type: "SET_SHIPPING_LOADING", payload: true });
        const costRes = await fetch("/api/checkout/shipping-cost", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pincode: zip, weight: weightInGrams })
        });
        const costData = await costRes.json();
        console.log("[Shipping] Dynamic Cost API Result:", costData);
        
        if (costData.success) {
          dispatch({ 
            type: "SET_SHIPPING_METHOD", 
            payload: { method: "standard", cost: costData.shippingCost } 
          });
        }
        dispatch({ type: "SET_SHIPPING_LOADING", payload: false });
      } else {
        setPincodeStatus("invalid");
        setErrors((prev) => ({
          ...prev,
          zipCode: "Sorry, we are not available in your area yet.",
        }));
      }
    } catch (error) {
      console.error("Pincode validation failed:", error);
      // Fallback to valid to not block user on API error
      setPincodeStatus("valid");
    } finally {
      setIsPincodeValidating(false);
    }
  };

  const fetchAddressFromCoords = async (lat: number, lon: number) => {
    try {
      setIsLocating(true);
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
      const data = await res.json();
      
      if (data && data.address) {
        const { address } = data;
        const newAddressStr = address.road || address.pedestrian || address.suburb || "";
        const city = address.city || address.town || address.village || address.county || "";
        const zip = address.postcode || "";
        const stateName = address.state || "";
        const country = address.country || "";

        if (newAddressStr) handleAddressChange("street", newAddressStr);
        if (city) handleAddressChange("city", city);
        if (zip) {
          handleAddressChange("zipCode", zip);
          validatePincode(zip);
        }
        if (stateName) handleAddressChange("state", stateName);
        if (country) handleAddressChange("country", country);
      }
    } catch (e) {
      console.error(e);
      alert("Could not fetch address details. Please type manually.");
    } finally {
      setIsLocating(false);
    }
  };

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        fetchAddressFromCoords(position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        setIsLocating(false);
        console.error("Error getting location", error);
        alert("Unable to retrieve your location. Please check browser permissions.");
      }
    );
  };

  const handleAddressChange = (
    field: keyof typeof state.address,
    value: string,
  ) => {
    dispatch({
      type: "UPDATE_ADDRESS",
      payload: { [field]: value },
    });
    
    if (field === "zipCode") {
      setPincodeStatus("idle");
      if (value.length === 6) {
        validatePincode(value);
      }
    }

    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!state.address.firstName?.trim())
      newErrors.firstName = "First name is required";
    if (!state.address.lastName?.trim())
      newErrors.lastName = "Last name is required";
    if (!state.address.email?.trim() || !state.address.email?.includes("@"))
      newErrors.email = "Valid email is required";
    if (!state.address.phone?.trim())
      newErrors.phone = "Phone number is required";
    if (!state.address.street?.trim())
      newErrors.street = "Street address is required";
    if (!state.address.city?.trim()) newErrors.city = "City is required";
    if (!state.address.state?.trim()) newErrors.state = "State is required";
    if (!state.address.zipCode?.trim()) {
      newErrors.zipCode = "Zip code is required";
    } else if (pincodeStatus === "invalid") {
      newErrors.zipCode = "Sorry, we are not available in your area yet.";
    }

    if (!state.address.country?.trim())
      newErrors.country = "Country is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = async () => {
    if (state.address.zipCode && pincodeStatus === "idle") {
      await validatePincode(state.address.zipCode);
    }

    if (validateForm()) {
      if (pincodeStatus === "invalid") return;
      dispatch({ type: "MARK_STEP_COMPLETED", payload: "address" });
      dispatch({ type: "SET_STEP", payload: "payment" });
    }
  };

  const formFields = [
    { label: "First Name", key: "firstName", type: "text" },
    { label: "Last Name", key: "lastName", type: "text" },
    { label: "Email", key: "email", type: "email" },
    { label: "Phone Number", key: "phone", type: "tel" },
    { label: "Street Address", key: "street", type: "text" },
    { label: "City", key: "city", type: "text" },
    { label: "State", key: "state", type: "text" },
    { label: "Zip Code", key: "zipCode", type: "text" },
    { label: "Country", key: "country", type: "text" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto"
    >
      <div className="mb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold mb-1">Shipping Address</h2>
          <p className="text-sm text-gray-600">
            Please enter the address where you want your order delivered
          </p>
        </div>
        {process.env.ENABLE_GEOLOCATION === "true" && (
          <button
            type="button"
            onClick={getUserLocation}
            disabled={isLocating}
            className="flex items-center justify-center gap-2 text-sm bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 transition-colors shrink-0 disabled:opacity-50"
          >
            {isLocating ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
            {isLocating ? "Locating..." : "Use Current Location"}
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <div className="grid md:grid-cols-12 gap-3">
          {/* Email - Full Width */}
          <div className="md:col-span-12">
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={state.address.email || ""}
              onChange={(e) => handleAddressChange("email", e.target.value)}
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="For order confirmation"
            />
            {errors.email && (
              <p className="text-xs text-red-500 mt-1">{errors.email}</p>
            )}
          </div>

          <div className="md:col-span-12 border-t border-gray-100 my-1"></div>

          {/* Row 1: Name & Phone */}
          <div className="md:col-span-4">
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              First Name
            </label>
            <input
              type="text"
              value={state.address.firstName || ""}
              onChange={(e) => handleAddressChange("firstName", e.target.value)}
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.firstName ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.firstName && (
              <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>
            )}
          </div>
          <div className="md:col-span-4">
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Last Name
            </label>
            <input
              type="text"
              value={state.address.lastName || ""}
              onChange={(e) => handleAddressChange("lastName", e.target.value)}
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.lastName ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.lastName && (
              <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>
            )}
          </div>
          <div className="md:col-span-4">
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              value={state.address.phone || ""}
              onChange={(e) => handleAddressChange("phone", e.target.value.replace(/\D/g, ""))}
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.phone ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.phone && (
              <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
            )}
          </div>

          <div className="md:col-span-12 border-t border-gray-100 my-1"></div>

          {/* Row 2: Street Address */}
          <div className="md:col-span-12">
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Street Address
            </label>
            <input
              type="text"
              value={state.address.street || ""}
              onChange={(e) => handleAddressChange("street", e.target.value)}
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.street ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.street && (
              <p className="text-xs text-red-500 mt-1">{errors.street}</p>
            )}
          </div>

          {/* Row 3: City, State, Zip */}
          <div className="md:col-span-4">
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              City
            </label>
            <input
              type="text"
              value={state.address.city || ""}
              onChange={(e) => handleAddressChange("city", e.target.value)}
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.city ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.city && (
              <p className="text-xs text-red-500 mt-1">{errors.city}</p>
            )}
          </div>
          <div className="md:col-span-4">
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              State
            </label>
            <input
              type="text"
              value={state.address.state || ""}
              onChange={(e) => handleAddressChange("state", e.target.value)}
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.state ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.state && (
              <p className="text-xs text-red-500 mt-1">{errors.state}</p>
            )}
          </div>
          <div className="md:col-span-4 transition-all">
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1 flex items-center justify-between">
              Zip Code
              {isPincodeValidating && <Loader2 className="w-3 h-3 animate-spin text-blue-500" />}
              {!isPincodeValidating && state.isDelhiveryEnabled && pincodeStatus === "valid" && <Check className="w-3 h-3 text-green-500" />}
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={state.address.zipCode || ""}
                onChange={(e) => handleAddressChange("zipCode", e.target.value.replace(/\D/g, ""))}
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                  errors.zipCode 
                    ? "border-red-500 focus:ring-red-500 bg-red-50" 
                    : (state.isDelhiveryEnabled && pincodeStatus === "valid")
                    ? "border-green-500 focus:ring-green-500 bg-green-50"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
              />
            </div>
            {errors.zipCode && (
              <p className="text-xs text-red-500 mt-1">{errors.zipCode}</p>
            )}
          </div>

          {/* Row 4: Country */}
          <div className="md:col-span-12">
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Country
            </label>
            <input
              type="text"
              value={state.address.country || ""}
              onChange={(e) => handleAddressChange("country", e.target.value)}
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.country ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.country && (
              <p className="text-xs text-red-500 mt-1">{errors.country}</p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-5 border-t">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => window.history.back()}
            className="w-full sm:w-auto px-5 py-2.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-center"
          >
            Back
          </motion.button>
          <motion.button
            whileHover={{ scale: isPincodeValidating ? 1 : 1.02 }}
            whileTap={{ scale: isPincodeValidating ? 1 : 0.98 }}
            onClick={handleContinue}
            disabled={isPincodeValidating}
            className="w-full sm:w-auto sm:ml-auto px-6 py-2.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPincodeValidating ? "Validating..." : "Continue to Payment"} 
            {!isPincodeValidating && <ArrowRight className="w-4 h-4" />}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
