"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "../../../ui/button"
import { Input } from "../../../ui/input"
import { Label } from "../../../ui/label"
import { Plus, Trash2, Upload, X, Settings, ChevronDown, ImageIcon, Clock, Award, Calendar, BookOpen } from "lucide-react"
import { getAllQuizRegions } from "../../../../services/operations/quizAPI"
import { getContestById, updateContest, deleteContest } from "../../../../services/operations/contestAPI"
import toast from "react-hot-toast"
import { useParams, useNavigate } from "react-router-dom"

const EditContest = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [contestData, setContestData] = useState({
    title: "",
    description: "",
    prize: "",
    duration: "",
    region: "",
    regionName: "",
    examType: "",
    specificClass: "",
    subject: "",
    chapter: "",
    startTime: "",
    deadline: "",
    thumbnail: null,
    thumbnailPreview: ""
  })

  const [selectedRegion, setSelectedRegion] = useState(null)
  const [regions, setRegions] = useState([])
  const [questions, setQuestions] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Fetch contest data and regions
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        
        // Fetch regions
        const regionsResponse = await getAllQuizRegions()
        setRegions(regionsResponse?.data || [])
        
        // Fetch contest data
        const contestResponse = await getContestById(id)
        const contest = contestResponse.data
        
        // Find the region by name to get its ID
        const regionObj = regionsResponse.data.find(r => r.name === contest.region)
        
        // Set form data
        setContestData({
          title: contest.title || "",
          description: contest.description || "",
          prize: contest.prize || "",
          duration: contest.duration || "",
          region: regionObj?._id || "",
          regionName: contest.region || "",
          examType: contest.examType || "",
          specificClass: contest.specificClass || "",
          subject: contest.subject || "",
          chapter: contest.chapter || "",
          startTime: contest.startTime || "",
          deadline: contest.deadline || "",
          thumbnail: null,
          thumbnailPreview: contest.thumbnail || ""
        })
        
        // Set the selected region for dropdown population
        setSelectedRegion(regionObj || null)
        
        // Set questions
        setQuestions(contest.questions || [])
        
      } catch (error) {
        console.error("Failed to fetch contest data:", error)
        toast.error("Failed to load contest data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [id])

  // Helper functions for dropdown options
  const getExamTypes = () => {
    if (!selectedRegion) return []
    return selectedRegion.examTypes?.map(type => type.name) || []
  }

  const getSpecificClasses = () => {
    if (!selectedRegion || !contestData.examType) return []
    const examTypeObj = selectedRegion.examTypes?.find(et => et.name === contestData.examType)
    return examTypeObj?.specificClasses?.map(sc => sc.name) || []
  }

  const getSubjects = () => {
    if (!selectedRegion || !contestData.examType || !contestData.specificClass) return []
    const examTypeObj = selectedRegion.examTypes?.find(et => et.name === contestData.examType)
    if (!examTypeObj) return []
    const classObj = examTypeObj.specificClasses?.find(sc => sc.name === contestData.specificClass)
    return classObj?.subjects?.map(subject => subject.name) || []
  }

  const getChapters = () => {
    if (!selectedRegion || !contestData.examType || !contestData.specificClass || !contestData.subject) return []
    const examTypeObj = selectedRegion.examTypes?.find(et => et.name === contestData.examType)
    if (!examTypeObj) return []
    const classObj = examTypeObj.specificClasses?.find(sc => sc.name === contestData.specificClass)
    if (!classObj) return []
    const subjectObj = classObj.subjects?.find(sub => sub.name === contestData.subject)
    return subjectObj?.chapters?.map(ch => ch.name) || []
  }

  const handleContestDataChange = (field, value) => {
    setContestData(prev => {
      const updated = { ...prev, [field]: value }
      
      // Reset dependent fields when parent field changes
      if (field === "region") {
        const regionObj = regions.find(r => r._id === value)
        setSelectedRegion(regionObj || null)
        updated.examType = ""
        updated.specificClass = ""
        updated.subject = ""
        updated.chapter = ""
        updated.regionName = regionObj?.name || ""
      }
      if (field === "examType") {
        updated.specificClass = ""
        updated.subject = ""
        updated.chapter = ""
      }
      if (field === "specificClass") {
        updated.subject = ""
        updated.chapter = ""
      }
      if (field === "subject") {
        updated.chapter = ""
      }
      return updated
    })
  }

  // Handle thumbnail upload
  const handleThumbnailUpload = (file) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setContestData(prev => ({
          ...prev,
          thumbnail: file,
          thumbnailPreview: e.target.result
        }))
      }
      reader.readAsDataURL(file)
    } else {
      toast.error("Please select a valid image file")
    }
  }

  // Remove thumbnail
  const removeThumbnail = () => {
    setContestData(prev => ({
      ...prev,
      thumbnail: null,
      thumbnailPreview: ""
    }))
  }

  // Question management functions
  const addQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      topic: contestData.chapter || "",
      questionType: "Easy",
      image: null,
      question: "",
      options: ["", "", "", "", ""],
      correctAnswer: "A",
    }
    setQuestions(prev => [newQuestion, ...prev])
  }

  const updateQuestion = (questionId, field, value) => {
    setQuestions(prev => prev.map(q => q.id === questionId ? { ...q, [field]: value } : q))
  }

  const updateQuestionOption = (questionId, optionIndex, value) => {
    setQuestions(prev =>
      prev.map(q =>
        q.id === questionId
          ? { ...q, options: q.options.map((opt, idx) => (idx === optionIndex ? value : opt)) }
          : q
      )
    )
  }

  const deleteQuestion = (questionId) => {
    setQuestions(prev => prev.filter(q => q.id !== questionId))
  }

  const handleImageUpload = (questionId, file) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (e) => {
        updateQuestion(questionId, "image", e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  // Format date for datetime-local input
  function formatDateTimeLocal(dateString) {
    if (!dateString) return ""
    const date = new Date(dateString)
    const offset = date.getTimezoneOffset()
    const localDate = new Date(date.getTime() - offset * 60 * 1000)
    return localDate.toISOString().slice(0, 16)
  }

  const handleUpdate = async () => {
    if (!contestData.title || questions.length === 0) {
      toast.error("Please enter a title and at least one question.")
      return
    }

    try {
      setIsUpdating(true)
      
      // Create form data to handle file upload
      const formData = new FormData()
      formData.append("title", contestData.title)
      formData.append("description", contestData.description)
      formData.append("prize", contestData.prize)
      formData.append("duration", contestData.duration)
      formData.append("region", contestData.regionName)
      formData.append("examType", contestData.examType)
      formData.append("specificClass", contestData.specificClass)
      formData.append("subject", contestData.subject)
      formData.append("chapter", contestData.chapter)
      formData.append("startTime", contestData.startTime)
      formData.append("deadline", contestData.deadline)
      formData.append("questions", JSON.stringify(questions))
      
      // Append thumbnail if it's a new file
      if (contestData.thumbnail) {
        formData.append("thumbnail", contestData.thumbnail)
      }

      const response = await updateContest(id, formData)
      if (response.data?.success) {
        toast.success("Contest updated successfully!")
        navigate("/filter-contest")
      } else {
        toast.error(response.data?.message || "Failed to update contest")
      }
    } catch (error) {
      console.error("Update Contest Error:", error)
      toast.error("Something went wrong while updating the contest")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this contest?")) {
      try {
        setIsDeleting(true)
        const response = await deleteContest(id)
        if (response.data?.success) {
          toast.success("Contest deleted successfully!")
          navigate("/filter-contest")
        } else {
          toast.error(response.data?.message || "Failed to delete contest")
        }
      } catch (error) {
        console.error("Delete Contest Error:", error)
        toast.error("Something went wrong while deleting the contest")
      } finally {
        setIsDeleting(false)
      }
    }
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-gray-700">Loading contest data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 overflow-auto bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 md:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 md:mb-12"
        >
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Edit Contest
          </h1>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
            Update contest details and manage questions
          </p>
        </motion.div>

        {/* Contest Setup */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="md:shadow-2xl md:border-0 bg-white md:bg-white/90 md:backdrop-blur-xl rounded-3xl overflow-hidden w-full">
            <div className="md:bg-gradient-to-r md:from-blue-600 md:via-purple-600 md:to-indigo-600 text-white p-6 md:p-8">
              <div className="flex items-center gap-3 text-xl md:text-2xl font-bold">
                <div className="p-2 bg-blue-600 md:bg-white/20 rounded-xl">
                  <Settings className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                Contest Setup
              </div>
            </div>
            <div className="p-4 md:p-8 space-y-6 md:space-y-8">
              {/* Thumbnail Upload Section */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-800">Contest Thumbnail</Label>
                <div className="border-2 border-dashed border-blue-300 rounded-3xl p-4 md:p-8 text-center hover:border-blue-400 transition-all duration-200 bg-gray-50/50">
                  {contestData.thumbnailPreview ? (
                    <div className="relative inline-block">
                      <img
                        src={contestData.thumbnailPreview || "/placeholder.svg"}
                        alt="Contest thumbnail"
                        className="max-h-48 md:max-h-64 mx-auto rounded-2xl shadow-lg"
                      />
                      <Button
                        onClick={removeThumbnail}
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 md:-top-3 md:-right-3 rounded-full w-6 h-6 md:w-8 md:h-8 p-0 shadow-lg"
                      >
                        <X className="w-3 h-3 md:w-4 md:h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
                      </div>
                      <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4 font-medium">
                        Drag & drop a thumbnail image or click to browse
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleThumbnailUpload(e.target.files[0])}
                        className="hidden"
                        id="thumbnail-upload"
                      />
                      <label
                        htmlFor="thumbnail-upload"
                        className="inline-flex items-center px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-2xl hover:from-blue-600 hover:to-indigo-600 cursor-pointer font-medium shadow-lg hover:shadow-xl transition-all duration-200 text-sm md:text-base"
                      >
                        <Upload className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                        Choose Thumbnail
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Duration Field (placed below thumbnail) */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Duration (e.g. 30 minutes)
                </Label>
                <Input
                  type="text"
                  value={contestData.duration}
                  onChange={(e) => handleContestDataChange("duration", e.target.value)}
                  className="h-14 px-5 py-3 bg-white border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-gray-900 font-medium placeholder:text-gray-500 shadow-sm hover:border-gray-300"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
                {/* Region Dropdown */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-gray-800">Region</Label>
                  <div className="relative">
                    <select
                      value={contestData.region}
                      onChange={(e) => handleContestDataChange("region", e.target.value)}
                      className="w-full h-12 md:h-14 px-4 md:px-5 py-2 md:py-3 bg-white border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-gray-900 font-medium appearance-none cursor-pointer shadow-sm hover:border-gray-300"
                      disabled={isLoading}
                    >
                      <option value="">Select region</option>
                      {regions.map((region) => (
                        <option key={region._id} value={region._id}>
                          {region.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Exam Type Dropdown */}
                {contestData.region && (
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-gray-800">Exam Type</Label>
                    <div className="relative">
                      <select
                        value={contestData.examType}
                        onChange={(e) => handleContestDataChange("examType", e.target.value)}
                        className="w-full h-12 md:h-14 px-4 md:px-5 py-2 md:py-3 bg-white border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-gray-900 font-medium appearance-none cursor-pointer shadow-sm hover:border-gray-300"
                      >
                        <option value="">Select exam type</option>
                        {getExamTypes().map((examType) => (
                          <option key={examType} value={examType}>
                            {examType}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                )}

                {/* Specific Class Dropdown */}
                {contestData.examType && (
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-gray-800">Specific Class</Label>
                    <div className="relative">
                      <select
                        value={contestData.specificClass}
                        onChange={(e) => handleContestDataChange("specificClass", e.target.value)}
                        className="w-full h-12 md:h-14 px-4 md:px-5 py-2 md:py-3 bg-white border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-gray-900 font-medium appearance-none cursor-pointer shadow-sm hover:border-gray-300"
                      >
                        <option value="">Select class</option>
                        {getSpecificClasses().map((cls) => (
                          <option key={cls} value={cls}>
                            {cls}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                )}

                {/* Subject Dropdown */}
                {contestData.specificClass && (
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-gray-800">Subject</Label>
                    <div className="relative">
                      <select
                        value={contestData.subject}
                        onChange={(e) => handleContestDataChange("subject", e.target.value)}
                        className="w-full h-12 md:h-14 px-4 md:px-5 py-2 md:py-3 bg-white border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-gray-900 font-medium appearance-none cursor-pointer shadow-sm hover:border-gray-300"
                      >
                        <option value="">Select subject</option>
                        {getSubjects().map((subject) => (
                          <option key={subject} value={subject}>
                            {subject}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                )}

                {/* Chapter Dropdown */}
                {contestData.subject && (
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-gray-800">Chapter</Label>
                    <div className="relative">
                      <select
                        value={contestData.chapter}
                        onChange={(e) => handleContestDataChange("chapter", e.target.value)}
                        className="w-full h-12 md:h-14 px-4 md:px-5 py-2 md:py-3 bg-white border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-gray-900 font-medium appearance-none cursor-pointer shadow-sm hover:border-gray-300"
                      >
                        <option value="">Select chapter/topic</option>
                        {getChapters().map((chapter) => (
                          <option key={chapter} value={chapter}>
                            {chapter}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                )}

                {/* Contest Title */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                    Contest Title
                  </Label>
                  <Input
                    type="text"
                    placeholder="Enter contest title"
                    value={contestData.title}
                    onChange={(e) => handleContestDataChange("title", e.target.value)}
                    className="h-14 px-5 py-3 bg-white border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-gray-900 font-medium placeholder:text-gray-500 shadow-sm hover:border-gray-300"
                  />
                </div>

                {/* Contest Description */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Contest Description
                  </Label>
                  <textarea
                    placeholder="Enter contest description"
                    value={contestData.description}
                    onChange={(e) => handleContestDataChange("description", e.target.value)}
                    rows={3}
                    className="w-full px-5 py-3 bg-white border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-gray-900 font-medium placeholder:text-gray-500 shadow-sm hover:border-gray-300"
                  />
                </div>

                {/* Prize */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    Prize
                  </Label>
                  <Input
                    type="text"
                    placeholder="Enter prize amount or description"
                    value={contestData.prize}
                    onChange={(e) => handleContestDataChange("prize", e.target.value)}
                    className="h-14 px-5 py-3 bg-white border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-gray-900 font-medium placeholder:text-gray-500 shadow-sm hover:border-gray-300"
                  />
                </div>

                {/* Start Time */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Start Time
                  </Label>
                  <Input
                    type="datetime-local"
                    value={formatDateTimeLocal(contestData.startTime)}
                    onChange={(e) => handleContestDataChange("startTime", e.target.value)}
                    className="h-14 px-5 py-3 bg-white border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-gray-900 font-medium placeholder:text-gray-500 shadow-sm hover:border-gray-300"
                  />
                </div>

                {/* Deadline */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Deadline
                  </Label>
                  <Input
                    type="datetime-local"
                    value={formatDateTimeLocal(contestData.deadline)}
                    onChange={(e) => handleContestDataChange("deadline", e.target.value)}
                    className="h-14 px-5 py-3 bg-white border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-gray-900 font-medium placeholder:text-gray-500 shadow-sm hover:border-gray-300"
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Questions Section */}
        <div className="space-y-4 md:space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Questions ({questions.length})
            </h2>
            <Button
              onClick={addQuestion}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-2xl h-12 px-4 md:px-6 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Plus className="w-4 h-4 md:w-5 md:h-5 mr-2" />
              Add Question
            </Button>
          </div>

          <AnimatePresence>
            {questions.map((question, index) => (
              <motion.div
                key={question.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30, scale: 0.95 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="md:shadow-2xl md:border-0 bg-white md:bg-white/90 md:backdrop-blur-xl rounded-3xl overflow-hidden mb-6">
                  <div className="md:bg-gradient-to-r md:from-indigo-600 md:to-blue-600 text-white p-4 md:p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-lg md:text-xl font-bold">
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-600 md:bg-white/20 rounded-xl flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                        Question {index + 1}
                      </div>
                      {questions.length > 1 && (
                        <Button
                          onClick={() => deleteQuestion(question.id)}
                          variant="ghost"
                          size="sm"
                          className="text-white hover:bg-white/20 rounded-xl h-8 w-8 md:h-10 md:w-10 p-0"
                        >
                          <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="p-4 md:p-8 space-y-6 md:space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                      {/* Topic */}
                      <div className="space-y-3">
                        <Label className="text-sm font-semibold text-gray-800">Topic</Label>
                        <Input
                          placeholder="Enter topic"
                          value={question.topic}
                          onChange={(e) => updateQuestion(question.id, "topic", e.target.value)}
                          className="h-14 px-5 py-3 bg-white border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-gray-900 font-medium placeholder:text-gray-500 shadow-sm hover:border-gray-300"
                        />
                      </div>
                      {/* Question Type */}
                      <div className="space-y-3">
                        <Label className="text-sm font-semibold text-gray-800">Difficulty Level</Label>
                        <div className="relative">
                          <select
                            value={question.questionType}
                            onChange={(e) => updateQuestion(question.id, "questionType", e.target.value)}
                            className="w-full h-12 md:h-14 px-4 md:px-5 py-2 md:py-3 bg-white border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-gray-900 font-medium appearance-none cursor-pointer shadow-sm hover:border-gray-300"
                          >
                            <option value="Easy">Easy</option>
                            <option value="Average">Average</option>
                            <option value="Hard">Hard</option>
                          </select>
                          <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400 pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    {/* Image Upload */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-gray-800">Question Image (Optional)</Label>
                      <div className="border-2 border-dashed border-blue-300 rounded-3xl p-4 md:p-8 text-center hover:border-blue-400 transition-all duration-200 bg-gray-50/50">
                        {question.image ? (
                          <div className="relative inline-block">
                            <img
                              src={question.image || "/placeholder.svg"}
                              alt="Question"
                              className="max-h-48 md:max-h-64 mx-auto rounded-2xl shadow-lg"
                            />
                            <Button
                              onClick={() => updateQuestion(question.id, "image", null)}
                              variant="destructive"
                              size="sm"
                              className="absolute -top-2 -right-2 md:-top-3 md:-right-3 rounded-full w-6 h-6 md:w-8 md:h-8 p-0 shadow-lg"
                            >
                              <X className="w-3 h-3 md:w-4 md:h-4" />
                            </Button>
                          </div>
                        ) : (
                          <div>
                            <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center">
                              <ImageIcon className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
                            </div>
                            <p className="text-sm md:text-base text-gray-600 mb-3 md:mb-4 font-medium">
                              Drag & drop an image or click to browse
                            </p>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageUpload(question.id, e.target.files[0])}
                              className="hidden"
                              id={`image-${question.id}`}
                            />
                            <label
                              htmlFor={`image-${question.id}`}
                              className="inline-flex items-center px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-2xl hover:from-blue-600 hover:to-indigo-600 cursor-pointer font-medium shadow-lg hover:shadow-xl transition-all duration-200 text-sm md:text-base"
                            >
                              <Upload className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                              Choose Image
                            </label>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Question Field */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-gray-800">Question</Label>
                      <textarea
                        placeholder="Enter your question here..."
                        value={question.question}
                        onChange={(e) => updateQuestion(question.id, "question", e.target.value)}
                        rows={3}
                        className="w-full px-4 md:px-5 py-3 md:py-4 bg-white border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-gray-900 font-medium placeholder:text-gray-500 resize-none shadow-sm hover:border-gray-300"
                      />
                    </div>

                    {/* Options A-E */}
                    <div className="space-y-3 md:space-y-4">
                      <Label className="text-sm font-semibold text-gray-800">Answer Options</Label>
                      <div className="grid grid-cols-1 gap-3 md:gap-4">
                        {question.options?.map((option, optionIndex) => (
                          <div key={optionIndex} className="flex items-center gap-3 md:gap-4">
                            <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-2xl flex items-center justify-center font-bold text-base md:text-lg shadow-lg">
                              {String.fromCharCode(65 + optionIndex)}
                            </div>
                            <Input
                              placeholder={`Enter option ${String.fromCharCode(65 + optionIndex)}`}
                              value={option}
                              onChange={(e) => updateQuestionOption(question.id, optionIndex, e.target.value)}
                              className="flex-1 h-10 md:h-12 px-3 md:px-4 py-2 md:py-3 bg-white border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-gray-900 font-medium placeholder:text-gray-500 shadow-sm hover:border-gray-300"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Correct Answer */}
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-gray-800">Correct Answer</Label>
                      <div className="relative">
                        <select
                          value={question.correctAnswer}
                          onChange={(e) => updateQuestion(question.id, "correctAnswer", e.target.value)}
                          className="w-full h-12 md:h-14 px-4 md:px-5 py-2 md:py-3 bg-white border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-gray-900 font-medium appearance-none cursor-pointer shadow-sm hover:border-gray-300"
                        >
                          {["A", "B", "C", "D", "E"].map((option) => (
                            <option key={option} value={option}>
                              Option {option}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Bottom Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 md:gap-6 pt-8 md:pt-12"
        >
          <Button
            onClick={handleUpdate}
            disabled={isUpdating || isDeleting}
            className="flex-1 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white rounded-2xl md:rounded-3xl h-14 md:h-16 text-lg md:text-xl font-bold shadow-lg md:shadow-2xl hover:shadow-xl md:hover:shadow-3xl transition-all duration-300 transform hover:scale-105"
          >
            {isUpdating ? "Updating..." : "Update Contest"}
          </Button>
          <Button
            onClick={handleDelete}
            disabled={isDeleting || isUpdating}
            variant="destructive"
            className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-2xl md:rounded-3xl h-14 md:h-16 text-lg md:text-xl font-bold shadow-lg md:shadow-2xl hover:shadow-xl md:hover:shadow-3xl transition-all duration-300 transform hover:scale-105"
          >
            <Trash2 className="w-5 h-5 md:w-6 md:h-6 mr-2 md:mr-3" />
            {isDeleting ? "Deleting..." : "Delete Contest"}
          </Button>
        </motion.div>
      </div>
    </div>
  )
}

export default EditContest