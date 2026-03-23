import { Header } from "../components/Header";
import * as Separator from "@radix-ui/react-separator";

export const metadata = {
    title: "Privacy Policy",
    description: "Privacy Policy",
}

export default function PrivacyPolicy() {
    return (
        <>
        <Header />
        <main className="min-h-screen bg-white text-neutral-900 p-6">
            <section className="mx-auto max-w-3xl px-6 py-16">
                <h1 className="text-3xl font-semibold tracking-tight">
                Privacy Policy
                </h1>
                <p className="mt-2 text-xs text-neutral-500">
                Last updated: 15 Feb 2026
                </p>

                <Separator.Root className="my-8 h-px bg-neutral-200" />

                <div className="space-y-10 text-sm leading-6">
                <Section title="Brand Identity & Acceptance">
                    Hickoku operates from Maharashtra, India. By accessing our website or purchasing our products,
you agree to these Terms & Conditions.
                </Section>

                <Section title="Product Nature">
                    Hickoku products are concentrated alcohol-free attar perfume oils. Natural variations in scent or
color may occur. Fragrance perception varies based on individual body chemistry.
                </Section>

                <Section title="Pricing & MRP Compliance">
                    All prices are in INR (n). Products comply with the Legal Metrology (Packaged Commodities)
Rules, 2011. The printed MRP is inclusive of all applicable taxes. No seller is authorized to charge
above MRP.
                </Section>

                <Section title="Orders & Payment">
                    Orders are confirmed only after successful payment. Hickoku reserves the right to cancel orders
due to stock issues, pricing errors, or suspected fraud. Refunds (if applicable) are processed within
5–7 business days.
                </Section>

                <Section title="Shipping & Delivery">
                    Delivery timelines are estimates. Hickoku is not responsible for courier delays. Customers must
provide accurate shipping details.
                </Section>

                <Section title="Returns & Refunds">
                   Due to hygiene and personal use nature, opened products cannot be returned. Damaged or
incorrect items must be reported within 24 hours with proof. Approved refunds/replacements are
processed within 7–10 business days.
                </Section>

                <Section title="Skin Sensitivity Disclaimer">
Attars are highly concentrated oils. Patch test recommended. Discontinue use if irritation occurs.
Hickoku is not responsible for allergic reactions.               
 </Section>

                <Section title="Intellectual Property">
All brand content including logo, product names, packaging, and website material are exclusive
property of Hickoku. Unauthorized use is prohibited.                </Section>

                <Section title="Limitation of Liability">
Liability is limited to the purchase value of the product.
                </Section>
                <Section title="Governing Law">
These Terms are governed by Indian law. Jurisdiction: Maharashtra, India.                </Section>

                <Section title="Contact Us">
                    Hickoku, <br/>
                    Maharashtra, India <br/>
                    Email us at <strong>support@hickoku.com</strong> <br/>
                    Call us at <strong>+91 9360922878</strong>
                </Section>
                </div>
            </section>
        </main>
    </>
    )   
}   
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2">
      <h2 className="text-base font-medium">{title}</h2>
      <p className="text-neutral-700">{children}</p>
    </section>
  );
}