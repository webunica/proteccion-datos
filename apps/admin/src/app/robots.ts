import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://proteccion-datos.webunica.cl';

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/auth/login', '/verify/'],
        disallow: ['/dashboard/', '/api/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
