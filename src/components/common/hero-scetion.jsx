"use client"

import React, { useRef, useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion"
import { useNavigate } from "react-router-dom"
import {
  Star,
  Users,
  BookOpen,
  Trophy,
  CheckCircle2,
  Sparkles,
  X,
  Play,
  Video,
  ArrowRight,
} from "lucide-react"

export default function HeroSection({
  backgroundImageUrl = "https://cdn.21st.dev/assets/mirror/a8/a8cf38f65f7315f95eba8c803c4a80a9d78cb2ea36fbfee49828396e4a0b9737.jpg",
  badgeLabel = "NEW",
  badgeText = "The AI-Powered Visual Workspace",
  title = "See how teams get",
  titleLine2 = "great done with CLYS",
  description = "The AI-powered visual workspace for innovation, collaboration, and learning. Design custom quizzes, participate in educational contests, and turn ideas into academic excellence.",
  primaryButtonText = "Get started free",
  primaryButtonHref = "/signup",
  secondaryButtonText = "Book a demo",
  secondaryButtonHref = "#features",
}) {
  const navigate = useNavigate()
  const heroRef = useRef(null)
  const videoRef = useRef(null)
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const demoVideos = [
    {
      id: "demo1",
      title: "Platform Overview",
      src: "https://vjs.zencdn.net/v/oceans.mp4",
      poster: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop"
    },
    {
      id: "demo2",
      title: "Interactive Engine",
      src: "https://media.w3.org/2010/05/sintel/trailer.mp4",
      poster: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?q=80&w=1200&auto=format&fit=crop"
    },
    {
      id: "demo3",
      title: "HD Visual Tour",
      src: "https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-720p.mp4",
      poster: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200&auto=format&fit=crop"
    }
  ]
  const [activeDemoVideo, setActiveDemoVideo] = useState(demoVideos[0])

  // Auto-play when modal opens with fallback handling and auto-pause when closed
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsDemoModalOpen(false)
      }
    }
    if (isDemoModalOpen) {
      window.addEventListener("keydown", handleKeyDown)
      document.body.style.overflow = "hidden"
      if (videoRef.current) {
        const playPromise = videoRef.current.play()
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            if (videoRef.current) {
              videoRef.current.muted = true
              videoRef.current.play().catch(() => {})
            }
          })
        }
      }
    } else {
      if (videoRef.current) {
        videoRef.current.pause()
      }
      document.body.style.overflow = "unset"
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = "unset"
    }
  }, [isDemoModalOpen, activeDemoVideo])

  // Mouse tilt tracking for 3D engine
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const smoothMouseX = useSpring(mouseX, { stiffness: 120, damping: 20 })
  const smoothMouseY = useSpring(mouseY, { stiffness: 120, damping: 20 })

  const handleMouseMove = (e) => {
    if (!heroRef.current) return
    const rect = heroRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    mouseX.set(x * 25)
    mouseY.set(y * 25)
  }

  // 3D Transforms for the central learning artifact
  const rotateX = useTransform(smoothMouseY, [-25, 25], [16, -10])
  const rotateY = useTransform(smoothMouseX, [-25, 25], [-16, 16])

  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState(null)

  return (
    <section
      id="home"
      ref={heroRef}
      onMouseMove={handleMouseMove}
      className="w-full isolate min-h-screen overflow-hidden relative bg-[#060814] text-white pt-24 sm:pt-32 pb-16 sm:pb-24 px-4 sm:px-6"
    >
      {/* Exact 21st.dev Cosmic Glow Arc Background Image */}
      <img
        src={backgroundImageUrl}
        alt="Cosmic Arc Background"
        className="w-full h-full object-cover absolute top-0 right-0 bottom-0 left-0 pointer-events-none"
      />
      <div className="pointer-events-none absolute inset-0 ring-1 ring-black/30" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#060814]" />

      <div className="z-10 relative max-w-7xl mx-auto">
        {/* ──────── Centered Hero Typography & Content (Matching Screenshot) ──────── */}
        <div className="mx-auto max-w-3xl text-center px-2 sm:px-0">
          {/* Badge Pill */}
          <div className="mb-6 inline-flex items-center gap-3 rounded-full bg-white/10 px-3 py-1.5 ring-1 ring-white/15 backdrop-blur-md animate-fade-slide-in-1 shadow-lg shadow-black/40">
            <span className="inline-flex items-center text-xs font-medium text-neutral-900 bg-white/90 rounded-full py-0.5 px-2.5 font-sans">
              {badgeLabel}
            </span>
            <span className="text-xs sm:text-sm font-medium text-white/90 font-sans flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400 shrink-0" />
              <span>{badgeText}</span>
            </span>
          </div>

          {/* Main Title in Instrument Serif (Matching Screenshot) */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.12] sm:leading-tight text-white tracking-tight font-instrument-serif font-normal animate-fade-slide-in-2 drop-shadow-2xl">
            {title}
            <br className="hidden sm:block" />
            {titleLine2}
          </h1>

          {/* Description */}
          <p className="text-sm sm:text-base md:text-lg animate-fade-slide-in-3 text-white/80 max-w-2xl mt-6 mx-auto leading-relaxed font-sans px-2">
            {description}
          </p>

          {/* Dual Action Buttons (Matching DESIGN-miro.md button tokens) */}
          <div className="flex flex-col sm:flex-row sm:gap-4 mt-8 gap-3 items-center justify-center animate-fade-slide-in-4 w-full sm:w-auto px-4 sm:px-0">
            <button
              onClick={() => navigate(primaryButtonHref)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#ffd02f] hover:bg-[#fcb900] text-[#1c1c1e] text-sm sm:text-base font-bold py-3.5 px-7 rounded-full shadow-lg hover:shadow-xl transition-all active:scale-95 font-sans"
            >
              <span>{primaryButtonText}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4 shrink-0 text-[#1c1c1e]"
              >
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </button>
            <button
              onClick={() => setIsDemoModalOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/25 hover:border-white px-7 py-3.5 text-sm sm:text-base font-semibold text-white font-sans transition-all active:scale-95 backdrop-blur-sm"
            >
              <span>{secondaryButtonText}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4 text-white/90 shrink-0"
              >
                <path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z" />
              </svg>
            </button>
          </div>

          {/* User's Original Platform Stats */}
          <div className="grid grid-cols-3 gap-2 sm:gap-6 max-w-lg mx-auto mt-8 sm:mt-10 pt-5 sm:pt-6 border-t border-white/10">
            {[
              { icon: Users, value: "50K+", label: "Active Students" },
              { icon: BookOpen, value: "10K+", label: "Study Materials" },
              { icon: Trophy, value: "95%", label: "Success Rate" },
            ].map((stat, idx) => (
              <div key={idx} className="text-center px-1">
                <stat.icon className="h-4 w-4 sm:h-5 sm:w-5 text-[#ffd02f] mb-1 mx-auto" />
                <div className="text-lg sm:text-2xl font-extrabold text-white">{stat.value}</div>
                <div className="text-[10px] sm:text-xs text-white/70 font-sans truncate">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ──────── 3D Levitating Learning Core & Illuminated Pedestal ──────── */}
        <div className="mt-12 sm:mt-16 max-w-4xl mx-auto relative perspective-1200 overflow-visible">
          {/* Concentric Illuminated Pedestal Disc (Miro Canary & Teal Glow) */}
          <div className="relative flex items-center justify-center pointer-events-none -mb-20 sm:-mb-32">
            <div
              className="w-[280px] sm:w-[500px] md:w-[620px] h-[75px] sm:h-[130px] rounded-[100%] border border-[#ffd02f]/40 bg-gradient-to-t from-[#ffd02f]/20 via-[#4262ff]/10 to-transparent shadow-[0_0_80px_rgba(255,208,47,0.3)]"
              style={{ transform: "rotateX(72deg) scale(1.05)" }}
            />
            <div
              className="absolute w-[220px] sm:w-[380px] md:w-[480px] h-[55px] sm:h-[90px] rounded-[100%] border border-[#c3faf5]/40 bg-gradient-to-t from-[#c3faf5]/20 to-transparent shadow-[0_0_50px_rgba(195,250,245,0.2)]"
              style={{ transform: "rotateX(72deg) scale(0.9)" }}
            />
            <div
              className="absolute w-[140px] sm:w-[220px] md:w-[280px] h-[35px] sm:h-[50px] rounded-[100%] bg-[#ffd02f]/20 blur-xl"
              style={{ transform: "rotateX(72deg)" }}
            />
          </div>

          {/* 3D Multi-Layer Learning Core - Styled with DESIGN-miro.md Card System */}
          <motion.div
            style={{
              rotateX,
              rotateY,
              transformStyle: "preserve-3d",
            }}
            animate={{
              y: [-6, 6, -6],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="relative z-20 w-full max-w-2xl mx-auto rounded-2xl sm:rounded-3xl bg-white border border-[#c7cad5] p-5 sm:p-7 shadow-[0_24px_70px_rgba(5,0,56,0.28)] text-[#1c1c1e]"
          >
            {/* Header of 3D Artifact */}
            <div className="flex items-center justify-between border-b border-[#e0e2e8] pb-3 sm:pb-4 mb-4 sm:mb-5">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#ffd02f] border border-[#fde89c] flex items-center justify-center font-black text-sm text-[#050038] shadow-xs">
                  C
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-extrabold text-[#050038] tracking-tight">CLYS Neural Learning Engine</h4>
                  <p className="text-[10px] sm:text-[11px] font-bold text-[#187574] font-mono tracking-wider">CORE STATUS: ACTIVE</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#c3faf5] border border-[#9eece4] text-[11px] font-bold text-[#187574] flex items-center gap-1.5 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-[#187574] animate-ping" />
                Live Hub
              </span>
            </div>

            {/* Interactive Live Mini-Quiz Card */}
            <div className="space-y-2.5 sm:space-y-3">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-1.5 text-[#4262ff] uppercase tracking-wider font-extrabold">
                  <Sparkles className="w-3.5 h-3.5 text-[#fcb900]" />
                  Interactive Quiz Demo
                </span>
                <span className="text-[#555a6a] font-mono text-[11px] bg-[#f7f8fa] border border-[#e0e2e8] px-2.5 py-0.5 rounded-full font-bold">
                  Question 01/05
                </span>
              </div>
              <p className="text-sm sm:text-base md:text-lg font-bold text-[#050038] leading-snug">
                Which learning methodology produces the highest retention rate according to cognitive research?
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 pt-1 sm:pt-2">
                {[
                  { id: "A", text: "Spaced Retrieval Practice", correct: true },
                  { id: "B", text: "Passive Highlight Reading", correct: false },
                  { id: "C", text: "Cramming Overnight", correct: false },
                  { id: "D", text: "Listening without Notes", correct: false },
                ].map((option) => {
                  const isSelected = selectedQuizAnswer === option.id
                  return (
                    <button
                      key={option.id}
                      onClick={() => setSelectedQuizAnswer(option.id)}
                      className={`flex items-center gap-2.5 sm:gap-3 p-3 rounded-xl border text-left text-xs font-semibold transition-all ${
                        isSelected
                          ? option.correct
                            ? "bg-[#c3faf5] border-2 border-[#187574] text-[#187574] shadow-xs scale-[1.01]"
                            : "bg-[#fbd4d4] border-2 border-[#800000] text-[#800000] shadow-xs"
                          : "bg-[#f7f8fa] border-[#e0e2e8] hover:border-[#1c1c1e] text-[#1c1c1e] hover:bg-[#fffdf5]"
                      }`}
                    >
                      <span
                        className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${
                          isSelected
                            ? option.correct
                              ? "bg-[#187574] text-white"
                              : "bg-[#800000] text-white"
                            : "bg-white border border-[#c7cad5] text-[#050038]"
                        }`}
                      >
                        {option.id}
                      </span>
                      <span className="flex-1 leading-tight">{option.text}</span>
                      {isSelected && option.correct && (
                        <CheckCircle2 className="w-4 h-4 text-[#187574] shrink-0" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Sub-cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 mt-4 sm:mt-5 pt-3 sm:pt-4 border-t border-[#e0e2e8]">
              <div className="flex items-center gap-3 p-3 sm:p-3.5 rounded-xl bg-[#fff8e0] border border-[#fde89c]">
                <div className="w-8 h-8 rounded-lg bg-[#ffd02f] flex items-center justify-center text-[#746019] shrink-0 font-bold">
                  <BookOpen className="w-4 h-4 text-[#746019]" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-extrabold text-[#050038]">Study Materials Vault</div>
                  <div className="text-[11px] font-semibold text-[#746019]">2,500+ Verified Academic Notes</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 sm:p-3.5 rounded-xl bg-[#c3faf5] border border-[#9eece4]">
                <div className="w-8 h-8 rounded-lg bg-[#0fbcb0] flex items-center justify-center text-white shrink-0 font-bold">
                  <Trophy className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-extrabold text-[#050038]">Global Contest Arena</div>
                  <div className="text-[11px] font-semibold text-[#187574]">Compete with 50K+ Active Peers</div>
                </div>
              </div>
            </div>

            {/* Floating Orbiting 3D Elements in Miro Styling */}
            <motion.div
              animate={{
                rotateY: [0, 180, 360],
                rotateZ: [0, 90, 180],
                y: [-4, 4, -4],
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute -top-3 -left-2 sm:-top-8 sm:-left-8 w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-white border border-[#c7cad5] shadow-xl pointer-events-none p-1.5 flex items-center justify-center"
            >
              <div className="w-full h-full rounded-xl bg-[#fff8e0] border border-[#fde89c] flex items-center justify-center">
                <BookOpen className="w-4 h-4 sm:w-6 sm:h-6 text-[#746019]" />
              </div>
            </motion.div>

            <motion.div
              animate={{
                rotateY: [360, 180, 0],
                rotateX: [0, 90, 180],
                y: [4, -4, 4],
              }}
              transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              className="absolute -bottom-3 -right-2 sm:-bottom-8 sm:-right-8 w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-white border border-[#c7cad5] shadow-xl pointer-events-none p-1.5 flex items-center justify-center"
            >
              <div className="w-full h-full rounded-xl bg-[#c3faf5] border border-[#9eece4] flex items-center justify-center">
                <Trophy className="w-4 h-4 sm:w-6 sm:h-6 text-[#187574]" />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Interactive Book Demo Video Modal rendered via createPortal directly on document.body */}
      {mounted && typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {isDemoModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDemoModalOpen(false)}
              className="fixed inset-0 z-[99999] flex items-center justify-center p-2.5 sm:p-5 md:p-6 bg-black/85 backdrop-blur-md overflow-y-auto"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-4xl lg:max-w-5xl bg-[#1c1c1e] text-white border border-white/20 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[95vh]"
              >
                {/* Modal Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between px-3.5 sm:px-6 py-2.5 sm:py-3.5 border-b border-white/10 bg-[#141517] shrink-0 gap-2.5">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <span className="px-2 sm:px-2.5 py-0.5 bg-[#ffd02f] text-[#1c1c1e] text-[10px] sm:text-xs font-black uppercase tracking-wider rounded-full flex items-center gap-1 shadow-sm shrink-0">
                      <Video className="w-3 h-3 text-[#1c1c1e]" />
                      <span>DEMO</span>
                    </span>
                    <h3 className="text-xs sm:text-sm md:text-base font-bold text-white tracking-tight truncate">
                      CLYS Interactive Platform Demo
                    </h3>
                  </div>

                  {/* Switch Demo Tracks */}
                  <div className="flex items-center gap-1.5 overflow-x-auto py-1 sm:py-0">
                    {demoVideos.map((video) => (
                      <button
                        key={video.id}
                        onClick={() => {
                          setActiveDemoVideo(video)
                          if (videoRef.current) {
                            videoRef.current.currentTime = 0
                            videoRef.current.play().catch(() => {})
                          }
                        }}
                        className={`text-[11px] sm:text-xs px-2.5 py-1 rounded-full font-medium transition-all whitespace-nowrap cursor-pointer ${
                          activeDemoVideo.id === video.id
                            ? "bg-[#ffd02f] text-[#1c1c1e] font-bold shadow"
                            : "bg-white/10 text-white/70 hover:text-white hover:bg-white/15"
                        }`}
                      >
                        {video.title}
                      </button>
                    ))}
                    <button
                      onClick={() => setIsDemoModalOpen(false)}
                      className="ml-2 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors flex items-center justify-center shrink-0 cursor-pointer active:scale-95 border border-white/10"
                      aria-label="Close modal"
                    >
                      <X className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                </div>

                {/* Video Player Container */}
                <div className="relative aspect-video w-full bg-black flex items-center justify-center shrink-0 max-h-[50vh] sm:max-h-[62vh] overflow-hidden">
                  <video
                    key={activeDemoVideo.src}
                    ref={videoRef}
                    poster={activeDemoVideo.poster}
                    controls
                    autoPlay
                    playsInline
                    preload="auto"
                    className="w-full h-full object-contain"
                  >
                    <source src={activeDemoVideo.src} type="video/mp4" />
                    <source src="https://vjs.zencdn.net/v/oceans.mp4" type="video/mp4" />
                    <source src="https://media.w3.org/2010/05/sintel/trailer.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>

                {/* Modal Bottom / Action Footer */}
                <div className="p-3 sm:p-4 md:p-5 bg-[#141517] border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
                  <div className="flex items-center gap-2.5 sm:gap-4 text-[10px] sm:text-xs text-white/80 flex-wrap justify-center sm:justify-start">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#ffd02f] shrink-0" /> Live Quiz Engine
                    </span>
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#ffd02f] shrink-0" /> Global Contest Arena
                    </span>
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#ffd02f] shrink-0" /> Verified Notes
                    </span>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
                    <button
                      onClick={() => {
                        setIsDemoModalOpen(false)
                        navigate("/signup")
                      }}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-[#ffd02f] hover:bg-[#fcb900] text-[#1c1c1e] text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
                    >
                      <span>Start Learning Now</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </section>
  )
}