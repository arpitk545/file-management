"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  Tag,
  Trash2,
  Save,
  ArrowLeft,
  ChevronRight,
  Loader2,
  Plus,
  CheckCircle,
  AlertCircle
} from "lucide-react"
import { toast } from "react-hot-toast"
import { getAllQuestionTypes, updateQuestionType, deleteQuestionType } from "../../../../services/operations/qandA"

const EditQuestionType = () => {
  const navigate = useNavigate()
  const [questionTypes, setQuestionTypes] = useState([])
  const [selectedQuestionType, setSelectedQuestionType] = useState(null)
  const [selectedQuestionTypeIndex, setSelectedQuestionTypeIndex] = useState(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [newQuestionTypeName, setNewQuestionTypeName] = useState("")

  useEffect(() => {
    const loadAllQuestionTypes = async () => {
      try {
        setIsLoading(true)
        const response = await getAllQuestionTypes()
        const types = response?.data || []
        setQuestionTypes(types)
        if (types.length > 0) {
          setSelectedQuestionType(types[0])
          setSelectedQuestionTypeIndex(0)
        }
      } catch (error) {
        console.error("Error loading question types:", error)
        toast.error("Failed to load question types")
      } finally {
        setIsLoading(false)
      }
    }
    loadAllQuestionTypes()
  }, [])

  useEffect(() => {
    if (selectedQuestionType) {
      setNewQuestionTypeName("")
    }
  }, [selectedQuestionType])

  const handleUpdateQuestionType = async () => {
    if (!selectedQuestionType || !selectedQuestionType._id) {
      toast.error("Please select a question type to update")
      return
    }
    setIsUpdating(true)
    try {
      const updatedName = newQuestionTypeName.trim() || selectedQuestionType.name

      const response = await updateQuestionType(selectedQuestionType._id, {
        name: updatedName
      })

      if (response.success) {
        toast.success(response.message || "Question type updated successfully!")
        const updatedResponse = await getAllQuestionTypes()
        const updatedTypes = updatedResponse?.data || []
        setQuestionTypes(updatedTypes)
        setNewQuestionTypeName("")
        const refreshed = updatedTypes.find(t => t.name === updatedName) || updatedTypes[selectedQuestionTypeIndex]
        setSelectedQuestionType(refreshed)
      } else {
        throw new Error(response.message || "Failed to update question type")
      }
    } catch (error) {
      console.error("Update error:", error)
      toast.error(error.response?.data?.message || error.message || "Failed to update question type")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteQuestionType = async () => {
    if (!selectedQuestionType) {
      toast.error("Please select a question type to delete")
      return
    }

    if (!window.confirm(`Are you sure you want to delete "${selectedQuestionType.name}"?`)) return

    setIsDeleting(true)
    try {
      const response = await deleteQuestionType(selectedQuestionType._id)
      if (response.success) {
        toast.success(response.message || "Question type deleted successfully!")
        const updatedResponse = await getAllQuestionTypes()
        const updatedTypes = updatedResponse?.data || []
        setQuestionTypes(updatedTypes)
        if (updatedTypes.length > 0) {
          setSelectedQuestionType(updatedTypes[0])
          setSelectedQuestionTypeIndex(0)
        } else {
          setSelectedQuestionType(null)
          setSelectedQuestionTypeIndex(null)
        }
        setNewQuestionTypeName("")
      } else {
        throw new Error(response.message || "Failed to delete question type")
      }
    } catch (error) {
      console.error("Delete error:", error)
      toast.error(error.response?.data?.message || error.message || "Failed to delete question type")
    } finally {
      setIsDeleting(false)
    }
  }

  const selectQuestionType = (index) => {
    const questionType = questionTypes[index]
    setSelectedQuestionType({ ...questionType })
    setSelectedQuestionTypeIndex(index)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f7f8fa] text-[#1c1c1e] py-12 px-4 flex items-center justify-center">
        <div className="bg-white rounded-2xl border border-[#c7cad5] p-10 text-center space-y-3 shadow-sm max-w-sm w-full">
          <Loader2 className="w-8 h-8 animate-spin text-[#4262ff] mx-auto" />
          <h3 className="text-sm font-bold text-[#1c1c1e]">Loading Question Types...</h3>
          <p className="text-xs text-[#555a6a]">Fetching question type registry</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#1c1c1e] py-6 sm:py-8 px-4 sm:px-6 lg:px-8 xl:px-12 w-full">
      <div className="w-full space-y-6">

        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e0e2e8]">
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => navigate("/dashboard")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#c7cad5] text-[#1c1c1e] hover:bg-[#f7f8fa] hover:border-[#1c1c1e] transition-all text-sm font-semibold shadow-sm active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </button>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#ffd02f] text-[#1c1c1e]">
              QUESTION TYPES
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#ffd8f4] text-[#86296b] border border-[#f3bee5]">
              SCHEMA EDITOR
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/create-question-type")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#ffd02f] hover:bg-[#fcb900] text-[#1c1c1e] text-xs sm:text-sm font-extrabold shadow-sm transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Type</span>
            </button>
          </div>
        </div>

        {/* Title */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#1c1c1e]">
            Manage Question Types
          </h1>
          <p className="text-sm sm:text-base text-[#555a6a]">
            Review, rename, or prune question classifications across quizzes and Q&amp;A repositories.
          </p>
        </div>

        {/* Types Pill List */}
        {questionTypes.length > 0 && (
          <div className="bg-white rounded-2xl border border-[#c7cad5] p-5 space-y-3 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-[#555a6a] block">
              Available Question Types ({questionTypes.length})
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              {questionTypes.map((qt, index) => {
                const isSelected = selectedQuestionTypeIndex === index
                return (
                  <button
                    key={qt._id || index}
                    type="button"
                    onClick={() => selectQuestionType(index)}
                    className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold border transition-all active:scale-95 flex items-center gap-2 ${
                      isSelected
                        ? "bg-[#1c1c1e] text-[#ffd02f] border-[#1c1c1e] shadow-sm"
                        : "bg-[#f7f8fa] text-[#1c1c1e] border-[#c7cad5] hover:border-[#1c1c1e]"
                    }`}
                  >
                    <Tag className="w-3.5 h-3.5" />
                    <span>{qt.name}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Selected Type Editor */}
        {selectedQuestionType ? (
          <div className="bg-white rounded-2xl border border-[#c7cad5] p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="flex items-center gap-3 pb-3 border-b border-[#e0e2e8]">
              <div className="p-2 rounded-xl bg-[#c3faf5] text-[#187574] border border-[#9eece4]">
                <Tag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#1c1c1e]">
                  Edit Type: {selectedQuestionType.name}
                </h3>
                <p className="text-xs text-[#555a6a]">Modify the display title for this question classification.</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[#555a6a]">
                New Question Type Name
              </label>
              <input
                type="text"
                value={newQuestionTypeName || selectedQuestionType.name}
                onChange={(e) => {
                  const newName = e.target.value
                  setNewQuestionTypeName(newName)
                  setSelectedQuestionType(prev => ({ ...prev, name: newName }))
                }}
                placeholder="Enter new question type name..."
                className="w-full h-11 min-h-[44px] px-4 rounded-xl border border-[#c7cad5] bg-[#fffdf5] text-[#1c1c1e] text-sm font-semibold focus:outline-none focus:border-[#1c1c1e] focus:ring-2 focus:ring-[#ffd02f]/30 transition-all"
              />
            </div>

            {/* Actions Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#e0e2e8]">
              <button
                type="button"
                onClick={handleDeleteQuestionType}
                disabled={isDeleting}
                className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-white border border-[#e3c5c5] text-[#800000] hover:bg-[#fbd4d4] text-xs sm:text-sm font-bold transition-all"
              >
                {isDeleting ? "Deleting..." : "Delete Question Type"}
              </button>

              <button
                type="button"
                onClick={handleUpdateQuestionType}
                disabled={isUpdating}
                className="w-full sm:w-auto h-11 min-h-[44px] px-8 rounded-full bg-[#ffd02f] hover:bg-[#fcb900] disabled:bg-gray-100 disabled:text-gray-400 text-[#1c1c1e] font-extrabold text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#1c1c1e]" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 text-[#1c1c1e]" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#c7cad5] p-12 text-center space-y-3">
            <Tag className="w-10 h-10 text-[#8e92a0] mx-auto" />
            <h3 className="text-base font-bold text-[#1c1c1e]">No Question Type Selected</h3>
            <p className="text-xs text-[#555a6a]">Select a question type above or create a new one.</p>
          </div>
        )}

      </div>
    </div>
  )
}

export default EditQuestionType