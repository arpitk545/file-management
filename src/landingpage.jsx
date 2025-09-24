"use client"

import Navbar from "./components/common/Navbar"
import GoogleAdsBanner from "./components/common/banner"
import HeroSection from "./components/common/hero-scetion"
import FeaturesSection from "./components/common/features-section"
import FilterSection from "./components/common/filter-section"
import TestimonialsSection from "./components/common/testimonial-section"
import FooterSection from "./components/common/Footer"

export default function LandingPage() {
  return (
    <div className="fixed inset-0 overflow-auto bg-gradient-to-br from-white via-blue-100 to-purple-200">
      <Navbar />
      
      <HeroSection />
      <FeaturesSection/>
      <GoogleAdsBanner />
      <FilterSection/>
      <TestimonialsSection/>
      <FooterSection/>
    </div>
  )
}
