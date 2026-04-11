import { getProductWithVariant } from "../../repositories/products.repository";
import ProductDetailClient from "./ProductDetailClient";
import { notFound } from "next/navigation";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProductWithVariant(id);

  if (!product) {
    notFound();
  }

  // Map product to expected type for the client component
  const typedProduct: any = {
    ...product,
    variants: product.variants.map(v => ({
      ...v,
      inventoryStatus: v.inventoryStatus || (v.stock > 0 ? 'IN_STOCK' : 'OUT_OF_STOCK')
    }))
  };

  return <ProductDetailClient product={typedProduct} />;
}
