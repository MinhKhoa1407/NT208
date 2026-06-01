import { NextRequest }
from "next/server";

import { extractText }
from "@/lib/manuscript-scoring/extract-text";

import { extractSections }
from "@/lib/manuscript-scoring/extract-sections";

import { scoreStructure }
from "@/lib/manuscript-scoring/score-structure";

import { scoreKeywords }
from "@/lib/manuscript-scoring/score-keywords";

import { scoreLength }
from "@/lib/manuscript-scoring/score-length";

import { calculateFinalScore }
from "@/lib/manuscript-scoring/calculate-final-score";

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
      await extractText(
        buffer
      );

    /*
    ========================
    EXTRACT SECTIONS
    ========================
    */

    const sections =
      extractSections(
        text
      );

    /*
    ========================
    SCORING
    ========================
    */

    const structure =
      scoreStructure(
        sections
      );

    const keywords =
      scoreKeywords(
        text
      );

    const length =
      scoreLength(
        text
      );

    /*
    ========================
    FINAL SCORE
    ========================
    */

    const overall =
      calculateFinalScore(
        structure.score,
        keywords.score,
        length.score
      );

    /*
    ========================
    WARNINGS
    ========================
    */

    const warnings = [

      ...structure
        .missingSections
        .map(
          (section) =>
            `Missing ${section}`
        ),

    ];

    /*
    ========================
    RESPONSE
    ========================
    */

    return Response.json({

      overall,

      structure,

      keywords,

      length,

      warnings,

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

