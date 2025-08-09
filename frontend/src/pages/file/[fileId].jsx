import React, { useEffect, useState } from 'react';
import { useStaticQuery, graphql } from 'gatsby';
import axios from 'axios';
import Layout from '../../components/Layout';
import Header from '../../components/Header';
import Button from '../../components/Button';
import Section from '../../components/Section';
import { API_BASE_URL } from '../../utils/api';

const FileRoute = ({ params }) => {
  const { site } = useStaticQuery(graphql`
    query {
      site {
        siteMetadata {
          name
          description
          github
          linkedin
          resume
        }
      }
    }
  `);

  const metadata = site.siteMetadata;

  // Get file_id from the URL parameter
  const file_id = params.fileId;

  const [state, setState] = useState({
    loading: true,
    status: 'loading',
    filename: '',
    download_url: '',
    message: '',
    remaining_downloads: null,
  });

  useEffect(() => {
    if (!file_id) {
      setState({ loading: false, status: 'error', filename: '', download_url: '', message: 'Invalid file ID', remaining_downloads: null });
      return;
    }

    let cancelled = false;
    const load = async () => {
      try {
        const resp = await axios.get(`${API_BASE_URL}/file-info`, { params: { file_id } });
        if (cancelled) return;
        
        setState({
          loading: false,
          status: resp.data.status,
          filename: resp.data.filename,
          download_url: '', // Don't store download URL yet
          message: resp.data.message,
          remaining_downloads: resp.data.remaining_downloads,
        });
      } catch (e) {
        if (cancelled) return;
        console.error('Error fetching file info:', e);
        setState({ loading: false, status: 'error', filename: '', download_url: '', message: 'Unable to fetch file info', remaining_downloads: null });
      }
    };
    load();
    return () => { cancelled = true; };
  }, [file_id]);

  const onDownload = async () => {
    try {
      // Call the download endpoint to increment count and get presigned URL
      const resp = await axios.get(`${API_BASE_URL}/download`, { params: { file_id } });
      
      if (resp.data.status === 'ok' && resp.data.download_url) {
        // Update the remaining downloads count
        setState(prev => ({
          ...prev,
          remaining_downloads: resp.data.remaining_downloads
        }));
        
        // Start the download
        window.location.href = resp.data.download_url;
      } else {
        // Handle error cases (expired, maxed out, etc.)
        setState(prev => ({
          ...prev,
          status: resp.data.status,
          message: resp.data.message,
          remaining_downloads: resp.data.remaining_downloads
        }));
      }
    } catch (e) {
      console.error('Error downloading file:', e);
      setState(prev => ({
        ...prev,
        status: 'error',
        message: 'Download failed. Please try again.'
      }));
    }
  };

  return (
    <Layout>
      <Header metadata={metadata} />
      <div className="block pt-12 md:flex">
        <div className="pb-6 md:w-full md:max-w-150 md:p-0 animate-fade-in-up">
          <h2 className="font-display font-light tracking-widest text-sm text-gray-600 dark:text-gray-300 leading-normal uppercase">
            File Download
          </h2>
        </div>
        <div className="flex-none text-lg text-gray-600 dark:text-gray-300 font-display font-light md:flex-1 md:pl-20">
          {/* Reserve space to prevent layout shift */}
          <div className="min-h-[120px] flex flex-col justify-start">
            {state.loading ? (
              <div className="space-y-6 animate-fade-in-up">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-64"></div>
                <div className="flex items-center gap-3">
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-40"></div>
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-32"></div>
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-fade-in-up">
                {state.filename && (
                  <p className="text-gray-600 dark:text-gray-400">
                    <span className="font-display font-medium text-gray-900 dark:text-gray-100">Filename:</span> {state.filename}
                  </p>
                )}

                {state.status === 'ok' && (
                  <div className="flex items-center gap-3">
                    <Button onClick={onDownload} variant="secondary">Download File</Button>
                    {typeof state.remaining_downloads === 'number' && (
                      <span className="text-sm !text-gray-500 dark:!text-gray-400">
                        Remaining downloads: {state.remaining_downloads}
                      </span>
                    )}
                  </div>
                )}

                {state.status !== 'ok' && (
                  <div className="p-4 rounded-md bg-white/70 dark:bg-[#1f2630]/70 border border-cyan-300/60 cursor-default transform hover:shadow-lg hover:border-cyan-500/80 hover:scale-[1.02]" style={{transition: 'transform 150ms ease-out, box-shadow 150ms ease-out, border-color 150ms ease-out'}}>
                    <p className="text-gray-600 dark:text-gray-400">{state.message || 'Link unavailable.'}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <Section title="About" titleDelay="animate-fade-in-up-delay-100" contentDelay="animate-fade-in-up-delay-200">
        <div className="mb-6 text-gray-700 dark:text-gray-200">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            A secure, minimal, private file-sharing tool built with FastAPI, AWS S3, DynamoDB, and Gatsby. 
            Features include expiring links, download limits, and direct file uploads with LocalStack for development.
          </p>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            This project showcases modern web development practices including cloud infrastructure, 
            API design, and responsive frontend development.
          </p>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            <span className="text-gray-700 dark:text-gray-300">Source code: </span>
            <a
              href="https://github.com/snts42/files.santonastaso.codes"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-900 dark:text-gray-100 hover:!text-cyan-400 transition-colors underline focus:outline-none focus:ring-2 focus:ring-cyan-400"
            >
              GitHub Repository
            </a>
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            <a
              href="/"
              className="text-gray-900 dark:text-gray-100 hover:!text-cyan-400 transition-colors underline focus:outline-none focus:ring-2 focus:ring-cyan-400"
            >
              Upload another file
            </a>
          </p>
        </div>
      </Section>
    </Layout>
  );
};

export default FileRoute;
