"use client";

import { useState } from "react";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Quote,
  Heading1,
  Heading2,
  Link,
  Code,
  Upload
} from "lucide-react";

export default function WritePaper() {

  const [title, setTitle] = useState("");
  const [text, setText] = useState("");

  const words =
    text.trim() === "" ? 0 : text.trim().split(/\s+/).length;

  const chars = text.length;

  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [loadingPDF, setLoadingPDF] = useState(false);

  const [aiResult, setAiResult] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

const handleCheck = async () => {

  if (!text.trim()) {
    alert("Vui lòng nhập nội dung cần kiểm tra");
    return;
  }

  try {

    setLoading(true);

    const res = await fetch("/api/writing_support/checking", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text: text
      })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Không thể kiểm tra văn bản");
      return;
    }

    setResult(data);

    console.log("AI Grammar Result:", data);

  } catch (error) {
    console.error(error);
    alert("Lỗi khi gọi API AI");
  } finally {
    setLoading(false);
  }

};

/*Logic AI detect */
const handleAIDetect = async () => {
  if (!text.trim()) {
    alert("Please enter text to analyze");
    return;
  }

  try {
    setAiLoading(true);
    setAiError("");
    setAiResult(null);

    const res = await fetch("/api/paper_checking/AI_Detection", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ text })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "AI detect failed");
    }

    setAiResult(data);

  } catch (err: any) {
    console.error(err);
    setAiError(err.message);
  } finally {
    setAiLoading(false);
  }
};
/* ĐỌC FILE PDF */
  const handlePDFUpload = async (event: any) => {

    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Please upload a PDF file");
      return;
    }

    try {

      setLoadingPDF(true);

      const pdfjsLib = await import("pdfjs-dist");

      pdfjsLib.GlobalWorkerOptions.workerSrc =
  new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString();

      const reader = new FileReader();

      reader.onload = async () => {

        const typedarray = new Uint8Array(reader.result as ArrayBuffer);

        const pdf = await pdfjsLib.getDocument({
          data: typedarray
        }).promise;

        let extractedText = "";

        for (let i = 1; i <= pdf.numPages; i++) {

          const page = await pdf.getPage(i);

          const content = await page.getTextContent();

          const strings = content.items.map((item: any) => item.str);

          extractedText += strings.join(" ") + "\n\n";

        }

        setText(extractedText);

      };

      reader.readAsArrayBuffer(file);

    } catch (err) {

      console.error(err);
      alert("Không thể đọc PDF");

    } finally {

      setLoadingPDF(false);

    }

  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 p-10">

      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="mb-10">

          <h1 className="text-5xl font-extrabold mb-3
          bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600
          bg-clip-text text-transparent">

            Write Your Research Paper 

          </h1>

          <p className="text-gray-500 text-lg">
            Draft, edit and enhance your scientific manuscript with AI assistance.
          </p>

        </div>


        {/* EDITOR CARD */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">


          {/* TOP BAR */}
          <div className="flex justify-between items-center px-6 py-4 border-b bg-gray-50">

            <div className="flex gap-3">

              <label className="flex items-center gap-2 text-sm border rounded-lg px-3 py-1.5 cursor-pointer hover:bg-gray-100 transition">

                <Upload size={16} />

                Upload

                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handlePDFUpload}
                  className="hidden"
                />

              </label>

              <button
  onClick={handleCheck}
  disabled={loading}
  className="text-sm bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 transition disabled:opacity-60"
>
  {loading ? "Analyzing..." : "Check Grammar"}
</button>
              <button
  onClick={handleAIDetect}
  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md"
>
  🤖 AI Detect
