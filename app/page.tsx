"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  Bot,
  FileText,
  Users,
  MessageSquare,
  Search,
  KanbanSquare,
} from "lucide-react";

type User = {
  name: string;
  email: string;
};

export default function Home() {

  const [user, setUser] = useState<User | null>(null);
  const rotatingTexts = [
  "Write Papers.",
  "Find Collaborators.",
  "Manage Projects.",
  "Discover Research.",
  "Publish Faster.",
];

const [currentText, setCurrentText] = useState(0);

  const loadUser = () => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadUser();

    window.addEventListener("userChanged", loadUser);

    return () => {
      window.removeEventListener("userChanged", loadUser);
    };

  }, []);

  useEffect(() => {
  const interval = setInterval(() => {
    setCurrentText((prev) => (prev + 1) % rotatingTexts.length);
  }, 2500);

  return () => clearInterval(interval);
}, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-6">

      {/* CHƯA LOGIN */}
      {!user && (
  <div className="flex flex-col items-center justify-center text-center max-w-4xl">

    {/* LOGO */}
    <div className="text-8xl mb-3 animate-pulse">
      <Bot
      size={90}
      className="
      text-indigo-600
      mb-8
      drop-shadow-lg
      "
    />
    </div>

    {/* TITLE */}
    <h1 className="text-7xl font-extrabold tracking-tight mb-6">
      <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
        SciWrite
      </span>
    </h1>
    <p className="uppercase tracking-[0.4em] text-sm text-gray-400 mb-8">
  RESEARCH OPERATING SYSTEM
</p>

    {/* MAIN MESSAGE */}
    <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
      Research smarter.
    </h2>

    {/* CHANGING TEXT */}
    <div className="h-12 flex items-center justify-center mb-8">
      <span
        className="
        text-2xl
        md:text-3xl
        font-semibold
        text-blue-600
        animate-pulse
        "
      >
        {rotatingTexts[currentText]}
      </span>
    </div>

    {/* DESCRIPTION */}
    <p className="text-lg text-gray-500 max-w-2xl mb-10">
      AI-powered platform for scientific writing,
      collaboration and research workflow management.
    </p>

    {/* BUTTON */}
    <Link href="/auth/login">
  <button
  className="
  relative
  px-10
  py-4
  rounded-2xl
  text-white
  font-bold
  overflow-hidden
  group
  "
>
  <div
    className="
    absolute
    inset-0
    bg-gradient-to-r
    from-blue-600
    via-indigo-500
    to-purple-600
    "
  />

  <div
    className="
    absolute
    inset-0
    opacity-0
    group-hover:opacity-100
    bg-gradient-to-r
    from-purple-500
    via-pink-500
    to-blue-500
    transition
    duration-500
    "
  />

  <span className="relative z-10">
    Get Started 
  </span>
</button>
</Link>

    {/* FEATURES */}
    <div className="mt-16 flex flex-wrap justify-center gap-4">

      <span className="px-4 py-2 rounded-full bg-blue-50 text-blue-700">
        📄 Paper Writing
      </span>

      <span className="px-4 py-2 rounded-full bg-indigo-50 text-indigo-700">
        🤖 AI Assistant
      </span>

      <span className="px-4 py-2 rounded-full bg-emerald-50 text-emerald-700">
        👥 Community
      </span>

      <span className="px-4 py-2 rounded-full bg-orange-50 text-orange-700">
        📊 Workflow Board
      </span>

      <span className="px-4 py-2 rounded-full bg-purple-50 text-purple-700">
        💬 Messaging
      </span>

      <span className="px-4 py-2 rounded-full bg-cyan-50 text-cyan-700">
        🔍 Discovery
      </span>

    </div>

  </div>
)}

      {/* ĐÃ LOGIN */}
{user && (
  <div className="w-full max-w-6xl mx-auto space-y-8">

    {/* HERO */}
    <div
      className="
      relative
      overflow-hidden
      rounded-[32px]
      bg-gradient-to-r
      from-blue-600
      via-indigo-600
      to-purple-600
      text-white
      p-10
      shadow-2xl
      "
    >
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 left-1/3 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
      <div className="flex flex-col md:flex-row items-center justify-between gap-8">

        <div>
          <h1 className="text-5xl font-bold mb-4">
            Welcome back {user.name} 👋
          </h1>

          <p className="text-lg text-blue-100 mb-2">
            Build, collaborate and publish research faster with SciWrite.
          </p>

          <Link href="/write-paper">
            <button
              className="
              px-6
              py-3
              rounded-xl
              bg-white
              text-blue-700
              font-semibold
              hover:scale-105
              transition
              "
            >
              Start
            </button>
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-8">

  <FileText
    size={52}
    className="
      text-white
      float-slow
      drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]
      hover:scale-125
      transition
      cursor-pointer
    "
  />

  <Bot
    size={56}
    className="
      text-white
      float-fast
      drop-shadow-[0_0_30px_rgba(255,255,255,0.8)]
      hover:scale-125
      transition
      cursor-pointer
    "
  />

  <Users
    size={52}
    className="
      text-white
      float-medium
      drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]
      hover:scale-125
      transition
      cursor-pointer
    "
  />

  <KanbanSquare
    size={52}
    className="
      text-white
      float-medium
      drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]
      hover:scale-125
      transition
      cursor-pointer
    "
  />

  <MessageSquare
    size={52}
    className="
      text-white
      float-slow
      drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]
      hover:scale-125
      transition
      cursor-pointer
    "
  />

  <Search
    size={52}
    className="
      text-white
      float-fast
      drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]
      hover:scale-125
      transition
      cursor-pointer
    "
  />

