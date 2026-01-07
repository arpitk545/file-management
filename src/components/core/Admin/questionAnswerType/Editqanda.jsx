"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/card"
import { Button } from "../../../ui/button"
import { Input } from "../../../ui/input"
import { Label } from "../../../ui/label"
import { useParams, useNavigate } from "react-router-dom"
import { BookOpen, X, Plus, Trash2, Sparkles, Target, Save, Tag, ImageIcon, Upload } from "lucide-react"
import {
  getallqnadabyId,
  updateQandA,
  getAllQandARegions,
} from "../../../../services/operations/qandA"
import toast from "react-hot-toast"

// ModernInput component
const ModernInput = ({ label, type = "text", placeholder, value, onChange, icon: Icon, options }) => {
  const [isOpen, setIsOpen] = useState(false)

  if (options) {
    return (
      <div className="space-y-2 relative">
        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4" />}
          {label}
        </Label>
        <div className="relative">
          <Input
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="h-14 px-4 border-2 border-gray-200 font-medium transition-all duration-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            onFocus={() => setIsOpen(true)}
            onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          />
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute z-10 mt-1 w-full bg-white border border-gray-200 shadow-lg max-h-60 overflow-auto"
              >
                {(options || [])
                  .filter((option) =>
                    option.toLowerCase().includes((value || "").toLowerCase())
                  )
                  .map((option, index) => (
                    <div
                      key={index}
                      className="px-4 py-3 hover:bg-gray-50 cursor-pointer"
                      onMouseDown={() => {
                        onChange(option)
                        setIsOpen(false)
                      }}
                    >
                      {option}
                    </div>
                  ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4" />}
        {label}
      </Label>
      <Input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-14 px-4 border-2 border-gray-200 font-medium transition-all duration-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
      />
    </div>
  )
}

// ModernTextarea component
const ModernTextarea = ({ label, placeholder, value, onChange, rows = 4 }) => (
  <div className="space-y-2">
    <Label className="text-sm font-semibold text-gray-700">{label}</Label>
    <textarea
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      className="w-full px-4 py-3 border-2 border-gray-200 font-medium transition-all duration-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 resize-none"
    />
  </div>
)

// ImageUpload component
const ImageUpload = ({ label, image, onImageChange, onRemove }) => (
  <div className="space-y-3">
    <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
      <ImageIcon className="w-4 h-4" />
      {label}
    </Label>
    {image ? (
      <div className="relative border-2 border-dashed border-blue-300 overflow-hidden">
        <img
          src={image.dataUrl || image}
          alt={label}
          className="w-full h-56 object-cover"
        />
        <button
          type="button"
          onClick={onRemove}
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
          className="hidden"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) {
              const reader = new FileReader()
              reader.onload = (event) => {
                const result = event.target?.result
                if (typeof result === "string") onImageChange({ 
                  file: file, 
                  dataUrl: result 
                })
              }
              reader.readAsDataURL(file)
            }
          }}
        />
        <Upload className="w-8 h-8 text-blue-500" />
        <div className="text-center">
          <p className="font-semibold text-gray-700">Upload thumbnail</p>
          <p className="text-sm text-gray-500">PNG, JPG up to ~2MB</p>
        </div>
      </label>
    )}
  </div>
)

// QuestionCard component with questionImage support
const QuestionCard = ({ question, onUpdate, onDelete, index }) => {
  const handleQuestionImageChange = (fileData) => {
    onUpdate({ ...question, questionImage: fileData })
  }

  const handleRemoveQuestionImage = () => {
    onUpdate({ ...question, questionImage: null })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="bg-white border border-gray-100 p-6 space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-100 flex items-center justify-center">
            <span className="text-blue-600 font-bold text-sm">{index + 1}</span>
          </div>
          Question {index + 1}
        </h3>
        <Button
          onClick={onDelete}
          variant="ghost"
          size="sm"
          className="text-red-500 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      <ModernTextarea
        label="Question"
        placeholder="Enter your question here..."
        value={question.question || ""}
        onChange={(value) => onUpdate({ ...question, question: value })}
        rows={3}
      />

      {/* Question Image Upload */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <ImageIcon className="w-4 h-4" />
          Question Image (Optional)
        </Label>
        {question.questionImage ? (
          <div className="relative border-2 border-dashed border-blue-300 overflow-hidden">
            <img
              src={question.questionImage.dataUrl || question.questionImage}
              alt="Question"
              className="w-full h-48 object-contain"
            />
            <button
              type="button"
              onClick={handleRemoveQuestionImage}
              className="absolute top-2 right-2 inline-flex items-center justify-center w-8 h-8 bg-white/90 hover:bg-white text-red-600 shadow"
              aria-label="Remove question image"
              title="Remove question image"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 cursor-pointer hover:border-blue-400 transition-colors">
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  const reader = new FileReader()
                  reader.onload = (event) => {
                    const result = event.target?.result
                    if (typeof result === "string") handleQuestionImageChange({ 
                      file: file, 
                      dataUrl: result 
                    })
                  }
                  reader.readAsDataURL(file)
                }
              }}
            />
            <Upload className="w-6 h-6 text-gray-400" />
            <span className="text-sm text-gray-500">Upload question image</span>
          </label>
        )}
      </div>

      <ModernTextarea
        label="Answer"
        placeholder="Enter the answer here..."
        value={question.answer || ""}
        onChange={(value) => onUpdate({ ...question, answer: value })}
        rows={3}
      />
    </motion.div>
  )
}

