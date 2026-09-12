"use client"

import React from "react"
import { motion } from "framer-motion"
import {
  Users,
  Clock,
  Star,
  Download,
  Zap
} from "lucide-react"
import FeatureSteps from "../ui/feature-section"

export default function FeaturesSection() {
  const academicFeatures = [
    {
      step: "Feature 01",
      title: "Smart Filter & Resource Search",
      content: "Find syllabus-aligned notes, past semester question papers, and verified study files instantly with advanced multi-category filtering.",
      image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=1200&auto=format&fit=crop",
    },
    {
      step: "Feature 02",
      title: "Interactive Quizzes & Timed Challenges",
      content: "Test your mastery with chapter-wise assessments, faculty-approved quizzes, immediate answer analytics, and topic-level weak area tracking.",
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop",
    },
    {
      step: "Feature 03",
      title: "Global Competitions & Live Arenas",
      content: "Compete against peer scholars in scheduled academic contests, climb seasonal leaderboards, and showcase your verified subject competence.",
      image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1200&auto=format&fit=crop",
    },
    {
      step: "Feature 04",
      title: "Peer Knowledge Sharing & Q&A",
      content: "Collaborate with university peers, share handwritten lecture summaries, review verified files, and resolve difficult academic doubts collectively.",
      image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200&auto=format&fit=crop",
    },
  ]

  const stats = [
    {
      icon: Download,
      value: "1M+",
      label: "Downloads",
      cardBg: "bg-[#e8edff]", // Miro Brand Blue tint
      borderColor: "border-[#c7d8fe] hover:border-[#4262ff]/50",
      iconTint: "text-[#4262ff]",
      labelColor: "text-[#2e47c7]",
      hoverShadow: "hover:shadow-[0_12px_28px_rgba(66,98,255,0.15)]",
    },
    {
      icon: Users,
      value: "50K+",
      label: "Active Users",
      cardBg: "bg-[#c3faf5]", // Miro Teal-light ({colors.teal-light})
      borderColor: "border-[#8eefe6] hover:border-[#0fbcb0]/50",
      iconTint: "text-[#187574]",
      labelColor: "text-[#146665]",
      hoverShadow: "hover:shadow-[0_12px_28px_rgba(15,188,176,0.15)]",
    },
    {
      icon: Star,
      value: "4.9",
      label: "Rating",
      cardBg: "bg-[#fff4c4]", // Miro Yellow-light ({colors.yellow-light})
      borderColor: "border-[#ffd02f]/70 hover:border-[#fcb900]",
      iconTint: "text-[#746019]",
      labelColor: "text-[#625113]",
      hoverShadow: "hover:shadow-[0_12px_28px_rgba(252,185,0,0.18)]",
    },
    {
      icon: Clock,
      value: "24/7",
      label: "Support",
      cardBg: "bg-[#ffd8f4]", // Miro Brand Rose ({colors.brand-rose})
      borderColor: "border-[#f7b6e5] hover:border-[#ff9999]",
      iconTint: "text-[#a02070]",
      labelColor: "text-[#87195e]",
      hoverShadow: "hover:shadow-[0_12px_28px_rgba(255,153,153,0.18)]",
    },
  ]

  return (
    <section id="features" className="py-24 sm:py-32 bg-[#fafbfc] text-[#1c1c1e] relative overflow-hidden border-t border-[#e0e2e8]">
      {/* Subtle Miro Whiteboard Grid Canvas */}
      <div
        className="absolute inset-0 opacity-[0.4] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#d1d5db 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 relative z-10">
        {/* Header (Exact text preserved as requested by user) */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#fff4c4] border border-[#ffd02f]/60 text-[#746019] text-xs font-bold uppercase tracking-wider mb-5 shadow-sm"
          >
            <Zap className="h-3.5 w-3.5 text-[#fcb900] fill-[#fcb900]" />
            <span>Powerful Learning Features</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#1c1c1e] mb-4 leading-tight font-sans"
          >
            Everything You Need To Excel Academically
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-lg text-[#555a6a] leading-relaxed font-sans max-w-2xl mx-auto"
          >
            Experience a comprehensive academic platform designed to make learning engaging, competitive, and rewarding.
          </motion.p>
        </div>

        {/* FeatureSteps Interactive Component with Feature 01..04 */}
        <div className="mb-16 sm:mb-24">
          <FeatureSteps
            features={academicFeatures}
            autoPlayInterval={3500}
            imageHeight="h-[380px] sm:h-[450px] lg:h-[500px]"
          />
        </div>

        {/* 4 Stats Grid in DESIGN-miro.md Pastel Colors with Hover Upward Icon Animation */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="p-6 sm:p-10 rounded-3xl bg-white border border-[#e0e2e8] shadow-[0_4px_24px_rgba(0,0,0,0.03)]"
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial="rest"
                whileHover="hover"
                animate="rest"
                className={`relative py-7 px-4 rounded-2xl ${stat.cardBg} border ${stat.borderColor} ${stat.hoverShadow} shadow-sm transition-all duration-300 text-center flex flex-col items-center justify-center overflow-hidden cursor-pointer group min-h-[160px]`}
              >
                {/* Main Text Container shifting upward on hover */}
                <motion.div
                  variants={{
                    rest: { y: 14 },
                    hover: { y: -10 },
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className="flex flex-col items-center justify-center w-full"
                >
                  <div className="text-2xl sm:text-4xl font-extrabold text-[#1c1c1e] mb-1 font-sans tracking-tight">
                    {stat.value}
                  </div>
                  <div className={`text-xs sm:text-sm font-bold ${stat.labelColor} font-sans`}>
                    {stat.label}
                  </div>

                  {/* Icon rising smoothly from underneath on hover */}
                  <motion.div
                    variants={{
                      rest: { opacity: 0, y: 35, scale: 0.6 },
                      hover: { opacity: 1, y: 12, scale: 1 },
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 22 }}
                    className={`w-11 h-11 rounded-2xl bg-white/95 ${stat.iconTint} backdrop-blur-sm flex items-center justify-center shadow-md`}
                  >
                    <stat.icon className="w-5 h-5" />
                  </motion.div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