</button>

            </div>

            <div className="text-sm text-gray-500">
              {words} words • {chars} characters
            </div>

          </div>


          {/* TOOLBAR */}
          <div className="flex gap-1 px-4 py-3 border-b bg-white flex-wrap">

            <button className="p-2 rounded hover:bg-gray-100">
              <Bold size={18} />
            </button>

            <button className="p-2 rounded hover:bg-gray-100">
              <Italic size={18} />
            </button>

            <button className="p-2 rounded hover:bg-gray-100">
              <Underline size={18} />
            </button>

            <button className="p-2 rounded hover:bg-gray-100">
              <Heading1 size={18} />
            </button>

            <button className="p-2 rounded hover:bg-gray-100">
              <Heading2 size={18} />
            </button>

            <button className="p-2 rounded hover:bg-gray-100">
              <List size={18} />
            </button>

            <button className="p-2 rounded hover:bg-gray-100">
              <ListOrdered size={18} />
            </button>

            <button className="p-2 rounded hover:bg-gray-100">
              <Quote size={18} />
            </button>

            <button className="p-2 rounded hover:bg-gray-100">
              <Link size={18} />
            </button>

            <button className="p-2 rounded hover:bg-gray-100">
              <Code size={18} />
            </button>

          </div>


          {/* EDITOR AREA */}
          <div className="p-6">

            {/* PAPER TITLE */}
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Paper title..."
              className="w-full text-3xl font-bold mb-4 outline-none"
            />

            {/* TEXT EDITOR */}
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Start writing your research paper..."
              className="w-full h-[450px] outline-none resize-none text-gray-800 leading-relaxed"
            />

          </div>

          <div className="mt-6 bg-gray-50 rounded-xl border p-6">

  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
    🧠 AI Grammar Analysis
  </h2>

  {!result && !loading && (
    <div className="text-gray-400 text-sm">
      Click <span className="font-medium text-gray-600">"Check Grammar"</span> to analyze your writing.
    </div>
  )}

  {loading && (
    <div className="text-blue-500 text-sm animate-pulse">
      AI is analyzing your text...
    </div>
  )}

  {result && (

    <div>

      {/* SUMMARY */}
      <div className="mb-4 text-sm bg-white border rounded-lg p-3">

        <div className="flex justify-between">

          <span>Total Errors</span>
          <span className="font-semibold text-red-500">
            {result.summary.totalErrors}
          </span>

        </div>

        <div className="grid grid-cols-4 gap-2 mt-2 text-xs text-gray-500">

          <div>Spelling: {result.summary.spelling}</div>
          <div>Grammar: {result.summary.grammar}</div>
          <div>Context: {result.summary.context}</div>
          <div>Academic: {result.summary.academic}</div>

        </div>

      </div>

      

      {/* NO ERROR */}
      {result.sentences.length === 0 && (

        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-green-700 text-sm">
          ✅ Your text looks good! No grammar issues detected.
        </div>

      )}

      {/* ERROR LIST */}
      {result.sentences.map((sentence: any, index: number) => (

        <div
          key={index}
          className="mb-4 bg-white border rounded-lg p-4"
        >

          <div className="text-xs text-gray-400 mb-1">
            Original
          </div>

          <div className="text-sm text-gray-500 line-through mb-2">
            {sentence.original}
          </div>

          <div className="text-xs text-gray-400 mb-1">
            Suggested correction
          </div>

          <div className="text-sm text-green-700 font-medium mb-3">
            {sentence.corrected}
          </div>

          {sentence.errors.map((e: any, i: number) => (

            <div
              key={i}
              className="text-xs bg-red-50 border border-red-200 rounded p-2 mb-2"
            >

              <span className="font-semibold text-red-500">
                {e.text}
              </span>

              {" → "}

              <span className="text-green-700 font-medium">
                {e.suggestion}
              </span>

              <span className="ml-2 text-gray-500">
                ({e.type})
              </span>

            </div>

          ))}

        </div>

      ))}

    </div>

  )}

  {/* AI DETECTION RESULT */}

<div className="mt-6 bg-gray-50 rounded-xl border p-6">

  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
    🤖 AI Detection
  </h2>

  {!aiResult && !aiLoading && (
    <div className="text-gray-400 text-sm">
      Click <span className="font-medium text-gray-600">"AI Detect"</span> to analyze whether the text was written by AI.
    </div>
  )}

  {aiLoading && (
    <div className="text-purple-500 text-sm animate-pulse">
      AI is analyzing writing patterns...
    </div>
  )}

  {aiError && (
    <div className="text-red-500 text-sm">
      {aiError}
    </div>
  )}

  {aiResult && (

    <div>

      {/* AI PROBABILITY */}
      <div className="mb-4">

        <div className="flex justify-between text-sm mb-1">
          <span>AI Probability</span>
          <span className="font-semibold text-red-500">
            {aiResult.overall_ai_probability}%
          </span>
        </div>

        <div className="w-full bg-gray-200 rounded h-3">

          <div
            className="bg-red-500 h-3 rounded"
            style={{ width: `${aiResult.overall_ai_probability}%` }}
          />

        </div>

      </div>

      {/* HUMAN PROBABILITY */}
      <div className="mb-4">

        <div className="flex justify-between text-sm mb-1">
          <span>Human Probability</span>
          <span className="font-semibold text-green-600">
            {aiResult.human_probability}%
          </span>
        </div>

        <div className="w-full bg-gray-200 rounded h-3">

          <div
            className="bg-green-500 h-3 rounded"
            style={{ width: `${aiResult.human_probability}%` }}
          />

        </div>

      </div>

      {/* RISK LEVEL */}
      <div className="text-sm mb-3">
        Risk Level:{" "}
        <span className="font-semibold">
          {aiResult.risk_level}
        </span>
      </div>

      {/* SUMMARY */}
      <div className="text-sm text-gray-600 mb-4">
        {aiResult.summary}
      </div>

      {/* SUSPECTED SENTENCES */}

      {aiResult.suspected_sentences?.length > 0 && (

        <div>

          <div className="text-sm font-semibold mb-2">
            Suspicious Sentences
          </div>

          {aiResult.suspected_sentences.map((s: any, i: number) => (

            <div
              key={i}
              className="bg-red-50 border border-red-200 rounded p-3 mb-2 text-sm"
            >

              <div className="italic mb-1">
                "{s.text}"
              </div>

              <div className="text-xs text-gray-600">
                AI Probability: {s.ai_probability}% — {s.reason}
              </div>

            </div>

          ))}

        </div>

      )}

    </div>

  )}

</div>

</div>

        </div>

      </div>

    </div>
  );
}