export interface Issue {
  sentence?: string;
  section?: string;
  issue: string;
  suggestion: string;
}

export interface RewriteSuggestion {
  original: string;
  rewritten: string;
  reason: string;
}

export interface AIReviewResult {
  grammarIssues: Issue[];
  styleIssues: Issue[];
  coherenceIssues: Issue[];

  rewriteSuggestions:
    RewriteSuggestion[];

  summary: {
    grammarCount: number;
    styleCount: number;
    coherenceCount: number;
    rewriteCount: number;
  };
}