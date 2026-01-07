"use client"
import { useState } from "react"
import { Plus, MapPin, Tag, Grid3X3, Trash2 } from "lucide-react"
import { createQuizRegion } from "../../../../services/operations/quizAPI"
import { toast } from "react-hot-toast"

const QuizRegion = () => {
  const [regions, setRegions] = useState([])
  const [newRegion, setNewRegion] = useState("")
  const [selectedRegionIndex, setSelectedRegionIndex] = useState(null)
  const [selectedExamTypeIndex, setSelectedExamTypeIndex] = useState(null)
  const [selectedSpecificClassIndex, setSelectedSpecificClassIndex] = useState(null)
  const [selectedSubjectIndex, setSelectedSubjectIndex] = useState(null)
  const [newExamType, setNewExamType] = useState("")
  const [newSpecificClass, setNewSpecificClass] = useState("")
  const [newSubject, setNewSubject] = useState("")
  const [newChapter, setNewChapter] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const selectedRegion = selectedRegionIndex !== null ? regions[selectedRegionIndex] : null
  const selectedExamType =
    selectedExamTypeIndex !== null && selectedRegion ? selectedRegion.examTypes[selectedExamTypeIndex] : null
  const selectedSpecificClass =
    selectedSpecificClassIndex !== null && selectedExamType
      ? selectedExamType.specificClasses[selectedSpecificClassIndex]
      : null
  const selectedSubject =
    selectedSubjectIndex !== null && selectedSpecificClass ? selectedSpecificClass.subjects[selectedSubjectIndex] : null

  const handleAddRegion = () => {
    if (newRegion.trim()) {
      const region = {
        name: newRegion.trim(),
        examTypes: [],
      }
      setRegions([...regions, region])
      setNewRegion("")
      setSelectedRegionIndex(regions.length)
      setSelectedExamTypeIndex(null)
      setSelectedSpecificClassIndex(null)
      setSelectedSubjectIndex(null)
    }
  }

  const handleAddExamType = () => {
    if (newExamType.trim() && selectedRegionIndex !== null) {
      const examType = {
        name: newExamType.trim(),
        specificClasses: [],
      }
      const updatedRegions = [...regions]
      updatedRegions[selectedRegionIndex].examTypes.push(examType)
      setRegions(updatedRegions)
      setNewExamType("")
      setSelectedExamTypeIndex(updatedRegions[selectedRegionIndex].examTypes.length - 1)
      setSelectedSpecificClassIndex(null)
      setSelectedSubjectIndex(null)
    }
  }

  const handleAddSpecificClass = () => {
    if (newSpecificClass.trim() && selectedRegionIndex !== null && selectedExamTypeIndex !== null) {
      const updatedRegions = [...regions]
      const specificClass = {
        name: newSpecificClass.trim(),
        subjects: [],
      }

      updatedRegions[selectedRegionIndex].examTypes[selectedExamTypeIndex].specificClasses.push(specificClass)
      setRegions(updatedRegions)
      setNewSpecificClass("")
      setSelectedSpecificClassIndex(
        updatedRegions[selectedRegionIndex].examTypes[selectedExamTypeIndex].specificClasses.length - 1,
      )
      setSelectedSubjectIndex(null)
    }
  }

  const handleAddSubject = () => {
    if (
      newSubject.trim() &&
      selectedRegionIndex !== null &&
      selectedExamTypeIndex !== null &&
      selectedSpecificClassIndex !== null
    ) {
      const updatedRegions = [...regions]
      const subject = {
        name: newSubject.trim(),
        chapters: [],
      }

      updatedRegions[selectedRegionIndex].examTypes[selectedExamTypeIndex].specificClasses[
        selectedSpecificClassIndex
      ].subjects.push(subject)
      setRegions(updatedRegions)
      setNewSubject("")
      setSelectedSubjectIndex(
        updatedRegions[selectedRegionIndex].examTypes[selectedExamTypeIndex].specificClasses[selectedSpecificClassIndex]
          .subjects.length - 1,
      )
    }
  }

  const handleAddChapter = () => {
    if (
      newChapter.trim() &&
      selectedRegionIndex !== null &&
      selectedExamTypeIndex !== null &&
      selectedSpecificClassIndex !== null &&
      selectedSubjectIndex !== null
    ) {
      const updatedRegions = [...regions]

      updatedRegions[selectedRegionIndex].examTypes[selectedExamTypeIndex].specificClasses[
        selectedSpecificClassIndex
      ].subjects[selectedSubjectIndex].chapters.push({
        name: newChapter.trim(),
      })
      setRegions(updatedRegions)
      setNewChapter("")
    }
  }

  const handleSubmitToServer = async () => {
    if (regions.length === 0) {
      toast.error("Please add at least one region before submitting")
      return
    }
    setIsSubmitting(true)
    try {
      const response = await createQuizRegion(regions)

      if (response.message) {
        toast.success(response.message)
        setRegions([])
        setNewRegion("")
        setSelectedRegionIndex(null)
        setSelectedExamTypeIndex(null)
        setSelectedSpecificClassIndex(null)
        setSelectedSubjectIndex(null)
      } else {
        throw new Error("Unexpected response from server")
      }
    } catch (error) {
      console.error("Submission error:", error)
      toast.error(error.response?.data?.error || "Failed to submit regions")
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectRegion = (index) => {
    setSelectedRegionIndex(index)
    setSelectedExamTypeIndex(null)
    setSelectedSpecificClassIndex(null)
    setSelectedSubjectIndex(null)
  }

  const selectExamType = (index) => {
    setSelectedExamTypeIndex(index)
    setSelectedSpecificClassIndex(null)
    setSelectedSubjectIndex(null)
  }

  const selectSpecificClass = (index) => {
    setSelectedSpecificClassIndex(index)
    setSelectedSubjectIndex(null)
  }

  const selectSubject = (index) => {
    setSelectedSubjectIndex(index)
  }

  const updateRegionName = (e, index) => {
    const newName = e.target.value
    setRegions((prev) => prev.map((region, i) => (i === index ? { ...region, name: newName } : region)))
  }

  const updateCategoryName = (categoryType, index, e) => {
    const newName = e.target.value
    setRegions((prev) =>
      prev.map((region, i) => {
        if (i !== selectedRegionIndex) return region

        if (categoryType === "examType") {
          const updatedExamTypes = [...region.examTypes]
          updatedExamTypes[index] = { ...updatedExamTypes[index], name: newName }
          return { ...region, examTypes: updatedExamTypes }
        }
        if (categoryType === "specificClass") {
          return {
            ...region,
            examTypes: region.examTypes.map((examType, idx1) => {
              if (idx1 !== selectedExamTypeIndex) return examType
              const updatedSpecificClasses = [...examType.specificClasses]
              updatedSpecificClasses[index] = { ...updatedSpecificClasses[index], name: newName }
              return { ...examType, specificClasses: updatedSpecificClasses }
            }),
          }
        }
        if (categoryType === "subject") {
          return {
            ...region,
            examTypes: region.examTypes.map((examType, idx1) => {
              if (idx1 !== selectedExamTypeIndex) return examType
              return {
                ...examType,
                specificClasses: examType.specificClasses.map((specificClass, idx2) => {
                  if (idx2 !== selectedSpecificClassIndex) return specificClass
                  const updatedSubjects = [...specificClass.subjects]
                  updatedSubjects[index] = { ...updatedSubjects[index], name: newName }
                  return { ...specificClass, subjects: updatedSubjects }
                }),
              }
            }),
          }
        }
        if (categoryType === "chapter") {
          return {
            ...region,
            examTypes: region.examTypes.map((examType, idx1) => {
              if (idx1 !== selectedExamTypeIndex) return examType
              return {
                ...examType,
                specificClasses: examType.specificClasses.map((specificClass, idx2) => {
                  if (idx2 !== selectedSpecificClassIndex) return specificClass
                  return {
                    ...specificClass,
                    subjects: specificClass.subjects.map((subject, idx3) => {
                      if (idx3 !== selectedSubjectIndex) return subject
                      const updatedChapters = [...subject.chapters]
                      updatedChapters[index] = { ...updatedChapters[index], name: newName }
                      return { ...subject, chapters: updatedChapters }
                    }),
                  }
                }),
              }
            }),
          }
        }
        return region
      }),
    )
  }

  const deleteRegion = (index, e) => {
    e.stopPropagation()
    setRegions((prev) => prev.filter((_, i) => i !== index))
    if (selectedRegionIndex === index) {
      setSelectedRegionIndex(null)
      setSelectedExamTypeIndex(null)
      setSelectedSpecificClassIndex(null)
      setSelectedSubjectIndex(null)
    } else if (selectedRegionIndex > index) {
      setSelectedRegionIndex(selectedRegionIndex - 1)
    }
  }

  const deleteCategory = (categoryType, index, e) => {
    e.stopPropagation()
    setRegions((prev) =>
      prev.map((region, i) => {
        if (i !== selectedRegionIndex) return region
        if (categoryType === "examType") {
          return {
            ...region,
            examTypes: region.examTypes.filter((_, i) => i !== index),
          }
        }
        if (categoryType === "specificClass") {
          return {
            ...region,
            examTypes: region.examTypes.map((examType, idx1) => {
              if (idx1 !== selectedExamTypeIndex) return examType
              return {
                ...examType,
                specificClasses: examType.specificClasses.filter((_, i) => i !== index),
              }
            }),
          }
        }
        if (categoryType === "subject") {
          return {
            ...region,
            examTypes: region.examTypes.map((examType, idx1) => {
              if (idx1 !== selectedExamTypeIndex) return examType
              return {
                ...examType,
                specificClasses: examType.specificClasses.map((specificClass, idx2) => {
                  if (idx2 !== selectedSpecificClassIndex) return specificClass
                  return {
                    ...specificClass,
                    subjects: specificClass.subjects.filter((_, i) => i !== index),
                  }
                }),
              }
            }),
          }
        }
        if (categoryType === "chapter") {
          return {
            ...region,
            examTypes: region.examTypes.map((examType, idx1) => {
              if (idx1 !== selectedExamTypeIndex) return examType
              return {
                ...examType,
                specificClasses: examType.specificClasses.map((specificClass, idx2) => {
                  if (idx2 !== selectedSpecificClassIndex) return specificClass
                  return {
                    ...specificClass,
                    subjects: specificClass.subjects.map((subject, idx3) => {
                      if (idx3 !== selectedSubjectIndex) return subject
                      return {
                        ...subject,
                        chapters: subject.chapters.filter((_, i) => i !== index),
                      }
                    }),
                  }
                }),
              }
            }),
          }
        }
        return region
      }),
    )
  }

  return (
    <div className="fixed inset-0 overflow-auto bg-gradient-to-br from-teal-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 p-2 sm:p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-4 sm:mb-6 md:mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-teal-500 via-blue-500 to-indigo-500 rounded-full mb-2 sm:mb-4">
            <MapPin className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white" />
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-teal-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-1 sm:mb-2">
            Quiz Region Management
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-300">
            Organize your quiz content with regions and categories
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-teal-500 via-blue-500 to-indigo-500 p-3 sm:p-4 md:p-6">
            <h2 className="text-base sm:text-lg md:text-xl font-semibold text-white flex items-center gap-2">
              <Grid3X3 className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base md:text-lg">Hierarchical Structure</span>
            </h2>
            <p className="text-teal-100 text-xs sm:text-sm mt-1">Build your organizational tree</p>
          </div>

          <div className="p-3 sm:p-4 md:p-6">
            {/* Level 1: Region */}
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-4">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full"></div>
                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800 dark:text-white">Region</h3>
              </div>

              <div className="flex flex-col gap-2 sm:gap-3">
                <input
                  type="text"
                  value={newRegion}
                  onChange={(e) => setNewRegion(e.target.value)}
                  placeholder="Enter region name..."
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 transition-all duration-200 text-sm sm:text-base"
                  onKeyPress={(e) => e.key === "Enter" && handleAddRegion()}
                />
                <button
                  onClick={handleAddRegion}
                  disabled={!newRegion.trim()}
                  className="w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-lg hover:from-teal-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                  Add Region
                </button>
              </div>

              {/* Existing Regions */}
              {regions.length > 0 && (
                <div className="space-y-1 sm:space-y-2">
                  {regions.map((region, index) => (
                    <div
                      key={index}
                      onClick={() => selectRegion(index)}
                      className={`p-2 sm:p-3 rounded-md sm:rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                        selectedRegionIndex === index
                          ? "border-teal-500 bg-teal-50 dark:bg-teal-900/20"
                          : "border-gray-200 dark:border-gray-600 hover:border-teal-300 dark:hover:border-teal-600"
                      }`}
                    >
                      <div className="flex items-center gap-1 sm:gap-2">
                        <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-teal-500 flex-shrink-0" />
                        <input
                          type="text"
                          value={region.name}
                          onChange={(e) => updateRegionName(e, index)}
                          className="flex-1 bg-transparent border-b border-transparent focus:border-teal-300 focus:outline-none px-1 font-medium text-gray-800 dark:text-white text-sm sm:text-base min-w-0"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <button
                          onClick={(e) => deleteRegion(index, e)}
                          className="ml-auto p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded flex-shrink-0"
                        >
                          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Categories for selected region */}
              {selectedRegionIndex !== null && (
                <div className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
                  {/* Exam Types */}
                  <div className="ml-2 sm:ml-4 md:ml-6 border-l-2 border-teal-300 pl-2 sm:pl-4 md:pl-6 space-y-2 sm:space-y-4">
                    <div className="flex flex-wrap items-center gap-1 sm:gap-2 md:gap-3 mb-2 sm:mb-4">
                      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
                      <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800 dark:text-white">
                        Exam Types
                      </h3>
                      <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 break-all">
                        in {regions[selectedRegionIndex].name}
                      </span>
                    </div>

                    <div className="flex flex-col gap-2 sm:gap-3">
                      <input
                        type="text"
                        value={newExamType}
                        onChange={(e) => setNewExamType(e.target.value)}
                        placeholder="Enter Exam Type name..."
                        className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-200 text-sm sm:text-base"
                        onKeyPress={(e) => e.key === "Enter" && handleAddExamType()}
                      />
                      <button
                        onClick={handleAddExamType}
                        disabled={!newExamType.trim()}
                        className="w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base"
                      >
                        <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                        Add Exam Type
                      </button>
                    </div>

                    {/* Existing Exam Types */}
                    {regions[selectedRegionIndex].examTypes.length > 0 && (
                      <div className="space-y-1 sm:space-y-2">
                        {regions[selectedRegionIndex].examTypes.map((examType, index) => (
                          <div
                            key={index}
                            onClick={() => selectExamType(index)}
                            className={`p-2 sm:p-3 rounded-md sm:rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                              selectedExamTypeIndex === index
                                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                : "border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-600"
                            }`}
                          >
                            <div className="flex items-center gap-1 sm:gap-2">
                              <Tag className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 flex-shrink-0" />
                              <input
                                type="text"
                                value={examType.name}
                                onChange={(e) => updateCategoryName("examType", index, e)}
                                className="flex-1 bg-transparent border-b border-transparent focus:border-blue-300 focus:outline-none px-1 font-medium text-gray-800 dark:text-white text-sm sm:text-base min-w-0"
                                onClick={(e) => e.stopPropagation()}
                              />
                              <button
                                onClick={(e) => deleteCategory("examType", index, e)}
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

                  {/* Specific Classes */}
                  {selectedExamTypeIndex !== null && (
                    <div className="ml-4 sm:ml-6 md:ml-8 border-l-2 border-blue-300 pl-2 sm:pl-4 md:pl-6 space-y-2 sm:space-y-4">
                      <div className="flex flex-wrap items-center gap-1 sm:gap-2 md:gap-3 mb-2 sm:mb-4">
                        <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
                        <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800 dark:text-white">
                          Specific Classes
                        </h3>
                        <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 break-all">
                          in {selectedRegion.examTypes[selectedExamTypeIndex]?.name}
                        </span>
                      </div>

                      <div className="flex flex-col gap-2 sm:gap-3">
                        <input
                          type="text"
                          value={newSpecificClass}
                          onChange={(e) => setNewSpecificClass(e.target.value)}
                          placeholder="Enter Specific Class name..."
                          className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-200 text-sm sm:text-base"
                          onKeyPress={(e) => e.key === "Enter" && handleAddSpecificClass()}
                        />
                        <button
                          onClick={handleAddSpecificClass}
                          disabled={!newSpecificClass.trim()}
                          className="w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base"
                        >
                          <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                          Add Specific Class
                        </button>
                      </div>

                      {/* Existing Specific Classes */}
                      {selectedRegion.examTypes[selectedExamTypeIndex]?.specificClasses.length > 0 && (
                        <div className="space-y-1 sm:space-y-2">
                          {selectedRegion.examTypes[selectedExamTypeIndex]?.specificClasses.map(
                            (specificClass, index) => (
                              <div
                                key={index}
                                onClick={() => selectSpecificClass(index)}
                                className={`p-2 sm:p-3 rounded-md sm:rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                                  selectedSpecificClassIndex === index
                                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                                    : "border-gray-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-600"
                                }`}
                              >
                                <div className="flex items-center gap-1 sm:gap-2">
                                  <Tag className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-500 flex-shrink-0" />
                                  <input
                                    type="text"
                                    value={specificClass.name}
                                    onChange={(e) => updateCategoryName("specificClass", index, e)}
                                    className="flex-1 bg-transparent border-b border-transparent focus:border-indigo-300 focus:outline-none px-1 font-medium text-gray-800 dark:text-white text-sm sm:text-base min-w-0"
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                  <button
                                    onClick={(e) => deleteCategory("specificClass", index, e)}
                                    className="ml-auto p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded flex-shrink-0"
                                  >
                                    <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                                  </button>
                                </div>
                              </div>
                            ),
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Subjects */}
                  {selectedSpecificClassIndex !== null && (
                    <div className="ml-6 sm:ml-8 md:ml-10 border-l-2 border-indigo-300 pl-2 sm:pl-4 md:pl-6 space-y-2 sm:space-y-4">
                      <div className="flex flex-wrap items-center gap-1 sm:gap-2 md:gap-3 mb-2 sm:mb-4">
                        <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                        <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800 dark:text-white">
                          Subjects
                        </h3>
                        <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 break-all">
                          in {selectedExamType.specificClasses[selectedSpecificClassIndex].name}
                        </span>
                      </div>

                      <div className="flex flex-col gap-2 sm:gap-3">
                        <input
                          type="text"
                          value={newSubject}
                          onChange={(e) => setNewSubject(e.target.value)}
                          placeholder="Enter Subject name..."
                          className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 transition-all duration-200 text-sm sm:text-base"
                          onKeyPress={(e) => e.key === "Enter" && handleAddSubject()}
                        />
                        <button
                          onClick={handleAddSubject}
                          disabled={!newSubject.trim()}
                          className="w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base"
                        >
                          <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                          Add Subject
                        </button>
                      </div>

                      {/* Existing Subjects */}
                      {selectedExamType.specificClasses[selectedSpecificClassIndex].subjects.length > 0 && (
                        <div className="space-y-1 sm:space-y-2">
                          {selectedExamType.specificClasses[selectedSpecificClassIndex].subjects.map(
                            (subject, index) => (
                              <div
                                key={index}
                                onClick={() => selectSubject(index)}
                                className={`p-2 sm:p-3 rounded-md sm:rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                                  selectedSubjectIndex === index
                                    ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                                    : "border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-600"
                                }`}
                              >
                                <div className="flex items-center gap-1 sm:gap-2">
                                  <Tag className="w-3 h-3 sm:w-4 sm:h-4 text-purple-500 flex-shrink-0" />
                                  <input
                                    type="text"
                                    value={subject.name}
                                    onChange={(e) => updateCategoryName("subject", index, e)}
                                    className="flex-1 bg-transparent border-b border-transparent focus:border-purple-300 focus:outline-none px-1 font-medium text-gray-800 dark:text-white text-sm sm:text-base min-w-0"
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                  <button
                                    onClick={(e) => deleteCategory("subject", index, e)}
                                    className="ml-auto p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded flex-shrink-0"
                                  >
                                    <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                                  </button>
                                </div>
                              </div>
                            ),
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Chapters */}
                  {selectedSubjectIndex !== null && (
                    <div className="ml-8 sm:ml-10 md:ml-12 border-l-2 border-purple-300 pl-2 sm:pl-4 md:pl-6 space-y-2 sm:space-y-4">
                      <div className="flex flex-wrap items-center gap-1 sm:gap-2 md:gap-3 mb-2 sm:mb-4">
                        <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gradient-to-r from-pink-500 to-red-500 rounded-full"></div>
                        <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800 dark:text-white">
                          Chapters
                        </h3>
                        <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 break-all">
                          in {selectedSpecificClass.subjects[selectedSubjectIndex]?.name}
                        </span>
                      </div>

                      <div className="flex flex-col gap-2 sm:gap-3">
                        <input
                          type="text"
                          value={newChapter}
                          onChange={(e) => setNewChapter(e.target.value)}
                          placeholder="Enter Chapter name..."
                          className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 dark:focus:ring-pink-400 transition-all duration-200 text-sm sm:text-base"
                          onKeyPress={(e) => e.key === "Enter" && handleAddChapter()}
                        />
                        <button
                          onClick={handleAddChapter}
                          disabled={!newChapter.trim()}
                          className="w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-lg hover:from-pink-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base"
                        >
                          <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                          Add Chapter
                        </button>
                      </div>

                      {/* Existing Chapters */}
                      {selectedSpecificClass.subjects[selectedSubjectIndex]?.chapters.length > 0 && (
                        <div className="space-y-1 sm:space-y-2">
                          {selectedSpecificClass.subjects[selectedSubjectIndex]?.chapters.map((chapter, index) => (
                            <div
                              key={index}
                              className="p-2 sm:p-3 rounded-md sm:rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-pink-50 dark:bg-pink-900/20"
                            >
                              <div className="flex items-center gap-1 sm:gap-2">
                                <Tag className="w-3 h-3 sm:w-4 sm:h-4 text-pink-500 flex-shrink-0" />
                                <input
                                  type="text"
                                  value={chapter.name}
                                  onChange={(e) => updateCategoryName("chapter", index, e)}
                                  className="flex-1 bg-transparent border-b border-transparent focus:border-pink-300 focus:outline-none px-1 font-medium text-gray-800 dark:text-white text-sm sm:text-base min-w-0"
                                />
                                <button
                                  onClick={(e) => deleteCategory("chapter", index, e)}
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
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Summary Card */}
        {regions.length > 0 && (
          <div className="mt-4 sm:mt-6 bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-md sm:shadow-lg border border-gray-100 dark:border-gray-700 p-3 sm:p-4 md:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-gradient-to-r from-teal-500 to-indigo-500 rounded-full"></div>
              Structure Summary
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4">
              <div className="text-center p-2 sm:p-4 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
                <div className="text-lg sm:text-2xl font-bold text-teal-600 dark:text-teal-400">{regions.length}</div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Regions</div>
              </div>
              <div className="text-center p-2 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-lg sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {regions.reduce((sum, region) => sum + region.examTypes.length, 0)}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Exam Types</div>
              </div>
              <div className="text-center p-2 sm:p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                <div className="text-lg sm:text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                  {regions.reduce(
                    (sum, region) =>
                      sum + region.examTypes.reduce((s, examType) => s + examType.specificClasses.length, 0),
                    0,
                  )}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Specific Classes</div>
              </div>
              <div className="text-center p-2 sm:p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-lg sm:text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {regions.reduce(
                    (sum, region) =>
                      sum +
                      region.examTypes.reduce(
                        (s, examType) =>
                          s +
                          examType.specificClasses.reduce((s2, specificClass) => s2 + specificClass.subjects.length, 0),
                        0,
                      ),
                    0,
                  )}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Subjects</div>
              </div>
              <div className="text-center p-2 sm:p-4 bg-pink-50 dark:bg-pink-900/20 rounded-lg col-span-2 sm:col-span-3 lg:col-span-1">
                <div className="text-lg sm:text-2xl font-bold text-pink-600 dark:text-pink-400">
                  {regions.reduce(
                    (sum, region) =>
                      sum +
                      region.examTypes.reduce(
                        (s, examType) =>
                          s +
                          examType.specificClasses.reduce(
                            (s2, specificClass) =>
                              s2 + specificClass.subjects.reduce((s3, subject) => s3 + subject.chapters.length, 0),
                            0,
                          ),
                        0,
                      ),
                    0,
                  )}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Chapters</div>
              </div>
            </div>
            {/* Submit Button */}
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
                    Submitting...
                  </>
                ) : (
                  "Submit Structure"
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default QuizRegion
