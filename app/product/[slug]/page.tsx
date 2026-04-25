import { Metadata } from 'next';
import { getProductBySlug } from "../../repositories/products.repository";
import ProductDetailClient from "./ProductDetailClient";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  console.log("productproduct",product)
  if (!product) {
    return {
      title: 'Product Not Found',
    };
  }

  // Next.js uses the first valid image or we map them directly for OpenGraph
  const ogImages = product.images?.map((image: any) => ({
    url: image, // Assumes image is absolute URL or relative to domain
    alt: product.name,
  })) || [];

  const productKeywords = [
    product.name,
    `buy ${product.name} online`,
    `${product.category || 'luxury'} perfume`,
    `best ${product.name} fragrance`,
    "Hickoku perfumes"
  ];

  return {
    title: `${product.name} | Hickoku Perfumes`,
    description: product.description,
    keywords: productKeywords,
    alternates: {
      canonical: `/product/${product.slug}`,
    },
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
  console.log("product.variants?.[0]?.characterstics?",product.variants?.[0]?.characterstics)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images || [],
    description: product.description,
    brand: {
      '@type': 'Brand',
      name: 'Hickoku',
    },
    offers: {
      '@type': 'Offer',
      url: `https://hickoku.com/product/${product.slug}`,
      priceCurrency: 'INR',
      price: (product.variants?.[0]?.price || product.basePrice || 0) * 0.5,
      itemCondition: 'https://schema.org/NewCondition',
      availability: product.variants?.some((v: any) => v.stock > 0 || v.inventoryStatus === 'IN_STOCK' || v.inventoryStatus === 'in_stock') 
        ? 'https://schema.org/InStock' 
        : 'https://schema.org/OutOfStock',
    },
    additionalProperty: product.variants?.[0]?.characterstics?.map((char: string) => ({
      "@type": "PropertyValue",
      "name": "Characteristic",
      "value": char
    })) || []
  };

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
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": product.name,
        "item": `https://hickoku.com/product/${product.slug}`
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <ProductDetailClient product={typedProduct} />
    </>
  );
}
