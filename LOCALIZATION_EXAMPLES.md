# Localization Implementation Examples

## Real-World Examples from Your Project

### Example 1: Header Component

**File**: `app/components/Header.tsx`

```tsx
"use client";

import { useLocale } from "../context/LocaleContext";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function Header() {
  const { t } = useLocale();

  return (
    <header className="...">
      <nav>
        {/* Using localized navigation labels */}
        <a href="/">{t("navigation.new")}</a>
        <a href="/collection">{t("navigation.forHer")}</a>
        <a href="/collection">{t("navigation.forHim")}</a>
        <a href="/collection">{t("navigation.collections")}</a>

        {/* Language switcher */}
        <LanguageSwitcher />
      </nav>
    </header>
  );
}
```

### Example 2: Cart Component

**File**: `app/components/CartDrawer.tsx`

```tsx
"use client";

import { useLocale } from "../context/LocaleContext";

export function CartDrawer() {
  const { t } = useLocale();
  const [items, setItems] = useState([]);

  return (
    <motion.div>
      {/* Header with localized text */}
      <h2>{t("cart.yourCart")}</h2>

      {/* Empty cart message */}
      {items.length === 0 ? (
        <div>
          <p>{t("cart.emptyCart")}</p>
          <p>{t("cart.addProducts")}</p>
        </div>
      ) : (
        <div>
          {/* Item list */}
          {items.map((item) => (
            <div key={item.id}>
              <p>SKU: {item.sku}</p>
              <p>
                {t("cart.sku")}: {item.sku}
              </p>
            </div>
          ))}

          {/* Total and checkout */}
          <div>
            <span>{t("cart.total")}:</span>
            <span>{item.price}</span>
          </div>
          <button>{t("cart.checkout")}</button>
        </div>
      )}
    </motion.div>
  );
}
```

### Example 3: Hero Section with Dynamic Content

**File**: `app/components/HeroSection.tsx`

```tsx
"use client";

import { useLocale } from "../context/LocaleContext";

// Function to get localized hero content
const getHeroSlides = (t) => [
  {
    id: 1,
    title: t("hero.silkMusk.title"), // "Silk Musk"
    subtitle: t("hero.silkMusk.subtitle"), // "Experience Pure Elegance"
    description: t("hero.silkMusk.description"), // "A delicate blend..."
    image: "...",
  },
  {
    id: 2,
    title: t("hero.midnightAgar.title"),
    subtitle: t("hero.midnightAgar.subtitle"),
    description: t("hero.midnightAgar.description"),
    image: "...",
  },
];

export function HeroSection() {
  const { t } = useLocale();
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = getHeroSlides(t);
  const slide = slides[currentSlide];

  return (
    <section>
      <h2>{slide.title}</h2>
      <p>{slide.subtitle}</p>
      <p>{slide.description}</p>
      <button>{t("hero.shopNow")}</button>
    </section>
  );
}
```

### Example 4: Product Filtering

**File**: `app/components/ProductGrid.tsx`

```tsx
"use client";

import { useLocale } from "../context/LocaleContext";

export function ProductGrid() {
  const { t } = useLocale();
  const [filter, setFilter] = useState("All");

  return (
    <section>
      {/* Localized filter buttons */}
      <div className="filters">
        {["All", "For Her", "For Him"].map((category) => (
          <button key={category} onClick={() => setFilter(category)}>
            {category === "All"
              ? "All"
              : category === "For Her"
                ? t("navigation.forHer")
                : t("navigation.forHim")}
          </button>
        ))}
      </div>

      {/* Products */}
      <div className="grid">
        {products.map((product) => (
          <ProductCard key={product.id} {...product} />
        ))}
      </div>

      {/* Localized call-to-action */}
      <button>{t("products.viewAll")}</button>
    </section>
  );
}
```

### Example 5: Checkout Process

**File**: `app/components/checkout/CheckoutFlow.tsx`

```tsx
"use client";

import { useLocale } from "../../context/LocaleContext";

export function CheckoutFlow() {
  const { t } = useLocale();

  // Localized step labels
  const steps = [
    { id: "address", label: t("checkout.address") },
    { id: "shipping", label: t("checkout.shipping") },
    { id: "payment", label: t("checkout.payment") },
  ];

  return (
    <div>
      {/* Page title */}
      <h1>{t("checkout.title")}</h1>

      {/* Steps */}
      {steps.map((step) => (
        <div key={step.id}>
          <h3>{step.label}</h3>

          {/* Step specific content */}
          {step.id === "payment" && <p>{t("checkout.paymentVerified")}</p>}
        </div>
      ))}

      {/* Buttons */}
      <button>{t("checkout.continueToNextStep")}</button>
      <button>{t("checkout.placeOrder")}</button>
    </div>
  );
}
```

### Example 6: Order Confirmation

**File**: `app/components/checkout/OrderConfirmation.tsx`

```tsx
"use client";

import { useLocale } from "../../context/LocaleContext";

export function OrderConfirmation() {
  const { t } = useLocale();

  return (
    <div>
      {/* Success message */}
      <h1>{t("orderConfirmation.confirmed")}</h1>
      <p>{t("orderConfirmation.thank_you")}</p>
      <p>{t("orderConfirmation.orderReceived")}</p>

      {/* Order details */}
      <div>
        <label>{t("orderConfirmation.orderNumber")}</label>
        <span>#HK123456</span>
      </div>

      <p>{t("orderConfirmation.checkEmail")}</p>

      {/* Status tracking */}
      <div>
        <h3>{t("orderConfirmation.orderStatus")}</h3>
        {/* ... tracking content */}
      </div>

      {/* Continue shopping */}
      <button>{t("orderConfirmation.continueShop")}</button>
    </div>
  );
}
```

