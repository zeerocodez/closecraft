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
