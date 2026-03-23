import * as Separator from "@radix-ui/react-separator";
import { Header } from "../components/Header";

export default function AboutUs() {
  return (
    <>
    <Header />  
    <main className="min-h-screen bg-white text-neutral-900 p-6">
      <section className="mx-auto max-w-4xl px-6 py-20 space-y-16">

        {/* Hero */}
        <header className="space-y-4">
          <h1 className="text-4xl font-semibold tracking-tight">
            About - HICKOKU PERFUME
          </h1>
          <h2 className="text-2xl font-semibold tracking-tight">A Fragrance House Built on Emotion</h2>
          <p className="text-neutral-600 max-w-2xl">
            Hickoku Perfume is a contemporary fragrance brand dedicated to crafting scents that speak to
emotion, memory, and individuality. Each creation is designed to blend seamlessly into everyday
life while still leaving a lasting impression.
          </p>
        </header>

        <Separator.Root className="h-px bg-neutral-200" />

        {/* Our Story */}
        <Section title="Our Story">
          <p>
            Hickoku was born from the belief that fragrance should feel personal, intimate, and emotionally
connected. Rather than following loud trends, Hickoku focuses on subtle luxury, soulful storytelling,
and refined simplicity. Each fragrance is carefully curated to evoke a feeling — comfort, romance,
serenity, confidence, or mystery — allowing the wearer to form a deep emotional bond with their
scent.
          </p>
        </Section>

       

        {/* Values */}
        <Section title="Our Philosophy">
          We believe fragrance is an extension of self. Our creations are designed to sit close to the skin,
evolving gently throughout the day without overpowering the senses. Hickoku fragrances are
crafted to feel natural, expressive, and timeless.
        </Section>


      </section>
    </main>
    </>
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
    <section className="space-y-4 max-w-3xl">
      <h2 className="text-lg font-medium">{title}</h2>
      <div className="text-sm text-neutral-700 leading-6">
        {children}
      </div>
    </section>
  );
}
