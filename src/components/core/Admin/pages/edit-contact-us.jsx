"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { Save, Plus, Trash2, Mail, Phone, MapPin, Clock, MessageCircle, HelpCircle, Users, ArrowLeft, Layers, Sparkles } from "lucide-react"
import toast from "react-hot-toast"
import { getContactUs, updateContactUs } from "../../../../services/operations/pagesAPI"

const MiroLoader = ({ message = "Loading contact page content..." }) => (
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

export default function EditContactUs() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const [contactData, setContactData] = useState({
    hero: {
      title: "",
      subtitle: "",
      description: "",
    },
    contactDetails: [],
    categories: [],
  })

  const iconOptions = [
    { value: "Mail", label: "Mail", icon: Mail },
    { value: "Phone", label: "Phone", icon: Phone },
    { value: "MapPin", label: "Map Pin", icon: MapPin },
    { value: "Clock", label: "Clock", icon: Clock },
    { value: "MessageCircle", label: "Message Circle", icon: MessageCircle },
    { value: "HelpCircle", label: "Help Circle", icon: HelpCircle },
    { value: "Users", label: "Users", icon: Users },
  ]

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const data = await getContactUs()
        if (data) setContactData(data)
      } catch (error) {
        toast.error("Failed to fetch contact data.")
        console.error("getContactUs error:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleInputChange = (section, field, value, index = null) => {
    setContactData((prev) => {
      const newData = { ...prev }
      if (index !== null) {
        newData[section][index][field] = value
      } else {
        newData[section] = { ...newData[section], [field]: value }
      }
      return newData
    })
  }

  const addContactDetail = () => {
    setContactData((prev) => ({
      ...prev,
      contactDetails: [
        ...prev.contactDetails,
        {
          icon: "Mail",
          title: "",
          info: "",
          description: "",
        },
      ],
    }))
  }

  const removeContactDetail = (index) => {
    setContactData((prev) => ({
      ...prev,
      contactDetails: prev.contactDetails.filter((_, i) => i !== index),
    }))
  }

  const addCategory = () => {
    setContactData((prev) => ({
      ...prev,
      categories: [
        ...prev.categories,
        {
          value: "",
          label: "",
          icon: "MessageCircle",
        },
      ],
    }))
  }

  const removeCategory = (index) => {
    setContactData((prev) => ({
      ...prev,
      categories: prev.categories.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await updateContactUs(contactData)
      toast.success("Contact Us page updated successfully!")
    } catch (error) {
      console.error("Failed to update Contact Us:", error)
      toast.error("Failed to update Contact Us page")
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
              CONTACT US
            </span>
          </div>
        </div>

        {/* Page Title */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#1c1c1e]">
            Edit Contact Us Page
          </h1>
          <p className="text-sm sm:text-base text-[#555a6a]">
            Configure support channels, direct contact coordinates, communication hours, and inquiry topic categories.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Hero Card */}
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
                  value={contactData.hero?.title || ""}
                  onChange={(e) => handleInputChange("hero", "title", e.target.value)}
                  className="w-full h-11 min-h-[44px] px-3.5 text-sm font-semibold rounded-xl border border-[#c7cad5] bg-[#fffdf5] text-[#1c1c1e] focus:border-[#1c1c1e] focus:ring-2 focus:ring-[#ffd02f]/30 focus:outline-none transition-all"
                  placeholder="e.g., Get in Touch with Our Team"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#555a6a]">
                  Hero Subtitle
                </label>
                <input
                  type="text"
                  value={contactData.hero?.subtitle || ""}
                  onChange={(e) => handleInputChange("hero", "subtitle", e.target.value)}
                  className="w-full h-11 min-h-[44px] px-3.5 text-sm font-semibold rounded-xl border border-[#c7cad5] bg-[#fffdf5] text-[#1c1c1e] focus:border-[#1c1c1e] focus:ring-2 focus:ring-[#ffd02f]/30 focus:outline-none transition-all"
                  placeholder="e.g., We are here to assist you 24/7"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#555a6a]">
                Description
              </label>
              <textarea
                value={contactData.hero?.description || ""}
                onChange={(e) => handleInputChange("hero", "description", e.target.value)}
                rows={3}
                className="w-full px-3.5 py-3 text-sm font-semibold rounded-xl border border-[#c7cad5] bg-white text-[#1c1c1e] focus:border-[#1c1c1e] focus:ring-2 focus:ring-[#ffd02f]/30 focus:outline-none transition-all resize-none"
                placeholder="Brief introduction displayed on top of the contact form..."
              />
            </div>
          </div>

          {/* Contact Details Card */}
          <div className="bg-white rounded-2xl border border-[#c7cad5] shadow-sm p-5 sm:p-7 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#e0e2e8]">
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-[#187574]" />
                <h2 className="text-base sm:text-lg font-bold text-[#1c1c1e]">
                  Contact Information Cards ({contactData.contactDetails?.length || 0})
                </h2>
              </div>
              <button
                type="button"
                onClick={addContactDetail}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#ffd02f] hover:bg-[#fcb900] text-[#1c1c1e] text-xs font-bold transition-all shadow-sm active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Channel</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {contactData.contactDetails?.map((detail, index) => (
                <div key={index} className="bg-[#f7f8fa] border border-[#e0e2e8] rounded-xl p-4 space-y-3 relative">
                  <button
                    type="button"
                    onClick={() => removeContactDetail(index)}
                    className="absolute top-3 right-3 p-1 rounded-full text-[#800000] hover:bg-[#fbd4d4] transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="grid grid-cols-2 gap-3 pr-8">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#555a6a] mb-1">
                        Channel Name
                      </label>
                      <input
                        type="text"
                        value={detail.title}
                        onChange={(e) => handleInputChange("contactDetails", "title", e.target.value, index)}
                        className="w-full h-10 px-3 text-sm font-semibold rounded-lg border border-[#c7cad5] bg-white text-[#1c1c1e] focus:border-[#1c1c1e] focus:outline-none"
                        placeholder="e.g., Email Support"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#555a6a] mb-1">
                        Display Value
                      </label>
                      <input
                        type="text"
                        value={detail.info}
                        onChange={(e) => handleInputChange("contactDetails", "info", e.target.value, index)}
                        className="w-full h-10 px-3 text-sm font-semibold rounded-lg border border-[#c7cad5] bg-white text-[#1c1c1e] focus:border-[#1c1c1e] focus:outline-none"
                        placeholder="e.g., support@domain.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#555a6a] mb-1">
                      Description / Availability
                    </label>
                    <input
                      type="text"
                      value={detail.description}
                      onChange={(e) => handleInputChange("contactDetails", "description", e.target.value, index)}
                      className="w-full h-10 px-3 text-sm font-semibold rounded-lg border border-[#c7cad5] bg-white text-[#1c1c1e] focus:border-[#1c1c1e] focus:outline-none"
                      placeholder="e.g., Mon - Fri, 9:00 AM - 6:00 PM"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Inquiry Categories Card */}
          <div className="bg-white rounded-2xl border border-[#c7cad5] shadow-sm p-5 sm:p-7 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#e0e2e8]">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-[#86296b]" />
                <h2 className="text-base sm:text-lg font-bold text-[#1c1c1e]">
                  Topic Categories ({contactData.categories?.length || 0})
                </h2>
              </div>
              <button
                type="button"
                onClick={addCategory}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#ffd02f] hover:bg-[#fcb900] text-[#1c1c1e] text-xs font-bold transition-all shadow-sm active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Category</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {contactData.categories?.map((cat, index) => (
                <div key={index} className="bg-[#fdf6fa] border border-[#f7d6ee] rounded-xl p-3.5 space-y-2 relative">
                  <button
                    type="button"
                    onClick={() => removeCategory(index)}
                    className="absolute top-2 right-2 p-1 rounded-full text-[#800000] hover:bg-[#fbd4d4] transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <input
                    type="text"
                    value={cat.label}
                    onChange={(e) => handleInputChange("categories", "label", e.target.value, index)}
                    className="w-full h-10 px-3 text-sm font-bold rounded-lg border border-[#c7cad5] bg-white text-[#1c1c1e] focus:border-[#1c1c1e] focus:outline-none"
                    placeholder="Category label (e.g. Bug Report)"
                  />
                  <input
                    type="text"
                    value={cat.value}
                    onChange={(e) => handleInputChange("categories", "value", e.target.value, index)}
                    className="w-full h-9 px-3 text-xs font-semibold rounded-lg border border-[#c7cad5] bg-white text-[#555a6a] focus:border-[#1c1c1e] focus:outline-none"
                    placeholder="Key value (e.g. bug)"
                  />
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
                  <span>Updating Contact Us...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-[#1c1c1e]" />
                  <span>Update Contact Us</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
