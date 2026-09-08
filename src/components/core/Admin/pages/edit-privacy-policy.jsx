"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Save, Plus, X, Shield, Lock, Eye, FileText, Users, AlertCircle } from "lucide-react"
import toast from "react-hot-toast"
import { useNavigate } from "react-router-dom"
import { getPrivacyPolicy, updatePrivacyPolicy } from "../../../../services/operations/pagesAPI"

export default function EditPrivacyPolicy() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const Navigate = useNavigate()
  const [privacyData, setPrivacyData] = useState({
    header: {
      title: "",
      description: "",
    },
    sections: [],
  })

  const iconOptions = [
    { value: "FileText", label: "File Text", icon: FileText },
    { value: "Lock", label: "Lock", icon: Lock },
    { value: "Shield", label: "Shield", icon: Shield },
    { value: "Users", label: "Users", icon: Users },
    { value: "Eye", label: "Eye", icon: Eye },
    { value: "AlertCircle", label: "Alert Circle", icon: AlertCircle },
  ]


  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getPrivacyPolicy()
        if (res) {
          setPrivacyData(res)
        }
      } catch (err) {
        toast.error("Failed to load privacy policy.")
        console.error(err)
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
      Navigate("/dashboard")
    } else {
      toast.error("Update failed. Please try again.")
    }
   } catch (err) {
    console.error("Update error:", err)
    toast.error("Something went wrong.")
   } finally {
    setIsSubmitting(false)
   }
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Edit Privacy Policy
          </h1>
          <p className="text-gray-600 text-lg">Update your privacy policy content and sections</p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-lg p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Shield className="w-6 h-6 mr-2 text-purple-600" />
              Header Section
            </h2>

            <div className="grid gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={privacyData.header.title}
                  onChange={(e) => handleInputChange("header", "title", e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  value={privacyData.header.description}
                  onChange={(e) => handleInputChange("header", "description", e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200 resize-none"
                />
              </div>
            </div>
          </motion.div>

          {/* Privacy Policy Sections */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-lg p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <Lock className="w-6 h-6 mr-2 text-blue-600" />
                Privacy Policy Sections
              </h2>
              <button
                type="button"
                onClick={addSection}
                className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors duration-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Section
              </button>
            </div>

            <div className="grid gap-6">
              {privacyData.sections.map((section, index) => (
                <div key={index} className="p-6 bg-gray-50 rounded-xl">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Section {index + 1}</h3>
                    <button
                      type="button"
                      onClick={() => removeSection(index)}
                      className="w-8 h-8 bg-red-100 hover:bg-red-200 rounded-lg flex items-center justify-center transition-colors duration-200"
                    >
                      <X className="w-4 h-4 text-red-600" />
                    </button>
                  </div>

                  <div className="grid gap-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
                        <select
                          value={section.icon}
                          onChange={(e) => handleInputChange("sections", "icon", e.target.value, index)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                        >
                          {iconOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                        <input
                          type="text"
                          value={section.title}
                          onChange={(e) => handleInputChange("sections", "title", e.target.value, index)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                      <textarea
                        value={section.content}
                        onChange={(e) => handleInputChange("sections", "content", e.target.value, index)}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-100 resize-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Submit Button */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Updating...
                </div>
              ) : (
                <div className="flex items-center">
                  <Save className="w-5 h-5 mr-2" />
                  Update Privacy Policy
                </div>
              )}
            </button>
          </motion.div>
        </form>
      </div>
    </div>
  )
}
