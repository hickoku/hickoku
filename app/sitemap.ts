import { MetadataRoute } from 'next';
import { getAllProductsWithVariants } from './repositories/products.repository';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://hickoku.com';

  // Fetch all products
  let productUrls: MetadataRoute.Sitemap = [];
  try {
    const products = await getAllProductsWithVariants();
    productUrls = products.map((product) => ({
      url: `${baseUrl}/product/${product.slug}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    }));
  } catch (error) {
    console.error('Error fetching products for sitemap:', error);
  }

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    '',
    '/collection',
    '/about-us',
    '/contact-us',
    '/privacy-policy',
    '/tnc',
    '/why-choose-us',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: route === '' ? 1.0 : 0.7,
  }));

  return [...staticRoutes, ...productUrls];
}
