"use client";

import Link from "next/link";
import Image from "next/image";
import ThemeToggle from "./ThemeToggle";
import { useEffect, useState } from "react";

type User = {
  name: string;
  email: string;
};

export default function Topbar() {

  const [user, setUser] = useState<User | null>(null);

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

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("userChanged"));
  };

  return (
    <div className="relative flex items-center px-6 py-4 border-b bg-white shadow-sm">

      {/* LEFT */}
      <div className="flex items-center gap-3">

        <Image
          src="/logo.png"
          alt="logo"
          width={56}
          height={56}
          className="rounded drop-shadow-md"
        />

        <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          SciWrite
        </span>

      </div>

      {/* CENTER */}
      <h2 className="absolute left-1/2 -translate-x-1/2 text-lg md:text-xl font-semibold text-gray-800 tracking-wide pointer-events-none">
        Soạn thảo bài báo Nghiên cứu Khoa học
      </h2>

      {/* RIGHT */}
      <div className="ml-auto flex items-center gap-4">

        <ThemeToggle />

        {!user ? (
          <Link href="/auth/login">
            <button className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium shadow hover:scale-105 hover:shadow-lg transition">
              Đăng nhập / Đăng ký
            </button>
          </Link>
        ) : (
          <div className="flex items-center gap-3">

            <Link
              href="/profile"
              className="font-medium text-blue-600 hover:underline"
            >
              {user.name}
            </Link>

            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
            >
              Logout
            </button>

          </div>
        )}

      </div>

    </div>
  );
}