export interface CandidateProfile {
  headlineSummary: string;
  coreSkills: {
    languages: string[];
    frameworks: string[];
    cloudDevops: string[];
    data: string[];
    testing: string[];
    other: string[];
  };
  experienceTimeline: {
    role: string;
    company: string;
    dates: string;
    bullets: string[];
  }[];
  notableProjects: {
    name: string;
    stack: string[];
    impact: string;
  }[];
  achievementsWithMetrics: string[];
  educationCerts: string[];
}

export interface RoleProfile {
  mustHaveSkills: string[];
  niceToHave: string[];
  responsibilities: string[];
  domain: string | null;
  interviewStyleGuesses: string | null;
}

export interface MatchAnalysis {
  strongestOverlaps: {
    skill: string;
    evidence: string;
  }[];
  gapsRisks: {
    gap: string;
    mitigation: string;
  }[];
  keywordMap: string[];
}

export interface StoryBankEntry {
  title: string;
  situation: string;
  task: string;
  actions: string;
  results: string;
  skillsDemonstrated: string[];
}

export interface InterviewContext {
  candidateProfile: CandidateProfile;
  roleProfile: RoleProfile;
  matchAnalysis: MatchAnalysis;
  storyBank: StoryBankEntry[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  followUps?: string[];
  assumptions?: string;
  whyThisWorks?: string;
}

export interface ChatControls {
  style: 'Concise' | 'Standard' | 'DeepDive';
  format: 'Natural' | 'STAR' | 'Bullets';
  tone: 'Calm' | 'Confident' | 'Energetic';
  difficulty: 'Screening' | 'Behavioral' | 'Technical' | 'BarRaiser';
  askClarifyingIfNeeded: boolean;
}

export interface SessionData {
  id: string;
  company: string;
  position: string;
  resumeText: string;
  jdText: string;
  postingText: string | null;
  postingUrl: string | null;
  interviewContext: InterviewContext | null;
  chatHistory: ChatMessage[];
  suggestedQuestions: string[];
  createdAt: number;
}