export default function EditQandA() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    region: "",
    examType: "",
    specificClass: "",
    subject: "",
    chapterName: "",
    tags: [],  // This should be array of strings, not a single string
    status: "active",
    questions: [],
    thumbnail: null,
  })

  const [selectedRegion, setSelectedRegion] = useState(null)
  const [regions, setRegions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newTag, setNewTag] = useState("")

  // Fetch regions and Q&A data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)

        // Fetch all regions
        const regionsResponse = await getAllQandARegions()
        const regionList = regionsResponse?.data || []
        setRegions(regionList)

        // Fetch Q&A data by ID
        const qandaResponse = await getallqnadabyId(id)
        const qandaData = qandaResponse?.data || {}

        // Find region object
        const regionObj = regionList.find((r) => r.name === qandaData?.category?.region) || null

        // Fix tags: handle different formats from backend
        let tagsArray = []
        if (qandaData?.tags) {
          if (Array.isArray(qandaData.tags)) {
            // If tags is ["hiii,new,hwlo"] (single string in array)
            if (qandaData.tags.length === 1 && typeof qandaData.tags[0] === 'string') {
              tagsArray = qandaData.tags[0].split(',').map(tag => tag.trim()).filter(tag => tag)
            } 
            // If tags is ["hiii", "new", "hwlo"] (array of strings)
            else if (qandaData.tags.length > 0 && typeof qandaData.tags[0] === 'string') {
              tagsArray = qandaData.tags
            }
            // If tags is ["[\"hiii\"", "\"new\"", "\"hwlo\"]"] (double-stringified)
            else if (qandaData.tags.length > 0 && qandaData.tags[0].includes('"')) {
              try {
                // Try to parse it as JSON
                const cleanedString = qandaData.tags.join('').replace(/\\"/g, '"')
                const parsed = JSON.parse(cleanedString)
                if (Array.isArray(parsed)) {
                  tagsArray = parsed
                }
              } catch (e) {
                console.error("Error parsing tags:", e)
                tagsArray = []
              }
            }
          } else if (typeof qandaData.tags === 'string') {
            // If it's a string like "hiii,new,hwlo"
            tagsArray = qandaData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
          }
        }

        // Set form data
        setFormData({
          region: regionObj?._id || "",
          examType: qandaData?.category?.examType || "",
          specificClass: qandaData?.category?.specificClass || "",
          subject: qandaData?.category?.subject || "",
          chapterName: qandaData?.chapterName || "",
          tags: tagsArray,  // Fixed tags array
          status: qandaData?.status || "active",
          questions: qandaData?.questions || [],
          thumbnail: qandaData?.thumbnail || null,
        })

        setSelectedRegion(regionObj)
      } catch (error) {
        console.error("Failed to fetch Q&A data:", error)
        toast.error("Failed to load Q&A data")
        navigate("/view-qanda")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [id, navigate])

  // Dropdown option helpers
  const getExamTypes = () => {
    if (!selectedRegion) return []
    return selectedRegion.examTypes?.map((type) => type.name) || []
  }

  const getSpecificClasses = () => {
    if (!selectedRegion || !formData.examType) return []
    const examTypeObj = selectedRegion.examTypes?.find((et) => et.name === formData.examType)
    return examTypeObj?.specificClasses?.map((sc) => sc.name) || []
  }

  const getSubjects = () => {
    if (!selectedRegion || !formData.examType || !formData.specificClass) return []
    const examTypeObj = selectedRegion.examTypes?.find((et) => et.name === formData.examType)
    if (!examTypeObj) return []
    const classObj = examTypeObj.specificClasses?.find((sc) => sc.name === formData.specificClass)
    return classObj?.subjects?.map((subject) => subject.name) || []
  }

  // Question CRUD operations
  const addQuestion = () => {
    const newQuestion = {
      question: "",
      answer: "",
      questionImage: null,
      createdAt: new Date()
    }
    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }))
  }

  const updateQuestion = (index, updatedQuestion) => {
    setFormData(prev => {
      const newQuestions = [...prev.questions]
      newQuestions[index] = updatedQuestion
      return { ...prev, questions: newQuestions }
    })
  }

  const deleteQuestion = (index) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }))
  }

  // Tags operations
  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  // Handle tag input key press
  const handleTagKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  // Thumbnail handling
  const handleThumbnailChange = (fileData) => {
    setFormData(prev => ({ ...prev, thumbnail: fileData }))
  }

  const handleRemoveThumbnail = () => {
    setFormData(prev => ({ ...prev, thumbnail: null }))
  }

  // Handle form submission
  const handleUpdateQandA = async () => {
    // Validation
    if (!formData.region || !formData.examType || !formData.specificClass || !formData.subject) {
      toast.error("Please complete all category fields")
      return
    }

    if (!formData.chapterName) {
      toast.error("Please enter a chapter name")
      return
    }

    if (formData.questions.length === 0) {
      toast.error("Please add at least one question")
      return
    }

    // Validate each question
    const invalidQuestion = formData.questions.find(q => !q.question || !q.answer)
    if (invalidQuestion) {
      toast.error("Please complete all question and answer fields")
      return
    }

    try {
      setIsSubmitting(true)

      // Find region name from ID
      const regionObj = regions.find(r => r._id === formData.region)
      const regionName = regionObj?.name || ""

      // Use FormData to handle file uploads
      const formDataToSend = new FormData()

      // Add category as JSON string
      const category = {
        region: regionName,
        examType: formData.examType,
        specificClass: formData.specificClass,
        subject: formData.subject
      }
      formDataToSend.append("category", JSON.stringify(category))
      
      // Add other fields
      formDataToSend.append("chapterName", formData.chapterName)
      formDataToSend.append("status", formData.status)
      
      // Add tags as comma-separated string (to match your backend expectation)
      if (formData.tags.length > 0) {
        // Send as comma-separated string like "hiii,new,hwlo"
        formDataToSend.append("tags", formData.tags.join(","))
      } else {
        formDataToSend.append("tags", "")
      }
      
      // Add thumbnail if it's a file object (new upload), otherwise pass existing URL or null
      if (formData.thumbnail && formData.thumbnail.file) {
        // New thumbnail upload
        formDataToSend.append("thumbnail", formData.thumbnail.file)
      } else if (formData.thumbnail && typeof formData.thumbnail === 'string') {
        // Existing thumbnail URL (string)
        formDataToSend.append("thumbnail", formData.thumbnail)
      } else {
        // No thumbnail
        formDataToSend.append("thumbnail", "")
      }

      // Process questions and their images
      const questionsWithImages = []
      
      for (const question of formData.questions) {
        const questionData = { ...question }
        
        // Remove file objects from questionImage for JSON serialization
        if (questionData.questionImage && questionData.questionImage.file) {
          // This will be handled separately as file upload
          questionsWithImages.push({
            question: questionData.question,
            answer: questionData.answer,
            questionImage: "file_upload", // Marker for file upload
            questiontype: questionData.questiontype || "General",
            questionReportStatus: questionData.questionReportStatus || "not reported",
            questionReportShow: questionData.questionReportShow || "show",
            answerReportStatus: questionData.answerReportStatus || "not reported",
            answerReportShow: questionData.answerReportShow || "show",
            createdAt: questionData.createdAt || new Date().toISOString(),
            _id: questionData._id
          })
          
          // Add question image file to FormData
          formDataToSend.append(`questionImage_${questionData._id || Date.now()}`, questionData.questionImage.file)
        } else {
          // Keep existing questionImage URL or null
          questionsWithImages.push({
            ...questionData,
            questionImage: questionData.questionImage || null
          })
        }
      }
      
      formDataToSend.append("questions", JSON.stringify(questionsWithImages))

      // Update Q&A with FormData
      await updateQandA(id, formDataToSend)
      
      toast.success(`Q&A updated successfully with ${formData.questions.length} questions!`)
      navigate("/view-qanda")
    } catch (error) {
      console.error("Error updating Q&A:", error)
      toast.error("Failed to update Q&A: " + (error?.message || "Server error"))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-gray-700">Loading Q&A data...</p>
        </div>
      </div>
    )
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
        <div className="mb-4 flex justify-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-4 mb-6"
          >
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent text-center">
                Edit Q&A
              </h1>
              <p className="text-gray-600 text-lg text-center">Modify your Q&A content and settings</p>
            </div>
          </motion.div>
        </div>

        {/* Category Configuration */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }}>
          <Card className="bg-white/90 border-0 shadow-2xl overflow-visible mb-8">
            <CardHeader className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-8">
              <CardTitle className="text-2xl font-bold flex items-center gap-3">
                <Target className="w-7 h-7" />
                Category Configuration
              </CardTitle>
            </CardHeader>

            <CardContent className="p-8 space-y-6">
              {/* Thumbnail Upload */}
              <ImageUpload
                label="Thumbnail Image"
                image={formData.thumbnail}
                onImageChange={handleThumbnailChange}
                onRemove={handleRemoveThumbnail}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-gray-700">Select Region</Label>
                  <select
                    value={formData.region}
                    onChange={(e) => {
                      const regionId = e.target.value
                      const found = regions.find((r) => r._id === regionId)
                      setSelectedRegion(found || null)
                      setFormData({
                        ...formData,
                        region: regionId,
                        examType: "",
                        specificClass: "",
                        subject: "",
                      })
                    }}
                    className="w-full h-14 px-4 border-2 border-gray-200 font-medium transition-all duration-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  >
                    <option value="">Choose region</option>
                    {regions.map((region) => (
                      <option key={region._id} value={region._id}>
                        {region.name}
                      </option>
                    ))}
                  </select>
                </div>

                {formData.region && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-2"
                  >
                    <Label className="text-sm font-semibold text-gray-700">Exam Type</Label>
                    <select
                      value={formData.examType}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          examType: e.target.value,
                          specificClass: "",
                          subject: "",
                        })
                      }
                      className="w-full h-14 px-4 border-2 border-gray-200 font-medium transition-all duration-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    >
                      <option value="">Choose exam type</option>
                      {getExamTypes().map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </motion.div>
                )}

                {formData.examType && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-2"
                  >
                    <Label className="text-sm font-semibold text-gray-700">Specific Class</Label>
                    <select
                      value={formData.specificClass}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          specificClass: e.target.value,
                          subject: "",
                        })
                      }
                      className="w-full h-14 px-4 border-2 border-gray-200 font-medium transition-all duration-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    >
                      <option value="">Choose class</option>
                      {getSpecificClasses().map((cls) => (
                        <option key={cls} value={cls}>
                          {cls}
                        </option>
                      ))}
                    </select>
                  </motion.div>
                )}

                {formData.specificClass && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-2"
                  >
                    <Label className="text-sm font-semibold text-gray-700">Subject</Label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full h-14 px-4 border-2 border-gray-200 font-medium transition-all duration-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    >
                      <option value="">Choose subject</option>
                      {getSubjects().map((subject) => (
                        <option key={subject} value={subject}>
                          {subject}
                        </option>
                      ))}
                    </select>
                  </motion.div>
                )}
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                {/* Chapter Name */}
                <div className="flex-1">
                  <ModernInput
                    label="Chapter Name"
                    placeholder="Enter chapter name..."
                    value={formData.chapterName}
                    onChange={(value) => setFormData({ ...formData, chapterName: value })}
                    icon={BookOpen}
                  />
                </div>

                {/* Tags Section */}
                <div className="flex-1">
                  <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    Tags (Click on X to remove individual tags)
                  </Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      type="text"
                      placeholder="Add a tag and press Enter"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={handleTagKeyPress}
                      className="h-14 px-4 border-2 border-gray-200 font-medium transition-all duration-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 flex-1"
                    />
                    <Button
                      onClick={addTag}
                      className="h-14 px-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white flex items-center"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add
                    </Button>
                  </div>
                  
                  {/* Display Tags - Individual tags with remove buttons */}
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {formData.tags.map((tag, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="text-blue-600 hover:text-blue-800 ml-1"
                            title={`Remove ${tag}`}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">Status</Label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full h-14 px-4 border-2 border-gray-200 font-medium transition-all duration-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                >
                  <option value="active">Active</option>
                  <option value="deactivate">Deactivate</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Questions Section */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="space-y-8">
          <Card className="bg-white/90 border-0 shadow-2xl overflow-visible">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
              <CardTitle className="text-xl font-bold flex items-center gap-3">
                <BookOpen className="w-6 h-6" />
                Questions & Answers
              </CardTitle>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">Questions ({formData.questions.length})</h3>
                <div className="flex gap-4">
                  <Button
                    onClick={addQuestion}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-2 transition-all duration-200"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Question
                  </Button>
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-4">
                <AnimatePresence>
                  {formData.questions.map((question, index) => (
                    <QuestionCard
                      key={index}
                      question={question}
                      index={index}
                      onUpdate={(updatedQuestion) => updateQuestion(index, updatedQuestion)}
                      onDelete={() => deleteQuestion(index)}
                    />
                  ))}
                </AnimatePresence>

                {formData.questions.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">No questions added yet</p>
                    <p className="text-sm">Click "Add Question" to start building your Q&A</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center gap-4"
          >
            <Button
              onClick={handleUpdateQandA}
              disabled={isSubmitting}
              className="h-14 px-8 bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Updating...
                </div>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Update Q&A
                </>
              )}
            </Button>

            <Button
              onClick={() => navigate("/view-qanda")}
              variant="outline"
              className="h-14 px-8 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold hover:bg-gray-50 transition-all duration-200 bg-transparent"
            >
              <X className="w-5 h-5 mr-2" />
              Cancel
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}