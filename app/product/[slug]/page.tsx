import { getProductBySlug } from "../../repositories/products.repository";
import ProductDetailClient from "./ProductDetailClient";
import { notFound } from "next/navigation";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  // Cast product to expected type for the client component
  const typedProduct: any = {
    ...product,
    variants: product.variants.map(v => ({
      ...v,
      // Ensure inventoryStatus is set (default to IN_STOCK if not present)
      inventoryStatus: v.inventoryStatus || (v.stock > 0 ? 'IN_STOCK' : 'OUT_OF_STOCK')
    }))
  };

  return <ProductDetailClient product={typedProduct} />;
}
