# Interview Tailor

AI-powered interview preparation web app that generates human-sounding, tailored answers based on your resume and job description.

## Features

- **Resume + JD Analysis**: Paste or upload your resume (PDF/DOCX/TXT) and job description
- **URL Extraction**: Optionally fetch job posting content from a URL
- **Role Fit Snapshot**: Skills match, gaps analysis, ATS keywords, and STAR-ready story bank
- **AI Chat Interface**: Practice interview Q&A with tailored, non-generic answers
- **Voice Input**: Speech-to-text support in modern browsers
- **Answer Controls**: Adjust style (Concise/Standard/Deep), format (Natural/STAR/Bullets), tone, and difficulty
- **Anti-Hallucination**: Only uses facts from your resume and JD — never fabricates metrics or experiences
- **Session Management**: Export or delete session data; nothing stored permanently

## Architecture

```
┌─────────────────────────────────────────┐
│            Next.js App Router           │
├──────────────┬──────────────────────────┤
│  Frontend    │  Backend API Routes      │
│  (React +    │  ┌────────────────────┐  │
│   Tailwind)  │  │ /api/extract       │  │
│              │  │ /api/chat          │  │
│  Setup Page  │  │ /api/fetch-url     │  │
│  Interview   │  │ /api/upload        │  │
│  Dashboard   │  │ /api/session       │  │
│              │  └────────┬───────────┘  │
│              │           │              │
│              │  ┌────────▼───────────┐  │
│              │  │ Google Gemini API  │  │
│              │  │ (gemini-1.5-flash) │  │
│              │  └────────────────────┘  │
│              │                          │
│              │  In-memory session store  │
│              │  (auto-expires 4h)       │
└──────────────┴──────────────────────────┘
```

### Two-Stage Pipeline

1. **Extract & Normalize** (one-time per session): Converts resume + JD + posting into a structured `InterviewContext` JSON with candidate profile, role profile, match analysis, and story bank.

2. **Live Answer Generation** (per question): Uses the InterviewContext + chat history + user controls to produce tailored, human-sounding interview answers.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **AI**: Google Gemini 1.5 Flash via `@google/generative-ai`
- **File Parsing**: `pdf-parse` (PDF), `mammoth` (DOCX)
- **URL Extraction**: `cheerio` (HTML parsing)
- **Audio**: Web Speech API (browser-native)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Google Gemini API key ([get one here](https://aistudio.google.com/apikey))

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | Yes | Google Gemini API key |

## Quick Test with Sample Data

1. Start the dev server
2. Click "Load sample data" on the setup page
3. Click "Analyze & Start Interview"
4. Try asking questions in the chat

## Privacy & Security

- No data is stored permanently — sessions live in server memory and expire after 4 hours
- Use "Delete Session" to immediately clear all data
- Use "Export" to download your session data as JSON
- File uploads are processed in memory and not saved to disk
- Basic input validation and size limits are enforced
