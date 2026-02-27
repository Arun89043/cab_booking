"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { motion } from "framer-motion"
import { Car, CheckCircle, Clock, CreditCard, Star } from "lucide-react"
import toast, { Toaster } from "react-hot-toast"

export default function RiderPage() {

  const [riderRides, setRiderRides] = useState<any[]>([])
  const [locations, setLocations] = useState<any[]>([])
  const [startLocation, setStartLocation] = useState("")
  const [endLocation, setEndLocation] = useState("")
  const [showRideForm, setShowRideForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [processingPayment, setProcessingPayment] = useState(false)

  useEffect(() => {
    fetchRiderHistory()
    fetchLocations()
  }, [])

  const fetchLocations = async () => {
    const res = await axios.get("http://127.0.0.1:5000/api/locations")
    setLocations(res.data.locations || [])
  }

  const fetchRiderHistory = async () => {
    const token = localStorage.getItem("token")
    const res = await axios.get(
      "http://127.0.0.1:5000/api/rides/history",
      { headers: { Authorization: `Bearer ${token}` } }
    )
    setRiderRides(res.data.rides || [])
    setLoading(false)
  }

  const createRide = async () => {
    if (!startLocation || !endLocation) {
      toast.error("Select both locations")
      return
    }

    const token = localStorage.getItem("token")

    await axios.post(
      "http://127.0.0.1:5000/api/rides/create",
      {
        pickupAddress: startLocation,
        dropAddress: endLocation,
        fare: 500
      },
      { headers: { Authorization: `Bearer ${token}` } }
    )

    toast.success("Ride Requested 🚗")
    setShowRideForm(false)
    setStartLocation("")
    setEndLocation("")
    fetchRiderHistory()
  }

  const payRide = async (id: string) => {
    try {
      setProcessingPayment(true)

      const token = localStorage.getItem("token")

      await axios.put(
        `http://127.0.0.1:5000/api/rides/pay/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )

      toast.success("Payment Successful 💰")
      fetchRiderHistory()

    } catch (error) {
      toast.error("Payment Failed ❌")
    } finally {
      setProcessingPayment(false)
    }
  }

  const currentRide = riderRides.find(
    (ride) => ride.status !== "COMPLETED" || ride.paymentStatus !== "PAID"
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white p-8">
      <Toaster />

      <h1 className="text-3xl font-bold mb-8">Rider Dashboard 🚗</h1>

      {/* Request Ride Button */}
      <button
        onClick={() => setShowRideForm(!showRideForm)}
        className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-3 rounded-xl font-semibold shadow-lg mb-6"
      >
        Request Ride
      </button>

      {/* Ride Form */}
      {showRideForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-lg border border-white/20 p-6 rounded-2xl w-full max-w-md mb-10"
        >
          <select
            value={startLocation}
            onChange={(e) => setStartLocation(e.target.value)}
            className="w-full p-3 rounded bg-gray-800 mb-3"
          >
            <option value="">Start Location</option>
            {locations.map((loc) => (
              <option key={loc._id} value={loc.name}>
                {loc.name}
              </option>
            ))}
          </select>

          <select
            value={endLocation}
            onChange={(e) => setEndLocation(e.target.value)}
            className="w-full p-3 rounded bg-gray-800 mb-4"
          >
            <option value="">End Location</option>
            {locations
              .filter((loc) => loc.name !== startLocation)
              .map((loc) => (
                <option key={loc._id} value={loc.name}>
                  {loc.name}
                </option>
              ))}
          </select>

          <button
            onClick={createRide}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-black p-3 rounded-xl font-bold"
          >
            Confirm Ride
          </button>
        </motion.div>
      )}

      {/* Current Ride Card */}
      {currentRide && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-xl mb-10"
        >
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Car /> Current Ride
          </h2>

          <p className="text-lg font-medium">
            {currentRide.pickupAddress} → {currentRide.dropAddress}
          </p>

          <div className="mt-4 flex items-center gap-3">
            {currentRide.status === "REQUESTED" && (
              <span className="bg-gray-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                <Clock size={16}/> Searching Driver
              </span>
            )}

            {currentRide.status === "ACCEPTED" && (
              <span className="bg-blue-600 px-3 py-1 rounded-full text-sm">
                Driver Assigned 🚘
              </span>
            )}

            {currentRide.status === "STARTED" && (
              <span className="bg-orange-500 px-3 py-1 rounded-full text-sm">
                Ride Started
              </span>
            )}

            {currentRide.status === "COMPLETED" && (
              <span className="bg-green-600 px-3 py-1 rounded-full text-sm">
                Ride Completed
              </span>
            )}
          </div>

          {/* Payment Section */}
          {currentRide.status === "COMPLETED" &&
            currentRide.paymentStatus === "PENDING" && (
              <button
                onClick={() => payRide(currentRide._id)}
                disabled={processingPayment}
                className="mt-5 bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-3 rounded-xl font-bold flex items-center gap-2"
              >
                <CreditCard size={18} />
                {processingPayment ? "Processing..." : "Pay Now"}
              </button>
            )}

          {currentRide.paymentStatus === "PAID" && (
            <div className="mt-5 text-green-400 flex items-center gap-2">
              <CheckCircle size={20}/> Payment Completed
            </div>
          )}
        </motion.div>
      )}

      {/* Ride History */}
      <h2 className="text-xl font-semibold mb-4">Ride History</h2>

      {loading ? (
        <p>Loading...</p>
      ) : (
        riderRides.map((ride) => (
  <div
    key={ride._id}
    className="bg-gray-800 p-4 rounded-xl mb-3 flex justify-between items-center"
  >
    <div>
      <p className="font-semibold">
        {ride.pickupAddress} → {ride.dropAddress}
      </p>
      <p className="text-sm text-gray-400">
        Status: {ride.status} | Payment: {ride.paymentStatus}
      </p>
    </div>

    {ride.status === "COMPLETED" &&
      ride.paymentStatus === "PENDING" && (
        <button
          onClick={() => payRide(ride._id)}
          className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-lg font-semibold"
        >
          Pay Now 💳
        </button>
      )}
  </div>
))
      )}
    </div>
  )
}