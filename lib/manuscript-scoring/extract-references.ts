export function extractReferences(text: string) {
  /*
  ========================
  FIND REFERENCES SECTION
  ========================
  */

  const referenceSectionMatch = text.match(
    /(references|bibliography)\s*\n?([\s\S]*)$/i
  );

  if (!referenceSectionMatch) {
    console.log("NO REFERENCES SECTION FOUND");
    return [];
  }

  const referenceSection = referenceSectionMatch[2];

  /*
  ========================
  EXTRACT REFERENCES
  ========================
  */

  const matches = referenceSection.match(
    /\[\d+\][\s\S]*?(?=\[\d+\]|$)/g
  );

  if (!matches) {
    console.log("NO REFERENCES FOUND");
    return [];
  }

  /*
  ========================
  CLEAN REFERENCES
  ========================
  */

  const references = matches
    .map((ref) =>
      ref.replace(/\s+/g, " ").trim()
    )
    .filter((ref) => ref.length > 50);

  console.log("REFERENCE COUNT:", references.length);

  return references;
}