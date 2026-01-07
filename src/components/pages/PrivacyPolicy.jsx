"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Shield, Lock, Eye, FileText, Users, AlertCircle } from "lucide-react"
import { getPrivacyPolicy } from "../../services/operations/pagesAPI"

const iconMap = {
  FileText,
  Lock,
  Shield,
  Users,
  Eye,
  AlertCircle,
}

export default function PrivacyPolicy() {
  const [policy, setPolicy] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getPrivacyPolicy()
        setPolicy(res)
      } catch (err) {
        console.error("Failed to load privacy policy", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800">Loading your PrivacyPolicy ...</h2>
          <p className="text-gray-600">Please wait while we process your privacypolicy</p>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 sm:mb-12 md:mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center bg-gradient-to-r from-purple-100 to-pink-100 rounded-full px-4 sm:px-6 py-2 sm:py-3 mb-4 sm:mb-6"
          >
            <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 mr-2" />
            <span className="text-sm sm:text-base text-purple-600 font-semibold">Privacy & Security</span>
          </motion.div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
            Privacy{" "}
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
              Policy
            </span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Your privacy is important to us. This policy explains how we collect, use, and protect your information when
            you use our educational platform.
          </p>
          <p className="text-xs sm:text-sm text-gray-500 mt-2 sm:mt-4">Last updated: {new Date().toLocaleDateString()}</p>
        </motion.div>

        {/* Content Sections */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
          className="grid gap-4 sm:gap-6 md:gap-8 max-w-4xl mx-auto"
        >
         {policy?.sections?.map((section, index) => {
          const Icon = iconMap[section.icon] || FileText
        
          return (
            <motion.div
              key={index}
              variants={{
                hidden: { opacity: 0, y: 50 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.6 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20"
            >
              <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-2 sm:mb-4">{section.title}</h2>
                  <p className="text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed">{section.content}</p>
                </div>
              </div>
            </motion.div>
          )
        })}
 
         </motion.div>
 
         {/* Contact Section */}
         <motion.div
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-8 sm:mt-12 md:mt-16 bg-white/60 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 max-w-2xl mx-auto"
        >
          <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-2 sm:mb-4">Questions About Privacy?</h3>
          <p className="text-xs sm:text-sm md:text-base text-gray-600 mb-4 sm:mb-6">
            If you have any questions about this Privacy Policy or our data practices, please don't hesitate to contact
            us.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.href = "/contact-us"}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 rounded-xl sm:rounded-2xl font-semibold shadow-lg sm:shadow-xl hover:shadow-2xl transition-all duration-300 text-sm sm:text-base"
          >
            Contact Support
          </motion.button>
        </motion.div>
      </div>
    </div>
  )
}