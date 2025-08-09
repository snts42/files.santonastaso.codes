/** @type {import('gatsby').GatsbyConfig} */
module.exports = {
  siteMetadata: {
    siteUrl: `https://files.santonastaso.codes`,
    name: 'Alex Santonastaso',
    title: `Secure File Uploader`,
    description: `Powered by code, caffeine, and curiosity`,
    author: `Alex`,
    github: `https://github.com/snts42`,
    linkedin: `https://www.linkedin.com/in/alex-santonastaso/`,
    resume: "https://santonastaso.codes/Alex-Santonastaso-CV.pdf",
    about: `Software Engineer with a background in Computer Science and Big Data Science. Experienced in building automation tools, data pipelines, and machine learning models using Python. I have a good understanding of APIs and cloud services, and I'm quick to learn new technologies on the job. I enjoy solving real world problems through efficient, maintainable code and collaborating to build great products and services.`,
    email: "alex@santonastaso.com",
    phone: "+44 7570 280428",

  },
  plugins: [
    `gatsby-plugin-image`,
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
        query: `
          {
            allSitePage {
              nodes {
                path
              }
            }
          }
        `,
        serialize: ({ path }) => ({
          url: path,
          changefreq: `weekly`,
          priority: path === `/` ? 1.0 : 0.7,
        }),
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
    // TODO: Set up separate GA4 property for files.santonastaso.codes
    // {
    //   resolve: `gatsby-plugin-google-gtag`,
    //   options: {
    //     trackingIds: [
    //       "G-XXXXXXXXX", // New GA4 Measurement ID for file sharing app
    //     ],
    //     pluginConfig: {
    //       head: true,
    //     },
    //   },
    // },
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `Secure File Sharing - Alex Santonastaso`,
        short_name: `Files`,
        description: `Secure, private file sharing with expiring links`,
        start_url: `/`,
        background_color: `#0f151e`,
        theme_color: `#22d3ee`,
        display: `standalone`,
        icon: `src/images/icon.png`,
        icon_options: {
          purpose: `any maskable`,
        },
        categories: [`productivity`, `utilities`, `developer tools`],
        lang: `en`,
        orientation: `portrait`,
        scope: `/`,
        prefer_related_applications: false,
        cache_busting_mode: `query`,
        crossOrigin: `use-credentials`,
        legacy: false,
      },
    },
  ],
};


