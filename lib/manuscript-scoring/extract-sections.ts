import { SectionMap }
from "@/types/manuscript-score";

export function extractSections(
  text: string
): SectionMap {

  const lower =
    text.toLowerCase();

  function findSection(
    keywords: string[]
  ) {

    for (
      const keyword of keywords
    ) {

      const index =
        lower.indexOf(keyword);

      if (index !== -1) {
        return keyword;
      }
    }

    return undefined;
  }

  const abstract =
    findSection([
      "abstract",
    ]);

  const introduction =
    findSection([
      "introduction",
      "background",
    ]);

  const methods =
    findSection([
      "methods",
      "methodology",
      "materials and methods",
      "approach",
      "design",
      "implementation",
      "framework",
    ]);

  const results =
    findSection([
      "results",
      "evaluation",
      "findings",
      "analysis",
      "taxonomy",
      "experiments",
      "experimental results",
    ]);

  const discussion =
    findSection([
      "discussion",
      "limitations",
      "future work",
      "future directions",
      "open problems",
      "recommendations",
    ]);

  const conclusion =
    findSection([
      "conclusion",
      "conclusions",
      "concluding remarks",
    ]);

  const references =
    findSection([
      "references",
      "bibliography",
    ]);

  return {
    abstract,
    introduction,
    methods,
    results,
    discussion,
    conclusion,
    references,
  };
}

