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

  const handleCheck = () => {
    alert("Checking grammar with AI...");
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

                <input type="file" className="hidden" />

              </label>

              <button
                onClick={handleCheck}
                className="text-sm bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 transition"
              >
                Check Grammar
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

        </div>

      </div>

    </div>
  );
}