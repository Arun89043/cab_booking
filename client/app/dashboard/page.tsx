"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function Dashboard() {
  const router = useRouter()

  useEffect(() => {
    const role = localStorage.getItem("role")

    if (!role) {
      router.push("/login")
      return
    }

    if (role === "RIDER") router.push("/rider")
    if (role === "DRIVER") router.push("/driver")
    if (role === "ADMIN") router.push("/admin")
  }, [])

  return (
    <div className="flex justify-center items-center h-screen text-white bg-black">
      Redirecting...
    </div>
  )
}