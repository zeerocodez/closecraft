import { MetadataRoute } from 'next';
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/operator/', '/settings/'],
      },
    ],
    sitemap: 'https://www.closecrafthq.com/sitemap.xml',
  };
}
