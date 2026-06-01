export function calculateFinalScore(
  structure: number,
  keywords: number,
  length: number
) {

  return Math.round(
    structure +
    keywords +
    length
  );
}
