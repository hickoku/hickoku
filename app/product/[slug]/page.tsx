import { Metadata } from 'next';
import { getProductBySlug, getAllProductsWithVariants } from "../../repositories/products.repository";
import { getApprovedReviewsByProduct } from "../../models/review-dynamo";
import ProductDetailClient from "./ProductDetailClient";
import { notFound } from "next/navigation";
import { getPDPFaqs } from "./pdpData";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) {
    return { title: 'Product Not Found' };
  }

  const ogImages = product.images?.map((image: any) => ({
    url: image,
    alt: product.name,
  })) || [];

  const productKeywords = [
    product.name,
    `buy ${product.name} online`,
    `${product.category || 'luxury'} perfume`,
    `best ${product.name} fragrance`,
    "best perfume for men",
    "best perfume for women",
    "luxury scents",
    "Hickoku perfumes"
  ];

  return {
    title: `${product.name} - Hickoku | Perfume & Attar`,
    description: product.description,
    keywords: productKeywords,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      title: `${product.name} - Hickoku | Perfume & Attar`,
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

  // Fetch product, related products (with full variant data), and approved reviews in parallel
  const [product, allProducts, reviews] = await Promise.all([
    getProductBySlug(slug),
    getAllProductsWithVariants(),
    getProductBySlug(slug).then(p => p ? getApprovedReviewsByProduct(p.id) : []),
  ]);

  if (!product) notFound();

  const typedProduct: any = {
    ...product,
    variants: product.variants.map((v: any) => ({
      ...v,
      inventoryStatus: v.inventoryStatus || (v.stock > 0 ? 'IN_STOCK' : 'OUT_OF_STOCK'),
    })),
  };

  // Filter out the current product from related products
  const relatedProducts = allProducts
    .filter((p: any) => p.id !== product.id)
    .slice(0, 3); // Limit to 12 for performance

  const sortedReviews = [...reviews].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const avgRating = reviews.length > 0 
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
    : 0;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.hickoku.com';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images || [],
    description: product.description,
    brand: { '@type': 'Brand', name: 'Hickoku' },
    offers: {
      '@type': 'Offer',
      url: `${baseUrl}/product/${product.slug}`,
      priceCurrency: 'INR',
      price: (product.variants?.[0]?.price || product.basePrice || 0) * 0.5,
      itemCondition: 'https://schema.org/NewCondition',
      availability: product.variants?.some((v: any) => v.stock > 0 || v.inventoryStatus === 'IN_STOCK' || v.inventoryStatus === 'in_stock')
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      shippingDetails: {
        "@type": "OfferShippingDetails",
        "shippingRate": {
          "@type": "MonetaryAmount",
          "value": 0,
          "currency": "INR"
        },
        "shippingDestination": {
          "@type": "DefinedRegion",
          "addressCountry": "IN"
        },
        "deliveryTime": {
          "@type": "ShippingDeliveryTime",
          "handlingTime": {
            "@type": "QuantitativeValue",
            "minValue": 1,
            "maxValue": 2,
            "unitCode": "d"
          },
          "transitTime": {
            "@type": "QuantitativeValue",
            "minValue": 3,
            "maxValue": 5,
            "unitCode": "d"
          }
        }
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        "applicableCountry": "IN",
        "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
        "merchantReturnDays": 7,
        "returnMethod": "https://schema.org/ReturnByMail",
        "returnFees": "https://schema.org/FreeReturn",
        "url": `${baseUrl}/return-policy`
      }
    },
    ...(avgRating > 3 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: avgRating.toFixed(1),
        reviewCount: reviews.length,
      },
    }),
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": `${baseUrl}` },
      { "@type": "ListItem", "position": 2, "name": "Collection", "item": `${baseUrl}/collection` },
      { "@type": "ListItem", "position": 3, "name": product.name, "item": `${baseUrl}/product/${product.slug}` },
    ],
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": getPDPFaqs(product.name).map(faq => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.a
      }
    }))
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <ProductDetailClient
        product={typedProduct}
        relatedProducts={relatedProducts}
        initialReviews={sortedReviews}
      />
    </>
  );
}
