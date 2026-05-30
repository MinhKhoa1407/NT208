export function extractReferences(
  text: string
) {

  /*
  ========================
  EXTRACT REFERENCES
  ========================
  */

  const matches =
    text.match(
      /\[\d+\][\s\S]*?(?=\[\d+\]|$)/g
    );

  if (!matches) {

    console.log(
      "NO REFERENCES FOUND"
    );

    return [];
  }

  /*
  ========================
  CLEAN REFERENCES
  ========================
  */

  const references =
    matches
      .map((ref) =>
        ref
          .replace(/\s+/g, " ")
          .trim()
      )
      .filter(
        (ref) =>
          ref.length > 50
      );

  /*
  ========================
  DEBUG
  ========================
  */

  console.log(
    "REFERENCE COUNT:",
    references.length
  );

  return references;
}

