import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

const SITE = 'https://quran-heart-app.lovable.app';

interface SEOProps {
  title: string;
  description: string;
  type?: 'website' | 'article';
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

const SEO: React.FC<SEOProps> = ({ title, description, type = 'website', jsonLd }) => {
  const { pathname } = useLocation();
  const url = `${SITE}${pathname}`;
  const fullTitle = title.length > 60 ? title.slice(0, 57) + '…' : title;
  const desc = description.length > 160 ? description.slice(0, 157) + '…' : description;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
