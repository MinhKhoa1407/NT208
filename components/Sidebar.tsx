"use client";

import { useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  FileText,
  Upload,
  Settings,
  Bot,
  User
} from "lucide-react";

export default function Sidebar() {

  const [active, setActive] = useState("dashboard");

  const menu = [
    { id: "dashboard", name: "Dashboard", icon: LayoutDashboard, href: "/" },
    { id: "write", name: "Write Paper", icon: FileText, href: "/write-paper" },
    { id: "submission", name: "Submission", icon: Upload, href: "/submission" },
    { id: "ai", name: "AI Tools", icon: Bot, href: "/ai-tools" },
    { id: "profile", name: "Edit Profile", icon: User, href: "/profile" },
    { id: "settings", name: "Settings", icon: Settings, href: "/settings" },
  ];

  return (
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

          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => setActive(item.id)}
              className={`
              flex items-center
              gap-4
              h-12
              px-4
              cursor-pointer
              transition-all
              duration-200
              ${active === item.id
                ? "bg-white/20"
                : "hover:bg-white/10"}
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
      <div className="mt-auto flex justify-center pb-8 relative">

        <div
          className="
          absolute
          bottom-40
          left-14
          bg-white
          text-gray-800
          text-lg
          font-semibold
          px-5
          py-2
          rounded-2xl
          shadow-xl
          opacity-0
          translate-x-2
          transition-all
          duration-300
          group-hover:opacity-100
          group-hover:translate-x-0
          "
        >
          Hii 👋
        </div>

        <img
          src="/robot.png"
          alt="robot"
          className="
          w-28
          animate-bounce
          group-hover:animate-none
          transition-all
          duration-300
          group-hover:scale-125
          drop-shadow-2xl
          "
        />

      </div>

    </div>
  );
}