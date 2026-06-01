import { extractDOIs }
from "@/lib/manuscript-scoring/extract-doi";

import { searchDOI }
from "@/lib/manuscript-scoring/search-doi";

import { verifyDOI }
from "@/lib/manuscript-scoring/verify-doi";

import { ReferenceResult }
from "@/types/reference";

/*
========================
NORMALIZE TEXT
========================
*/


function normalizeText(
  text: string
) {
  return text
    .toLowerCase()

    // remove punctuation
    .replace(/[^\w\s]/g, "")

    // remove ALL spaces
    .replace(/\s+/g, "")

    .trim();
}



export async function processReference(
  reference: string
): Promise<ReferenceResult> {

  /*
  ========================
  TRY EXPLICIT DOI
  ========================
  */

  const extractedDOIs =
    extractDOIs(reference);

  let doi =
    extractedDOIs[0];

  let inferredTitle:
    | string
    | undefined;

  /*
  ========================
  INFER DOI IF NEEDED
  ========================
  */

  if (!doi) {

    const inferred =
      await searchDOI(
        reference
      );

    /*
    ========================
    TITLE MATCH CHECK
    ========================
    */

    if (
      inferred?.title
    ) {

      const normalizedReference =
        normalizeText(
          reference
        );

      const normalizedTitle =
        normalizeText(
          inferred.title
        );


      const isMatch =
        normalizedReference.includes(
          normalizedTitle
        )
        ||
        normalizedTitle.includes(
          normalizedReference
        );



      /*
      ========================
      TITLE NOT FOUND
      ========================
      */

      if (!isMatch) {

        return {
          reference,

          title:
            inferred.title,

          status:
            "not_found",
        };
      }
    }

    doi =
      inferred?.doi;

    inferredTitle =
      inferred?.title;
  }

  /*
  ========================
  NO DOI FOUND
  ========================
  */

  if (!doi) {
    return {
      reference,

      status:
        "not_found",
    };
  }

  /*
  ========================
  VERIFY DOI
  ========================
  */

  const verified =
    await verifyDOI(doi);

  return {
    reference,

    doi:
      verified.doi,

    title:
      verified.title
      || inferredTitle,

    status:
      verified.status,
  };
}

