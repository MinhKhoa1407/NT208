import { ReferenceResult }
from "./reference";

export type Summary = {
  total: number;

  valid: number;

  invalid: number;

  retracted: number;

  notFound: number;

  lookupFailed: number;
};

export type AnalysisResponse = {
  summary: Summary;

  results: ReferenceResult[];
};
