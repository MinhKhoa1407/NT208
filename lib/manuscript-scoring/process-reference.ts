import { extractDOIs }
from "@/lib/manuscript-scoring/extract-doi";

import { searchDOI }
from "@/lib/manuscript-scoring/search-doi";

import { verifyDOI }
from "@/lib/manuscript-scoring/verify-doi";

import { ReferenceResult }
from "@/types/reference";

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

    doi = inferred?.doi;
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
      verified.title,

    status:
      verified.status,
  };
}

