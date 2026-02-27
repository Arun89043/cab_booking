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

  //add return here
  return (
  <div className="min-h-screen flex bg-gradient-to-br from-black via-gray-900 to-black">

    {/* LEFT */}
    <div className="w-full lg:w-1/2 flex items-center justify-center px-6 lg:px-20">

      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-fadeIn">

        <div className="bg-gradient-to-r from-yellow-400 to-amber-500 text-black text-center py-4 font-semibold tracking-wide">
          CAB BOOKING SYSTEM
        </div>

        <div className="p-10">

          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome Back 🚗
          </h2>

          <p className="text-gray-500 mb-8 text-sm">
            Login to access your dashboard
          </p>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-600 p-3 rounded-xl text-sm mb-6 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">

            <div className="relative">
              <Mail className="absolute left-4 top-4 text-gray-400" size={18}/>
              <input
                type="email"
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 bg-gray-50
                focus:border-yellow-500 focus:ring-2 focus:ring-yellow-400/40 outline-none transition"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-4 text-gray-400" size={18}/>
              <input
                type="password"
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 bg-gray-50
                focus:border-yellow-500 focus:ring-2 focus:ring-yellow-400/40 outline-none transition"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl font-semibold transition-all duration-300
                ${loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-yellow-400 to-amber-500 text-black hover:scale-[1.03]"
                }`}
            >
              {loading ? "Logging in..." : "Login"}
            </button>

          </form>

          <div className="text-center text-xs text-gray-500 mt-8">
            🔐 Secure Cab Booking System
          </div>

        </div>
      </div>
    </div>

    {/* RIGHT */}
    <div className="hidden lg:block lg:w-1/2 relative">

      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/cab-hero.png')"
        }}
      ></div>

      <div className="absolute inset-0 bg-black/60"></div>

      <div className="relative z-10 flex items-end h-full p-20">
        <div className="text-white max-w-lg">
          <h3 className="text-4xl font-bold mb-6">
            Premium Outstation & City Rides
          </h3>
          <p className="text-gray-300">
            Experience safe, reliable and comfortable cab booking
            with transparent pricing and 24/7 support.
          </p>
        </div>
      </div>

    </div>

  </div>
)


}