### Example 7: Footer with Multiple Sections

**File**: `app/components/Footer.tsx`

```tsx
"use client";

import { useLocale } from "../context/LocaleContext";

export function Footer() {
  const { t } = useLocale();

  return (
    <footer>
      {/* Brand section */}
      <section>
        <h3>{t("footer.brand")}</h3>
        <p>{t("footer.description")}</p>
      </section>

      {/* Shop section */}
      <section>
        <h4>{t("footer.shop")}</h4>
        <ul>
          <li>
            <a href="#">{t("footer.newArrivals")}</a>
          </li>
          <li>
            <a href="#">{t("footer.bestSellers")}</a>
          </li>
          <li>
            <a href="#">{t("navigation.collections")}</a>
          </li>
          <li>
            <a href="#">{t("footer.giftSets")}</a>
          </li>
        </ul>
      </section>

      {/* Support section */}
      <section>
        <h4>{t("footer.support")}</h4>
        <ul>
          <li>
            <a href="#">{t("footer.contactUs")}</a>
          </li>
          <li>
            <a href="#">{t("footer.shippingInfo")}</a>
          </li>
          <li>
            <a href="#">{t("footer.returns")}</a>
          </li>
          <li>
            <a href="#">{t("footer.faq")}</a>
          </li>
        </ul>
      </section>

      {/* Legal section */}
      <section>
        <h4>{t("footer.legal")}</h4>
        <ul>
          <li>
            <a href="#">{t("footer.privacy")}</a>
          </li>
          <li>
            <a href="#">{t("footer.terms")}</a>
          </li>
        </ul>
      </section>
    </footer>
  );
}
```

### Example 8: Language Switcher Component

**File**: `app/components/LanguageSwitcher.tsx`

```tsx
"use client";

import { useLocale } from "../context/LocaleContext";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
  const { locale, setLocale, availableLocales } = useLocale();

  const localeNames = {
    en: "English",
    ar: "العربية",
    fr: "Français",
    es: "Español",
  };

  return (
    <div className="flex items-center gap-2">
      <Globe className="w-4 h-4" />
      <select
        value={locale}
        onChange={(e) => setLocale(e.target.value)}
        className="bg-transparent border rounded px-3 py-1"
      >
        {availableLocales.map((loc) => (
          <option key={loc} value={loc}>
            {localeNames[loc]}
          </option>
        ))}
      </select>
    </div>
  );
}
```

## Advanced Usage Patterns

### Pattern 1: Conditional Translation

```tsx
const { t } = useLocale();

const statusMessages = {
  pending: t("order.pending"),
  shipped: t("order.shipped"),
  delivered: t("order.delivered"),
};

return <p>{statusMessages[orderStatus]}</p>;
```

### Pattern 2: Dynamic Content with Localization

```tsx
const { t } = useLocale();

const products = [
  { id: 1, name: t("productNames.silkMusk"), price: 125 },
  { id: 2, name: t("productNames.zafera"), price: 150 },
];

return products.map((p) => <ProductCard key={p.id} {...p} />);
```

### Pattern 3: Locale-Aware Formatting

```tsx
const { t, locale } = useLocale();

// Format price based on locale
const formatPrice = (price) => {
  if (locale === "ar") return `₹${price}`; // RTL formatting
  return `₹${price}`;
};

return <span>{formatPrice(price)}</span>;
```

### Pattern 4: Getting Current Language Info

```tsx
const { locale, availableLocales, setLocale } = useLocale();

return (
  <div>
    <p>Current: {locale}</p>
    <p>Available: {availableLocales.join(", ")}</p>
    <button onClick={() => setLocale("fr")}>Switch to French</button>
  </div>
);
```

## Translation File Structure

### en.json

```json
{
  "navigation": {
    "new": "New",
    "forHer": "For Her",
    "forHim": "For Him",
    "collections": "Collections",
    "search": "Search..."
  },
  "hero": {
    "silkMusk": {
      "title": "Silk Musk",
      "subtitle": "Experience Pure Elegance",
      "description": "A delicate blend of white florals and soft musk"
    },
    "midnightAgar": {
      "title": "Midnight Agar",
      "subtitle": "Embrace the Mystery",
      "description": "Deep, woody notes with a touch of spice"
    },
    "shopNow": "Shop Now"
  },
  "cart": {
    "yourCart": "Your Cart",
    "emptyCart": "Your cart is empty",
    "addProducts": "Add some products to get started",
    "sku": "SKU",
    "total": "Total",
    "subtotal": "Price",
    "checkout": "Checkout",
    "continueShopping": "Continue Shopping",
    "removeItem": "Remove"
  }
  // ... more sections
}
```

---

## Summary

These examples show real implementations from your project. You can now:

✅ Use `t()` function to access translations
✅ Switch languages with `setLocale()`
✅ Create language-specific UI with `locale`
✅ Build multilingual features with ease

All components follow the same pattern - import `useLocale`, get the `t` function, and use it to replace hardcoded strings!
