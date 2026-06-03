import { ServiceType } from "@/types/services";

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
    id: "manuscript-score",
    title: "Manuscript Score",
    description:
      "Evaluate manuscript integrity and quality.",
  },
];

