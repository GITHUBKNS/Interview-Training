import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { generateText } from '@/lib/gemini';
import { INTERVIEW_ANSWER_SYSTEM_PROMPT, buildInterviewAnswerUserPrompt } from '@/lib/prompts';
import { getSession, setSession } from '@/lib/session-store';
import { ChatMessage, ChatControls } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, question, controls } = body as {
      sessionId: string;
      question: string;
      controls: ChatControls;
    };

    if (!sessionId || !question) {
      return NextResponse.json(
        { error: 'Session ID and question are required' },
        { status: 400 }
      );
    }

    const session = getSession(sessionId);
    if (!session || !session.interviewContext) {
      return NextResponse.json(
        { error: 'Session not found or not initialized. Please start a new session.' },
        { status: 404 }
      );
    }

    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content: question.trim(),
      timestamp: Date.now(),
    };
    session.chatHistory.push(userMessage);

    const recentHistory = session.chatHistory
      .slice(-10)
      .map((m) => `${m.role === 'user' ? 'Interviewer' : 'Candidate'}: ${m.content}`)
      .join('\n\n');

    const userPrompt = buildInterviewAnswerUserPrompt({
      contextJson: JSON.stringify(session.interviewContext),
      style: controls?.style || 'Standard',
      format: controls?.format || 'Natural',
      tone: controls?.tone || 'Confident',
      askClarifyingIfNeeded: controls?.askClarifyingIfNeeded ?? true,
      history: recentHistory,
      question: question.trim(),
    });

    const answerRaw = await generateText(INTERVIEW_ANSWER_SYSTEM_PROMPT, userPrompt);

    let mainAnswer = answerRaw;
    let followUps: string[] = [];
    let assumptions: string | undefined;
    let whyThisWorks: string | undefined;

    const followUpMatch = answerRaw.match(/📋\s*Possible follow-ups?:([\s\S]*?)(?=⚠️|$)/i);
    if (followUpMatch) {
      followUps = followUpMatch[1]
        .split(/[-•]\s+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
      mainAnswer = mainAnswer.replace(followUpMatch[0], '').trim();
    }

    const assumptionsMatch = answerRaw.match(/⚠️\s*Assumptions?:([\s\S]*?)$/i);
    if (assumptionsMatch) {
      assumptions = assumptionsMatch[1].trim();
      mainAnswer = mainAnswer.replace(assumptionsMatch[0], '').trim();
    }

    const assistantMessage: ChatMessage = {
      id: uuidv4(),
      role: 'assistant',
      content: mainAnswer,
      timestamp: Date.now(),
      followUps: followUps.length > 0 ? followUps : undefined,
      assumptions,
      whyThisWorks,
    };

    session.chatHistory.push(assistantMessage);
    setSession(session);

    return NextResponse.json({
      message: assistantMessage,
    });
  } catch (error: unknown) {
    console.error('Chat error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
