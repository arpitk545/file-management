"use client"

import React from "react"
import { motion, useScroll, useSpring } from "framer-motion"
import Navbar from "./components/common/Navbar"
import GoogleAdsBanner from "./components/common/banner"
import HeroSection from "./components/common/hero-scetion"
import FeaturesSection from "./components/common/features-section"
import FilterSection from "./components/common/filter-section"
import TestimonialsSection from "./components/common/testimonial-section"
import FooterSection from "./components/common/Footer"

export default function LandingPage() {
  // Global scroll tracking for top-to-bottom progress
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  })

  return (
    <div className="min-h-screen bg-[#060814] text-white selection:bg-purple-500 selection:text-white antialiased overflow-x-hidden relative">
      {/* Top-To-Bottom Scroll Progress Glow Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 origin-left z-[100] shadow-[0_0_12px_rgba(236,72,153,0.8)]"
        style={{ scaleX }}
      />

      {/* Floating Glass Navigation */}
      <Navbar />

      <main className="relative">
        {/* 1. Scroll-Driven 3D Exploded Hero with Illuminated Pedestal & Orbiting Elements */}
        <HeroSection />

        {/* 2. 3D Features Matrix with Perspective Tilt & Live Stats */}
        <FeaturesSection />

        {/* 3. Dynamic Sponsor / Google Ads Banner */}
        <GoogleAdsBanner />

        {/* 4. 3D Live Resource Explorer (Files, Posts, Contests, Quizzes, Q&A) */}
        <FilterSection />

        {/* 5. 3D Testimonials & Student Reviews */}
        <TestimonialsSection />
      </main>

      {/* 6. Modern Glass Footer */}
      <FooterSection />
    </div>
  )
}
