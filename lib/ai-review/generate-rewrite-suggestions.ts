import { ai } from "./gemini";
import { REWRITE_PROMPT } from "./prompts";
import { cleanJson }
from "./clean-json";
export async function
generateRewriteSuggestions(
  text: string
) {
  const response =
    await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `
${REWRITE_PROMPT}

${text}
`,
    });

  const cleaned = cleanJson(
    response.text ?? "{}"
    );
    return JSON.parse(cleaned);
}