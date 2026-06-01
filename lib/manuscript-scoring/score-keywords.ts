import {
  KeywordScore
}
from "@/types/manuscript-score";

const genericKeywords = [
  "deep learning",
  "machine learning",
  "artificial intelligence",
  "ai",
  "neural network",
];

const noveltyKeywords = [
  "llm",
  "rag",
  "graph transformer",
  "diffusion",
  "federated learning",
  "multimodal",
];

export function scoreKeywords(
  text: string
): KeywordScore {

  const lower =
    text.toLowerCase();

  const foundGeneric =
    genericKeywords.filter(
      (keyword) =>
        lower.includes(
          keyword
        )
    );

  const foundNovel =
    noveltyKeywords.filter(
      (keyword) =>
        lower.includes(
          keyword
        )
    );

  let score = 15;

  score -=
    foundGeneric.length * 2;

  score +=
    foundNovel.length * 3;

  score =
    Math.max(
      0,
      Math.min(35, score)
    );

  return {
    score,

    maxScore: 35,

    keywords: foundNovel,

    genericKeywords:
      foundGeneric,
  };
}

