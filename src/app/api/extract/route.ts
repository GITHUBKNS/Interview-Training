import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { generateJSON } from '@/lib/gemini';
import {
  EXTRACTION_SYSTEM_PROMPT,
  buildExtractionUserPrompt,
  SUGGESTED_QUESTIONS_PROMPT,
} from '@/lib/prompts';
import { setSession } from '@/lib/session-store';
import { InterviewContext, SessionData } from '@/lib/types';

const MAX_TEXT_LENGTH = 50000;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { company, position, resumeText, jdText, postingText, postingUrl } = body;

    if (!company || !position) {
      return NextResponse.json({ error: 'Company and position are required' }, { status: 400 });
    }
    if (!resumeText || resumeText.trim().length < 50) {
      return NextResponse.json(
        { error: 'Resume text is required (minimum 50 characters)' },
        { status: 400 }
      );
    }
    if (!jdText || jdText.trim().length < 50) {
      return NextResponse.json(
        { error: 'Job description text is required (minimum 50 characters)' },
        { status: 400 }
      );
    }
    if (resumeText.length > MAX_TEXT_LENGTH || jdText.length > MAX_TEXT_LENGTH) {
      return NextResponse.json(
        { error: `Text inputs must be under ${MAX_TEXT_LENGTH} characters` },
        { status: 400 }
      );
    }

    const extractionPrompt = buildExtractionUserPrompt({
      company,
      position,
      resumeText: resumeText.trim(),
      jdText: jdText.trim(),
      postingText: postingText?.trim() || null,
    });

    const contextRaw = await generateJSON(EXTRACTION_SYSTEM_PROMPT, extractionPrompt);

    let interviewContext: InterviewContext;
    try {
      interviewContext = JSON.parse(contextRaw);
    } catch {
      return NextResponse.json(
        { error: 'Failed to parse extraction results. Please try again.' },
        { status: 500 }
      );
    }

    let suggestedQuestions: string[] = [];
    try {
      const questionsRaw = await generateJSON(
        SUGGESTED_QUESTIONS_PROMPT,
        `InterviewContext:\n${contextRaw}`
      );
      const parsed = JSON.parse(questionsRaw);
      suggestedQuestions = Array.isArray(parsed) ? parsed : parsed.questions || [];
    } catch {
      suggestedQuestions = [
        'Tell me about yourself and why you\'re interested in this role.',
        'Walk me through a challenging project you led recently.',
        'How do you handle disagreements with team members?',
        'What\'s your approach to learning new technologies?',
        'Why are you interested in our company?',
      ];
    }

    const sessionId = uuidv4();
    const session: SessionData = {
      id: sessionId,
      company,
      position,
      resumeText: resumeText.trim(),
      jdText: jdText.trim(),
      postingText: postingText?.trim() || null,
      postingUrl: postingUrl || null,
      interviewContext,
      chatHistory: [],
      suggestedQuestions,
      createdAt: Date.now(),
    };

    setSession(session);

    return NextResponse.json({
      sessionId,
      interviewContext,
      suggestedQuestions,
    });
  } catch (error: unknown) {
    console.error('Extraction error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
