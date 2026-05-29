const DOI_REGEX =
  /10\.\d{4,9}\/[-._;()/:A-Z0-9]+/gi;

export function extractDOIs(
  text: string
) {
  const matches =
    text.match(DOI_REGEX) || [];

  const cleaned =
    matches.map((doi) =>
      doi
        .trim()
        .replace(/[.,;]$/, "")
        .toLowerCase()
    );

  return [...new Set(cleaned)];
}

