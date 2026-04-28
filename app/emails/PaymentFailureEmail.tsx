import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Link,
  Hr,
  Preview,
} from "@react-email/components";
import * as React from "react";

export interface PaymentFailureEmailProps {
  customerFirstName: string;
  checkoutUrl: string;
}

export const PaymentFailureEmail = ({
  customerFirstName = "Valued Customer",
  checkoutUrl = "https://www.hickoku.com/cart",
}: PaymentFailureEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Oops! There was an issue processing your payment.</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={headerSection}>
            <Text style={logoText}>HICKOKU</Text>
          </Section>

          <Section style={heroSection}>
            <Heading style={heading}>Payment Unsuccessful</Heading>
            <Text style={paragraph}>
              Hi {customerFirstName},<br /><br />
              We noticed that your recent payment attempt couldn't be completed. Don't worry—your cart has been securely saved, and your selected items are waiting for you.
            </Text>
            
            <Section style={buttonContainer}>
              <Link href={checkoutUrl} style={button}>
                Complete Your Order
              </Link>
            </Section>
            
            <Text style={subText}>
              If you experienced a technical glitch or your bank declined the transaction, you can simply try again using a different payment method.
            </Text>
          </Section>

          <Hr style={hr} />

          <Section style={footerSection}>
            <Text style={footerText}>
              If the amount was deducted from your account, it will be automatically refunded by your bank within 5-7 business days.<br /><br />
              Need help? Contact our support team instantly at <Link href="mailto:support@hickoku.com" style={supportLink}>support@hickoku.com</Link>.
            </Text>
            <Text style={legalText}>
              © {new Date().getFullYear()} Hickoku Perfumes.<br />
              Gujri Bazar, Kirana Market, Kamptee, Nagpur-441002, Maharashtra, India
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default PaymentFailureEmail;

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
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
};

const headerSection = {
  textAlign: 'center' as const,
  paddingBottom: '20px',
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
  color: '#dc2626', // red-600 for failure accent
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
  backgroundColor: '#b45309', // amber-700
  color: '#ffffff',
  padding: '14px 32px',
  borderRadius: '9999px',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  display: 'inline-block',
};

const subText = {
  fontSize: '14px',
  lineHeight: '22px',
  color: '#6b7280',
  margin: '0',
  textAlign: 'center' as const,
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '32px 0 24px',
};

const footerSection = {
  textAlign: 'center' as const,
};

const footerText = {
  fontSize: '13px',
  color: '#6b7280',
  lineHeight: '20px',
  margin: '0 0 24px 0',
};

const supportLink = {
  color: '#b45309',
  textDecoration: 'none',
  fontWeight: '600',
};

const legalText = {
  fontSize: '12px',
  color: '#9ca3af',
  lineHeight: '18px',
  margin: '0',
};
