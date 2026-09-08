"use client"
import { useEffect } from "react"
import { motion } from "framer-motion"
import { AlertCircle } from "lucide-react"
import { Button } from "./button"
import { useNavigate } from "react-router-dom"

export function UnauthenticatedModal({ quizTitle, onClose }) {
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      navigate(-1) // Or navigate("/dashboard") for a fixed page
    }
  }, [navigate])

  const handleLogin = () => {
    localStorage.setItem("redirectAfterLogin", window.location.pathname)
    navigate("/login")
    onClose?.()
  }

  const handleHome = () => {
    navigate("/")
    onClose?.()
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 20, stiffness: 300 }}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-200 dark:border-gray-800"
      >
        <div className="p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-50 dark:bg-blue-900/30 mb-6">
            <AlertCircle className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Responses Saved Successfully
          </h3>
          
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Please login to view your results for <span className="font-medium text-gray-900 dark:text-white">"{quizTitle}"</span>. 
            Your progress has been securely stored.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <Button
              onClick={handleLogin}
              variant="default"
              className="w-full bg-blue-600 hover:bg-blue-700 focus-visible:ring-blue-500 shadow-lg shadow-blue-500/20"
            >
              Continue to Login
            </Button>
            
            <Button
              onClick={handleHome}
              variant="outline"
              className="w-full border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Return Home
            </Button>
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-800/50 px-6 py-4 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Your data will be available after login
          </p>
        </div>
      </motion.div>
    </div>
  )
}