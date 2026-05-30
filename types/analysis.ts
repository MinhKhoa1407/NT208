import { DOIResult } from "./doi";

export type Summary = {
  total: number;

  valid: number;

  invalid: number;

  retracted: number;
};

export type AnalysisResponse = {
  summary: Summary;

  results: DOIResult[];
};

