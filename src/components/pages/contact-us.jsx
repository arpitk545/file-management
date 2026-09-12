"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageCircle,
  HelpCircle,
  Users,
  ArrowLeft,
  Loader2,
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { getContactUs, submitContactForm } from "../../services/operations/pagesAPI"
import toast from "react-hot-toast"

const iconMap = {
  Mail,
  Phone,
  MapPin,
  Clock,
  MessageCircle,
  HelpCircle,
  Users,
}

export default function ContactUs() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    category: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [contactInfo, setContactInfo] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const response = await getContactUs()
        if (response) {
          const detailsWithIcons = (response.contactDetails || []).map((item) => ({
            ...item,
            icon: iconMap[item.icon] || Mail,
          }))

          const categoriesWithIcons = (response.categories || []).map((item) => ({
            ...item,
            icon: iconMap[item.icon] || MessageCircle,
          }))

          setContactInfo({
            title: response.hero?.title || "Get in Touch With Us",
            subtitle: response.hero?.subtitle || "We are here to assist with your educational goals.",
            description: response.hero?.description || "Reach out to our support team for questions, institutional inquiries, or technical support.",
            details: detailsWithIcons,
            categories: categoriesWithIcons,
          })
        }
      } catch (err) {
        console.error("Error fetching contact info:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchContactInfo()
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const res = await submitContactForm(formData)

      if (res?.success) {
        toast.success("Thank you for your message! We'll get back to you soon.")
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: "",
          category: "",
        })
      } else {
        throw new Error(res?.message || "Something went wrong.")
      }
    } catch (error) {
      console.error("Form submission error:", error)
      toast.error(error.message || "Submission failed.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f8fa] flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="w-12 h-12 rounded-2xl bg-[#ffd02f] flex items-center justify-center mb-4 shadow-sm animate-pulse">
          <Loader2 className="animate-spin h-6 w-6 text-[#1c1c1e]" />
        </div>
        <p className="text-xs font-bold uppercase tracking-wider text-[#6a6d7c]">Loading contact channels...</p>
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
                CONTACT DIRECTORY
              </span>
              <span className="px-3 py-1 bg-[#ffd8f4] text-[#86296b] text-[11px] font-bold uppercase tracking-wider rounded-full">
                COMMUNICATION HUB
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#1c1c1e] leading-tight">
              {contactInfo?.title || "Let's Start a Conversation"}
            </h1>

            {contactInfo?.subtitle && (
              <p className="text-lg sm:text-xl font-bold text-[#4262ff]">
                {contactInfo.subtitle}
              </p>
            )}

            <p className="text-sm sm:text-base text-[#6a6d7c] leading-relaxed max-w-4xl mx-auto">
              {contactInfo?.description ||
                "Whether you have questions about our quiz bank, contest registration, or academic partnership opportunities, our team is ready to help."}
            </p>
          </div>
        </div>

        {/* Main 2-Column Section */}
        <div className="grid lg:grid-cols-12 gap-8 w-full items-stretch">
          {/* Left Column: Contact Channels Card */}
          <div className="lg:col-span-5 flex flex-col h-full">
            <div className="bg-white border border-[#c7cad5] rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col justify-between h-full space-y-6">
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-[#e6e8ec] pb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2.5 py-0.5 bg-[#c3faf5] text-[#187574] text-[10px] font-black uppercase tracking-wider rounded-full">
                        CHANNELS
                      </span>
                      <span className="text-[11px] font-bold text-[#6a6d7c]">Direct Reach</span>
                    </div>
                    <h3 className="text-xl font-extrabold text-[#1c1c1e]">Our Contact Information</h3>
                    <p className="text-xs text-[#6a6d7c] mt-0.5">
                      Official communication channels for students, faculty & partners.
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-[#fff4c4] border border-[#fde89c] flex items-center justify-center text-[#746019] shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                </div>

                {/* Details List */}
                <div className="space-y-3">
                  {contactInfo?.details?.map((detail, index) => {
                    const IconComponent = detail.icon || Mail
                    return (
                      <div
                        key={index}
                        className="bg-[#f7f8fa] hover:bg-[#fffdf5] border border-[#c7cad5] rounded-2xl p-4 shadow-2xs hover:shadow-sm transition-all flex items-start gap-3.5 group"
                      >
                        <div className="w-10 h-10 rounded-xl bg-[#fff4c4] border border-[#fde89c] flex items-center justify-center text-[#1c1c1e] shrink-0 shadow-2xs">
                          <IconComponent className="h-4 w-4 text-[#746019]" />
                        </div>
                        <div className="space-y-0.5">
                          <h4 className="text-xs font-extrabold text-[#1c1c1e]">{detail?.title}</h4>
                          <p className="text-xs font-bold text-[#4262ff] break-all">{detail?.info}</p>
                          {detail?.description && (
                            <p className="text-[11px] text-[#6a6d7c] leading-relaxed">{detail.description}</p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Quick Support Card anchored to bottom */}
              <div className="bg-[#1c1c1e] text-white rounded-2xl p-5 space-y-2 shadow-md mt-auto">
                <span className="px-2.5 py-0.5 bg-[#ffd02f] text-[#1c1c1e] text-[10px] font-black uppercase tracking-wider rounded-full">
                  INSTITUTIONAL DESK
                </span>
                <h4 className="text-sm font-extrabold text-white">Need School or Bulk Onboarding?</h4>
                <p className="text-[11px] text-white/70 leading-relaxed">
                  We provide custom contest pipelines, bulk student enrollment, and verified examination series for accredited schools and academies.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Send Message Form */}
          <div className="lg:col-span-7 flex flex-col h-full">
            <div className="bg-white border border-[#c7cad5] rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col justify-between h-full space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#e6e8ec] pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 bg-[#ffd8f4] text-[#86296b] text-[10px] font-black uppercase tracking-wider rounded-full">
                      DIRECT DESK
                    </span>
                    <span className="text-[11px] font-bold text-[#6a6d7c]">24h Response</span>
                  </div>
                  <h3 className="text-xl font-extrabold text-[#1c1c1e]">Send us a Message</h3>
                  <p className="text-xs text-[#6a6d7c] mt-0.5">
                    Fill in the form below and an academic advisor will reply within 24 hours.
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-[#c3faf5] border border-[#9eece4] flex items-center justify-center text-[#187574] shrink-0">
                  <Send className="w-4 h-4" />
                </div>
              </div>

              <form onSubmit={handleSubmit} className="text-xs font-sans flex-1 flex flex-col justify-between gap-4">
                <div className="space-y-4 flex-1 flex flex-col">
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#6a6d7c]">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-[#f7f8fa] border border-[#c7cad5] rounded-xl text-xs font-semibold text-[#1c1c1e] placeholder-[#8e91a0] focus:bg-white focus:outline-none focus:border-[#1c1c1e] transition-all"
                      placeholder="Enter your full name"
                    />
                  </div>

                  {/* Email Address */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#6a6d7c]">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-[#f7f8fa] border border-[#c7cad5] rounded-xl text-xs font-semibold text-[#1c1c1e] placeholder-[#8e91a0] focus:bg-white focus:outline-none focus:border-[#1c1c1e] transition-all"
                      placeholder="name@example.com"
                    />
                  </div>

                  {/* Category & Subject in 2 columns */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#6a6d7c]">
                        Inquiry Category <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-[#f7f8fa] border border-[#c7cad5] rounded-xl text-xs font-semibold text-[#1c1c1e] focus:bg-white focus:outline-none focus:border-[#1c1c1e] transition-all"
                      >
                        <option value="">Select category</option>
                        {contactInfo?.categories?.map((cat) => (
                          <option key={cat.value} value={cat.value}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#6a6d7c]">
                        Subject <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-[#f7f8fa] border border-[#c7cad5] rounded-xl text-xs font-semibold text-[#1c1c1e] placeholder-[#8e91a0] focus:bg-white focus:outline-none focus:border-[#1c1c1e] transition-all"
                        placeholder="Brief topic summary"
                      />
                    </div>
                  </div>

                  {/* Message Details: expands flex-1 all the way down to the Submit button */}
                  <div className="space-y-1.5 flex-1 flex flex-col">
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#6a6d7c]">
                      Message Details <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      className="w-full flex-1 p-4 bg-[#f7f8fa] border border-[#c7cad5] rounded-xl text-xs font-semibold text-[#1c1c1e] placeholder-[#8e91a0] focus:bg-white focus:outline-none focus:border-[#1c1c1e] transition-all resize-none leading-relaxed min-h-[140px]"
                      placeholder="Tell us about your question or request..."
                    />
                  </div>
                </div>

                {/* Submit Action directly below the message input */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#ffd02f] hover:bg-[#fcb900] text-[#1c1c1e] text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending Message...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Inquiry</span>
                        <Send className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
