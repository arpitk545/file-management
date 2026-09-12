"use client"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Plus, MapPin, Tag, Grid3X3, Trash2, ArrowLeft } from "lucide-react"
import { createQuizRegion } from "../../../../services/operations/quizAPI"
import { toast } from "react-hot-toast"

const QuizRegion = () => {
  const navigate = useNavigate()
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
    <div className="min-h-screen bg-[#f7f8fa] text-[#1c1c1e] py-6 sm:py-8 px-4 sm:px-6 lg:px-8 xl:px-12 w-full">
      <div className="w-full space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#e0e2e8] pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#ffd8f4] text-[#d1259e] mb-2">
              🧠 Quiz Taxonomy Engine
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#1c1c1e] tracking-tight">
              Quiz Region & Category Tree
            </h1>
            <p className="text-sm sm:text-base text-[#65676e] mt-1">
              Organize quiz repositories across regions, exam types, classes, subjects, and chapters
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

        {/* Main Builder Card */}
        <div className="bg-white rounded-2xl border border-[#e0e2e8] shadow-sm overflow-hidden">
          <div className="bg-[#fbfbfd] border-b border-[#e0e2e8] p-4 sm:p-6 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-3 h-3 rounded-full bg-[#ffd02f]"></span>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-[#1c1c1e]">Curriculum Hierarchy Tree</h2>
                <p className="text-xs text-[#65676e]">Click any level to expand and edit nested child categories</p>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6 md:p-8 space-y-6">
            {/* Level 0: Region */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-[#fff8e0] text-[#735400] border border-[#fde89c]">
                  Level 1: Region
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5 w-full items-stretch">
                <input
                  type="text"
                  value={newRegion}
                  onChange={(e) => setNewRegion(e.target.value)}
                  placeholder="Enter region name (e.g., North America, India)..."
                  className="w-full sm:flex-1 h-12 min-h-[48px] shrink-0 px-4 py-3 rounded-xl border border-[#c7cad5] bg-white text-sm font-medium text-[#1c1c1e] focus:outline-none focus:border-2 focus:border-[#ffd02f] transition-all leading-normal shadow-2xs"
                  onKeyPress={(e) => e.key === "Enter" && handleAddRegion()}
                />
                <button
                  onClick={handleAddRegion}
                  disabled={!newRegion.trim()}
                  className="w-full sm:w-auto h-12 min-h-[48px] shrink-0 px-6 rounded-xl sm:rounded-full font-bold text-sm bg-[#ffd02f] hover:bg-[#ffd02f]/90 text-[#1c1c1e] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-xs active:scale-98"
                >
                  <Plus className="w-4 h-4" />
                  Add Region
                </button>
              </div>

              {/* Existing Regions */}
              {regions.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-2">
                  {regions.map((region, index) => (
                    <div
                      key={index}
                      onClick={() => selectRegion(index)}
                      className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between gap-2 ${
                        selectedRegionIndex === index
                          ? "border-[#ffd02f] bg-[#fffdf0] shadow-sm"
                          : "border-[#e0e2e8] bg-[#fbfbfd] hover:border-[#ffd02f]/60"
                      }`}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <MapPin className="w-4 h-4 text-[#ffd02f] shrink-0" />
                        <input
                          type="text"
                          value={region.name}
                          onChange={(e) => updateRegionName(e, index)}
                          className="w-full bg-transparent border-b border-transparent focus:border-[#ffd02f] focus:outline-none px-1 font-bold text-sm text-[#1c1c1e]"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      <button
                        onClick={(e) => deleteRegion(index, e)}
                        className="p-1 text-[#e53935] hover:bg-[#fbd4d4] rounded-lg transition-colors shrink-0"
                        title="Delete Region"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Categories for selected region */}
              {selectedRegionIndex !== null && (
                <div className="mt-6 pt-6 border-t border-[#e0e2e8] space-y-6">
                  {/* Level 1: Exam Types */}
                  <div className="pl-3 sm:pl-5 border-l-3 border-[#0fbcb0] space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-[#c3faf5] text-[#00635b] border border-[#9eece4]">
                        Level 2: Exam Types
                      </span>
                      <span className="text-xs text-[#65676e] font-semibold">in {regions[selectedRegionIndex].name}</span>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2.5 w-full items-stretch">
                      <input
                        type="text"
                        value={newExamType}
                        onChange={(e) => setNewExamType(e.target.value)}
                        placeholder="Enter Exam Type (e.g. Competitive, Board)..."
                        className="w-full sm:flex-1 h-12 min-h-[48px] shrink-0 px-4 py-3 rounded-xl border border-[#c7cad5] bg-white text-sm font-medium text-[#1c1c1e] focus:outline-none focus:border-2 focus:border-[#0fbcb0] transition-all leading-normal shadow-2xs"
                        onKeyPress={(e) => e.key === "Enter" && handleAddExamType()}
                      />
                      <button
                        onClick={handleAddExamType}
                        disabled={!newExamType.trim()}
                        className="w-full sm:w-auto h-12 min-h-[48px] shrink-0 px-6 rounded-xl sm:rounded-full font-bold text-sm bg-[#0fbcb0] hover:bg-[#0da69b] text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-xs active:scale-98"
                      >
                        <Plus className="w-4 h-4" />
                        Add Exam Type
                      </button>
                    </div>

                    {/* Existing Exam Types */}
                    {regions[selectedRegionIndex].examTypes.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
                        {regions[selectedRegionIndex].examTypes.map((examType, index) => (
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
                    )}

                    {/* Level 2: Specific Classes */}
                    {selectedExamTypeIndex !== null && (
                      <div className="pl-3 sm:pl-5 border-l-3 border-[#4262ff] space-y-3 pt-4">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-[#d5f0fc] text-[#00517d] border border-[#a2def7]">
                            Level 3: Specific Classes
                          </span>
                          <span className="text-xs text-[#65676e] font-semibold">
                            in {selectedRegion.examTypes[selectedExamTypeIndex]?.name}
                          </span>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2.5 w-full items-stretch">
                          <input
                            type="text"
                            value={newSpecificClass}
                            onChange={(e) => setNewSpecificClass(e.target.value)}
                            placeholder="Enter Specific Class (e.g. Grade 10, Class 12)..."
                            className="w-full sm:flex-1 h-12 min-h-[48px] shrink-0 px-4 py-3 rounded-xl border border-[#c7cad5] bg-white text-sm font-medium text-[#1c1c1e] focus:outline-none focus:border-2 focus:border-[#4262ff] transition-all leading-normal shadow-2xs"
                            onKeyPress={(e) => e.key === "Enter" && handleAddSpecificClass()}
                          />
                          <button
                            onClick={handleAddSpecificClass}
                            disabled={!newSpecificClass.trim()}
                            className="w-full sm:w-auto h-12 min-h-[48px] shrink-0 px-6 rounded-xl sm:rounded-full font-bold text-sm bg-[#4262ff] hover:bg-[#3451e0] text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-xs active:scale-98"
                          >
                            <Plus className="w-4 h-4" />
                            Add Class
                          </button>
                        </div>

                        {/* Existing Specific Classes */}
                        {selectedRegion.examTypes[selectedExamTypeIndex]?.specificClasses.length > 0 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
                            {selectedRegion.examTypes[selectedExamTypeIndex]?.specificClasses.map((specificClass, index) => (
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
                        )}

                        {/* Level 3: Subjects */}
                        {selectedSpecificClassIndex !== null && (
                          <div className="pl-3 sm:pl-5 border-l-3 border-[#d1259e] space-y-3 pt-4">
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-[#ffd8f4] text-[#850060] border border-[#f7a8e2]">
                                Level 4: Subjects
                              </span>
                              <span className="text-xs text-[#65676e] font-semibold">
                                in {selectedExamType.specificClasses[selectedSpecificClassIndex]?.name}
                              </span>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-2.5 w-full items-stretch">
                              <input
                                type="text"
                                value={newSubject}
                                onChange={(e) => setNewSubject(e.target.value)}
                                placeholder="Enter Subject (e.g. Physics, Mathematics)..."
                                className="w-full sm:flex-1 h-12 min-h-[48px] shrink-0 px-4 py-3 rounded-xl border border-[#c7cad5] bg-white text-sm font-medium text-[#1c1c1e] focus:outline-none focus:border-2 focus:border-[#d1259e] transition-all leading-normal shadow-2xs"
                                onKeyPress={(e) => e.key === "Enter" && handleAddSubject()}
                              />
                              <button
                                onClick={handleAddSubject}
                                disabled={!newSubject.trim()}
                                className="w-full sm:w-auto h-12 min-h-[48px] shrink-0 px-6 rounded-xl sm:rounded-full font-bold text-sm bg-[#d1259e] hover:bg-[#b51b87] text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-xs active:scale-98"
                              >
                                <Plus className="w-4 h-4" />
                                Add Subject
                              </button>
                            </div>

                            {/* Existing Subjects */}
                            {selectedExamType.specificClasses[selectedSpecificClassIndex]?.subjects.length > 0 && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
                                {selectedExamType.specificClasses[selectedSpecificClassIndex]?.subjects.map((subject, index) => (
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
                            )}

                            {/* Level 4: Chapters */}
                            {selectedSubjectIndex !== null && (
                              <div className="pl-3 sm:pl-5 border-l-3 border-[#ff7347] space-y-3 pt-4">
                                <div className="flex items-center gap-2">
                                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-[#ffe6cd] text-[#8a3300] border border-[#fcc89b]">
                                    Level 5: Chapters
                                  </span>
                                  <span className="text-xs text-[#65676e] font-semibold">
                                    in {selectedSpecificClass.subjects[selectedSubjectIndex]?.name}
                                  </span>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-2.5 w-full items-stretch">
                                  <input
                                    type="text"
                                    value={newChapter}
                                    onChange={(e) => setNewChapter(e.target.value)}
                                    placeholder="Enter Chapter title..."
                                    className="w-full sm:flex-1 h-12 min-h-[48px] shrink-0 px-4 py-3 rounded-xl border border-[#c7cad5] bg-white text-sm font-medium text-[#1c1c1e] focus:outline-none focus:border-2 focus:border-[#ff7347] transition-all leading-normal shadow-2xs"
                                    onKeyPress={(e) => e.key === "Enter" && handleAddChapter()}
                                  />
                                  <button
                                    onClick={handleAddChapter}
                                    disabled={!newChapter.trim()}
                                    className="w-full sm:w-auto h-12 min-h-[48px] shrink-0 px-6 rounded-xl sm:rounded-full font-bold text-sm bg-[#ff7347] hover:bg-[#e65d32] text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-xs active:scale-98"
                                  >
                                    <Plus className="w-4 h-4" />
                                    Add Chapter
                                  </button>
                                </div>

                                {/* Existing Chapters */}
                                {selectedSpecificClass.subjects[selectedSubjectIndex]?.chapters.length > 0 && (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
                                    {selectedSpecificClass.subjects[selectedSubjectIndex]?.chapters.map((chapter, index) => (
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
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Summary Card & Submit */}
        {regions.length > 0 && (
          <div className="bg-white rounded-2xl border border-[#e0e2e8] shadow-sm p-5 sm:p-7 space-y-6">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#4262ff]"></span>
              <h3 className="text-base sm:text-lg font-bold text-[#1c1c1e]">Hierarchy Blueprint Summary</h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              <div className="p-4 bg-[#fff8e0] border border-[#fde89c] rounded-xl text-center">
                <div className="text-2xl sm:text-3xl font-black text-[#735400]">{regions.length}</div>
                <div className="text-xs font-bold uppercase tracking-wider text-[#735400]/80 mt-1">Regions</div>
              </div>
              <div className="p-4 bg-[#c3faf5] border border-[#9eece4] rounded-xl text-center">
                <div className="text-2xl sm:text-3xl font-black text-[#00635b]">
                  {regions.reduce((sum, region) => sum + region.examTypes.length, 0)}
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-[#00635b]/80 mt-1">Exam Types</div>
              </div>
              <div className="p-4 bg-[#d5f0fc] border border-[#a2def7] rounded-xl text-center">
                <div className="text-2xl sm:text-3xl font-black text-[#00517d]">
                  {regions.reduce(
                    (sum, region) =>
                      sum + region.examTypes.reduce((s, examType) => s + examType.specificClasses.length, 0),
                    0,
                  )}
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-[#00517d]/80 mt-1">Classes</div>
              </div>
              <div className="p-4 bg-[#ffd8f4] border border-[#f7a8e2] rounded-xl text-center">
                <div className="text-2xl sm:text-3xl font-black text-[#850060]">
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
                <div className="text-xs font-bold uppercase tracking-wider text-[#850060]/80 mt-1">Subjects</div>
              </div>
              <div className="p-4 bg-[#ffe6cd] border border-[#fcc89b] rounded-xl text-center col-span-2 sm:col-span-3 lg:col-span-1">
                <div className="text-2xl sm:text-3xl font-black text-[#8a3300]">
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
                <div className="text-xs font-bold uppercase tracking-wider text-[#8a3300]/80 mt-1">Chapters</div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleSubmitToServer}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm bg-[#ffd02f] hover:bg-[#ffd02f]/90 text-[#1c1c1e] shadow-sm hover:shadow transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#1c1c1e] border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving Structure...</span>
                  </>
                ) : (
                  <span>Submit Structure</span>
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
