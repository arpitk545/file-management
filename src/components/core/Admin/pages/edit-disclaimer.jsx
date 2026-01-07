"use client"

import { useState ,useEffect} from "react"
import { motion } from "framer-motion"
import { Save, Plus, X, AlertTriangle, Info, BookOpen, Users, Shield, ExternalLink } from "lucide-react"
import { getDisclaimer,updateDisclaimer } from "../../../../services/operations/pagesAPI"
import toast from "react-hot-toast"
export default function EditDisclaimer() {
  const [isSubmitting, setIsSubmitting] = useState(false)
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
      const res = await getDisclaimer()
      if (res && res.header && res.sections) {
        setDisclaimerData({
          header: res.header,
          sections: res.sections,
          importantNotice: res.importantNotice,
        })
      }
    } catch (error) {
      console.error("Failed to fetch disclaimer:", error)
    }
  }

  fetchDisclaimer()
}, [])
  const iconOptions = [
    { value: "Info", label: "Info", icon: Info },
    { value: "BookOpen", label: "Book Open", icon: BookOpen },
    { value: "Users", label: "Users", icon: Users },
    { value: "ExternalLink", label: "External Link", icon: ExternalLink },
    { value: "Shield", label: "Shield", icon: Shield },
    { value: "AlertTriangle", label: "Alert Triangle", icon: AlertTriangle },
  ]

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
  e.preventDefault();
  setIsSubmitting(true);

  try {
    const res = await updateDisclaimer(disclaimerData);

    if (res?.message === "Disclaimer updated successfully") {
      toast.success("Disclaimer updated successfully!");
    } else {
      toast.error("Failed to update disclaimer. Please try again.");
    }
  } catch (error) {
    console.error("Update failed:", error);
    toast.error("An unexpected error occurred.");
  } finally {
    setIsSubmitting(false);
  }
};


  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
            Edit Disclaimer
          </h1>
          <p className="text-gray-600 text-lg">Update your disclaimer content and sections</p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-lg p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <AlertTriangle className="w-6 h-6 mr-2 text-orange-600" />
              Header Section
            </h2>

            <div className="grid gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={disclaimerData?.header?.title}
                  onChange={(e) => handleInputChange("header", "title", e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  value={disclaimerData?.header?.description}
                  onChange={(e) => handleInputChange("header", "description", e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all duration-200 resize-none"
                />
              </div>
            </div>
          </motion.div>

          {/* Disclaimer Sections */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-lg p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <Shield className="w-6 h-6 mr-2 text-red-600" />
                Disclaimer Sections
              </h2>
              <button
                type="button"
                onClick={addSection}
                className="flex items-center px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors duration-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Section
              </button>
            </div>

            <div className="grid gap-6">
              {disclaimerData?.sections?.map((section, index) => (
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
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-100"
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
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-100"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                      <textarea
                        value={section.content}
                        onChange={(e) => handleInputChange("sections", "content", e.target.value, index)}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-100 resize-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Important Notice Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-lg p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <AlertTriangle className="w-6 h-6 mr-2 text-orange-600" />
              Important Notice
            </h2>

            <div className="grid gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={disclaimerData?.importantNotice?.title}
                  onChange={(e) => handleInputChange("importantNotice", "title", e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Content</label>
                <textarea
                  value={disclaimerData?.importantNotice?.content}
                  onChange={(e) => handleInputChange("importantNotice", "content", e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all duration-200 resize-none"
                />
              </div>
            </div>
          </motion.div>

          {/* Submit Button */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Updating...
                </div>
              ) : (
                <div className="flex items-center">
                  <Save className="w-5 h-5 mr-2" />
                  Update Disclaimer
                </div>
              )}
            </button>
          </motion.div>
        </form>
      </div>
    </div>
  )
}
