import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/dashboard/',
          '/recovery/',
          '/commitments/',
          '/leads/',
          '/appointments/',
          '/operator/',
          '/settings/',
          '/today',
          '/inbox',
          '/pipeline',
          '/billing',
          '/team',
          '/practice',
          '/rep',
          '/onboarding/',
        ],
      },
    ],
    sitemap: 'https://www.closecrafthq.com/sitemap.xml',
  };
}
