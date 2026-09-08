"use client"

import { motion } from "framer-motion"
import { Brain } from "lucide-react" 
import { useNavigate } from "react-router-dom"

export default function NotFoundPage() {
  const router = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  const buttonVariants = {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-indigo-50 p-4 sm:p-6 lg:p-8">
      <motion.div
        className="flex flex-col items-center text-center max-w-md w-full space-y-6 sm:space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <Brain className="w-20 h-20 sm:w-24 sm:h-24 text-indigo-600 mx-auto mb-4" />
        </motion.div>

        <motion.h1
          className="text-8xl sm:text-9xl font-extrabold text-indigo-700 drop-shadow-lg"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            type: "spring",
            damping: 10,
            stiffness: 100,
            duration: 0.8,
          }}
        >
          404
        </motion.h1>

        <motion.h2 className="text-3xl sm:text-4xl font-bold text-gray-800" variants={itemVariants}>
          Page Not Found
        </motion.h2>

        <motion.p className="text-base sm:text-lg text-gray-600 leading-relaxed" variants={itemVariants}>
          Oops! The page you're looking for doesn’t exist. It might have been moved or deleted.
        </motion.p>

        <motion.div className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full justify-center" variants={itemVariants}>
          <motion.button
            className="w-full sm:w-auto px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200"
            onClick={() => router("/")}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            Go to Home
          </motion.button>

          <motion.button
            className="w-full sm:w-auto px-6 py-3 border-2 border-indigo-500 text-indigo-600 font-semibold rounded-lg shadow-md hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200"
            onClick={() => router("/login")}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            Login
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  )
}
