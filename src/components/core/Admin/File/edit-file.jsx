"use client"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Plus, FileText, ImageIcon, Eye, EyeOff, Save, Upload, LinkIcon, Trash2 } from "lucide-react"
import { getFileById, GetFileRegion, updateFile, deleteFile } from "../../../../services/operations/filesAPI"
import toast from "react-hot-toast"
import { useNavigate, useParams } from "react-router-dom"
import FileEditor from "./File-editor"

const EditFile = ({ fileId }) => {
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

  // Combined useEffect for fetching all initial data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // 1. Fetch regions first
        const regionsResponse = await GetFileRegion()
        const regionsData = regionsResponse?.data || []
        const formattedRegions = regionsData.map((region) => ({
          value: region._id,
          label: region.name,
        }))
        setRegionOptions(formattedRegions)
        setRegions(regionsData)

        // 2. Then fetch file data
        const fileResponse = await getFileById(id)
        if (fileResponse?.success) {
          const existingData = fileResponse.file

          // Set form data, including existing file/image URLs
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
            })),
          )
          setAdditionalAcademicYears(
            (existingData.additionalAcademicYears || []).map((year) => ({
              id: Date.now() + Math.random(),
              year,
            })),
          )

          // Populate category options based on existingData and fetched regions
          const selectedRegion = regionsData.find(
            (r) => r._id === existingData.region || r.name === existingData.region,
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

    // Reset lower level categories when higher level changes
    if (field === "region") {
      setFormData((prev) => ({
        ...prev,
        category1: "",
        category2: "",
        category3: "",
        category4: "",
        category5: "",
      }))
    } else if (field === "category1") {
      setFormData((prev) => ({
        ...prev,
        category2: "",
        category3: "",
        category4: "",
        category5: "",
      }))
    } else if (field === "category2") {
      setFormData((prev) => ({
        ...prev,
        category3: "",
        category4: "",
        category5: "",
      }))
    } else if (field === "category3") {
      setFormData((prev) => ({
        ...prev,
        category4: "",
        category5: "",
      }))
    } else if (field === "category4") {
      setFormData((prev) => ({
        ...prev,
        category5: "",
      }))
    }
  }
  const handleFileUpload = (event, type) => {
    const file = event.target.files[0]
    if (file) {
      setFormData((prev) => ({ ...prev, [type]: file }))
    }
  }
  const addTag = () => {
    if (formData.currentTag.trim() !== "") {
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

      // Safely handle tags
      const safeTags = Array.isArray(formData.tags)
        ? formData.tags
        : typeof formData.tags === "string"
          ? JSON.parse(formData.tags)
          : []

      // Append all form data except special fields
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

      // Append region name
      const selectedRegion = regions.find((r) => r._id === formData.region)
      if (selectedRegion?.name) {
        formDataToSend.append("region", selectedRegion.name)
      }

      // File
      if (formData.selectedFile) {
        formDataToSend.append("file", formData.selectedFile)
      }
      // else if (formData.fileUrl) {
      //   formDataToSend.append("fileUrl", formData.fileUrl)
      // }

      // Image or imageUrl
      if (formData.selectedImage) {
        formDataToSend.append("image", formData.selectedImage)
      }
      // else if (formData.imageUrl && formData.imageUrl.length > 0) {
      //   formData.imageUrl.forEach((url) => {
      //     formDataToSend.append("imageUrl", url)
      //   })
      // }

      safeTags.forEach((tag) => {
        formDataToSend.append("tags", tag)
      })

      // ✅ Additional Years (one by one)
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

      // Submit
      await updateFile(id, formDataToSend)
      toast.success("File updated successfully!")
      navigate("/filter-file")
    } catch (error) {
      console.error("Error updating file:", error)
      toast.error("Failed to update file")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this file? This action cannot be undone.")) {
      try {
        await deleteFile(id)
        toast.success("File deleted successfully!")
        navigate("/filter-file")
      } catch (error) {
        console.error("Error deleting file:", error)
        toast.error("Failed to delete file")
      }
    }
  }
  const FileUploadArea = ({ label, onFileSelect, selectedFile, accept, icon: Icon, initialFileUrl, onClear }) => {
    const displayFileName = selectedFile?.name || (initialFileUrl ? initialFileUrl.split("/").pop() : "")
    const isFileSelected = selectedFile || initialFileUrl

    const getImagePreviewUrl = () => {
      if (selectedFile && selectedFile.type?.startsWith("image/")) {
        return URL.createObjectURL(selectedFile)
      }
      return initialFileUrl
    }

    const handleClear = (e) => {
      e.stopPropagation()
      onClear()
    }

    return (
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700">{label}</label>
        <div className="relative">
          <input
            type="file"
            accept={accept}
            onChange={onFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <div
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200
            ${isFileSelected ? "border-green-300 bg-green-50" : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"}`}
          >
            {isFileSelected && <CustomCrossIcon onClick={handleClear} />}

            <Icon className={`mx-auto mb-4 ${isFileSelected ? "text-green-500" : "text-gray-400"}`} size={48} />
            {isFileSelected ? (
              <div className="space-y-2">
                <p className="text-green-600 font-semibold">✓ {label} Selected</p>
                <p className="text-sm text-gray-600">{displayFileName}</p>
                {label === "Upload Image" && (
                  <img
                    src={getImagePreviewUrl() || "/placeholder.svg"}
                    alt="Uploaded preview"
                    className="mt-4 max-h-32 mx-auto object-contain rounded-lg"
                  />
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-gray-600 font-medium">Click to upload or drag and drop</p>
                <p className="text-sm text-gray-400">Supported formats: {accept}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }
  const ToggleSwitch = ({ label, checked, onChange }) => (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
      <div className="flex items-center space-x-3">
        {checked ? <Eye className="text-blue-500" size={20} /> : <EyeOff className="text-gray-400" size={20} />}
        <span className="font-semibold text-gray-700">{label}</span>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          ${checked ? "bg-blue-500" : "bg-gray-300"}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200
            ${checked ? "translate-x-6" : "translate-x-1"}`}
        />
      </button>
    </div>
  )
  const RadioOption = ({ label, value, checked, onChange, name }) => (
    <label className="flex items-center space-x-3 cursor-pointer">
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        className="h-5 w-5 text-blue-600 focus:ring-blue-500"
      />
      <span className="text-gray-700 font-medium">{label}</span>
    </label>
  )
  const CustomCrossIcon = ({ onClick }) => (
    <button
      onClick={onClick}
      className="absolute top-2 right-2 z-20 w-6 h-6 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-lg"
      type="button"
    >
      <div className="relative w-3 h-3">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white transform -translate-y-1/2 rotate-45"></div>
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white transform -translate-y-1/2 -rotate-45"></div>
      </div>
    </button>
  )

  const handleClearFile = (type) => {
    setFormData((prev) => ({ ...prev, [type]: null }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading file data...</p>
        </div>
      </div>
    )
  }
  return (
    <div className="fixed inset-0 overflow-auto bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-600 to-red-600 p-6 sm:p-8 text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Edit File</h1>
            <p className="text-orange-100 text-sm sm:text-base">Update your educational resource</p>
          </div>
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 sm:space-y-8">
            {/* Region */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Region</label>
                <select
                  value={formData.region}
                  onChange={(e) => handleInputChange("region", e.target.value)}
                  className={`w-full h-14 px-4 border-2 rounded-2xl bg-white transition-all duration-200 font-medium
                    border-gray-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none`}
                >
                  <option value="">Select your region</option>
                  {regionOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </motion.div>
            {/* Categories */}
            <AnimatePresence>
              {formData.region && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Category 1</label>
                    <select
                      value={formData.category1}
                      onChange={(e) => handleInputChange("category1", e.target.value)}
                      className={`w-full h-14 px-4 border-2 rounded-2xl bg-white transition-all duration-200 font-medium
                        ${
                          category1Options.length === 0
                            ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                            : "border-gray-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                        } outline-none`}
                      disabled={category1Options.length === 0}
                    >
                      <option value="">Select category 1</option>
                      {category1Options.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {formData.category1 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Category 2</label>
                    <select
                      value={formData.category2}
                      onChange={(e) => handleInputChange("category2", e.target.value)}
                      className={`w-full h-14 px-4 border-2 rounded-2xl bg-white transition-all duration-200 font-medium
                        ${
                          category2Options.length === 0
                            ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                            : "border-gray-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                        } outline-none`}
                      disabled={category2Options.length === 0}
                    >
                      <option value="">Select category 2</option>
                      {category2Options.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {formData.category2 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Category 3</label>
                    <select
                      value={formData.category3}
                      onChange={(e) => handleInputChange("category3", e.target.value)}
                      className={`w-full h-14 px-4 border-2 rounded-2xl bg-white transition-all duration-200 font-medium
                        ${
                          category3Options.length === 0
                            ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                            : "border-gray-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                        } outline-none`}
                      disabled={category3Options.length === 0}
                    >
                      <option value="">Select category 3</option>
                      {category3Options.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {formData.category3 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Category 4 (Optional)</label>
                    <select
                      value={formData.category4}
                      onChange={(e) => handleInputChange("category4", e.target.value)}
                      className={`w-full h-14 px-4 border-2 rounded-2xl bg-white transition-all duration-200 font-medium
                        ${
                          category4Options.length === 0
                            ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                            : "border-gray-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                        } outline-none`}
                      disabled={category4Options.length === 0}
                    >
                      <option value="">Select category 4 (optional)</option>
                      {category4Options.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {formData.category4 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">Category 5 (Optional)</label>
                    <select
                      value={formData.category5}
                      onChange={(e) => handleInputChange("category5", e.target.value)}
                      className={`w-full h-14 px-4 border-2 rounded-2xl bg-white transition-all duration-200 font-medium
                        ${
                          category5Options.length === 0
                            ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                            : "border-gray-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                        } outline-none`}
                      disabled={category5Options.length === 0}
                    >
                      <option value="">Select category 5 (optional)</option>
                      {category5Options.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            {/* Year and File Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">File Creator</label>
                <input
                  type="text"
                  value={formData.fileCreatorName}
                  onChange={(e) => handleInputChange("fileCreatorName", e.target.value)}
                  placeholder="Enter file creator name"
                  className="w-full h-14 px-4 border-2 rounded-2xl bg-white transition-all duration-200 font-medium border-gray-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">File Type</label>
                <select
                  value={formData.fileType}
                  onChange={(e) => handleInputChange("fileType", e.target.value)}
                  className="w-full h-14 px-4 border-2 rounded-2xl bg-white transition-all duration-200 font-medium border-gray-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none"
                >
                  <option value="">Select File Type</option>
                  {fileTypeOptions.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Additional Years Section */}
            <div className="space-y-6">
              <div className="space-y-4">
                <p className="text-sm font-semibold text-gray-700">Add additional years:</p>
                <div className="flex flex-wrap gap-6">
                  <RadioOption
                    label="None"
                    value="none"
                    checked={formData.addYears === "none"}
                    onChange={(value) => {
                      handleInputChange("addYears", value)
                      setShowYearCalendar(false)
                      setShowAcademicYearDropdown(false)
                    }}
                    name="addYears"
                  />
                  <RadioOption
                    label="Add Year"
                    value="year"
                    checked={formData.addYears === "year"}
                    onChange={(value) => {
                      handleInputChange("addYears", value)
                      setShowYearCalendar(true)
                      setShowAcademicYearDropdown(false)
                    }}
                    name="addYears"
                  />
                  <RadioOption
                    label="Add Academic Year"
                    value="academic"
                    checked={formData.addYears === "academic"}
                    onChange={(value) => {
                      handleInputChange("addYears", value)
                      setShowAcademicYearDropdown(true)
                      setShowYearCalendar(false)
                    }}
                    name="addYears"
                  />
                </div>
              </div>

              {/* Always show selected additional years if available */}
              {additionalYears.length > 0 && (
                <div className="space-y-4">
                  {additionalYears.map((yearItem) => (
                    <div key={yearItem.id} className="flex items-end space-x-4">
                      <div className="flex-1">
                        <label className="block text-sm font-semibold text-gray-700">Additional Year</label>
                        <input
                          type="text"
                          value={yearItem.year}
                          onChange={(e) => updateAdditionalYear(yearItem.id, e.target.value)}
                          className="w-full h-14 px-4 border-2 rounded-2xl bg-white border-gray-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeYear(yearItem.id)}
                        className="h-14 w-14 flex items-center justify-center bg-red-100 text-red-500 rounded-2xl hover:bg-red-200"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Year Dropdown */}
              {formData.addYears === "year" && showYearCalendar && (
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Select Year</label>
                  <select
                    onChange={(e) => {
                      const selectedYear = e.target.value
                      if (selectedYear) {
                        setAdditionalYears((prev) => [...prev, { id: Date.now(), year: selectedYear }])
                      }
                    }}
                    className="w-full h-14 px-4 border-2 rounded-2xl bg-white border-gray-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none"
                  >
                    <option value="">Select Year</option>
                    {Array.from({ length: 11 }, (_, i) => 2020 + i).map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Academic Year Section */}
              {additionalAcademicYears.length > 0 && (
                <div className="space-y-4">
                  {additionalAcademicYears.map((yearItem) => (
                    <div key={yearItem.id} className="flex items-end space-x-4">
                      <div className="flex-1">
                        <label className="block text-sm font-semibold text-gray-700">Academic Year</label>
                        <input
                          type="text"
                          value={yearItem.year}
                          onChange={(e) => updateAdditionalAcademicYear(yearItem.id, e.target.value)}
                          className="w-full h-14 px-4 border-2 rounded-2xl bg-white border-gray-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAcademicYear(yearItem.id)}
                        className="h-14 w-14 flex items-center justify-center bg-red-100 text-red-500 rounded-2xl hover:bg-red-200"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Academic Year Dropdown */}
              {formData.addYears === "academic" && showAcademicYearDropdown && (
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Select Academic Year</label>
                  <select
                    onChange={(e) => {
                      const selected = e.target.value
                      if (selected) {
                        setAdditionalAcademicYears((prev) => [...prev, { id: Date.now(), year: selected }])
                      }
                    }}
                    className="w-full h-14 px-4 border-2 rounded-2xl bg-white border-gray-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none"
                  >
                    <option value="">Select Academic Year</option>
                    {academicYearOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            {/* File Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">File Title</label>
                <input
                  type="text"
                  value={formData.fileTitle}
                  onChange={(e) => handleInputChange("fileTitle", e.target.value)}
                  placeholder="Enter file title"
                  className="w-full h-14 px-4 border-2 rounded-2xl bg-white transition-all duration-200 font-medium border-gray-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Tags</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={formData.currentTag}
                    onChange={(e) => handleInputChange("currentTag", e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter tag and press Enter"
                    className="flex-1 h-14 px-4 border-2 rounded-2xl bg-white border-gray-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="h-14 w-14 flex items-center justify-center bg-blue-100 text-blue-500 rounded-2xl hover:bg-blue-200 transition-colors duration-200"
                  >
                    <Plus size={20} />
                  </button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.tags.map((tag, index) => (
                      <div key={index} className="flex items-center bg-blue-200 text-blue-800 rounded-full px-3 py-1">
                        <span className="text-sm">{tag}</span>
                        <button
                          type="button"
                          onClick={() => removeTag(index)}
                          className="ml-2 text-gray-500 hover:text-red-500"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <FileEditor
              value={formData.fileDescription}
              onChange={(value) => handleInputChange("fileDescription", value)}
              placeholder="Describe your file..."
            />
            {/* Upload Method Toggle */}
            <div className="space-y-4">
              <div className="flex flex-wrap gap-4">
                <button
                  type="button"
                  onClick={() => handleInputChange("uploadMethod", "file")}
                  className={`px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 text-sm sm:text-base ${
                    formData.uploadMethod === "file"
                      ? "bg-blue-500 text-white shadow-lg"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <Upload size={16} />
                  <span>Upload File</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleInputChange("uploadMethod", "link")}
                  className={`px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 text-sm sm:text-base ${
                    formData.uploadMethod === "link"
                      ? "bg-blue-500 text-white shadow-lg"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <LinkIcon size={16} />
                  <span>External Link</span>
                </button>
              </div>
              {formData.uploadMethod === "file" ? (
                <FileUploadArea
                  label="Upload File"
                  onFileSelect={(e) => handleFileUpload(e, "selectedFile")}
                  selectedFile={formData.selectedFile}
                  initialFileUrl={formData.fileUrl} // Pass existing file URL
                  accept=".pdf,.doc,.docx,.ppt,.pptx"
                  icon={FileText}
                  onClear={() => handleClearFile("selectedFile")}
                />
              ) : (
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">External Link</label>
                  <input
                    type="url"
                    value={formData.externalLink}
                    onChange={(e) => handleInputChange("externalLink", e.target.value)}
                    placeholder="Paste external link here"
                    className="w-full h-14 px-4 border-2 rounded-2xl bg-white transition-all duration-200 font-medium border-gray-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none"
                  />
                </div>
              )}
            </div>
            {/* Image Upload */}
            <FileUploadArea
              label="Upload Image"
              onFileSelect={(e) => handleFileUpload(e, "selectedImage")}
              selectedFile={formData.selectedImage}
              initialFileUrl={formData.imageUrl[0]} // Pass the first existing image URL
              accept="image/*"
              icon={ImageIcon}
              onClear={() => handleClearFile("selectedImage")}
            />
            {/* Comment Box Toggle */}
            <ToggleSwitch
              label="Show Comment Box"
              checked={formData.showCommentBox}
              onChange={(value) => handleInputChange("showCommentBox", value)}
            />
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 sm:pt-8 border-t border-gray-200">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 h-14 sm:h-16 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold text-base sm:text-lg rounded-2xl
                  hover:from-green-700 hover:to-emerald-700 transform hover:scale-[1.02] transition-all duration-200
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-xl
                  flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    <span>Update File</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="flex-1 h-14 sm:h-16 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold text-base sm:text-lg rounded-2xl
                  hover:from-red-600 hover:to-red-700 transform hover:scale-[1.02] transition-all duration-200 shadow-xl
                  flex items-center justify-center space-x-2"
              >
                <Trash2 size={18} />
                <span>Delete File</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}

export default EditFile
