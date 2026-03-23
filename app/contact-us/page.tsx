import * as Separator from "@radix-ui/react-separator";
import { Header } from "../components/Header";

export default function ContactUs() {
  return (
    <main className="min-h-screen bg-white text-neutral-900">
      <Header />
      <section className="mx-auto max-w-4xl px-6 py-20 space-y-16">
        {/* Hero */}
        <header className="space-y-4 max-w-2xl">
          <h1 className="text-4xl font-semibold tracking-tight">Contact Us</h1>
          <p className="text-neutral-600">
            Have a question or need help? Reach out and we’ll get back to you as
            soon as possible.
          </p>
        </header>

        <Separator.Root className="h-px bg-neutral-200" />

        {/* Email */}
        <Section title="Email">
          <p>
            You can contact us at <strong>support@yourdomain.com</strong>
          </p>
          <p className="text-xs text-neutral-500">
            We usually respond within 24 business hours.
          </p>
        </Section>

        {/* Business Hours */}
        <Section title="Business Hours">
          <p>Monday – Friday</p>
          <p>10:00 AM – 6:00 PM (IST)</p>
        </Section>

        {/* Location */}
        <Section title="Location">
          <p>We operate remotely with distributed teams across India.</p>
        </Section>

        {/* Support Scope */}
        <Section title="Support Scope">
          <ul className="list-disc list-inside space-y-2">
            <li>Account and access issues</li>
            <li>Technical support</li>
            <li>Billing and invoices</li>
            <li>Privacy and security questions</li>
          </ul>
        </Section>
      </section>
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3 max-w-3xl">
      <h2 className="text-lg font-medium">{title}</h2>
      <div className="text-sm text-neutral-700 leading-6">{children}</div>
    </section>
  );
}
