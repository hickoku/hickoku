import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Hr,
  Preview,
} from "@react-email/components";
import * as React from "react";

interface OrderRefundEmailProps {
  customerFirstName: string;
  orderNumber: string;
  refundAmount: number;
}

export const OrderRefundEmail = ({
  customerFirstName = "Customer",
  orderNumber = "HK-0000000",
  refundAmount = 0,
}: OrderRefundEmailProps) => {
  const formatPrice = (amount: number) => {
    return `₹${Number(amount).toFixed(2)}`;
  };

  return (
    <Html>
      <Head />
      <Preview>Refund Initiated for Order #{orderNumber}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={headerSection}>
            <Heading style={heading}>Refund Initiated</Heading>
            <Text style={subText}>Order #{orderNumber}</Text>
          </Section>

          <Hr style={hr} />

          <Section>
            <Text style={text}>Hi {customerFirstName},</Text>
            <Text style={text}>
              We've initiated a refund of <strong>{formatPrice(refundAmount)}</strong> for your order <strong>#{orderNumber}</strong>, which has been cancelled.
            </Text>
            <Text style={text}>
              The amount will be credited back to your original payment method within 5-7 business days, depending on your bank.
            </Text>
          </Section>

          <Hr style={hr} />

          <Section style={footerSection}>
            <Text style={footerText}>
              Need help? Contact us at support@hickoku.com
            </Text>
            <Text style={legalText}>
              © {new Date().getFullYear()} Hickoku Perfumes. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default OrderRefundEmail;

// Styles
const main = {
  backgroundColor: "#f9fafb",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
  padding: "40px 0",
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "32px",
  borderRadius: "8px",
  border: "1px solid #e5e7eb",
  maxWidth: "580px",
};

const headerSection = { textAlign: "center" as const, paddingBottom: "20px" };
const heading = { fontSize: "24px", fontWeight: "700", color: "#111827", margin: "0 0 8px 0" };
const subText = { fontSize: "16px", color: "#6b7280", margin: "0" };
const hr = { borderColor: "#e5e7eb", margin: "24px 0" };
const text = { fontSize: "16px", color: "#374151", lineHeight: "24px", margin: "0 0 16px 0" };
const footerSection = { textAlign: "center" as const, paddingTop: "20px" };
const footerText = { fontSize: "14px", color: "#6b7280", margin: "0 0 10px 0" };
const legalText = { fontSize: "12px", color: "#9ca3af", margin: "0" };
