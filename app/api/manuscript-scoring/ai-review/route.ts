import { NextRequest, NextResponse } from "next/server";

import { analyzeGrammar }
from "@/lib/ai-review/analyze-grammar";

import { analyzeAcademicStyle }
from "@/lib/ai-review/analyze-academic-style";

import { analyzeCoherence }
from "@/lib/ai-review/analyze-coherence";

import { generateRewriteSuggestions }
from "@/lib/ai-review/generate-rewrite-suggestions";

import { extractText }
from "@/lib/manuscript-scoring/extract-text";

export async function POST(
  request: NextRequest
) {
  try {
    const formData =
  await request.formData();

const file =
  formData.get(
    "file"
  ) as File;

if (!file) {
  return NextResponse.json(
    {
      error:
        "Missing file",
    },
    {
      status: 400,
    }
  );
}

const buffer =
  Buffer.from(
    await file.arrayBuffer()
  );

const text =
  await extractText(
    buffer
  );

    const [
      grammar,
      style,
      coherence,
      rewrites,
    ] = await Promise.all([
      analyzeGrammar(text),
      analyzeAcademicStyle(text),
      analyzeCoherence(text),
      generateRewriteSuggestions(text),
    ]);

    return NextResponse.json({
        grammarIssues: grammar.issues ?? [],
        styleIssues: style.issues ?? [],
        coherenceIssues: coherence.issues ?? [],
        rewriteSuggestions: rewrites.suggestions ?? [],

        summary: {
            grammarCount:
            grammar.issues?.length ?? 0,

            styleCount:
            style.issues?.length ?? 0,

            coherenceCount:
            coherence.issues?.length ?? 0,

            rewriteCount:
            rewrites.suggestions?.length ?? 0,
        },
        });
  } catch (error) {
    console.error(
      "AI Review Error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "AI review failed",
      },
      {
        status: 500,
      }
    );
  }
}