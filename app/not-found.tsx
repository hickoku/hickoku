import { getAllProductsWithVariants } from "./repositories/products.repository";
import { NotFoundClient } from "./components/NotFoundClient";

export default async function NotFound() {
  const rawProducts = await getAllProductsWithVariants();
  
  // Filter and map products for suggestions
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
    }))
    .sort(() => Math.random() - 0.5) // Shuffle for variety
    .slice(0, 4); // Suggest 4 products

  return <NotFoundClient suggestedProducts={products} />;
}
