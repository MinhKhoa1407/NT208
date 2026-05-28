import { ServiceType } from "@/types/service";

export const SERVICES: {
  id: ServiceType;
  title: string;
  description: string;
}[] = [
  {
    id: "reference-checker",
    title: "Reference Checker",
    description:
      "Verify DOI references and detect retracted papers.",
  },

  {
    id: "ai-review",
    title: "AI Review",
    description:
      "AI-powered manuscript feedback.",
  },

  {
    id: "citation-analysis",
    title: "Citation Analysis",
    description:
      "Analyze citation structure and metadata.",
  },

  {
    id: "manuscript-score",
    title: "Manuscript Score",
    description:
      "Evaluate manuscript integrity and quality.",
  },
];

