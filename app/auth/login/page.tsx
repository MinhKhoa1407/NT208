"use client";

import { useState } from "react";
// 🚨 THAY THẾ: Sử dụng useSearchParams để lấy dữ liệu từ URL (?returnUrl=...)
import { useSearchParams } from "next/navigation";
import {
  FaUser,
  FaLock,
  FaGoogle,
  FaFacebookF,
  FaGithub,
  FaLinkedinIn
} from "react-icons/fa";

type Props = {
  defaultRegister?: boolean;
};

export default function LoginPage({ defaultRegister = false }: Props) {
  // 🚨 KHAI BÁO: Lấy các tham số trên thanh địa chỉ trình duyệt
  const searchParams = useSearchParams();
  // Nếu có returnUrl thì lấy, không có thì mặc định sau khi login sẽ vào trang chủ "/"
  const returnUrl = searchParams.get("returnUrl") || "/";

  const [isRegister, setIsRegister] = useState(defaultRegister);
  const [loading, setLoading] = useState(false); // Trạng thái chờ xử lý API

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");

  // ==================== XỬ LÝ ĐĂNG NHẬP ====================
  const handleLogin = async () => {
    if (!email || !password) {
      alert("Vui lòng nhập email và mật khẩu");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Đăng nhập thất bại");
        return;
      }

      // 1. Tạo Cookie Đăng nhập ở client ngay lập tức để đồng bộ với Middleware
      document.cookie = "isLoggedIn=true; path=/; max-age=86400"; // Hạn 1 ngày

      // 2. Lưu thông tin user vào localStorage
      localStorage.setItem("user", JSON.stringify(data.user));

      // 3. Thông báo cho các component khác (Navbar, sidebar...) cập nhật trạng thái
      window.dispatchEvent(new Event("userChanged"));

      alert(data.message || "Đăng nhập thành công!");
      
      // 4. 🚨 THAY THẾ QUAN TRỌNG: Điều hướng cứng về trang định vào thay vì đẩy về "/"
      window.location.href = returnUrl;
      
    } catch (error) {
      console.error(error);
      alert("Có lỗi xảy ra khi đăng nhập");
    } finally {
      setLoading(false);
    }
  };

  // ==================== XỬ LÝ ĐĂNG KÝ (KHÔNG CẦN VERIFY EMAIL) ====================
  const handleRegister = async () => {
    if (!username || !email || !password) {
      alert("Vui lòng điền đầy đủ tất cả các trường!");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Đăng ký thất bại");
        return;
      }

      alert("Đăng ký tài khoản thành công! Bạn có thể tiến hành đăng nhập ngay lập tức.");

      setIsRegister(false);
      setPassword(""); 
      setUsername(""); 
      
    } catch (err) {
      console.error(err);
      alert("Đăng ký thất bại, hệ thống đang bận vui lòng thử lại sau!");
    } finally {
      setLoading(false);
    }
  };

  // GOOGLE LOGIN POPUP
  const handleGoogle = () => {
    const width = 500;
    const height = 600;

    const left = window.innerWidth / 2 - width / 2;
    const top = window.innerHeight / 2 - height / 2;

    window.open(
      "https://accounts.google.com/signin",
      "Google Login",
      `width=${width},height=${height},top=${top},left=${left}`
    );
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-200 select-none">
      <div className="relative w-[900px] h-[550px] bg-white rounded-2xl shadow-xl overflow-hidden flex">
        
        {/* LOGIN FORM */}
        <form 
          onSubmit={(e) => { e.preventDefault(); handleLogin(); }}
          className={`w-1/2 p-12 flex flex-col justify-center transition-all duration-700 ${
            isRegister ? "-translate-x-full opacity-0 pointer-events-none" : "translate-x-0 z-10"
          }`}
        >
          <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">Login</h1>

          <div className="relative mb-4">
            <FaUser className="absolute left-3 top-4 text-gray-400" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="w-full pl-10 p-3 border rounded bg-gray-100 focus:outline-none focus:bg-white focus:border-blue-500 transition disabled:opacity-60"
            />
          </div>

          <div className="relative mb-4">
            <FaLock className="absolute left-3 top-4 text-gray-400" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="w-full pl-10 p-3 border rounded bg-gray-100 focus:outline-none focus:bg-white focus:border-blue-500 transition disabled:opacity-60"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white p-3 rounded-lg font-semibold shadow-md hover:opacity-90 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Processing..." : "Login"}
          </button>

          <p className="text-center text-sm text-gray-500 mt-6">
            or login with social platforms
          </p>

          <div className="flex justify-center gap-4 mt-4">
            <button
              type="button"
              onClick={handleGoogle}
              disabled={loading}
              className="border p-3 rounded-full hover:bg-gray-100 transition disabled:opacity-50"
            >
              <FaGoogle />
            </button>
            <button type="button" disabled={loading} className="border p-3 rounded-full hover:bg-gray-100 transition disabled:opacity-50">
              <FaFacebookF />
            </button>
            <button type="button" disabled={loading} className="border p-3 rounded-full hover:bg-gray-100 transition disabled:opacity-50">
              <FaGithub />
            </button>
            <button type="button" disabled={loading} className="border p-3 rounded-full hover:bg-gray-100 transition disabled:opacity-50">
              <FaLinkedinIn />
            </button>
          </div>
        </form>

        {/* REGISTER FORM */}
        <form 
          onSubmit={(e) => { e.preventDefault(); handleRegister(); }}
          className={`w-1/2 p-12 flex flex-col justify-center transition-all duration-700 ${
            isRegister ? "translate-x-0 z-10" : "translate-x-full opacity-0 pointer-events-none"
          }`}
        >
          <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">Register</h1>

          <div className="relative mb-4">
            <FaUser className="absolute left-3 top-4 text-gray-400" />
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              className="w-full pl-10 p-3 border rounded bg-gray-100 focus:outline-none focus:bg-white focus:border-teal-500 transition disabled:opacity-60"
            />
          </div>

          <div className="relative mb-4">
            <FaUser className="absolute left-3 top-4 text-gray-400" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="w-full pl-10 p-3 border rounded bg-gray-100 focus:outline-none focus:bg-white focus:border-teal-500 transition disabled:opacity-60"
            />
          </div>

          <div className="relative mb-4">
            <FaLock className="absolute left-3 top-4 text-gray-400" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="w-full pl-10 p-3 border rounded bg-gray-100 focus:outline-none focus:bg-white focus:border-teal-500 transition disabled:opacity-60"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-teal-400 to-blue-500 text-white p-3 rounded-lg font-semibold shadow-md hover:opacity-90 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating Account..." : "Register"}
          </button>

          <p className="text-center text-sm text-gray-500 mt-6">
            or register with social platforms
          </p>

          <div className="flex justify-center gap-4 mt-4">
            <button
              type="button"
              onClick={handleGoogle}
              disabled={loading}
              className="border p-3 rounded-full hover:bg-gray-100 transition disabled:opacity-50"
            >
              <FaGoogle />
            </button>
            <button type="button" disabled={loading} className="border p-3 rounded-full hover:bg-gray-100 transition disabled:opacity-50">
              <FaFacebookF />
            </button>
            <button type="button" disabled={loading} className="border p-3 rounded-full hover:bg-gray-100 transition disabled:opacity-50">
              <FaGithub />
            </button>
            <button type="button" disabled={loading} className="border p-3 rounded-full hover:bg-gray-100 transition disabled:opacity-50">
              <FaLinkedinIn />
            </button>
          </div>
        </form>

        {/* SLIDING PANEL */}
        <div className={`absolute top-0 w-1/2 h-full bg-gradient-to-r from-teal-400 to-blue-500 text-white flex flex-col items-center justify-center text-center p-10 transition-all duration-700 z-20 ${
          isRegister ? "left-0" : "left-1/2"
        }`}>
          {isRegister ? (
            <>
              <h2 className="text-3xl font-semibold mb-4">Welcome Back!</h2>
              <p className="mb-6 text-sm opacity-90">Already have an account?</p>
              <button
                type="button"
                onClick={() => setIsRegister(false)}
                disabled={loading}
                className="border border-white px-8 py-2 rounded-full hover:bg-white hover:text-teal-500 font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Login
              </button>
            </>
          ) : (
            <>
              <h2 className="text-3xl font-semibold mb-4">Hello, Welcome!</h2>
              <p className="mb-6 text-sm opacity-90">Don’t have an account?</p>
              <button
                type="button"
                onClick={() => setIsRegister(true)}
                disabled={loading}
                className="border border-white px-8 py-2 rounded-full hover:bg-white hover:text-blue-500 font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Register
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
}