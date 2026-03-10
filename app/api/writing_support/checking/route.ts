import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_APIKEY as string);

export async function POST (request : Request) {
    try {
        const { text } = await request.json();

        const model = genAI.getGenerativeModel({
            model : "gemini-2.5-flash",
            generationConfig: { responseMimeType: "application/json" }
        });

        const prompt = `You are an expert linguistic and academic writing assistant.

                        Your task is to analyze a given text and detect:

                        1. Spelling mistakes
                        2. Grammar mistakes
                        3. Incorrect or unnatural word usage in context
                        4. Academic writing style problems

                        The text may be written in **Vietnamese or English**, and it may contain **multiple sentences or paragraphs from a scientific research paper**.

                        Important requirement:

                        You must read and understand the **entire text first** to determine the **overall context, topic, and meaning** before making corrections.

                        All corrections must be **context-aware**, meaning:

                        * The correction must fit the **meaning of the surrounding sentences and the entire paragraph**.
                        * Do not correct words only based on the isolated sentence.
                        * Ensure the corrected sentence remains **consistent with the context of the paragraph or research topic**.

                        Then analyze the text **sentence by sentence**.

                        Return the result **ONLY in valid JSON format** using the following structure:

                        {
                        "isCorrect": boolean,
                        "sentences": [
                        {
                        "original": "string",
                        "corrected": "string",
                        "errors": [
                        {
                        "text": "string",
                        "suggestion": "string",
                        "type": "spelling | grammar | context | academic",
                        "reason": "string",
                        "start": number,
                        "end": number
                        }
                        ]
                        }
                        ],
                        "summary": {
                        "totalErrors": number,
                        "spelling": number,
                        "grammar": number,
                        "context": number,
                        "academic": number
                        }
                        }

                        Rules:

                        1. "isCorrect" is true only if the entire text has no errors.

                        2. Analyze the text **sentence by sentence**, but always consider the **full paragraph context** when making corrections.

                        3. Only include sentences that contain errors inside the "sentences" array.

                        4. For each sentence with errors:

                        * "original" must contain the original sentence.
                        * "corrected" must contain the **fully corrected sentence after fixing all errors**.
                        * The corrected sentence must also **fit the context of the surrounding sentences**.
                        * "errors" must list **all incorrect words or phrases found in that sentence**.

                        5. Each error object must contain:

                        * "text": the incorrect word or phrase.
                        * "suggestion": the corrected word or phrase.
                        * "type": one of the following categories:
                            spelling
                            grammar
                            context
                            academic
                        * "reason": a short explanation of why the word or phrase is incorrect in the given context.
                        * "start": the starting character index of the incorrect text in the original sentence.
                        * "end": the ending character index of the incorrect text in the original sentence.

                        6. If a sentence contains **multiple incorrect words or phrases**, list **all of them in the errors array**, but return **only one fully corrected sentence** in "corrected".

                        7. Corrections must maintain a **formal academic tone** suitable for research writing.

                        8. Vietnamese corrections must sound natural and academically appropriate.
                        English corrections must follow correct grammar and academic writing style.

                        9. If the text contains **no errors**, return:

                        {
                        "isCorrect": true,
                        "sentences": [],
                        "summary": {
                        "totalErrors": 0,
                        "spelling": 0,
                        "grammar": 0,
                        "context": 0,
                        "academic": 0
                        }
                        }

                        Important constraints:

                        * Return ONLY JSON.
                        * Do NOT include explanations outside JSON.
                        * Do NOT include markdown formatting.
                        * Ensure the JSON is syntactically valid.

                        Example (English):

                        Input:
                        This paper study the impact of blockchain technologies in education system.

                        Expected Output:

                        {
                        "isCorrect": false,
                        "sentences": [
                        {
                        "original": "This paper study the impact of blockchain technologies in education system.",
                        "corrected": "This paper studies the impact of blockchain technologies in the education system.",
                        "errors": [
                        {
                        "text": "study",
                        "suggestion": "studies",
                        "type": "grammar",
                        "reason": "The singular subject 'paper' requires the verb 'studies'.",
                        "start": 11,
                        "end": 16
                        },
                        {
                        "text": "education system",
                        "suggestion": "the education system",
                        "type": "grammar",
                        "reason": "The noun phrase requires a definite article in this academic context.",
                        "start": 48,
                        "end": 64
                        }
                        ]
                        }
                        ],
                        "summary": {
                        "totalErrors": 2,
                        "spelling": 0,
                        "grammar": 2,
                        "context": 0,
                        "academic": 0
                        }
                        }

                        Example (Vietnamese):

                        Input:
                        Hôm nay tôi đi học bằng xe đạp điện tử.

                        Expected Output:

                        {
                        "isCorrect": false,
                        "sentences": [
                        {
                        "original": "Hôm nay tôi đi học bằng xe đạp điện tử.",
                        "corrected": "Hôm nay tôi đi học bằng xe đạp điện.",
                        "errors": [
                        {
                        "text": "xe đạp điện tử",
                        "suggestion": "xe đạp điện",
                        "type": "context",
                        "reason": "Trong ngữ cảnh phương tiện giao thông, 'xe đạp điện' là cách dùng đúng.",
                        "start": 23,
                        "end": 36
                        }
                        ]
                        }
                        ],
                        "summary": {
                        "totalErrors": 1,
                        "spelling": 0,
                        "grammar": 0,
                        "context": 1,
                        "academic": 0
                        }
                        }

                        Now analyze the following text:

                        ${ text }
                        `;
        const chunks = splitText(text, 2000);

const results = [];

for (const chunk of chunks) {

    const result = await model.generateContent(
        prompt + "\n\nText:\n" + chunk
    );

    let responseText = await result.response.text();

    responseText = responseText.replace(/```json|```/g, "").trim();

    try {
        const parsed = JSON.parse(responseText);
        results.push(parsed);
    } catch {
        console.error("Chunk parse error:", responseText);
    }

}
        responseText = responseText.replace(/```json|```/g, "").trim();

        try {
            const jsonData = JSON.parse(responseText);
            return NextResponse.json(jsonData);
        } catch (parseError) {
            console.error("Lỗi Parse JSON. Nội dung thô từ AI:", responseText);
            return NextResponse.json({ 
                error: "Dữ liệu AI trả về không đúng định dạng",
                raw: responseText 
            }, { status: 500 });
        }
    }
    catch (error : any) {
        console.error("Gemini Error:", error);
        return NextResponse.json({ error: "Không thể xử lý văn bản" }, { status: 500 });
    }
}