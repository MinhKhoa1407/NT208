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
      "abstract"
    ]);

  const introduction =
    findSection([
      "introduction"
    ]);

  const methods =
    findSection([
      "methods",
      "methodology",
      "materials and methods",
    ]);

  const results =
    findSection([
      "results"
    ]);

  const discussion =
    findSection([
      "discussion"
    ]);

  const conclusion =
    findSection([
      "conclusion",
      "conclusions",
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

