"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { motion } from "framer-motion"
import { Car, CheckCircle, Clock, DollarSign } from "lucide-react"
import toast, { Toaster } from "react-hot-toast"

export default function DriverPage() {
  const router = useRouter()
  const [availableRides, setAvailableRides] = useState<any[]>([])
  const [activeRide, setActiveRide] = useState<any>(null)
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    const role = localStorage.getItem("role")
    if (role !== "DRIVER") {
      router.push("/login")
      return
    }
    fetchAvailableRides()
  }, [])

  useEffect(() => {
  if (activeRide?.status === "COMPLETED") {

    const interval = setInterval(() => {
      refreshActiveRide()
    }, 3000) // refresh every 3 seconds

    return () => clearInterval(interval)
  }
}, [activeRide])

  const fetchAvailableRides = async () => {
    try {
      const token = localStorage.getItem("token")
      const res = await axios.get(
        "http://127.0.0.1:5000/api/rides/available",
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setAvailableRides(res.data.rides || [])
    } catch {
      setAvailableRides([])
    }
  }

  const acceptRide = async (rideId: string) => {
    const token = localStorage.getItem("token")

    const res = await axios.put(
      `http://127.0.0.1:5000/api/rides/accept/${rideId}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    )

    setActiveRide(res.data.ride)
    setAvailableRides(prev => prev.filter(r => r._id !== rideId))
    toast.success("Ride Accepted 🚗")
  }

  const startRide = async () => {
    const token = localStorage.getItem("token")

    await axios.put(
      `http://127.0.0.1:5000/api/rides/start/${activeRide._id}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    )

    setActiveRide({ ...activeRide, status: "STARTED" })
    toast("Ride Started 🚘")
  }

 const refreshActiveRide = async () => {
  if (!activeRide) return

  try {
    const token = localStorage.getItem("token")

    const res = await axios.get(
      `http://127.0.0.1:5000/api/rides/${activeRide._id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )

    setActiveRide(res.data.ride)

  } catch (error) {
    console.log("Refresh error")
  }
}


  const completeRide = async () => {
    const token = localStorage.getItem("token")

    await axios.put(
      `http://127.0.0.1:5000/api/rides/complete/${activeRide._id}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    )

    setActiveRide({ ...activeRide, status: "COMPLETED" })
    toast.success("Ride Completed 🏁")
  }
 



  const getStatusStep = () => {
    if (!activeRide) return 0
    if (activeRide.status === "ACCEPTED") return 1
    if (activeRide.status === "STARTED") return 2
    if (activeRide.status === "COMPLETED") return 3
    return 0
  }

  const step = getStatusStep()

  return (
    <div className="min-h-screen bg-black text-white flex">
      <Toaster position="top-right" />

      {/* Sidebar */}
      <div className="w-64 bg-gradient-to-b from-yellow-500 to-yellow-600 text-black p-6">
        <h2 className="text-2xl font-bold mb-8">🚖 Driver</h2>
        <ul className="space-y-4 font-semibold">
          <li>Dashboard</li>
          <li>Ride History</li>
          <li>Earnings</li>
          <li>Profile</li>
          <li
            className="cursor-pointer"
            onClick={() => {
              localStorage.clear()
              router.push("/login")
            }}
          >
            Logout
          </li>
        </ul>
      </div>

      {/* Main */}
      <div className="flex-1 p-10">

        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold">Driver Dashboard</h1>
          <button
            onClick={() => setIsOnline(!isOnline)}
            className={`px-4 py-2 rounded-full font-semibold transition ${
              isOnline
                ? "bg-green-500"
                : "bg-gray-600"
            }`}
          >
            {isOnline ? "Online" : "Offline"}
          </button>
        </div>

        {!activeRide && (
          <>
            <h2 className="text-xl mb-4">Available Rides</h2>

            {availableRides.length === 0 && (
              <p className="text-gray-400">No rides available</p>
            )}

            <div className="grid gap-6">
              {availableRides.map((ride) => (
                <motion.div
                  key={ride._id}
                  whileHover={{ scale: 1.03 }}
                  className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl shadow-lg border border-white/10"
                >
                  <p className="text-lg font-semibold">
                    {ride.pickupAddress} → {ride.dropAddress}
                  </p>
                  <p className="text-yellow-400 font-bold mt-2">
                    ₹{ride.fare}
                  </p>

                  <button
                    onClick={() => acceptRide(ride._id)}
                    className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-black px-5 py-2 rounded-xl font-bold"
                  >
                    Accept Ride
                  </button>
                </motion.div>
              ))}
            </div>
          </>
        )}

        {activeRide && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/10"
          >
            <h2 className="text-2xl font-bold mb-6">Active Ride</h2>

            <p className="text-lg mb-2">
              {activeRide.pickupAddress} → {activeRide.dropAddress}
            </p>

            {/* Stepper */}
            <div className="flex items-center justify-between mt-6 mb-6">
              <CheckCircle color={step >= 1 ? "lime" : "gray"} />
              <Car color={step >= 2 ? "lime" : "gray"} />
              <Clock color={step >= 3 ? "lime" : "gray"} />
              <DollarSign color={activeRide.paymentStatus === "PAID" ? "lime" : "gray"} />
            </div>

            <p className="mb-4">
              Status: <span className="text-yellow-400 font-bold">{activeRide.status}</span>
            </p>

            {activeRide.status === "ACCEPTED" && (
              <button
                onClick={startRide}
                className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-2 rounded-xl font-bold"
              >
                Start Ride
              </button>
            )}

            {activeRide.status === "STARTED" && (
              <button
                onClick={completeRide}
                className="bg-red-500 hover:bg-red-600 px-6 py-2 rounded-xl font-bold"
              >
                Complete Ride
              </button>
            )}

         {activeRide.status === "COMPLETED" && (
  <div className="mt-4 space-y-2">

    {activeRide.paymentStatus === "PENDING" && (
      <p className="text-yellow-400 font-semibold">
        Waiting for Rider Payment...
      </p>
    )}

    {activeRide.paymentStatus === "PAID" && (
      <>
        <p className="text-green-500 font-bold text-lg">
          Ride Completed Successfully ✅
        </p>

        <p className="text-green-400 font-semibold">
          💰 Payment Status: PAID
        </p>
      </>
    )}

    <p>
      <span className="font-semibold">Ride Status:</span>{" "}
      {activeRide.status}
    </p>

    <p>
      <span className="font-semibold">Payment Status:</span>{" "}
      <span className={`font-bold ${
        activeRide.paymentStatus === "PAID"
          ? "text-green-400"
          : "text-red-400"
      }`}>
        {activeRide.paymentStatus}
      </span>
    </p>

  </div>
)}
          </motion.div>
        )}
      </div>
    </div>
  )
}