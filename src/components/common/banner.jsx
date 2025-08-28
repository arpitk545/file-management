"use client"

import React from "react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, ExternalLink, Star, Zap, Gift } from "lucide-react"

export default function Banner() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const bannerAds = [
    {
      id: 1,
      title: "🚀 Premium Study Materials",
      subtitle: "Get 70% OFF on All Courses",
      description: "Access thousands of premium study materials, practice tests, and expert guidance",
      buttonText: "Claim Offer",
      gradient: "from-purple-600 to-pink-600",
      bgGradient: "from-purple-50 to-pink-50",
      icon: Star,
      offer: "Limited Time",
    },
    {
      id: 2,
      title: "⚡ AI-Powered Learning",
      subtitle: "Personalized Study Plans",
      description: "Let our AI create custom study schedules based on your learning patterns",
      buttonText: "Try Free",
      gradient: "from-blue-600 to-cyan-600",
      bgGradient: "from-blue-50 to-cyan-50",
      icon: Zap,
      offer: "New Feature",
    },
    {
      id: 3,
      title: "🎁 Refer & Earn",
      subtitle: "₹500 for Every Friend",
      description: "Invite friends and earn rewards. Both you and your friend get benefits!",
      buttonText: "Start Referring",
      gradient: "from-green-600 to-emerald-600",
      bgGradient: "from-green-50 to-emerald-50",
      icon: Gift,
      offer: "Unlimited",
    },
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerAds.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [bannerAds.length])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % bannerAds.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + bannerAds.length) % bannerAds.length)
  }

  return (
    <section className="py-8 md:py-12 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="relative"
        >
          <div className="relative h-56 md:h-64 lg:h-72 rounded-2xl md:rounded-3xl overflow-hidden shadow-xl md:shadow-2xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: 300 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -300 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className={`absolute inset-0 bg-gradient-to-r ${bannerAds[currentSlide].bgGradient}`}
              >
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div
                    className="w-full h-full"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23000000' fillOpacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }}
                  />
                </div>

                <div className="relative z-10 h-full flex items-center">
                  <div className="w-full grid md:grid-cols-2 gap-6 md:gap-8 items-center px-4 sm:px-6 md:px-8 lg:px-12">
                    {/* Left Content */}
                    <div className="text-center md:text-left">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 md:px-4 md:py-2 mb-3 md:mb-4"
                      >
                        {React.createElement(bannerAds[currentSlide].icon, { className: "h-3 w-3 md:h-4 md:w-4 mr-2" })}
                        <span className="text-xs md:text-sm font-semibold">{bannerAds[currentSlide].offer}</span>
                      </motion.div>

                      <motion.h3
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="text-xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-1 md:mb-2"
                      >
                        {bannerAds[currentSlide].title}
                      </motion.h3>

                      <motion.h4
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className={`text-lg md:text-xl lg:text-2xl font-semibold bg-gradient-to-r ${bannerAds[currentSlide].gradient} bg-clip-text text-transparent mb-3 md:mb-4`}
                      >
                        {bannerAds[currentSlide].subtitle}
                      </motion.h4>

                      <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.5 }}
                        className="text-gray-600 mb-4 md:mb-6 text-xs md:text-sm lg:text-base leading-relaxed"
                      >
                        {bannerAds[currentSlide].description}
                      </motion.p>

                      <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`inline-flex items-center bg-gradient-to-r ${bannerAds[currentSlide].gradient} text-white px-4 py-2 md:px-6 md:py-3 rounded-xl md:rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group text-xs md:text-sm lg:text-base`}
                      >
                        {bannerAds[currentSlide].buttonText}
                        <ExternalLink className="h-3 w-3 md:h-4 md:w-4 ml-1 md:ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                      </motion.button>
                    </div>

                    {/* Right Visual Element */}
                    {!isMobile && (
                      <div className="hidden md:flex justify-center items-center">
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                          animate={{ opacity: 1, scale: 1, rotate: 0 }}
                          transition={{ duration: 0.8, delay: 0.4 }}
                          className={`w-40 h-40 md:w-48 md:h-48 lg:w-56 lg:h-56 bg-gradient-to-br ${bannerAds[currentSlide].gradient} rounded-2xl md:rounded-3xl flex items-center justify-center shadow-xl md:shadow-2xl`}
                        >
                          {React.createElement(bannerAds[currentSlide].icon, {
                            className: "h-16 w-16 md:h-20 md:w-20 lg:h-24 lg:w-24 text-white",
                          })}
                        </motion.div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation Arrows - Always Visible */}
            <motion.button
              onClick={prevSlide}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-700 hover:bg-white/40 transition-all duration-300 z-20 shadow-sm"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
            </motion.button>

            <motion.button
              onClick={nextSlide}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-700 hover:bg-white/40 transition-all duration-300 z-20 shadow-sm"
              aria-label="Next slide"
            >
              <ChevronRight className="h-4 w-4 md:h-5 md:w-5" />
            </motion.button>

            {/* Slide Indicators - Always Visible */}
            <div className="absolute bottom-2 md:bottom-4 left-1/2 -translate-x-1/2 flex space-x-1 md:space-x-2 z-20">
              {bannerAds.map((_, index) => (
                <motion.button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.8 }}
                  className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-300 ${
                    index === currentSlide ? "bg-white shadow-md" : "bg-white/50 hover:bg-white/70"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}