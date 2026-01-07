"use client"

import { useState, useEffect } from "react"
import { Plus, ChevronRight, MapPin, Tag, Grid3X3, Trash2, Save, Edit } from "lucide-react"
import {getAllQandARegions,updateQandARegion,deleteQandARegion} from "../../../../services/operations/qandA"
import { toast } from "react-hot-toast"
import { useParams } from "react-router-dom"

const EditQandARegion = () => {
  const { name } = useParams()
  const [regions, setRegions] = useState([])
  const [selectedRegion, setSelectedRegion] = useState(null)
  const [selectedRegionIndex, setSelectedRegionIndex] = useState(null)
  const [selectedExamType, setSelectedExamType] = useState(null)
  const [selectedExamTypeIndex, setSelectedExamTypeIndex] = useState(null)
  const [selectedSpecificClass, setSelectedSpecificClass] = useState(null)
  const [selectedSpecificClassIndex, setSelectedSpecificClassIndex] = useState(null)
  const [selectedSubject, setSelectedSubject] = useState(null)
  const [selectedSubjectIndex, setSelectedSubjectIndex] = useState(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // New state for region rename (single input)
  const [newRegionName, setNewRegionName] = useState("")

  // New category input states
  const [newCategoryInputs, setNewCategoryInputs] = useState({
    examType: false,
    specificClass: false,
    subject: false,
  })

  const [newCategoryValues, setNewCategoryValues] = useState({
    examType: "",
    specificClass: "",
    subject: "",
  })

  useEffect(() => {
    const loadAllRegions = async () => {
      try {
        const response = await getAllQandARegions()
        setRegions(response?.data || [])
      } catch (error) {
        console.error("Error loading regions:", error)
        toast.error("Failed to load regions")
      } finally {
        setIsLoading(false)
      }
    }
    loadAllRegions()
  }, [])

  // Reset new region name when selected region changes
  useEffect(() => {
    if (selectedRegion) {
      setNewRegionName("")
    }
  }, [selectedRegion])

  // Update the Q & A region by the name
  const handleUpdateRegion = async () => {
    if (!selectedRegion || !selectedRegion.name) {
      toast.error("Please select a region to update")
      return
    }
    setIsUpdating(true)
    try {
      const regionName = selectedRegion.name
      const updatedData = {
        ...selectedRegion,
        ...(newRegionName.trim() && { name: newRegionName.trim() }),
      }

      const response = await updateQandARegion(regionName, {
        updatedData: updatedData,
      })

      if (response.message) {
        toast.success(response.message)
        const updatedResponse = await getAllQandARegions()
        setRegions(updatedResponse?.data || [])
        setNewRegionName("")
      } else {
        throw new Error("Unexpected response from server")
      }
    } catch (error) {
      console.error("Update error:", error)
      toast.error(error.response?.data?.error || "Failed to update region")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteRegion = async () => {
    if (!selectedRegion) {
      toast.error("Please select a region to delete")
      return
    }
    setIsDeleting(true)
    try {
      const response = await deleteQandARegion(selectedRegion.name)
      if (response.message) {
        toast.success(response.message)
        const updatedResponse = await getAllQandARegions()
        setRegions(updatedResponse?.data || [])
        setSelectedRegion(null)
        setSelectedRegionIndex(null)
        setSelectedExamType(null)
        setSelectedExamTypeIndex(null)
        setSelectedSpecificClass(null)
        setSelectedSpecificClassIndex(null)
        setSelectedSubject(null)
        setSelectedSubjectIndex(null)
        setNewRegionName("")
      } else {
        throw new Error("Unexpected response from server")
      }
    } catch (error) {
      console.error("Delete error:", error)
      toast.error(error.response?.data?.error || "Failed to delete region")
    } finally {
      setIsDeleting(false)
    }
  }

  // Selection handlers
  const selectRegion = (index) => {
    const region = regions[index]
    setSelectedRegion(JSON.parse(JSON.stringify(region)))
    setSelectedRegionIndex(index)
    setSelectedExamType(null)
    setSelectedExamTypeIndex(null)
    setSelectedSpecificClass(null)
    setSelectedSpecificClassIndex(null)
    setSelectedSubject(null)
    setSelectedSubjectIndex(null)
    // Reset inputs
    setNewCategoryInputs({
      examType: false,
      specificClass: false,
      subject: false,
    })
    setNewCategoryValues({
      examType: "",
      specificClass: "",
      subject: "",
    })
  }

  const selectExamType = (index) => {
    const examType = selectedRegion.examTypes[index]
    setSelectedExamType(examType)
    setSelectedExamTypeIndex(index)
    setSelectedSpecificClass(null)
    setSelectedSpecificClassIndex(null)
    setSelectedSubject(null)
    setSelectedSubjectIndex(null)
  }

  const selectSpecificClass = (index) => {
    const specificClass = selectedExamType.specificClasses[index]
    setSelectedSpecificClass(specificClass)
    setSelectedSpecificClassIndex(index)
    setSelectedSubject(null)
    setSelectedSubjectIndex(null)
  }

  const selectSubject = (index) => {
    const subject = selectedSpecificClass.subjects[index]
    setSelectedSubject(subject)
    setSelectedSubjectIndex(index)
  }

  // Toggle input handlers
  const toggleNewCategoryInput = (category) => {
    setNewCategoryInputs((prev) => ({
      ...prev,
      [category]: !prev[category],
    }))
  }

  const handleNewCategoryChange = (category, e) => {
    setNewCategoryValues((prev) => ({
      ...prev,
      [category]: e.target.value,
    }))
  }

  // Update handlers
  const updateCategoryName = (categoryType, index, e) => {
    const newName = e.target.value

    if (categoryType === "examType") {
      setSelectedRegion((prev) => {
        const updatedExamTypes = [...prev.examTypes]
        updatedExamTypes[index] = {
          ...updatedExamTypes[index],
          name: newName,
        }
        return {
          ...prev,
          examTypes: updatedExamTypes,
        }
      })
    } else if (categoryType === "specificClass") {
      setSelectedRegion((prev) => {
        const updatedExamTypes = [...prev.examTypes]
        updatedExamTypes[selectedExamTypeIndex] = {
          ...updatedExamTypes[selectedExamTypeIndex],
          specificClasses: updatedExamTypes[selectedExamTypeIndex].specificClasses.map((sc, i) =>
            i === index ? { ...sc, name: newName } : sc,
          ),
        }
        return {
          ...prev,
          examTypes: updatedExamTypes,
        }
      })
    } else if (categoryType === "subject") {
      setSelectedRegion((prev) => {
        const updatedExamTypes = [...prev.examTypes]
        updatedExamTypes[selectedExamTypeIndex] = {
          ...updatedExamTypes[selectedExamTypeIndex],
          specificClasses: updatedExamTypes[selectedExamTypeIndex].specificClasses.map((sc, i) => {
            if (i === selectedSpecificClassIndex) {
              return {
                ...sc,
                subjects: sc.subjects.map((subj, j) => (j === index ? { ...subj, name: newName } : subj)),
              }
            }
            return sc
          }),
        }
        return {
          ...prev,
          examTypes: updatedExamTypes,
        }
      })
    }
  }

  // Add new category handlers
  const addNewCategory = (categoryType) => {
    const value = newCategoryValues[categoryType].trim()
    if (!value) {
      toast.error(`Please enter ${categoryType} name`)
      return
    }

    if (categoryType === "examType") {
      setSelectedRegion((prev) => ({
        ...prev,
        examTypes: [
          ...(prev.examTypes || []),
          {
            name: value,
            specificClasses: [],
          },
        ],
      }))
    } else if (categoryType === "specificClass") {
      setSelectedRegion((prev) => {
        const updatedExamTypes = [...prev.examTypes]
        updatedExamTypes[selectedExamTypeIndex] = {
          ...updatedExamTypes[selectedExamTypeIndex],
          specificClasses: [
            ...(updatedExamTypes[selectedExamTypeIndex].specificClasses || []),
            {
              name: value,
              subjects: [],
            },
          ],
        }
        return {
          ...prev,
          examTypes: updatedExamTypes,
        }
      })
    } else if (categoryType === "subject") {
      setSelectedRegion((prev) => {
        const updatedExamTypes = [...prev.examTypes]
        updatedExamTypes[selectedExamTypeIndex] = {
          ...updatedExamTypes[selectedExamTypeIndex],
          specificClasses: updatedExamTypes[selectedExamTypeIndex].specificClasses.map((sc, i) => {
            if (i === selectedSpecificClassIndex) {
              return {
                ...sc,
                subjects: [
                  ...(sc.subjects || []),
                  {
                    name: value,
                  },
                ],
              }
            }
            return sc
          }),
        }
        return {
          ...prev,
          examTypes: updatedExamTypes,
        }
      })
    }

    // Reset input
    setNewCategoryValues((prev) => ({
      ...prev,
      [categoryType]: "",
    }))
    setNewCategoryInputs((prev) => ({
      ...prev,
      [categoryType]: false,
    }))
  }

  // Delete handlers
  const deleteCategory = (categoryType, index, e) => {
    e.stopPropagation()

    if (categoryType === "examType") {
      setSelectedRegion((prev) => {
        const updatedExamTypes = [...prev.examTypes]
        updatedExamTypes.splice(index, 1)
        return {
          ...prev,
          examTypes: updatedExamTypes,
        }
      })
      if (selectedExamTypeIndex === index) {
        setSelectedExamType(null)
        setSelectedExamTypeIndex(null)
      }
    } else if (categoryType === "specificClass") {
      setSelectedRegion((prev) => {
        const updatedExamTypes = [...prev.examTypes]
        updatedExamTypes[selectedExamTypeIndex] = {
          ...updatedExamTypes[selectedExamTypeIndex],
          specificClasses: updatedExamTypes[selectedExamTypeIndex].specificClasses.filter((_, i) => i !== index),
        }
        return {
          ...prev,
          examTypes: updatedExamTypes,
        }
      })
      if (selectedSpecificClassIndex === index) {
        setSelectedSpecificClass(null)
        setSelectedSpecificClassIndex(null)
      }
    } else if (categoryType === "subject") {
      setSelectedRegion((prev) => {
        const updatedExamTypes = [...prev.examTypes]
        updatedExamTypes[selectedExamTypeIndex] = {
          ...updatedExamTypes[selectedExamTypeIndex],
          specificClasses: updatedExamTypes[selectedExamTypeIndex].specificClasses.map((sc, i) => {
            if (i === selectedSpecificClassIndex) {
              return {
                ...sc,
                subjects: sc.subjects.filter((_, j) => j !== index),
              }
            }
            return sc
          }),
        }
        return {
          ...prev,
          examTypes: updatedExamTypes,
        }
      })
      if (selectedSubjectIndex === index) {
        setSelectedSubject(null)
        setSelectedSubjectIndex(null)
      }
    }
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
        {/* Header */}
        <div className="text-center mb-4 sm:mb-6 md:mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-teal-500 via-blue-500 to-indigo-500 rounded-full mb-2 sm:mb-4">
            <Edit className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-teal-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-1 sm:mb-2">
            Edit Q & A Regions
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
            Modify existing Q & A regions and their categories
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-teal-500 via-blue-500 to-indigo-500 p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-white flex items-center gap-2">
              <Grid3X3 className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base md:text-lg">Edit Hierarchical Structure</span>
            </h2>
            <p className="text-teal-100 text-xs sm:text-sm mt-1">Update your organizational tree</p>
          </div>

          <div className="p-3 sm:p-4 md:p-6">
            {/* Level 1: Region */}
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-4">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full"></div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white">Region</h3>
              </div>

              {/* Existing Regions */}
              {regions.length > 0 ? (
                <div className="space-y-1 sm:space-y-2">
                  {regions.map((region, index) => (
                    <div
                      key={region._id || index}
                      onClick={() => selectRegion(index)}
                      className={`p-2 sm:p-3 rounded-md sm:rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                        selectedRegionIndex === index
                          ? "border-teal-500 bg-teal-50 dark:bg-teal-900/20"
                          : "border-gray-200 dark:border-gray-600 hover:border-teal-300 dark:hover:border-teal-600"
                      }`}
                    >
                      <div className="flex items-center gap-1 sm:gap-2">
                        <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-teal-500" />
                        <span className="text-sm sm:text-base font-medium text-gray-800 dark:text-white">
                          {region.name}
                        </span>
                        <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 ml-auto" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-2 sm:py-3 text-sm text-gray-500">No regions found.</div>
              )}

              {/* Single New Region Name input matching Region tile visual */}
              {selectedRegion && (
                <div className="mt-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Update Region Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={newRegionName}
                    onChange={(e) => setNewRegionName(e.target.value)}
                    placeholder={`Rename "${selectedRegion.name}"...`}
                    className="w-full p-2 sm:p-3 rounded-md sm:rounded-lg border-2 border-teal-200 dark:border-gray-600 bg-teal-50 dark:bg-gray-800 text-gray-800 dark:text-white
                      focus:outline-none focus:border-teal-500 transition-all duration-200 text-sm sm:text-base"
                  />
                  {newRegionName?.trim()?.length > 0 && (
                    <p className="text-xs text-teal-600 dark:text-teal-400 mt-2">
                      Will rename from "{selectedRegion.name}" to "{newRegionName}"
                    </p>
                  )}
                </div>
              )}

              {/* Exam Types for selected region */}
              {selectedRegion && (
                <div className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
                  {/* Exam Types */}
                  <div className="ml-2 sm:ml-4 md:ml-6 border-l-2 border-teal-300 pl-2 sm:pl-4 md:pl-6 space-y-2 sm:space-y-4">
                    <div className="flex flex-wrap items-center gap-1 sm:gap-2 md:gap-3 mb-2 sm:mb-4">
                      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
                      <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800 dark:text-white">
                        Exam Types
                      </h3>
                      <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        in {selectedRegion.name}
                      </span>
                      <button
                        onClick={() => toggleNewCategoryInput("examType")}
                        className="ml-auto px-2 sm:px-3 py-1 sm:py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded-md sm:rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-all duration-200 flex items-center justify-center gap-1 text-xs sm:text-sm"
                      >
                        <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">Add</span>
                      </button>
                    </div>

                    {newCategoryInputs.examType && (
                      <div className="flex flex-col sm:flex-row gap-3">
                        <input
                          type="text"
                          value={newCategoryValues.examType}
                          onChange={(e) => handleNewCategoryChange("examType", e)}
                          placeholder="Enter new exam type name"
                          className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-200 text-sm sm:text-base"
                          onKeyPress={(e) => e.key === "Enter" && addNewCategory("examType")}
                        />
                        <button
                          onClick={() => addNewCategory("examType")}
                          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Add
                        </button>
                      </div>
                    )}

                    {selectedRegion.examTypes?.length > 0 ? (
                      <div className="space-y-1 sm:space-y-2">
                        {selectedRegion.examTypes.map((examType, index) => (
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
                              <Tag className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
                              <input
                                type="text"
                                value={examType.name}
                                onChange={(e) => updateCategoryName("examType", index, e)}
                                className="flex-1 text-sm sm:text-base font-medium text-gray-800 dark:text-white bg-transparent border-b border-transparent focus:border-blue-300 focus:outline-none px-1"
                                onClick={(e) => e.stopPropagation()}
                              />
                              <button
                                onClick={(e) => deleteCategory("examType", index, e)}
                                className="ml-auto p-0.5 sm:p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                              >
                                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-2 sm:py-3 text-xs sm:text-sm text-gray-500">
                        No Exam Types found.
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
                        <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                          in {selectedExamType.name}
                        </span>
                        <button
                          onClick={() => toggleNewCategoryInput("specificClass")}
                          className="ml-auto px-2 sm:px-3 py-1 sm:py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 rounded-md sm:rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900/40 transition-all duration-200 flex items-center justify-center gap-1 text-xs sm:text-sm"
                        >
                          <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="hidden sm:inline">Add</span>
                        </button>
                      </div>

                      {newCategoryInputs.specificClass && (
                        <div className="flex flex-col sm:flex-row gap-3">
                          <input
                            type="text"
                            value={newCategoryValues.specificClass}
                            onChange={(e) => handleNewCategoryChange("specificClass", e)}
                            placeholder="Enter new specific class name"
                            className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-200 text-sm sm:text-base"
                            onKeyPress={(e) => e.key === "Enter" && addNewCategory("specificClass")}
                          />
                          <button
                            onClick={() => addNewCategory("specificClass")}
                            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                          >
                            <Plus className="w-4 h-4" />
                            Add
                          </button>
                        </div>
                      )}

                      {selectedExamType.specificClasses?.length > 0 ? (
                        <div className="space-y-1 sm:space-y-2">
                          {selectedExamType.specificClasses.map((specificClass, index) => (
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
                                <Tag className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-500" />
                                <input
                                  type="text"
                                  value={specificClass.name}
                                  onChange={(e) => updateCategoryName("specificClass", index, e)}
                                  className="flex-1 text-sm sm:text-base font-medium text-gray-800 dark:text-white bg-transparent border-b border-transparent focus:border-indigo-300 focus:outline-none px-1"
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <button
                                  onClick={(e) => deleteCategory("specificClass", index, e)}
                                  className="ml-auto p-0.5 sm:p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                >
                                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-2 sm:py-3 text-xs sm:text-sm text-gray-500">
                          No Specific Classes found.
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
                        <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                          in {selectedSpecificClass.name}
                        </span>
                        <button
                          onClick={() => toggleNewCategoryInput("subject")}
                          className="ml-auto px-2 sm:px-3 py-1 sm:py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 rounded-md sm:rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/40 transition-all duration-200 flex items-center justify-center gap-1 text-xs sm:text-sm"
                        >
                          <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="hidden sm:inline">Add</span>
                        </button>
                      </div>

                      {newCategoryInputs.subject && (
                        <div className="flex flex-col sm:flex-row gap-3">
                          <input
                            type="text"
                            value={newCategoryValues.subject}
                            onChange={(e) => handleNewCategoryChange("subject", e)}
                            placeholder="Enter new subject name"
                            className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-200 text-sm sm:text-base"
                            onKeyPress={(e) => e.key === "Enter" && addNewCategory("subject")}
                          />
                          <button
                            onClick={() => addNewCategory("subject")}
                            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                          >
                            <Plus className="w-4 h-4" />
                            Add
                          </button>
                        </div>
                      )}

                      {selectedSpecificClass.subjects?.length > 0 ? (
                        <div className="space-y-1 sm:space-y-2">
                          {selectedSpecificClass.subjects.map((subject, index) => (
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
                                <Tag className="w-3 h-3 sm:w-4 sm:h-4 text-purple-500" />
                                <input
                                  type="text"
                                  value={subject.name}
                                  onChange={(e) => updateCategoryName("subject", index, e)}
                                  className="flex-1 text-sm sm:text-base font-medium text-gray-800 dark:text-white bg-transparent border-b border-transparent focus:border-purple-300 focus:outline-none px-1"
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <button
                                  onClick={(e) => deleteCategory("subject", index, e)}
                                  className="ml-auto p-0.5 sm:p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                >
                                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-2 sm:py-3 text-xs sm:text-sm text-gray-500">
                          No Subjects found.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {selectedRegion && (
          <div className="mt-4 sm:mt-6 bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-md sm:shadow-lg border border-gray-100 dark:border-gray-700 p-3 sm:p-4 md:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex-1">
                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800 dark:text-white mb-1">
                  Editing: {selectedRegion.name}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  {selectedRegion.examTypes?.length || 0} Exam Types,{" "}
                  {selectedRegion.examTypes?.reduce((sum, et) => sum + (et.specificClasses?.length || 0), 0) || 0}{" "}
                  Specific Classes,{" "}
                  {selectedRegion.examTypes?.reduce(
                    (sum, et) => sum + (et.specificClasses?.reduce((s, sc) => s + (sc.subjects?.length || 0), 0) || 0),
                    0,
                  ) || 0}{" "}
                  Subjects
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <button
                  onClick={handleDeleteRegion}
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
                  onClick={handleUpdateRegion}
                  disabled={isUpdating}
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

export default EditQandARegion