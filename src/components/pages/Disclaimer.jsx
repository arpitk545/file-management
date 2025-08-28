"use client"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { AlertTriangle, Info, BookOpen, Users, Shield, ExternalLink } from "lucide-react"
import { getDisclaimer } from "../../services/operations/pagesAPI"
const iconMap = {
  Info: Info,
  BookOpen: BookOpen,
  Users: Users,
  Shield: Shield,
  ExternalLink: ExternalLink,
  AlertTriangle: AlertTriangle,
}

export default function Disclaimer() {
  const [disclaimer, setDisclaimer] = useState(null)
  const [loading, setLoading] = useState(true)

  const disclaimerSections = disclaimer ? disclaimer.sections.map(section => ({
    ...section,
    icon: iconMap[section.icon] || Info, 
  })) : []

  useEffect(() => {
    const fetchDisclaimer = async () => {
      try {
        const res = await getDisclaimer()
        setDisclaimer(res) 
      } catch (error) {
        console.error("Failed to fetch disclaimer:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDisclaimer()
  }, [])
  
  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800">Loading our Disclaimer...</h2>
          <p className="text-gray-600">Please wait while we process our disclaimer</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 overflow-auto bg-gradient-to-br from-orange-200 via-red-200 to-pink-200 ">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center bg-gradient-to-r from-orange-100 to-red-100 rounded-full px-6 py-3 mb-6"
          >
            <AlertTriangle className="h-5 w-5 text-orange-600 mr-2" />
            <span className="text-orange-600 font-semibold">Important Notice</span>
          </motion.div>

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            <span className="bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent">
              {disclaimer?.header?.title}
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {disclaimer?.header?.description}
          </p>
          <p className="text-sm text-gray-500 mt-4">Effective Date: {new Date().toLocaleDateString()}</p>
        </motion.div>

        {/* Disclaimer Sections */}
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
          className="grid gap-6 md:gap-8 max-w-4xl mx-auto"
        >
          {disclaimerSections.map((section, index) => (
            <motion.div
              key={index}
              variants={{
                hidden: { opacity: 0, y: 50 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.6 }}
              className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20"
            >
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <section.icon className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">{section.title}</h2>
                  <p className="text-gray-600 leading-relaxed text-sm md:text-base">{section.content}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Important Notice */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-12 md:mt-16 bg-gradient-to-r from-orange-100 to-red-100 rounded-3xl p-6 md:p-8 max-w-4xl mx-auto border-l-4 border-orange-500"
        >
          <div className="flex items-start space-x-4">
            <AlertTriangle className="h-8 w-8 text-orange-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">Important Reminder</h3>
              <p className="text-gray-700 leading-relaxed text-sm md:text-base mb-4">
                This disclaimer is subject to change without notice. We recommend reviewing this page periodically to
                stay informed of any updates. Your continued use of our platform constitutes acceptance of any changes
                to this disclaimer.
              </p>
              <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                If you do not agree with any part of this disclaimer, please discontinue use of our platform
                immediately.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="text-center mt-12 md:mt-16 bg-white/60 backdrop-blur-sm rounded-3xl p-6 md:p-8 max-w-2xl mx-auto"
        >
          <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">Questions or Concerns?</h3>
          <p className="text-gray-600 mb-6 text-sm md:text-base">
            If you have any questions about this disclaimer or need clarification on any points, please contact our
            support team.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.href = "/contact-us"}
            className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 md:px-8 py-3 md:py-4 rounded-2xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300"
          >
            Contact Support
          </motion.button>
        </motion.div>
      </div>
    </div>
  )
}
