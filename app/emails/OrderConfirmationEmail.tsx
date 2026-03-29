import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Img,
  Heading,
  Link,
  Hr,
  Row,
  Column,
  Preview,
} from "@react-email/components";
import * as React from "react";

// Assuming we mirror the Order type here to avoid tight coupling or import issues in isolated renderers
interface OrderItem {
  productName: string;
  size: string;
  quantity: number;
  price: number;
  image: string;
}

export interface OrderConfirmationEmailProps {
  orderNumber: string;
  customerFirstName: string;
  items: OrderItem[];
  subtotal: number;
  surpriseDiscount?: number;
  tax: number;
  shippingCost: number;
  total: number;
  trackingUrl: string;
}

const formatPrice = (amount: number) => {
  return `₹${Number(amount).toFixed(2)}`;
};

export const OrderConfirmationEmail = ({
  orderNumber = "HK-0000000",
  customerFirstName = "Valued Customer",
  items = [],
  subtotal = 0,
  surpriseDiscount = 0,
  tax = 0,
  shippingCost = 0,
  total = 0,
  trackingUrl = "https://hickoku.com/order-tracking",
}: OrderConfirmationEmailProps) => {
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://hickoku.com";
  
  return (
    <Html>
      <Head />
      <Preview>Your Hickoku Perfumes order {orderNumber} is confirmed!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={headerSection}>
            {/* Replace with actual hosted logo URL */}
            <Text style={logoText}>HICKOKU</Text>
          </Section>

          <Section style={heroSection}>
            <Heading style={heading}>Thank you for your order!</Heading>
            <Text style={paragraph}>
              Hi {customerFirstName},<br /><br />
              We are thrilled to confirm that your order <strong>{orderNumber}</strong> has been successfully received and is currently being prepared by our artisans.
            </Text>
            
            <Section style={buttonContainer}>
              <Link href={trackingUrl} style={button}>
                Track Your Order
              </Link>
            </Section>
          </Section>

          <Hr style={hr} />

          <Section style={itemsSection}>
            <Heading style={subHeading}>Order Summary</Heading>
            {items.map((item, index) => {
              const isLocalhost = baseUrl.includes("localhost");
              const targetImage = item.image.startsWith('/') ? `${baseUrl}${item.image}` : item.image;
              const imageUrl = isLocalhost 
                ? "https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=200&auto=format&fit=crop" 
                : targetImage;

              return (
                <Row key={index} style={itemRow}>
                  <Column style={itemImageColumn}>
                    <Img src={imageUrl} width={64} height={64} style={itemImage} alt={item.productName} />
                  </Column>
                  <Column style={itemDetailsColumn}>
                    <Text style={itemName}>{item.productName}</Text>
                    <Text style={itemMeta}>Size: {item.size} | Qty: {item.quantity}</Text>
                  </Column>
                  <Column style={itemPriceColumn}>
                    <Text style={itemPriceText}>{formatPrice(item.price * item.quantity)}</Text>
                  </Column>
                </Row>
              );
            })}
          </Section>

          <Hr style={hr} />

          <Section style={totalsSection}>
            <Row style={totalRow}>
              <Column><Text style={totalLabel}>Subtotal</Text></Column>
              <Column><Text style={totalValue}>{formatPrice(subtotal)}</Text></Column>
            </Row>
            {surpriseDiscount > 0 && (
              <Row style={totalRow}>
                <Column><Text style={discountLabel}>Surprise Discount 🎉</Text></Column>
                <Column><Text style={discountValue}>-{formatPrice(surpriseDiscount)}</Text></Column>
              </Row>
            )}
            {shippingCost > 0 && (
              <Row style={totalRow}>
                <Column><Text style={totalLabel}>Shipping</Text></Column>
                <Column><Text style={totalValue}>{formatPrice(shippingCost)}</Text></Column>
              </Row>
            )}
            <Row style={totalRow}>
              <Column><Text style={totalLabel}>GST (18%)</Text></Column>
              <Column><Text style={totalValue}>{formatPrice(tax)}</Text></Column>
            </Row>
            <Hr style={dottedHr} />
            <Row style={totalRow}>
              <Column><Text style={grandTotalLabel}>Total</Text></Column>
              <Column><Text style={grandTotalValue}>{formatPrice(total)}</Text></Column>
            </Row>
          </Section>

          <Hr style={hr} />

          <Section style={footerSection}>
            <Text style={footerText}>
              Need help? Reach us at <Link href="mailto:support@hickoku.com" style={supportLink}>support@hickoku.com</Link><br />
              Follow us on social media for exclusive drops and updates.
            </Text>
            <Row style={socialContainer}>
              <Column align="right" style={socialIconCol}>
                <Link href="https://instagram.com/hickoku"><Img width={24} src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" alt="Instagram"/></Link>
              </Column>
              <Column align="center" style={socialIconCol}>
                <Link href="https://facebook.com/hickoku"><Img width={24} src="https://cdn-icons-png.flaticon.com/512/1384/1384053.png" alt="Facebook"/></Link>
              </Column>
              <Column align="left" style={socialIconCol}>
                <Link href="https://x.com/hickoku"><Img width={24} src="https://cdn-icons-png.flaticon.com/512/5969/5969020.png" alt="X"/></Link>
              </Column>
            </Row>
            <Text style={legalText}>
              © {new Date().getFullYear()} Hickoku Perfumes. All rights reserved.<br />
              Gujri Bazar, Kirana Market, Kamptee, Nagpur-441002, Maharashtra, India
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  );
};

