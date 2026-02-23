import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromUrl } from '@/lib/extract-url';

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    const text = await extractTextFromUrl(url);

    if (!text || text.length < 50) {
      return NextResponse.json(
        {
          error:
            "Couldn't fetch meaningful content from the URL. Please paste the job posting text manually.",
          text: null,
        },
        { status: 200 }
      );
    }

    return NextResponse.json({ text, error: null });
  } catch (error: unknown) {
    console.error('URL fetch error:', error);
    return NextResponse.json(
      {
        error:
          "Couldn't fetch content from the URL. This may be due to access restrictions. Please paste the job posting text manually.",
        text: null,
      },
      { status: 200 }
    );
  }
}
