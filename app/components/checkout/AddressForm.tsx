"use client";

import { motion } from "motion/react";
import { useContext, useState } from "react";
import { CheckoutContext } from "../../context/CheckoutContext";
import { ArrowRight } from "lucide-react";

export function AddressForm() {
  const context = useContext(CheckoutContext);
  if (!context) return null;

  const { state, dispatch } = context;
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleAddressChange = (
    field: keyof typeof state.address,
    value: string,
  ) => {
    dispatch({
      type: "UPDATE_ADDRESS",
      payload: { [field]: value },
    });
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
    if (!state.address.zipCode?.trim())
      newErrors.zipCode = "Zip code is required";
    if (!state.address.country?.trim())
      newErrors.country = "Country is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validateForm()) {
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
      className="max-w-2xl mx-auto"
    >
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Shipping Address</h2>
        <p className="text-gray-600">
          Please enter the address where you want your order delivered
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-8 space-y-6">
        {/* Email - Moved to top */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={state.address.email || ""}
            onChange={(e) => handleAddressChange("email", e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.email ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="For order confirmation"
          />
          {errors.email && (
            <p className="text-sm text-red-500 mt-1">{errors.email}</p>
          )}
        </div>

        {/* Separator */}
        <div className="border-t border-gray-100 pt-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Shipping Address</h3>
        </div>

        {/* First Row - Name */}
        <div className="grid md:grid-cols-2 gap-6">
          {formFields.slice(0, 2).map((field) => (
            <div key={field.key}>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                {field.label}
              </label>
              <input
                type={field.type}
                value={
                  state.address[field.key as keyof typeof state.address] || ""
                }
                onChange={(e) =>
                  handleAddressChange(
                    field.key as keyof typeof state.address,
                    e.target.value,
                  )
                }
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors[field.key] ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors[field.key] && (
                <p className="text-sm text-red-500 mt-1">{errors[field.key]}</p>
              )}
            </div>
          ))}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            value={state.address.phone || ""}
            onChange={(e) => handleAddressChange("phone", e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.phone ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.phone && (
            <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
          )}
        </div>

        {/* Street */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Street Address
          </label>
          <input
            type="text"
            value={state.address.street || ""}
            onChange={(e) => handleAddressChange("street", e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.street ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.street && (
            <p className="text-sm text-red-500 mt-1">{errors.street}</p>
          )}
        </div>

        {/* City, State, Zip */}
        <div className="grid md:grid-cols-3 gap-6">
          {formFields.slice(5, 8).map((field) => (
            <div key={field.key}>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                {field.label}
              </label>
              <input
                type={field.type}
                value={
                  state.address[field.key as keyof typeof state.address] || ""
                }
                onChange={(e) =>
                  handleAddressChange(
                    field.key as keyof typeof state.address,
                    e.target.value,
                  )
                }
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors[field.key] ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors[field.key] && (
                <p className="text-sm text-red-500 mt-1">{errors[field.key]}</p>
              )}
            </div>
          ))}
        </div>

        {/* Country */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Country
          </label>
          <input
            type="text"
            value={state.address.country || ""}
            onChange={(e) => handleAddressChange("country", e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.country ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.country && (
            <p className="text-sm text-red-500 mt-1">{errors.country}</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row gap-4 pt-6 border-t">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => window.history.back()}
            className="w-full sm:w-auto px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-center"
          >
            Back
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleContinue}
            className="w-full sm:w-auto sm:ml-auto px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
          >
            Continue to Payment <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
