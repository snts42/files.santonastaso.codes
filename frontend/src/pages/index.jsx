import React, { useMemo, useState } from 'react';
import Layout from '../components/Layout';
import Header from '../components/Header';
import Section from '../components/Section';
import SectionContact from '../components/section-contact';
import Button from '../components/Button';
import Seo from '../components/SEO';
import { API_BASE_URL } from '../utils/api';
import { useSiteMetadata } from '../hooks/useSiteMetadata';

const expiryOptions = [
  { label: '1 hour', value: 1 },
  { label: '6 hours', value: 6 },
  { label: '24 hours', value: 24 },
  { label: '72 hours', value: 72 },
];

const downloadOptions = [
  { label: '1 download', value: 1 },
  { label: '2 downloads', value: 2 },
  { label: '3 downloads', value: 3 },
  { label: '4 downloads', value: 4 },
  { label: '5 downloads', value: 5 },
];

export default function IndexPage() {
  const metadata = useSiteMetadata();

  const [file, setFile] = useState(null);
  const [maxDownloads, setMaxDownloads] = useState(1);
  const [expiresInHours, setExpiresInHours] = useState(24);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [shareUrl, setShareUrl] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  const canSubmit = useMemo(() => !!file && maxDownloads >= 1 && maxDownloads <= 5, [file, maxDownloads]);

  const onFileChange = (e) => {
    const f = e.target.files?.[0];
    if (f && validateFile(f)) {
      setFile(f);
    } else if (!f) {
      setFile(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const validateFile = (file) => {
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    const ALLOWED_TYPES = [
      'image/', 'text/', 'application/pdf', 'application/zip', 
      'application/json', 'application/msword', 'application/vnd.openxmlformats',
      'video/', 'audio/'
    ];

    if (file.size > MAX_FILE_SIZE) {
      setError('File size must be under 5MB');
      return false;
    }

    if (!ALLOWED_TYPES.some(type => file.type.startsWith(type))) {
      setError('File type not allowed. Supported: images, documents, videos, audio, text files');
      return false;
    }

    setError('');
    return true;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      const f = droppedFiles[0];
      if (validateFile(f)) {
        setFile(f);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;
    
    // Double-check file validation before submitting
    if (!validateFile(file)) {
      return;
    }
    
    setSubmitting(true);
    setError('');
    setShareUrl('');

    try {
      // Step 1: Get presigned upload URL
      const initResp = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: file.name,
          max_downloads: maxDownloads,
          expires_in_hours: expiresInHours,
        }),
      });

      if (!initResp.ok) {
        const errorText = await initResp.text();
        throw new Error(`Upload failed: ${initResp.status} - ${errorText}`);
      }

      const initResult = await initResp.json();
      
      // Step 2: Upload file directly to S3 using presigned URL
      const uploadResp = await fetch(initResult.upload_url, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadResp.ok) {
        throw new Error(`S3 upload failed: ${uploadResp.status}`);
      }

      setShareUrl(initResult.download_page_url);
      // Clear the file to prevent multiple uploads of the same file
      setFile(null);
    } catch (err) {
      console.error('Upload error:', err);
      setError(`Upload failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };



  return (
    <Layout>
      <Header metadata={metadata} />
      <Section title="File Upload" contentDelay="animate-fade-in-up-delay-100">
        <div className="space-y-6">
          <p className="text-gray-600 dark:text-gray-400">Upload a file (max 5MB) and get a private, expiring link with limited downloads.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block">
                <div 
                  className={`
                    relative min-h-[120px] border-2 border-dashed rounded-lg transition-all duration-300
                    ${isDragOver 
                      ? 'border-cyan-400 bg-cyan-50/50 dark:bg-cyan-900/20' 
                      : 'border-gray-300 dark:border-gray-600 hover:border-cyan-400 dark:hover:border-cyan-400'
                    }
                    ${file ? 'bg-cyan-50 dark:bg-cyan-900/20 border-cyan-400 dark:border-cyan-400' : ''}
                  `}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  role="button"
                  tabIndex={0}
                  aria-label="Click to select a file or drag and drop a file here"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      document.querySelector('input[type="file"]').click();
                    }
                  }}
                >
                  <input 
                    type="file" 
                    onChange={onFileChange} 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                  />
                  <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                    {file ? (
                      <>
                        <div className="text-cyan-500 mb-3 animate-float">
                          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <p className="text-sm font-display font-medium text-gray-700 dark:text-gray-200">{file.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <button 
                          type="button" 
                          onClick={() => setFile(null)}
                          className="text-xs text-red-600 dark:text-red-400 hover:underline hover:text-red-500 transition-colors mt-2"
                        >
                          Remove file
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="mb-3 text-gray-400">
                          {isDragOver ? (
                            <svg className="w-12 h-12 mx-auto text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v12m0 0l-4-4m4 4l4-4" />
                            </svg>
                          ) : (
                            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                          )}
                        </div>
                        <p className="text-sm font-display font-medium text-gray-700 dark:text-gray-200 mb-1">
                          {isDragOver ? 'Drop your file here' : 'Drag & drop a file here'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          or click to browse (max 5MB)
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="block">
                <span className="block mb-1 text-sm font-display font-medium text-gray-700 dark:text-gray-300">Max downloads</span>
                <select
                  className="w-full h-10 px-3 py-2 rounded-md border border-cyan-400 bg-white/80 dark:bg-[#1f2630]/80 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 shadow-sm hover:shadow-md hover:border-cyan-500 hover:scale-[1.02] transition-all duration-150"
                  value={maxDownloads}
                  onChange={(e) => setMaxDownloads(Number(e.target.value))}
                >
                  {downloadOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="block mb-1 text-sm font-display font-medium text-gray-700 dark:text-gray-300">Expiry</span>
                <select
                  className="w-full h-10 px-3 py-2 rounded-md border border-cyan-400 bg-white/80 dark:bg-[#1f2630]/80 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 shadow-sm hover:shadow-md hover:border-cyan-500 hover:scale-[1.02] transition-all duration-150"
                  value={expiresInHours}
                  onChange={(e) => setExpiresInHours(Number(e.target.value))}
                >
                  {expiryOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="flex items-center gap-3">
              <Button 
                type="submit" 
                disabled={!canSubmit} 
                loading={submitting}
                variant="secondary"
              >
                {submitting ? 'Uploading…' : 'Generate Link'}
              </Button>
              {error && (
                <div className="animate-fade-in-up">
                  <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-md border border-red-200 dark:border-red-800">
                    <span className="text-red-500">[WARNING]</span>
                    <span>{error}</span>
                  </div>
                </div>
              )}
            </div>
          </form>
          
          {!shareUrl && (
            <div className="mb-8 md:mb-12"></div>
          )}

          {shareUrl && (
            <div className="animate-fade-in-up mt-6 mb-8 md:mb-12 p-4 rounded-lg bg-white/80 dark:bg-[#1f2630]/80 border border-cyan-400/60 shadow-md cursor-default transform hover:shadow-md hover:border-cyan-500 hover:scale-[1.02] transition-all duration-150">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl text-cyan-500 animate-pulse-scale">[OK]</span>
                <p className="font-display font-medium text-gray-800 dark:text-gray-200">Link generated successfully</p>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Share this private download link:</p>
              <div className="flex items-center gap-3">
                <input 
                  className="flex-1 px-3 py-2 rounded-md border border-cyan-400/60 bg-white/90 dark:bg-[#0f151e]/80 text-gray-900 dark:text-gray-100 text-sm font-mono" 
                  value={shareUrl} 
                  readOnly 
                  onClick={(e) => e.target.select()}
                />
                <Button 
                  type="button" 
                  onClick={() => {
                    navigator.clipboard.writeText(shareUrl);
                  }} 
                  variant="secondary"
                  className="shrink-0 hover:shadow-cyan-200 dark:hover:shadow-cyan-500/30"
                >
                  Copy
                </Button>
              </div>
            </div>
          )}
        </div>
      </Section>

      <Section title="About" titleDelay="animate-fade-in-up-delay-200" contentDelay="animate-fade-in-up-delay-300">
        <div className="mb-6 text-gray-700 dark:text-gray-200">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {metadata.about ? metadata.about.split('\n\n')[0] : 'A secure file sharing application with temporary links.'}
          </p>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {metadata.about ? metadata.about.split('\n\n')[1] || '' : 'Built with modern web technologies.'}
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            <span className="text-gray-700 dark:text-gray-300">Source code: </span>
            <a
              href={metadata.repository || metadata.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-900 dark:text-gray-100 hover:!text-cyan-400 transition-colors underline focus:outline-none focus:ring-2 focus:ring-cyan-400"
            >
              GitHub Repository
            </a>
          </p>
        </div>
      </Section>

      <SectionContact email={metadata.email} phone={metadata.phone} />
    </Layout>
  );
}

export function Head() {
  return (
    <Seo 
      title="Secure File Sharing"
      description="Upload and share files securely with expiring links and download limits. Built by Alex Santonastaso with modern web technologies."
      keywords="secure file sharing, private file transfer, temporary download links, file upload, Alex Santonastaso"
      pathname="/"
    />
  );
}

