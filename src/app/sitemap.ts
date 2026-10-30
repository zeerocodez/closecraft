import { MetadataRoute } from 'next';
 
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.closecrafthq.com';
  const lastModified = new Date();

  const routes = [
    '',
    '/solutions',
    '/revenue-engine',
    '/platform',
    '/pricing',
    '/privacy',
    '/terms',
    '/refund-policy',
    '/cookies',
    '/managed-service-terms',
    '/privacy/request',
    '/dss',
    '/dss/affiliate',
    '/dss/clinic',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified,
    changeFrequency: 'weekly',
    priority: route === '' ? 1.0 : route.startsWith('/dss') ? 0.9 : 0.8,
  }));
}
