"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Plus, Trash2, Tag, ArrowLeft, Layers, CheckCircle, Loader2 } from "lucide-react"
import { toast } from "react-hot-toast"
import { createQuestionType } from "../../../../services/operations/qandA"

const QuestionTypeManager = () => {
  const navigate = useNavigate()
  const [questionTypes, setQuestionTypes] = useState([])
  const [newQuestionType, setNewQuestionType] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAddQuestionType = () => {
    if (newQuestionType.trim()) {
      const questionType = {
        name: newQuestionType.trim(),
        id: Date.now()
      }
      setQuestionTypes([...questionTypes, questionType])
      setNewQuestionType("")
    }
  }

  const handleSubmitToServer = async () => {
    if (questionTypes.length === 0) {
      toast.error("Please add at least one question type before submitting")
      return
    }

    setIsSubmitting(true)
    try {
      const promises = questionTypes.map(async (qt) => {
        const response = await createQuestionType({ name: qt.name })
        return response
      })

      const results = await Promise.all(promises)
      const allSuccess = results.every(result => result.success)

      if (allSuccess) {
        toast.success("All question types created successfully!")
        setQuestionTypes([])
        setNewQuestionType("")
        navigate("/edit-question-type")
      } else {
        throw new Error("Some question types failed to create")
      }
    } catch (error) {
      console.error("Submission error:", error)
      toast.error(error.response?.data?.message || error.message || "Failed to create question types")
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateQuestionTypeName = (e, index) => {
    const newName = e.target.value
    setQuestionTypes(prev => prev.map((qt, i) =>
      i === index ? { ...qt, name: newName } : qt
    ))
  }

  const deleteQuestionType = (index, e) => {
    e.stopPropagation()
    setQuestionTypes(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#1c1c1e] py-6 sm:py-8 px-4 sm:px-6 lg:px-8 xl:px-12 w-full">
      <div className="w-full space-y-6">

        {/* Header Bar */}
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
              SCHEMA SETUP
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/edit-question-type")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#c7cad5] hover:border-[#1c1c1e] text-[#1c1c1e] text-xs sm:text-sm font-bold shadow-sm transition-all"
            >
              <span>Manage Existing Types</span>
            </button>
          </div>
        </div>

        {/* Title */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#1c1c1e]">
            Create Question Types
          </h1>
          <p className="text-sm sm:text-base text-[#555a6a]">
            Define question classifications (e.g. Multiple Choice, Short Answer, Derivation, Numerical, Diagrammatic).
          </p>
        </div>

        {/* Input & List Card */}
        <div className="bg-white rounded-2xl border border-[#c7cad5] p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex items-center gap-3 pb-3 border-b border-[#e0e2e8]">
            <div className="p-2 rounded-xl bg-[#c3faf5] text-[#187574] border border-[#9eece4]">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#1c1c1e]">
                New Question Type Definition
              </h3>
              <p className="text-xs text-[#555a6a]">Enter a title and add to the queue below.</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={newQuestionType}
              onChange={(e) => setNewQuestionType(e.target.value)}
              placeholder="e.g. MCQ, Descriptive, True/False, Case Study..."
              className="w-full h-11 min-h-[44px] px-4 rounded-xl border border-[#c7cad5] bg-[#fffdf5] text-[#1c1c1e] text-sm font-semibold focus:outline-none focus:border-[#1c1c1e] focus:ring-2 focus:ring-[#ffd02f]/30 transition-all flex-1"
              onKeyPress={(e) => e.key === "Enter" && handleAddQuestionType()}
            />
            <button
              type="button"
              onClick={handleAddQuestionType}
              disabled={!newQuestionType.trim()}
              className="h-11 px-6 rounded-xl bg-[#ffd02f] hover:bg-[#fcb900] disabled:bg-gray-100 disabled:text-gray-400 text-[#1c1c1e] text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add to Queue</span>
            </button>
          </div>

          {/* Staged Question Types List */}
          {questionTypes.length > 0 ? (
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#555a6a]">
                Queue to Submit ({questionTypes.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {questionTypes.map((qt, index) => (
                  <div
                    key={index}
                    className="p-3.5 rounded-xl border border-[#c7cad5] bg-[#fffdf5] flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="w-2 h-2 rounded-full bg-[#187574]" />
                      <input
                        type="text"
                        value={qt.name}
                        onChange={(e) => updateQuestionTypeName(e, index)}
                        className="bg-transparent border-b border-transparent focus:border-[#1c1c1e] focus:outline-none text-xs font-bold text-[#1c1c1e] truncate w-full"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={(e) => deleteQuestionType(index, e)}
                      className="p-1 rounded text-[#800000] hover:bg-[#fbd4d4]"
                      title="Remove from queue"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-[#555a6a] bg-[#f7f8fa] rounded-xl border border-[#e0e2e8]">
              No question types staged yet. Type a name above and click "Add to Queue".
            </div>
          )}
        </div>

        {/* Submit Bar */}
        {questionTypes.length > 0 && (
          <div className="bg-white rounded-2xl border border-[#c7cad5] p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <span className="text-xs sm:text-sm text-[#555a6a]">
              Ready to publish: <strong>{questionTypes.length}</strong> new question type{questionTypes.length !== 1 ? 's' : ''}
            </span>

            <button
              type="button"
              onClick={handleSubmitToServer}
              disabled={isSubmitting}
              className="w-full sm:w-auto h-12 min-h-[48px] px-8 rounded-full bg-[#ffd02f] hover:bg-[#fcb900] disabled:bg-gray-100 disabled:text-gray-400 text-[#1c1c1e] font-extrabold text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#1c1c1e]" />
                  <span>Submitting Types...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 text-[#1c1c1e]" />
                  <span>Submit Question Types</span>
                </>
              )}
            </button>
          </div>
        )}

      </div>
    </div>
  )
}

export default QuestionTypeManager