import { getAllProductsWithVariants } from "../repositories/products.repository";
import { CollectionClient } from "./CollectionClient";

export default async function CollectionPage() {
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

  return <CollectionClient initialProducts={products} />;
}
