import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      disallow: "/"
    },
    sitemap: 'https://www.hickoku.com/sitemap.xml',
    host: 'https://www.hickoku.com',
  };
}
