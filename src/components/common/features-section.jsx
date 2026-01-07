"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "../ui/card"
import { BookOpen, Trophy, Upload, Filter, Users, BarChart3, Zap, Shield, Clock, Star, Download } from "lucide-react"

export default function FeaturesSection() {
  const features = [
    {
      icon: Filter,
      title: "Smart Filter & Search",
      description: "Advanced filtering system to find exactly what you need from thousands of study materials.",
      color: "from-purple-500 to-pink-500",
      delay: 0.1,
    },
    {
      icon: BookOpen,
      title: "Interactive Quizzes",
      description: "Engage with dynamic quizzes and get instant feedback with detailed performance analytics.",
      color: "from-blue-500 to-cyan-500",
      delay: 0.2,
    },
    {
      icon: Trophy,
      title: "Global Competitions",
      description: "Participate in worldwide academic contests and compete with students from around the globe.",
      color: "from-yellow-500 to-orange-500",
      delay: 0.3,
    },
    {
      icon: Upload,
      title: "Content Sharing",
      description: "Upload and share your study materials with the community and help others learn.",
      color: "from-green-500 to-emerald-500",
      delay: 0.4,
    },
    {
      icon: BarChart3,
      title: "Progress Analytics",
      description: "Track your learning journey with detailed analytics and personalized insights.",
      color: "from-indigo-500 to-purple-500",
      delay: 0.5,
    },
    {
      icon: Users,
      title: "Study Groups",
      description: "Join study groups, collaborate with peers, and learn together in a supportive environment.",
      color: "from-pink-500 to-rose-500",
      delay: 0.6,
    },
  ]

  const stats = [
    { icon: Download, value: "1M+", label: "Downloads", color: "from-blue-500 to-cyan-500" },
    { icon: Users, value: "50K+", label: "Active Users", color: "from-green-500 to-emerald-500" },
    { icon: Star, value: "4.9", label: "Rating", color: "from-yellow-500 to-orange-500" },
    { icon: Clock, value: "24/7", label: "Support", color: "from-purple-500 to-pink-500" },
  ]

  return (
    <section id="features" className="py-20 bg-gradient-to-br from-white via-blue-100 to-purple-200 relative overflow-hidden">
      {/* Background Elements */}
      <motion.div
        className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-3xl"
        animate={{
          x: [0, 50, 0],
          y: [0, -30, 0],
        }}
        transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-blue-200/30 to-cyan-200/30 rounded-full blur-3xl"
        animate={{
          x: [0, -30, 0],
          y: [0, 20, 0],
        }}
        transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="inline-flex items-center bg-gradient-to-r from-purple-100 to-pink-100 rounded-full px-6 py-3 mb-6"
          >
            <Zap className="h-5 w-5 text-purple-600 mr-2" />
            <span className="text-purple-600 font-semibold">Powerful Features</span>
          </motion.div>

          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Everything You Need to{" "}
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
              Excel
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Our comprehensive platform combines cutting-edge technology with educational excellence to create an
            unparalleled learning experience for students worldwide.
          </p>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20"
        >
          {stats.map((stat, index) => (
            <motion.div key={index} whileHover={{ scale: 1.05, y: -5 }} className="text-center">
              <div
                className={`w-16 h-16 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}
              >
                <stat.icon className="h-8 w-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-gray-600 font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={{
                hidden: { opacity: 0, y: 50 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.6, delay: feature.delay }}
            >
              <motion.div
                whileHover={{
                  scale: 1.05,
                  rotateY: 5,
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                }}
                whileTap={{ scale: 0.98 }}
                className="group cursor-pointer"
              >
                <Card className="h-full border-0 shadow-xl hover:shadow-2xl transition-all duration-500 rounded-3xl overflow-hidden bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-8 relative">
                    {/* Background Gradient */}
                    <motion.div
                      className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${feature.color}`}
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      transition={{ duration: 0.8, delay: feature.delay + 0.2 }}
                    />

                    {/* Icon */}
                    <motion.div
                      className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}
                      whileHover={{ rotate: 10 }}
                    >
                      <feature.icon className="h-8 w-8 text-white" />
                    </motion.div>

                    {/* Content */}
                    <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-purple-600 transition-colors duration-300">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                      {feature.description}
                    </p>

                    {/* Hover Effect */}
                    <motion.div className="absolute bottom-0 left-0 w-full h-0 bg-gradient-to-t from-purple-50 to-transparent opacity-0 group-hover:h-full group-hover:opacity-100 transition-all duration-500 -z-10" />

                    {/* Decorative Elements */}
                    <motion.div
                      className="absolute top-4 right-4 w-2 h-2 bg-purple-300 rounded-full opacity-0 group-hover:opacity-100"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                    />
                    <motion.div
                      className="absolute bottom-4 right-6 w-1 h-1 bg-pink-300 rounded-full opacity-0 group-hover:opacity-100"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, delay: 0.5 }}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-2xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer group"
          >
            <Shield className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform duration-300" />
            Explore All Features
            <motion.div
              className="ml-2"
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
            >
              →
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
