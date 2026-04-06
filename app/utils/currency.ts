// This flag explicitly handles whether your database prices are in Rupees or Paise.
// Currently it is set to FALSE because your database stores standard Rupees (e.g., 499). 
// In the future, if you start storing your prices natively in Paise (e.g., 49900), simply change this to TRUE!
export const IS_DATABASE_IN_PAISE = false;

export function formatPrice(amount: number | string): string {
    const num = typeof amount === 'string' ? Number(amount.replace(/[^0-9.-]+/g, "")) : amount;

    if (IS_DATABASE_IN_PAISE) {
        return (num / 100).toFixed(2);
    }

    return Number(num).toFixed(2);
}

export function getDeliveryCharge(): number {
    if (process.env.ENABLE_SHIPPING === 'false') {
        return 0;
    }
    return IS_DATABASE_IN_PAISE ? 5000 : 50; // ₹50
}

export function convertToPaiseForRazorpay(amount: number): number {
    if (IS_DATABASE_IN_PAISE) {
        return Math.round(amount); // Already in paise
    }
    return Math.round(amount * 100); // Convert rupees to paise
}
