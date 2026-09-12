"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import {
  AlertTriangle,
  Info,
  BookOpen,
  Users,
  Shield,
  ExternalLink,
  ArrowLeft,
  ArrowRight,
  Loader2,
} from "lucide-react"
import { useNavigate } from "react-router-dom"
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
  const navigate = useNavigate()
  const [disclaimer, setDisclaimer] = useState(null)
  const [loading, setLoading] = useState(true)

  const disclaimerSections = disclaimer
    ? disclaimer.sections.map((section) => ({
        ...section,
        icon: iconMap[section.icon] || Info,
      }))
    : []

  useEffect(() => {
    const fetchDisclaimer = async () => {
      try {
        const res = await getDisclaimer()
        if (res) {
          setDisclaimer(res)
        }
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
      <div className="min-h-screen bg-[#f7f8fa] flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="w-12 h-12 rounded-2xl bg-[#ffd02f] flex items-center justify-center mb-4 shadow-sm animate-pulse">
          <Loader2 className="animate-spin h-6 w-6 text-[#1c1c1e]" />
        </div>
        <p className="text-xs font-bold uppercase tracking-wider text-[#6a6d7c]">Loading legal disclaimer...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#1c1c1e] py-6 sm:py-10 px-4 sm:px-6 lg:px-8 xl:px-12 w-full font-sans">
      <div className="w-full space-y-10">
        {/* Navigation & Header */}
        <div>
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#c7cad5] bg-white text-xs font-semibold text-[#1c1c1e] hover:bg-[#ebecf0] transition-colors mb-6 shadow-sm active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>

          <div className="text-center w-full space-y-4">
            <div className="flex items-center justify-center gap-2 flex-wrap mb-2">
              <span className="px-3 py-1 bg-[#ffd02f] text-[#1c1c1e] text-[11px] font-black uppercase tracking-widest rounded-full shadow-sm">
                LEGAL COMPLIANCE
              </span>
              <span className="px-3 py-1 bg-[#fbd4d4] text-[#800000] text-[11px] font-bold uppercase tracking-wider rounded-full">
                TERMS & DISCLAIMER
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#1c1c1e] leading-tight">
              {disclaimer?.header?.title || "Platform Disclaimer"}
            </h1>

            <p className="text-sm sm:text-base text-[#6a6d7c] leading-relaxed max-w-4xl mx-auto">
              {disclaimer?.header?.description ||
                "Please read this disclaimer carefully before using CLYS platform resources, quizzes, and educational materials."}
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#c7cad5] text-[11px] font-bold text-[#6a6d7c] shadow-2xs">
              <Shield className="w-3.5 h-3.5 text-[#746019]" />
              <span>Effective Date: {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>
        </div>

        {/* Highlight Warning Banner */}
        <div className="w-full bg-[#fff8e0] border border-[#fde89c] rounded-2xl p-5 sm:p-6 shadow-sm flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#ffd02f] border border-[#fde89c] flex items-center justify-center text-[#1c1c1e] shrink-0 shadow-2xs mt-0.5">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="space-y-1 text-xs sm:text-sm text-[#746019]">
            <h4 className="font-extrabold text-sm uppercase tracking-wider text-[#1c1c1e]">Important Notice to Users</h4>
            <p className="leading-relaxed">
              All materials, question banks, study guides, and contest items published on CLYS are created for supplementary study and peer learning purposes. They do not constitute official examination papers of government or university boards unless explicitly cited.
            </p>
          </div>
        </div>

        {/* Disclaimer Sections */}
        <div className="w-full space-y-5">
          {disclaimerSections.map((section, index) => {
            const IconComponent = section.icon || Info

            return (
              <div
                key={index}
                className="bg-white border border-[#c7cad5] rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-all space-y-4"
              >
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-[#fff4c4] border border-[#fde89c] flex items-center justify-center text-[#746019] shrink-0 shadow-2xs">
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <h2 className="text-lg sm:text-xl font-extrabold text-[#1c1c1e]">
                        {section.title}
                      </h2>
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#6a6d7c] px-2 py-0.5 rounded-md bg-[#f0f1f4]">
                        Clause 0{index + 1}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-[#555a6a] leading-relaxed whitespace-pre-line">
                      {section.content}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Bottom Questions Card */}
        <div className="w-full bg-[#1c1c1e] text-white rounded-3xl p-8 sm:p-10 text-center space-y-4 shadow-xl">
          <span className="px-3 py-1 bg-[#ffd02f] text-[#1c1c1e] text-[10px] font-black uppercase tracking-wider rounded-full inline-block">
            LEGAL CLARIFICATIONS
          </span>
          <h3 className="text-xl sm:text-3xl font-extrabold text-white">
            Have Questions About This Disclaimer?
          </h3>
          <p className="text-xs sm:text-sm text-white/70 max-w-lg mx-auto leading-relaxed">
            If you represent an academic publisher, educational board, or have copyright queries, reach out to our legal department.
          </p>
          <div className="pt-2">
            <button
              onClick={() => navigate("/contact-us")}
              className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[#ffd02f] hover:bg-[#fcb900] text-[#1c1c1e] text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <span>Contact Legal Support</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
