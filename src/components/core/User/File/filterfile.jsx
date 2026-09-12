"use client"

import { useState, useMemo, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  Filter,
  Edit,
  Trash2,
  ArrowLeft,
  Eye,
  Plus,
  X,
  FileText,
  FolderOpen,
  Sparkles,
  Loader2,
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { GetFileRegion, getAllUserFiles, deleteFileByTitle } from "../../../../services/operations/filesAPI"
import toast from "react-hot-toast"

export default function FilterFiles() {
  const navigate = useNavigate()
  const [regions, setRegions] = useState([])
  const [regionOptions, setRegionOptions] = useState([])
  const [category1Options, setCategory1Options] = useState([])
  const [category2Options, setCategory2Options] = useState([])
  const [category3Options, setCategory3Options] = useState([])
  const [category4Options, setCategory4Options] = useState([])
  const [category5Options, setCategory5Options] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  const [formData, setFormData] = useState({
    region: "",
    regionId: "",
    category1: "",
    category2: "",
    category3: "",
    category4: "",
    category5: "",
    status: "",
  })

  const [files, setFiles] = useState([])
  const [errors, setErrors] = useState({})
  const [filterValues, setFilterValues] = useState({
    region: "",
    regionId: "",
    category1: "",
    category2: "",
    category3: "",
    category4: "",
    category5: "",
    status: "",
  })

  // Load Regions and User Files
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const [regionRes, filesRes] = await Promise.all([
          GetFileRegion(),
          getAllUserFiles(),
        ])

        const regionData = regionRes?.data || []
        setRegions(regionData)
        setRegionOptions(
          regionData.map((region) => ({
            name: region.name,
            id: region._id,
          }))
        )

        setFiles(filesRes?.data || [])
      } catch (error) {
        console.error("Failed to load user files or regions:", error)
        toast.error("Failed to load file vault")
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  // Update category1 options when region changes
  useEffect(() => {
    if (formData.regionId) {
      const selectedRegion = regions.find((r) => r._id === formData.regionId)
      if (selectedRegion) {
        setFormData((prev) => ({
          ...prev,
          category1: "",
          category2: "",
          category3: "",
          category4: "",
          category5: "",
        }))

        const cat1Options = selectedRegion.category1?.map((cat) => cat.name) || []
        setCategory1Options(cat1Options)
        setCategory2Options([])
        setCategory3Options([])
        setCategory4Options([])
        setCategory5Options([])
      }
    }
  }, [formData.regionId, regions])

  // Update category2 options when category1 changes
  useEffect(() => {
    if (formData.regionId && formData.category1) {
      const selectedRegion = regions.find((r) => r._id === formData.regionId)
      if (selectedRegion) {
        const selectedCat1 = selectedRegion.category1?.find((cat) => cat.name === formData.category1)
        const cat2Options = selectedCat1?.category2?.map((cat) => cat.name) || []
        setCategory2Options(cat2Options)
        setCategory3Options([])
        setCategory4Options([])
        setCategory5Options([])
      }
    }
  }, [formData.category1, formData.regionId, regions])

  // Update category3 options when category2 changes
  useEffect(() => {
    if (formData.regionId && formData.category1 && formData.category2) {
      const selectedRegion = regions.find((r) => r._id === formData.regionId)
      if (selectedRegion) {
        const selectedCat1 = selectedRegion.category1?.find((cat) => cat.name === formData.category1)
        const selectedCat2 = selectedCat1?.category2?.find((cat) => cat.name === formData.category2)
        const cat3Options = selectedCat2?.category3?.map((cat) => cat.name) || []
        setCategory3Options(cat3Options)
        setCategory4Options([])
        setCategory5Options([])
      }
    }
  }, [formData.category2, formData.category1, formData.regionId, regions])

  // Update category4 options when category3 changes
  useEffect(() => {
    if (formData.regionId && formData.category1 && formData.category2 && formData.category3) {
      const selectedRegion = regions.find((r) => r._id === formData.regionId)
      if (selectedRegion) {
        const selectedCat1 = selectedRegion.category1?.find((cat) => cat.name === formData.category1)
        const selectedCat2 = selectedCat1?.category2?.find((cat) => cat.name === formData.category2)
        const selectedCat3 = selectedCat2?.category3?.find((cat) => cat.name === formData.category3)
        const cat4Options = selectedCat3?.category4?.map((cat) => cat.name) || []
        setCategory4Options(cat4Options)
        setCategory5Options([])
      }
    }
  }, [formData.category3, formData.category2, formData.category1, formData.regionId, regions])

  // Update category5 options when category4 changes
  useEffect(() => {
    if (
      formData.regionId &&
      formData.category1 &&
      formData.category2 &&
      formData.category3 &&
      formData.category4
    ) {
      const selectedRegion = regions.find((r) => r._id === formData.regionId)
      if (selectedRegion) {
        const selectedCat1 = selectedRegion.category1?.find((cat) => cat.name === formData.category1)
        const selectedCat2 = selectedCat1?.category2?.find((cat) => cat.name === formData.category2)
        const selectedCat3 = selectedCat2?.category3?.find((cat) => cat.name === formData.category3)
        const selectedCat4 = selectedCat3?.category4?.find((cat) => cat.name === formData.category4)
        const cat5Options = selectedCat4?.category5?.map((cat) => cat.name) || []
        setCategory5Options(cat5Options)
      }
    }
  }, [
    formData.category4,
    formData.category3,
    formData.category2,
    formData.category1,
    formData.regionId,
    regions,
  ])

  const handleInputChange = (e) => {
    const { name, value } = e.target

    if (name === "region") {
      const selectedOption = regionOptions.find((opt) => opt.id === value)
      setFormData((prev) => ({
        ...prev,
        region: selectedOption?.name || "",
        regionId: selectedOption?.id || "",
        category1: "",
        category2: "",
        category3: "",
        category4: "",
        category5: "",
      }))
      setFilterValues((prev) => ({
        ...prev,
        region: selectedOption?.name || "",
        regionId: selectedOption?.id || "",
        category1: "",
        category2: "",
        category3: "",
        category4: "",
        category5: "",
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
      setFilterValues((prev) => ({
        ...prev,
        [name]: value,
      }))
    }

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const filteredFiles = useMemo(() => {
    return files.filter((file) => {
      const matchesRegion =
        !filterValues.region ||
        (file.region === filterValues.region && file.regionId === filterValues.regionId)
      const matchesCategory1 =
        !filterValues.category1 || (file.category1 && file.category1.includes(filterValues.category1))
      const matchesCategory2 =
        !filterValues.category2 || (file.category2 && file.category2.includes(filterValues.category2))
      const matchesCategory3 =
        !filterValues.category3 || (file.category3 && file.category3.includes(filterValues.category3))
      const matchesCategory4 =
        !filterValues.category4 ||
        (file.category4 && file.category4.includes(filterValues.category4))
      const matchesCategory5 =
        !filterValues.category5 ||
        (file.category5 && file.category5.includes(filterValues.category5))
      const matchesStatus = !filterValues.status || file.status === filterValues.status

      const matchesSearch =
        !searchQuery.trim() ||
        (file.fileTitle && file.fileTitle.toLowerCase().includes(searchQuery.trim().toLowerCase())) ||
        (file.region && file.region.toLowerCase().includes(searchQuery.trim().toLowerCase())) ||
        (file.category1 && file.category1.toLowerCase().includes(searchQuery.trim().toLowerCase()))

      return (
        matchesRegion &&
        matchesCategory1 &&
        matchesCategory2 &&
        matchesCategory3 &&
        matchesCategory4 &&
        matchesCategory5 &&
        matchesStatus &&
        matchesSearch
      )
    })
  }, [files, filterValues, searchQuery])

  const handleEdit = (file) => {
    const selectedRegion = regionOptions.find((opt) => opt.name === file.region)
    setFormData({
      region: file.region,
      regionId: selectedRegion?.id || "",
      category1: file.category1,
      category2: file.category2,
      category3: file.category3,
      category4: file.category4 || "",
      category5: file.category5 || "",
      status: file.status || "",
    })
    setFilterValues({
      region: file.region,
      regionId: selectedRegion?.id || "",
      category1: file.category1,
      category2: file.category2,
      category3: file.category3,
      category4: file.category4 || "",
      category5: file.category5 || "",
      status: file.status || "",
    })
    setErrors({})
  }

  const handleDelete = async (fileTitle) => {
    const fileToDelete = files.find((file) => file.fileTitle === fileTitle)
    if (fileToDelete) {
      if (fileToDelete.status === "Approved File" || fileToDelete.status === "Rejected File") {
        toast.error("You cannot delete an Approved or Rejected file")
        return
      }

      try {
        const confirm = window.confirm(`Are you sure you want to delete "${fileTitle}"?`)
        if (!confirm) return
        await deleteFileByTitle(fileTitle)
        setFiles((prev) => prev.filter((file) => file.fileTitle !== fileTitle))
        toast.success(`Deleted File successfully!`)
      } catch (error) {
        console.error("Failed to delete file:", error)
        toast.error(`Failed to delete File. Please try again.`)
      }
    }
  }

  const clearFilters = () => {
    setFormData({
      region: "",
      regionId: "",
      category1: "",
      category2: "",
      category3: "",
      category4: "",
      category5: "",
      status: "",
    })
    setFilterValues({
      region: "",
      regionId: "",
      category1: "",
      category2: "",
      category3: "",
      category4: "",
      category5: "",
      status: "",
    })
    setSearchQuery("")
    setErrors({})
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "Waiting for Approval":
        return "bg-[#fff8e0] text-[#746019] border border-[#fde89c]"
      case "Approved File":
        return "bg-[#c3faf5] text-[#187574] border border-[#9eece4]"
      case "Rejected File":
        return "bg-[#fbd4d4] text-[#800000] border border-[#e3c5c5]"
      default:
        return "bg-[#f7f8fa] text-[#555a6a] border border-[#e0e2e8]"
    }
  }

  const isFiltered =
    filterValues.region ||
    filterValues.category1 ||
    filterValues.category2 ||
    filterValues.category3 ||
    filterValues.category4 ||
    filterValues.category5 ||
    filterValues.status ||
    searchQuery.trim()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f7f8fa] flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="w-12 h-12 rounded-2xl bg-[#ffd02f] flex items-center justify-center mb-4 shadow-sm animate-pulse">
          <Loader2 className="animate-spin h-6 w-6 text-[#1c1c1e]" />
        </div>
        <p className="text-xs font-bold uppercase tracking-wider text-[#6a6d7c]">
          Loading file vault...
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#1c1c1e] py-6 sm:py-10 px-4 sm:px-6 lg:px-8 xl:px-12 w-full font-sans">
      <div className="w-full space-y-6 sm:space-y-8">
        {/* Top Header & Navigation Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e6e8ec]">
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => navigate("/dashboard")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#c7cad5] text-[#1c1c1e] hover:bg-[#ebecf0] transition-colors text-xs font-semibold shadow-sm active:scale-95 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </button>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest bg-[#ffd02f] text-[#1c1c1e] shadow-2xs">
              STUDENT VAULT
            </span>
            <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#c3faf5] text-[#187574] border border-[#9eece4]">
              MY UPLOADED RESOURCES
            </span>
          </div>

          <button
            onClick={() => navigate("/user-upload-file")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1c1c1e] text-white hover:bg-[#2c2c34] text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 text-[#ffd02f]" />
            <span>Upload New File</span>
          </button>
        </div>

        {/* Page Title */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#1c1c1e]">
            My Uploaded Study Files & Notes
          </h1>
          <p className="text-xs sm:text-sm text-[#6a6d7c] max-w-2xl leading-relaxed">
            Filter your study resources by academic taxonomy and review approval status. Approved documents are accessible across the CLYS community library.
          </p>
        </div>

        {/* Filter Card */}
        <div className="bg-white rounded-2xl border border-[#c7cad5] shadow-sm p-5 sm:p-7 space-y-4 w-full">
          <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-[#e6e8ec]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#ffd02f] border border-[#fde89c] flex items-center justify-center text-[#1c1c1e] shadow-2xs">
                <Filter className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-[#1c1c1e]">
                  Filter by Taxonomy & Status
                </h2>
                <p className="text-xs text-[#6a6d7c]">Select hierarchical categories to refine file list</p>
              </div>
            </div>

            {isFiltered && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#fbd4d4] hover:bg-[#ffc6c6] text-[#800000] border border-[#e3c5c5] rounded-full text-xs font-bold transition-colors cursor-pointer shadow-2xs"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* Status Field */}
            <div className="space-y-1.5 p-3 rounded-xl bg-[#fff8e0]/60 border border-[#fde89c]">
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#746019]">
                Approval Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full h-10 px-2.5 bg-[#fff8e0] border border-[#fde89c] rounded-lg text-[#1c1c1e] font-semibold text-xs focus:outline-none focus:border-2 focus:border-[#ffd02f] cursor-pointer"
              >
                <option value="">All Statuses</option>
                <option value="Waiting for Approval">Waiting for Approval</option>
                <option value="Approved File">Approved File</option>
                <option value="Rejected File">Rejected File</option>
              </select>
            </div>

            {/* Region Field */}
            <div className="space-y-1.5 p-3 rounded-xl bg-[#fff4c4]/40 border border-[#fde89c]">
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#746019]">
                Region / Board
              </label>
              <select
                name="region"
                value={formData.regionId}
                onChange={handleInputChange}
                className="w-full h-10 px-2.5 bg-white border border-[#fde89c] rounded-lg text-[#1c1c1e] font-semibold text-xs focus:outline-none focus:border-2 focus:border-[#ffd02f] cursor-pointer"
              >
                <option value="">All Regions</option>
                {regionOptions.map((region) => (
                  <option key={region.id} value={region.id}>
                    {region.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Category 1 */}
            <div className="space-y-1.5 p-3 rounded-xl bg-[#c3faf5]/30 border border-[#9eece4]">
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#187574]">
                Category 1
              </label>
              <select
                name="category1"
                value={formData.category1}
                onChange={handleInputChange}
                disabled={!formData.regionId}
                className={`w-full h-10 px-2.5 bg-white border border-[#9eece4] rounded-lg text-[#1c1c1e] font-semibold text-xs focus:outline-none focus:border-2 focus:border-[#0fbcb0] cursor-pointer ${
                  !formData.regionId ? "opacity-50 cursor-not-allowed bg-gray-50" : ""
                }`}
              >
                <option value="">All Category 1</option>
                {category1Options.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Category 2 */}
            <div className="space-y-1.5 p-3 rounded-xl bg-[#ffd8f4]/30 border border-[#f3bee5]">
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#86296b]">
                Category 2
              </label>
              <select
                name="category2"
                value={formData.category2}
                onChange={handleInputChange}
                disabled={!formData.category1}
                className={`w-full h-10 px-2.5 bg-white border border-[#f3bee5] rounded-lg text-[#1c1c1e] font-semibold text-xs focus:outline-none focus:border-2 focus:border-[#86296b] cursor-pointer ${
                  !formData.category1 ? "opacity-50 cursor-not-allowed bg-gray-50" : ""
                }`}
              >
                <option value="">All Category 2</option>
                {category2Options.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Category 3 */}
            <div className="space-y-1.5 p-3 rounded-xl bg-[#ffe6cd]/30 border border-[#fcd0a1]">
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#7c3a00]">
                Category 3
              </label>
              <select
                name="category3"
                value={formData.category3}
                onChange={handleInputChange}
                disabled={!formData.category2}
                className={`w-full h-10 px-2.5 bg-white border border-[#fcd0a1] rounded-lg text-[#1c1c1e] font-semibold text-xs focus:outline-none focus:border-2 focus:border-[#ff7347] cursor-pointer ${
                  !formData.category2 ? "opacity-50 cursor-not-allowed bg-gray-50" : ""
                }`}
              >
                <option value="">All Category 3</option>
                {category3Options.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Category 4 */}
            <div className="space-y-1.5 p-3 rounded-xl bg-[#f5f3ff] border border-[#ddd6fe]">
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#4262ff]">
                Category 4
              </label>
              <select
                name="category4"
                value={formData.category4}
                onChange={handleInputChange}
                disabled={!formData.category3}
                className={`w-full h-10 px-2.5 bg-white border border-[#ddd6fe] rounded-lg text-[#1c1c1e] font-semibold text-xs focus:outline-none focus:border-2 focus:border-[#4262ff] cursor-pointer ${
                  !formData.category3 ? "opacity-50 cursor-not-allowed bg-gray-50" : ""
                }`}
              >
                <option value="">All Category 4</option>
                {category4Options.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* File Repository Listing Card */}
        <div className="bg-white rounded-2xl border border-[#c7cad5] shadow-sm p-5 sm:p-7 space-y-5 w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#e6e8ec]">
            <div className="flex items-center gap-3">
              <h2 className="text-lg sm:text-xl font-extrabold text-[#1c1c1e]">
                Study File Vault
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#ffd02f] text-[#1c1c1e]">
                {filteredFiles.length} {filteredFiles.length === 1 ? "File" : "Files"}
              </span>
              {filteredFiles.length !== files.length && (
                <span className="text-xs text-[#6a6d7c]">
                  (filtered from {files.length})
                </span>
              )}
            </div>

            {/* Keyword Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8e91a0] pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search file title..."
                className="w-full h-10 pl-9 pr-4 bg-[#f7f8fa] border border-[#c7cad5] rounded-xl text-xs font-semibold text-[#1c1c1e] placeholder-[#8e91a0] focus:bg-white focus:outline-none focus:border-[#1c1c1e] transition-all"
              />
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <div className="min-w-full rounded-xl border border-[#e6e8ec] overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#fafbfc] border-b border-[#e6e8ec]">
                  <tr>
                    <th className="px-4 py-3 font-extrabold text-[#6a6d7c] uppercase tracking-wider w-[15%]">
                      Region / Board
                    </th>
                    <th className="px-4 py-3 font-extrabold text-[#6a6d7c] uppercase tracking-wider w-[14%]">
                      Category 1
                    </th>
                    <th className="px-4 py-3 font-extrabold text-[#6a6d7c] uppercase tracking-wider w-[14%]">
                      Category 2
                    </th>
                    <th className="px-4 py-3 font-extrabold text-[#6a6d7c] uppercase tracking-wider w-[14%]">
                      Category 3
                    </th>
                    <th className="px-4 py-3 font-extrabold text-[#6a6d7c] uppercase tracking-wider w-[13%]">
                      Approval Status
                    </th>
                    <th className="px-4 py-3 font-extrabold text-[#6a6d7c] uppercase tracking-wider w-[18%]">
                      Resource Title
                    </th>
                    <th className="px-4 py-3 font-extrabold text-[#6a6d7c] uppercase tracking-wider text-center w-[12%]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e6e8ec] bg-white">
                  {filteredFiles.map((file) => (
                    <tr key={file._id || file.id} className="hover:bg-[#f7f8fa] transition-colors">
                      <td className="px-4 py-3.5 font-bold text-[#1c1c1e]">
                        {file.region || "—"}
                      </td>
                      <td className="px-4 py-3.5 text-[#555a6a] font-medium">
                        {file.category1 || "—"}
                      </td>
                      <td className="px-4 py-3.5 text-[#555a6a] font-medium">
                        {file.category2 || "—"}
                      </td>
                      <td className="px-4 py-3.5 text-[#555a6a] font-medium">
                        {file.category3 || "—"}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${getStatusBadge(
                            file.status
                          )}`}
                        >
                          {file.status || "Pending"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-bold text-[#1c1c1e] line-clamp-2 max-w-xs">
                        {file.fileTitle}
                      </td>
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => navigate(`/view-user-file/${file._id || file.id}`)}
                            className="p-1.5 rounded-lg bg-[#c3faf5]/60 hover:bg-[#c3faf5] text-[#187574] transition-colors cursor-pointer shadow-2xs"
                            title="View Document"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              if (file.status === "Approved File" || file.status === "Rejected File") {
                                toast.error("You cannot edit an Approved or Rejected file")
                              } else {
                                handleEdit(file)
                                navigate(`/edit-user-file/${file._id || file.id}`, {
                                  state: { status: file.status },
                                })
                              }
                            }}
                            className="p-1.5 rounded-lg bg-[#fff4c4] hover:bg-[#ffe58f] text-[#746019] transition-colors cursor-pointer shadow-2xs"
                            title="Edit Document"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              if (file.status === "Approved File" || file.status === "Rejected File") {
                                toast.error("You cannot delete an Approved or Rejected file")
                              } else {
                                handleDelete(file.fileTitle)
                              }
                            }}
                            className="p-1.5 rounded-lg bg-[#fbd4d4] hover:bg-[#ffc6c6] text-[#800000] transition-colors cursor-pointer shadow-2xs"
                            title="Delete Document"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card List View */}
          <div className="lg:hidden space-y-3">
            {filteredFiles.map((file) => (
              <div
                key={file._id || file.id}
                className="bg-white border border-[#c7cad5] rounded-2xl p-4 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-extrabold text-[#1c1c1e] line-clamp-2">
                    {file.fileTitle}
                  </h3>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${getStatusBadge(
                      file.status
                    )}`}
                  >
                    {file.status || "Pending"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-[#f7f8fa] p-3 rounded-xl border border-[#e6e8ec]">
                  <div>
                    <span className="text-[10px] font-bold text-[#6a6d7c] uppercase block">Region</span>
                    <span className="font-semibold text-[#1c1c1e]">{file.region || "—"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#6a6d7c] uppercase block">Category 1</span>
                    <span className="font-semibold text-[#1c1c1e]">{file.category1 || "—"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#6a6d7c] uppercase block">Category 2</span>
                    <span className="font-semibold text-[#1c1c1e]">{file.category2 || "—"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#6a6d7c] uppercase block">Category 3</span>
                    <span className="font-semibold text-[#1c1c1e]">{file.category3 || "—"}</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1 border-t border-[#f0f1f4]">
                  <button
                    onClick={() => navigate(`/view-user-file/${file._id || file.id}`)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#c3faf5] text-[#187574] text-xs font-bold"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View</span>
                  </button>

                  <button
                    onClick={() => {
                      if (file.status === "Approved File" || file.status === "Rejected File") {
                        toast.error("You cannot edit an Approved or Rejected file")
                      } else {
                        handleEdit(file)
                        navigate(`/edit-user-file/${file._id || file.id}`, {
                          state: { status: file.status },
                        })
                      }
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#fff4c4] text-[#746019] text-xs font-bold"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => {
                      if (file.status === "Approved File" || file.status === "Rejected File") {
                        toast.error("You cannot delete an Approved or Rejected file")
                      } else {
                        handleDelete(file.fileTitle)
                      }
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#fbd4d4] text-[#800000] text-xs font-bold"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredFiles.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl border border-[#c7cad5] space-y-3">
              <div className="w-12 h-12 bg-[#fff4c4] rounded-2xl flex items-center justify-center mx-auto text-[#746019] shadow-2xs">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-[#1c1c1e]">No Study Files Found</h3>
              <p className="text-xs text-[#6a6d7c] max-w-sm mx-auto">
                {files.length === 0
                  ? "You haven't uploaded any study resources yet. Click 'Upload New File' to get started."
                  : "No files matched your active taxonomy filter criteria. Try clearing filters or searching for another keyword."}
              </p>
              {isFiltered ? (
                <button
                  onClick={clearFilters}
                  className="px-5 py-2 rounded-full bg-[#ffd02f] hover:bg-[#fcb900] text-[#1c1c1e] text-xs font-black uppercase tracking-wider transition-all shadow-sm cursor-pointer"
                >
                  Clear Filters
                </button>
              ) : (
                <button
                  onClick={() => navigate("/user-upload-file")}
                  className="px-5 py-2 rounded-full bg-[#1c1c1e] hover:bg-[#2c2c34] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-sm cursor-pointer"
                >
                  Upload First File
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}