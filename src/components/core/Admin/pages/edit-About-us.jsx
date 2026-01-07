"use client"

import { useState,useEffect } from "react"
import { motion } from "framer-motion"
import { Save, Plus, X, Users, Target, Award, Heart, Globe, Lightbulb } from "lucide-react"
import { getAboutUs,updateAboutUs } from "../../../../services/operations/pagesAPI"
import toast from "react-hot-toast"

export default function EditAboutUs() {
  const [isSubmitting, setIsSubmitting] = useState(false)
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
      const data = await getAboutUs()
      setAboutData(data)
    } catch (error) {
      console.error("Failed to fetch About Us:", error)
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
    setAboutData((prev) => {
      const newData = { ...prev }
      newData.team[memberIndex].image = file
      return newData
    })
  }

  const handleSubmit = async (e) => {
  e.preventDefault()
  setIsSubmitting(true)

  const toastId = toast.loading("Updating About Us...")

  try {
    await updateAboutUs(aboutData)
    toast.success("About Us page updated successfully!", { id: toastId })
  } catch (error) {
    console.error("Error updating About Us:", error)
    toast.error("Failed to update About Us.", { id: toastId })
  } finally {
    setIsSubmitting(false)
  }
}

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Edit About Us
          </h1>
          <p className="text-gray-600 text-lg">Update your organization's story and information</p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-lg p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Users className="w-6 h-6 mr-2 text-blue-600" />
              Hero Section
            </h2>

            <div className="grid gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={aboutData?.hero?.title}
                  onChange={(e) => handleInputChange("hero", "title", e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Subtitle</label>
                <input
                  type="text"
                  value={aboutData?.hero?.subtitle}
                  onChange={(e) => handleInputChange("hero", "subtitle", e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  value={aboutData?.hero?.description}
                  onChange={(e) => handleInputChange("hero", "description", e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 resize-none"
                />
              </div>
            </div>
          </motion.div>

          {/* Mission & Vision */}
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-3xl shadow-lg p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Target className="w-6 h-6 mr-2 text-blue-600" />
                Mission
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={aboutData?.mission?.title}
                    onChange={(e) => handleInputChange("mission", "title", e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                  <textarea
                    value={aboutData?.mission?.description}
                    onChange={(e) => handleInputChange("mission", "description", e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 resize-none"
                  />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-3xl shadow-lg p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Award className="w-6 h-6 mr-2 text-purple-600" />
                Vision
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={aboutData?.vision?.title}
                    onChange={(e) => handleInputChange("vision", "title", e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                  <textarea
                    value={aboutData?.vision?.description}
                    onChange={(e) => handleInputChange("vision", "description", e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 resize-none"
                  />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-lg p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <Award className="w-6 h-6 mr-2 text-green-600" />
                Statistics
              </h2>
              <button
                type="button"
                onClick={addStat}
                className="flex items-center px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors duration-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Stat
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {aboutData?.stats?.map((stat, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      placeholder="Number (e.g., 50K+)"
                      value={stat.number}
                      onChange={(e) => handleInputChange("stats", "number", e.target.value, index)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-100"
                    />
                    <input
                      type="text"
                      placeholder="Label (e.g., Active Users)"
                      value={stat.label}
                      onChange={(e) => handleInputChange("stats", "label", e.target.value, index)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-100"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeStat(index)}
                    className="w-8 h-8 bg-red-100 hover:bg-red-200 rounded-lg flex items-center justify-center transition-colors duration-200"
                  >
                    <X className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Values Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-lg p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <Heart className="w-6 h-6 mr-2 text-red-600" />
                Core Values
              </h2>
              <button
                type="button"
                onClick={addValue}
                className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors duration-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Value
              </button>
            </div>

            <div className="grid gap-6">
              {aboutData?.values?.map((value, index) => (
                <div key={index} className="p-6 bg-gray-50 rounded-xl">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Value {index + 1}</h3>
                    <button
                      type="button"
                      onClick={() => removeValue(index)}
                      className="w-8 h-8 bg-red-100 hover:bg-red-200 rounded-lg flex items-center justify-center transition-colors duration-200"
                    >
                      <X className="w-4 h-4 text-red-600" />
                    </button>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
                      <select
                        value={value.icon}
                        onChange={(e) => handleInputChange("values", "icon", e.target.value, index)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                        value={value.title}
                        onChange={(e) => handleInputChange("values", "title", e.target.value, index)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <textarea
                        value={value.description}
                        onChange={(e) => handleInputChange("values", "description", e.target.value, index)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Team Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-lg p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <Users className="w-6 h-6 mr-2 text-purple-600" />
                Team Members
              </h2>
              <button
                type="button"
                onClick={addTeamMember}
                className="flex items-center px-4 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors duration-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Member
              </button>
            </div>

            <div className="grid gap-6">
              {aboutData?.team?.map((member, index) => (
                <div key={index} className="p-6 bg-gray-50 rounded-xl">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Team Member {index + 1}</h3>
                    <button
                      type="button"
                      onClick={() => removeTeamMember(index)}
                      className="w-8 h-8 bg-red-100 hover:bg-red-200 rounded-lg flex items-center justify-center transition-colors duration-200"
                    >
                      <X className="w-4 h-4 text-red-600" />
                    </button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                      <input
                        type="text"
                        value={member.name}
                        onChange={(e) => handleInputChange("team", "name", e.target.value, index)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                      <input
                        type="text"
                        value={member.role}
                        onChange={(e) => handleInputChange("team", "role", e.target.value, index)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={member.description}
                      onChange={(e) => handleInputChange("team", "description", e.target.value, index)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-100 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Profile Image</label>
                    <div className="flex items-center space-x-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e.target.files[0], index)}
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                      />
                      {member.image && <div className="text-sm text-green-600 font-medium">✓ {member.image.name}</div>}
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
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Updating...
                </div>
              ) : (
                <div className="flex items-center">
                  <Save className="w-5 h-5 mr-2" />
                  Update About Us
                </div>
              )}
            </button>
          </motion.div>
        </form>
      </div>
    </div>
  )
}
