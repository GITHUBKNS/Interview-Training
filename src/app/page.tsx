'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { SAMPLE_RESUME, SAMPLE_JD, SAMPLE_COMPANY, SAMPLE_POSITION } from '@/lib/sample-data';

export default function SetupPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');
  const [postingUrl, setPostingUrl] = useState('');
  const [jdText, setJdText] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingUrl, setFetchingUrl] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [error, setError] = useState('');
  const [urlMessage, setUrlMessage] = useState('');

  const handleFetchUrl = async () => {
    if (!postingUrl.trim()) return;
    setFetchingUrl(true);
    setUrlMessage('');
    try {
      const res = await fetch('/api/fetch-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: postingUrl }),
      });
      const data = await res.json();
      if (data.text) {
        setJdText((prev) => (prev ? prev + '\n\n--- From URL ---\n\n' + data.text : data.text));
        setUrlMessage('Content fetched successfully!');
      } else {
        setUrlMessage(data.error || 'Could not fetch content. Please paste the text manually.');
      }
    } catch {
      setUrlMessage('Failed to fetch URL. Please paste the job posting text manually.');
    } finally {
      setFetchingUrl(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFile(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.text) {
        setResumeText(data.text);
      } else {
        setError(data.error || 'Failed to parse file.');
      }
    } catch {
      setError('Failed to upload file.');
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!company.trim() || !position.trim()) {
      setError('Company and position are required.');
      return;
    }
    if (!resumeText.trim() || resumeText.trim().length < 50) {
      setError('Please provide your resume text (at least 50 characters).');
      return;
    }
    if (!jdText.trim() || jdText.trim().length < 50) {
      setError('Please provide the job description (at least 50 characters).');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company: company.trim(),
          position: position.trim(),
          resumeText: resumeText.trim(),
          jdText: jdText.trim(),
          postingText: null,
          postingUrl: postingUrl.trim() || null,
        }),
      });

      const data = await res.json();
      if (data.error) {
        setError(data.error);
        return;
      }

      sessionStorage.setItem('interviewSession', JSON.stringify(data));
      router.push(`/interview?session=${data.sessionId}`);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadSample = () => {
    setCompany(SAMPLE_COMPANY);
    setPosition(SAMPLE_POSITION);
    setResumeText(SAMPLE_RESUME);
    setJdText(SAMPLE_JD);
  };

  const handleReset = () => {
    setCompany('');
    setPosition('');
    setPostingUrl('');
    setJdText('');
    setResumeText('');
    setError('');
    setUrlMessage('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-blue-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Interview Tailor
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Prepare for your next interview with AI-powered, tailored answers based on your resume and the job description. No fabricated experiences, no generic responses.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-bold">1</span>
              Company & Position
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="company" className="label">Company Name *</label>
                <input
                  id="company"
                  type="text"
                  className="input-field"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g., Google, Stripe, Acme Corp"
                  required
                />
              </div>
              <div>
                <label htmlFor="position" className="label">Position Title *</label>
                <input
                  id="position"
                  type="text"
                  className="input-field"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="e.g., Senior Software Engineer"
                  required
                />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-bold">2</span>
              Job Posting (Optional URL)
            </h2>
            <div className="flex gap-3">
              <input
                type="url"
                className="input-field flex-1"
                value={postingUrl}
                onChange={(e) => setPostingUrl(e.target.value)}
                placeholder="https://careers.example.com/job/123"
              />
              <button
                type="button"
                onClick={handleFetchUrl}
                disabled={fetchingUrl || !postingUrl.trim()}
                className="btn-secondary whitespace-nowrap"
              >
                {fetchingUrl ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                    Fetching...
                  </span>
                ) : 'Fetch Content'}
              </button>
            </div>
            {urlMessage && (
              <p className={`mt-2 text-sm ${urlMessage.includes('success') ? 'text-green-600' : 'text-amber-600'}`}>
                {urlMessage}
              </p>
            )}
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-bold">3</span>
              Job Description *
            </h2>
            <textarea
              className="textarea-field min-h-[200px]"
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              placeholder="Paste the full job description here. Include responsibilities, requirements, qualifications, tech stack, etc."
              required
            />
            <p className="mt-1 text-xs text-gray-500">{jdText.length} characters</p>
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-bold">4</span>
              Your Resume *
            </h2>
            <div className="mb-4">
              <label className="label">Upload Resume (PDF, DOCX, or TXT)</label>
              <div className="flex items-center gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={handleFileUpload}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 cursor-pointer"
                />
                {uploadingFile && (
                  <svg className="animate-spin h-5 w-5 text-primary-600" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
              </div>
            </div>
            <div>
              <label className="label">Or paste resume text</label>
              <textarea
                className="textarea-field min-h-[200px]"
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste your full resume text here. Include experience, skills, education, projects, certifications..."
                required
              />
              <p className="mt-1 text-xs text-gray-500">{resumeText.length} characters</p>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex flex-wrap gap-3 justify-between items-center">
            <div className="flex gap-3">
              <button type="submit" disabled={loading} className="btn-primary text-base px-8 py-3">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                    Analyzing...
                  </span>
                ) : 'Analyze & Start Interview'}
              </button>
              <button type="button" onClick={handleReset} className="btn-secondary">
                Reset
              </button>
            </div>
            <button type="button" onClick={handleLoadSample} className="text-sm text-primary-600 hover:text-primary-800 underline">
              Load sample data
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
