"use client";

import { useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreate: (post: {
  title: string;
  journal: string;
  content: string;
  }) => void;
};

export default function CreatePostModal({
  open,
  onClose,
  onCreate,
}: Props) {

  const [title, setTitle] = useState("");
  const [journal, setJournal] = useState("");
  const [content, setContent] = useState("");

  if (!open) return null;

  return (
    <div
      className="
      fixed
      inset-0
      bg-black/40
      flex
      items-center
      justify-center
      z-50
      "
    >

      <div
        className="
        bg-white
        w-full
        max-w-2xl
        rounded-3xl
        p-8
        shadow-2xl
        "
      >

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">

          <h2 className="text-3xl font-bold text-gray-800">
            Share Experience
          </h2>

          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-500 text-xl"
          >
            ✕
          </button>

        </div>

        {/* FORM */}
        <div className="space-y-5">

          {/* JOURNAL */}
          <input
            type="text"
            placeholder="Journal / Conference"
            value={journal}
            onChange={(e) => setJournal(e.target.value)}
            className="
            w-full
            border
            rounded-xl
            px-4
            py-3
            outline-none
            focus:ring-2
            focus:ring-blue-500
            "
          />

          {/* TITLE */}
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="
            w-full
            border
            rounded-xl
            px-4
            py-3
            outline-none
            focus:ring-2
            focus:ring-blue-500
            "
          />

          {/* CONTENT */}
          <textarea
            rows={6}
            placeholder="Share your review experience..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="
            w-full
            border
            rounded-xl
            px-4
            py-3
            outline-none
            resize-none
            focus:ring-2
            focus:ring-blue-500
            "
          />

          {/* BUTTON */}
          <button
            onClick={() => {

              if (!title || !journal || !content) return;

              onCreate({
                title,
                journal,
                content,
              });

              setTitle("");
              setJournal("");
              setContent("");

              onClose();
            }}
            className="
            w-full
            py-4
            rounded-xl
            bg-gradient-to-r
            from-blue-500
            to-indigo-600
            text-white
            font-semibold
            hover:opacity-90
            transition
            "
          >
            Publish Review
          </button>

        </div>

      </div>

    </div>
  );
}