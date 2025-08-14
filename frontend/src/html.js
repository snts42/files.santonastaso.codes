import React from "react"
import PropTypes from "prop-types"

export default function HTML(props) {
  return (
    <html {...props.htmlAttributes}>
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="x-ua-compatible" content="ie=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        
        {/* Default meta tags for social media previews and SEO */}
        <title>Alex Santonastaso - Secure File Sharing</title>
        <meta name="description" content="Secure, private file sharing" />
        <meta name="keywords" content="secure file sharing, private file transfer, temporary links, file upload, download limits, Alex Santonastaso, web developer" />
        <meta name="author" content="Alex Santonastaso" />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large" />
        <meta name="language" content="English" />
        <meta name="theme-color" content="#06b6d4" />
        
        {/* Open Graph meta tags */}
        <meta property="og:title" content="Alex Santonastaso - Secure File Sharing" />
        <meta property="og:description" content="Secure, private file sharing" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://files.santonastaso.codes" />
        <meta property="og:site_name" content="Alex Santonastaso - Secure File Sharing" />
        <meta property="og:locale" content="en_US" />
        
        {/* Twitter Card meta tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Alex Santonastaso - Secure File Sharing" />
        <meta name="twitter:description" content="Secure, private file sharing" />
        
        {/* Additional SEO meta tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Secure File Sharing" />
        <meta name="application-name" content="Secure File Sharing" />
        <meta name="msapplication-TileColor" content="#06b6d4" />
        <meta name="format-detection" content="telephone=no" />
        
        {/* Dark mode script - must run before any rendering */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  
                  // Default to dark mode if no preference set, or if explicitly set to dark
                  if (theme === 'dark' || (!theme && prefersDark) || (!theme && !prefersDark)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {
                  // Fallback to dark mode on any error
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
        {props.headComponents}
      </head>
      <body {...props.bodyAttributes}>
        {props.preBodyComponents}
        <div
          key={`body`}
          id="___gatsby"
          dangerouslySetInnerHTML={{ __html: props.body }}
        />
        {props.postBodyComponents}
      </body>
    </html>
  )
}

HTML.propTypes = {
  htmlAttributes: PropTypes.object,
  headComponents: PropTypes.array,
  bodyAttributes: PropTypes.object,
  preBodyComponents: PropTypes.array,
  body: PropTypes.string,
  postBodyComponents: PropTypes.array,
}
