"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useParams, useNavigate } from "react-router-dom"
import {
  BookOpen,
  X,
  Plus,
  Trash2,
  Sparkles,
  Target,
  Save,
  Tag as TagIcon,
  ImageIcon,
  Upload,
  ArrowLeft,
  Layers,
  Loader2,
  CheckCircle,
  FileText
} from "lucide-react"
import {
  getallqnadabyId,
  updateQandA,
  getAllQandARegions,
} from "../../../../services/operations/qandA"
import toast from "react-hot-toast"
import ReactQuill from "react-quill"
import "react-quill/dist/quill.snow.css"

// RichTextEditor component for HTML content
const RichTextEditor = ({ label, placeholder, value, onChange }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-bold uppercase tracking-wider text-[#555a6a]">{label}</label>
    <div className="bg-white rounded-xl border border-[#c7cad5] overflow-hidden focus-within:border-[#1c1c1e] focus-within:ring-2 focus-within:ring-[#ffd02f]/30 [&_.ql-container]:min-h-[120px] [&_.ql-editor]:min-h-[120px]">
      <ReactQuill
        theme="snow"
        placeholder={placeholder}
        value={value || ""}
        onChange={onChange}
      />
    </div>
  </div>
)

// ImageUpload component
const ImageUpload = ({ label, image, onImageChange, onRemove }) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <label className="text-xs font-bold uppercase tracking-wider text-[#555a6a] flex items-center gap-1.5">
        <ImageIcon className="w-3.5 h-3.5 text-[#4262ff]" />
        <span>{label} (Optional)</span>
      </label>
      <span className="text-xs text-[#555a6a]">JPG, PNG, WebP up to 2MB</span>
    </div>

    {image ? (
      <div className="relative rounded-2xl border border-[#1c1c1e] overflow-hidden bg-white shadow-sm max-w-md">
        <img
          src={image.dataUrl || image}
          alt={label}
          className="w-full h-48 sm:h-56 object-cover"
        />
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-3 right-3 inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/95 hover:bg-white text-[#800000] border border-[#e0e2e8] shadow-md transition-transform active:scale-90"
          aria-label="Remove thumbnail"
          title="Remove thumbnail"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    ) : (
      <label className="flex flex-col items-center justify-center gap-2.5 p-6 rounded-2xl border-2 border-dashed border-[#c7cad5] bg-[#fffdf5] hover:bg-white hover:border-[#1c1c1e] cursor-pointer text-center group transition-all">
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
        <div className="w-10 h-10 rounded-full bg-[#ffd02f] text-[#1c1c1e] flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
          <Upload className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs sm:text-sm font-bold text-[#1c1c1e]">Upload {label.toLowerCase()}</p>
          <p className="text-[11px] text-[#555a6a]">Click or drag image file here</p>
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
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-2xl border border-[#c7cad5] p-6 sm:p-7 space-y-5 shadow-sm hover:border-[#1c1c1e] transition-colors"
    >
      <div className="flex items-center justify-between pb-3 border-b border-[#e0e2e8]">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#ffd02f] text-[#1c1c1e] font-black text-xs">
            {index + 1}
          </span>
          <h4 className="text-sm sm:text-base font-bold text-[#1c1c1e]">
            Question Item #{index + 1}
          </h4>
        </div>
        <button
          type="button"
          onClick={onDelete}
          className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#fbd4d4] hover:bg-[#f8bebe] text-[#800000] text-xs font-bold transition-all"
          title="Delete question"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete</span>
        </button>
      </div>

      <RichTextEditor
        label="Question Statement"
        placeholder="Enter question text or equation..."
        value={question.question || ""}
        onChange={(value) => onUpdate({ ...question, question: value })}
      />

      {/* Question Image Upload */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-[#555a6a] flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5 text-[#4262ff]" />
          <span>Question Diagram (Optional)</span>
        </label>

        {question.questionImage ? (
          <div className="relative rounded-xl border border-[#c7cad5] overflow-hidden bg-[#f7f8fa] p-2 max-w-sm">
            <img
              src={question.questionImage.dataUrl || question.questionImage}
              alt="Question diagram"
              className="w-full h-44 object-contain rounded-lg"
            />
            <button
              type="button"
              onClick={handleRemoveQuestionImage}
              className="absolute top-3 right-3 inline-flex items-center justify-center w-7 h-7 rounded-full bg-white text-[#800000] border border-[#e0e2e8] shadow transition-transform active:scale-90"
              title="Remove question diagram"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <label className="flex items-center gap-2.5 px-3.5 h-11 min-h-[44px] rounded-xl border border-dashed border-[#c7cad5] bg-[#fffdf5] hover:bg-white hover:border-[#1c1c1e] cursor-pointer text-xs font-semibold text-[#555a6a] transition-all max-w-sm">
            <Upload className="w-4 h-4 text-[#4262ff]" />
            <span>Attach diagram or figure</span>
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
          </label>
        )}
      </div>

      <RichTextEditor
        label="Step-by-Step Solution / Answer"
        placeholder="Enter step-by-step solution..."
        value={question.answer || ""}
        onChange={(value) => onUpdate({ ...question, answer: value })}
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
    tags: [],
    status: "active",
    questions: [],
    thumbnail: null,
  })

  const [selectedRegion, setSelectedRegion] = useState(null)
  const [regions, setRegions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newTag, setNewTag] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)

        const regionsResponse = await getAllQandARegions()
        const regionList = regionsResponse?.data || []
        setRegions(regionList)

        const qandaResponse = await getallqnadabyId(id)
        const qandaData = qandaResponse?.data || {}

        const regionObj = regionList.find((r) => r.name === qandaData?.category?.region) || null

        let tagsArray = []
        if (qandaData?.tags) {
          if (Array.isArray(qandaData.tags)) {
            if (qandaData.tags.length === 1 && typeof qandaData.tags[0] === 'string') {
              tagsArray = qandaData.tags[0].split(',').map(tag => tag.trim()).filter(Boolean)
            } else if (qandaData.tags.length > 0 && typeof qandaData.tags[0] === 'string') {
              tagsArray = qandaData.tags
            } else if (qandaData.tags.length > 0 && qandaData.tags[0].includes('"')) {
              try {
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
            tagsArray = qandaData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
          }
        }

        setFormData({
          region: regionObj?._id || "",
          examType: qandaData?.category?.examType || "",
          specificClass: qandaData?.category?.specificClass || "",
          subject: qandaData?.category?.subject || "",
          chapterName: qandaData?.chapterName || "",
          tags: tagsArray,
          status: qandaData?.status || "active",
          questions: qandaData?.questions || [],
          thumbnail: qandaData?.thumbnail || null,
        })

        setSelectedRegion(regionObj)
      } catch (error) {
        console.error("Failed to fetch Q&A data:", error)
        toast.error("Failed to load Q&A data")
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      fetchData()
    }
  }, [id])

  const getExamTypes = () => {
    return selectedRegion?.examTypes?.map((type) => type.name) || []
  }

  const getSpecificClasses = () => {
    if (!formData.examType || !selectedRegion) return []
    const selectedExamType = selectedRegion.examTypes?.find((et) => et.name === formData.examType)
    return selectedExamType?.specificClasses?.map((cls) => cls.name) || []
  }

  const getSubjects = () => {
    if (!formData.examType || !formData.specificClass || !selectedRegion) return []
    const selectedExamType = selectedRegion.examTypes?.find((et) => et.name === formData.examType)
    const selectedSpecificClass = selectedExamType?.specificClasses?.find((sc) => sc.name === formData.specificClass)
    return selectedSpecificClass?.subjects?.map((subject) => subject.name) || []
  }

  const handleThumbnailChange = (fileData) => {
    setFormData({ ...formData, thumbnail: fileData })
  }

  const handleRemoveThumbnail = () => {
    setFormData({ ...formData, thumbnail: null })
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag.trim()]
      })
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    })
  }

  const handleTagKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addTag()
    }
  }

  const addQuestion = () => {
    setFormData({
      ...formData,
      questions: [
        ...formData.questions,
        {
          question: "",
          answer: "",
          questionImage: null,
          questiontype: "General"
        }
      ]
    })
  }

  const updateQuestion = (index, updatedQuestion) => {
    const updatedQuestions = [...formData.questions]
    updatedQuestions[index] = updatedQuestion
    setFormData({ ...formData, questions: updatedQuestions })
  }

  const deleteQuestion = (index) => {
    setFormData({
      ...formData,
      questions: formData.questions.filter((_, i) => i !== index)
    })
  }

  const handleUpdateQandA = async () => {
    try {
      setIsSubmitting(true)

      const selectedRegionObj = regions.find(r => r._id === formData.region)
      const regionName = selectedRegionObj?.name || ""

      const formDataToSend = new FormData()

      const category = {
        region: regionName,
        examType: formData.examType,
        specificClass: formData.specificClass,
        subject: formData.subject
      }
      formDataToSend.append("category", JSON.stringify(category))
      formDataToSend.append("chapterName", formData.chapterName.trim())
      formDataToSend.append("status", formData.status)
      formDataToSend.append("tags", JSON.stringify(formData.tags))

      if (formData.thumbnail && formData.thumbnail.file) {
        formDataToSend.append("thumbnail", formData.thumbnail.file)
      } else if (formData.thumbnail && typeof formData.thumbnail === 'string') {
        formDataToSend.append("thumbnail", formData.thumbnail)
      } else {
        formDataToSend.append("thumbnail", "")
      }

      const questionsWithImages = []

      for (const question of formData.questions) {
        const questionData = { ...question }

        if (questionData.questionImage && questionData.questionImage.file) {
          questionsWithImages.push({
            question: questionData.question,
            answer: questionData.answer,
            questionImage: "file_upload",
            questiontype: questionData.questiontype || "General",
            questionReportStatus: questionData.questionReportStatus || "not reported",
            questionReportShow: questionData.questionReportShow || "show",
            answerReportStatus: questionData.answerReportStatus || "not reported",
            answerReportShow: questionData.answerReportShow || "show",
            createdAt: questionData.createdAt || new Date().toISOString(),
            _id: questionData._id
          })
          formDataToSend.append(`questionImage_${questionData._id || Date.now()}`, questionData.questionImage.file)
        } else {
          questionsWithImages.push({
            ...questionData,
            questionImage: questionData.questionImage || null
          })
        }
      }

      formDataToSend.append("questions", JSON.stringify(questionsWithImages))

      await updateQandA(id, formDataToSend)

      toast.success(`Q&A set updated successfully!`)
      navigate("/view-qa")
    } catch (error) {
      console.error("Error updating Q&A:", error)
      toast.error("Failed to update Q&A: " + (error?.message || "Server error"))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f7f8fa] text-[#1c1c1e] py-12 px-4 flex items-center justify-center">
        <div className="bg-white rounded-2xl border border-[#c7cad5] p-10 text-center space-y-3 shadow-sm max-w-sm w-full">
          <Loader2 className="w-8 h-8 animate-spin text-[#4262ff] mx-auto" />
          <h3 className="text-sm font-bold text-[#1c1c1e]">Loading Q&amp;A Set...</h3>
          <p className="text-xs text-[#555a6a]">Fetching chapter and questions data</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#1c1c1e] py-6 sm:py-8 px-4 sm:px-6 lg:px-8 xl:px-12 w-full">
      <div className="w-full space-y-6">

        {/* Top Header Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e0e2e8]">
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => navigate("/view-qa")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#c7cad5] text-[#1c1c1e] hover:bg-[#f7f8fa] hover:border-[#1c1c1e] transition-all text-sm font-semibold shadow-sm active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Q&amp;A List</span>
            </button>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#ffd02f] text-[#1c1c1e]">
              EDIT Q&amp;A
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#ffd8f4] text-[#86296b] border border-[#f3bee5]">
              ADMIN &amp; MANAGER
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-[#c7cad5] text-xs font-bold text-[#1c1c1e]">
              <Layers className="w-3.5 h-3.5 text-[#4262ff]" />
              <span>{formData.questions.length} Questions</span>
            </span>
          </div>
        </div>

        {/* Title */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#1c1c1e]">
            Edit Question &amp; Answer Set
          </h1>
          <p className="text-sm sm:text-base text-[#555a6a]">
            Modify curriculum taxonomy, chapter title, searchable tags, and manage question items.
          </p>
        </div>

        {/* Card 1: Taxonomy & Topic Metadata */}
        <div className="bg-white rounded-2xl border border-[#c7cad5] p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex items-center gap-3 pb-4 border-b border-[#e0e2e8]">
            <div className="p-2 rounded-xl bg-[#c3faf5] text-[#187574] border border-[#9eece4]">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#1c1c1e]">
                1. Curriculum &amp; Classification
              </h2>
              <p className="text-xs text-[#555a6a]">
                Adjust the taxonomy positioning of this chapter.
              </p>
            </div>
          </div>

          {/* Thumbnail */}
          <ImageUpload
            label="Cover Thumbnail"
            image={formData.thumbnail}
            onImageChange={handleThumbnailChange}
            onRemove={handleRemoveThumbnail}
          />

          {/* Cascade Dropdowns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 pt-2">
            {/* Region */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#555a6a]">
                Region *
              </label>
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
                className="w-full h-11 min-h-[44px] px-3.5 rounded-xl border border-[#c7cad5] bg-[#fffdf5] text-[#1c1c1e] text-sm font-semibold focus:outline-none focus:border-[#1c1c1e] focus:ring-2 focus:ring-[#ffd02f]/30 transition-all"
              >
                <option value="">Choose region</option>
                {regions.map((region) => (
                  <option key={region._id} value={region._id}>
                    {region.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Exam Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#555a6a]">
                Exam Type *
              </label>
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
                disabled={!formData.region}
                className="w-full h-11 min-h-[44px] px-3.5 rounded-xl border border-[#c7cad5] bg-[#fffdf5] text-[#1c1c1e] text-sm font-semibold focus:outline-none focus:border-[#1c1c1e] focus:ring-2 focus:ring-[#ffd02f]/30 transition-all disabled:opacity-50"
              >
                <option value="">Choose exam type</option>
                {getExamTypes().map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Class */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#555a6a]">
                Specific Class *
              </label>
              <select
                value={formData.specificClass}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    specificClass: e.target.value,
                    subject: "",
                  })
                }
                disabled={!formData.examType}
                className="w-full h-11 min-h-[44px] px-3.5 rounded-xl border border-[#c7cad5] bg-[#fffdf5] text-[#1c1c1e] text-sm font-semibold focus:outline-none focus:border-[#1c1c1e] focus:ring-2 focus:ring-[#ffd02f]/30 transition-all disabled:opacity-50"
              >
                <option value="">Choose class</option>
                {getSpecificClasses().map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>
            </div>

            {/* Subject */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#555a6a]">
                Subject *
              </label>
              <select
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                disabled={!formData.specificClass}
                className="w-full h-11 min-h-[44px] px-3.5 rounded-xl border border-[#c7cad5] bg-[#fffdf5] text-[#1c1c1e] text-sm font-semibold focus:outline-none focus:border-[#1c1c1e] focus:ring-2 focus:ring-[#ffd02f]/30 transition-all disabled:opacity-50"
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

          {/* Chapter Name & Tags */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#555a6a]">
                Chapter Name *
              </label>
              <input
                type="text"
                placeholder="Enter chapter name..."
                value={formData.chapterName}
                onChange={(e) => setFormData({ ...formData, chapterName: e.target.value })}
                className="w-full h-11 min-h-[44px] px-4 rounded-xl border border-[#c7cad5] bg-[#fffdf5] text-[#1c1c1e] text-sm font-semibold focus:outline-none focus:border-[#1c1c1e] focus:ring-2 focus:ring-[#ffd02f]/30 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#555a6a] flex items-center gap-1.5">
                <TagIcon className="w-3.5 h-3.5 text-[#4262ff]" />
                <span>Tags</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add a tag and press Enter"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={handleTagKeyPress}
                  className="w-full h-11 min-h-[44px] px-4 rounded-xl border border-[#c7cad5] bg-[#fffdf5] text-[#1c1c1e] text-sm font-semibold focus:outline-none focus:border-[#1c1c1e] focus:ring-2 focus:ring-[#ffd02f]/30 transition-all flex-1"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="h-11 px-5 rounded-xl bg-[#ffd02f] hover:bg-[#fcb900] text-[#1c1c1e] text-xs font-bold shadow-sm transition-all"
                >
                  Add
                </button>
              </div>

              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1.5">
                  {formData.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-[#f5f3ff] text-[#4262ff] border border-[#ddd6fe]"
                    >
                      <span>#{tag}</span>
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:text-[#800000] ml-0.5"
                        title={`Remove ${tag}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Status Visibility Selector */}
          <div className="space-y-1.5 pt-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[#555a6a]">
              Publication Status
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, status: "active" })}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all ${
                  formData.status === "active"
                    ? "bg-[#c3faf5] text-[#187574] border-[#9eece4] shadow-sm"
                    : "bg-white text-[#555a6a] border-[#c7cad5] hover:bg-[#f7f8fa]"
                }`}
              >
                ● Active (Visible to students)
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, status: "deactivate" })}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold border transition-all ${
                  formData.status === "deactivate"
                    ? "bg-[#fbd4d4] text-[#800000] border-[#e3c5c5] shadow-sm"
                    : "bg-white text-[#555a6a] border-[#c7cad5] hover:bg-[#f7f8fa]"
                }`}
              >
                ○ Deactivated (Draft mode)
              </button>
            </div>
          </div>
        </div>

        {/* Card 2: Question Items */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-6 rounded-full bg-[#ffd02f]" />
              <h3 className="text-lg sm:text-xl font-bold text-[#1c1c1e]">
                Questions &amp; Solutions ({formData.questions.length})
              </h3>
            </div>
            <button
              type="button"
              onClick={addQuestion}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#ffd02f] hover:bg-[#fcb900] text-[#1c1c1e] text-xs sm:text-sm font-bold shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Question Block</span>
            </button>
          </div>

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
              <div className="bg-white rounded-2xl border border-[#c7cad5] p-10 text-center space-y-3 shadow-sm">
                <BookOpen className="w-10 h-10 text-[#8e92a0] mx-auto" />
                <h4 className="text-sm font-bold text-[#1c1c1e]">No questions in this set</h4>
                <p className="text-xs text-[#555a6a]">
                  Click "Add Question Block" above to compose questions.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Sticky Action Bar */}
        <div className="bg-white rounded-2xl border border-[#c7cad5] p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="text-xs sm:text-sm text-[#555a6a]">
            {formData.questions.length} question{formData.questions.length !== 1 ? 's' : ''} configured
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => navigate("/view-qa")}
              className="w-full sm:w-auto px-5 py-3 rounded-full bg-white border border-[#c7cad5] text-[#1c1c1e] hover:bg-[#f7f8fa] text-xs sm:text-sm font-bold transition-all"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleUpdateQandA}
              disabled={isSubmitting || !formData.chapterName.trim()}
              className="w-full sm:w-auto h-12 min-h-[48px] px-8 rounded-full bg-[#ffd02f] hover:bg-[#fcb900] disabled:bg-gray-100 disabled:border disabled:border-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-[#1c1c1e] font-extrabold text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#1c1c1e]" />
                  <span>Updating Q&amp;A Set...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-[#1c1c1e]" />
                  <span>Update Q&amp;A Set</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}