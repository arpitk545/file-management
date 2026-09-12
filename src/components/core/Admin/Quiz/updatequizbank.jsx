"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Save, Tag, X, Edit, Sparkles, Target, Layers } from "lucide-react"
import toast from "react-hot-toast"
import { useNavigate, useParams } from "react-router-dom"
import { getAllQuizRegions, getQuizBankQuestion, updateQuizBankQuestion } from "../../../../services/operations/quizAPI"

const MiroLoader = ({ message = "Loading question details..." }) => (
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
    <label className="block text-xs font-bold uppercase tracking-wider text-[#555a6a]">
      {Icon && <Icon className="w-3.5 h-3.5 inline mr-1 text-[#4262ff]" />}
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-12 px-4 bg-white border border-[#c7cad5] rounded-xl text-[#1c1c1e] placeholder-[#8e91a0] font-semibold text-sm focus:outline-none focus:border-2 focus:border-[#4262ff] transition-all"
    />
  </div>
)

const ModernTextarea = ({ label, placeholder, value, onChange, rows = 3, required = false }) => (
  <div className="space-y-1.5">
    <label className="block text-xs font-bold uppercase tracking-wider text-[#555a6a]">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <textarea
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      className="w-full px-4 py-3 bg-white border border-[#c7cad5] rounded-xl text-[#1c1c1e] placeholder-[#8e91a0] font-semibold text-sm focus:outline-none focus:border-2 focus:border-[#4262ff] transition-all resize-none"
    />
  </div>
)

export default function UpdateQuizBank() {
  const navigate = useNavigate()
  const { questionId } = useParams()

  const [initialQuestion, setInitialQuestion] = useState(null)
  const [regions, setRegions] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const [formData, setFormData] = useState({
    region: "",
    examType: "",
    specificClass: "",
    subject: "",
    chapter: "",
    quizType: "quizbank",
  })

  const [editedQuestion, setEditedQuestion] = useState({
    text: "",
    options: { A: "", B: "", C: "", D: "" },
    correctAnswer: "",
    difficulty: "",
    tags: [],
  })

  const [tagInput, setTagInput] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const questionResponse = await getQuizBankQuestion(questionId)
        setInitialQuestion(questionResponse.question)

        const regionsResponse = await getAllQuizRegions()
        setRegions(regionsResponse?.data || [])

        const matchingRegion = regionsResponse.data.find(
          (r) => r.name === questionResponse.question.category?.region
        )

        setFormData({
          region: matchingRegion?._id || "",
          examType: questionResponse.question.category?.examType || "",
          specificClass: questionResponse.question.category?.specificClass || "",
          subject: questionResponse.question.category?.subject || "",
          chapter: questionResponse.question.category?.chapter || "",
          quizType: "quizbank",
        })

        setEditedQuestion({
          text: questionResponse.question.text || "",
          options: questionResponse.question.options || { A: "", B: "", C: "", D: "" },
          correctAnswer: questionResponse.question.correctAnswer || "",
          difficulty: questionResponse.question.difficulty || "Average",
          tags: questionResponse.question.tags || [],
        })
      } catch (error) {
        console.error("Error fetching data:", error)
        toast.error("Failed to load question data")
        navigate("/quiz-bank")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [questionId, navigate])

  const selectedRegionObject = regions.find((r) => r._id === formData.region)

  const getExamTypes = () => selectedRegionObject?.examTypes?.map((et) => et.name) || []
  const getSpecificClasses = () => {
    if (!selectedRegionObject || !formData.examType) return []
    const examTypeObj = selectedRegionObject.examTypes?.find((et) => et.name === formData.examType)
    return examTypeObj?.specificClasses?.map((sc) => sc.name) || []
  }
  const getSubjects = () => {
    if (!selectedRegionObject || !formData.examType || !formData.specificClass) return []
    const examTypeObj = selectedRegionObject.examTypes?.find((et) => et.name === formData.examType)
    const classObj = examTypeObj?.specificClasses?.find((sc) => sc.name === formData.specificClass)
    return classObj?.subjects?.map((subj) => subj.name) || []
  }
  const getChapters = () => {
    if (!selectedRegionObject || !formData.examType || !formData.specificClass || !formData.subject) return []
    const examTypeObj = selectedRegionObject.examTypes?.find((et) => et.name === formData.examType)
    const classObj = examTypeObj?.specificClasses?.find((sc) => sc.name === formData.specificClass)
    const subjectObj = classObj?.subjects?.find((sub) => sub.name === formData.subject)
    return subjectObj?.chapters?.map((ch) => ch.name) || []
  }

  const addTag = () => {
    if (tagInput.trim() && !editedQuestion.tags.includes(tagInput.trim())) {
      setEditedQuestion((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }))
      setTagInput("")
    }
  }

  const removeTag = (tagToRemove) => {
    setEditedQuestion((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }))
  }

  const handleSaveChanges = async () => {
    try {
      setIsLoading(true)
      const selectedRegion = regions.find((r) => r._id === formData.region)

      const payload = {
        text: editedQuestion.text,
        options: editedQuestion.options,
        correctAnswer: editedQuestion.correctAnswer,
        difficulty: editedQuestion.difficulty,
        tags: editedQuestion.tags,
        category: {
          region: selectedRegion?.name || "",
          examType: formData.examType,
          specificClass: formData.specificClass,
          subject: formData.subject,
          chapter: formData.chapter,
        },
      }

      await updateQuizBankQuestion(questionId, payload)
      toast.success("Question updated successfully!")
      navigate(-1)
    } catch (error) {
      console.error("Error updating question:", error)
      toast.error("Failed to update question.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f7f8fa] flex items-center justify-center p-6">
        <MiroLoader message="Loading question editor..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#1c1c1e] py-6 sm:py-8 px-4 sm:px-6 lg:px-8 xl:px-12 w-full">
      <div className="w-full space-y-6">
        
        {/* Header Bar (Posts Pattern) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e0e2e8]">
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#c7cad5] text-[#1c1c1e] hover:bg-[#f7f8fa] hover:border-[#1c1c1e] transition-all text-sm font-semibold shadow-sm active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Questions</span>
            </button>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#ffd02f] text-[#1c1c1e]">
              QUIZ STUDIO
            </span>
            <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#ffd8f4] text-[#86296b] border border-[#f3bee5]">
              QUESTION EDITOR
            </span>
          </div>
        </div>

        {/* Page Title */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#1c1c1e]">
            Update Bank Question
          </h1>
          <p className="text-sm sm:text-base text-[#555a6a]">
            Modify curriculum categorization, question prompt, option statements, and difficulty rating.
          </p>
        </div>

        {/* Step 1 Card: Category Hierarchy (Lavender Palette) */}
        <div className="bg-[#f5f3ff] rounded-2xl border-2 border-[#ddd6fe] shadow-sm p-5 sm:p-7 space-y-4 w-full">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-[#4262ff] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                <Target className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-[#1c1c1e]">Curriculum Taxonomy Hierarchy</h2>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-white text-[#4262ff] border border-[#ddd6fe]">
              Step 1 of 2
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            {/* Region (Yellow) */}
            <div className="space-y-1.5 p-3 rounded-xl bg-white border border-[#ddd6fe]">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#746019]">
                1. Region <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.region}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    region: e.target.value,
                    examType: "",
                    specificClass: "",
                    subject: "",
                    chapter: "",
                  }))
                }}
                className="w-full h-11 px-3 bg-[#fff8e0]/60 border border-[#fde89c] rounded-lg text-[#1c1c1e] font-semibold text-xs focus:outline-none focus:border-2 focus:border-[#4262ff] transition-all"
              >
                <option value="">Choose region</option>
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
                value={formData.examType}
                disabled={!formData.region}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    examType: e.target.value,
                    specificClass: "",
                    subject: "",
                    chapter: "",
                  }))
                }
                className={`w-full h-11 px-3 bg-[#c3faf5]/40 border border-[#9eece4] rounded-lg text-[#1c1c1e] font-semibold text-xs focus:outline-none focus:border-2 focus:border-[#0fbcb0] transition-all ${
                  !formData.region ? "opacity-50 cursor-not-allowed bg-gray-50" : ""
                }`}
              >
                <option value="">Choose exam type</option>
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
                value={formData.specificClass}
                disabled={!formData.examType}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    specificClass: e.target.value,
                    subject: "",
                    chapter: "",
                  }))
                }
                className={`w-full h-11 px-3 bg-[#ffd8f4]/35 border border-[#f3bee5] rounded-lg text-[#1c1c1e] font-semibold text-xs focus:outline-none focus:border-2 focus:border-[#86296b] transition-all ${
                  !formData.examType ? "opacity-50 cursor-not-allowed bg-gray-50" : ""
                }`}
              >
                <option value="">Choose class</option>
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
                value={formData.subject}
                disabled={!formData.specificClass}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    subject: e.target.value,
                    chapter: "",
                  }))
                }
                className={`w-full h-11 px-3 bg-[#ffe6cd]/40 border border-[#fcd0a1] rounded-lg text-[#1c1c1e] font-semibold text-xs focus:outline-none focus:border-2 focus:border-[#ff7347] transition-all ${
                  !formData.specificClass ? "opacity-50 cursor-not-allowed bg-gray-50" : ""
                }`}
              >
                <option value="">Choose subject</option>
                {getSubjects().map((subj) => (
                  <option key={subj} value={subj}>
                    {subj}
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
                value={formData.chapter}
                disabled={!formData.subject}
                onChange={(e) => setFormData((prev) => ({ ...prev, chapter: e.target.value }))}
                className={`w-full h-11 px-3 bg-[#f5f3ff] border border-[#ddd6fe] rounded-lg text-[#1c1c1e] font-semibold text-xs focus:outline-none focus:border-2 focus:border-[#4262ff] transition-all ${
                  !formData.subject ? "opacity-50 cursor-not-allowed bg-gray-50" : ""
                }`}
              >
                <option value="">Choose chapter</option>
                {getChapters().map((ch) => (
                  <option key={ch} value={ch}>
                    {ch}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Step 2 Card: Question Properties */}
        <div className="bg-white rounded-2xl border border-[#e0e2e8] shadow-sm p-5 sm:p-7 space-y-6 w-full">
          <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-[#e0e2e8]">
            <div className="flex items-center gap-2.5">
              <Edit className="w-5 h-5 text-[#0fbcb0]" />
              <h2 className="text-lg sm:text-xl font-bold text-[#1c1c1e]">Question Content & Options</h2>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#c3faf5] text-[#187574]">
              Step 2 of 2
            </span>
          </div>

          <div className="space-y-5">
            <ModernTextarea
              label="Question Statement"
              placeholder="Enter question text..."
              value={editedQuestion.text}
              onChange={(val) => setEditedQuestion((prev) => ({ ...prev, text: val }))}
              rows={3}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {["A", "B", "C", "D"].map((option) => (
                <ModernInput
                  key={option}
                  label={`Option ${option}`}
                  placeholder={`Enter option ${option}...`}
                  value={editedQuestion.options[option]}
                  onChange={(val) =>
                    setEditedQuestion((prev) => ({
                      ...prev,
                      options: { ...prev.options, [option]: val },
                    }))
                  }
                  required
                />
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#555a6a]">
                  Correct Answer <span className="text-red-500">*</span>
                </label>
                <select
                  value={editedQuestion.correctAnswer}
                  onChange={(e) => setEditedQuestion((prev) => ({ ...prev, correctAnswer: e.target.value }))}
                  className="w-full h-12 px-3.5 bg-white border border-[#c7cad5] rounded-xl text-[#1c1c1e] font-semibold text-sm focus:outline-none focus:border-2 focus:border-[#4262ff] transition-all"
                >
                  <option value="">Select correct answer</option>
                  {["A", "B", "C", "D"].map((opt) => (
                    <option key={opt} value={opt}>
                      Option {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#555a6a]">
                  Difficulty Level <span className="text-red-500">*</span>
                </label>
                <select
                  value={editedQuestion.difficulty}
                  onChange={(e) => setEditedQuestion((prev) => ({ ...prev, difficulty: e.target.value }))}
                  className="w-full h-12 px-3.5 bg-white border border-[#c7cad5] rounded-xl text-[#1c1c1e] font-semibold text-sm focus:outline-none focus:border-2 focus:border-[#4262ff] transition-all"
                >
                  <option value="">Select difficulty</option>
                  {["Easy", "Average", "Hard"].map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {lvl}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-1.5 pt-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#555a6a]">Tags & Keywords</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addTag()}
                  placeholder="Type tag & press enter"
                  className="flex-1 h-12 px-4 bg-white border border-[#c7cad5] rounded-xl text-[#1c1c1e] placeholder-[#8e91a0] focus:outline-none focus:border-2 focus:border-[#4262ff] text-sm font-medium"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="h-12 px-6 rounded-full bg-[#1c1c1e] text-white hover:bg-[#2c2c34] font-bold text-sm shadow-sm transition-all"
                >
                  Add
                </button>
              </div>

              {editedQuestion.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {editedQuestion.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#c3faf5] text-[#187574] border border-[#9eece4]"
                    >
                      #{tag}
                      <button type="button" onClick={() => removeTag(tag)} className="p-0.5 hover:text-red-500">
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-[#e0e2e8]">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="w-full sm:w-auto px-6 py-3 bg-white border border-[#c7cad5] text-[#1c1c1e] hover:bg-[#f7f8fa] font-semibold rounded-full text-sm transition-all shadow-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveChanges}
                className="w-full sm:w-auto px-8 py-3.5 bg-[#ffd02f] hover:bg-[#fcb900] text-[#1c1c1e] font-extrabold rounded-full text-sm shadow-md hover:shadow-lg transition-all active:scale-98 flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Question Updates</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}