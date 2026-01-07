"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/card"
import { Button } from "../../../ui/button"
import { Input } from "../../../ui/input"
import { Label } from "../../../ui/label"
import { getAllQandARegions, createQandA } from "../../../../services/operations/qandA"
import { Sparkles, Target, ImageIcon, Upload, X, CheckCircle, Tag as TagIcon } from 'lucide-react'
import toast from "react-hot-toast"
import { useNavigate } from "react-router-dom"

function ThumbnailUploader({ preview, onFileSelect, onClear }) {
  const [thumbnailFile, setThumbnailFile] = useState(null)

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setThumbnailFile(file)
    
    const reader = new FileReader()
    reader.onload = () => {
      onFileSelect({ file, dataUrl: reader.result })
    }
    reader.readAsDataURL(file)
  }

  const handleClear = () => {
    setThumbnailFile(null)
    onClear()
  }

  return (
    <div className="space-y-3">
      <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
        <ImageIcon className="w-4 h-4" />
        Thumbnail (Optional)
      </Label>

      {preview ? (
        <div className="relative border-2 border-dashed border-blue-300 overflow-hidden">
          <img src={preview || "/placeholder.svg"} alt="Q&A thumbnail" className="w-full h-56 object-cover" />
          <button
            type="button"
            onClick={handleClear}
            className="absolute top-2 right-2 inline-flex items-center justify-center w-8 h-8 bg-white/90 hover:bg-white text-red-600 shadow"
            aria-label="Remove thumbnail"
            title="Remove thumbnail"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-blue-300 cursor-pointer hover:border-blue-400 transition-colors">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <Upload className="w-8 h-8 text-blue-500" />
          <div className="text-center">
            <p className="font-semibold text-gray-700">Upload thumbnail</p>
            <p className="text-sm text-gray-500">PNG, JPG up to ~2MB</p>
          </div>
        </label>
      )}
    </div>
  );
}

