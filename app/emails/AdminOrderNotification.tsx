import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Hr,
  Row,
  Column,
  Preview,
} from "@react-email/components";
import * as React from "react";

interface OrderItem {
  productName: string;
  size: string;
  quantity: number;
  price: number;
  image: string;
}

interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface AdminOrderNotificationProps {
  orderNumber: string;
  orderId: string;
  customerFirstName: string;
  customerLastName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  subtotal: number;
  surpriseDiscount?: number;
  tax: number;
  shippingCost: number;
  total: number;
  paymentId?: string;
  razorpayOrderId?: string;
  orderDate: string;
}

const formatPrice = (amount: number) => {
  return `₹${Number(amount).toFixed(2)}`;
};

export const AdminOrderNotification = ({
  orderNumber = "HK-0000000",
  orderId = "",
  customerFirstName = "",
  customerLastName = "",
  customerEmail = "",
  customerPhone = "",
  shippingAddress = { street: "", city: "", state: "", zipCode: "", country: "India" },
  items = [],
  subtotal = 0,
  surpriseDiscount = 0,
  tax = 0,
  shippingCost = 0,
  total = 0,
  paymentId = "",
  razorpayOrderId = "",
  orderDate = "",
}: AdminOrderNotificationProps) => {
  const actualCost = Number((total / 1.18).toFixed(2));
  const gst = Number((total - actualCost).toFixed(2));

  return (
    <Html>
      <Head />
      <Preview>🚨 New Order #{orderNumber} — {customerFirstName} {customerLastName} — {formatPrice(total)}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={headerSection}>
            <Text style={logoText}>HICKOKU — ADMIN</Text>
            <Heading style={heading}>🚨 New Order Received</Heading>
            <Text style={subText}>
              Order <strong>{orderNumber}</strong> placed on{" "}
              {orderDate ? new Date(orderDate).toLocaleString("en-IN", {
                dateStyle: "long",
                timeStyle: "short",
              }) : "N/A"}
            </Text>
          </Section>

          <Hr style={hr} />

          {/* Customer Details */}
          <Section>
            <Heading style={sectionHeading}>👤 Customer Details</Heading>
            <Row style={infoRow}>
              <Column style={infoLabel}><Text style={labelText}>Name</Text></Column>
              <Column style={infoValue}><Text style={valueText}>{customerFirstName} {customerLastName}</Text></Column>
            </Row>
            <Row style={infoRow}>
              <Column style={infoLabel}><Text style={labelText}>Email</Text></Column>
              <Column style={infoValue}><Text style={valueText}>{customerEmail}</Text></Column>
            </Row>
            <Row style={infoRow}>
              <Column style={infoLabel}><Text style={labelText}>Phone</Text></Column>
              <Column style={infoValue}><Text style={valueText}>{customerPhone}</Text></Column>
            </Row>
          </Section>

          <Hr style={hr} />

          {/* Shipping Address */}
          <Section>
            <Heading style={sectionHeading}>📦 Shipping Address</Heading>
            <Text style={addressText}>
              {shippingAddress.street}<br />
              {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}<br />
              {shippingAddress.country}
            </Text>
          </Section>

          <Hr style={hr} />

          {/* Order Items */}
          <Section>
            <Heading style={sectionHeading}>🛒 Order Items</Heading>
            {items.map((item, index) => (
              <Row key={index} style={itemRow}>
                <Column style={{ width: "60%" }}>
                  <Text style={itemName}>{item.productName}</Text>
                  <Text style={itemMeta}>Size: {item.size} | Qty: {item.quantity}</Text>
                </Column>
                <Column style={{ width: "20%", textAlign: "center" as const }}>
                  <Text style={itemMeta}>₹{Number(item.price).toFixed(2)} × {item.quantity}</Text>
                </Column>
                <Column style={{ width: "20%", textAlign: "right" as const }}>
                  <Text style={itemPrice}>{formatPrice(item.price * item.quantity)}</Text>
                </Column>
              </Row>
            ))}
          </Section>

          <Hr style={hr} />

          {/* Pricing Breakdown */}
          <Section>
            <Heading style={sectionHeading}>💰 Pricing Breakdown</Heading>
            <Row style={priceRow}>
              <Column><Text style={priceLabel}>Price (Subtotal)</Text></Column>
              <Column><Text style={priceValue}>{formatPrice(subtotal)}</Text></Column>
            </Row>
            {surpriseDiscount > 0 && (
              <Row style={priceRow}>
                <Column><Text style={discountLabel}>Surprise Discount</Text></Column>
                <Column><Text style={discountValue}>-{formatPrice(surpriseDiscount)}</Text></Column>
              </Row>
            )}
            <Row style={priceRow}>
              <Column><Text style={priceLabel}>Actual Cost (excl. GST)</Text></Column>
              <Column><Text style={priceValue}>{formatPrice(actualCost)}</Text></Column>
            </Row>
            <Row style={priceRow}>
              <Column><Text style={priceLabel}>GST (18%)</Text></Column>
              <Column><Text style={priceValue}>{formatPrice(gst)}</Text></Column>
            </Row>
            <Row style={priceRow}>
              <Column><Text style={priceLabel}>Handling Fee</Text></Column>
              <Column><Text style={freeText}>FREE</Text></Column>
            </Row>
            <Row style={priceRow}>
              <Column><Text style={priceLabel}>Delivery Fee</Text></Column>
              <Column><Text style={freeText}>FREE</Text></Column>
            </Row>
            <Hr style={dottedHr} />
            <Row style={priceRow}>
              <Column><Text style={totalLabel}>TOTAL CHARGED</Text></Column>
              <Column><Text style={totalValue}>{formatPrice(total)}</Text></Column>
            </Row>
          </Section>

          <Hr style={hr} />

          {/* Payment Details */}
          <Section>
            <Heading style={sectionHeading}>🏦 Payment Details</Heading>
            <Row style={infoRow}>
              <Column style={infoLabel}><Text style={labelText}>Payment Mode</Text></Column>
              <Column style={infoValue}><Text style={valueText}>Razorpay (Prepaid)</Text></Column>
            </Row>
            {paymentId && (
              <Row style={infoRow}>
                <Column style={infoLabel}><Text style={labelText}>Payment ID</Text></Column>
                <Column style={infoValue}><Text style={valueText}>{paymentId}</Text></Column>
              </Row>
            )}
            {razorpayOrderId && (
              <Row style={infoRow}>
                <Column style={infoLabel}><Text style={labelText}>Razorpay Order ID</Text></Column>
                <Column style={infoValue}><Text style={valueText}>{razorpayOrderId}</Text></Column>
              </Row>
            )}
            <Row style={infoRow}>
              <Column style={infoLabel}><Text style={labelText}>Internal Order ID</Text></Column>
              <Column style={infoValue}><Text style={valueText}>{orderId}</Text></Column>
            </Row>
          </Section>

          <Hr style={hr} />

          <Section style={footerSection}>
            <Text style={footerText}>
              This is an automated notification from Hickoku Perfumes order system.<br />
              Please process this order at the earliest.
            </Text>
            <Text style={legalText}>
              © {new Date().getFullYear()} Hickoku Perfumes. Internal Use Only.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default AdminOrderNotification;

// --- STYLES ---

const main = {
  backgroundColor: "#f1f5f9",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
  padding: "40px 0",
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "32px",
  borderRadius: "12px",
  border: "1px solid #e2e8f0",
  maxWidth: "600px",
};

const headerSection = {
  textAlign: "center" as const,
  paddingBottom: "16px",
};

const logoText = {
  margin: "0 0 8px 0",
  fontSize: "20px",
  fontWeight: "800",
  letterSpacing: "3px",
  color: "#dc2626",
};

const heading = {
  fontSize: "22px",
  fontWeight: "700",
  color: "#111827",
  margin: "0 0 8px 0",
};

const subText = {
  fontSize: "14px",
  color: "#6b7280",
  margin: "0",
};

const sectionHeading = {
  fontSize: "16px",
  fontWeight: "600",
  color: "#1e293b",
  margin: "0 0 12px 0",
};

const hr = { borderColor: "#e5e7eb", margin: "20px 0" };
const dottedHr = { borderColor: "#e5e7eb", borderStyle: "dashed", margin: "10px 0" };

const infoRow = { marginBottom: "6px" };
const infoLabel = { width: "35%" };
const infoValue = { width: "65%" };

const labelText = { fontSize: "13px", color: "#6b7280", margin: "0", fontWeight: "600" };
const valueText = { fontSize: "14px", color: "#111827", margin: "0" };

const addressText = { fontSize: "14px", color: "#374151", lineHeight: "22px", margin: "0" };

const itemRow = { marginBottom: "12px", borderBottom: "1px solid #f3f4f6", paddingBottom: "8px" };
const itemName = { fontSize: "14px", fontWeight: "600", color: "#111827", margin: "0 0 2px 0" };
const itemMeta = { fontSize: "12px", color: "#6b7280", margin: "0" };
const itemPrice = { fontSize: "14px", fontWeight: "600", color: "#111827", margin: "0", textAlign: "right" as const };

const priceRow = { marginBottom: "6px" };
const priceLabel = { fontSize: "14px", color: "#4b5563", margin: "0" };
const priceValue = { fontSize: "14px", color: "#111827", fontWeight: "500", margin: "0", textAlign: "right" as const };

const discountLabel = { fontSize: "14px", color: "#16a34a", fontWeight: "600", margin: "0" };
const discountValue = { fontSize: "14px", color: "#16a34a", fontWeight: "700", margin: "0", textAlign: "right" as const };

const freeText = { fontSize: "14px", color: "#16a34a", fontWeight: "600", margin: "0", textAlign: "right" as const };

const totalLabel = { fontSize: "16px", color: "#111827", fontWeight: "800", margin: "0" };
const totalValue = { fontSize: "18px", color: "#dc2626", fontWeight: "800", margin: "0", textAlign: "right" as const };

const footerSection = { textAlign: "center" as const, paddingTop: "12px" };
const footerText = { fontSize: "13px", color: "#6b7280", lineHeight: "20px", margin: "0 0 8px 0" };
const legalText = { fontSize: "11px", color: "#9ca3af", margin: "0" };
