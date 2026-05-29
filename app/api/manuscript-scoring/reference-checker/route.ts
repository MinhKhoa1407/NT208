import { NextRequest }
from "next/server";

import { extractText }
from "@/lib/manuscript-scoring/extract-text";

import { extractDOIs }
from "@/lib/manuscript-scoring/extract-doi";

import { verifyDOI }
from "@/lib/manuscript-scoring/verify-doi";

export async function POST(
  req: NextRequest
) {
  try {

    /*
    ========================
    GET FILE FROM FORM DATA
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
    CONVERT FILE → BUFFER
    ========================
    */

    const bytes =
      await file.arrayBuffer();

    const buffer =
      Buffer.from(bytes);

    /*
    ========================
    EXTRACT RAW TEXT
    ========================
    */

    const text =
      await extractText(buffer);

    /*
    ========================
    EXTRACT DOI
    ========================
    */

    const dois =
      extractDOIs(text);

    console.log(dois);

    const verifiedResults =
    await Promise.all(
        dois.map((doi) =>
        verifyDOI(doi)
        )
    );

    /*
    ========================
    RETURN RESPONSE
    ========================
    */

    return Response.json({
      success: true,

      textLength:
        text.length,

      doiCount:
        dois.length,

      results: 
        verifiedResults,
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

