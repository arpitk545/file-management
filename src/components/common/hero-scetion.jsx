"use client"

import { motion } from "framer-motion"
import { Button } from "../ui/button"
import { ChevronRight, Play, Star, Users, BookOpen, Trophy } from "lucide-react"

export default function HeroSection() {
  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden pt-16 md:pt-20">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              "radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.4) 0%, transparent 50%)",
              "radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.4) 0%, transparent 50%)",
              "radial-gradient(circle at 40% 80%, rgba(119, 198, 255, 0.4) 0%, transparent 50%)",
              "radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.4) 0%, transparent 50%)",
            ],
          }}
          transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        />
      </div>

      {/* Floating Elements */}
      <motion.div
        className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full opacity-20"
        animate={{ y: [0, -20, 0], rotate: [0, 180, 360] }}
        transition={{ duration: 6, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-40 right-20 w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full opacity-20"
        animate={{ y: [0, 20, 0], rotate: [0, -180, -360] }}
        transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-40 left-20 w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full opacity-20"
        animate={{ y: [0, -15, 0], x: [0, 10, 0] }}
        transition={{ duration: 7, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      />

      <div className="container mx-auto px-4 relative z-10 py-8 md:py-0">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-white"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-white/20"
            >
              <Star className="h-4 w-4 text-yellow-400 mr-2 flex-shrink-0" />
              <span className="text-sm font-medium">Trusted by 50,000+ Students</span>
            </motion.div>

            <motion.h1
              className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold mb-4 md:mb-6 leading-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              Master Your{" "}
              <span className="relative">
                <span className="bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300 bg-clip-text text-transparent">
                  Learning
                </span>
                <motion.div
                  className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-yellow-300 to-pink-300 rounded-full"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.8, delay: 1 }}
                />
              </span>{" "}
              Journey
            </motion.h1>

            <motion.p
              className="text-base sm:text-xl md:text-2xl mb-6 md:mb-8 text-gray-200 leading-relaxed max-w-2xl"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              Access premium study materials, interactive quizzes, and join a thriving community of learners. Your path
              to academic excellence starts here.
            </motion.p>

            {/* Buttons — equal size on all screens */}
            <motion.div
              className="flex flex-col sm:flex-row gap-3 mb-8 md:mb-12"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-base px-8 h-14 rounded-2xl font-semibold group shadow-2xl"
                >
                  Start Learning Now
                  <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border-2 border-white/30 text-white hover:bg-white hover:text-purple-600 text-base px-8 h-14 rounded-2xl font-semibold bg-white/10 backdrop-blur-sm group"
                >
                  <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                  Watch Demo
                </Button>
              </motion.div>
            </motion.div>

            {/* Stats */}
            <motion.div
              className="grid grid-cols-3 gap-4 md:gap-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
            >
              {[
                { icon: Users, value: "50K+", label: "Active Students" },
                { icon: BookOpen, value: "10K+", label: "Study Materials" },
                { icon: Trophy, value: "95%", label: "Success Rate" },
              ].map((stat, index) => (
                <motion.div key={index} whileHover={{ y: -5 }} className="text-center">
                  <stat.icon className="h-6 w-6 md:h-8 md:w-8 text-purple-300 mx-auto mb-1 md:mb-2" />
                  <div className="text-lg md:text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-xs md:text-sm text-gray-300">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Content - Interactive Graphics */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative mt-4 lg:mt-0"
          >
            <div className="relative z-10 px-6 sm:px-0">
              {/* Main Card */}
              <motion.div
                className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-white/20 shadow-2xl"
                whileHover={{ scale: 1.02, rotateY: 5 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                />

                <div className="grid grid-cols-2 gap-3 md:gap-4 mb-4 md:mb-6">
                  <motion.div
                    className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-3 md:p-4 text-white"
                    whileHover={{ scale: 1.05, rotate: 2 }}
                  >
                    <BookOpen className="h-6 w-6 md:h-8 md:w-8 mb-1 md:mb-2" />
                    <div className="text-xl md:text-2xl font-bold">2.5K+</div>
                    <div className="text-xs md:text-sm opacity-90">Study Files</div>
                  </motion.div>
                  <motion.div
                    className="bg-gradient-to-br from-green-400 to-blue-500 rounded-2xl p-3 md:p-4 text-white"
                    whileHover={{ scale: 1.05, rotate: -2 }}
                  >
                    <Users className="h-6 w-6 md:h-8 md:w-8 mb-1 md:mb-2" />
                    <div className="text-xl md:text-2xl font-bold">15K+</div>
                    <div className="text-xs md:text-sm opacity-90">Students</div>
                  </motion.div>
                </div>

                <motion.div
                  className="bg-gradient-to-br from-pink-400 to-purple-500 rounded-2xl p-3 md:p-4 text-white"
                  whileHover={{ scale: 1.05 }}
                >
                  <Trophy className="h-6 w-6 md:h-8 md:w-8 mb-1 md:mb-2" />
                  <div className="text-xl md:text-2xl font-bold">500+</div>
                  <div className="text-xs md:text-sm opacity-90">Quizzes Available</div>
                </motion.div>

                {/* Progress Bar Animation */}
                <div className="mt-4 md:mt-6 p-3 md:p-4 bg-white/5 rounded-xl">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white text-sm">Learning Progress</span>
                    <span className="text-white text-sm font-bold">78%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <motion.div
                      className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: "78%" }}
                      transition={{ duration: 2, delay: 1 }}
                    />
                  </div>
                </div>
              </motion.div>

              {/* Floating Elements */}
              <motion.div
                className="absolute -top-6 -left-2 sm:-top-8 sm:-left-8 w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center"
                animate={{ rotate: [0, 10, -10, 0], y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY }}
              >
                <Star className="h-6 w-6 md:h-8 md:w-8 text-white" />
              </motion.div>

              <motion.div
                className="absolute -bottom-4 -right-2 sm:-bottom-6 sm:-right-6 w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center"
                animate={{ rotate: [0, -15, 15, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
              >
                <Trophy className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </motion.div>
            </div>

            {/* Background Decorative Elements */}
            <motion.div
              className="absolute top-10 right-10 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-xl"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY }}
            />
            <motion.div
              className="absolute bottom-10 left-10 w-24 h-24 bg-gradient-to-br from-blue-500/20 to-green-500/20 rounded-full blur-xl"
              animate={{ scale: [1.2, 1, 1.2] }}
              transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY }}
            />
          </motion.div>
        </div>
      </div>
    </section>
  )
}