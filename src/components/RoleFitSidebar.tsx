'use client';

import { InterviewContext } from '@/lib/types';
import { useState } from 'react';

interface Props {
  context: InterviewContext;
  company: string;
  position: string;
}

export default function RoleFitSidebar({ context, company, position }: Props) {
  const [expandedSection, setExpandedSection] = useState<string | null>('skills');

  const toggle = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const { candidateProfile, roleProfile, matchAnalysis, storyBank } = context;

  return (
    <div className="space-y-3 text-sm">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-gray-900">{position}</h2>
        <p className="text-gray-500">{company}</p>
      </div>

      <p className="text-gray-700 text-xs leading-relaxed border-l-2 border-primary-300 pl-3">
        {candidateProfile.headlineSummary}
      </p>

      {/* Skills Match */}
      <div className="card overflow-hidden">
        <button
          onClick={() => toggle('skills')}
          className="w-full px-4 py-3 text-left font-medium text-gray-900 flex justify-between items-center hover:bg-gray-50"
        >
          Skills Match
          <ChevronIcon open={expandedSection === 'skills'} />
        </button>
        {expandedSection === 'skills' && (
          <div className="px-4 pb-3 space-y-2">
            <div>
              <p className="text-xs font-medium text-green-700 mb-1">Strong Overlaps</p>
              {matchAnalysis.strongestOverlaps.map((o, i) => (
                <div key={i} className="text-xs text-gray-600 mb-1">
                  <span className="font-medium text-green-800">{o.skill}</span>
                  <span className="text-gray-400"> — {o.evidence}</span>
                </div>
              ))}
            </div>
            {matchAnalysis.gapsRisks.length > 0 && (
              <div>
                <p className="text-xs font-medium text-amber-700 mb-1">Gaps & Mitigations</p>
                {matchAnalysis.gapsRisks.map((g, i) => (
                  <div key={i} className="text-xs text-gray-600 mb-1">
                    <span className="font-medium text-amber-800">{g.gap}</span>
                    <span className="text-gray-400"> — {g.mitigation}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ATS Keywords */}
      <div className="card overflow-hidden">
        <button
          onClick={() => toggle('keywords')}
          className="w-full px-4 py-3 text-left font-medium text-gray-900 flex justify-between items-center hover:bg-gray-50"
        >
          ATS Keywords
          <ChevronIcon open={expandedSection === 'keywords'} />
        </button>
        {expandedSection === 'keywords' && (
          <div className="px-4 pb-3">
            <div className="flex flex-wrap gap-1.5">
              {matchAnalysis.keywordMap.map((kw, i) => (
                <span key={i} className="px-2 py-0.5 bg-primary-50 text-primary-700 rounded-full text-xs">
                  {kw}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Story Bank */}
      <div className="card overflow-hidden">
        <button
          onClick={() => toggle('stories')}
          className="w-full px-4 py-3 text-left font-medium text-gray-900 flex justify-between items-center hover:bg-gray-50"
        >
          Story Bank ({storyBank.length})
          <ChevronIcon open={expandedSection === 'stories'} />
        </button>
        {expandedSection === 'stories' && (
          <div className="px-4 pb-3 space-y-2 max-h-64 overflow-y-auto">
            {storyBank.map((story, i) => (
              <div key={i} className="border-l-2 border-gray-200 pl-3 py-1">
                <p className="text-xs font-medium text-gray-900">{story.title}</p>
                <p className="text-xs text-gray-500 line-clamp-2">{story.situation}</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {story.skillsDemonstrated.slice(0, 3).map((s, j) => (
                    <span key={j} className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Role Requirements */}
      <div className="card overflow-hidden">
        <button
          onClick={() => toggle('role')}
          className="w-full px-4 py-3 text-left font-medium text-gray-900 flex justify-between items-center hover:bg-gray-50"
        >
          Role Requirements
          <ChevronIcon open={expandedSection === 'role'} />
        </button>
        {expandedSection === 'role' && (
          <div className="px-4 pb-3 space-y-2">
            <div>
              <p className="text-xs font-medium text-gray-700 mb-1">Must Have</p>
              <ul className="text-xs text-gray-600 space-y-0.5">
                {roleProfile.mustHaveSkills.map((s, i) => (
                  <li key={i} className="flex items-start gap-1">
                    <span className="text-green-500 mt-0.5">•</span> {s}
                  </li>
                ))}
              </ul>
            </div>
            {roleProfile.niceToHave.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-700 mb-1">Nice to Have</p>
                <ul className="text-xs text-gray-600 space-y-0.5">
                  {roleProfile.niceToHave.map((s, i) => (
                    <li key={i} className="flex items-start gap-1">
                      <span className="text-blue-400 mt-0.5">•</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {roleProfile.domain && (
              <p className="text-xs text-gray-500">Domain: {roleProfile.domain}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}
