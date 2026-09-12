"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { Save, Plus, Trash2, AlertTriangle, Info, BookOpen, Users, Shield, ExternalLink, ArrowLeft, Layers } from "lucide-react"
import { getDisclaimer, updateDisclaimer } from "../../../../services/operations/pagesAPI"
import toast from "react-hot-toast"

const MiroLoader = ({ message = "Loading disclaimer content..." }) => (
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

export default function EditDisclaimer() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const [disclaimerData, setDisclaimerData] = useState({
    header: {
      title: "",
      description: "",
    },
    sections: [],
    importantNotice: {
      title: "",
      content: "",
    },
  })

  useEffect(() => {
    const fetchDisclaimer = async () => {
      try {
        setIsLoading(true)
        const res = await getDisclaimer()
        if (res && res.header && res.sections) {
          setDisclaimerData({
            header: res.header,
            sections: res.sections,
            importantNotice: res.importantNotice || { title: "", content: "" },
          })
        }
      } catch (error) {
        console.error("Failed to fetch disclaimer:", error)
        toast.error("Failed to load disclaimer content")
      } finally {
        setIsLoading(false)
      }
    }

    fetchDisclaimer()
  }, [])

  const handleInputChange = (section, field, value, index = null) => {
    setDisclaimerData((prev) => {
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
    setDisclaimerData((prev) => ({
      ...prev,
      sections: [
        ...prev.sections,
        {
          icon: "Info",
          title: "",
          content: "",
        },
      ],
    }))
  }

  const removeSection = (index) => {
    setDisclaimerData((prev) => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const res = await updateDisclaimer(disclaimerData)
      if (res?.message === "Disclaimer updated successfully" || res) {
        toast.success("Disclaimer updated successfully!")
      } else {
        toast.error("Failed to update disclaimer. Please try again.")
      }
    } catch (error) {
      console.error("Update failed:", error)
      toast.error("An unexpected error occurred.")
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
            <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#fff8e0] text-[#746019] border border-[#fde89c]">
              DISCLAIMER
            </span>
          </div>
        </div>

        {/* Page Title */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#1c1c1e]">
            Edit Disclaimer Page
          </h1>
          <p className="text-sm sm:text-base text-[#555a6a]">
            Manage platform liability disclosures, educational usage disclaimers, and legal statutory notices.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Header Card */}
          <div className="bg-white rounded-2xl border border-[#c7cad5] shadow-sm p-5 sm:p-7 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[#e0e2e8]">
              <Layers className="w-5 h-5 text-[#4262ff]" />
              <h2 className="text-base sm:text-lg font-bold text-[#1c1c1e]">
                Header Disclosure
              </h2>
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#555a6a]">
                Title
              </label>
              <input
                type="text"
                value={disclaimerData.header?.title || ""}
                onChange={(e) => handleInputChange("header", "title", e.target.value)}
                className="w-full h-11 min-h-[44px] px-3.5 text-sm font-semibold rounded-xl border border-[#c7cad5] bg-[#fffdf5] text-[#1c1c1e] focus:border-[#1c1c1e] focus:ring-2 focus:ring-[#ffd02f]/30 focus:outline-none transition-all"
                placeholder="e.g., Legal Disclaimer & Educational Use"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#555a6a]">
                Overview Description
              </label>
              <textarea
                value={disclaimerData.header?.description || ""}
                onChange={(e) => handleInputChange("header", "description", e.target.value)}
                rows={3}
                className="w-full px-3.5 py-3 text-sm font-semibold rounded-xl border border-[#c7cad5] bg-white text-[#1c1c1e] focus:border-[#1c1c1e] focus:ring-2 focus:ring-[#ffd02f]/30 focus:outline-none transition-all resize-none"
                placeholder="Overview text explaining disclaimer applicability..."
              />
            </div>
          </div>

          {/* Important Notice Callout Card */}
          <div className="bg-[#fffdf5] rounded-2xl border border-[#fde89c] shadow-sm p-5 sm:p-7 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[#fde89c]">
              <AlertTriangle className="w-5 h-5 text-[#b8860b]" />
              <h2 className="text-base sm:text-lg font-bold text-[#746019]">
                Important Notice Banner
              </h2>
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#746019]">
                Notice Headline
              </label>
              <input
                type="text"
                value={disclaimerData.importantNotice?.title || ""}
                onChange={(e) => handleInputChange("importantNotice", "title", e.target.value)}
                className="w-full h-11 min-h-[44px] px-3.5 text-sm font-semibold rounded-xl border border-[#c7cad5] bg-white text-[#1c1c1e] focus:border-[#1c1c1e] focus:outline-none"
                placeholder="e.g., Please Read Carefully"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#746019]">
                Notice Body
              </label>
              <textarea
                value={disclaimerData.importantNotice?.content || ""}
                onChange={(e) => handleInputChange("importantNotice", "content", e.target.value)}
                rows={3}
                className="w-full px-3.5 py-3 text-sm font-semibold rounded-xl border border-[#c7cad5] bg-white text-[#1c1c1e] focus:border-[#1c1c1e] focus:outline-none resize-none"
                placeholder="Critical legal notification..."
              />
            </div>
          </div>

          {/* Policy Sections Card */}
          <div className="bg-white rounded-2xl border border-[#c7cad5] shadow-sm p-5 sm:p-7 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#e0e2e8]">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-[#4262ff]" />
                <h2 className="text-base sm:text-lg font-bold text-[#1c1c1e]">
                  Disclaimer Clauses ({disclaimerData.sections?.length || 0})
                </h2>
              </div>
              <button
                type="button"
                onClick={addSection}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#ffd02f] hover:bg-[#fcb900] text-[#1c1c1e] text-xs font-bold transition-all shadow-sm active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Clause</span>
              </button>
            </div>

            <div className="space-y-4">
              {disclaimerData.sections?.map((sec, index) => (
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
                      Clause #{index + 1} Heading
                    </label>
                    <input
                      type="text"
                      value={sec.title}
                      onChange={(e) => handleInputChange("sections", "title", e.target.value, index)}
                      className="w-full h-10 px-3 text-sm font-semibold rounded-lg border border-[#c7cad5] bg-white text-[#1c1c1e] focus:border-[#1c1c1e] focus:outline-none"
                      placeholder="e.g., No Academic Guarantee"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#555a6a]">
                      Clause Text
                    </label>
                    <textarea
                      value={sec.content}
                      onChange={(e) => handleInputChange("sections", "content", e.target.value, index)}
                      rows={3}
                      className="w-full px-3 py-2 text-sm font-semibold rounded-lg border border-[#c7cad5] bg-white text-[#1c1c1e] focus:border-[#1c1c1e] focus:outline-none resize-none"
                      placeholder="Detailed statement..."
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
                  <span>Updating Disclaimer...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-[#1c1c1e]" />
                  <span>Update Disclaimer</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
