"use client";

import { useState } from "react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { Accordion } from "../components/Accordion";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  {
    category: "Top Queries",
    questions: [
      {
        q: "How long will it take for my order to arrive?",
        a: "Most orders are processed within 24-48 hours. Standard shipping typically takes 3-7 business days depending on your location."
      },
      {
        q: "What is your return policy?",
        a: "We offer a 7-day return policy for unused and unopened products in their original packaging. Please check our Return Policy page for detailed eligibility criteria."
      },
      {
        q: "How can I track my order?",
        a: "Once your order runs through our fulfillment center, you will receive an email with tracking details. You can also enter your Order ID or AWB in the 'Track Order' section located in our website footer."
      }
    ]
  },
  {
    category: "Shipping & Delivery",
    questions: [
      {
        q: "Do you ship internationally?",
        a: "Currently, we only ship across India. We are working on expanding our logistics to serve our international customers soon."
      },
      {
        q: "How are shipping charges calculated?",
        a: "Shipping is dynamically calculated based on your pin code at checkout. Sometimes we run promotional free-shipping events!"
      },
      {
        q: "What do I do if my package is delayed?",
        a: "If your tracking shows no movement for a few days, please reach out to us via the Contact Us page and we will escalate it with our logistics partner."
      }
    ]
  },
  {
    category: "Returns and Exchange",
    questions: [
      {
        q: "How do I initiate a return?",
        a: "Please reach out to us via our Contact Us page with your Order ID and reason for return. Our support team will guide you through the seamless process."
      },
      {
        q: "I received a damaged bottle. What should I do?",
        a: "We deeply apologize! Please contact us within 48 hours of delivery with photographic evidence. We will arrange a replacement immediately."
      },
      {
        q: "Refund Process and Timeline",
        a: "Once your return is verified at our warehouse, the refund will be credited to your original payment source within 5-7 business days."
      }
    ]
  },
  {
    category: "Products & Quality",
    questions: [
      {
        q: "Are your perfumes long-lasting?",
        a: "Absolutely! Our perfumes and attars are specially formulated with premium ingredients and high oil concentrations, ensuring they last incredibly long on your skin and clothes."
      },
      {
        q: "Are Hickoku fragrances alcohol-free?",
        a: "We have specific lines that are pure concentrated attars (alcohol-free). Please refer to individual product descriptions and notes on the product pages for exact formulations."
      },
      {
        q: "Are the products cruelty-free?",
        a: "Yes, we are 100% cruelty-free and do not test on animals."
      }
    ]
  },
  {
    category: "Payments",
    questions: [
      {
        q: "What payment methods do you accept?",
        a: "We accept all major UPIs, Credit/Debit cards, Net Banking, and Wallets through our Razorpay secure gateway."
      },
      {
        q: "Do you offer Cash on Delivery (COD)?",
        a: "No, currently we are not offering COD. In future we will allow this meanwhile you can also place orders directly via WhatsApp Number: 9360922878."
      }
    ]
  }
];

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState(faqs[0].category);

  const activeData = faqs.find((group) => group.category === activeCategory) || faqs[0];

  return (
    <div className="min-h-screen flex flex-col bg-[#F9F9F9] text-gray-900">
      <Header />
      
      <main className="flex-grow max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 w-full">
        {/* Title */}
        <div className="mb-12 border-b border-gray-200 pb-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
            Hickoku Help Center
          </h1>
          <p className="text-gray-500 mt-2 text-sm">
            Find answers to all your questions below, or reach out to us directly.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-0 md:gap-12 lg:gap-20 relative items-start">
          
          {/* Sidebar */}
          <aside className="w-full md:w-64 shrink-0 overflow-x-auto md:overflow-visible pb-4 md:pb-0 font-sans tracking-wide border-b md:border-b-0 border-gray-200 mb-8 md:mb-0 md:sticky md:top-32">
            <ul className="flex md:flex-col gap-2 md:gap-1 text-[15px] font-medium whitespace-nowrap md:whitespace-normal">
              {faqs.map((group) => (
                <li key={group.category}>
                  <button
                    onClick={() => setActiveCategory(group.category)}
                    className={`text-left w-full px-4 py-3 md:py-2.5 transition-all outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-sm md:rounded-none relative ${
                      activeCategory === group.category
                        ? "text-amber-700 bg-amber-50/50 md:bg-transparent font-bold"
                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-50 md:hover:bg-transparent"
                    }`}
                  >
                    {/* Active Indicator Line (Myntra Style - Left border) */}
                    {activeCategory === group.category && (
                      <motion.div 
                        layoutId="active-indicator"
                        className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500 hidden md:block" 
                        initial={false}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    {/* Active Indicator Line Mobile (Bottom border) */}
                    {activeCategory === group.category && (
                      <div className="absolute left-0 right-0 bottom-0 h-0.5 bg-amber-500 block md:hidden" />
                    )}
                    
                    <span className="md:pl-2">{group.category}</span>
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          {/* Right Content Area */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
              >
                <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-6 font-serif">
                  {activeCategory}
                </h2>
                
                <div className="space-y-4">
                  {activeData.questions.map((faq, fIdx) => (
                    <Accordion key={fIdx} title={faq.q} content={faq.a} />
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
          
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
