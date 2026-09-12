"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Sparkles,
  Target,
  ImageIcon,
  Upload,
  X,
  CheckCircle,
  Tag as TagIcon,
  ArrowLeft,
  Layers,
  BookOpen,
  FolderPlus,
  HelpCircle,
  Loader2,
  FileText
} from "lucide-react"
import { getAllQandARegions, createQandA } from "../../../../services/operations/qandA"
import toast from "react-hot-toast"
import { useNavigate } from "react-router-dom"

function ThumbnailUploader({ preview, onFileSelect, onClear }) {
  const [thumbnailFile, setThumbnailFile] = useState(null)

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setThumbnailFile(file)

    const reader = new FileReader()
    reader.onload = () => {
      onFileSelect({ file, dataUrl: reader.result })
    }
    reader.readAsDataURL(file)
  }

  const handleClear = () => {
    setThumbnailFile(null)
    onClear()
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs sm:text-sm font-bold uppercase tracking-wider text-[#555a6a] flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-[#4262ff]" />
          <span>Cover Thumbnail (Optional)</span>
        </label>
        <span className="text-xs text-[#555a6a]">JPG, PNG or WebP up to 2MB</span>
      </div>

      {preview ? (
        <div className="relative rounded-2xl border-2 border-[#1c1c1e] overflow-hidden bg-white shadow-sm max-w-md">
          <img
            src={preview}
            alt="Q&A thumbnail preview"
            className="w-full h-48 sm:h-56 object-cover"
          />
          <button
            type="button"
            onClick={handleClear}
            className="absolute top-3 right-3 inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/95 hover:bg-white text-[#800000] border border-[#e0e2e8] shadow-md transition-transform active:scale-90"
            aria-label="Remove thumbnail"
            title="Remove thumbnail"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-full bg-[#1c1c1e]/80 text-[#ffd02f] text-[11px] font-bold">
            Thumbnail Selected
          </div>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center gap-3 p-6 sm:p-8 rounded-2xl border-2 border-dashed border-[#c7cad5] bg-[#fffdf5] hover:bg-white hover:border-[#1c1c1e] transition-all cursor-pointer text-center group">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <div className="w-12 h-12 rounded-full bg-[#ffd02f] text-[#1c1c1e] flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-[#1c1c1e]">
              Click to upload cover thumbnail
            </p>
            <p className="text-xs text-[#555a6a] mt-0.5">
              Recommended: 1200 x 675 (16:9 ratio) for clear student display
            </p>
          </div>
        </label>
      )}
    </div>
  )
}

export default function CreateQandA() {
  const [formData, setFormData] = useState({
    region: "",
    examType: "",
    specificClass: "",
    subject: "",
    chapterName: "",
    tags: "",
    status: "active"
  })

  const [thumbnailFile, setThumbnailFile] = useState(null)
  const [questionImages, setQuestionImages] = useState([])
  const [regions, setRegions] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isFetchingRegions, setIsFetchingRegions] = useState(true)
  const navigate = useNavigate()

  // Fetch regions
  useEffect(() => {
    const fetchRegions = async () => {
      try {
        setIsFetchingRegions(true)
        const response = await getAllQandARegions()
        setRegions(response?.data || [])
      } catch (error) {
        console.error("Failed to fetch Q&A regions:", error)
        toast.error("Failed to load Q&A taxonomy data")
      } finally {
        setIsFetchingRegions(false)
      }
    }

    fetchRegions()
  }, [])

  const getExamTypes = () => {
    if (!formData.region) return []
    const selectedRegion = regions.find((region) => region.name === formData.region)
    return selectedRegion?.examTypes?.map((type) => type.name) || []
  }

  const getSpecificClasses = () => {
    if (!formData.region || !formData.examType) return []
    const selectedRegion = regions.find((region) => region.name === formData.region)
    const selectedExamType = selectedRegion?.examTypes?.find((et) => et.name === formData.examType)
    return selectedExamType?.specificClasses?.map((cls) => cls.name) || []
  }

  const getSubjects = () => {
    if (!formData.region || !formData.examType || !formData.specificClass) return []
    const selectedRegion = regions.find((region) => region.name === formData.region)
    const selectedExamType = selectedRegion?.examTypes?.find((et) => et.name === formData.examType)
    const selectedSpecificClass = selectedExamType?.specificClasses?.find((sc) => sc.name === formData.specificClass)
    return selectedSpecificClass?.subjects?.map((subject) => subject.name) || []
  }

  // Create Q & A
  const handleCreateQandA = async () => {
    if (!formData.region || !formData.examType || !formData.specificClass || !formData.subject || !formData.chapterName) {
      toast.error("Please complete all required fields")
      return
    }

    try {
      setIsLoading(true)

      // Prepare form data
      const formDataToSend = new FormData()

      // Send category as JSON string
      const category = {
        region: formData.region,
        examType: formData.examType,
        specificClass: formData.specificClass,
        subject: formData.subject
      }
      formDataToSend.append("category", JSON.stringify(category))

      // Add other fields
      formDataToSend.append("chapterName", formData.chapterName.trim())
      formDataToSend.append("status", formData.status)

      // Add tags as comma-separated string
      if (formData.tags) {
        formDataToSend.append("tags", formData.tags)
      }

      // Add thumbnail if exists
      if (thumbnailFile) {
        formDataToSend.append("thumbnail", thumbnailFile)
      }

      // Add question images if exists
      if (questionImages.length > 0) {
        questionImages.forEach((image) => {
          formDataToSend.append("questionImages", image)
        })
      }

      // Send request
      const response = await createQandA(formDataToSend)

      if (response.success) {
        toast.success("Q & A chapter created successfully!")
        navigate("/view-qa")

        // Reset form
        setFormData({
          region: "",
          examType: "",
          specificClass: "",
          subject: "",
          chapterName: "",
          tags: "",
          status: "active"
        })
        setThumbnailFile(null)
        setQuestionImages([])
      } else {
        throw new Error(response.message || "Failed to create Q&A")
      }
    } catch (error) {
      console.error("Error creating Q & A:", error)
      toast.error(error.message || "Failed to create Q & A")
    } finally {
      setIsLoading(false)
    }
  }

  // Live tags array for preview chips
  const tagsList = formData.tags
    ? formData.tags.split(",").map((t) => t.trim()).filter(Boolean)
    : []

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
              Q&amp;A STUDIO
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#ffd8f4] text-[#86296b] border border-[#f3bee5]">
              ADMIN &amp; MANAGER
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/view-qa")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#c7cad5] hover:border-[#1c1c1e] text-[#1c1c1e] text-xs sm:text-sm font-bold transition-all shadow-sm active:scale-95"
            >
              <BookOpen className="w-4 h-4 text-[#4262ff]" />
              <span>View All Q&amp;A Sets</span>
            </button>
          </div>
        </div>

        {/* Page Title & Intro */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#1c1c1e]">
            Create Question &amp; Answer Set
          </h1>
          <p className="text-sm sm:text-base text-[#555a6a]">
            Define the curriculum hierarchy, assign the chapter topic, and publish structured Q&amp;A materials for students.
          </p>
        </div>

        {/* Sticky-Note Guidance Card (Lavender Miro Pill) */}
        <div className="bg-[#f5f3ff] rounded-2xl border border-[#ddd6fe] p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-[#4262ff] text-white flex-shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#1c1c1e]">
                Step 1: Create Chapter Container &bull; Step 2: Add Rich Questions
              </h3>
              <p className="text-xs sm:text-sm text-[#555a6a] mt-0.5">
                First set up the taxonomy (Region, Exam, Class, Subject &amp; Chapter). Once saved, you can populate questions and answers with equations, images, and explanations.
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#ddd6fe] text-xs font-bold text-[#4262ff] whitespace-nowrap self-start sm:self-auto">
            <Layers className="w-3.5 h-3.5" />
            <span>2-Step Flow</span>
          </span>
        </div>

        {/* Form Container */}
        <div className="space-y-6">

          {/* Card 1: Taxonomy & Curriculum Classification */}
          <div className="bg-white rounded-2xl border border-[#c7cad5] p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-[#e0e2e8]">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[#c3faf5] text-[#187574] border border-[#9eece4]">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-[#1c1c1e]">
                    1. Curriculum Classification
                  </h2>
                  <p className="text-xs text-[#555a6a]">
                    Select the academic cascade to position this Q&amp;A unit correctly.
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-[#b8860b] bg-[#fffdf5] border border-[#fde89c] px-3 py-1 rounded-full">
                Required Fields
              </span>
            </div>

            {isFetchingRegions ? (
              <div className="py-8 flex items-center justify-center gap-2 text-sm text-[#555a6a]">
                <Loader2 className="w-5 h-5 animate-spin text-[#4262ff]" />
                <span>Loading curriculum taxonomy...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                
                {/* Region Select */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#555a6a]">
                      Region *
                    </label>
                    {formData.region && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#c3faf5] text-[#187574]">
                        Selected
                      </span>
                    )}
                  </div>
                  <select
                    value={formData.region}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        region: e.target.value,
                        examType: "",
                        specificClass: "",
                        subject: "",
                      })
                    }}
                    className="w-full h-11 min-h-[44px] px-3.5 rounded-xl border border-[#c7cad5] bg-[#fffdf5] text-[#1c1c1e] text-sm font-semibold focus:outline-none focus:border-[#1c1c1e] focus:ring-2 focus:ring-[#ffd02f]/30 transition-all"
                  >
                    <option value="">Choose region</option>
                    {regions.map((region) => (
                      <option key={region._id} value={region.name}>
                        {region.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Exam Type Select */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#555a6a]">
                      Exam Type *
                    </label>
                    {formData.examType && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#f5f3ff] text-[#4262ff]">
                        Selected
                      </span>
                    )}
                  </div>
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
                    className="w-full h-11 min-h-[44px] px-3.5 rounded-xl border border-[#c7cad5] bg-[#fffdf5] text-[#1c1c1e] text-sm font-semibold focus:outline-none focus:border-[#1c1c1e] focus:ring-2 focus:ring-[#ffd02f]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">Choose exam type</option>
                    {getExamTypes().map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Specific Class Select */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#555a6a]">
                      Specific Class *
                    </label>
                    {formData.specificClass && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ffd8f4] text-[#86296b]">
                        Selected
                      </span>
                    )}
                  </div>
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
                    className="w-full h-11 min-h-[44px] px-3.5 rounded-xl border border-[#c7cad5] bg-[#fffdf5] text-[#1c1c1e] text-sm font-semibold focus:outline-none focus:border-[#1c1c1e] focus:ring-2 focus:ring-[#ffd02f]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">Choose class</option>
                    {getSpecificClasses().map((cls) => (
                      <option key={cls} value={cls}>
                        {cls}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subject Select */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#555a6a]">
                      Subject *
                    </label>
                    {formData.subject && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ffd02f] text-[#1c1c1e]">
                        Selected
                      </span>
                    )}
                  </div>
                  <select
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        subject: e.target.value,
                      })
                    }
                    disabled={!formData.specificClass}
                    className="w-full h-11 min-h-[44px] px-3.5 rounded-xl border border-[#c7cad5] bg-[#fffdf5] text-[#1c1c1e] text-sm font-semibold focus:outline-none focus:border-[#1c1c1e] focus:ring-2 focus:ring-[#ffd02f]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
            )}
          </div>

          {/* Card 2: Chapter & Topic Metadata */}
          <div className="bg-white rounded-2xl border border-[#c7cad5] p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-[#e0e2e8]">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[#ffd8f4] text-[#86296b] border border-[#f3bee5]">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-[#1c1c1e]">
                    2. Chapter &amp; Topic Details
                  </h2>
                  <p className="text-xs text-[#555a6a]">
                    Provide descriptive titles, searchable tags, and status visibility.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              {/* Chapter Name */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#555a6a]">
                  Chapter Name / Topic Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Thermodynamics, Linear Algebra, Optics & Refraction..."
                  value={formData.chapterName}
                  onChange={(e) => setFormData({ ...formData, chapterName: e.target.value })}
                  className="w-full h-11 min-h-[44px] px-4 rounded-xl border border-[#c7cad5] bg-[#fffdf5] text-[#1c1c1e] text-sm font-medium placeholder-[#8e92a0] focus:outline-none focus:border-[#1c1c1e] focus:ring-2 focus:ring-[#ffd02f]/30 transition-all"
                />
              </div>

              {/* Tags Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#555a6a] flex items-center gap-1.5">
                    <TagIcon className="w-3.5 h-3.5 text-[#4262ff]" />
                    <span>Tags (Comma-separated)</span>
                  </label>
                  <span className="text-xs text-[#555a6a]">e.g. physics, formulas, revision</span>
                </div>
                <input
                  type="text"
                  placeholder="Type tags separated by commas..."
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full h-11 min-h-[44px] px-4 rounded-xl border border-[#c7cad5] bg-[#fffdf5] text-[#1c1c1e] text-sm font-medium placeholder-[#8e92a0] focus:outline-none focus:border-[#1c1c1e] focus:ring-2 focus:ring-[#ffd02f]/30 transition-all"
                />
                {tagsList.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-xs font-bold text-[#555a6a] mr-1">Preview Tags:</span>
                    {tagsList.map((tag, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#f5f3ff] text-[#4262ff] border border-[#ddd6fe]"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Status Visibility Selector */}
              <div className="space-y-2 pt-2">
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
          </div>

          {/* Card 3: Media & Thumbnail Attachment */}
          <div className="bg-white rounded-2xl border border-[#c7cad5] p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-[#e0e2e8]">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[#fffdf5] text-[#b8860b] border border-[#fde89c]">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-[#1c1c1e]">
                    3. Visual Assets (Optional)
                  </h2>
                  <p className="text-xs text-[#555a6a]">
                    Attach an appealing cover image for the chapter card in the public directory.
                  </p>
                </div>
              </div>
            </div>

            <ThumbnailUploader
              preview={thumbnailFile ? URL.createObjectURL(thumbnailFile) : ""}
              onFileSelect={(fileData) => setThumbnailFile(fileData.file)}
              onClear={() => setThumbnailFile(null)}
            />
          </div>

          {/* Action Bar (Canary Yellow Primary Button) */}
          <div className="bg-white rounded-2xl border border-[#c7cad5] p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="text-xs sm:text-sm text-[#555a6a] text-center sm:text-left">
              {formData.region && formData.examType && formData.specificClass && formData.subject && formData.chapterName ? (
                <span className="font-bold text-[#187574] flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-[#187574]" />
                  All required information complete. Ready to create container.
                </span>
              ) : (
                <span>Please complete all required fields (Region, Exam, Class, Subject &amp; Chapter).</span>
              )}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => navigate("/view-qa")}
                className="w-full sm:w-auto px-5 py-3 rounded-full bg-white border border-[#c7cad5] text-[#1c1c1e] hover:bg-[#f7f8fa] hover:border-[#1c1c1e] text-xs sm:text-sm font-bold transition-all"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleCreateQandA}
                disabled={
                  isLoading ||
                  !formData.region ||
                  !formData.examType ||
                  !formData.specificClass ||
                  !formData.subject ||
                  !formData.chapterName
                }
                className="w-full sm:w-auto h-12 min-h-[48px] px-8 rounded-full bg-[#ffd02f] hover:bg-[#fcb900] disabled:bg-gray-100 disabled:border disabled:border-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-[#1c1c1e] font-extrabold text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#1c1c1e]" />
                    <span>Creating Chapter...</span>
                  </>
                ) : (
                  <>
                    <FolderPlus className="w-4 h-4 text-[#1c1c1e]" />
                    <span>Create Q &amp; A Set</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}