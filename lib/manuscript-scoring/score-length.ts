import {
  LengthScore
}
from "@/types/manuscript-score";

export function scoreLength(
  text: string
): LengthScore {

  const wordCount =
    text
      .split(/\s+/)
      .filter(Boolean)
      .length;

  let score = 0;

  if (wordCount < 1000) {
    score = 5;
  }

  else if (
    wordCount < 3000
  ) {
    score = 15;
  }

  else if (
    wordCount < 7000
  ) {
    score = 25;
  }

  else {
    score = 18;
  }

  return {
    score,

    maxScore: 25,

    wordCount,
  };
}

