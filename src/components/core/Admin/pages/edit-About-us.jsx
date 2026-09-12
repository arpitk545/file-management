"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { Save, Plus, Trash2, Users, Target, Award, Heart, Globe, Lightbulb, ArrowLeft, BookOpen, Layers } from "lucide-react"
import { getAboutUs, updateAboutUs } from "../../../../services/operations/pagesAPI"
import toast from "react-hot-toast"

const MiroLoader = ({ message = "Loading page content..." }) => (
  <div className="flex flex-col items-center justify-center py-20 gap-3">
    <div className="relative w-12 h-12">
      <div className="w-12 h-12 rounded-full border-4 border-[#eef0f3] border-t-[#ffd02f] border-r-[#1c1c1e] animate-spin" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-3 h-3 rounded-full bg-[#ffd02f]" />
      </div>
    </div>
    <span className="text-xs font-bold uppercase tracking-wider text-[#555a6a]">{message}</span>
  </div>
)

export default function EditAboutUs() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [aboutData, setAboutData] = useState({
    hero: {
      title: "",
      subtitle: "",
      description: "",
    },
    mission: {
      title: "",
      description: "",
    },
    vision: {
      title: "",
      description: "",
    },
    values: [],
    stats: [],
    team: [],
  })

  useEffect(() => {
    const fetchAboutUs = async () => {
      try {
        setIsLoading(true)
        const data = await getAboutUs()
        if (data) setAboutData(data)
      } catch (error) {
        console.error("Failed to fetch About Us:", error)
        toast.error("Failed to load About Us content")
      } finally {
        setIsLoading(false)
      }
    }
    fetchAboutUs()
  }, [])

  const iconOptions = [
    { value: "Heart", label: "Heart", icon: Heart },
    { value: "Users", label: "Users", icon: Users },
    { value: "Lightbulb", label: "Lightbulb", icon: Lightbulb },
    { value: "Globe", label: "Globe", icon: Globe },
    { value: "Target", label: "Target", icon: Target },
    { value: "Award", label: "Award", icon: Award },
  ]

  const handleInputChange = (section, field, value, index = null) => {
    setAboutData((prev) => {
      const newData = { ...prev }
      if (index !== null) {
        newData[section][index][field] = value
      } else if (typeof newData[section][field] === "object") {
        newData[section][field] = value
      } else {
        newData[section] = { ...newData[section], [field]: value }
      }
      return newData
    })
  }

  const addValue = () => {
    setAboutData((prev) => ({
      ...prev,
      values: [
        ...prev.values,
        {
          icon: "Heart",
          title: "",
          description: "",
        },
      ],
    }))
  }

  const removeValue = (index) => {
    setAboutData((prev) => ({
      ...prev,
      values: prev.values.filter((_, i) => i !== index),
    }))
  }

  const addStat = () => {
    setAboutData((prev) => ({
      ...prev,
      stats: [...prev.stats, { number: "", label: "" }],
    }))
  }

  const removeStat = (index) => {
    setAboutData((prev) => ({
      ...prev,
      stats: prev.stats.filter((_, i) => i !== index),
    }))
  }

  const addTeamMember = () => {
    setAboutData((prev) => ({
      ...prev,
      team: [
        ...prev.team,
        {
          name: "",
          role: "",
          description: "",
          image: null,
        },
      ],
    }))
  }

  const removeTeamMember = (index) => {
    setAboutData((prev) => ({
      ...prev,
      team: prev.team.filter((_, i) => i !== index),
    }))
  }

  const handleImageUpload = (file, memberIndex) => {
    if (file) {
      setAboutData((prev) => {
        const newTeam = [...prev.team]
        newTeam[memberIndex].image = file
        return { ...prev, team: newTeam }
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await updateAboutUs(aboutData)
      toast.success("About Us page updated successfully!")
    } catch (error) {
      console.error("Failed to update About Us:", error)
      toast.error("Failed to update About Us page")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f7f8fa] flex items-center justify-center">
        <MiroLoader message="Loading page builder..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#1c1c1e] py-6 sm:py-8 px-4 sm:px-6 lg:px-8 xl:px-12 w-full">
      <div className="w-full space-y-6">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e0e2e8]">
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => navigate("/dashboard")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#c7cad5] text-[#1c1c1e] hover:bg-[#f7f8fa] hover:border-[#1c1c1e] transition-all text-sm font-semibold shadow-sm active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </button>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#ffd02f] text-[#1c1c1e]">
              PAGE BUILDER
            </span>
            <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#ffd8f4] text-[#86296b] border border-[#f3bee5]">
              ABOUT US
            </span>
          </div>
        </div>

        {/* Page Title */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#1c1c1e]">
            Edit About Us Page
          </h1>
          <p className="text-sm sm:text-base text-[#555a6a]">
            Manage hero statements, organizational vision, mission highlights, statistical achievements, and team profiles.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Hero Section Card */}
          <div className="bg-white rounded-2xl border border-[#c7cad5] shadow-sm p-5 sm:p-7 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[#e0e2e8]">
              <Layers className="w-5 h-5 text-[#4262ff]" />
              <h2 className="text-base sm:text-lg font-bold text-[#1c1c1e]">
                Hero Section
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#555a6a]">
                  Hero Title
                </label>
                <input
                  type="text"
                  value={aboutData.hero?.title || ""}
                  onChange={(e) => handleInputChange("hero", "title", e.target.value)}
                  className="w-full h-11 min-h-[44px] px-3.5 text-sm font-semibold rounded-xl border border-[#c7cad5] bg-[#fffdf5] text-[#1c1c1e] focus:border-[#1c1c1e] focus:ring-2 focus:ring-[#ffd02f]/30 focus:outline-none transition-all"
                  placeholder="e.g., Transforming Digital Learning"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#555a6a]">
                  Hero Subtitle
                </label>
                <input
                  type="text"
                  value={aboutData.hero?.subtitle || ""}
                  onChange={(e) => handleInputChange("hero", "subtitle", e.target.value)}
                  className="w-full h-11 min-h-[44px] px-3.5 text-sm font-semibold rounded-xl border border-[#c7cad5] bg-[#fffdf5] text-[#1c1c1e] focus:border-[#1c1c1e] focus:ring-2 focus:ring-[#ffd02f]/30 focus:outline-none transition-all"
                  placeholder="e.g., Empowering students across the nation"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#555a6a]">
                Description
              </label>
              <textarea
                value={aboutData.hero?.description || ""}
                onChange={(e) => handleInputChange("hero", "description", e.target.value)}
                rows={3}
                className="w-full px-3.5 py-3 text-sm font-semibold rounded-xl border border-[#c7cad5] bg-white text-[#1c1c1e] focus:border-[#1c1c1e] focus:ring-2 focus:ring-[#ffd02f]/30 focus:outline-none transition-all resize-none"
                placeholder="Detailed hero introduction..."
              />
            </div>
          </div>

          {/* Mission & Vision Card */}
          <div className="bg-white rounded-2xl border border-[#c7cad5] shadow-sm p-5 sm:p-7 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[#e0e2e8]">
              <Target className="w-5 h-5 text-[#187574]" />
              <h2 className="text-base sm:text-lg font-bold text-[#1c1c1e]">
                Mission & Vision
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Mission */}
              <div className="bg-[#f4fbfb] border border-[#d2f3ee] rounded-xl p-4 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#187574]">Our Mission</h3>
                <input
                  type="text"
                  value={aboutData.mission?.title || ""}
                  onChange={(e) => handleInputChange("mission", "title", e.target.value)}
                  className="w-full h-11 min-h-[44px] px-3.5 text-sm font-semibold rounded-xl border border-[#c7cad5] bg-white text-[#1c1c1e] focus:border-[#1c1c1e] focus:ring-2 focus:ring-[#ffd02f]/30 focus:outline-none transition-all"
                  placeholder="Mission title"
                />
                <textarea
                  value={aboutData.mission?.description || ""}
                  onChange={(e) => handleInputChange("mission", "description", e.target.value)}
                  rows={3}
                  className="w-full px-3.5 py-2.5 text-sm font-semibold rounded-xl border border-[#c7cad5] bg-white text-[#1c1c1e] focus:border-[#1c1c1e] focus:ring-2 focus:ring-[#ffd02f]/30 focus:outline-none transition-all resize-none"
                  placeholder="Mission description..."
                />
              </div>

              {/* Vision */}
              <div className="bg-[#f5f3ff] border border-[#ddd6fe] rounded-xl p-4 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#4262ff]">Our Vision</h3>
                <input
                  type="text"
                  value={aboutData.vision?.title || ""}
                  onChange={(e) => handleInputChange("vision", "title", e.target.value)}
                  className="w-full h-11 min-h-[44px] px-3.5 text-sm font-semibold rounded-xl border border-[#c7cad5] bg-white text-[#1c1c1e] focus:border-[#1c1c1e] focus:ring-2 focus:ring-[#ffd02f]/30 focus:outline-none transition-all"
                  placeholder="Vision title"
                />
                <textarea
                  value={aboutData.vision?.description || ""}
                  onChange={(e) => handleInputChange("vision", "description", e.target.value)}
                  rows={3}
                  className="w-full px-3.5 py-2.5 text-sm font-semibold rounded-xl border border-[#c7cad5] bg-white text-[#1c1c1e] focus:border-[#1c1c1e] focus:ring-2 focus:ring-[#ffd02f]/30 focus:outline-none transition-all resize-none"
                  placeholder="Vision description..."
                />
              </div>
            </div>
          </div>

          {/* Core Values Card */}
          <div className="bg-white rounded-2xl border border-[#c7cad5] shadow-sm p-5 sm:p-7 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#e0e2e8]">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-[#86296b]" />
                <h2 className="text-base sm:text-lg font-bold text-[#1c1c1e]">
                  Core Values ({aboutData.values?.length || 0})
                </h2>
              </div>
              <button
                type="button"
                onClick={addValue}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#ffd02f] hover:bg-[#fcb900] text-[#1c1c1e] text-xs font-bold transition-all shadow-sm active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Value</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {aboutData.values?.map((val, index) => (
                <div key={index} className="bg-[#f7f8fa] border border-[#e0e2e8] rounded-xl p-4 space-y-3 relative">
                  <button
                    type="button"
                    onClick={() => removeValue(index)}
                    className="absolute top-3 right-3 p-1 rounded-full text-[#800000] hover:bg-[#fbd4d4] transition-all"
                    title="Remove Value"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="pr-8 space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#555a6a]">
                      Value Title
                    </label>
                    <input
                      type="text"
                      value={val.title}
                      onChange={(e) => handleInputChange("values", "title", e.target.value, index)}
                      className="w-full h-10 min-h-[40px] px-3 text-sm font-semibold rounded-xl border border-[#c7cad5] bg-white text-[#1c1c1e] focus:border-[#1c1c1e] focus:ring-2 focus:ring-[#ffd02f]/30 focus:outline-none transition-all"
                      placeholder="e.g., Integrity & Excellence"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#555a6a]">
                      Description
                    </label>
                    <textarea
                      value={val.description}
                      onChange={(e) => handleInputChange("values", "description", e.target.value, index)}
                      rows={2}
                      className="w-full px-3 py-2 text-sm font-semibold rounded-xl border border-[#c7cad5] bg-white text-[#1c1c1e] focus:border-[#1c1c1e] focus:ring-2 focus:ring-[#ffd02f]/30 focus:outline-none transition-all resize-none"
                      placeholder="Brief description..."
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats Card */}
          <div className="bg-white rounded-2xl border border-[#c7cad5] shadow-sm p-5 sm:p-7 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#e0e2e8]">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-[#b8860b]" />
                <h2 className="text-base sm:text-lg font-bold text-[#1c1c1e]">
                  Key Statistics ({aboutData.stats?.length || 0})
                </h2>
              </div>
              <button
                type="button"
                onClick={addStat}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#ffd02f] hover:bg-[#fcb900] text-[#1c1c1e] text-xs font-bold transition-all shadow-sm active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Statistic</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {aboutData.stats?.map((stat, index) => (
                <div key={index} className="bg-[#fffdf5] border border-[#fde89c] rounded-xl p-3.5 space-y-2 relative">
                  <button
                    type="button"
                    onClick={() => removeStat(index)}
                    className="absolute top-2 right-2 p-1 rounded-full text-[#800000] hover:bg-[#fbd4d4] transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <input
                    type="text"
                    value={stat.number}
                    onChange={(e) => handleInputChange("stats", "number", e.target.value, index)}
                    className="w-full h-10 px-3 text-sm font-bold rounded-lg border border-[#c7cad5] bg-white text-[#1c1c1e] focus:border-[#1c1c1e] focus:outline-none"
                    placeholder="e.g., 50K+"
                  />
                  <input
                    type="text"
                    value={stat.label}
                    onChange={(e) => handleInputChange("stats", "label", e.target.value, index)}
                    className="w-full h-9 px-3 text-xs font-semibold rounded-lg border border-[#c7cad5] bg-white text-[#555a6a] focus:border-[#1c1c1e] focus:outline-none"
                    placeholder="e.g., Active Students"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Team Members Card */}
          <div className="bg-white rounded-2xl border border-[#c7cad5] shadow-sm p-5 sm:p-7 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#e0e2e8]">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#4262ff]" />
                <h2 className="text-base sm:text-lg font-bold text-[#1c1c1e]">
                  Team Members ({aboutData.team?.length || 0})
                </h2>
              </div>
              <button
                type="button"
                onClick={addTeamMember}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#ffd02f] hover:bg-[#fcb900] text-[#1c1c1e] text-xs font-bold transition-all shadow-sm active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Member</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {aboutData.team?.map((member, index) => (
                <div key={index} className="bg-[#f7f8fa] border border-[#e0e2e8] rounded-xl p-4 space-y-3 relative">
                  <button
                    type="button"
                    onClick={() => removeTeamMember(index)}
                    className="absolute top-3 right-3 p-1 rounded-full text-[#800000] hover:bg-[#fbd4d4] transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="grid grid-cols-2 gap-3 pr-8">
                    <input
                      type="text"
                      value={member.name}
                      onChange={(e) => handleInputChange("team", "name", e.target.value, index)}
                      className="w-full h-10 px-3 text-sm font-semibold rounded-lg border border-[#c7cad5] bg-white text-[#1c1c1e] focus:border-[#1c1c1e] focus:outline-none"
                      placeholder="Full Name"
                    />
                    <input
                      type="text"
                      value={member.role}
                      onChange={(e) => handleInputChange("team", "role", e.target.value, index)}
                      className="w-full h-10 px-3 text-sm font-semibold rounded-lg border border-[#c7cad5] bg-white text-[#1c1c1e] focus:border-[#1c1c1e] focus:outline-none"
                      placeholder="Role / Title"
                    />
                  </div>
                  <textarea
                    value={member.description}
                    onChange={(e) => handleInputChange("team", "description", e.target.value, index)}
                    rows={2}
                    className="w-full px-3 py-2 text-sm font-semibold rounded-lg border border-[#c7cad5] bg-white text-[#1c1c1e] focus:border-[#1c1c1e] focus:outline-none resize-none"
                    placeholder="Short bio or responsibilities..."
                  />
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e.target.files[0], index)}
                      className="text-xs text-[#555a6a] file:mr-3 file:py-1.5 file:px-3.5 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-[#ffd02f] file:text-[#1c1c1e] hover:file:bg-[#fcb900] cursor-pointer"
                    />
                    {member.image && (
                      <span className="text-xs text-[#187574] font-semibold ml-2">
                        ✓ Image selected
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Centered Bottom Action Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white border border-[#c7cad5] text-[#1c1c1e] hover:bg-[#f7f8fa] font-semibold text-sm shadow-sm transition-all active:scale-95 text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-10 py-3.5 rounded-full bg-[#ffd02f] hover:bg-[#fcb900] text-[#1c1c1e] font-extrabold text-sm shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#1c1c1e] border-t-transparent rounded-full animate-spin" />
                  <span>Updating About Us...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-[#1c1c1e]" />
                  <span>Update About Us</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
