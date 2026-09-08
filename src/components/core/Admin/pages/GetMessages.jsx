"use client"

import React, { useState,useEffect } from "react"
import { motion } from "framer-motion"
import { Trash2, Mail, User, MessageSquare, Tag, Calendar, Loader2, AlertCircle, Search, Filter } from "lucide-react"
import toast from "react-hot-toast"
import {getContactMessages,deleteContactByEmail} from "../../../../services/operations/pagesAPI"


const GetMessage = ({ initialMessages = [] }) => {
  const [messages, setMessages] = useState(initialMessages)
  const [loadingStates, setLoadingStates] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [expandedMessage, setExpandedMessage] = useState(null)
  const [error, setError] = useState(null)
  
const sampleMessages = [
  {
    id: 0,
    name: "",
    email: "",
    subject: "",
    message: "",
    category: "",
    createdAt: null,
  },
];

  useEffect(() => {
    const fetchMessages = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await getContactMessages()
        setMessages(data)
      } catch (err) {
        setError("Failed to load messages.")
        toast.error("Failed to load messages.")
      } finally {
        setIsLoading(false)
      }
    }
    fetchMessages()
  }, [])
  
 
  const displayMessages = messages.length > 0 ? messages : sampleMessages

  const categories = [
    { value: "all", label: "All Categories", color: "bg-gray-100 text-gray-800" },
    { value: "general", label: "General", color: "bg-blue-100 text-blue-800" },
    { value: "feature", label: "Feature Request", color: "bg-green-100 text-green-800" },
    { value: "bug", label: "Bug Report", color: "bg-red-100 text-red-800" },
    { value: "support", label: "Support", color: "bg-purple-100 text-purple-800" },
  ]

  const getCategoryColor = (category) => {
    const categoryObj = categories.find((cat) => cat.value === category)
    return categoryObj ? categoryObj.color : "bg-gray-100 text-gray-800"
  }

  const formatDate = (dateString) => {
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
    console.log("Deleting message with email:", email)
  setLoadingStates((prev) => ({ ...prev, [email]: true }));

  try {
    await deleteContactByEmail(email);
    console.log("Message deleted successfully:", email);

    setMessages((prev) => prev.filter((msg) => msg.email !== email));
    toast.success("Message deleted successfully");
  } catch (error) {
    console.error(error);
    toast.error("Failed to delete message");
  } finally {
    setLoadingStates((prev) => ({ ...prev, [email]: false }));
  }
};

  const filteredMessages = displayMessages.filter((message) => {
    const matchesSearch =
      message.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.message.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = selectedCategory === "all" || message.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 sm:p-6 lg:p-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Contact Messages</h1>
          <p className="text-gray-600">Manage and respond to user inquiries</p>
        </div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 mb-8 shadow-lg border border-white/20"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-10 pr-8 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none cursor-pointer"
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredMessages.length} of {displayMessages.length} messages
          </div>
        </motion.div>

        {/* Messages */}
        {filteredMessages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/70 backdrop-blur-sm rounded-2xl p-12 text-center shadow-lg border border-white/20"
          >
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No messages found</h3>
            <p className="text-gray-500">
              {searchTerm || selectedCategory !== "all"
                ? "Try adjusting your search or filter criteria"
                : "No contact messages available at the moment"}
            </p>
          </motion.div>
        ) : (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
            {/* Desktop Table View */}
            <div className="hidden lg:block bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                    <tr>
                      <th className="px-6 py-4 text-left font-semibold">Contact Info</th>
                      <th className="px-6 py-4 text-left font-semibold">Subject</th>
                      <th className="px-6 py-4 text-left font-semibold">Category</th>
                      <th className="px-6 py-4 text-left font-semibold">Date</th>
                      <th className="px-6 py-4 text-center font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMessages.map((message, index) => (
                      <React.Fragment key={message.email}>
                        <motion.tr
                          variants={itemVariants}
                          className="border-b border-gray-100 hover:bg-blue-50/50 transition-colors duration-200"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900">{message.name}</div>
                                <div className="text-sm text-gray-600 flex items-center">
                                  <Mail className="w-4 h-4 mr-1" />
                                  {message.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900">{message.subject}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(message.category)}`}
                            >
                              <Tag className="w-3 h-3 mr-1" />
                              {message.category}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-600 flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {formatDate(message.createdAt)}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <motion.button
                              onClick={() => handleDelete(message.email)}
                              disabled={loadingStates[message.email]}
                              className="inline-flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              {loadingStates[message.email] ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                              <span className="ml-2 hidden sm:inline">Delete</span>
                            </motion.button>
                          </td>
                        </motion.tr>
                        <tr>
                          <td colSpan="5" className="px-6 py-4 bg-gray-50/50">
                            <div className="bg-white rounded-xl p-4 border border-gray-200">
                              <div className="flex items-start space-x-2">
                                <MessageSquare className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                  <p className="text-gray-700 leading-relaxed">{message.message}</p>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4">
              {filteredMessages.map((message) => (
                <motion.div
                  key={message.email}
                  variants={itemVariants}
                  className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden"
                >
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3 flex-1">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">{message.name}</h3>
                          <p className="text-sm text-gray-600 flex items-center">
                            <Mail className="w-4 h-4 mr-1 flex-shrink-0" />
                            <span className="truncate">{message.email}</span>
                          </p>
                        </div>
                      </div>
                      <motion.button
                        onClick={() => handleDelete(message.email)}
                        disabled={loadingStates[message.email]}
                        className="ml-4 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {loadingStates[message.email] ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Trash2 className="w-5 h-5" />
                        )}
                      </motion.button>
                    </div>

                    {/* Subject and Category */}
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">{message.subject}</h4>
                      <div className="flex items-center justify-between">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(message.category)}`}
                        >
                          <Tag className="w-3 h-3 mr-1" />
                          {message.category}
                        </span>
                        <span className="text-sm text-gray-500 flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(message.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Message */}
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <div className="flex items-start space-x-2">
                        <MessageSquare className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                        <p className="text-gray-700 leading-relaxed text-sm">{message.message}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

export default GetMessage