</div>

      </div>
    </div>

    {/* SECTION TITLE */}
    <div>
      <h2 className="text-2xl font-bold text-gray-800">
        Research Workspace
      </h2>

      <p className="text-gray-500">
        Access all research tools from one place.
      </p>
    </div>

    {/* TOOLS */}
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

      <Link href="/write-paper">
        <div className="group bg-white rounded-3xl border p-7 hover:shadow-xl hover:-translate-y-2 transition-all cursor-pointer">
          <FileText className="text-blue-600 mb-4" size={34} />
          <h3 className="font-bold text-xl mb-2">
            Paper Writing
          </h3>
          <p className="text-gray-500">
            Create and manage scientific manuscripts.
          </p>
        </div>
      </Link>

      <Link href="/match">
        <div className="group bg-white rounded-3xl border p-7 hover:shadow-xl hover:-translate-y-2 transition-all cursor-pointer">
          <Bot className="text-indigo-600 mb-4" size={34} />
          <h3 className="font-bold text-xl mb-2">
            AI Assistant
          </h3>
          <p className="text-gray-500">
            Improve writing and research quality.
          </p>
        </div>
      </Link>

      <Link href="/community">
        <div className="group bg-white rounded-3xl border p-7 hover:shadow-xl hover:-translate-y-2 transition-all cursor-pointer">
          <Users className="text-emerald-600 mb-4" size={34} />
          <h3 className="font-bold text-xl mb-2">
            Community
          </h3>
          <p className="text-gray-500">
            Connect with fellow researchers.
          </p>
        </div>
      </Link>

      <Link href="/workflow-board">
        <div className="group bg-white rounded-3xl border p-7 hover:shadow-xl hover:-translate-y-2 transition-all cursor-pointer">
          <KanbanSquare className="text-orange-500 mb-4" size={34} />
          <h3 className="font-bold text-xl mb-2">
            Workflow Board
          </h3>
          <p className="text-gray-500">
            Organize and track research progress.
          </p>
        </div>
      </Link>

      <Link href="/connections">
        <div className="group bg-white rounded-3xl border p-7 hover:shadow-xl hover:-translate-y-2 transition-all cursor-pointer">
          <MessageSquare className="text-purple-600 mb-4" size={34} />
          <h3 className="font-bold text-xl mb-2">
            Messages
          </h3>
          <p className="text-gray-500">
            Communicate with collaborators.
          </p>
        </div>
      </Link>

      <Link href="/search">
        <div className="group bg-white rounded-3xl border p-7 hover:shadow-xl hover:-translate-y-2 transition-all cursor-pointer">
          <Search className="text-cyan-600 mb-4" size={34} />
          <h3 className="font-bold text-xl mb-2">
            Discovery
          </h3>
          <p className="text-gray-500">
            Search papers and research resources.
          </p>
        </div>
      </Link>

    </div>
  </div>
)}

    </div>
  );
}