export default OrderConfirmationEmail;

// --- STYLES ---

const main = {
  backgroundColor: '#f9fafb',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
  padding: '40px 0',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '40px',
  borderRadius: '16px',
  border: '1px solid #f3f4f6',
  maxWidth: '600px',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
};

const headerSection = {
  textAlign: 'center' as const,
  paddingBottom: '30px',
};

const logoText = {
  margin: '0',
  fontSize: '28px',
  fontWeight: '800',
  letterSpacing: '4px',
  color: '#b45309', // amber-700
};

const heroSection = {
  textAlign: 'left' as const,
};

const heading = {
  fontSize: '24px',
  fontWeight: '700',
  color: '#111827',
  marginBottom: '16px',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '26px',
  color: '#4b5563',
  margin: '0',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#111827',
  color: '#ffffff',
  padding: '14px 32px',
  borderRadius: '9999px',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  display: 'inline-block',
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '24px 0',
};

const dottedHr = {
  borderColor: '#e5e7eb',
  borderStyle: 'dashed',
  margin: '12px 0',
};

const itemsSection = {
  padding: '10px 0',
};

const subHeading = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#111827',
  marginBottom: '20px',
};

const itemRow = {
  marginBottom: '16px',
};

const itemImageColumn = {
  width: '64px',
  paddingRight: '16px',
};

const itemImage = {
  borderRadius: '8px',
  border: '1px solid #f3f4f6',
  objectFit: 'cover' as const,
};

const itemDetailsColumn = {
  width: '60%',
};

const itemName = {
  fontSize: '15px',
  fontWeight: '600',
  color: '#111827',
  margin: '0 0 4px 0',
};

const itemMeta = {
  fontSize: '13px',
  color: '#6b7280',
  margin: '0',
};

const itemPriceColumn = {
  width: '20%',
  textAlign: 'right' as const,
};

const itemPriceText = {
  fontSize: '15px',
  fontWeight: '600',
  color: '#111827',
  margin: '0',
};

const totalsSection = {
  padding: '10px 0',
};

const totalRow = {
  marginBottom: '10px',
};

const totalLabel = {
  fontSize: '15px',
  color: '#4b5563',
  margin: '0',
};

const totalValue = {
  fontSize: '15px',
  color: '#111827',
  fontWeight: '500',
  margin: '0',
  textAlign: 'right' as const,
};

const discountLabel = {
  fontSize: '15px',
  color: '#b45309',
  fontWeight: '600',
  margin: '0',
};

const discountValue = {
  fontSize: '15px',
  color: '#b45309',
  fontWeight: '700',
  margin: '0',
  textAlign: 'right' as const,
};

const grandTotalLabel = {
  fontSize: '18px',
  color: '#111827',
  fontWeight: '700',
  margin: '0',
};

const grandTotalValue = {
  fontSize: '20px',
  color: '#111827',
  fontWeight: '800',
  margin: '0',
  textAlign: 'right' as const,
};

const footerSection = {
  textAlign: 'center' as const,
  paddingTop: '20px',
};

const footerText = {
  fontSize: '14px',
  color: '#6b7280',
  lineHeight: '22px',
  margin: '0 0 20px 0',
};

const supportLink = {
  color: '#b45309',
  textDecoration: 'none',
  fontWeight: '600',
};

const socialContainer = {
  marginBottom: '20px',
};

const socialIconCol = {
  padding: '0 10px',
};

const legalText = {
  fontSize: '12px',
  color: '#9ca3af',
  lineHeight: '18px',
  margin: '0',
};
