"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Plus,
  FileText,
  ImageIcon,
  Eye,
  EyeOff,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  FolderUp,
  MapPin,
  X,
  Upload,
  Link as LinkIcon,
  Check,
  Calendar,
  Layers,
  HelpCircle,
} from "lucide-react"
import { GetFileRegion, CreateFileNew } from "../../../../services/operations/filesAPI"
import toast from "react-hot-toast"
import FileEditor from "../../Admin/File/File-editor"
import { useNavigate } from "react-router-dom"

const MiroLoader = ({ message = "Loading..." }) => (
  <div className="flex flex-col items-center justify-center py-16 gap-3 font-sans">
    <div className="relative w-12 h-12">
      <div className="w-12 h-12 rounded-full border-4 border-[#eef0f3] border-t-[#ffd02f] border-r-[#1c1c1e] animate-spin" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-3 h-3 rounded-full bg-[#ffd02f]" />
      </div>
    </div>
    <span className="text-xs font-bold uppercase tracking-wider text-[#555a6a]">{message}</span>
  </div>
)

const TAG_COLOR_PALETTES = [
  { bg: "bg-[#fff4c4]", text: "text-[#746019]", border: "border-[#fde89c]" }, // Yellow
  { bg: "bg-[#c3faf5]", text: "text-[#187574]", border: "border-[#9eece4]" }, // Teal
  { bg: "bg-[#ffd8f4]", text: "text-[#86296b]", border: "border-[#f3bee5]" }, // Rose
  { bg: "bg-[#ffe6cd]", text: "text-[#7c3a00]", border: "border-[#fcd0a1]" }, // Orange
  { bg: "bg-[#f5f3ff]", text: "text-[#4262ff]", border: "border-[#ddd6fe]" }, // Blue
]

export default function CreateFiles() {
  const [formData, setFormData] = useState({
    region: "",
    category1: "",
    category2: "",
    category3: "",
    category4: "",
    category5: "",
    fileCreatorName: "",
    fileType: "",
    fileTitle: "",
    fileDescription: "",
    uploadMethod: "file",
    externalLink: "",
    selectedFile: null,
    selectedImage: null,
    tags: [],
    currentTag: "",
    showCommentBox: true,
    addYears: "none",
    academicYear: "",
    role: "user",
  })

  const [additionalYears, setAdditionalYears] = useState([])
  const [additionalAcademicYears, setAdditionalAcademicYears] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [regions, setRegions] = useState([])
  const [regionOptions, setRegionOptions] = useState([])
  const [category1Options, setCategory1Options] = useState([])
  const [category2Options, setCategory2Options] = useState([])
  const [category3Options, setCategory3Options] = useState([])
  const [category4Options, setCategory4Options] = useState([])
  const [category5Options, setCategory5Options] = useState([])
  const [showYearCalendar, setShowYearCalendar] = useState(false)
  const [showAcademicYearDropdown, setShowAcademicYearDropdown] = useState(false)

  const fileTypeOptions = ["PDF", "DOC", "DOCX", "PPT", "PPTX"]

  const startYear = 2000
  const endYear = 2050
  const academicYearOptions = Array.from({ length: endYear - startYear + 1 }, (_, i) => {
    const year = startYear + i
    return `${year}-${year + 1}`
  })

  const navigate = useNavigate()

  // Fetch Region List
  useEffect(() => {
    const fetchRegions = async () => {
      try {
        setIsLoading(true)
        const response = await GetFileRegion()
        const data = response?.data || []

        const formattedRegions = data.map((region) => ({
          value: region._id,
          label: region.name,
        }))

        setRegionOptions(formattedRegions)
        setRegions(data)
      } catch (error) {
        toast.error("Failed to load region data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchRegions()
  }, [])

  // Update Category 1 when Region changes
  useEffect(() => {
    if (formData.region) {
      const selectedRegion = regions.find((r) => r._id === formData.region)

      if (selectedRegion) {
        const cat1Options =
          selectedRegion.category1?.map((cat) => ({
            value: cat.name,
            label: cat.name,
          })) || []

        setCategory1Options(cat1Options)
        setCategory2Options([])
        setCategory3Options([])
        setCategory4Options([])
        setCategory5Options([])

        setFormData((prev) => ({
          ...prev,
          category1: "",
          category2: "",
          category3: "",
          category4: "",
          category5: "",
        }))
      }
    }
  }, [formData.region, regions])

  // Update Category 2 when Category 1 changes
  useEffect(() => {
    const selectedRegion = regions.find((r) => r._id === formData.region)
    const selectedCat1 = selectedRegion?.category1?.find((cat) => cat.name === formData.category1)

    const cat2Options =
      selectedCat1?.category2?.map((cat) => ({
        value: cat.name,
        label: cat.name,
      })) || []

    setCategory2Options(cat2Options)
    setCategory3Options([])
    setCategory4Options([])
    setCategory5Options([])

    setFormData((prev) => ({
      ...prev,
      category2: "",
      category3: "",
      category4: "",
      category5: "",
    }))
  }, [formData.category1, formData.region, regions])

  // Update Category 3 when Category 2 changes
  useEffect(() => {
    const selectedRegion = regions.find((r) => r._id === formData.region)
    const selectedCat1 = selectedRegion?.category1?.find((cat) => cat.name === formData.category1)
    const selectedCat2 = selectedCat1?.category2?.find((cat) => cat.name === formData.category2)

    const cat3Options =
      selectedCat2?.category3?.map((cat) => ({
        value: cat.name,
        label: cat.name,
      })) || []

    setCategory3Options(cat3Options)
    setCategory4Options([])
    setCategory5Options([])

    setFormData((prev) => ({
      ...prev,
      category3: "",
      category4: "",
      category5: "",
    }))
  }, [formData.category2, formData.category1, formData.region, regions])

  // Update Category 4 when Category 3 changes
  useEffect(() => {
    const selectedRegion = regions.find((r) => r._id === formData.region)
    const selectedCat1 = selectedRegion?.category1?.find((cat) => cat.name === formData.category1)
    const selectedCat2 = selectedCat1?.category2?.find((cat) => cat.name === formData.category2)
    const selectedCat3 = selectedCat2?.category3?.find((cat) => cat.name === formData.category3)

    const cat4Options =
      selectedCat3?.category4?.map((cat) => ({
        value: cat.name,
        label: cat.name,
      })) || []

    setCategory4Options(cat4Options)
    setCategory5Options([])

    setFormData((prev) => ({
      ...prev,
      category4: "",
      category5: "",
    }))
  }, [formData.category3, formData.category2, formData.category1, formData.region, regions])

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null
    setFormData((prev) => ({
      ...prev,
      selectedFile: file,
    }))
  }

  const handleImageChange = (e) => {
    const image = e.target.files?.[0] || null
    setFormData((prev) => ({
      ...prev,
      selectedImage: image,
    }))
  }

  const addTag = () => {
    if (formData.currentTag.trim() && !formData.tags.includes(formData.currentTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, prev.currentTag.trim()],
        currentTag: "",
      }))
    }
  }

  const removeTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }))
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addTag()
    }
  }

  const removeYear = (id) => {
    setAdditionalYears((prev) => prev.filter((item) => item.id !== id))
  }

  const removeAcademicYear = (id) => {
    setAdditionalAcademicYears((prev) => prev.filter((item) => item.id !== id))
  }

  const updateAdditionalYear = (id, value) => {
    setAdditionalYears((prev) =>
      prev.map((item) => (item.id === id ? { ...item, year: value } : item))
    )
  }

  const updateAdditionalAcademicYear = (id, value) => {
    setAdditionalAcademicYears((prev) =>
      prev.map((item) => (item.id === id ? { ...item, year: value } : item))
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.region || !formData.category1 || !formData.category2 || !formData.category3) {
      toast.error("Please complete all required regional and category classifications (Steps 1 to 4).")
      return
    }

    if (!formData.fileTitle) {
      toast.error("Please provide a title for the study resource.")
      return
    }

    if (formData.uploadMethod === "file" && !formData.selectedFile) {
      toast.error("Please select a document file to upload.")
      return
    }

    if (formData.uploadMethod === "link" && !formData.externalLink) {
      toast.error("Please provide a valid external resource link.")
      return
    }

    setIsSubmitting(true)
    const toastId = toast.loading("Uploading study resource...")

    try {
      const formDataToSend = new FormData()
      const selectedRegion = regions.find((r) => r._id === formData.region)
      const regionName = selectedRegion?.name || ""

      // Append text fields
      formDataToSend.append("region", regionName)
      formDataToSend.append("category1", formData.category1)
      formDataToSend.append("category2", formData.category2)
      formDataToSend.append("category3", formData.category3)
      formDataToSend.append("category4", formData.category4)
      formDataToSend.append("category5", formData.category5)
      formDataToSend.append("fileCreatorName", formData.fileCreatorName)
      formDataToSend.append("fileType", formData.fileType)
      formDataToSend.append("fileTitle", formData.fileTitle)
      formDataToSend.append("fileDescription", formData.fileDescription)
      formDataToSend.append("uploadMethod", formData.uploadMethod)
      formDataToSend.append("externalLink", formData.externalLink)
      formDataToSend.append("showCommentBox", formData.showCommentBox)
      formDataToSend.append("addYears", formData.addYears)
      formDataToSend.append("academicYear", formData.academicYear)

      // Append arrays as JSON strings
      formDataToSend.append("tags", JSON.stringify(formData.tags))
      formDataToSend.append(
        "additionalYears",
        JSON.stringify(additionalYears.map((item) => item.year))
      )
      formDataToSend.append(
        "additionalAcademicYears",
        JSON.stringify(additionalAcademicYears.map((item) => item.year))
      )
      formDataToSend.append("role", "user")

      // Append file
      if (formData.selectedFile) {
        formDataToSend.append("file", formData.selectedFile)
      }

      // Append image(s)
      if (formData.selectedImage) {
        formDataToSend.append("image", formData.selectedImage)
      }

      await CreateFileNew(formDataToSend)
      toast.dismiss(toastId)
      toast.success("File uploaded successfully!")
      navigate("/filter-user-file")
    } catch (error) {
      toast.dismiss(toastId)
      console.error("Error creating file:", error)
      toast.error("Failed to upload file. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRemoveFile = () => {
    setFormData((prev) => ({
      ...prev,
      selectedFile: null,
    }))
  }

  const handleRemoveImage = () => {
    setFormData((prev) => ({
      ...prev,
      selectedImage: null,
    }))
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#1c1c1e] py-6 sm:py-10 px-4 sm:px-6 lg:px-8 xl:px-12 w-full font-sans">
      <div className="w-full space-y-6 sm:space-y-8">
        {/* Top Header & Navigation Bar */}
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <button
              onClick={() => navigate("/filter-user-file")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#c7cad5] bg-white text-xs font-semibold text-[#1c1c1e] hover:bg-[#ebecf0] transition-colors shadow-sm active:scale-95 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to File Vault</span>
            </button>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-[#ffd02f] text-[#1c1c1e] text-[11px] font-black uppercase tracking-widest rounded-full shadow-sm">
                STUDENT REPOSITORY
              </span>
              <span className="px-3 py-1 bg-[#c3faf5] text-[#187574] text-[11px] font-bold uppercase tracking-wider rounded-full">
                DOCUMENT CONTRIBUTION
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#1c1c1e]">
              Upload Academic Document & Study Resource
            </h1>
            <p className="text-xs sm:text-sm text-[#6a6d7c] max-w-2xl leading-relaxed">
              Contribute verified syllabus guides, lecture notes, or past papers. Classify by regional curriculum to help peers find materials quickly.
            </p>
          </div>
        </div>

        {/* Step 1 Card: Regional & Academic Classification */}
        <div className="bg-white rounded-2xl border border-[#c7cad5] shadow-sm p-5 sm:p-7 space-y-5 w-full">
          <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-[#e6e8ec]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#ffd02f] border border-[#fde89c] flex items-center justify-center text-[#1c1c1e] shadow-2xs">
                <FolderUp className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-[#1c1c1e]">
                  Curriculum & Structure Classification
                </h2>
                <p className="text-xs text-[#6a6d7c]">Select region, curriculum level, and subject stream</p>
              </div>
            </div>
            <span className="text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-[#ffd02f] text-[#1c1c1e] shadow-2xs">
              Step 1 of 2
            </span>
          </div>

          {isLoading ? (
            <MiroLoader message="Fetching Academic Hierarchy..." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
              {/* Region (Yellow tint accent) */}
              <div className="space-y-1.5 p-3 rounded-xl bg-[#fff8e0]/60 border border-[#fde89c]">
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#746019]">
                  1. Region / Board <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.region}
                  onChange={(e) => handleInputChange("region", e.target.value)}
                  className="w-full h-11 px-3 bg-[#fff4c4]/40 border border-[#fde89c] rounded-lg text-[#1c1c1e] font-semibold focus:outline-none focus:border-2 focus:border-[#ffd02f] transition-all text-xs cursor-pointer"
                >
                  <option value="">Choose region / board...</option>
                  {regionOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category 1 (Teal tint accent) */}
              <div className="space-y-1.5 p-3 rounded-xl bg-[#c3faf5]/20 border border-[#9eece4]">
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#187574]">
                  2. Category 1 <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category1}
                  onChange={(e) => handleInputChange("category1", e.target.value)}
                  disabled={!formData.region}
                  className={`w-full h-11 px-3 bg-[#c3faf5]/40 border border-[#9eece4] rounded-lg text-[#1c1c1e] font-semibold focus:outline-none focus:border-2 focus:border-[#0fbcb0] transition-all text-xs cursor-pointer ${
                    !formData.region ? "opacity-50 cursor-not-allowed bg-gray-50" : ""
                  }`}
                >
                  <option value="">Choose category 1...</option>
                  {category1Options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category 2 (Rose tint accent) */}
              <div className="space-y-1.5 p-3 rounded-xl bg-[#ffd8f4]/20 border border-[#f3bee5]">
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#86296b]">
                  3. Category 2 <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category2}
                  onChange={(e) => handleInputChange("category2", e.target.value)}
                  disabled={!formData.category1}
                  className={`w-full h-11 px-3 bg-[#ffd8f4]/35 border border-[#f3bee5] rounded-lg text-[#1c1c1e] font-semibold focus:outline-none focus:border-2 focus:border-[#86296b] transition-all text-xs cursor-pointer ${
                    !formData.category1 ? "opacity-50 cursor-not-allowed bg-gray-50" : ""
                  }`}
                >
                  <option value="">Choose category 2...</option>
                  {category2Options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category 3 (Orange tint accent) */}
              <div className="space-y-1.5 p-3 rounded-xl bg-[#ffe6cd]/25 border border-[#fcd0a1]">
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#7c3a00]">
                  4. Category 3 <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category3}
                  onChange={(e) => handleInputChange("category3", e.target.value)}
                  disabled={!formData.category2}
                  className={`w-full h-11 px-3 bg-[#ffe6cd]/40 border border-[#fcd0a1] rounded-lg text-[#1c1c1e] font-semibold focus:outline-none focus:border-2 focus:border-[#fcb900] transition-all text-xs cursor-pointer ${
                    !formData.category2 ? "opacity-50 cursor-not-allowed bg-gray-50" : ""
                  }`}
                >
                  <option value="">Choose category 3...</option>
                  {category3Options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category 4 (Lavender tint accent) */}
              <div className="space-y-1.5 p-3 rounded-xl bg-[#f5f3ff] border border-[#ddd6fe]">
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#4262ff]">
                  5. Cat 4 (Optional)
                </label>
                <select
                  value={formData.category4}
                  onChange={(e) => handleInputChange("category4", e.target.value)}
                  disabled={!formData.category3 || category4Options.length === 0}
                  className={`w-full h-11 px-3 bg-[#f5f3ff] border border-[#ddd6fe] rounded-lg text-[#1c1c1e] font-semibold focus:outline-none focus:border-2 focus:border-[#4262ff] transition-all text-xs cursor-pointer ${
                    !formData.category3 || category4Options.length === 0 ? "opacity-50 cursor-not-allowed bg-gray-50" : ""
                  }`}
                >
                  <option value="">Choose category 4...</option>
                  {category4Options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Step 2 Card: File Details & Upload Form */}
        <AnimatePresence>
          {formData.category3 && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-[#c7cad5] shadow-sm p-5 sm:p-7 space-y-6 w-full"
            >
              <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-[#e6e8ec]">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#c3faf5] border border-[#9eece4] flex items-center justify-center text-[#187574] shadow-2xs">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-extrabold text-[#1c1c1e]">
                      Resource Details & Attachment
                    </h2>
                    <p className="text-xs text-[#6a6d7c]">Add document metadata, files, and tags</p>
                  </div>
                </div>
                <span className="text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-[#c3faf5] text-[#187574] shadow-2xs">
                  Step 2 of 2
                </span>
              </div>

              <form id="userUploadFileForm" onSubmit={handleSubmit} className="space-y-6">
                {/* Creator & Format Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#6a6d7c]">
                      Contributor / Author Name
                    </label>
                    <input
                      type="text"
                      value={formData.fileCreatorName}
                      onChange={(e) => handleInputChange("fileCreatorName", e.target.value)}
                      placeholder="e.g. Student Name, Study Group, or Department"
                      className="w-full h-11 min-h-[44px] px-4 bg-[#f7f8fa] border border-[#c7cad5] rounded-xl text-[#1c1c1e] placeholder-[#8e91a0] focus:bg-white focus:outline-none focus:border-[#1c1c1e] transition-all text-xs font-semibold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#6a6d7c]">
                      Document Format
                    </label>
                    <select
                      value={formData.fileType}
                      onChange={(e) => handleInputChange("fileType", e.target.value)}
                      className="w-full h-11 min-h-[44px] px-3.5 bg-[#f7f8fa] border border-[#c7cad5] rounded-xl text-[#1c1c1e] font-semibold focus:bg-white focus:outline-none focus:border-[#1c1c1e] transition-all text-xs cursor-pointer"
                    >
                      <option value="">Select File Format (PDF, DOCX, etc.)</option>
                      {fileTypeOptions.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Applicable Academic Session & Year */}
                <div className="rounded-2xl border border-[#fcd0a1] bg-[#ffe6cd]/25 p-4 sm:p-5 space-y-3">
                  <p className="text-[11px] font-extrabold uppercase tracking-wider text-[#7c3a00]">
                    Applicable Academic Session & Year
                  </p>
                  <div className="flex flex-wrap gap-4 sm:gap-6">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#1c1c1e]">
                      <input
                        type="radio"
                        name="addYears"
                        value="none"
                        checked={formData.addYears === "none"}
                        onChange={() => handleInputChange("addYears", "none")}
                        className="h-4 w-4 text-[#1c1c1e] focus:ring-[#ffd02f]"
                      />
                      <span>None</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#1c1c1e]">
                      <input
                        type="radio"
                        name="addYears"
                        value="academicYear"
                        checked={formData.addYears === "academicYear"}
                        onChange={() => handleInputChange("addYears", "academicYear")}
                        className="h-4 w-4 text-[#1c1c1e] focus:ring-[#ffd02f]"
                      />
                      <span>Academic Session (e.g. 2024-2025)</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#1c1c1e]">
                      <input
                        type="radio"
                        name="addYears"
                        value="yearCalendar"
                        checked={formData.addYears === "yearCalendar"}
                        onChange={() => handleInputChange("addYears", "yearCalendar")}
                        className="h-4 w-4 text-[#1c1c1e] focus:ring-[#ffd02f]"
                      />
                      <span>Calendar Year</span>
                    </label>
                  </div>

                  {formData.addYears === "academicYear" && (
                    <div className="pt-2 flex flex-wrap gap-2 items-center">
                      <select
                        value={formData.academicYear}
                        onChange={(e) => handleInputChange("academicYear", e.target.value)}
                        className="h-10 px-3 bg-white border border-[#fcd0a1] rounded-lg text-xs font-bold text-[#1c1c1e]"
                      >
                        <option value="">Select Academic Year</option>
                        {academicYearOptions.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {formData.addYears === "yearCalendar" && (
                    <div className="pt-2 flex flex-wrap gap-2 items-center">
                      <input
                        type="number"
                        min="1990"
                        max="2099"
                        value={formData.academicYear}
                        onChange={(e) => handleInputChange("academicYear", e.target.value)}
                        placeholder="e.g. 2024"
                        className="h-10 px-3 bg-white border border-[#fcd0a1] rounded-lg text-xs font-bold text-[#1c1c1e] w-36"
                      />
                    </div>
                  )}
                </div>

                {/* File Title */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#6a6d7c]">
                    Resource / Document Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.fileTitle}
                    onChange={(e) => handleInputChange("fileTitle", e.target.value)}
                    placeholder="e.g. Complete Engineering Mathematics Unit 1 Notes"
                    className="w-full h-11 min-h-[44px] px-4 bg-[#f7f8fa] border border-[#c7cad5] rounded-xl text-[#1c1c1e] placeholder-[#8e91a0] focus:bg-white focus:outline-none focus:border-[#1c1c1e] transition-all text-xs font-semibold"
                    required
                  />
                </div>

                {/* Rich Editor for Description */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#6a6d7c]">
                    Document Summary & Content Overview
                  </label>
                  <div className="border border-[#c7cad5] rounded-2xl overflow-hidden bg-white shadow-2xs">
                    <FileEditor
                      value={formData.fileDescription}
                      onChange={(content) => handleInputChange("fileDescription", content)}
                    />
                  </div>
                </div>

                {/* Upload Method Toggle & File Upload Area */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-3">
                    <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#6a6d7c]">
                      Resource Method:
                    </label>
                    <div className="inline-flex rounded-full p-1 bg-[#f0f1f4] border border-[#c7cad5]">
                      <button
                        type="button"
                        onClick={() => handleInputChange("uploadMethod", "file")}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                          formData.uploadMethod === "file"
                            ? "bg-[#1c1c1e] text-[#ffd02f] shadow-xs"
                            : "text-[#6a6d7c] hover:text-[#1c1c1e]"
                        }`}
                      >
                        Upload Document File
                      </button>
                      <button
                        type="button"
                        onClick={() => handleInputChange("uploadMethod", "link")}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                          formData.uploadMethod === "link"
                            ? "bg-[#1c1c1e] text-[#ffd02f] shadow-xs"
                            : "text-[#6a6d7c] hover:text-[#1c1c1e]"
                        }`}
                      >
                        External Resource Link
                      </button>
                    </div>
                  </div>

                  {formData.uploadMethod === "file" ? (
                    <div className="space-y-2">
                      <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#6a6d7c]">
                        Upload Document <span className="text-red-500">*</span>
                      </label>
                      <div className="relative border-2 border-dashed border-[#c7cad5] hover:border-[#1c1c1e] rounded-2xl p-6 text-center bg-[#f7f8fa] hover:bg-white transition-all cursor-pointer group">
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.ppt,.pptx"
                          onChange={handleFileChange}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                        />
                        {formData.selectedFile ? (
                          <div className="flex items-center justify-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#c3faf5] text-[#187574] flex items-center justify-center">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div className="text-left">
                              <p className="text-xs font-bold text-[#1c1c1e]">
                                {formData.selectedFile.name}
                              </p>
                              <p className="text-[10px] text-[#6a6d7c]">
                                {(formData.selectedFile.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleRemoveFile()
                              }}
                              className="z-20 p-1.5 rounded-full hover:bg-red-50 text-red-500"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-1.5">
                            <div className="w-10 h-10 rounded-xl bg-[#ffd02f] text-[#1c1c1e] flex items-center justify-center mx-auto shadow-2xs group-hover:scale-105 transition-transform">
                              <Upload className="w-5 h-5" />
                            </div>
                            <p className="text-xs font-bold text-[#1c1c1e]">
                              Click to choose a file or drag and drop here
                            </p>
                            <p className="text-[10px] text-[#6a6d7c]">
                              PDF, DOC, DOCX, PPT, PPTX (up to 50MB)
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#6a6d7c]">
                        External URL / Cloud Storage Link <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8e91a0] pointer-events-none" />
                        <input
                          type="url"
                          value={formData.externalLink}
                          onChange={(e) => handleInputChange("externalLink", e.target.value)}
                          placeholder="https://drive.google.com/..."
                          className="w-full h-11 min-h-[44px] pl-10 pr-4 bg-[#f7f8fa] border border-[#c7cad5] rounded-xl text-[#1c1c1e] placeholder-[#8e91a0] focus:bg-white focus:outline-none focus:border-[#1c1c1e] transition-all text-xs font-semibold"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Cover Thumbnail Image */}
                <div className="space-y-2 pt-2">
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#6a6d7c]">
                    Cover Thumbnail Preview (Optional)
                  </label>
                  <div className="relative border-2 border-dashed border-[#c7cad5] hover:border-[#1c1c1e] rounded-2xl p-5 text-center bg-[#f7f8fa] hover:bg-white transition-all cursor-pointer group">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                    />
                    {formData.selectedImage ? (
                      <div className="flex items-center justify-center gap-3">
                        <img
                          src={URL.createObjectURL(formData.selectedImage)}
                          alt="Cover Preview"
                          className="w-14 h-14 rounded-lg object-cover border border-[#c7cad5]"
                        />
                        <div className="text-left">
                          <p className="text-xs font-bold text-[#1c1c1e]">
                            {formData.selectedImage.name}
                          </p>
                          <p className="text-[10px] text-[#6a6d7c]">Cover thumbnail selected</p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRemoveImage()
                          }}
                          className="z-20 p-1.5 rounded-full hover:bg-red-50 text-red-500"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <ImageIcon className="w-6 h-6 text-[#8e91a0] mx-auto group-hover:scale-105 transition-transform" />
                        <p className="text-xs font-bold text-[#1c1c1e]">Add custom cover image</p>
                        <p className="text-[10px] text-[#6a6d7c]">PNG, JPG, WebP supported</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Miro Sticky Note Tag System */}
                <div className="space-y-2 pt-2">
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#6a6d7c]">
                    Resource Keywords & Tags
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={formData.currentTag}
                      onChange={(e) => handleInputChange("currentTag", e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Add topic tags (press Enter or Click Add)"
                      className="flex-1 h-11 min-h-[44px] px-4 bg-[#f7f8fa] border border-[#c7cad5] rounded-xl text-[#1c1c1e] placeholder-[#8e91a0] focus:bg-white focus:outline-none focus:border-[#1c1c1e] text-xs font-semibold"
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      className="px-5 h-11 rounded-xl bg-[#1c1c1e] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#2c2c34] transition-all cursor-pointer"
                    >
                      Add Tag
                    </button>
                  </div>

                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {formData.tags.map((tag, idx) => {
                        const style = TAG_COLOR_PALETTES[idx % TAG_COLOR_PALETTES.length]
                        return (
                          <span
                            key={idx}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${style.bg} ${style.text} ${style.border} shadow-2xs`}
                          >
                            <span>#{tag}</span>
                            <button
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="hover:opacity-75 cursor-pointer"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Discussion Switch */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-[#f7f8fa] border border-[#c7cad5]">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#fff4c4] text-[#746019] flex items-center justify-center">
                      <Eye className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-[#1c1c1e]">Enable Peer Discussion</p>
                      <p className="text-[11px] text-[#6a6d7c]">
                        Allow other students to ask questions and comment on this resource
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleInputChange("showCommentBox", !formData.showCommentBox)}
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                      formData.showCommentBox ? "bg-[#1c1c1e]" : "bg-[#c7cad5]"
                    }`}
                  >
                    <div
                      className={`bg-[#ffd02f] w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        formData.showCommentBox ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Form Action Controls */}
                <div className="pt-4 border-t border-[#e6e8ec] flex flex-col sm:flex-row items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => navigate("/filter-user-file")}
                    className="w-full sm:w-auto px-6 py-3 rounded-full border border-[#c7cad5] bg-white text-[#1c1c1e] text-xs font-bold uppercase tracking-wider hover:bg-[#ebecf0] transition-all cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#ffd02f] hover:bg-[#fcb900] disabled:bg-[#f7f8fa] disabled:border disabled:border-[#c7cad5] disabled:text-[#8e92a4] text-[#1c1c1e] text-xs font-black uppercase tracking-wider shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-[#1c1c1e] border-t-transparent rounded-full animate-spin" />
                        <span>Publishing Resource...</span>
                      </>
                    ) : (
                      <>
                        <span>Publish Resource Document</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
