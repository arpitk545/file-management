"use client"
import { useState, useEffect } from "react"
import { ChevronRight, Tag, Grid3X3, Trash2, Save, Edit } from "lucide-react"
import { toast } from "react-hot-toast"
import { getAllQuestionTypes, updateQuestionType, deleteQuestionType } from "../../../../services/operations/qandA"

const EditQuestionType = () => {
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
        const response = await getAllQuestionTypes()
        setQuestionTypes(response?.data || [])
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
        toast.success(response.message)
        const updatedResponse = await getAllQuestionTypes()
        setQuestionTypes(updatedResponse?.data || [])
        setNewQuestionTypeName("")
        setSelectedQuestionType(null)
        setSelectedQuestionTypeIndex(null)
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
    setIsDeleting(true)
    try {
      const response = await deleteQuestionType(selectedQuestionType._id)
      if (response.success) {
        toast.success(response.message)
        const updatedResponse = await getAllQuestionTypes()
        setQuestionTypes(updatedResponse?.data || [])
        setSelectedQuestionType(null)
        setSelectedQuestionTypeIndex(null)
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
      <div className="fixed inset-0 overflow-auto bg-gradient-to-br from-teal-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 p-2 sm:p-4 md:p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 overflow-auto bg-gradient-to-br from-teal-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 p-2 sm:p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-4 sm:mb-6 md:mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-teal-500 via-blue-500 to-indigo-500 rounded-full mb-2 sm:mb-4">
            <Edit className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-teal-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-1 sm:mb-2">
            Edit Question Types
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
            Modify existing question types
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="bg-gradient-to-r from-teal-500 via-blue-500 to-indigo-500 p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-white flex items-center gap-2">
              <Grid3X3 className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base md:text-lg">Edit Question Types</span>
            </h2>
            <p className="text-teal-100 text-xs sm:text-sm mt-1">Update your question types</p>
          </div>

          <div className="p-3 sm:p-4 md:p-6">
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-4">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full"></div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white">Question Types</h3>
              </div>

              {questionTypes.length > 0 ? (
                <div className="space-y-1 sm:space-y-2">
                  {questionTypes.map((questionType, index) => (
                    <div
                      key={questionType._id || index}
                      onClick={() => selectQuestionType(index)}
                      className={`p-2 sm:p-3 rounded-md sm:rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                        selectedQuestionTypeIndex === index
                          ? "border-teal-500 bg-teal-50 dark:bg-teal-900/20"
                          : "border-gray-200 dark:border-gray-600 hover:border-teal-300 dark:hover:border-teal-600"
                      }`}
                    >
                      <div className="flex items-center gap-1 sm:gap-2">
                        <Tag className="w-3 h-3 sm:w-4 sm:h-4 text-teal-500" />
                        <span className="text-sm sm:text-base font-medium text-gray-800 dark:text-white">
                          {questionType.name}
                        </span>
                        <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 ml-auto" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-2 sm:py-3 text-sm text-gray-500">No question types found.</div>
              )}

              {selectedQuestionType && (
                <div className="mt-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Update Question Type Name
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
                    className="w-full p-2 sm:p-3 rounded-md sm:rounded-lg border-2 border-teal-200 dark:border-gray-600 bg-teal-50 dark:bg-gray-800 text-gray-800 dark:text-white
                      focus:outline-none focus:border-teal-500 transition-all duration-200 text-sm sm:text-base"
                  />
                  {newQuestionTypeName?.trim()?.length > 0 && newQuestionTypeName !== selectedQuestionType.name && (
                    <p className="text-xs text-teal-600 dark:text-teal-400 mt-2">
                      Will update from "{selectedQuestionType.name}" to "{newQuestionTypeName}"
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {selectedQuestionType && (
          <div className="mt-4 sm:mt-6 bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-md sm:shadow-lg border border-gray-100 dark:border-gray-700 p-3 sm:p-4 md:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex-1">
                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800 dark:text-white mb-1">
                  Editing: {selectedQuestionType.name}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                  Use the buttons to update or delete this question type.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <button
                  onClick={handleDeleteQuestionType}
                  disabled={isDeleting}
                  className="px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:from-red-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 text-xs sm:text-sm"
                >
                  {isDeleting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-1 h-3 w-3 sm:h-4 sm:w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      Delete
                    </>
                  )}
                </button>
                <button
                  onClick={handleUpdateQuestionType}
                  disabled={isUpdating || (!newQuestionTypeName.trim() && newQuestionTypeName === selectedQuestionType.name)}
                  className="px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-lg hover:from-teal-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 text-xs sm:text-sm"
                >
                  {isUpdating ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-1 h-3 w-3 sm:h-4 sm:w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="w-3 h-3 sm:w-4 sm:h-4" />
                      Update
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default EditQuestionType