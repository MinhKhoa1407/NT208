import { ai } from "./gemini";
import { COHERENCE_PROMPT } from "./prompts";
import { cleanJson }
from "./clean-json";

export async function
analyzeCoherence(
  text: string
) {
  const response =
    await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `
${COHERENCE_PROMPT}

${text}
`,
    });

  const cleaned = cleanJson(
    response.text ?? "{}"
    );

    return JSON.parse(cleaned);
}