"use client"

import { useEffect, useState } from "react"
import axios from "axios"

export default function BookRidePage() {

const [locations, setLocations] = useState([])
  const [startLocation, setStartLocation] = useState("")
  const [endLocation, setEndLocation] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/locations")
        setLocations(res.data.locations || [])
      } catch (error) {
        console.error("Failed to fetch locations:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchLocations()
  }, [])

  const handleSubmit = async () => {
    if (!startLocation || !endLocation) {
      alert("Please select both locations")
      return
    }

    try {
      setSubmitting(true)

      const token = localStorage.getItem("token")

      await axios.post(
        "http://localhost:5000/api/rides/create",
        {
          pickupAddress: startLocation,
          dropAddress: endLocation,
          fare: 500
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      alert("Ride Requested Successfully 🚗")

      setStartLocation("")
      setEndLocation("")

    } catch (error) {
      console.error("Ride creation failed:", error)
      alert("Failed to book ride ❌")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-10">
      <h1 className="text-3xl font-bold mb-6">Book a Ride 🚗</h1>

      {loading ? (
        <p>Loading locations...</p>
      ) : (
        <div className="space-y-4 max-w-md">

          <select
            value={startLocation}
            onChange={(e) => setStartLocation(e.target.value)}
            className="w-full p-3 rounded bg-gray-800 text-white"
          >
            <option value="">Select Start Location</option>
            {locations.map((loc) => (
              <option key={loc._id} value={loc.name}>
                {loc.name}
              </option>
            ))}
          </select>

          <select
            value={endLocation}
            onChange={(e) => setEndLocation(e.target.value)}
            className="w-full p-3 rounded bg-gray-800 text-white"
          >
            <option value="">Select End Location</option>
            {locations
              .filter((loc) => loc.name !== startLocation)
              .map((loc) => (
                <option key={loc._id} value={loc.name}>
                  {loc.name}
                </option>
              ))}
          </select>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className={`w-full p-3 rounded font-semibold ${
              submitting
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-600"
            }`}
          >
            {submitting ? "Booking..." : "Confirm Ride"}
          </button>

        </div>
      )}
    </div>
  )
}