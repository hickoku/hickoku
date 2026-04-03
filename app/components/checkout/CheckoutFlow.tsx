"use client";

import { motion } from "motion/react";
import { useContext } from "react";
import { CheckoutContext } from "../../context/CheckoutContext";
import { AddressForm } from "./AddressForm";
import { ShippingMethod } from "./ShippingMethod";
import { RazorpayPayment } from "./RazorpayPayment";
import {
  Check,
  Edit2,
  ChevronDown,
  MapPin,
  Truck,
  CreditCard,
} from "lucide-react";
import { useState } from "react";
import { useLocale } from "../../context/LocaleContext";

export function CheckoutFlow() {
  const context = useContext(CheckoutContext);
  if (!context) return null;

  const { state, dispatch } = context;
  const { t } = useLocale();
  const [expandedStep, setExpandedStep] = useState<string | null>(null);

  const steps = [
    { id: "address", label: t("checkout.address"), icon: MapPin },
    // { id: "shipping", label: t("checkout.shipping"), icon: Truck }, // Shipping step hidden
    { id: "payment", label: t("checkout.payment"), icon: CreditCard },
  ];

  const currentStepIndex = steps.findIndex((step) => step.id === state.step);
  const actualCurrentStepIndex = currentStepIndex >= 0 ? currentStepIndex : 0;

  const getAddressSummary = () => {
    if (!state.address.firstName) return null;
    const {
      firstName,
      lastName,
      street,
      city,
      state: stateName,
      zipCode,
    } = state.address;
    return `${firstName} ${lastName}, ${street}, ${city}, ${stateName} ${zipCode}`;
  };

  const getShippingSummary = () => {
    if (!state.shippingMethod) return null;
    const shippingOptions: Record<string, string> = {
      standard: "Standard (₹100)",
      express: "Express (₹300)",
      overnight: "Overnight (₹500)",
    };
    return shippingOptions[state.shippingMethod];
  };

  const handleEditStep = (stepId: string) => {
    dispatch({
      type: "SET_STEP",
      payload: stepId as "address" | "shipping" | "payment" | "confirmation",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold">{t("checkout.title")}</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps with Forms Below Headers */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          {steps.map((step, index) => {
            const isCompleted = index < actualCurrentStepIndex;
            const isCurrent = index === actualCurrentStepIndex;
            const StepIcon = step.icon;

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`rounded-xl border-2 overflow-hidden transition-all ${
                  isCurrent
                    ? "border-blue-600 bg-white"
                    : isCompleted
                      ? "border-green-200 bg-green-50"
                      : "border-gray-200 bg-gray-50"
                }`}
              >
                {/* Step Header */}
                <div className="p-4 sm:px-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      {/* Step Circle with Icon */}
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold flex-shrink-0 transition-all ${
                          isCompleted
                            ? "bg-green-600 text-white"
                            : isCurrent
                              ? "bg-blue-600 text-white"
                              : "bg-gray-400 text-white"
                        }`}
                      >
                        {isCompleted ? (
                          <Check className="w-5 h-5" />
                        ) : (
                          <StepIcon className="w-5 h-5" />
                        )}
                      </motion.div>

                      {/* Step Title and Summary */}
                      <div className="flex-1">
                        <h3
                          className={`font-semibold text-lg ${
                            isCurrent ? "text-blue-900" : "text-gray-900"
                          }`}
                        >
                          {step.label}
                        </h3>
                        {isCompleted && (
                          <p className="text-sm text-gray-600 mt-2 break-words">
                            {step.id === "address" && getAddressSummary()}
                            {step.id === "shipping" && getShippingSummary()}
                            {step.id === "payment" &&
                              t("checkout.paymentVerified")}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Edit Button for Completed Steps */}
                    {isCompleted && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.05 }}
                        onClick={() => handleEditStep(step.id)}
                        className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors flex-shrink-0 mt-1"
                        title="Edit this step"
                      >
                        <Edit2 className="w-4 h-4" />
                      </motion.button>
                    )}
                  </div>
                </div>

                {/* Step Content Form - Only show for current step */}
                {isCurrent && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t-2 border-gray-200 p-4 sm:p-5 bg-white"
                  >
                    {step.id === "address" && <AddressForm />}
                    {/* {step.id === "shipping" && <ShippingMethod />} */}
                    {step.id === "payment" && <RazorpayPayment />}
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
