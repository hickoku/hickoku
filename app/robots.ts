import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/',
        '/checkout/success',
        '/checkout/confirmation',
      ],
    },
    sitemap: 'https://www.hickoku.com/sitemap.xml',
    host: 'https://www.hickoku.com',
  };
}
