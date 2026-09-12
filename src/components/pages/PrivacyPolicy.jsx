"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import {
  Shield,
  Lock,
  Eye,
  FileText,
  Users,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Loader2,
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { getPrivacyPolicy } from "../../services/operations/pagesAPI"

const iconMap = {
  FileText,
  Lock,
  Shield,
  Users,
  Eye,
  AlertCircle,
}

export default function PrivacyPolicy() {
  const navigate = useNavigate()
  const [policy, setPolicy] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getPrivacyPolicy()
        if (res) {
          setPolicy(res)
        }
      } catch (err) {
        console.error("Failed to load privacy policy", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f8fa] flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="w-12 h-12 rounded-2xl bg-[#ffd02f] flex items-center justify-center mb-4 shadow-sm animate-pulse">
          <Loader2 className="animate-spin h-6 w-6 text-[#1c1c1e]" />
        </div>
        <p className="text-xs font-bold uppercase tracking-wider text-[#6a6d7c]">Loading privacy policy...</p>
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
                LEGAL & PRIVACY
              </span>
              <span className="px-3 py-1 bg-[#c3faf5] text-[#187574] text-[11px] font-bold uppercase tracking-wider rounded-full">
                DATA PROTECTION
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#1c1c1e] leading-tight">
              Privacy Policy
            </h1>

            <p className="text-sm sm:text-base text-[#6a6d7c] leading-relaxed max-w-4xl mx-auto">
              Your personal privacy and academic information security are paramount. This policy outlines how we collect, safeguard, and use your data across CLYS services.
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#c7cad5] text-[11px] font-bold text-[#6a6d7c] shadow-2xs">
              <Shield className="w-3.5 h-3.5 text-[#187574]" />
              <span>Last Revised: {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="w-full space-y-5">
          {policy?.sections?.map((section, index) => {
            const Icon = iconMap[section.icon] || FileText

            return (
              <div
                key={index}
                className="bg-white border border-[#c7cad5] rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-all space-y-4"
              >
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-[#fff4c4] border border-[#fde89c] flex items-center justify-center text-[#746019] shrink-0 shadow-2xs">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <h2 className="text-lg sm:text-xl font-extrabold text-[#1c1c1e]">
                        {section.title}
                      </h2>
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#6a6d7c] px-2 py-0.5 rounded-md bg-[#f0f1f4]">
                        Section 0{index + 1}
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

        {/* Bottom Questions & Inquiries Card */}
        <div className="w-full bg-[#1c1c1e] text-white rounded-3xl p-8 sm:p-10 text-center space-y-4 shadow-xl">
          <span className="px-3 py-1 bg-[#ffd02f] text-[#1c1c1e] text-[10px] font-black uppercase tracking-wider rounded-full inline-block">
            PRIVACY INQUIRIES
          </span>
          <h3 className="text-xl sm:text-3xl font-extrabold text-white">
            Have Questions About Your Data Rights?
          </h3>
          <p className="text-xs sm:text-sm text-white/70 max-w-lg mx-auto leading-relaxed">
            If you need assistance regarding data deletion, cookie preferences, or clarification on our storage practices, our compliance team is available.
          </p>
          <div className="pt-2">
            <button
              onClick={() => navigate("/contact-us")}
              className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[#ffd02f] hover:bg-[#fcb900] text-[#1c1c1e] text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <span>Contact Compliance Officer</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}