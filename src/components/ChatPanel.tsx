'use client';

import { useState, useRef, useEffect } from 'react';
import { ChatMessage as ChatMessageType, ChatControls } from '@/lib/types';
import ChatMessage from './ChatMessage';
import ControlsPanel from './ControlsPanel';
import AudioInput from './AudioInput';
import SuggestedQuestions from './SuggestedQuestions';

interface Props {
  sessionId: string;
  suggestedQuestions: string[];
  initialHistory: ChatMessageType[];
}

export default function ChatPanel({ sessionId, suggestedQuestions, initialHistory }: Props) {
  const [messages, setMessages] = useState<ChatMessageType[]>(initialHistory);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [controls, setControls] = useState<ChatControls>({
    style: 'Standard',
    format: 'Natural',
    tone: 'Confident',
    difficulty: 'Behavioral',
    askClarifyingIfNeeded: true,
  });
  const [showControls, setShowControls] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessageType = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          question: text.trim(),
          controls,
        }),
      });

      const data = await res.json();
      if (data.error) {
        const errorMsg: ChatMessageType = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `Error: ${data.error}`,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, errorMsg]);
      } else {
        setMessages((prev) => [...prev, data.message]);
      }
    } catch {
      const errorMsg: ChatMessageType = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Something went wrong. Please try again.',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleTranscript = (text: string) => {
    setInput((prev) => (prev ? prev + ' ' + text : text));
  };

  return (
    <div className="flex flex-col h-full">
      {/* Controls toggle */}
      <div className="border-b border-gray-200 bg-white px-4 py-2">
        <button
          onClick={() => setShowControls(!showControls)}
          className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
        >
          <svg className={`w-3 h-3 transition-transform ${showControls ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          Answer Controls
        </button>
        {showControls && (
          <div className="mt-2 pb-1">
            <ControlsPanel controls={controls} onChange={setControls} />
          </div>
        )}
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {messages.length === 0 && (
          <div className="space-y-6">
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <p className="text-gray-600 text-sm">
                Ask any interview question or pick one from the suggestions below.
              </p>
              <p className="text-gray-400 text-xs mt-1">
                Answers are tailored to your resume and the job description.
              </p>
            </div>
            <SuggestedQuestions
              questions={suggestedQuestions}
              onSelect={(q) => sendMessage(q)}
              disabled={isLoading}
            />
          </div>
        )}

        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}

        {isLoading && (
          <div className="flex items-end gap-2 mb-4">
            <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-medium flex-shrink-0">
              AI
            </div>
            <div className="px-4 py-3 bg-white border border-gray-200 rounded-2xl rounded-bl-md shadow-sm">
              <div className="flex gap-1">
                <span className="typing-dot w-2 h-2 bg-gray-400 rounded-full"></span>
                <span className="typing-dot w-2 h-2 bg-gray-400 rounded-full"></span>
                <span className="typing-dot w-2 h-2 bg-gray-400 rounded-full"></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-gray-200 bg-white px-4 py-3">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type an interview question or your answer..."
            rows={1}
            className="flex-1 textarea-field min-h-[42px] max-h-[120px] py-2.5 resize-none"
            disabled={isLoading}
          />
          <AudioInput onTranscript={handleTranscript} disabled={isLoading} />
          <button
            onClick={() => sendMessage(input)}
            disabled={isLoading || !input.trim()}
            className="btn-primary px-4 py-2.5"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        <p className="text-[10px] text-gray-400 mt-1.5">
          Press Enter to send, Shift+Enter for new line. Use the mic button for voice input.
        </p>
      </div>
    </div>
  );
}
