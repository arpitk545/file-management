"use client"

import { useLocation, useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import { logout } from "../../../services/operations/authAPI"
import { motion } from "framer-motion"
import { LogOut, ArrowLeft, ShieldAlert } from "lucide-react"

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

  const handleConfirmLogout = () => {
    dispatch(logout(navigate))
    navigate("/")
  }

  return (
    <div className="fixed inset-0 bg-[#1c1c1e]/40 backdrop-blur-sm p-4 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-2xl border border-[#c7cad5] shadow-xl p-6 sm:p-8 max-w-md w-full text-center space-y-6"
      >
        {/* Top Badge & Icon */}
        <div className="space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-[#fbd4d4] border border-[#e3c5c5] text-[#800000] flex items-center justify-center mx-auto shadow-sm">
            <LogOut className="w-6 h-6" />
          </div>
          <div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#ffd02f] text-[#1c1c1e]">
              SIGN OUT
            </span>
          </div>
        </div>

        {/* Text Content */}
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1c1c1e]">
            Are you sure you want to logout?
          </h2>
          <p className="text-xs sm:text-sm text-[#555a6a] leading-relaxed max-w-xs mx-auto">
            You will be securely signed out of your current session and redirected to the home portal.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-2">
          <button
            type="button"
            onClick={handleStay}
            className="w-full sm:w-1/2 h-11 min-h-[44px] px-5 rounded-full bg-white border border-[#c7cad5] hover:bg-[#f7f8fa] hover:border-[#1c1c1e] text-[#1c1c1e] font-semibold text-xs sm:text-sm shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Stay Here</span>
          </button>

          <button
            type="button"
            onClick={handleConfirmLogout}
            className="w-full sm:w-1/2 h-11 min-h-[44px] px-5 rounded-full bg-[#fbd4d4] hover:bg-[#f9a9a9] border border-[#e3c5c5] text-[#800000] font-bold text-xs sm:text-sm shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Yes, Logout</span>
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default Logout