"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"
import {
  Trash2,
  Mail,
  User,
  MessageSquare,
  Tag,
  Calendar,
  AlertCircle,
  Search,
  Filter,
  ArrowLeft,
  ChevronDown,
  RefreshCw
} from "lucide-react"
import toast from "react-hot-toast"
import { getContactMessages, deleteContactByEmail } from "../../../../services/operations/pagesAPI"

const MiroLoader = ({ message = "Loading messages..." }) => (
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

const GetMessage = ({ initialMessages = [] }) => {
  const navigate = useNavigate()
  const [messages, setMessages] = useState(initialMessages)
  const [loadingStates, setLoadingStates] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  const fetchMessages = async () => {
    setIsLoading(true)
    try {
      const data = await getContactMessages()
      setMessages(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error("Failed to load messages:", err)
      toast.error("Failed to load contact messages.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMessages()
  }, [])

  const categories = [
    { value: "all", label: "All Categories", badgeClass: "bg-[#f7f8fa] text-[#555a6a] border-[#e0e2e8]" },
    { value: "general", label: "General", badgeClass: "bg-[#f5f3ff] text-[#4262ff] border-[#ddd6fe]" },
    { value: "feature", label: "Feature Request", badgeClass: "bg-[#c3faf5] text-[#187574] border-[#9eece4]" },
    { value: "bug", label: "Bug Report", badgeClass: "bg-[#fbd4d4] text-[#800000] border-[#e3c5c5]" },
    { value: "support", label: "Support", badgeClass: "bg-[#fff8e0] text-[#746019] border-[#fde89c]" },
  ]

  const getCategoryBadge = (category) => {
    const match = categories.find((c) => c.value === (category || "").toLowerCase())
    return match ? match.badgeClass : "bg-[#f7f8fa] text-[#555a6a] border-[#e0e2e8]"
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleDelete = async (email) => {
    if (!window.confirm(`Are you sure you want to delete message from ${email}?`)) return

    setLoadingStates((prev) => ({ ...prev, [email]: true }))
    try {
      await deleteContactByEmail(email)
      setMessages((prev) => prev.filter((msg) => msg.email !== email))
      toast.success("Message deleted successfully")
    } catch (error) {
      console.error(error)
      toast.error("Failed to delete message")
    } finally {
      setLoadingStates((prev) => ({ ...prev, [email]: false }))
    }
  }

  const filteredMessages = messages.filter((message) => {
    const search = searchTerm.toLowerCase()
    const matchesSearch =
      (message.name || "").toLowerCase().includes(search) ||
      (message.email || "").toLowerCase().includes(search) ||
      (message.subject || "").toLowerCase().includes(search) ||
      (message.message || "").toLowerCase().includes(search)

    const matchesCategory =
      selectedCategory === "all" ||
      (message.category || "").toLowerCase() === selectedCategory.toLowerCase()

    return matchesSearch && matchesCategory
  })

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
              COMMUNICATION HUB
            </span>
            <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#ffd8f4] text-[#86296b] border border-[#f3bee5]">
              CONTACT MESSAGES
            </span>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-[#c7cad5] text-xs font-bold text-[#1c1c1e]">
              <Mail className="w-3.5 h-3.5 text-[#4262ff]" />
              <span>{messages.length} Inquiries Received</span>
            </span>
            <button
              onClick={fetchMessages}
              className="p-2 rounded-full bg-white border border-[#c7cad5] text-[#1c1c1e] hover:bg-[#f7f8fa] hover:border-[#1c1c1e] transition-all shadow-sm active:scale-95"
              title="Refresh Messages"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Page Title */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#1c1c1e]">
            Contact Messages
          </h1>
          <p className="text-sm sm:text-base text-[#555a6a]">
            Review user feedback, platform support inquiries, and bug reports submitted through the contact portal.
          </p>
        </div>

        {/* Filters and Search Card */}
        <div className="bg-white rounded-2xl border border-[#c7cad5] shadow-sm p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#555a6a] w-4 h-4 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by sender, email, subject, or message content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-11 min-h-[44px] pl-10 pr-4 text-sm font-semibold rounded-xl border border-[#c7cad5] bg-[#fffdf5] text-[#1c1c1e] placeholder-[#555a6a] hover:border-[#1c1c1e] focus:border-[#1c1c1e] focus:ring-2 focus:ring-[#ffd02f]/30 focus:outline-none transition-all"
              />
            </div>

            {/* Category Filter */}
            <div className="relative min-w-[200px]">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full h-11 min-h-[44px] px-3.5 pr-9 text-sm font-semibold rounded-xl border border-[#c7cad5] bg-[#f4fbfb] text-[#1c1c1e] hover:border-[#1c1c1e] focus:border-[#1c1c1e] focus:ring-2 focus:ring-[#ffd02f]/30 focus:outline-none transition-all appearance-none cursor-pointer"
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555a6a] pointer-events-none" />
            </div>
          </div>

          {/* Results Count & Clear Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-[#e0e2e8] text-xs">
            <span className="font-semibold text-[#555a6a]">
              Showing <strong className="text-[#1c1c1e]">{filteredMessages.length}</strong> of{" "}
              <strong className="text-[#1c1c1e]">{messages.length}</strong> messages
            </span>
            {(searchTerm || selectedCategory !== "all") && (
              <button
                onClick={() => {
                  setSearchTerm("")
                  setSelectedCategory("all")
                }}
                className="px-3 py-1 rounded-full bg-[#f7f8fa] hover:bg-[#ebedf2] border border-[#c7cad5] text-xs font-bold text-[#555a6a] hover:text-[#1c1c1e] transition-all self-start sm:self-auto"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Content Section */}
        {isLoading ? (
          <MiroLoader message="Fetching contact inquiries..." />
        ) : filteredMessages.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#c7cad5] p-12 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-[#fff8e0] border border-[#fde89c] flex items-center justify-center mx-auto text-[#746019]">
              <Search className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-[#1c1c1e]">No messages found</h3>
              <p className="text-xs sm:text-sm text-[#555a6a] max-w-md mx-auto">
                {searchTerm || selectedCategory !== "all"
                  ? "Try adjusting your search query or category filter."
                  : "No contact messages available at the moment."}
              </p>
            </div>
            {(searchTerm || selectedCategory !== "all") && (
              <button
                onClick={() => {
                  setSearchTerm("")
                  setSelectedCategory("all")
                }}
                className="px-4 py-2 rounded-full bg-white border border-[#c7cad5] text-xs font-bold text-[#1c1c1e] hover:bg-[#f7f8fa]"
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {filteredMessages.map((message) => (
                <motion.div
                  key={message.email + (message.createdAt || "")}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white rounded-2xl border border-[#c7cad5] shadow-sm p-5 sm:p-6 space-y-4 hover:shadow-md hover:border-[#1c1c1e] transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    {/* Sender Info & Badges */}
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-[#f5f3ff] border border-[#ddd6fe] flex items-center justify-center flex-shrink-0 text-[#4262ff]">
                        <User className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-bold text-[#1c1c1e] truncate">
                            {message.name || "Anonymous Sender"}
                          </h3>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${getCategoryBadge(
                              message.category
                            )}`}
                          >
                            <Tag className="w-3 h-3 mr-1" />
                            {message.category || "General"}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-[#555a6a]">
                          <span className="flex items-center gap-1 font-semibold text-[#1c1c1e]">
                            <Mail className="w-3.5 h-3.5 text-[#4262ff]" />
                            {message.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-[#555a6a]" />
                            {formatDate(message.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Delete Action Pill */}
                    <button
                      onClick={() => handleDelete(message.email)}
                      disabled={loadingStates[message.email]}
                      className="self-start sm:self-center inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#fbd4d4] hover:bg-[#f9a9a9] border border-[#e3c5c5] text-[#800000] text-xs font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loadingStates[message.email] ? (
                        <>
                          <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          <span>Deleting...</span>
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Subject Line */}
                  <div className="pt-2 border-t border-[#e0e2e8]">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#555a6a] block mb-1">
                      Subject
                    </span>
                    <p className="text-sm font-bold text-[#1c1c1e]">
                      {message.subject || "No subject provided"}
                    </p>
                  </div>

                  {/* Message Body Box */}
                  <div className="bg-[#f7f8fa] border border-[#e0e2e8] rounded-xl p-4">
                    <div className="flex items-start gap-2.5">
                      <MessageSquare className="w-4 h-4 text-[#4262ff] mt-0.5 flex-shrink-0" />
                      <p className="text-xs sm:text-sm text-[#1c1c1e] leading-relaxed whitespace-pre-wrap">
                        {message.message || "Empty message body"}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}

export default GetMessage
