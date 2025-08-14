import React from 'react';
import { useSiteMetadata } from '../hooks/useSiteMetadata';

const SEO = ({ title, description, pathname, isFilePage, keywords, image }) => {
  const metadata = useSiteMetadata();

  // Determine the appropriate title and description
  let seoTitle, seoDescription, seoKeywords;
  
  if (isFilePage) {
    seoTitle = "Secure File Download - Alex Santonastaso";
    seoDescription = "Download your secure file. This link expires after use or time limit for your privacy and security.";
    seoKeywords = "secure file download, private file sharing, temporary download link";
  } else if (title) {
    seoTitle = `${title} - Alex Santonastaso`;
    seoDescription = description || "Secure, private file sharing with expiring links and download limits";
    seoKeywords = keywords || metadata.keywords;
  } else {
    seoTitle = metadata.title;
    seoDescription = metadata.description;
    seoKeywords = metadata.keywords;
  }

  const seo = {
    title: seoTitle,
    description: seoDescription,
    keywords: seoKeywords,
    url: `${metadata.siteUrl}${pathname || ``}`,
    image: image || `${metadata.siteUrl}/static/icon.png`,
  };

  // Structured data for the organization
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": metadata.author,
    "url": metadata.siteUrl,
    "sameAs": [
      metadata.github,
      metadata.linkedin,
    ]
  };

  // Structured data for the website
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": metadata.title,
    "url": metadata.siteUrl,
    "description": metadata.description,
    "author": {
      "@type": "Person",
      "name": metadata.author
    }
  };

  // Structured data for software application (if on homepage)
  const softwareSchema = !isFilePage && !pathname ? {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Secure File Sharing",
    "description": "A secure, private file-sharing tool with expiring links and download limits",
    "url": metadata.siteUrl,
    "applicationCategory": "WebApplication",
    "operatingSystem": "Any",
    "author": {
      "@type": "Person",
      "name": metadata.author
    },
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  } : null;

  return (
    <>
      {/* Basic Meta Tags */}
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      <meta name="keywords" content={seo.keywords} />
      <meta name="author" content={metadata.author} />
      <meta name="robots" content="index, follow, max-image-preview:large" />
      <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={seo.url} />
      
      {/* Language and Locale */}
      <html lang="en" />
      <meta name="language" content="English" />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:url" content={seo.url} />
      <meta property="og:site_name" content={metadata.title} />
      <meta property="og:image" content={seo.image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:description" content={seo.description} />
      <meta name="twitter:image" content={seo.image} />
      
      {/* Additional SEO Tags */}
      <meta name="theme-color" content="#06b6d4" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(organizationSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(websiteSchema)}
      </script>
      {softwareSchema && (
        <script type="application/ld+json">
          {JSON.stringify(softwareSchema)}
        </script>
      )}
    </>
  );
};

export default SEO;
