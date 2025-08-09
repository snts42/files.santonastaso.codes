import React from 'react';
import { useStaticQuery, graphql } from 'gatsby';
import Layout from '../components/Layout';
import Header from '../components/Header';
import Section from '../components/Section';

export default function NotFoundPage() {
  const { site } = useStaticQuery(graphql`
    query {
      site {
        siteMetadata {
          name
          description
          github
          linkedin
          resume
          email
          phone
        }
      }
    }
  `);

  const metadata = site.siteMetadata;

  return (
    <Layout>
      <Header metadata={metadata} />
      <Section title="Page Not Found" contentDelay="animate-fade-in-up-delay-100">
        <div>
          <p className="text-lg font-display font-light mb-8 text-gray-600 dark:text-gray-400">
            You may have followed an invalid link or the file may have expired.
          </p>
          <a 
            href="/"
            className="inline-block text-gray-900 dark:text-gray-100 hover:!text-cyan-400 transition-colors underline focus:outline-none focus:ring-2 focus:ring-cyan-400 font-display font-medium"
          >
            Upload a file
          </a>
        </div>
      </Section>
    </Layout>
  );
}


