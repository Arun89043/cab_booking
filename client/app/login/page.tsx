"use client"

import { useState } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import { Mail, Lock } from "lucide-react"

export default function Login() {
  const [email, setEmail] = useState("arun@test.com")
  const [password, setPassword] = useState("123456")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleLogin = async (e: any) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        { email, password }
      )

      localStorage.setItem("token", res.data.token)
      localStorage.setItem("role", res.data.role)

      if (res.data.role === "RIDER") router.push("/rider")
      if (res.data.role === "DRIVER") router.push("/driver")
      if (res.data.role === "ADMIN") router.push("/admin")

    } catch (err: any) {
      setError("Invalid email or password ❌")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-bg min-h-screen flex items-center justify-center px-4">

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>

      {/* Card */}
      <div className="relative w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-8 sm:p-10 text-white animate-fadeIn">

        <h2 className="text-4xl font-bold text-center mb-3 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
          Welcome Back 🚗
        </h2>

        <p className="text-gray-300 text-center mb-8 text-sm">
          Login to access your dashboard
        </p>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded-xl text-sm mb-6 text-center animate-pulse">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">

          {/* Email */}
          <div className="relative group">
            <Mail className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-yellow-400 transition-all" size={18}/>
            <input
              type="email"
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/10 border border-gray-600 text-white placeholder-gray-400 
              focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/40 focus:scale-[1.02]
              transition-all duration-300 outline-none shadow-inner"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password */}
          <div className="relative group">
            <Lock className="absolute left-4 top-3.5 text-gray-400 group-focus-within:text-yellow-400 transition-all" size={18}/>
            <input
              type="password"
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/10 border border-gray-600 text-white placeholder-gray-400 
              focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/40 focus:scale-[1.02]
              transition-all duration-300 outline-none shadow-inner"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-2xl font-semibold shadow-lg transition-all duration-300
              ${loading
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-gradient-to-r from-yellow-400 to-orange-500 hover:scale-105 active:scale-95 hover:brightness-110 text-black"
              }`}
          >
            {loading ? (
              <span className="flex justify-center items-center gap-2">
                <span className="animate-spin h-4 w-4 border-2 border-black border-t-transparent rounded-full"></span>
                Logging in...
              </span>
            ) : "Login"}
          </button>

        </form>

        <div className="text-center text-xs text-gray-400 mt-8 hover:text-gray-200 transition-all duration-300">
          🔐 Secure Cab Booking System
        </div>

      </div>
    </div>
  )
}