'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { InterviewContext, ChatMessage } from '@/lib/types';
import RoleFitSidebar from '@/components/RoleFitSidebar';
import ChatPanel from '@/components/ChatPanel';

interface SessionResponse {
  sessionId: string;
  interviewContext: InterviewContext;
  suggestedQuestions: string[];
  chatHistory?: ChatMessage[];
  company?: string;
  position?: string;
}

function InterviewContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('session');

  const [sessionData, setSessionData] = useState<SessionResponse | null>(null);
  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!sessionId) {
      router.push('/');
      return;
    }

    const stored = sessionStorage.getItem('interviewSession');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSessionData(parsed);
        setCompany(parsed.company || '');
        setPosition(parsed.position || '');
        setLoading(false);
        return;
      } catch {
        // fall through to API
      }
    }

    fetch(`/api/session?id=${sessionId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError('Session not found. Please start a new session.');
          return;
        }
        setSessionData({
          sessionId,
          interviewContext: data.interviewContext,
          suggestedQuestions: data.suggestedQuestions,
          chatHistory: data.chatHistory,
        });
        setCompany(data.company || '');
        setPosition(data.position || '');
      })
      .catch(() => {
        setError('Failed to load session.');
      })
      .finally(() => setLoading(false));
  }, [sessionId, router]);

  const handleDeleteSession = async () => {
    if (!sessionId) return;
    if (!confirm('Are you sure you want to delete this session? All data will be cleared.')) return;

    await fetch(`/api/session?id=${sessionId}`, { method: 'DELETE' });
    sessionStorage.removeItem('interviewSession');
    router.push('/');
  };

  const handleExportSession = async () => {
    if (!sessionId) return;
    try {
      const res = await fetch(`/api/session?id=${sessionId}&action=export`);
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `interview-session-${sessionId.slice(0, 8)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('Failed to export session.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <svg className="animate-spin h-10 w-10 text-primary-600 mx-auto mb-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-gray-500">Loading interview session...</p>
        </div>
      </div>
    );
  }

  if (error || !sessionData?.interviewContext) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="card p-8 text-center max-w-md">
          <p className="text-red-600 mb-4">{error || 'Session data unavailable.'}</p>
          <button onClick={() => router.push('/')} className="btn-primary">
            Start New Session
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-200 px-4 py-2.5 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 lg:hidden"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Interview Tailor</h1>
          <span className="text-xs text-gray-400 hidden sm:inline">|</span>
          <span className="text-sm text-gray-500 hidden sm:inline">
            {position} at {company}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleExportSession} className="btn-secondary text-xs px-3 py-1.5" title="Download session data">
            Export
          </button>
          <button onClick={handleDeleteSession} className="btn-danger text-xs px-3 py-1.5" title="Delete session and clear data">
            Delete Session
          </button>
          <button onClick={() => router.push('/')} className="btn-secondary text-xs px-3 py-1.5">
            New Session
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-30 w-80 bg-gray-50 border-r border-gray-200 overflow-y-auto p-4 pt-16 lg:pt-4 transition-transform`}
        >
          {sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-3 right-3 p-1 rounded hover:bg-gray-200 text-gray-400 lg:hidden"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          <RoleFitSidebar
            context={sessionData.interviewContext}
            company={company}
            position={position}
          />
        </aside>

        {/* Overlay for mobile sidebar */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/20 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Chat area */}
        <main className="flex-1 flex flex-col min-w-0">
          <ChatPanel
            sessionId={sessionId!}
            suggestedQuestions={sessionData.suggestedQuestions}
            initialHistory={sessionData.chatHistory || []}
          />
        </main>
      </div>
    </div>
  );
}

export default function InterviewPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <svg className="animate-spin h-10 w-10 text-primary-600 mx-auto mb-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-gray-500">Loading...</p>
          </div>
        </div>
      }
    >
      <InterviewContent />
    </Suspense>
  );
}
