"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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

  const router = useRouter();

  const [isRegister, setIsRegister] = useState(defaultRegister);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");

  // LOGIN
const handleLogin = async () => {

  if (!email || !password) {
    alert("Vui lòng nhập email và mật khẩu");
    return;
  }

  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Đăng nhập thất bại");
      return;
    }

    // save user info to localStorage
    localStorage.setItem("user", JSON.stringify(data.user));

    // notify UI components (navbar, etc.)
    window.dispatchEvent(new Event("userChanged"));

    alert(data.message);

    router.push("/");

  } catch (error) {
    console.error(error);
    alert("Có lỗi xảy ra khi đăng nhập");
  }
};
  // REGISTER
  // Function responsible for handling the user registration process
const handleRegister = async () => {

  // 1. Validate required fields before sending request
  if (!username || !email || !password) {
    alert("Please fill all fields"); // Notify user if any field is missing
    return; // Stop execution
  }

  try {

    // 2. Send a POST request to the register API endpoint
    const res = await fetch("/api/auth/register", {
      method: "POST", // HTTP method used by the backend API
      headers: {
        "Content-Type": "application/json" // Indicate JSON request body
      },
      body: JSON.stringify({
        username, // Username provided by the user
        email,    // User email
        password  // User password
      })
    });

    // 3. Parse the JSON response returned by the server
    const data = await res.json();

    // 4. Handle API error responses
    if (!res.ok) {
      alert(data.error); // Display backend error message
      return; // Stop further execution
    }

    // 5. Store user information locally after successful registration
    // This allows the frontend to track authentication state
    localStorage.setItem(
      "user",
      JSON.stringify({
        name: data.user.username, // Username returned from backend
        email: data.user.email    // Email returned from backend
      })
    );

    // 6. Dispatch a custom event to notify other components that
    // the user authentication state has changed
    window.dispatchEvent(new Event("userChanged"));

    // 7. Provide feedback to the user
    alert("Register success");

    // 8. Redirect the user to the homepage after successful registration
    router.push("/");

  } catch (err) {

    // 9. Handle unexpected errors (network failure, server crash, etc.)
    console.error(err); // Log error for debugging
    alert("Register failed"); // Notify the user
  }
};

  // GOOGLE LOGIN POPUP (GIỐNG CANVA)
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
    <div className="flex items-center justify-center h-screen bg-gray-200">

      <div className="relative w-[900px] h-[550px] bg-white rounded-2xl shadow-xl overflow-hidden flex">

        {/* LOGIN FORM */}
        <div className={`w-1/2 p-12 flex flex-col justify-center transition-all duration-700 ${isRegister ? "-translate-x-full opacity-0" : "translate-x-0"}`}>

          <h1 className="text-4xl font-bold mb-8 text-center">
            Login
          </h1>

          <div className="relative mb-4">
            <FaUser className="absolute left-3 top-4 text-gray-400" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
              className="w-full pl-10 p-3 border rounded bg-gray-100 focus:outline-none"
            />
          </div>

          <div className="relative mb-4">
            <FaLock className="absolute left-3 top-4 text-gray-400" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e)=>setPassword(e.target.value)}
              className="w-full pl-10 p-3 border rounded bg-gray-100 focus:outline-none"
            />
          </div>

          <button
            onClick={handleLogin}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white p-3 rounded-lg font-semibold shadow-md hover:opacity-90"
          >
            Login
          </button>

          <p className="text-center text-sm text-gray-500 mt-6">
            or login with social platforms
          </p>

          <div className="flex justify-center gap-4 mt-4">

            <button
              onClick={handleGoogle}
              className="border p-3 rounded-full hover:bg-gray-100 transition"
            >
              <FaGoogle />
            </button>

            <button className="border p-3 rounded-full hover:bg-gray-100 transition">
              <FaFacebookF />
            </button>

            <button className="border p-3 rounded-full hover:bg-gray-100 transition">
              <FaGithub />
            </button>

            <button className="border p-3 rounded-full hover:bg-gray-100 transition">
              <FaLinkedinIn />
            </button>

          </div>

        </div>


        {/* REGISTER FORM */}
        <div className={`w-1/2 p-12 flex flex-col justify-center transition-all duration-700 ${isRegister ? "translate-x-0" : "translate-x-full opacity-0"}`}>

          <h1 className="text-4xl font-bold mb-8 text-center">
            Register
          </h1>

          <div className="relative mb-4">
            <FaUser className="absolute left-3 top-4 text-gray-400" />
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e)=>setUsername(e.target.value)}
              className="w-full pl-10 p-3 border rounded bg-gray-100 focus:outline-none"
            />
          </div>

          <div className="relative mb-4">
            <FaUser className="absolute left-3 top-4 text-gray-400" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
              className="w-full pl-10 p-3 border rounded bg-gray-100 focus:outline-none"
            />
          </div>

          <div className="relative mb-4">
            <FaLock className="absolute left-3 top-4 text-gray-400" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e)=>setPassword(e.target.value)}
              className="w-full pl-10 p-3 border rounded bg-gray-100 focus:outline-none"
            />
          </div>

          <button
            onClick={handleRegister}
            className="w-full bg-gradient-to-r from-teal-400 to-blue-500 text-white p-3 rounded-lg font-semibold shadow-md hover:opacity-90"
          >
            Register
          </button>

          <p className="text-center text-sm text-gray-500 mt-6">
            or register with social platforms
          </p>

          <div className="flex justify-center gap-4 mt-4">

            <button
              onClick={handleGoogle}
              className="border p-3 rounded-full hover:bg-gray-100 transition"
            >
              <FaGoogle />
            </button>

            <button className="border p-3 rounded-full hover:bg-gray-100 transition">
              <FaFacebookF />
            </button>

            <button className="border p-3 rounded-full hover:bg-gray-100 transition">
              <FaGithub />
            </button>

            <button className="border p-3 rounded-full hover:bg-gray-100 transition">
              <FaLinkedinIn />
            </button>

          </div>

        </div>


        {/* SLIDING PANEL */}
        <div className={`absolute top-0 w-1/2 h-full bg-gradient-to-r from-teal-400 to-blue-500 text-white flex flex-col items-center justify-center text-center p-10 transition-all duration-700 ${isRegister ? "left-0" : "left-1/2"}`}>

          {isRegister ? (
            <>
              <h2 className="text-3xl font-semibold mb-4">
                Welcome Back!
              </h2>

              <p className="mb-6 text-sm opacity-90">
                Already have an account?
              </p>

              <button
                onClick={() => setIsRegister(false)}
                className="border border-white px-8 py-2 rounded-full hover:bg-white hover:text-blue-500 transition"
              >
                Login
              </button>
            </>
          ) : (
            <>
              <h2 className="text-3xl font-semibold mb-4">
                Hello, Welcome!
              </h2>

              <p className="mb-6 text-sm opacity-90">
                Don’t have an account?
              </p>

              <button
                onClick={() => setIsRegister(true)}
                className="border border-white px-8 py-2 rounded-full hover:bg-white hover:text-blue-500 transition"
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