"use client"

import { useState,useEffect } from "react"
import { motion } from "framer-motion"
import { Save, Plus, X, Mail, Phone, MapPin, Clock, MessageCircle, HelpCircle, Users } from "lucide-react"
import toast from "react-hot-toast"
import { getContactUs,updateContactUs } from "../../../../services/operations/pagesAPI"

export default function EditContactUs() {

  const iconOptions = [
    { value: "Mail", label: "Mail", icon: Mail },
    { value: "Phone", label: "Phone", icon: Phone },
    { value: "MapPin", label: "Map Pin", icon: MapPin },
    { value: "Clock", label: "Clock", icon: Clock },
    { value: "MessageCircle", label: "Message Circle", icon: MessageCircle },
    { value: "HelpCircle", label: "Help Circle", icon: HelpCircle },
    { value: "Users", label: "Users", icon: Users },
  ]
  const [isSubmitting, setIsSubmitting] = useState(false)

 const [contactData, setContactData] = useState({
  hero: {
    title: "",
    subtitle: "",
    description: "",
  },
  contactDetails: [],
  categories: [],
})


    useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getContactUs()
        if (data) setContactData(data)
      } catch (error) {
        toast.error("Failed to fetch contact data.")
        console.error("getContactUs error:", error)
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
      toast.error("Failed to update contact data.")
      console.error("updateContactUs error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }
if (!contactData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-lg font-medium">Loading Contact Us data...</div>
      </div>
    )
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Edit Contact Us
          </h1>
          <p className="text-gray-600 text-lg">Update your contact information and details</p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-lg p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Mail className="w-6 h-6 mr-2 text-green-600" />
              Hero Section
            </h2>

            <div className="grid gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={contactData?.hero?.title}
                  onChange={(e) => handleInputChange("hero", "title", e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Subtitle</label>
                <input
                  type="text"
                  value={contactData?.hero?.subtitle}
                  onChange={(e) => handleInputChange("hero", "subtitle", e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  value={contactData?.hero?.description}
                  onChange={(e) => handleInputChange("hero", "description", e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-200 resize-none"
                />
              </div>
            </div>
          </motion.div>

          {/* Contact Details Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-lg p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <Phone className="w-6 h-6 mr-2 text-blue-600" />
                Contact Details
              </h2>
              <button
                type="button"
                onClick={addContactDetail}
                className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors duration-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Detail
              </button>
            </div>

            <div className="grid gap-6">
              {contactData?.contactDetails?.map((detail, index) => (
                <div key={index} className="p-6 bg-gray-50 rounded-xl">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Contact Detail {index + 1}</h3>
                    <button
                      type="button"
                      onClick={() => removeContactDetail(index)}
                      className="w-8 h-8 bg-red-100 hover:bg-red-200 rounded-lg flex items-center justify-center transition-colors duration-200"
                    >
                      <X className="w-4 h-4 text-red-600" />
                    </button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
                      <select
                        value={detail.icon}
                        onChange={(e) => handleInputChange("contactDetails", "icon", e.target.value, index)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      >
                        {iconOptions?.map((option) => (
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
                        value={detail.title}
                        onChange={(e) => handleInputChange("contactDetails", "title", e.target.value, index)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Information</label>
                      <input
                        type="text"
                        value={detail.info}
                        onChange={(e) => handleInputChange("contactDetails", "info", e.target.value, index)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <input
                        type="text"
                        value={detail.description}
                        onChange={(e) => handleInputChange("contactDetails", "description", e.target.value, index)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Categories Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-lg p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <MessageCircle className="w-6 h-6 mr-2 text-purple-600" />
                Contact Categories
              </h2>
              <button
                type="button"
                onClick={addCategory}
                className="flex items-center px-4 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors duration-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Category
              </button>
            </div>

            <div className="grid gap-6">
              {contactData?.categories?.map((category, index) => (
                <div key={index} className="p-6 bg-gray-50 rounded-xl">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Category {index + 1}</h3>
                    <button
                      type="button"
                      onClick={() => removeCategory(index)}
                      className="w-8 h-8 bg-red-100 hover:bg-red-200 rounded-lg flex items-center justify-center transition-colors duration-200"
                    >
                      <X className="w-4 h-4 text-red-600" />
                    </button>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
                      <select
                        value={category.icon}
                        onChange={(e) => handleInputChange("categories", "icon", e.target.value, index)}
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">Value</label>
                      <input
                        type="text"
                        value={category.value}
                        onChange={(e) => handleInputChange("categories", "value", e.target.value, index)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                        placeholder="e.g., general"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Label</label>
                      <input
                        type="text"
                        value={category.label}
                        onChange={(e) => handleInputChange("categories", "label", e.target.value, index)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                        placeholder="e.g., General Inquiry"
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
              className="px-8 py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Updating...
                </div>
              ) : (
                <div className="flex items-center">
                  <Save className="w-5 h-5 mr-2" />
                  Update Contact Us
                </div>
              )}
            </button>
          </motion.div>
        </form>
      </div>
    </div>
  )
}
