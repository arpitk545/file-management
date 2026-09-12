"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "../../lib/utils"

export function FeatureSteps({
  features = [],
  className,
  title,
  badgeText,
  description,
  autoPlayInterval = 4000,
  imageHeight = "h-[360px] sm:h-[420px] lg:h-[480px]",
}) {
  const [currentFeature, setCurrentFeature] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!features || features.length === 0) return

    const timer = setInterval(() => {
      if (progress < 100) {
        setProgress((prev) => prev + 100 / (autoPlayInterval / 100))
      } else {
        setCurrentFeature((prev) => (prev + 1) % features.length)
        setProgress(0)
      }
    }, 100)

    return () => clearInterval(timer)
  }, [progress, features, autoPlayInterval])

  if (!features || features.length === 0) return null

  return (
    <div className={cn("w-full", className)}>
      <div className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          {/* Steps List (Left Side) */}
          <div className="lg:col-span-6 space-y-4 sm:space-y-6 order-2 lg:order-1">
            {features.map((feature, index) => {
              const isActive = index === currentFeature
              return (
                <motion.div
                  key={index}
                  onClick={() => {
                    setCurrentFeature(index)
                    setProgress(0)
                  }}
                  className={cn(
                    "cursor-pointer rounded-2xl p-4 sm:p-5 transition-all duration-300 border flex items-start gap-4 sm:gap-6 relative overflow-hidden select-none",
                    isActive
                      ? "bg-white border-[#1c1c1e] shadow-[0_8px_30px_rgba(0,0,0,0.06)]"
                      : "bg-white/60 hover:bg-white border-[#e0e2e8] opacity-75 hover:opacity-100"
                  )}
                  initial={{ opacity: 0.4 }}
                  animate={{ opacity: isActive ? 1 : 0.6 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Step Progress Line on active card */}
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#1c1c1e] rounded-l-2xl overflow-hidden">
                      <motion.div
                        className="w-full bg-[#ffd02f]"
                        style={{ height: `${progress}%` }}
                        transition={{ duration: 0.1, ease: "linear" }}
                      />
                    </div>
                  )}

                  {/* Step Number or Checkmark */}
                  <motion.div
                    className={cn(
                      "w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center border-2 shrink-0 font-sans transition-all duration-300",
                      isActive
                        ? "bg-[#1c1c1e] border-[#1c1c1e] text-white scale-105 shadow-md"
                        : index < currentFeature
                        ? "bg-[#00875a] border-[#00875a] text-white"
                        : "bg-[#f0f2f5] border-[#d1d5db] text-[#555a6a]"
                    )}
                  >
                    {index <= currentFeature ? (
                      <span className="text-base sm:text-lg font-bold">✓</span>
                    ) : (
                      <span className="text-sm sm:text-base font-semibold">{index + 1}</span>
                    )}
                  </motion.div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#8e91a0] font-sans">
                        {feature.step}
                      </span>
                    </div>
                    <h3
                      className={cn(
                        "text-lg sm:text-xl font-bold font-sans transition-colors mb-1.5",
                        isActive ? "text-[#1c1c1e]" : "text-[#555a6a]"
                      )}
                    >
                      {feature.title || feature.step}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#555a6a] font-sans leading-relaxed">
                      {feature.content}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Interactive Feature Visual Card (Right Side) */}
          <div className="lg:col-span-6 order-1 lg:order-2">
            <div
              className={cn(
                "relative w-full rounded-3xl overflow-hidden border-2 border-[#e0e2e8] bg-white shadow-[0_12px_36px_rgba(0,0,0,0.06)]",
                imageHeight
              )}
            >
              <AnimatePresence mode="wait">
                {features.map(
                  (feature, index) =>
                    index === currentFeature && (
                      <motion.div
                        key={index}
                        className="absolute inset-0 rounded-3xl overflow-hidden"
                        initial={{ y: 60, opacity: 0, scale: 0.96 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ y: -60, opacity: 0, scale: 0.96 }}
                        transition={{ duration: 0.45, ease: "easeInOut" }}
                      >
                        <img
                          src={feature.image}
                          alt={feature.title || feature.step}
                          className="w-full h-full object-cover"
                        />
                        {/* Elegant Light Mode Glass Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#1c1c1e]/80 via-black/20 to-transparent" />

                        {/* Caption Card on Image */}
                        <div className="absolute bottom-6 left-6 right-6 p-4 sm:p-5 rounded-2xl bg-white/95 backdrop-blur-md border border-white/60 shadow-lg text-[#1c1c1e]">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-[#4262ff] font-sans bg-[#e8edff] px-2.5 py-0.5 rounded-full">
                              {feature.step}
                            </span>
                            <span className="text-xs text-[#8e91a0] font-sans font-medium">
                              {index + 1} of {features.length}
                            </span>
                          </div>
                          <h4 className="text-base sm:text-lg font-bold font-sans text-[#1c1c1e] truncate">
                            {feature.title}
                          </h4>
                          <p className="text-xs text-[#555a6a] font-sans line-clamp-2 mt-0.5">
                            {feature.content}
                          </p>
                        </div>
                      </motion.div>
                    )
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FeatureSteps
