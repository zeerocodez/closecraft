const BASE_URL = 'https://www.closecrafthq.com';

/**
 * Returns Schema.org JSON-LD for Organization (CloseCraft)
 */
export function getOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${BASE_URL}/#organization`,
    name: 'CloseCraft',
    legalName: 'CloseCraft Revenue Growth Systems',
    url: BASE_URL,
    logo: `${BASE_URL}/icon.png`,
    image: `${BASE_URL}/images/closecraft-og.png`,
    description: 'AI-Powered Revenue Operating System & Managed Sales Services for high-growth businesses.',
    email: 'info@closecrafthq.com',
    telephone: '+2348000000000',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'NG',
      addressLocality: 'Lagos',
    },
    sameAs: [
      'https://twitter.com/closecrafthq',
      'https://linkedin.com/company/closecraft',
    ],
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: '+2348000000000',
        contactType: 'sales',
        email: 'sales@closecrafthq.com',
        availableLanguage: ['English'],
      },
      {
        '@type': 'ContactPoint',
        telephone: '+2348000000000',
        contactType: 'customer support',
        email: 'info@closecrafthq.com',
        availableLanguage: ['English'],
      },
    ],
  };
}

/**
 * Returns Schema.org JSON-LD for WebSite
 */
export function getWebSiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${BASE_URL}/#website`,
    url: BASE_URL,
    name: 'CloseCraft',
    description: 'AI-powered customer acquisition, appointment setting, and high-ticket sales closing operating system.',
    publisher: {
      '@id': `${BASE_URL}/#organization`,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BASE_URL}/blog?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Returns Schema.org JSON-LD for a commercial Service
 */
export function getServiceJsonLd(service: {
  name: string;
  description: string;
  url: string;
  serviceType: string;
  category?: string;
  areaServed?: string;
  offers?: {
    price: number | string;
    priceCurrency: string;
  };
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.name,
    description: service.description,
    url: service.url.startsWith('http') ? service.url : `${BASE_URL}${service.url}`,
    serviceType: service.serviceType,
    category: service.category || 'Sales & Marketing Operations',
    provider: {
      '@id': `${BASE_URL}/#organization`,
    },
    areaServed: {
      '@type': 'AdministrativeArea',
      name: service.areaServed || 'Global & Nigeria',
    },
    termsOfService: `${BASE_URL}/managed-service-terms`,
    ...(service.offers
      ? {
          offers: {
            '@type': 'Offer',
            price: service.offers.price,
            priceCurrency: service.offers.priceCurrency,
            availability: 'https://schema.org/InStock',
            url: service.url.startsWith('http') ? service.url : `${BASE_URL}${service.url}`,
          },
        }
      : {}),
  };
}

/**
 * Returns Schema.org JSON-LD for Breadcrumbs navigation
 */
export function getBreadcrumbJsonLd(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${BASE_URL}${item.url}`,
    })),
  };
}

/**
 * Returns Schema.org JSON-LD for an Article / Blog Post
 */
export function getArticleJsonLd(article: {
  title: string;
  description: string;
  url: string;
  coverImage?: string | null;
  datePublished: string | Date;
  dateModified?: string | Date;
  authorName?: string;
  authorRole?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': article.url.startsWith('http') ? article.url : `${BASE_URL}${article.url}`,
    },
    headline: article.title,
    description: article.description,
    image: article.coverImage || `${BASE_URL}/images/closecraft-og.png`,
    author: {
      '@type': 'Person',
      name: article.authorName || 'CloseCraft Growth Team',
      jobTitle: article.authorRole || 'Revenue Operations',
    },
    publisher: {
      '@id': `${BASE_URL}/#organization`,
    },
    datePublished: new Date(article.datePublished).toISOString(),
    dateModified: new Date(article.dateModified || article.datePublished).toISOString(),
  };
}

/**
 * Returns Schema.org JSON-LD for FAQPage
 */
export function getFaqJsonLd(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}
