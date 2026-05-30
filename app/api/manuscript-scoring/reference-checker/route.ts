import { NextRequest }
from "next/server";

import { extractText }
from "@/lib/manuscript-scoring/extract-text";

import { extractReferences }
from "@/lib/manuscript-scoring/extract-references";

import { processReference }
from "@/lib/manuscript-scoring/process-reference";

export async function POST(
  req: NextRequest
) {
  try {

    /*
    ========================
    GET FILE
    ========================
    */

    const formData =
      await req.formData();

    const file =
      formData.get("file") as File;

    if (!file) {
      return Response.json(
        {
          error:
            "No file uploaded",
        },
        {
          status: 400,
        }
      );
    }

    /*
    ========================
    FILE → BUFFER
    ========================
    */

    const bytes =
      await file.arrayBuffer();

    const buffer =
      Buffer.from(bytes);

    /*
    ========================
    PDF → TEXT
    ========================
    */

    const text =
      await extractText(buffer);

    /*
    ========================
    EXTRACT REFERENCES
    ========================
    */

    const references =
      extractReferences(text);

    /*
    ========================
    LIMIT REFERENCES
    ========================
    */

    /*
    ========================
    PROCESS REFERENCES
    ========================
    */

    const results = [];

    for (
      const reference of
      references
    ) {

      console.log(
        "Processing reference..."
      );

      const result =
        await processReference(
          reference
        );

      results.push(result);

      console.log(
        `Processed ${
          results.length
        } / ${
          references.length
        }`
      );


      /*
      ========================
      SMALL DELAY
      ========================
      */

      await new Promise(
        (resolve) =>
          setTimeout(
            resolve,
            300
          )
      );
    }


    /*
    ========================
    RETURN RESPONSE
    ========================
    */

    return Response.json({
      success: true,

      referenceCount:
        references.length,

      processedCount:
        results.length,

      results,
    });

  } catch (error) {

    console.error(error);

    return Response.json(
      {
        error:
          "Internal server error",
      },
      {
        status: 500,
      }
    );
  }
}

