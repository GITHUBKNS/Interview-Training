'use client';

import { ChatMessage as ChatMessageType } from '@/lib/types';
import { useState } from 'react';

interface Props {
  message: ChatMessageType;
}

export default function ChatMessage({ message }: Props) {
  const [showWhyThisWorks, setShowWhyThisWorks] = useState(false);
  const isUser = message.role === 'user';

  return (
    <div className={`chat-message-enter flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[85%] ${isUser ? 'order-1' : 'order-1'}`}>
        <div className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${
              isUser ? 'bg-primary-100 text-primary-700' : 'bg-emerald-100 text-emerald-700'
            }`}
          >
            {isUser ? 'You' : 'AI'}
          </div>
          <div
            className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
              isUser
                ? 'bg-primary-600 text-white rounded-br-md'
                : 'bg-white border border-gray-200 text-gray-800 rounded-bl-md shadow-sm'
            }`}
          >
            <div className="whitespace-pre-wrap">{message.content}</div>
          </div>
        </div>

        {!isUser && (message.followUps?.length || message.assumptions || message.whyThisWorks) && (
          <div className="mt-2 ml-9 space-y-2">
            {message.followUps && message.followUps.length > 0 && (
              <div className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3 border border-gray-100">
                <p className="font-medium text-gray-600 mb-1">Possible follow-ups:</p>
                <ul className="space-y-1">
                  {message.followUps.map((f, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-gray-400 mt-0.5">→</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {message.assumptions && (
              <div className="text-xs text-amber-700 bg-amber-50 rounded-lg p-2.5 border border-amber-100">
                <span className="font-medium">Assumptions:</span> {message.assumptions}
              </div>
            )}

            {message.whyThisWorks && (
              <div>
                <button
                  onClick={() => setShowWhyThisWorks(!showWhyThisWorks)}
                  className="text-xs text-primary-600 hover:text-primary-800 underline"
                >
                  {showWhyThisWorks ? 'Hide explanation' : 'Why this works'}
                </button>
                {showWhyThisWorks && (
                  <div className="mt-1 text-xs text-gray-600 bg-primary-50 rounded-lg p-2.5 border border-primary-100">
                    {message.whyThisWorks}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className={`mt-1 text-[10px] text-gray-400 ${isUser ? 'text-right mr-9' : 'ml-9'}`}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
}
