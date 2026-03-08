"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type User = {
  name: string;
  email: string;
};

export default function Home() {

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

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-6">

      {/* CHƯA LOGIN */}
      {!user && (

        <div className="text-center max-w-2xl">

          <h1 className="text-5xl font-bold mb-4 text-gray-900">
            Welcome to <span className="text-blue-600">SciWrite</span> 👋
          </h1>

          <p className="text-gray-500 text-lg">
            Nền tảng hỗ trợ soạn thảo và quản lý bài báo nghiên cứu khoa học bằng AI.
          </p>

        </div>

      )}

      {/* ĐÃ LOGIN */}
      {user && (

        <>

          <div className="text-center mb-14 max-w-2xl">

            <h1 className="text-5xl font-bold mb-4 text-gray-900">
              Welcome back <span className="text-blue-600">{user.name}</span> 👋
            </h1>

            <p className="text-gray-500 text-lg">
              Continue working on your research papers.
            </p>

          </div>


          {/* CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">

            {/* New Paper */}
            <Link href="/write-paper">

              <div className="p-8 rounded-2xl 
              bg-blue-50
              border border-blue-100
              hover:scale-105 hover:shadow-lg
              transition cursor-pointer">

                <div className="text-3xl mb-3">📝</div>

                <h2 className="text-xl font-semibold mb-2 text-gray-800">
                  New Paper
                </h2>

                <p className="text-gray-500">
                  Tạo bài báo khoa học mới
                </p>

              </div>

            </Link>


            {/* Upload */}
            <div className="p-8 rounded-2xl 
            bg-purple-50
            border border-purple-100
            hover:scale-105 hover:shadow-lg
            transition cursor-pointer">

              <div className="text-3xl mb-3">📤</div>

              <h2 className="text-xl font-semibold mb-2 text-gray-800">
                Upload
              </h2>

              <p className="text-gray-500">
                Upload bản thảo của bạn
              </p>

            </div>


            {/* AI Tools */}
            <div className="p-8 rounded-2xl 
            bg-indigo-50
            border border-indigo-100
            hover:scale-105 hover:shadow-lg
            transition cursor-pointer">

              <div className="text-3xl mb-3">🤖</div>

              <h2 className="text-xl font-semibold mb-2 text-gray-800">
                AI Tools
              </h2>

              <p className="text-gray-500">
                Kiểm tra và cải thiện bài viết
              </p>

            </div>

          </div>

        </>

      )}

    </div>
  );
}