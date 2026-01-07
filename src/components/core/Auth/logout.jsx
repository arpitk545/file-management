"use client"

import { useLocation, useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import { logout } from "../../../services/operations/authAPI"
import { motion } from "framer-motion"

const Logout = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const location = useLocation()

  const handleStay = () => {
    if (location.pathname === "/dashboard") {
      navigate("/dashboard")
    } else {
      navigate(-1)
    }
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-white to-cyan-100/90 backdrop-blur-sm p-4 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 shadow-lg p-8 max-w-md w-full"
      >
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
          Are you sure you want to logout?
        </h2>

        <p className="text-gray-600 text-center mb-8">
          You will be logged out of your account and redirected to the home page.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full">
          <button
            onClick={() => {
              dispatch(logout(navigate))
              navigate("/")
            }}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-medium transition-all duration-300 shadow-sm hover:shadow-md"
          >
            Yes, Logout
          </button>

          <button
            onClick={handleStay}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-800 font-medium transition-all duration-300 border border-gray-300 shadow-sm hover:shadow-md"
          >
            No, Stay Here
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default Logout