"use client"
import { useState } from "react"
import { Plus, Trash2, Tag } from "lucide-react"
import { toast } from "react-hot-toast"
import { createQuestionType } from "../../../../services/operations/qandA"

const QuestionTypeManager = () => {
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
    <div className="fixed inset-0 overflow-auto bg-gradient-to-br from-teal-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 p-2 sm:p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-4 sm:mb-6 md:mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-teal-500 via-blue-500 to-indigo-500 rounded-full mb-2 sm:mb-4">
            <Tag className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white" />
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-teal-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-1 sm:mb-2">
            Question Type Management
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-300">
            Create and manage question types for your content
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="bg-gradient-to-r from-teal-500 via-blue-500 to-indigo-500 p-3 sm:p-4 md:p-6">
            <h2 className="text-base sm:text-lg md:text-xl font-semibold text-white flex items-center gap-2">
              <Tag className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base md:text-lg">Question Types</span>
            </h2>
            <p className="text-teal-100 text-xs sm:text-sm mt-1">Add new question types to your system</p>
          </div>

          <div className="p-3 sm:p-4 md:p-6">
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-4">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full"></div>
                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800 dark:text-white">Question Type</h3>
              </div>

              <div className="flex flex-col gap-2 sm:gap-3">
                <input
                  type="text"
                  value={newQuestionType}
                  onChange={(e) => setNewQuestionType(e.target.value)}
                  placeholder="Enter question type name..."
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 transition-all duration-200 text-sm sm:text-base"
                  onKeyPress={(e) => e.key === "Enter" && handleAddQuestionType()}
                />
                <button
                  onClick={handleAddQuestionType}
                  disabled={!newQuestionType.trim()}
                  className="w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-lg hover:from-teal-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                  Add Question Type
                </button>
              </div>

              {questionTypes.length > 0 && (
                <div className="space-y-1 sm:space-y-2">
                  {questionTypes.map((questionType, index) => (
                    <div
                      key={questionType.id}
                      className="p-2 sm:p-3 rounded-md sm:rounded-lg border-2 border-gray-200 dark:border-gray-600 transition-all duration-200"
                    >
                      <div className="flex items-center gap-1 sm:gap-2">
                        <Tag className="w-3 h-3 sm:w-4 sm:h-4 text-teal-500 flex-shrink-0" />
                        <input
                          type="text"
                          value={questionType.name}
                          onChange={(e) => updateQuestionTypeName(e, index)}
                          className="flex-1 bg-transparent border-b border-transparent focus:border-teal-300 focus:outline-none px-1 font-medium text-gray-800 dark:text-white text-sm sm:text-base min-w-0"
                        />
                        <button
                          onClick={(e) => deleteQuestionType(index, e)}
                          className="ml-auto p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded flex-shrink-0"
                        >
                          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {questionTypes.length > 0 && (
          <div className="mt-4 sm:mt-6 bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-md sm:shadow-lg border border-gray-100 dark:border-gray-700 p-3 sm:p-4 md:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-gradient-to-r from-teal-500 to-indigo-500 rounded-full"></div>
              Summary
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
              <div className="text-center p-2 sm:p-4 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
                <div className="text-lg sm:text-2xl font-bold text-teal-600 dark:text-teal-400">{questionTypes.length}</div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Question Types</div>
              </div>
              <div className="text-center p-2 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-lg sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
                  Ready
                </div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Status</div>
              </div>
            </div>
            
            <div className="mt-4 sm:mt-6 flex justify-center sm:justify-end">
              <button
                onClick={handleSubmitToServer}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-3 w-3 sm:h-4 sm:w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Creating...
                  </>
                ) : (
                  "Create Question Types"
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default QuestionTypeManager