export default function CreateQandA() {
  const [formData, setFormData] = useState({
    region: "",
    examType: "",
    specificClass: "",
    subject: "",
    chapterName: "",
    tags: "",
    status: "active"
  })

  const [thumbnailFile, setThumbnailFile] = useState(null)
  const [questionImages, setQuestionImages] = useState([])
  const [regions, setRegions] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  // Fetch regions
  useEffect(() => {
    const fetchRegions = async () => {
      try {
        setIsLoading(true)
        const response = await getAllQandARegions()
        setRegions(response?.data || [])
      } catch (error) {
        console.error("Failed to fetch Q&A regions:", error)
        toast.error("Failed to load Q&A data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchRegions()
  }, [])

  const getExamTypes = () => {
    if (!formData.region) return []
    const selectedRegion = regions.find((region) => region.name === formData.region)
    return selectedRegion?.examTypes?.map((type) => type.name) || []
  }

  const getSpecificClasses = () => {
    if (!formData.region || !formData.examType) return []
    const selectedRegion = regions.find((region) => region.name === formData.region)
    const selectedExamType = selectedRegion?.examTypes?.find((et) => et.name === formData.examType)
    return selectedExamType?.specificClasses?.map((cls) => cls.name) || []
  }

  const getSubjects = () => {
    if (!formData.region || !formData.examType || !formData.specificClass) return []
    const selectedRegion = regions.find((region) => region.name === formData.region)
    const selectedExamType = selectedRegion?.examTypes?.find((et) => et.name === formData.examType)
    const selectedSpecificClass = selectedExamType?.specificClasses?.find((sc) => sc.name === formData.specificClass)
    return selectedSpecificClass?.subjects?.map((subject) => subject.name) || []
  }

  // Create Q & A
  const handleCreateQandA = async () => {
    if (!formData.region || !formData.examType || !formData.specificClass || !formData.subject || !formData.chapterName) {
      toast.error("Please complete all required fields")
      return
    }

    try {
      setIsLoading(true)
      
      // Prepare form data
      const formDataToSend = new FormData()
      

      // Send category as JSON string
const category = {
  region: formData.region,
  examType: formData.examType,
  specificClass: formData.specificClass,
  subject: formData.subject
}
formDataToSend.append("category", JSON.stringify(category))

      
      // Add other fields
      formDataToSend.append("chapterName", formData.chapterName)
      formDataToSend.append("status", formData.status)
      
      // Add tags as comma-separated string
      if (formData.tags) {
        formDataToSend.append("tags", formData.tags)
      }
      
      // Add thumbnail if exists
      if (thumbnailFile) {
        formDataToSend.append("thumbnail", thumbnailFile)
      }
      
      // Add question images if exists
      if (questionImages.length > 0) {
        questionImages.forEach((image) => {
          formDataToSend.append("questionImages", image)
        })
      }

      // Send request
      const response = await createQandA(formDataToSend)

      if (response.success) {
        toast.success("Q & A created successfully!")
        navigate("/view-qa")
        
        // Reset form
        setFormData({
          region: "",
          examType: "",
          specificClass: "",
          subject: "",
          chapterName: "",
          tags: "",
          status: "active"
        })
        setThumbnailFile(null)
        setQuestionImages([])
      } else {
        throw new Error(response.message || "Failed to create Q&A")
      }
    } catch (error) {
      console.error("Error creating Q & A:", error)
      toast.error(error.message || "Failed to create Q & A")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 overflow-auto bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 md:p-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.6 }} 
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ delay: 0.2 }} 
            className="flex items-center gap-4 mb-6"
          >
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Create Q & A</h1>
              <p className="text-gray-600 text-lg">Create a new Q & A with categories</p>
            </div>
          </motion.div>
        </div>

        {/* Category Selection Card */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }}>
          <Card className="backdrop-blur-xl bg-white/90 border-0 shadow-2xl overflow-visible mb-8">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-8">
              <CardTitle className="text-2xl font-bold flex items-center gap-3">
                <Target className="w-7 h-7" />
                Q & A Configuration
              </CardTitle>
            </CardHeader>

            <CardContent className="p-8 space-y-8">
              {/* Region to Subjects in single row */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Region *</Label>
                  <select
                    value={formData.region}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        region: e.target.value,
                        examType: "",
                        specificClass: "",
                        subject: "",
                        chapterName: "",
                      })
                    }}
                    className="w-full h-12 px-4 border-2 border-gray-200 font-medium transition-all duration-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-none"
                  >
                    <option value="">Choose region</option>
                    {regions.map((region) => (
                      <option key={region._id} value={region.name}>
                        {region.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Exam Type *</Label>
                  <select
                    value={formData.examType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        examType: e.target.value,
                        specificClass: "",
                        subject: "",
                        chapterName: "",
                      })
                    }
                    disabled={!formData.region}
                    className="w-full h-12 px-4 border-2 border-gray-200 font-medium transition-all duration-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-none disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">Choose exam type</option>
                    {getExamTypes().map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Specific Class *</Label>
                  <select
                    value={formData.specificClass}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        specificClass: e.target.value,
                        subject: "",
                        chapterName: "",
                      })
                    }
                    disabled={!formData.examType}
                    className="w-full h-12 px-4 border-2 border-gray-200 font-medium transition-all duration-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-none disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">Choose class</option>
                    {getSpecificClasses().map((cls) => (
                      <option key={cls} value={cls}>
                        {cls}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Subject *</Label>
                  <select
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        subject: e.target.value,
                        chapterName: "",
                      })
                    }
                    disabled={!formData.specificClass}
                    className="w-full h-12 px-4 border-2 border-gray-200 font-medium transition-all duration-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-none disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">Choose subject</option>
                    {getSubjects().map((subject) => (
                      <option key={subject} value={subject}>
                        {subject}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Chapter Name Input */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">Chapter Name *</Label>
                <Input
                  type="text"
                  placeholder="Enter chapter name..."
                  value={formData.chapterName}
                  onChange={(e) => setFormData({ ...formData, chapterName: e.target.value })}
                  className="w-full h-12 px-4 border-2 border-gray-200 font-medium transition-all duration-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-none"
                />
              </div>

              {/* Thumbnail Upload */}
              <ThumbnailUploader
                preview={thumbnailFile ? URL.createObjectURL(thumbnailFile) : ""}
                onFileSelect={(fileData) => setThumbnailFile(fileData.file)}
                onClear={() => setThumbnailFile(null)}
              />

              {/* Tags Input */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <TagIcon className="w-4 h-4" />
                  Tags (comma separated)
                </Label>
                <Input
                  type="text"
                  placeholder="Enter tags separated by commas..."
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full h-12 px-4 border-2 border-gray-200 font-medium transition-all duration-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-none"
                />
                <p className="text-sm text-gray-500">Example: physics, mechanics, formulas</p>
              </div>

              {/* Submit Button */}
              <div className="flex justify-start">
                <Button
                  onClick={handleCreateQandA}
                  disabled={isLoading || !formData.region || !formData.examType || !formData.specificClass || !formData.subject || !formData.chapterName}
                  className="h-12 px-8 bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 rounded-none"
                >
                  {isLoading ? "Creating..." : (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Create Q & A
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
}