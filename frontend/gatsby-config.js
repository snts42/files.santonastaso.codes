/** @type {import('gatsby').GatsbyConfig} */
module.exports = {
  siteMetadata: {
    siteUrl: `https://files.santonastaso.codes`,
    name: 'Alex Santonastaso',
    title: `Alex Santonastaso - Secure File Sharing`,
    description: `Secure, private file sharing `,
    author: `Alex Santonastaso`,
    github: `https://github.com/snts42`,
    linkedin: `https://www.linkedin.com/in/alex-santonastaso/`,
    resume: "https://santonastaso.codes/Alex-Santonastaso-CV.pdf",
    repository: `https://github.com/snts42/files.santonastaso.codes`,
    about: `A secure, minimal, private file-sharing tool built with FastAPI, AWS S3, DynamoDB, Terraform, and Gatsby. Features include expiring links, download limits, and direct file uploads with LocalStack for development.

This project showcases modern web development practices including cloud infrastructure, Infrastructure as Code (IaC), API design, and responsive frontend development.`,
    email: "alex@santonastaso.com",
    phone: "+44 7570 280428",
  },
  plugins: [
    `gatsby-plugin-image`,
    `gatsby-plugin-react-helmet`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/images`,
      },
    },
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    `gatsby-plugin-postcss`,
    {
      resolve: `gatsby-plugin-sitemap`,
      options: {
        excludes: [`/404/`, `/404.html`],
      },
    },
    {
      resolve: `gatsby-plugin-robots-txt`,
      options: {
        host: `https://files.santonastaso.codes`,
        sitemap: `https://files.santonastaso.codes/sitemap-index.xml`,
        policy: [
          {
            userAgent: `*`,
            allow: `/`,
            disallow: [`/404/`],
          },
        ],
      },
    },
    // Personal GA4 property for files.santonastaso.codes
    // {
    //   resolve: `gatsby-plugin-google-gtag`,
    //   options: {
    //     trackingIds: [
    //       "G-YOUR-GA4-ID", // Google Analytics 4 property ID
    //     ],
    //     pluginConfig: {
    //       head: false,
    //       respectDNT: true,
    //       exclude: ["/preview/**", "/do-not-track/me/too/"],
    //       delayOnRouteUpdate: 0,
    //     },
    //   },
    // },
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `Secure File Sharing - Alex Santonastaso`,
        short_name: `File Sharing`,
        start_url: `/`,
        background_color: `#ffffff`,
        theme_color: `#06b6d4`,
        display: `minimal-ui`,
        icon: `src/images/icon.png`, // This path is relative to the root of the site.
      },
    },
  ],
}
