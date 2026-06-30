export function cleanJson(text: string): string {
  if (!text) return "{}";

  let cleaned = text.trim();

  // Remove UTF-8 BOM
  cleaned = cleaned.replace(/^\uFEFF/, "");

  // Remove markdown fences
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.replace(/^```json\s*/i, "");
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```\s*/, "");
  }

  cleaned = cleaned.replace(/\s*```$/, "").trim();

  return cleaned;
}