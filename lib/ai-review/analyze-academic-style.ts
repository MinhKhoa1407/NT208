import { ai } from "./gemini";
import { STYLE_PROMPT } from "./prompts";
import { cleanJson }
from "./clean-json";

export async function
analyzeAcademicStyle(
  text: string
) {
  const response =
    await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `
${STYLE_PROMPT}

${text}
`,
      config: {
        responseMimeType: "application/json",
      },
    });

  const cleaned = cleanJson(
    response.text ?? "{}"
    );
    return JSON.parse(cleaned);
}