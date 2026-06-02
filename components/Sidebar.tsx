"use client";

import { usePathname } from "next/navigation";
import { Users } from "lucide-react";
import Link from "next/link";
import {
  LayoutDashboard,
  FileText,
  Upload,
  Settings,
  Bot,
  User,
  Send,
  SearchCheck,
  Search
} from "lucide-react";
import { useState } from "react";

export default function Sidebar() {
  // 🚨 THAY THẾ: Dùng usePathname để lấy chính xác route hiện tại thay vì dùng useState gán cứng ban đầu
  const pathname = usePathname();
  const [openChat, setOpenChat] = useState(false);

  const menu = [
    { id: "dashboard", name: "Dashboard", icon: LayoutDashboard, href: "/" },
    { id: "write", name: "Write Paper", icon: FileText, href: "/write-paper" },
    { id: "search", name: "Search & Discovery", icon: Search, href: "/search" },
    { id: "community", name: "Community", icon: Users, href: "/community" },
    {
      id: "collaborator",
      name: "Collaborator Finder",
      icon: SearchCheck,
      href: "/collaborator-finder"
    },
    { id: "submission", name: "Submission", icon: Upload, href: "/submission" },
    { id: "ai", name: "Smart Matcher AI", icon: Bot, href: "/match" },
    { id: "profile", name: "Edit Profile", icon: User, href: "/profile" },
    { id: "settings", name: "Settings", icon: Settings, href: "/settings" },
  ];

  return (
    <>
      {/* SIDEBAR */}
      <div
        className="
        group
        min-h-screen
        sticky
        top-0
        w-16
        hover:w-60
        transition-all
        duration-300
        bg-blue-600
        text-white
        flex
        flex-col
        py-6
        "
      >
        {/* MENU */}
        <div className="flex flex-col gap-2 w-full">
          {menu.map((item) => {
            const Icon = item.icon;
            
            // 🚨 KIỂM TRA ACTIVE: Nếu pathname hiện tại khớp với href của item thì bôi đậm tab đó
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.id}
                href={item.href}
                // 🚨 QUAN TRỌNG: Tắt prefetch để khi click chưa đăng nhập, Middleware chặn đứng và đính kèm ?returnUrl chuẩn xác
                prefetch={false}
                className={`
                flex items-center
                gap-4
                h-12
                px-4
                cursor-pointer
                transition-all
                duration-200
                ${isActive ? "bg-white/20" : "hover:bg-white/10"}
                `}
              >
                <Icon size={22} className="min-w-[22px]" />

                <span
                  className="
                  opacity-0
                  group-hover:opacity-100
                  transition-all
                  duration-200
                  whitespace-nowrap
                  text-sm
                  font-medium
                  "
                >
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>

        {/* ROBOT */}
        <div className="mt-auto flex justify-center pb-8">
          <div
            className="relative group/robot cursor-pointer"
            onClick={() => setOpenChat(true)}
          >
            {/* CHAT BUBBLE */}
            <div
              className="
              absolute
              bottom-32
              left-16
              bg-white
              text-gray-800
              text-sm
              font-medium
              px-4
              py-2
              rounded-2xl
              shadow-xl
              opacity-0
              translate-y-2
              transition-all
              duration-300
              whitespace-nowrap
              group-hover/robot:opacity-100
              group-hover/robot:translate-y-0
              "
            >
              Hii 👋 Ask me about research papers!
            </div>

            {/* ROBOT IMAGE */}
            <img
              src="/robot.png"
              alt="robot"
              className="
              w-24
              transition-all
              duration-300
              drop-shadow-2xl
              group-hover/robot:scale-110
              group-hover/robot:animate-bounce
              "
            />
          </div>
        </div>
      </div>

      {/* CHAT WINDOW */}
      {openChat && (
        <div
          className="
          fixed
          bottom-6
          left-24
          w-[380px]
          h-[520px]
          bg-white
          rounded-3xl
          shadow-2xl
          border
          z-50
          flex
          flex-col
          overflow-hidden
          animate-in
          "
        >
          {/* HEADER */}
          <div
            className="
            bg-gradient-to-r
            from-blue-500
            to-indigo-600
            text-white
            px-5
            py-4
            flex
            justify-between
            items-center
            "
          >
            <div>
              <h3 className="font-bold text-lg">
                SciWrite Assistant 🤖
              </h3>
              <p className="text-xs text-blue-100">
                Your AI research companion
              </p>
            </div>

            <button
              onClick={() => setOpenChat(false)}
              className="
              w-8
              h-8
              rounded-full
              bg-white/20
              hover:bg-white/30
              transition
              "
            >
              ✕
            </button>
          </div>

          {/* CHAT AREA */}
          <div
            className="
            flex-1
            overflow-y-auto
            p-4
            bg-gray-50
            space-y-4
            "
          >
            {/* BOT MESSAGE */}
            <div className="flex">
              <div
                className="
                bg-white
                shadow
                rounded-2xl
                px-4
                py-3
                max-w-[85%]
                text-sm
                text-gray-700
                "
              >
                <p className="font-semibold mb-2">
                  Hi 👋 I can help you with:
                </p>
                <ul className="list-disc ml-5 space-y-1">
                  <li>Scientific competitions</li>
                  <li>Research paper structure</li>
                  <li>APA / IEEE citations</li>
                  <li>Open-access references</li>
                  <li>Journals & conferences</li>
                  <li>How to write abstracts</li>
                  <li>Research methodologies</li>
                </ul>
              </div>
            </div>

            {/* USER MESSAGE DEMO */}
            <div className="flex justify-end">
              <div
                className="
                bg-blue-600
                text-white
                rounded-2xl
                px-4
                py-3
                max-w-[80%]
                text-sm
                "
              >
                How can I find open-access references?
              </div>
            </div>

            {/* BOT REPLY DEMO */}
            <div className="flex">
              <div
                className="
                bg-white
                shadow
                rounded-2xl
                px-4
                py-3
                max-w-[85%]
                text-sm
                text-gray-700
                "
              >
                You can search on platforms like Google Scholar,
                arXiv, DOAJ, SpringerOpen, and Semantic Scholar.
              </div>
            </div>
          </div>

          {/* INPUT */}
          <div
            className="
            border-t
            bg-white
            p-3
            flex
            items-center
            gap-2
            "
          >
            <input
              type="text"
              placeholder="Ask something about research papers..."
              className="
              flex-1
              border
              rounded-xl
              px-4
              py-3
              text-sm
              outline-none
              focus:ring-2
              focus:ring-blue-500
              "
            />

            <button
              className="
              w-12
              h-12
              rounded-xl
              bg-blue-600
              hover:bg-blue-700
              transition
              flex
              items-center
              justify-center
              text-white
              "
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}