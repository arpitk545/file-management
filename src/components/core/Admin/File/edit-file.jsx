"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Plus, FileText, ImageIcon, Eye, EyeOff, Save, Upload, LinkIcon, Trash2, ArrowLeft, MapPin, Sparkles, Home } from "lucide-react"
import { getFileById, GetFileRegion, updateFile, deleteFile } from "../../../../services/operations/filesAPI"
import toast from "react-hot-toast"
import { useNavigate, useParams } from "react-router-dom"
import FileEditor from "./File-editor"

const MiroLoader = ({ message = "Loading file data..." }) => (
  <div className="flex flex-col items-center justify-center py-16 gap-3">
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

const EditFile = () => {
  const navigate = useNavigate()
  const { id } = useParams()
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
    fileUrl: "",
    imageUrl: [],
    tags: [],
    currentTag: "",
    showCommentBox: true,
    addYears: "none",
    academicYear: "",
  })

  const [additionalYears, setAdditionalYears] = useState([])
  const [additionalAcademicYears, setAdditionalAcademicYears] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [regions, setRegions] = useState([])
  const [regionOptions, setRegionOptions] = useState([])
  const [category1Options, setCategory1Options] = useState([])
  const [category2Options, setCategory2Options] = useState([])
  const [category3Options, setCategory3Options] = useState([])
  const [category4Options, setCategory4Options] = useState([])
  const [category5Options, setCategory5Options] = useState([])
  const [showYearCalendar, setShowYearCalendar] = useState(false)
  const [showAcademicYearDropdown, setShowAcademicYearDropdown] = useState(false)

  const startYear = 2000
  const endYear = 2050
  const academicYearOptions = Array.from({ length: endYear - startYear + 1 }, (_, i) => {
    const year = startYear + i
    return `${year}-${year + 1}`
  })
  const fileTypeOptions = ["PDF", "DOC", "DOCX", "XLSX", "PPTX", "TXT", "ZIP", "Other"]

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const regionsResponse = await GetFileRegion()
        const regionsData = regionsResponse?.data || []
        const formattedRegions = regionsData.map((region) => ({
          value: region._id,
          label: region.name,
        }))
        setRegionOptions(formattedRegions)
        setRegions(regionsData)

        const fileResponse = await getFileById(id)
        if (fileResponse?.success) {
          const existingData = fileResponse.file

          setFormData({
            ...existingData,
            tags: existingData.tags || [],
            region: regionsData.find((r) => r.name === existingData.region)?._id || existingData.region,
            fileUrl: existingData.fileUrl || "",
            imageUrl: existingData.imageUrl || [],
          })

          setAdditionalYears(
            (existingData.additionalYears || []).map((year) => ({
              id: Date.now() + Math.random(),
              year,
            }))
          )
          setAdditionalAcademicYears(
            (existingData.additionalAcademicYears || []).map((year) => ({
              id: Date.now() + Math.random(),
              year,
            }))
          )

          const selectedRegion = regionsData.find(
            (r) => r._id === existingData.region || r.name === existingData.region
          )
          if (selectedRegion) {
            setCategory1Options(selectedRegion.category1?.map((cat) => ({ value: cat.name, label: cat.name })) || [])
            const selectedCat1 = selectedRegion.category1?.find((cat) => cat.name === existingData.category1)
            setCategory2Options(selectedCat1?.category2?.map((cat) => ({ value: cat.name, label: cat.name })) || [])
            const selectedCat2 = selectedCat1?.category2?.find((cat) => cat.name === existingData.category2)
            setCategory3Options(selectedCat2?.category3?.map((cat) => ({ value: cat.name, label: cat.name })) || [])
            const selectedCat3 = selectedCat2?.category3?.find((cat) => cat.name === existingData.category3)
            setCategory4Options(selectedCat3?.category4?.map((cat) => ({ value: cat.name, label: cat.name })) || [])
            const selectedCat4 = selectedCat3?.category4?.find((cat) => cat.name === existingData.category4)
            setCategory5Options(selectedCat4?.category5?.map((cat) => ({ value: cat.name, label: cat.name })) || [])
          }
        } else {
          toast.error("Failed to fetch file data")
        }
      } catch (error) {
        console.error("Error loading data:", error)
        toast.error("Failed to load data")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  // Update Category 1 options when Region changes
  useEffect(() => {
    const selectedRegion = regions.find((r) => r._id === formData.region)
    const cat1Options =
      selectedRegion?.category1?.map((cat) => ({
        value: cat.name,
        label: cat.name,
      })) || []
    setCategory1Options(cat1Options)
  }, [formData.region, regions])

  // Update Category 2 options when Category 1 changes
  useEffect(() => {
    const selectedRegion = regions.find((r) => r._id === formData.region)
    const selectedCat1 = selectedRegion?.category1?.find((cat) => cat.name === formData.category1)
    const cat2Options =
      selectedCat1?.category2?.map((cat) => ({
        value: cat.name,
        label: cat.name,
      })) || []
    setCategory2Options(cat2Options)
  }, [formData.category1, formData.region, regions])

  // Update Category 3 options when Category 2 changes
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
  }, [formData.category2, formData.category1, formData.region, regions])

  // Update Category 4 options when Category 3 changes
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
  }, [formData.category3, formData.category2, formData.category1, formData.region, regions])

  // Update Category 5 options when Category 4 changes
  useEffect(() => {
    const selectedRegion = regions.find((r) => r._id === formData.region)
    const selectedCat1 = selectedRegion?.category1?.find((cat) => cat.name === formData.category1)
    const selectedCat2 = selectedCat1?.category2?.find((cat) => cat.name === formData.category2)
    const selectedCat3 = selectedCat2?.category3?.find((cat) => cat.name === formData.category3)
    const selectedCat4 = selectedCat3?.category4?.find((cat) => cat.name === formData.category4)
    const cat5Options =
      selectedCat4?.category5?.map((cat) => ({
        value: cat.name,
        label: cat.name,
      })) || []
    setCategory5Options(cat5Options)
  }, [formData.category4, formData.category3, formData.category2, formData.category1, formData.region, regions])

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileUpload = (event, type) => {
    const file = event.target.files[0]
    if (file) {
      setFormData((prev) => ({ ...prev, [type]: file }))
    }
  }

  const addTag = () => {
    if (formData.currentTag.trim() !== "" && !formData.tags.includes(formData.currentTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, prev.currentTag.trim()],
        currentTag: "",
      }))
    }
  }

  const removeTag = (index) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index),
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
    setAdditionalYears((prev) => prev.map((item) => (item.id === id ? { ...item, year: value } : item)))
  }

  const updateAdditionalAcademicYear = (id, value) => {
    setAdditionalAcademicYears((prev) => prev.map((item) => (item.id === id ? { ...item, year: value } : item)))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const formDataToSend = new FormData()

      const safeTags = Array.isArray(formData.tags)
        ? formData.tags
        : typeof formData.tags === "string"
          ? JSON.parse(formData.tags)
          : []

      Object.entries(formData).forEach(([key, value]) => {
        if (
          key !== "selectedFile" &&
          key !== "selectedImage" &&
          key !== "currentTag" &&
          key !== "region" &&
          key !== "fileUrl" &&
          key !== "imageUrl" &&
          key !== "tags" &&
          key !== "additionalYears" &&
          key !== "additionalAcademicYears"
        ) {
          if (Array.isArray(value)) {
            value.forEach((v) => formDataToSend.append(key, v))
          } else {
            formDataToSend.append(key, value)
          }
        }
      })

      const selectedRegion = regions.find((r) => r._id === formData.region)
      if (selectedRegion?.name) {
        formDataToSend.append("region", selectedRegion.name)
      }

      if (formData.selectedFile) {
        formDataToSend.append("file", formData.selectedFile)
      }

      if (formData.selectedImage) {
        formDataToSend.append("image", formData.selectedImage)
      }

      safeTags.forEach((tag) => {
        formDataToSend.append("tags", tag)
      })

      additionalYears.forEach((item) => {
        if (item?.year) {
          formDataToSend.append("additionalYears", item.year)
        }
      })

      additionalAcademicYears.forEach((item) => {
        if (item?.year) {
          formDataToSend.append("additionalAcademicYears", item.year)
        }
      })

      await updateFile(id, formDataToSend)
      toast.success("File updated successfully!")
      navigate("/filter-file")
    } catch (error) {
      console.error("Error updating file:", error)
      toast.error(error?.message || "Failed to update file")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this file? This action cannot be undone.")) {
      try {
        setIsDeleting(true)
        await deleteFile(id)
        toast.success("File deleted successfully!")
        navigate("/filter-file")
      } catch (error) {
        console.error("Error deleting file:", error)
        toast.error("Failed to delete file")
      } finally {
        setIsDeleting(false)
      }
    }
  }

  const FileUploadDropzone = ({ label, onFileSelect, selectedFile, accept, icon: Icon, initialFileUrl, onClear, placeholder = "Drag & drop or click to replace" }) => {
    const fileInputRef = useRef(null)
    const isFileSelected = selectedFile || initialFileUrl

    const handleClear = (e) => {
      e.stopPropagation()
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
      onClear()
    }

    return (
      <div className="space-y-1.5">
        <label className="block text-xs font-bold uppercase tracking-wider text-[#555a6a]">{label}</label>
        <div className="relative">
          <input
            type="file"
            ref={fileInputRef}
            accept={accept}
            onChange={onFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <div
            className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all cursor-pointer ${
              isFileSelected ? "border-[#0fbcb0] bg-[#c3faf5]/20" : "border-[#c7cad5] bg-white hover:border-[#4262ff] hover:bg-[#f7f8fa]"
            }`}
          >
            {isFileSelected && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-white text-red-500 hover:bg-red-50 border border-red-200 z-20 shadow-xs transition-transform active:scale-95"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <div className="flex flex-col items-center gap-3">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-xs border ${
                  isFileSelected
                    ? "bg-white border-[#9eece4] text-[#0fbcb0]"
                    : "bg-[#f7f8fa] border-[#c7cad5] text-[#555a6a]"
                }`}
              >
                <Icon className="w-6 h-6" />
              </div>
              {isFileSelected ? (
                <div className="space-y-1">
                  <p className="text-sm font-bold text-[#1c1c1e] truncate max-w-sm mx-auto">
                    {selectedFile?.name || (initialFileUrl ? initialFileUrl.split("/").pop() : "File attached")}
                  </p>
                  <p className="text-xs text-[#0fbcb0] font-bold">✓ File attached</p>
                  {label.includes("Cover") && (
                    <img
                      src={selectedFile ? URL.createObjectURL(selectedFile) : initialFileUrl}
                      alt="Preview"
                      className="mt-2 max-h-28 mx-auto rounded-lg border border-[#9eece4] object-contain bg-white"
                    />
                  )}
                </div>
              ) : (
                <div>
                  <p className="text-sm font-bold text-[#1c1c1e]">{placeholder}</p>
                  <p className="text-xs text-[#555a6a] mt-0.5">Supported formats: {accept}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f8fa] flex items-center justify-center p-6">
        <MiroLoader message="Loading file resource data..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#1c1c1e] py-6 sm:py-8 px-4 sm:px-6 lg:px-8 xl:px-12 w-full">
      <div className="w-full space-y-6">
        
        {/* Header Bar (Posts Pattern) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e0e2e8]">
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => navigate("/dashboard")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#c7cad5] text-[#1c1c1e] hover:bg-[#f7f8fa] hover:border-[#1c1c1e] transition-all text-sm font-semibold shadow-sm active:scale-95 cursor-pointer"
            >
              <Home className="w-4 h-4 text-blue-600" />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => navigate("/filter-file")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#c7cad5] text-[#1c1c1e] hover:bg-[#f7f8fa] hover:border-[#1c1c1e] transition-all text-sm font-semibold shadow-sm active:scale-95 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Files</span>
            </button>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#ffd02f] text-[#1c1c1e]">
              FILE STUDIO
            </span>
            <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#ffd8f4] text-[#86296b] border border-[#f3bee5]">
              EDIT RESOURCE
            </span>
          </div>
          <button
            onClick={() => navigate("/create-file")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1c1c1e] text-white hover:bg-[#2c2c34] text-sm font-bold transition-all shadow-sm self-start sm:self-auto active:scale-98"
          >
            <Plus className="w-4 h-4 text-[#ffd02f]" />
            <span>New File</span>
          </button>
        </div>

        {/* Page Title */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#1c1c1e]">
            Edit File Resource
          </h1>
          <p className="text-sm sm:text-base text-[#555a6a]">
            Modify taxonomy classification, update metadata, and replace attached files or preview images.
          </p>
        </div>

        {/* Step 1 Card: Taxonomy Classification (Lavender Palette) */}
        <div className="bg-[#f5f3ff] rounded-2xl border-2 border-[#ddd6fe] shadow-sm p-5 sm:p-7 space-y-4 w-full">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-[#4262ff] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                <MapPin className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-[#1c1c1e]">Taxonomy Hierarchy</h2>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-white text-[#4262ff] border border-[#ddd6fe]">
              Step 1 of 2
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
            {/* Region (Yellow) */}
            <div className="space-y-1.5 p-3 rounded-xl bg-white border border-[#ddd6fe]">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#746019]">
                1. Region <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.region}
                onChange={(e) => handleInputChange("region", e.target.value)}
                className="w-full h-11 px-3 bg-[#fff8e0]/60 border border-[#fde89c] rounded-lg text-[#1c1c1e] font-semibold focus:outline-none focus:border-2 focus:border-[#4262ff] transition-all text-sm"
              >
                <option value="">Choose region...</option>
                {regionOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Category 1 (Teal) */}
            <div className="space-y-1.5 p-3 rounded-xl bg-white border border-[#ddd6fe]">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#187574]">
                2. Category 1 <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.category1}
                onChange={(e) => handleInputChange("category1", e.target.value)}
                disabled={category1Options.length === 0}
                className={`w-full h-11 px-3 bg-[#c3faf5]/40 border border-[#9eece4] rounded-lg text-[#1c1c1e] font-semibold focus:outline-none focus:border-2 focus:border-[#0fbcb0] transition-all text-sm ${
                  category1Options.length === 0 ? "opacity-50 cursor-not-allowed bg-gray-50" : ""
                }`}
              >
                <option value="">Choose category 1...</option>
                {category1Options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Category 2 (Rose) */}
            <div className="space-y-1.5 p-3 rounded-xl bg-white border border-[#ddd6fe]">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#86296b]">
                3. Category 2 <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.category2}
                onChange={(e) => handleInputChange("category2", e.target.value)}
                disabled={category2Options.length === 0}
                className={`w-full h-11 px-3 bg-[#ffd8f4]/35 border border-[#f3bee5] rounded-lg text-[#1c1c1e] font-semibold focus:outline-none focus:border-2 focus:border-[#86296b] transition-all text-sm ${
                  category2Options.length === 0 ? "opacity-50 cursor-not-allowed bg-gray-50" : ""
                }`}
              >
                <option value="">Choose category 2...</option>
                {category2Options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Category 3 (Orange) */}
            <div className="space-y-1.5 p-3 rounded-xl bg-white border border-[#ddd6fe]">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#7c3a00]">
                4. Category 3 <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.category3}
                onChange={(e) => handleInputChange("category3", e.target.value)}
                disabled={category3Options.length === 0}
                className={`w-full h-11 px-3 bg-[#ffe6cd]/40 border border-[#fcd0a1] rounded-lg text-[#1c1c1e] font-semibold focus:outline-none focus:border-2 focus:border-[#ff7347] transition-all text-sm ${
                  category3Options.length === 0 ? "opacity-50 cursor-not-allowed bg-gray-50" : ""
                }`}
              >
                <option value="">Choose category 3...</option>
                {category3Options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Category 4 (Lavender) */}
            <div className="space-y-1.5 p-3 rounded-xl bg-white border border-[#ddd6fe]">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#4262ff]">
                5. Cat 4 (Optional)
              </label>
              <select
                value={formData.category4}
                onChange={(e) => handleInputChange("category4", e.target.value)}
                disabled={category4Options.length === 0}
                className={`w-full h-11 px-3 bg-[#f5f3ff] border border-[#ddd6fe] rounded-lg text-[#1c1c1e] font-semibold focus:outline-none focus:border-2 focus:border-[#4262ff] transition-all text-sm ${
                  category4Options.length === 0 ? "opacity-50 cursor-not-allowed bg-gray-50" : ""
                }`}
              >
                <option value="">Choose category 4...</option>
                {category4Options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Step 2 Card: Details & Form */}
        <div className="bg-white rounded-2xl border border-[#e0e2e8] shadow-sm p-5 sm:p-7 space-y-6 w-full">
          <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-[#e0e2e8]">
            <div className="flex items-center gap-2.5">
              <FileText className="w-5 h-5 text-[#0fbcb0]" />
              <h2 className="text-lg sm:text-xl font-bold text-[#1c1c1e]">File Properties & Attachments</h2>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#c3faf5] text-[#187574]">
              Step 2 of 2
            </span>
          </div>

          <form id="editFileForm" onSubmit={handleSubmit} className="space-y-6">
            {/* Metadata Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#555a6a]">
                  File Creator / Publisher
                </label>
                <input
                  type="text"
                  value={formData.fileCreatorName}
                  onChange={(e) => handleInputChange("fileCreatorName", e.target.value)}
                  placeholder="Enter file creator name"
                  className="w-full h-12 px-4 bg-white border border-[#c7cad5] rounded-xl text-[#1c1c1e] placeholder-[#8e91a0] focus:outline-none focus:border-2 focus:border-[#4262ff] transition-all text-sm font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#555a6a]">
                  Document Format
                </label>
                <select
                  value={formData.fileType}
                  onChange={(e) => handleInputChange("fileType", e.target.value)}
                  className="w-full h-12 px-3 bg-white border border-[#c7cad5] rounded-xl text-[#1c1c1e] font-semibold focus:outline-none focus:border-2 focus:border-[#4262ff] transition-all text-sm"
                >
                  <option value="">Select File Format</option>
                  {fileTypeOptions.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Applicable Year Card */}
            <div className="rounded-xl border border-[#fcd0a1] bg-[#ffe6cd]/25 p-4 sm:p-5 space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-[#7c3a00]">
                Applicable Academic Session & Year
              </p>
              <div className="flex flex-wrap gap-4 sm:gap-6">
                <label className="flex items-center gap-2 cursor-pointer text-xs sm:text-sm font-semibold text-[#1c1c1e]">
                  <input
                    type="radio"
                    name="addYears"
                    value="none"
                    checked={formData.addYears === "none"}
                    onChange={() => {
                      handleInputChange("addYears", "none")
                      setShowYearCalendar(false)
                      setShowAcademicYearDropdown(false)
                    }}
                    className="h-4 w-4 text-[#4262ff]"
                  />
                  <span>None</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs sm:text-sm font-semibold text-[#1c1c1e]">
                  <input
                    type="radio"
                    name="addYears"
                    value="year"
                    checked={formData.addYears === "year"}
                    onChange={() => {
                      handleInputChange("addYears", "year")
                      setShowYearCalendar(true)
                      setShowAcademicYearDropdown(false)
                    }}
                    className="h-4 w-4 text-[#4262ff]"
                  />
                  <span>Single Year</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs sm:text-sm font-semibold text-[#1c1c1e]">
                  <input
                    type="radio"
                    name="addYears"
                    value="academic"
                    checked={formData.addYears === "academic"}
                    onChange={() => {
                      handleInputChange("addYears", "academic")
                      setShowAcademicYearDropdown(true)
                      setShowYearCalendar(false)
                    }}
                    className="h-4 w-4 text-[#4262ff]"
                  />
                  <span>Academic Session</span>
                </label>
              </div>

              {/* Single Year Select */}
              {formData.addYears === "year" && showYearCalendar && (
                <div className="space-y-1.5 pt-2">
                  <select
                    onChange={(e) => {
                      const val = e.target.value
                      if (val) setAdditionalYears((prev) => [...prev, { id: Date.now(), year: val }])
                    }}
                    className="w-full sm:w-80 h-11 px-3 bg-white border border-[#c7cad5] rounded-xl text-sm font-semibold"
                  >
                    <option value="">Select Year...</option>
                    {Array.from({ length: 11 }, (_, i) => 2020 + i).map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                  {additionalYears.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {additionalYears.map((item) => (
                        <div key={item.id} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#ddd6fe] text-xs font-bold">
                          <input
                            type="text"
                            value={item.year}
                            onChange={(e) => updateAdditionalYear(item.id, e.target.value)}
                            className="w-16 text-xs font-bold text-[#1c1c1e] outline-none"
                          />
                          <button type="button" onClick={() => removeYear(item.id)} className="text-red-500 hover:text-red-700">
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Academic Session Select */}
              {formData.addYears === "academic" && showAcademicYearDropdown && (
                <div className="space-y-1.5 pt-2">
                  <select
                    onChange={(e) => {
                      const val = e.target.value
                      if (val) setAdditionalAcademicYears((prev) => [...prev, { id: Date.now(), year: val }])
                    }}
                    className="w-full sm:w-80 h-11 px-3 bg-white border border-[#c7cad5] rounded-xl text-sm font-semibold"
                  >
                    <option value="">Select Session...</option>
                    {academicYearOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                  {additionalAcademicYears.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {additionalAcademicYears.map((item) => (
                        <div key={item.id} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#f3bee5] text-xs font-bold">
                          <input
                            type="text"
                            value={item.year}
                            onChange={(e) => updateAdditionalAcademicYear(item.id, e.target.value)}
                            className="w-24 text-xs font-bold text-[#1c1c1e] outline-none"
                          />
                          <button type="button" onClick={() => removeAcademicYear(item.id)} className="text-red-500 hover:text-red-700">
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* File Title */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#555a6a]">
                File Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.fileTitle}
                onChange={(e) => handleInputChange("fileTitle", e.target.value)}
                placeholder="Enter file title"
                className="w-full h-12 px-4 bg-white border border-[#c7cad5] rounded-xl text-[#1c1c1e] placeholder-[#8e91a0] focus:outline-none focus:border-2 focus:border-[#4262ff] transition-all text-sm font-semibold"
              />
            </div>

            {/* Tags */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#555a6a]">Tags & Keywords</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.currentTag}
                  onChange={(e) => handleInputChange("currentTag", e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type tag & press enter"
                  className="flex-1 h-12 px-4 bg-white border border-[#c7cad5] rounded-xl text-[#1c1c1e] placeholder-[#8e91a0] focus:outline-none focus:border-2 focus:border-[#4262ff] transition-all text-sm font-medium"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="h-12 px-6 rounded-full bg-[#1c1c1e] text-white hover:bg-[#2c2c34] font-bold text-sm transition-all flex items-center justify-center gap-1 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add</span>
                </button>
              </div>

              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {formData.tags.map((tag, index) => {
                    const palette = TAG_COLOR_PALETTES[index % TAG_COLOR_PALETTES.length]
                    return (
                      <span
                        key={index}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${palette.bg} ${palette.text} border ${palette.border}`}
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => removeTag(index)}
                          className="p-0.5 hover:bg-black/10 rounded-full"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )
                  })}
                </div>
              )}
            </div>

            {/* File Description */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#555a6a]">
                File Description & Notes
              </label>
              <div className="rounded-xl border border-[#c7cad5] overflow-hidden bg-white focus-within:border-2 focus-within:border-[#4262ff]">
                <FileEditor
                  value={formData.fileDescription}
                  onChange={(value) => handleInputChange("fileDescription", value)}
                  placeholder="Provide overview, syllabus coverage, or instructions..."
                />
              </div>
            </div>

            {/* Upload Method */}
            <div className="space-y-4">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleInputChange("uploadMethod", "file")}
                  className={`px-5 py-2.5 rounded-full font-bold text-xs sm:text-sm transition-all ${
                    formData.uploadMethod === "file"
                      ? "bg-[#1c1c1e] text-white shadow-sm"
                      : "bg-white border border-[#c7cad5] text-[#1c1c1e] hover:bg-[#f7f8fa]"
                  }`}
                >
                  Document File Upload
                </button>
                <button
                  type="button"
                  onClick={() => handleInputChange("uploadMethod", "link")}
                  className={`px-5 py-2.5 rounded-full font-bold text-xs sm:text-sm transition-all ${
                    formData.uploadMethod === "link"
                      ? "bg-[#1c1c1e] text-white shadow-sm"
                      : "bg-white border border-[#c7cad5] text-[#1c1c1e] hover:bg-[#f7f8fa]"
                  }`}
                >
                  Cloud Storage URL
                </button>
              </div>

              {formData.uploadMethod === "file" ? (
                <FileUploadDropzone
                  label="Primary Document File"
                  onFileSelect={(e) => handleFileUpload(e, "selectedFile")}
                  selectedFile={formData.selectedFile}
                  initialFileUrl={formData.fileUrl}
                  accept=".pdf,.doc,.docx,.ppt,.pptx"
                  icon={FileText}
                  onClear={() => handleInputChange("selectedFile", null)}
                />
              ) : (
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#555a6a]">Cloud / External URL</label>
                  <input
                    type="url"
                    value={formData.externalLink}
                    onChange={(e) => handleInputChange("externalLink", e.target.value)}
                    placeholder="https://drive.google.com/..."
                    className="w-full h-12 px-4 bg-white border border-[#c7cad5] rounded-xl text-[#1c1c1e] placeholder-[#8e91a0] focus:outline-none focus:border-2 focus:border-[#4262ff] transition-all text-sm font-medium"
                  />
                </div>
              )}
            </div>

            {/* Cover Image */}
            <FileUploadDropzone
              label="Thumbnail / Cover Preview Image"
              onFileSelect={(e) => handleFileUpload(e, "selectedImage")}
              selectedFile={formData.selectedImage}
              initialFileUrl={formData.imageUrl && formData.imageUrl[0]}
              accept="image/*"
              icon={ImageIcon}
              onClear={() => handleInputChange("selectedImage", null)}
            />

            {/* Reader Comments Toggle */}
            <div className="flex items-center justify-between p-4 bg-[#c3faf5]/30 rounded-xl border border-[#9eece4]">
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-[#187574]" />
                <div>
                  <h4 className="font-bold text-sm text-[#1c1c1e]">Public Discussion & Comments</h4>
                  <p className="text-xs text-[#187574]">Allow users to comment on this file</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.showCommentBox}
                  onChange={() => handleInputChange("showCommentBox", !formData.showCommentBox)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1c1c1e]"></div>
              </label>
            </div>

              </form>
        </div>

        {/* Action Buttons Bar matching Posts edit-articles.jsx */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-6 py-3 rounded-full bg-[#fbd4d4] hover:bg-[#f9a9a9] text-[#600000] border border-[#e3c5c5] font-bold text-sm transition-all disabled:opacity-50"
          >
            {isDeleting ? "Deleting..." : "Delete File"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/filter-file")}
            className="px-6 py-3 rounded-full bg-white border border-[#c7cad5] text-[#1c1c1e] hover:bg-[#f7f8fa] font-semibold text-sm transition-all shadow-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="editFileForm"
            disabled={isSubmitting}
            className="px-8 py-3.5 rounded-full bg-[#4262ff] hover:bg-[#2a41b6] text-white font-bold text-sm shadow-md hover:shadow transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-98"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Updating File...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-[#ffd02f]" />
                <span>Update File</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default EditFile
