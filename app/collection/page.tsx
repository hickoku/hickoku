import { Metadata } from 'next';
import { getAllProductsWithVariants } from "../repositories/products.repository";

export const metadata: Metadata = {
  title: "All Collections | Hickoku Perfumes",
  description: "Browse our complete collection of premium original fragrances.",
  keywords: ["perfume collection", "shop all perfumes", "best fragrance brands", "Hickoku collection"],
  alternates: {
    canonical: '/collection',
  },
  openGraph: {
    title: "All Collections | Hickoku Perfumes",
    description: "Browse our complete collection of premium original fragrances.",
    url: "/collection",
  },
};

import { CollectionClient } from "./CollectionClient";

export default async function CollectionPage() {
  // Fetch products server-side for SEO
  const rawProducts = await getAllProductsWithVariants();
  
  // Map raw data to the format expected by the frontend components
  const products = rawProducts
    .filter(p => (p.status as any) !== false && Array.isArray(p.variants) && p.variants.some(v => (v.status as any) !== false))
    .map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      highlight: p.highlight,
      category: p.category,
      badge: p.badge,
      price: String(p.basePrice || p.variants?.find(v => (v.status as any) !== false)?.price || 0),
      image: p.images?.[0] || "",
      slug: p.slug,
      defaultVariantId: p.variants?.find(v => (v.status as any) !== false)?.id || `${p.id}01`,
      defaultSku: p.variants?.find(v => (v.status as any) !== false)?.sku || `HICK-${p.id}`,
    }));

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://hickoku.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Collection",
        "item": "https://hickoku.com/collection"
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <CollectionClient initialProducts={products} />
    </>
  );
}
