import Razorpay from "razorpay";

const getRazorpayInstance = () => {
    const isProd = process.env.APP_ENV === "prod";
    const KEY_ID = isProd ? process.env.RAZORPAY_KEY_ID_PROD : process.env.RAZORPAY_KEY_ID_STAGE;
    const KEY_SECRET = isProd ? process.env.RAZORPAY_KEY_SECRET_PROD : process.env.RAZORPAY_KEY_SECRET_STAGE;

    if (!KEY_ID || !KEY_SECRET) {
        // We log a warning but don't throw immediately, as this might be called during build
        console.warn("[Razorpay] Missing credentials. API calls will fail.");
        return null;
    }

    return new Razorpay({
        key_id: KEY_ID,
        key_secret: KEY_SECRET,
    });
};

/**
 * Issue a refund for a payment ID.
 * @param paymentId The Razorpay payment ID (pay_XXX)
 * @param amount Amount in paise (optional, defaults to full refund)
 */
export const issueRazorpayRefund = async (paymentId: string, amount?: number) => {
    const instance = getRazorpayInstance();
    if (!instance) {
        throw new Error("Razorpay client is not initialized. Check your environment variables.");
    }

    try {
        const refund = await instance.payments.refund(paymentId, {
            amount: amount, // if undefined, full refund is issued
            speed: "normal",
            notes: {
                reason: "Customer order cancelled by admin",
            },
        });
        return refund;
    } catch (error: any) {
        console.error("Razorpay Refund Error:", error);
        throw new Error(error.description || error.message || "Failed to issue refund");
    }
};
