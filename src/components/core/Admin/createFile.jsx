"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, FileText, ImageIcon, Eye, EyeOff } from "lucide-react"
import { GetFileRegion, CreateFileNew } from "../../../services/operations/filesAPI"
import toast from "react-hot-toast"
import FileEditor from "./File/File-editor"
import { useNavigate } from "react-router-dom"

const CreateFile = () => {
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
  })

  const [additionalYears, setAdditionalYears] = useState([])
  const [additionalAcademicYears, setAdditionalAcademicYears] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
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
  const formattedFileTypeOptions = fileTypeOptions.map((type) => ({
    value: type,
    label: type,
  }))

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

  // Update Category 5 when Category 4 changes
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

    setFormData((prev) => ({
      ...prev,
      category5: "",
    }))
  }, [formData.category4, formData.category3, formData.category2, formData.category1, formData.region, regions])

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleFileUpload = (event, type) => {
    const file = event.target.files[0]
    if (file) {
      setFormData((prev) => ({
        ...prev,
        [type]: file,
      }))
    }
  }

  const handleClearFile = (type) => {
    setFormData((prev) => ({
      ...prev,
      [type]: null,
    }))
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
      formDataToSend.append("status", "Approved File")
      
      // Append arrays as JSON strings
      formDataToSend.append("tags", JSON.stringify(formData.tags))
      formDataToSend.append("additionalYears", JSON.stringify(additionalYears.map((item) => item.year)))
      formDataToSend.append("additionalAcademicYears", JSON.stringify(additionalAcademicYears.map((item) => item.year)))

      // Append file
      if (formData.selectedFile) {
        formDataToSend.append("file", formData.selectedFile)
      }

      // Append image(s)
      if (formData.selectedImage) {
        formDataToSend.append("image", formData.selectedImage)
      }

      // Send to backend
      const response = await CreateFileNew(formDataToSend)

      console.log("File successfully created:", response)
      toast.success("File uploaded successfully!")
      navigate("/filter-file")

      // Reset form if needed
      setFormData({
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
        status: "Approved File",

      })
      setAdditionalYears([])
      setAdditionalAcademicYears([])
    } catch (error) {
      console.error("Error creating file:", error)
      toast.error("Failed to upload file. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const ModernDropdown = ({ label, value, onChange, options, disabled = false, placeholder }) => (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full h-14 px-4 border-2 rounded-2xl bg-white transition-all duration-200 font-medium
          ${
            disabled
              ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
              : "border-gray-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          } outline-none`}
      >
        <option value="">{placeholder || `Select ${label}`}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )

  const CustomCrossIcon = ({ onClick }) => (
    <button
      type="button"
      onClick={onClick}
      className="absolute top-3 right-3 w-8 h-8 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-lg z-20"
      title="Remove file"
    >
      <div className="relative w-4 h-4">
        <div className="absolute top-1/2 left-1/2 w-3 h-0.5 bg-white transform -translate-x-1/2 -translate-y-1/2 rotate-45"></div>
        <div className="absolute top-1/2 left-1/2 w-3 h-0.5 bg-white transform -translate-x-1/2 -translate-y-1/2 -rotate-45"></div>
      </div>
    </button>
  )

  const FileUploadArea = ({ label, onFileSelect, selectedFile, onClearFile, type, accept, icon: Icon }) => {
    const fileInputRef = useRef(null)

    const handleRemoveFile = (e) => {
      e.stopPropagation()
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
      // Call the parent's clear function
      onClearFile(type)
    }

    return (
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700">{label}</label>
        <div className="relative">
          <input
            type="file"
            ref={fileInputRef}
            accept={accept}
            onChange={onFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <div
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200
            ${selectedFile ? "border-green-300 bg-green-50" : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"}`}
          >
            {selectedFile && <CustomCrossIcon onClick={handleRemoveFile} />}
            <Icon className={`mx-auto mb-4 ${selectedFile ? "text-green-500" : "text-gray-400"}`} size={48} />
            {selectedFile ? (
              <div className="space-y-2">
                <p className="text-green-600 font-semibold">✓ File Selected</p>
                {selectedFile.type.startsWith("image/") ? (
                  <div className="flex justify-center">
                    <img
                      src={URL.createObjectURL(selectedFile) || "/placeholder.svg"}
                      alt="Preview"
                      className="max-h-40 max-w-full rounded-lg"
                    />
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">{selectedFile.name}</p>
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

  return (
    <div className="fixed overflow-auto inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-center">
            <h1 className="text-3xl font-bold text-white mb-2">Upload File</h1>
            <p className="text-blue-100">Share your educational resources with the community</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Region */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
              <ModernDropdown
                label="Region"
                value={formData.region}
                onChange={(value) => handleInputChange("region", value)}
                options={regionOptions}
                placeholder="Select your region"
              />
            </motion.div>

            {/* Category 1 */}
            <AnimatePresence>
              {formData.region && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: 0.1 }}
                >
                  <ModernDropdown
                    label="Category 1"
                    value={formData.category1}
                    onChange={(value) => handleInputChange("category1", value)}
                    options={category1Options}
                    placeholder="Select category 1"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Category 2 */}
            <AnimatePresence>
              {formData.category1 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: 0.1 }}
                >
                  <ModernDropdown
                    label="Category 2"
                    value={formData.category2}
                    onChange={(value) => handleInputChange("category2", value)}
                    options={category2Options}
                    placeholder="Select category 2"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Category 3 */}
            <AnimatePresence>
              {formData.category2 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: 0.1 }}
                >
                  <ModernDropdown
                    label="Category 3"
                    value={formData.category3}
                    onChange={(value) => handleInputChange("category3", value)}
                    options={category3Options}
                    placeholder="Select category 3"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Show all content after category 3 */}
            <AnimatePresence>
              {formData.category3 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-8"
                >
                  {/* Optional Category 4 */}
                  {category4Options.length > 0 && (
                    <ModernDropdown
                      label="Category 4 (Optional)"
                      value={formData.category4}
                      onChange={(value) => handleInputChange("category4", value)}
                      options={category4Options}
                      placeholder="Select category 4 (optional)"
                    />
                  )}

                  {/* Optional Category 5 */}
                  {category5Options.length > 0 && (
                    <ModernDropdown
                      label="Category 5 (Optional)"
                      value={formData.category5}
                      onChange={(value) => handleInputChange("category5", value)}
                      options={category5Options}
                      placeholder="Select category 5 (optional)"
                    />
                  )}

                  {/* File Creator Name */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">File Creator Name</label>
                    <input
                      type="text"
                      value={formData.fileCreatorName}
                      onChange={(e) => handleInputChange("fileCreatorName", e.target.value)}
                      placeholder="Enter creator's name"
                      className="w-full h-14 px-4 border-2 rounded-2xl bg-white transition-all duration-200 font-medium border-gray-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none"
                    />
                  </div>

                  {/* File Type */}
                  <ModernDropdown
                    label="File Type"
                    value={formData.fileType}
                    onChange={(val) => handleInputChange("fileType", val)}
                    options={formattedFileTypeOptions}
                    placeholder="Select File Type"
                  />

                  {/* Additional Years Section */}
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <p className="text-sm font-semibold text-gray-700">Add Year And Academic Year</p>
                      <div className="flex flex-wrap gap-6">
                        <RadioOption
                          label="None"
                          value="none"
                          checked={formData.addYears === "none"}
                          onChange={(value) => handleInputChange("addYears", value)}
                          name="addYears"
                        />
                        <RadioOption
                          label="Add Year"
                          value="year"
                          checked={formData.addYears === "year"}
                          onChange={(value) => {
                            handleInputChange("addYears", value)
                            setShowYearCalendar(true)
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
                          }}
                          name="addYears"
                        />
                      </div>
                    </div>

                    {/* Additional Years */}
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
                              <div className="relative w-5 h-5">
                                <div className="absolute top-1/2 left-1/2 w-4 h-0.5 bg-red-500 transform -translate-x-1/2 -translate-y-1/2 rotate-45"></div>
                                <div className="absolute top-1/2 left-1/2 w-4 h-0.5 bg-red-500 transform -translate-x-1/2 -translate-y-1/2 -rotate-45"></div>
                              </div>
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
                          {Array.from({ length: 51 }, (_, i) => 2020 + i).map((year) => (
                            <option key={year} value={year}>
                              {year}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Additional Academic Years */}
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
                              <div className="relative w-5 h-5">
                                <div className="absolute top-1/2 left-1/2 w-4 h-0.5 bg-red-500 transform -translate-x-1/2 -translate-y-1/2 rotate-45"></div>
                                <div className="absolute top-1/2 left-1/2 w-4 h-0.5 bg-red-500 transform -translate-x-1/2 -translate-y-1/2 -rotate-45"></div>
                              </div>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                            <div
                              key={index}
                              className="flex items-center bg-blue-200 text-blue-800 rounded-full px-3 py-1"
                            >
                              <span className="text-sm">{tag}</span>
                              <button
                                type="button"
                                onClick={() => removeTag(index)}
                                className="ml-2 text-gray-500 hover:text-red-500"
                              >
                                <div className="relative w-4 h-4">
                                  <div className="absolute top-1/2 left-1/2 w-3 h-0.5 bg-current transform -translate-x-1/2 -translate-y-1/2 rotate-45"></div>
                                  <div className="absolute top-1/2 left-1/2 w-3 h-0.5 bg-current transform -translate-x-1/2 -translate-y-1/2 -rotate-45"></div>
                                </div>
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
                    <div className="flex space-x-4">
                      <button
                        type="button"
                        onClick={() => handleInputChange("uploadMethod", "file")}
                        className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                          formData.uploadMethod === "file"
                            ? "bg-blue-500 text-white shadow-lg"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        Upload File
                      </button>
                      <button
                        type="button"
                        onClick={() => handleInputChange("uploadMethod", "link")}
                        className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                          formData.uploadMethod === "link"
                            ? "bg-blue-500 text-white shadow-lg"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        External Link
                      </button>
                    </div>

                    {formData.uploadMethod === "file" ? (
                      <FileUploadArea
                        label="Upload File"
                        onFileSelect={(e) => handleFileUpload(e, "selectedFile")}
                        selectedFile={formData.selectedFile}
                        onClearFile={handleClearFile}
                        type="selectedFile"
                        accept=".pdf,.doc,.docx,.ppt,.pptx"
                        icon={FileText}
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
                    onClearFile={handleClearFile}
                    type="selectedImage"
                    accept="image/*"
                    icon={ImageIcon}
                  />

                  {/* Comment Box Toggle */}
                  <ToggleSwitch
                    label="Show Comment Box"
                    checked={formData.showCommentBox}
                    onChange={(value) => handleInputChange("showCommentBox", value)}
                  />

                  {/* Submit Button */}
                  <div className="pt-8">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg rounded-2xl
                        hover:from-blue-700 hover:to-purple-700 transform hover:scale-[1.02] transition-all duration-200
                        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-xl"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center space-x-3">
                          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Uploading...</span>
                        </div>
                      ) : (
                        "Submit File"
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </motion.div>
      </div>
    </div>
  )
}

export default CreateFile
