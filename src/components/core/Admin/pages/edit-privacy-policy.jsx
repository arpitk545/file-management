"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { Save, Plus, Trash2, Shield, Lock, Eye, FileText, Users, AlertCircle, ArrowLeft, Layers } from "lucide-react"
import toast from "react-hot-toast"
import { getPrivacyPolicy, updatePrivacyPolicy } from "../../../../services/operations/pagesAPI"

const MiroLoader = ({ message = "Loading privacy policy..." }) => (
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

export default function EditPrivacyPolicy() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const [privacyData, setPrivacyData] = useState({
    header: {
      title: "",
      description: "",
    },
    sections: [],
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const res = await getPrivacyPolicy()
        if (res) {
          setPrivacyData(res)
        }
      } catch (err) {
        toast.error("Failed to load privacy policy.")
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleInputChange = (section, field, value, index = null) => {
    setPrivacyData((prev) => {
      const newData = { ...prev }
      if (index !== null) {
        newData[section][index][field] = value
      } else {
        newData[section] = { ...newData[section], [field]: value }
      }
      return newData
    })
  }

  const addSection = () => {
    setPrivacyData((prev) => ({
      ...prev,
      sections: [
        ...prev.sections,
        {
          icon: "FileText",
          title: "",
          content: "",
        },
      ],
    }))
  }

  const removeSection = (index) => {
    setPrivacyData((prev) => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const res = await updatePrivacyPolicy(privacyData)
      if (res?._id && res?.updatedAt) {
        toast.success("Privacy Policy updated successfully!")
        navigate("/dashboard")
      } else {
        toast.error("Update failed. Please try again.")
      }
    } catch (err) {
      console.error("Update error:", err)
      toast.error("Something went wrong while updating.")
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
            <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#c3faf5] text-[#187574] border border-[#9eece4]">
              PRIVACY POLICY
            </span>
          </div>
        </div>

        {/* Page Title */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#1c1c1e]">
            Edit Privacy Policy Page
          </h1>
          <p className="text-sm sm:text-base text-[#555a6a]">
            Define user privacy standards, data collection rules, cookie practices, and personal data storage protocols.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Header Section Card */}
          <div className="bg-white rounded-2xl border border-[#c7cad5] shadow-sm p-5 sm:p-7 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[#e0e2e8]">
              <Layers className="w-5 h-5 text-[#4262ff]" />
              <h2 className="text-base sm:text-lg font-bold text-[#1c1c1e]">
                Policy Header
              </h2>
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#555a6a]">
                Policy Title
              </label>
              <input
                type="text"
                value={privacyData.header?.title || ""}
                onChange={(e) => handleInputChange("header", "title", e.target.value)}
                className="w-full h-11 min-h-[44px] px-3.5 text-sm font-semibold rounded-xl border border-[#c7cad5] bg-[#fffdf5] text-[#1c1c1e] focus:border-[#1c1c1e] focus:ring-2 focus:ring-[#ffd02f]/30 focus:outline-none transition-all"
                placeholder="e.g., Privacy & Data Protection Policy"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#555a6a]">
                Summary / Preamble
              </label>
              <textarea
                value={privacyData.header?.description || ""}
                onChange={(e) => handleInputChange("header", "description", e.target.value)}
                rows={3}
                className="w-full px-3.5 py-3 text-sm font-semibold rounded-xl border border-[#c7cad5] bg-white text-[#1c1c1e] focus:border-[#1c1c1e] focus:ring-2 focus:ring-[#ffd02f]/30 focus:outline-none transition-all resize-none"
                placeholder="Overview of how student and user information is protected..."
              />
            </div>
          </div>

          {/* Policy Clauses Card */}
          <div className="bg-white rounded-2xl border border-[#c7cad5] shadow-sm p-5 sm:p-7 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#e0e2e8]">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#187574]" />
                <h2 className="text-base sm:text-lg font-bold text-[#1c1c1e]">
                  Policy Sections ({privacyData.sections?.length || 0})
                </h2>
              </div>
              <button
                type="button"
                onClick={addSection}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#ffd02f] hover:bg-[#fcb900] text-[#1c1c1e] text-xs font-bold transition-all shadow-sm active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Section</span>
              </button>
            </div>

            <div className="space-y-4">
              {privacyData.sections?.map((sec, index) => (
                <div key={index} className="bg-[#f7f8fa] border border-[#e0e2e8] rounded-xl p-4 space-y-3 relative">
                  <button
                    type="button"
                    onClick={() => removeSection(index)}
                    className="absolute top-3 right-3 p-1 rounded-full text-[#800000] hover:bg-[#fbd4d4] transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="pr-8 space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#555a6a]">
                      Section #{index + 1} Heading
                    </label>
                    <input
                      type="text"
                      value={sec.title}
                      onChange={(e) => handleInputChange("sections", "title", e.target.value, index)}
                      className="w-full h-10 px-3 text-sm font-semibold rounded-lg border border-[#c7cad5] bg-white text-[#1c1c1e] focus:border-[#1c1c1e] focus:outline-none"
                      placeholder="e.g., Information We Collect"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#555a6a]">
                      Policy Text
                    </label>
                    <textarea
                      value={sec.content}
                      onChange={(e) => handleInputChange("sections", "content", e.target.value, index)}
                      rows={3}
                      className="w-full px-3 py-2 text-sm font-semibold rounded-lg border border-[#c7cad5] bg-white text-[#1c1c1e] focus:border-[#1c1c1e] focus:outline-none resize-none"
                      placeholder="Policy provisions, consent requirements, data handling methods..."
                    />
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
                  <span>Updating Privacy Policy...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-[#1c1c1e]" />
                  <span>Update Privacy Policy</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
