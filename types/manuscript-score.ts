export type SectionMap = {
  abstract?: string;

  introduction?: string;

  methods?: string;

  results?: string;

  discussion?: string;

  conclusion?: string;

  references?: string;
};

export type StructureScore = {
  score: number;

  maxScore: number;

  foundSections: string[];

  missingSections: string[];
};

export type KeywordScore = {
  score: number;

  maxScore: number;

  keywords: string[];

  genericKeywords: string[];
};

export type LengthScore = {
  score: number;

  maxScore: number;

  wordCount: number;
};

export type ManuscriptScore = {
  overall: number;

  structure: StructureScore;

  keywords: KeywordScore;

  length: LengthScore;

  warnings: string[];
};

