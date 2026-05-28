"use client";

import { Search } from "lucide-react";

export default function SearchBar() {

  return (
    <div className="relative w-full">

      <Search
        className="
        absolute
        left-4
        top-1/2
        -translate-y-1/2
        text-gray-400
        "
        size={20}
      />

      <input
        type="text"
        placeholder="Search journals, conferences, keywords..."
        className="
        w-full
        bg-white
        border
        border-gray-200
        rounded-2xl
        pl-12
        pr-4
        py-4
        text-gray-700
        shadow-sm
        focus:outline-none
        focus:ring-2
        focus:ring-blue-500
        "
      />

    </div>
  );
}