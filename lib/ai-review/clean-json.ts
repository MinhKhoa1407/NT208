export function cleanJson(
  text: string
) {
  return text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();
}