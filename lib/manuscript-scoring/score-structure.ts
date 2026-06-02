import {
  SectionMap,
  StructureScore,
}
from "@/types/manuscript-score";

export function scoreStructure(
  sections: SectionMap
): StructureScore {

  const foundSections:
    string[] = [];

  const missingSections:
    string[] = [];

  let score = 0;

  const rules = [
    {
      key: "abstract",
      points: 5,
    },
    {
      key: "introduction",
      points: 5,
    },
    {
      key: "methods",
      points: 10,
    },
    {
      key: "results",
      points: 10,
    },
    {
      key: "discussion",
      points: 10,
    },
  ] as const;

  for (
    const rule of rules
  ) {

    const exists =
      sections[
        rule.key
      ];

    if (exists) {

      foundSections.push(
        rule.key
      );

      score +=
        rule.points;

    } else {

      missingSections.push(
        rule.key
      );
    }
  }

  return {
    score,

    maxScore: 40,

    foundSections,

    missingSections,
  };
}

