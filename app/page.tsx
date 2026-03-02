"use client";

import { useState, useRef } from "react";

export default function Home() {
  const [tab, setTab] = useState("home");
  const [content, setContent] = useState("");
  const [showMessage, setShowMessage] = useState(false);
  const textareaRef = useRef(null);

  const handleChange = (e) => {
    setContent(e.target.value);

    const el = textareaRef.current;

    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  };

  const handleSubmit = () => {
    if (showMessage) {
      setShowMessage(false);

      setContent("");
      const el = textareaRef.current;
      if (el) el.style.height = "auto";
    }
    else {
      setShowMessage(true);
    }
  };

  return (
    <main className="p-6">
      <div className="flex gap-6 pb-2">
        <button
          className="hover:underline"
          onClick={() => setTab("home")}
        >
          Home
        </button>

        <button
          className="hover:underline"
          onClick={() => setTab("write")}
        >
          Viet bao cao
        </button>
      </div>

      <div className="mt-6">
        {tab === "home" && <h2>Day la trang chu</h2>}

        {tab === "write" && (
          <div className="flex flex-col gap-3">
            <h2>
              Viet vao day
            </h2>

            <textarea
              ref = {textareaRef}
              value = {content}
              onChange = {handleChange}
              placeholder = "Nhập đoạn văn bản..."
              className = "border p-3 rounded-md w-full resize-none overflow-hidden"
            />

            <button
              className = "flex justify-end hover:underline border-r px-4 py-2"
              onClick={handleSubmit}
            >
              Nop bai
            </button>
          </div>
        )}
      </div>

      {showMessage && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30">
          <div className="relative bg-white rounded-lg shadow-lg p-6 w-80 text-center">
            <button
              onClick={handleSubmit}
              className="absolute top-2 right-2 text-gray-500 hover:text-black"
            >
              X
            </button>

            <h3 className="text-lg font-semibold mb-2">
              Nộp bài thành công
            </h3>

            <p className="text-gray-600">
  AI Writing Score: {Math.min(95, Math.floor(content.length / 5))}%
</p>

<p className="text-gray-600">
  Reference Check: {content.includes("doi") ? "Valid references" : "Missing DOI detected"}
</p>

<p className="text-gray-600">
  Suggested Venue: {content.toLowerCase().includes("security")
    ? "ACM CCS"
    : "IEEE Access"}
</p>

          </div>
        </div>
      )}
    </main>
  );
}