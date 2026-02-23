import { NextRequest, NextResponse } from 'next/server';
import { getSession, deleteSession, exportSession } from '@/lib/session-store';

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get('id');
  const action = request.nextUrl.searchParams.get('action');

  if (!sessionId) {
    return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
  }

  if (action === 'export') {
    const session = exportSession(sessionId);
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }
    return NextResponse.json(session);
  }

  const session = getSession(sessionId);
  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }

  return NextResponse.json({
    id: session.id,
    company: session.company,
    position: session.position,
    interviewContext: session.interviewContext,
    chatHistory: session.chatHistory,
    suggestedQuestions: session.suggestedQuestions,
  });
}

export async function DELETE(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get('id');

  if (!sessionId) {
    return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
  }

  const deleted = deleteSession(sessionId);
  return NextResponse.json({ deleted });
}
