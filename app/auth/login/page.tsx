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
  const handleLogin = () => {

    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    localStorage.setItem(
      "user",
      JSON.stringify({
        name: "Demo User",
        email: email
      })
    );
    window.dispatchEvent(new Event("userChanged"));
    router.push("/");
  };

  // REGISTER
  const handleRegister = () => {

    if (!username || !email || !password) {
      alert("Please fill all fields");
      return;
    }

    localStorage.setItem(
      "user",
      JSON.stringify({
        name: username,
        email: email
      })
    );
    window.dispatchEvent(new Event("userChanged"));
    router.push("/");
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