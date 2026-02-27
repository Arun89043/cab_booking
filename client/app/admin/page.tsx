"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { motion } from "framer-motion"
import { Trash2, Search, Shield } from "lucide-react"
import toast, { Toaster } from "react-hot-toast"

export default function AdminPage() {

  const router = useRouter()
  const [rides, setRides] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [selectedRide, setSelectedRide] = useState<any>(null)

  useEffect(() => {
    const role = localStorage.getItem("role")
    if (role !== "ADMIN") {
      router.push("/login")
      return
    }
    fetchAllRides()
  }, [])

  const fetchAllRides = async () => {
    const token = localStorage.getItem("token")

    const res = await axios.get(
      "http://127.0.0.1:5000/api/admin/rides",
      { headers: { Authorization: `Bearer ${token}` } }
    )

    setRides(res.data.rides || [])
  }

  const confirmDelete = async () => {
    if (!selectedRide) return

    const token = localStorage.getItem("token")

    await axios.delete(
      `http://127.0.0.1:5000/api/admin/rides/${selectedRide._id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )

    toast.success("Ride deleted successfully")
    setSelectedRide(null)
    fetchAllRides()
  }

  const filteredRides = rides.filter((ride) =>
    ride.pickupAddress.toLowerCase().includes(search.toLowerCase()) ||
    ride.dropAddress.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Toaster />

      {/* Sidebar */}
      <div className="w-64 bg-white shadow-xl p-6 hidden md:block">
        <h2 className="text-2xl font-bold mb-10 flex items-center gap-2">
          <Shield /> Admin
        </h2>

        <ul className="space-y-4 text-gray-700 font-medium">
          <li className="hover:text-black cursor-pointer">Dashboard</li>
          <li className="hover:text-black cursor-pointer">Riders</li>
          <li className="hover:text-black cursor-pointer">Drivers</li>
          <li className="hover:text-black cursor-pointer">Ride Requests</li>
          <li className="hover:text-black cursor-pointer">Ride History</li>
          <li className="hover:text-black cursor-pointer">Payments</li>
          <li
            className="hover:text-red-600 cursor-pointer"
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
      <div className="flex-1 p-8">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>

          <div className="relative w-64">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18}/>
            <input
              type="text"
              placeholder="Search rides..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border rounded-xl focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4">Pickup</th>
                <th className="p-4">Drop</th>
                <th className="p-4">Status</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Fare</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRides.map((ride) => (
                <tr key={ride._id} className="border-b hover:bg-gray-50 transition">
                  <td className="p-4">{ride.pickupAddress}</td>
                  <td className="p-4">{ride.dropAddress}</td>
                  <td className="p-4">{ride.status}</td>
                  <td className="p-4">{ride.paymentStatus}</td>
                  <td className="p-4">₹{ride.finalFare}</td>
                  <td className="p-4">
                    <button
                      onClick={() => setSelectedRide(ride)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg flex items-center gap-1"
                    >
                      <Trash2 size={16}/> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredRides.length === 0 && (
            <p className="p-6 text-gray-500 text-center">
              No rides found.
            </p>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {selectedRide && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-sm"
          >
            <h2 className="text-xl font-bold mb-3 text-red-600">
              Confirm Deletion
            </h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this ride? This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setSelectedRide(null)}
                className="px-4 py-2 rounded-lg border"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
              >
                Confirm
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}