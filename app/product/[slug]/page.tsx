import { Metadata } from 'next';
import { getProductBySlug } from "../../repositories/products.repository";
import ProductDetailClient from "./ProductDetailClient";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: 'Product Not Found',
    };
  }

  // Next.js uses the first valid image or we map them directly for OpenGraph
  const ogImages = product.images?.map(image => ({
    url: image, // Assumes image is absolute URL or relative to domain
    alt: product.name,
  })) || [];

  return {
    title: `${product.name} | Hickoku Perfumes`,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      url: `/product/${product.slug}`,
      images: ogImages,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: product.description,
      images: product.images || [],
    },
  };
}


export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

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
