"use client";

const filters = [
  "AI",
  "IEEE",
  "Springer",
  "Fast Review",
  "Cybersecurity",
  "NLP",
  "Open Access"
];

export default function FilterChips() {

  return (
    <div className="flex flex-wrap gap-3">

      {filters.map((item) => (
        <button
          key={item}
          className="
          px-4
          py-2
          rounded-full
          bg-white
          border
          border-gray-200
          hover:bg-blue-600
          hover:text-white
          hover:border-blue-600
          transition-all
          duration-200
          text-sm
          font-medium
          shadow-sm
          "
        >
          {item}
        </button>
      ))}

    </div>
  );
}