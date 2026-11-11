"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Plus,
  Trash2,
  Upload,
  X,
  ChevronDown,
  ImageIcon,
  Clock,
  Award,
  Calendar,
  BookOpen,
  ArrowLeft,
  MapPin,
  FileText,
  Save,
  Layers,
  Home,
} from "lucide-react"
import { getAllQuizRegions } from "../../../../services/operations/quizAPI"
import { getContestById, updateContest, deleteContest } from "../../../../services/operations/contestAPI"
import toast from "react-hot-toast"
import { useParams, useNavigate } from "react-router-dom"

const MiroLoader = ({ message = "Loading contest data..." }) => (
  <div className="flex flex-col items-center justify-center py-16 gap-3">
    <div className="relative w-12 h-12">
      <div className="w-12 h-12 rounded-full border-4 border-[#eef0f3] border-t-[#ffd02f] border-r-[#1c1c1e] animate-spin" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-3 h-3 rounded-full bg-[#ffd02f]" />
      </div>
    </div>
    <span className="text-xs font-bold uppercase tracking-wider text-[#555a6a]">{message}</span>
  </div>
)

const ModernInput = ({ label, type = "text", placeholder, value, onChange, icon: Icon, required = false }) => (
  <div className="space-y-1.5">
    <label className="block text-xs font-bold uppercase tracking-wider text-[#555a6a] flex items-center gap-1.5">
      {Icon && <Icon className="w-3.5 h-3.5 text-[#8e91a0]" />}
      <span>{label}</span>
      {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-12 min-h-[48px] px-4 bg-white border border-[#c7cad5] rounded-xl text-[#1c1c1e] placeholder-[#8e91a0] focus:outline-none focus:border-2 focus:border-[#4262ff] transition-all text-sm font-medium leading-normal"
    />
  </div>
)

const ModernTextarea = ({ label, placeholder, value, onChange, rows = 3 }) => (
  <div className="space-y-1.5">
    <label className="block text-xs font-bold uppercase tracking-wider text-[#555a6a]">{label}</label>
    <textarea
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      className="w-full p-4 bg-white border border-[#c7cad5] rounded-xl text-[#1c1c1e] placeholder-[#8e91a0] focus:outline-none focus:border-2 focus:border-[#4262ff] transition-all text-sm font-medium leading-normal resize-none"
    />
  </div>
)

const EditContest = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const [contestData, setContestData] = useState({
    title: "",
    description: "",
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
    thumbnailPreview: "",
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

        const regionObj = (regionsResponse.data || []).find((r) => r.name === contest.region)

        setContestData({
          title: contest.title || "",
          description: contest.description || "",
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
          thumbnailPreview: contest.thumbnail || "",
        })

        setSelectedRegion(regionObj || null)
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

  const getExamTypes = () => {
    if (!selectedRegion) return []
    return selectedRegion.examTypes?.map((type) => type.name) || []
  }

  const getSpecificClasses = () => {
    if (!selectedRegion || !contestData.examType) return []
    const examTypeObj = selectedRegion.examTypes?.find((et) => et.name === contestData.examType)
    return examTypeObj?.specificClasses?.map((sc) => sc.name) || []
  }

  const getSubjects = () => {
    if (!selectedRegion || !contestData.examType || !contestData.specificClass) return []
    const examTypeObj = selectedRegion.examTypes?.find((et) => et.name === contestData.examType)
    if (!examTypeObj) return []
    const classObj = examTypeObj.specificClasses?.find((sc) => sc.name === contestData.specificClass)
    return classObj?.subjects?.map((subject) => subject.name) || []
  }

  const getChapters = () => {
    if (!selectedRegion || !contestData.examType || !contestData.specificClass || !contestData.subject) return []
    const examTypeObj = selectedRegion.examTypes?.find((et) => et.name === contestData.examType)
    if (!examTypeObj) return []
    const classObj = examTypeObj.specificClasses?.find((sc) => sc.name === contestData.specificClass)
    if (!classObj) return []
    const subjectObj = classObj.subjects?.find((sub) => sub.name === contestData.subject)
    return subjectObj?.chapters?.map((ch) => ch.name) || []
  }

  const handleContestDataChange = (field, value) => {
    setContestData((prev) => {
      const updated = { ...prev, [field]: value }

      if (field === "region") {
        const regionObj = regions.find((r) => r._id === value)
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

  const handleThumbnailUpload = (file) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setContestData((prev) => ({
          ...prev,
          thumbnail: file,
          thumbnailPreview: e.target.result,
        }))
      }
      reader.readAsDataURL(file)
    } else {
      toast.error("Please select a valid image file")
    }
  }

  const removeThumbnail = () => {
    setContestData((prev) => ({
      ...prev,
      thumbnail: null,
      thumbnailPreview: "",
    }))
  }

  const addQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      topic: contestData.chapter || "",
      questionType: "Easy",
      image: null,
      question: "",
      options: ["", "", "", ""],
      correctAnswer: "A",
    }
    setQuestions((prev) => [...prev, newQuestion])
  }

  const updateQuestion = (questionId, field, value) => {
    setQuestions((prev) => prev.map((q) => (q.id === questionId ? { ...q, [field]: value } : q)))
  }

  const updateQuestionOption = (questionId, optionIndex, value) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === questionId
          ? { ...q, options: q.options.map((opt, idx) => (idx === optionIndex ? value : opt)) }
          : q,
      ),
    )
  }

  const deleteQuestion = (questionId) => {
    setQuestions((prev) => prev.filter((q) => q.id !== questionId))
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

      const formData = new FormData()
      formData.append("title", contestData.title)
      formData.append("description", contestData.description)
      formData.append("duration", contestData.duration)
      formData.append("region", contestData.regionName)
      formData.append("examType", contestData.examType)
      formData.append("specificClass", contestData.specificClass)
      formData.append("subject", contestData.subject)
      formData.append("chapter", contestData.chapter)
      formData.append("startTime", contestData.startTime)
      formData.append("deadline", contestData.deadline)

      if (contestData.thumbnail) {
        formData.append("thumbnail", contestData.thumbnail)
      }

      formData.append("questions", JSON.stringify(questions))

      const response = await updateContest(id, formData)

      if (response.success) {
        toast.success("Contest updated successfully!")
        navigate("/filter-contest")
      } else {
        toast.error(response.message || "Failed to update contest")
      }
    } catch (error) {
      console.error("Update Contest Error:", error)
      toast.error("Something went wrong while updating the contest")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this contest? This action cannot be undone.")) {
      try {
        setIsDeleting(true)
        const response = await deleteContest(id)
        if (response.success) {
          toast.success("Contest deleted successfully!")
          navigate("/filter-contest")
        } else {
          toast.error(response.message || "Failed to delete contest")
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
    return <MiroLoader message="Loading Contest Details..." />
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#1c1c1e] py-6 sm:py-8 px-4 sm:px-6 lg:px-8 xl:px-12 w-full">
      <div className="w-full space-y-6">
        {/* Header Bar matching Posts edit-articles.jsx */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e0e2e8]">
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => navigate("/dashboard")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#c7cad5] text-[#1c1c1e] hover:bg-[#f7f8fa] hover:border-[#1c1c1e] transition-all text-sm font-semibold shadow-sm active:scale-95 cursor-pointer"
            >
              <Home className="w-4 h-4 text-blue-600" />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => navigate("/filter-contest")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#c7cad5] text-[#1c1c1e] hover:bg-[#f7f8fa] hover:border-[#1c1c1e] transition-all text-sm font-semibold shadow-sm active:scale-95 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Contests</span>
            </button>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#ffd02f] text-[#1c1c1e]">
              CONTEST STUDIO
            </span>
            <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#ffd8f4] text-[#86296b] border border-[#f3bee5]">
              EDIT CONTEST
            </span>
          </div>

          <button
            onClick={() => navigate("/create-contests")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1c1c1e] text-white hover:bg-[#2c2c34] text-sm font-bold transition-all shadow-sm self-start sm:self-auto active:scale-98"
          >
            <Plus className="w-4 h-4 text-[#ffd02f]" />
            <span>New Contest</span>
          </button>
        </div>

        {/* Page Title */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#1c1c1e]">
            Edit Contest
          </h1>
          <p className="text-sm sm:text-base text-[#555a6a]">
            Modify contest schedule, curriculum taxonomy, and interactive questions.
          </p>
        </div>

        {/* STEP 1: Contest Setup & Taxonomy (Lavender Card) */}
        <div className="bg-[#f5f3ff] rounded-2xl border-2 border-[#ddd6fe] shadow-sm p-5 sm:p-7 space-y-6 w-full">
          <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-[#ddd6fe]">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-[#4262ff] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                <MapPin className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-[#1c1c1e]">Contest Setup & Taxonomy Hierarchy</h2>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-white text-[#4262ff] border border-[#ddd6fe]">
              Step 1 of 2
            </span>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <ModernInput
              label="Contest Title"
              placeholder="e.g. National Championship 2026"
              value={contestData.title}
              onChange={(value) => handleContestDataChange("title", value)}
              icon={BookOpen}
              required
            />
            <ModernInput
              label="Duration (minutes)"
              type="number"
              placeholder="e.g. 60"
              value={contestData.duration}
              onChange={(value) => handleContestDataChange("duration", value)}
              icon={Clock}
            />
            <ModernInput
              label="Start Date & Time"
              type="datetime-local"
              value={formatDateTimeLocal(contestData.startTime)}
              onChange={(value) => handleContestDataChange("startTime", value)}
              icon={Calendar}
            />
            <ModernInput
              label="Deadline / Expiry"
              type="datetime-local"
              value={formatDateTimeLocal(contestData.deadline)}
              onChange={(value) => handleContestDataChange("deadline", value)}
              icon={Calendar}
            />
          </div>

          {/* Taxonomy Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5 pt-2">
            {/* Region (Yellow) */}
            <div className="space-y-1.5 p-3 rounded-xl bg-white border border-[#ddd6fe]">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#746019]">
                1. Region <span className="text-red-500">*</span>
              </label>
              <select
                value={contestData.region}
                onChange={(e) => handleContestDataChange("region", e.target.value)}
                className="w-full h-11 min-h-[44px] px-3 bg-[#fff8e0]/60 border border-[#fde89c] rounded-lg text-[#1c1c1e] font-semibold text-sm focus:outline-none focus:border-2 focus:border-[#4262ff]"
              >
                <option value="">Choose region...</option>
                {regions.map((region) => (
                  <option key={region._id} value={region._id}>
                    {region.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Exam Type (Teal) */}
            <div className="space-y-1.5 p-3 rounded-xl bg-white border border-[#ddd6fe]">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#187574]">
                2. Exam Type <span className="text-red-500">*</span>
              </label>
              <select
                value={contestData.examType}
                onChange={(e) => handleContestDataChange("examType", e.target.value)}
                disabled={!contestData.region}
                className={`w-full h-11 min-h-[44px] px-3 bg-[#c3faf5]/40 border border-[#9eece4] rounded-lg text-[#1c1c1e] font-semibold text-sm focus:outline-none focus:border-2 focus:border-[#0fbcb0] ${
                  !contestData.region ? "opacity-50 cursor-not-allowed bg-gray-50" : ""
                }`}
              >
                <option value="">Choose exam type...</option>
                {getExamTypes().map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Class (Rose) */}
            <div className="space-y-1.5 p-3 rounded-xl bg-white border border-[#ddd6fe]">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#86296b]">
                3. Class <span className="text-red-500">*</span>
              </label>
              <select
                value={contestData.specificClass}
                onChange={(e) => handleContestDataChange("specificClass", e.target.value)}
                disabled={!contestData.examType}
                className={`w-full h-11 min-h-[44px] px-3 bg-[#ffd8f4]/35 border border-[#f3bee5] rounded-lg text-[#1c1c1e] font-semibold text-sm focus:outline-none focus:border-2 focus:border-[#86296b] ${
                  !contestData.examType ? "opacity-50 cursor-not-allowed bg-gray-50" : ""
                }`}
              >
                <option value="">Choose class...</option>
                {getSpecificClasses().map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>
            </div>

            {/* Subject (Orange) */}
            <div className="space-y-1.5 p-3 rounded-xl bg-white border border-[#ddd6fe]">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#7c3a00]">
                4. Subject <span className="text-red-500">*</span>
              </label>
              <select
                value={contestData.subject}
                onChange={(e) => handleContestDataChange("subject", e.target.value)}
                disabled={!contestData.specificClass}
                className={`w-full h-11 min-h-[44px] px-3 bg-[#ffe6cd]/40 border border-[#fcd0a1] rounded-lg text-[#1c1c1e] font-semibold text-sm focus:outline-none focus:border-2 focus:border-[#ff7347] ${
                  !contestData.specificClass ? "opacity-50 cursor-not-allowed bg-gray-50" : ""
                }`}
              >
                <option value="">Choose subject...</option>
                {getSubjects().map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </div>

            {/* Chapter (Lavender) */}
            <div className="space-y-1.5 p-3 rounded-xl bg-white border border-[#ddd6fe]">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#4262ff]">
                5. Chapter <span className="text-red-500">*</span>
              </label>
              <select
                value={contestData.chapter}
                onChange={(e) => handleContestDataChange("chapter", e.target.value)}
                disabled={!contestData.subject}
                className={`w-full h-11 min-h-[44px] px-3 bg-[#f5f3ff] border border-[#ddd6fe] rounded-lg text-[#1c1c1e] font-semibold text-sm focus:outline-none focus:border-2 focus:border-[#4262ff] ${
                  !contestData.subject ? "opacity-50 cursor-not-allowed bg-gray-50" : ""
                }`}
              >
                <option value="">Choose chapter...</option>
                {getChapters().map((ch) => (
                  <option key={ch} value={ch}>
                    {ch}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Thumbnail & Description */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#555a6a]">Contest Thumbnail</label>
              <div className="border-2 border-dashed border-[#c7cad5] rounded-xl p-4 text-center hover:border-[#4262ff] transition-all bg-white">
                {contestData.thumbnailPreview ? (
                  <div className="relative inline-block">
                    <img
                      src={contestData.thumbnailPreview}
                      alt="Contest thumbnail"
                      className="max-h-36 mx-auto rounded-lg object-contain border border-[#e0e2e8]"
                    />
                    <button
                      type="button"
                      onClick={removeThumbnail}
                      className="absolute -top-2 -right-2 p-1 rounded-full bg-white text-red-500 hover:bg-red-50 border border-red-200 shadow-sm"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <Upload className="w-8 h-8 text-[#8e91a0] mx-auto mb-1.5" />
                    <p className="text-xs font-semibold text-[#1c1c1e]">Replace thumbnail</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleThumbnailUpload(e.target.files?.[0])}
                      className="hidden"
                      id="edit-contest-thumbnail"
                    />
                    <label
                      htmlFor="edit-contest-thumbnail"
                      className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-[#1c1c1e] text-white rounded-full hover:bg-[#2c2c34] cursor-pointer text-xs font-bold shadow-sm transition-all"
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-[#ffd02f]" />
                      <span>Upload New Image</span>
                    </label>
                  </div>
                )}
              </div>
            </div>

            <ModernTextarea
              label="Contest Description"
              placeholder="Enter contest description..."
              value={contestData.description}
              onChange={(value) => handleContestDataChange("description", value)}
              rows={5}
            />
          </div>
        </div>

        {/* STEP 2: Questions Builder (White Card) */}
        <div className="bg-white rounded-2xl border border-[#c7cad5] shadow-sm p-5 sm:p-7 space-y-6 w-full">
          <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-[#e0e2e8]">
            <div className="flex items-center gap-2.5">
              <FileText className="w-5 h-5 text-[#0fbcb0]" />
              <h2 className="text-lg sm:text-xl font-bold text-[#1c1c1e]">
                Contest Questions ({questions.length})
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={addQuestion}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#1c1c1e] text-white hover:bg-[#2c2c34] text-xs font-bold transition-all shadow-xs"
              >
                <Plus className="w-3.5 h-3.5 text-[#ffd02f]" />
                <span>Add Question</span>
              </button>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#c3faf5] text-[#187574]">
                Step 2 of 2
              </span>
            </div>
          </div>

          {/* Questions List */}
          <div className="space-y-4">
            <AnimatePresence>
              {questions.map((question, index) => (
                <motion.div
                  key={question.id || index}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="p-4 sm:p-5 rounded-xl border border-[#e0e2e8] bg-white space-y-4 shadow-2xs"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-[#e0e2e8]">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#1c1c1e] text-white text-xs font-extrabold flex items-center justify-center">
                        {index + 1}
                      </span>
                      <span className="text-sm font-bold text-[#1c1c1e]">Question {index + 1}</span>
                    </div>
                    {questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => deleteQuestion(question.id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                        title="Delete Question"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#555a6a]">Topic</label>
                      <input
                        type="text"
                        placeholder="Topic"
                        value={question.topic}
                        onChange={(e) => updateQuestion(question.id, "topic", e.target.value)}
                        className="w-full h-11 min-h-[44px] px-3 bg-white border border-[#c7cad5] rounded-xl text-sm font-medium text-[#1c1c1e] focus:outline-none focus:border-2 focus:border-[#4262ff]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#555a6a]">Difficulty</label>
                      <select
                        value={question.questionType}
                        onChange={(e) => updateQuestion(question.id, "questionType", e.target.value)}
                        className="w-full h-11 min-h-[44px] px-3 bg-white border border-[#c7cad5] rounded-xl text-sm font-medium text-[#1c1c1e] focus:outline-none focus:border-2 focus:border-[#4262ff]"
                      >
                        <option value="Easy">Easy</option>
                        <option value="Average">Average</option>
                        <option value="Hard">Hard</option>
                      </select>
                    </div>
                  </div>

                  {/* Question Prompt */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#555a6a]">Question Prompt</label>
                    <textarea
                      placeholder="Enter question text..."
                      value={question.question || question.text || ""}
                      onChange={(e) => updateQuestion(question.id, "question", e.target.value)}
                      rows={2}
                      className="w-full p-3 bg-white border border-[#c7cad5] rounded-xl text-sm font-medium text-[#1c1c1e] focus:outline-none focus:border-2 focus:border-[#4262ff] resize-none"
                    />
                  </div>

                  {/* Image Upload for Question */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#555a6a]">Question Image (Optional)</label>
                    {question.image ? (
                      <div className="relative inline-block">
                        <img
                          src={question.image}
                          alt="Question"
                          className="max-h-36 rounded-lg object-contain border border-[#e0e2e8]"
                        />
                        <button
                          type="button"
                          onClick={() => updateQuestion(question.id, "image", null)}
                          className="absolute -top-2 -right-2 p-1 rounded-full bg-white text-red-500 hover:bg-red-50 border border-red-200"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(question.id, e.target.files?.[0])}
                          className="hidden"
                          id={`edit-q-image-${question.id}`}
                        />
                        <label
                          htmlFor={`edit-q-image-${question.id}`}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-[#c7cad5] text-[#1c1c1e] text-xs font-bold hover:bg-[#f7f8fa] cursor-pointer shadow-xs"
                        >
                          <ImageIcon className="w-3.5 h-3.5 text-[#86296b]" />
                          <span>Upload Image</span>
                        </label>
                      </div>
                    )}
                  </div>

                  {/* Options */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#555a6a]">Answer Options</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {question.options?.map((option, optIdx) => {
                        const optLetter = ["A", "B", "C", "D", "E"][optIdx] || optIdx + 1
                        return (
                          <div key={optIdx} className="flex items-center gap-2">
                            <span className="w-7 h-7 rounded-full bg-[#f5f3ff] text-[#4262ff] border border-[#ddd6fe] text-xs font-bold flex items-center justify-center shrink-0">
                              {optLetter}
                            </span>
                            <input
                              type="text"
                              placeholder={`Option ${optLetter}`}
                              value={option}
                              onChange={(e) => updateQuestionOption(question.id, optIdx, e.target.value)}
                              className="w-full h-10 min-h-[40px] px-3 bg-white border border-[#c7cad5] rounded-xl text-sm font-medium text-[#1c1c1e] focus:outline-none focus:border-2 focus:border-[#4262ff]"
                            />
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Correct Answer */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#187574]">Correct Answer</label>
                    <select
                      value={question.correctAnswer}
                      onChange={(e) => updateQuestion(question.id, "correctAnswer", e.target.value)}
                      className="w-full sm:w-48 h-10 min-h-[40px] px-3 bg-[#c3faf5]/30 border border-[#9eece4] rounded-xl text-sm font-bold text-[#1c1c1e] focus:outline-none focus:border-2 focus:border-[#0fbcb0]"
                    >
                      {["A", "B", "C", "D", "E"].map((opt) => (
                        <option key={opt} value={opt}>
                          Option {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Bottom Card Actions */}
          <div className="pt-6 border-t border-[#e0e2e8] flex justify-start">
            <button
              type="button"
              onClick={addQuestion}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white border border-[#c7cad5] text-[#1c1c1e] hover:bg-[#f7f8fa] hover:border-[#1c1c1e] font-semibold text-sm transition-all active:scale-95 shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Another Question</span>
            </button>
          </div>
        </div>

        {/* Action Buttons Bar matching Posts edit-articles.jsx */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting || isUpdating}
            className="px-6 py-3 rounded-full bg-[#fbd4d4] hover:bg-[#f9a9a9] text-[#600000] border border-[#e3c5c5] font-bold text-sm transition-all disabled:opacity-50"
          >
            {isDeleting ? "Deleting..." : "Delete Contest"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/filter-contest")}
            className="px-6 py-3 rounded-full bg-white border border-[#c7cad5] text-[#1c1c1e] hover:bg-[#f7f8fa] font-semibold text-sm transition-all shadow-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleUpdate}
            disabled={isUpdating || isDeleting}
            className="px-8 py-3.5 rounded-full bg-[#4262ff] hover:bg-[#2a41b6] text-white font-bold text-sm shadow-md hover:shadow transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-98"
          >
            {isUpdating ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Updating Contest...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-[#ffd02f]" />
                <span>Update Contest</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default EditContest