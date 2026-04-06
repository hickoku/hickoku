import Razorpay from "razorpay";

const isProd = process.env.APP_ENV === "prod";
const KEY_ID = isProd ? process.env.RAZORPAY_KEY_ID_PROD! : process.env.RAZORPAY_KEY_ID_STAGE!;
const KEY_SECRET = isProd ? process.env.RAZORPAY_KEY_SECRET_PROD! : process.env.RAZORPAY_KEY_SECRET_STAGE!;

const razorpay = new Razorpay({
    key_id: KEY_ID,
    key_secret: KEY_SECRET,
});

/**
 * Issue a refund for a payment ID.
 * @param paymentId The Razorpay payment ID (pay_XXX)
 * @param amount Amount in paise (optional, defaults to full refund)
 */
export const issueRazorpayRefund = async (paymentId: string, amount?: number) => {
    try {
        const refund = await razorpay.payments.refund(paymentId, {
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
