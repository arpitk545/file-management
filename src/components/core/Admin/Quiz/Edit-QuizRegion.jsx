"use client"

import { useState, useEffect } from "react"
import { Plus, ChevronRight, MapPin, Tag, Grid3X3, Trash2, Save, Edit, ArrowLeft } from "lucide-react"
import { getAllQuizRegions, updateQuizRegion, deleteQuizRegion } from "../../../../services/operations/quizAPI"
import { toast } from "react-hot-toast"
import { useParams, useNavigate } from "react-router-dom"

const EditQuizRegion = () => {
  const navigate = useNavigate()
  const { name } = useParams()
  const [regions, setRegions] = useState([])
  const [selectedRegion, setSelectedRegion] = useState(null)
  const [selectedRegionIndex, setSelectedRegionIndex] = useState(null)
  const [selectedExamTypeIndex, setSelectedExamTypeIndex] = useState(null)
  const [selectedSpecificClassIndex, setSelectedSpecificClassIndex] = useState(null)
  const [selectedSubjectIndex, setSelectedSubjectIndex] = useState(null)

  const selectedExamType = selectedExamTypeIndex !== null ? selectedRegion?.examTypes?.[selectedExamTypeIndex] : null;
  const selectedSpecificClass = selectedSpecificClassIndex !== null ? selectedExamType?.specificClasses?.[selectedSpecificClassIndex] : null;
  const selectedSubject = selectedSubjectIndex !== null ? selectedSpecificClass?.subjects?.[selectedSubjectIndex] : null;
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
    chapter: false,
  })

  const [newCategoryValues, setNewCategoryValues] = useState({
    examType: "",
    specificClass: "",
    subject: "",
    chapter: "",
  })

  useEffect(() => {
    const loadAllRegions = async () => {
      try {
        const response = await getAllQuizRegions()
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

  // Update the Quiz region by the name
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

      const response = await updateQuizRegion(regionName, {
        updatedData: updatedData,
      })

      if (response.message) {
        toast.success(response.message)
        const updatedResponse = await getAllQuizRegions()
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
      const response = await deleteQuizRegion(selectedRegion.name)
      if (response.message) {
        toast.success(response.message)
        const updatedResponse = await getAllQuizRegions()
        setRegions(updatedResponse?.data || [])
        setSelectedRegion(null)
        setSelectedRegionIndex(null)
        setSelectedExamTypeIndex(null)
        setSelectedSpecificClassIndex(null)
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
    setSelectedExamTypeIndex(null)
    setSelectedSpecificClassIndex(null)
    setSelectedSubjectIndex(null)
    // Reset inputs
    setNewCategoryInputs({
      examType: false,
      specificClass: false,
      subject: false,
      chapter: false,
    })
    setNewCategoryValues({
      examType: "",
      specificClass: "",
      subject: "",
      chapter: "",
    })
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
    } else if (categoryType === "chapter") {
      setSelectedRegion((prev) => {
        const updatedExamTypes = [...prev.examTypes]
        updatedExamTypes[selectedExamTypeIndex] = {
          ...updatedExamTypes[selectedExamTypeIndex],
          specificClasses: updatedExamTypes[selectedExamTypeIndex].specificClasses.map((sc, i) => {
            if (i === selectedSpecificClassIndex) {
              return {
                ...sc,
                subjects: sc.subjects.map((subj, j) => {
                  if (j === selectedSubjectIndex) {
                    return {
                      ...subj,
                      chapters: subj.chapters.map((chap, k) => (k === index ? { ...chap, name: newName } : chap)),
                    }
                  }
                  return subj
                }),
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
                    chapters: [],
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
    } else if (categoryType === "chapter") {
      setSelectedRegion((prev) => {
        const updatedExamTypes = [...prev.examTypes]
        updatedExamTypes[selectedExamTypeIndex] = {
          ...updatedExamTypes[selectedExamTypeIndex],
          specificClasses: updatedExamTypes[selectedExamTypeIndex].specificClasses.map((sc, i) => {
            if (i === selectedSpecificClassIndex) {
              return {
                ...sc,
                subjects: sc.subjects.map((subj, j) => {
                  if (j === selectedSubjectIndex) {
                    return {
                      ...subj,
                      chapters: [
                        ...(subj.chapters || []),
                        {
                          name: value,
                        },
                      ],
                    }
                  }
                  return subj
                }),
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
        setSelectedSubjectIndex(null)
      }
    } else if (categoryType === "chapter") {
      setSelectedRegion((prev) => {
        const updatedExamTypes = [...prev.examTypes]
        updatedExamTypes[selectedExamTypeIndex] = {
          ...updatedExamTypes[selectedExamTypeIndex],
          specificClasses: updatedExamTypes[selectedExamTypeIndex].specificClasses.map((sc, i) => {
            if (i === selectedSpecificClassIndex) {
              return {
                ...sc,
                subjects: sc.subjects.map((subj, j) => {
                  if (j === selectedSubjectIndex) {
                    return {
                      ...subj,
                      chapters: subj.chapters.filter((_, k) => k !== index),
                    }
                  }
                  return subj
                }),
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f7f8fa] flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#ffd02f] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-[#1c1c1e]">Loading quiz regions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#1c1c1e] py-6 sm:py-8 px-4 sm:px-6 lg:px-8 xl:px-12 w-full">
      <div className="w-full space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#e0e2e8] pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#fff8e0] text-[#735400] mb-2">
              🛠️ Quiz Taxonomy Manager
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#1c1c1e] tracking-tight">
              Edit Quiz Regions & Categories
            </h1>
            <p className="text-sm sm:text-base text-[#65676e] mt-1">
              Select a curriculum region, update names, and organize nested classification tiers
            </p>
          </div>
          <button
            onClick={() => navigate("/dashboard")}
            className="self-start md:self-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm bg-white border border-[#c7cad5] text-[#1c1c1e] hover:bg-[#f0f1f5] transition-all shadow-sm active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
        </div>

        {/* Main Editor Card */}
        <div className="bg-white rounded-2xl border border-[#e0e2e8] shadow-sm overflow-hidden">
          <div className="bg-[#fbfbfd] border-b border-[#e0e2e8] p-4 sm:p-6">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-[#ffd02f]"></span>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-[#1c1c1e]">1. Select Region to Modify</h2>
                <p className="text-xs text-[#65676e]">Click a region to open its category taxonomy</p>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6 md:p-8 space-y-6">
            {/* Region Selection Grid */}
            <div>
              {regions.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {regions.map((region, index) => (
                    <div
                      key={region._id || index}
                      onClick={() => selectRegion(index)}
                      className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between gap-2 ${
                        selectedRegionIndex === index
                          ? "border-[#ffd02f] bg-[#fffdf0] shadow-sm"
                          : "border-[#e0e2e8] bg-[#fbfbfd] hover:border-[#ffd02f]/60"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 flex-1 min-w-0">
                        <MapPin className="w-4 h-4 text-[#ffd02f] shrink-0" />
                        <span className="text-sm font-bold text-[#1c1c1e] truncate">{region.name}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#65676e] shrink-0" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-sm text-[#65676e]">No quiz regions found.</div>
              )}
            </div>

            {/* Region Rename input */}
            {selectedRegion && (
              <div className="p-4 rounded-xl bg-[#fffdf0] border border-[#ffd02f]/40 space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#735400]">
                  Rename Selected Region
                </label>
                <input
                  type="text"
                  value={newRegionName}
                  onChange={(e) => setNewRegionName(e.target.value)}
                  placeholder={`Rename "${selectedRegion.name}"...`}
                  className="w-full h-11 px-3.5 rounded-xl border border-[#c7cad5] bg-white text-sm font-medium text-[#1c1c1e] focus:outline-none focus:border-2 focus:border-[#ffd02f] transition-all"
                />
                {newRegionName?.trim()?.length > 0 && (
                  <p className="text-xs text-[#735400] font-semibold">
                    Will rename from "{selectedRegion.name}" to "{newRegionName}"
                  </p>
                )}
              </div>
            )}

            {/* Nested Categories for selected region */}
            {selectedRegion && (
              <div className="pt-6 border-t border-[#e0e2e8] space-y-6">
                {/* Level 2: Exam Types */}
                <div className="pl-3 sm:pl-5 border-l-3 border-[#0fbcb0] space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-[#c3faf5] text-[#00635b] border border-[#9eece4]">
                        Level 2: Exam Types
                      </span>
                      <span className="text-xs text-[#65676e] font-semibold">in {selectedRegion.name}</span>
                    </div>
                    <button
                      onClick={() => toggleNewCategoryInput("examType")}
                      className="px-3 py-1.5 bg-[#c3faf5] hover:bg-[#aef5ee] text-[#00635b] rounded-lg font-bold text-xs transition flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Exam Type</span>
                    </button>
                  </div>

                  {newCategoryInputs.examType && (
                    <div className="flex flex-col sm:flex-row gap-2.5 p-3 rounded-xl bg-[#f0fdfa] border border-[#9eece4] w-full items-stretch">
                      <input
                        type="text"
                        value={newCategoryValues.examType}
                        onChange={(e) => handleNewCategoryChange("examType", e)}
                        placeholder="Enter new exam type name..."
                        className="w-full sm:flex-1 h-11 min-h-[44px] shrink-0 px-3.5 rounded-lg border border-[#c7cad5] bg-white text-sm font-medium focus:outline-none focus:border-[#0fbcb0] leading-normal"
                        onKeyPress={(e) => e.key === "Enter" && addNewCategory("examType")}
                      />
                      <button
                        onClick={() => addNewCategory("examType")}
                        className="w-full sm:w-auto h-11 min-h-[44px] shrink-0 px-4 bg-[#0fbcb0] hover:bg-[#0da69b] text-white rounded-lg font-bold text-sm transition flex items-center justify-center gap-1.5 active:scale-98"
                      >
                        <Plus className="w-4 h-4" />
                        Add
                      </button>
                    </div>
                  )}

                  {selectedRegion.examTypes?.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {selectedRegion.examTypes.map((examType, index) => (
                        <div
                          key={index}
                          onClick={() => selectExamType(index)}
                          className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between gap-2 ${
                            selectedExamTypeIndex === index
                              ? "border-[#0fbcb0] bg-[#f0fdfa] shadow-sm"
                              : "border-[#e0e2e8] bg-[#fbfbfd] hover:border-[#0fbcb0]/60"
                          }`}
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <Tag className="w-4 h-4 text-[#0fbcb0] shrink-0" />
                            <input
                              type="text"
                              value={examType.name}
                              onChange={(e) => updateCategoryName("examType", index, e)}
                              className="w-full bg-transparent border-b border-transparent focus:border-[#0fbcb0] focus:outline-none px-1 font-bold text-sm text-[#1c1c1e]"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                          <button
                            onClick={(e) => deleteCategory("examType", index, e)}
                            className="p-1 text-[#e53935] hover:bg-[#fbd4d4] rounded-lg transition-colors shrink-0"
                            title="Delete Exam Type"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-[#65676e] py-1">No Exam Types yet.</div>
                  )}
                </div>

                {/* Level 3: Specific Classes */}
                {selectedExamTypeIndex !== null && (
                  <div className="pl-3 sm:pl-5 border-l-3 border-[#4262ff] space-y-3 pt-4">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-[#d5f0fc] text-[#00517d] border border-[#a2def7]">
                          Level 3: Specific Classes
                        </span>
                        <span className="text-xs text-[#65676e] font-semibold">in {selectedExamType.name}</span>
                      </div>
                      <button
                        onClick={() => toggleNewCategoryInput("specificClass")}
                        className="px-3 py-1.5 bg-[#d5f0fc] hover:bg-[#bde8fa] text-[#00517d] rounded-lg font-bold text-xs transition flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Class</span>
                      </button>
                    </div>

                    {newCategoryInputs.specificClass && (
                      <div className="flex flex-col sm:flex-row gap-2.5 p-3 rounded-xl bg-[#eff6ff] border border-[#a2def7] w-full items-stretch">
                        <input
                          type="text"
                          value={newCategoryValues.specificClass}
                          onChange={(e) => handleNewCategoryChange("specificClass", e)}
                          placeholder="Enter new class name..."
                          className="w-full sm:flex-1 h-11 min-h-[44px] shrink-0 px-3.5 rounded-lg border border-[#c7cad5] bg-white text-sm font-medium focus:outline-none focus:border-[#4262ff] leading-normal"
                          onKeyPress={(e) => e.key === "Enter" && addNewCategory("specificClass")}
                        />
                        <button
                          onClick={() => addNewCategory("specificClass")}
                          className="w-full sm:w-auto h-11 min-h-[44px] shrink-0 px-4 bg-[#4262ff] hover:bg-[#3451e0] text-white rounded-lg font-bold text-sm transition flex items-center justify-center gap-1.5 active:scale-98"
                        >
                          <Plus className="w-4 h-4" />
                          Add
                        </button>
                      </div>
                    )}

                    {selectedExamType.specificClasses?.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                        {selectedExamType.specificClasses.map((specificClass, index) => (
                          <div
                            key={index}
                            onClick={() => selectSpecificClass(index)}
                            className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between gap-2 ${
                              selectedSpecificClassIndex === index
                                ? "border-[#4262ff] bg-[#eff6ff] shadow-sm"
                                : "border-[#e0e2e8] bg-[#fbfbfd] hover:border-[#4262ff]/60"
                            }`}
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <Tag className="w-4 h-4 text-[#4262ff] shrink-0" />
                              <input
                                type="text"
                                value={specificClass.name}
                                onChange={(e) => updateCategoryName("specificClass", index, e)}
                                className="w-full bg-transparent border-b border-transparent focus:border-[#4262ff] focus:outline-none px-1 font-bold text-sm text-[#1c1c1e]"
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                            <button
                              onClick={(e) => deleteCategory("specificClass", index, e)}
                              className="p-1 text-[#e53935] hover:bg-[#fbd4d4] rounded-lg transition-colors shrink-0"
                              title="Delete Specific Class"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-[#65676e] py-1">No Specific Classes yet.</div>
                    )}
                  </div>
                )}

                {/* Level 4: Subjects */}
                {selectedSpecificClassIndex !== null && (
                  <div className="pl-3 sm:pl-5 border-l-3 border-[#d1259e] space-y-3 pt-4">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-[#ffd8f4] text-[#850060] border border-[#f7a8e2]">
                          Level 4: Subjects
                        </span>
                        <span className="text-xs text-[#65676e] font-semibold">in {selectedSpecificClass.name}</span>
                      </div>
                      <button
                        onClick={() => toggleNewCategoryInput("subject")}
                        className="px-3 py-1.5 bg-[#ffd8f4] hover:bg-[#fcc8ee] text-[#850060] rounded-lg font-bold text-xs transition flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Subject</span>
                      </button>
                    </div>

                    {newCategoryInputs.subject && (
                      <div className="flex flex-col sm:flex-row gap-2.5 p-3 rounded-xl bg-[#fdf2fa] border border-[#f7a8e2] w-full items-stretch">
                        <input
                          type="text"
                          value={newCategoryValues.subject}
                          onChange={(e) => handleNewCategoryChange("subject", e)}
                          placeholder="Enter new subject name..."
                          className="w-full sm:flex-1 h-11 min-h-[44px] shrink-0 px-3.5 rounded-lg border border-[#c7cad5] bg-white text-sm font-medium focus:outline-none focus:border-[#d1259e] leading-normal"
                          onKeyPress={(e) => e.key === "Enter" && addNewCategory("subject")}
                        />
                        <button
                          onClick={() => addNewCategory("subject")}
                          className="w-full sm:w-auto h-11 min-h-[44px] shrink-0 px-4 bg-[#d1259e] hover:bg-[#b51b87] text-white rounded-lg font-bold text-sm transition flex items-center justify-center gap-1.5 active:scale-98"
                        >
                          <Plus className="w-4 h-4" />
                          Add
                        </button>
                      </div>
                    )}

                    {selectedSpecificClass.subjects?.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                        {selectedSpecificClass.subjects.map((subject, index) => (
                          <div
                            key={index}
                            onClick={() => selectSubject(index)}
                            className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between gap-2 ${
                              selectedSubjectIndex === index
                                ? "border-[#d1259e] bg-[#fdf2fa] shadow-sm"
                                : "border-[#e0e2e8] bg-[#fbfbfd] hover:border-[#d1259e]/60"
                            }`}
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <Tag className="w-4 h-4 text-[#d1259e] shrink-0" />
                              <input
                                type="text"
                                value={subject.name}
                                onChange={(e) => updateCategoryName("subject", index, e)}
                                className="w-full bg-transparent border-b border-transparent focus:border-[#d1259e] focus:outline-none px-1 font-bold text-sm text-[#1c1c1e]"
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                            <button
                              onClick={(e) => deleteCategory("subject", index, e)}
                              className="p-1 text-[#e53935] hover:bg-[#fbd4d4] rounded-lg transition-colors shrink-0"
                              title="Delete Subject"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-[#65676e] py-1">No Subjects yet.</div>
                    )}
                  </div>
                )}

                {/* Level 5: Chapters */}
                {selectedSubjectIndex !== null && (
                  <div className="pl-3 sm:pl-5 border-l-3 border-[#ff7347] space-y-3 pt-4">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-[#ffe6cd] text-[#8a3300] border border-[#fcc89b]">
                          Level 5: Chapters
                        </span>
                        <span className="text-xs text-[#65676e] font-semibold">in {selectedSubject.name}</span>
                      </div>
                      <button
                        onClick={() => toggleNewCategoryInput("chapter")}
                        className="px-3 py-1.5 bg-[#ffe6cd] hover:bg-[#fad8b6] text-[#8a3300] rounded-lg font-bold text-xs transition flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Chapter</span>
                      </button>
                    </div>

                    {newCategoryInputs.chapter && (
                      <div className="flex flex-col sm:flex-row gap-2.5 p-3 rounded-xl bg-[#fff7ed] border border-[#fcc89b] w-full items-stretch">
                        <input
                          type="text"
                          value={newCategoryValues.chapter}
                          onChange={(e) => handleNewCategoryChange("chapter", e)}
                          placeholder="Enter new chapter name..."
                          className="w-full sm:flex-1 h-11 min-h-[44px] shrink-0 px-3.5 rounded-lg border border-[#c7cad5] bg-white text-sm font-medium focus:outline-none focus:border-[#ff7347] leading-normal"
                          onKeyPress={(e) => e.key === "Enter" && addNewCategory("chapter")}
                        />
                        <button
                          onClick={() => addNewCategory("chapter")}
                          className="w-full sm:w-auto h-11 min-h-[44px] shrink-0 px-4 bg-[#ff7347] hover:bg-[#e65d32] text-white rounded-lg font-bold text-sm transition flex items-center justify-center gap-1.5 active:scale-98"
                        >
                          <Plus className="w-4 h-4" />
                          Add
                        </button>
                      </div>
                    )}

                    {selectedSubject.chapters?.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                        {selectedSubject.chapters.map((chapter, index) => (
                          <div
                            key={index}
                            className="p-3 rounded-xl border-2 border-[#e0e2e8] bg-[#fbfbfd] hover:border-[#ff7347]/60 transition-all flex items-center justify-between gap-2"
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <Tag className="w-4 h-4 text-[#ff7347] shrink-0" />
                              <input
                                type="text"
                                value={chapter.name}
                                onChange={(e) => updateCategoryName("chapter", index, e)}
                                className="w-full bg-transparent border-b border-transparent focus:border-[#ff7347] focus:outline-none px-1 font-bold text-sm text-[#1c1c1e]"
                              />
                            </div>
                            <button
                              onClick={(e) => deleteCategory("chapter", index, e)}
                              className="p-1 text-[#e53935] hover:bg-[#fbd4d4] rounded-lg transition-colors shrink-0"
                              title="Delete Chapter"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-[#65676e] py-1">No Chapters yet.</div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action Bottom Card */}
        {selectedRegion && (
          <div className="bg-white rounded-2xl border border-[#e0e2e8] shadow-sm p-5 sm:p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#1c1c1e]">
                Editing: {selectedRegion.name}
              </h3>
              <p className="text-xs sm:text-sm text-[#65676e] mt-0.5">
                {selectedRegion.examTypes?.length || 0} Exam Types •{" "}
                {selectedRegion.examTypes?.reduce((sum, et) => sum + (et.specificClasses?.length || 0), 0) || 0} Classes •{" "}
                {selectedRegion.examTypes?.reduce(
                  (sum, et) => sum + (et.specificClasses?.reduce((s, sc) => s + (sc.subjects?.length || 0), 0) || 0),
                  0,
                ) || 0}{" "}
                Subjects
              </p>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={handleDeleteRegion}
                disabled={isDeleting}
                className="flex-1 sm:flex-initial px-5 py-3 rounded-xl font-bold text-sm bg-[#fbd4d4] hover:bg-[#f9baba] text-[#1c1c1e] border border-[#1c1c1e]/10 transition flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#1c1c1e] border-t-transparent rounded-full animate-spin"></div>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 text-red-600" />
                    <span>Delete Region</span>
                  </>
                )}
              </button>
              <button
                onClick={handleUpdateRegion}
                disabled={isUpdating}
                className="flex-1 sm:flex-initial px-7 py-3 rounded-xl font-bold text-sm bg-[#ffd02f] hover:bg-[#ffd02f]/90 text-[#1c1c1e] shadow-sm hover:shadow transition flex items-center justify-center gap-2"
              >
                {isUpdating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#1c1c1e] border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Update Region</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default EditQuizRegion
