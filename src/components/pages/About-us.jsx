"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Users,
  Target,
  Award,
  Heart,
  Globe,
  Lightbulb,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Loader2,
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { getAboutUs } from "../../services/operations/pagesAPI"

const iconMap = {
  Heart,
  Users,
  Lightbulb,
  Globe,
  Target,
  Award,
}

export default function AboutUs() {
  const navigate = useNavigate()
  const [aboutData, setAboutData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAboutUs() {
      try {
        const data = await getAboutUs()
        if (data) {
          data.values = (data.values || []).map((v) => ({
            ...v,
            icon: iconMap[v.icon] || Heart,
          }))
          data.team = (data.team || []).map((t) => ({
            ...t,
            image: t.image || "/placeholder.svg?height=300&width=300",
          }))
          setAboutData(data)
        }
      } catch (err) {
        console.error("Failed to load About Us:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchAboutUs()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f8fa] flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="w-12 h-12 rounded-2xl bg-[#ffd02f] flex items-center justify-center mb-4 shadow-sm animate-pulse">
          <Loader2 className="animate-spin h-6 w-6 text-[#1c1c1e]" />
        </div>
        <p className="text-xs font-bold uppercase tracking-wider text-[#6a6d7c]">Loading story & mission...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#1c1c1e] py-6 sm:py-10 px-4 sm:px-6 lg:px-8 xl:px-12 w-full font-sans">
      <div className="w-full space-y-12">
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
                ABOUT CLYS
              </span>
              <span className="px-3 py-1 bg-[#c3faf5] text-[#187574] text-[11px] font-bold uppercase tracking-wider rounded-full">
                ACADEMIC EXCELLENCE
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#1c1c1e] leading-tight">
              {aboutData?.hero?.title || "Empowering the Next Generation of Learners"}
            </h1>

            {aboutData?.hero?.subtitle && (
              <p className="text-lg sm:text-xl font-bold text-[#4262ff]">
                {aboutData.hero.subtitle}
              </p>
            )}

            <p className="text-sm sm:text-base text-[#6a6d7c] leading-relaxed max-w-4xl mx-auto">
              {aboutData?.hero?.description ||
                "Our platform bridges the gap between academic curriculum and high-impact retrieval practice with interactive tools, quizzes, and verified notes."}
            </p>
          </div>
        </div>

        {/* Platform Metrics Bar */}
        {aboutData?.stats?.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
            {aboutData.stats.map((stat, index) => {
              const bgColors = ["bg-[#fff4c4]", "bg-[#c3faf5]", "bg-[#ffd8f4]", "bg-[#e1f0ff]"]
              return (
                <div
                  key={index}
                  className="bg-white border border-[#c7cad5] rounded-2xl p-5 text-center shadow-sm hover:shadow-md transition-all"
                >
                  <div
                    className={`w-10 h-10 ${bgColors[index % bgColors.length]} rounded-xl mx-auto flex items-center justify-center text-[#1c1c1e] font-black mb-3 border border-[#c7cad5]/50`}
                  >
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-[#1c1c1e] tracking-tight mb-1">
                    {stat.number}
                  </div>
                  <div className="text-xs font-bold uppercase tracking-wider text-[#6a6d7c]">
                    {stat.label}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Mission & Vision Section */}
        <div className="grid md:grid-cols-2 gap-6 w-full">
          {aboutData?.mission && (
            <div className="bg-white border border-[#c7cad5] rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-[#ffd02f] border border-[#fde89c] flex items-center justify-center text-[#1c1c1e] shadow-sm">
                  <Target className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#746019]">PURPOSE & FOCUS</span>
                  <h3 className="text-xl font-extrabold text-[#1c1c1e] leading-tight">
                    {aboutData.mission.title || "Our Mission"}
                  </h3>
                </div>
              </div>
              <p className="text-sm text-[#6a6d7c] leading-relaxed">
                {aboutData.mission.description}
              </p>
            </div>
          )}

          {aboutData?.vision && (
            <div className="bg-white border border-[#c7cad5] rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-[#c3faf5] border border-[#9eece4] flex items-center justify-center text-[#187574] shadow-sm">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#187574]">LOOKING FORWARD</span>
                  <h3 className="text-xl font-extrabold text-[#1c1c1e] leading-tight">
                    {aboutData.vision.title || "Our Vision"}
                  </h3>
                </div>
              </div>
              <p className="text-sm text-[#6a6d7c] leading-relaxed">
                {aboutData.vision.description}
              </p>
            </div>
          )}
        </div>

        {/* Core Values Section */}
        {aboutData?.values?.length > 0 && (
          <div className="w-full space-y-6">
            <div className="text-center space-y-2">
              <span className="px-3 py-1 bg-[#ffd8f4] text-[#86296b] text-[11px] font-black uppercase tracking-widest rounded-full">
                FOUNDATIONAL VALUES
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#1c1c1e]">What We Stand For</h3>
              <p className="text-xs sm:text-sm text-[#6a6d7c] max-w-xl mx-auto">
                These core tenets shape our pedagogical standards and platform features.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {aboutData.values.map((val, idx) => {
                const IconComponent = val.icon || Heart
                return (
                  <div
                    key={idx}
                    className="bg-white border border-[#c7cad5] rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#f0f1f4] border border-[#c7cad5] flex items-center justify-center text-[#1c1c1e]">
                      <IconComponent className="w-5 h-5 text-[#4262ff]" />
                    </div>
                    <div>
                      <h4 className="text-base font-extrabold text-[#1c1c1e] mb-1">{val.title}</h4>
                      <p className="text-xs text-[#6a6d7c] leading-relaxed">{val.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Team Section */}
        {aboutData?.team?.length > 0 && (
          <div className="w-full space-y-6">
            <div className="text-center space-y-2">
              <span className="px-3 py-1 bg-[#fff4c4] text-[#746019] text-[11px] font-black uppercase tracking-widest rounded-full">
                LEADERSHIP & ADVISORS
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#1c1c1e]">Meet Our Educators</h3>
              <p className="text-xs sm:text-sm text-[#6a6d7c] max-w-xl mx-auto">
                Guided by seasoned academic reviewers and educational technologists.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
              {aboutData.team.map((member, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-[#c7cad5] rounded-2xl p-6 shadow-sm hover:shadow-md transition-all text-center space-y-4"
                >
                  <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-2 border-[#ffd02f] shadow-sm bg-[#f7f8fa]">
                    <img
                      src={
                        typeof member.image === "string"
                          ? member.image
                          : member.image?.secure_url || "/placeholder.svg"
                      }
                      alt={member.name || "Team member"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="text-lg font-extrabold text-[#1c1c1e]">{member.name}</h4>
                    <p className="text-xs font-bold text-[#4262ff] uppercase tracking-wider mt-0.5">
                      {member.role}
                    </p>
                    {member.description && (
                      <p className="text-xs text-[#6a6d7c] leading-relaxed mt-2.5">
                        {member.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom CTA Banner */}
        <div className="w-full bg-[#1c1c1e] text-white rounded-3xl p-8 sm:p-12 text-center space-y-5 shadow-xl">
          <span className="px-3 py-1 bg-[#ffd02f] text-[#1c1c1e] text-[10px] font-black uppercase tracking-wider rounded-full inline-block">
            GET STARTED
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white max-w-xl mx-auto">
            Ready to Accelerate Your Academic Journey?
          </h2>
          <p className="text-xs sm:text-sm text-white/70 max-w-lg mx-auto">
            Join thousands of active students competing in live quizzes, downloading verified resources, and mastering difficult concepts.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => navigate("/signup")}
              className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-[#ffd02f] hover:bg-[#fcb900] text-[#1c1c1e] text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Create Free Account</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate("/contact-us")}
              className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
            >
              Contact Our Team
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
