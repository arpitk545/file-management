"use client"

import { useState, useMemo, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Filter, Trash2, ArrowLeft, Eye, CheckCircle, XCircle, Users, Sparkles } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { GetFileRegion, getAllFiles, deleteFileByTitle, updateFileStatus } from "../../../../services/operations/filesAPI"
import toast from "react-hot-toast"

const MiroLoader = ({ message = "Loading user submissions..." }) => (
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

const FilteruserFile = () => {
  const navigate = useNavigate()
  const [regions, setRegions] = useState([])
  const [regionOptions, setRegionOptions] = useState([])
  const [category1Options, setCategory1Options] = useState([])
  const [category2Options, setCategory2Options] = useState([])
  const [category3Options, setCategory3Options] = useState([])
  const [category4Options, setCategory4Options] = useState([])
  const [category5Options, setCategory5Options] = useState([])
  const [isLoading, setIsLoading] = useState(true)

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

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setIsLoading(true)
        const [regionsRes, filesRes] = await Promise.all([
          GetFileRegion(),
          getAllFiles(),
        ])

        const data = regionsRes?.data || []
        setRegions(data)
        setRegionOptions(data.map((region) => ({
          name: region.name,
          id: region._id,
        })))

        const allFiles = filesRes?.data || []
        const userFiles = allFiles.filter((file) => file.role === "user")
        setFiles(userFiles)
      } catch (error) {
        console.error("Failed to load user files:", error)
        toast.error("Failed to load user files data")
      } finally {
        setIsLoading(false)
      }
    }
    fetchOptions()
  }, [])

  // Update category options when region changes
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
    if (formData.regionId && formData.category1 && formData.category2 && formData.category3 && formData.category4) {
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
  }, [formData.category4, formData.category3, formData.category2, formData.category1, formData.regionId, regions])

  const handleApprove = async (file) => {
    const fileId = file._id || file.id
    try {
      await updateFileStatus(fileId, "Approved File")
      setFiles((prev) =>
        prev.map((f) => ((f._id === fileId || f.id === fileId) ? { ...f, status: "Approved File" } : f))
      )
      toast.success(`"${file.fileTitle}" approved successfully!`)
    } catch (err) {
      console.error("Failed to approve file:", err)
      toast.error("Failed to approve file")
    }
  }

  const handleReject = async (file) => {
    const fileId = file._id || file.id
    try {
      await updateFileStatus(fileId, "Rejected File")
      setFiles((prev) =>
        prev.map((f) => ((f._id === fileId || f.id === fileId) ? { ...f, status: "Rejected File" } : f))
      )
      toast.success(`"${file.fileTitle}" rejected successfully!`)
    } catch (err) {
      console.error("Failed to reject file:", err)
      toast.error("Failed to reject file")
    }
  }

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
  }

  const filteredFiles = useMemo(() => {
    return files.filter((file) => {
      const matchesRegion = !filterValues.region || 
        (file.region === filterValues.region && file.regionId === filterValues.regionId)
      const matchesCategory1 = !filterValues.category1 || file.category1?.includes(filterValues.category1)
      const matchesCategory2 = !filterValues.category2 || file.category2?.includes(filterValues.category2)
      const matchesCategory3 = !filterValues.category3 || file.category3?.includes(filterValues.category3)
      const matchesCategory4 =
        !filterValues.category4 || (file.category4 && file.category4.includes(filterValues.category4))
      const matchesCategory5 =
        !filterValues.category5 || (file.category5 && file.category5.includes(filterValues.category5))
      const matchesStatus = !filterValues.status || file.status === filterValues.status

      return (
        matchesRegion &&
        matchesCategory1 &&
        matchesCategory2 &&
        matchesCategory3 &&
        matchesCategory4 &&
        matchesCategory5 &&
        matchesStatus
      )
    })
  }, [files, filterValues])

  const handleDelete = async (fileTitle) => {
    try {
      const confirm = window.confirm(`Are you sure you want to delete "${fileTitle}"?`)
      if (!confirm) return
      await deleteFileByTitle(fileTitle)
      setFiles((prev) => prev.filter((file) => file.fileTitle !== fileTitle))
      toast.success("File deleted successfully!")
    } catch (error) {
      console.error("Failed to delete file:", error)
      toast.error("Failed to delete File. Please try again.")
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
  }

  const getStatusColor = (status) => {
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

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#1c1c1e] py-6 sm:py-8 px-4 sm:px-6 lg:px-8 xl:px-12 w-full">
      <div className="w-full space-y-6">
        
        {/* Header Bar (Posts Pattern) */}
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
              FILE STUDIO
            </span>
            <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#ffe6cd] text-[#7c3a00] border border-[#fcd0a1]">
              COMMUNITY SUBMISSIONS
            </span>
          </div>
          <button
            onClick={() => navigate("/filter-file")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1c1c1e] text-white hover:bg-[#2c2c34] text-sm font-bold transition-all shadow-sm self-start sm:self-auto active:scale-98"
          >
            <span>All Repository Files</span>
            <Sparkles className="w-4 h-4 text-[#ffd02f]" />
          </button>
        </div>

        {/* Page Title */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#1c1c1e]">
            User Uploaded Files Review
          </h1>
          <p className="text-sm sm:text-base text-[#555a6a]">
            Verify, approve, or reject resources contributed by community members and students.
          </p>
        </div>

        {/* Step 1 Card: Taxonomy Filter Card (Lavender Palette) */}
        <div className="bg-[#f5f3ff] rounded-2xl border-2 border-[#ddd6fe] shadow-sm p-5 sm:p-7 space-y-4 w-full">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-[#4262ff] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                <Filter className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-[#1c1c1e]">Filter Community Submissions</h2>
            </div>
            {(filterValues.region ||
              filterValues.category1 ||
              filterValues.category2 ||
              filterValues.category3 ||
              filterValues.category4 ||
              filterValues.category5 ||
              filterValues.status) && (
              <button
                onClick={clearFilters}
                className="text-xs font-bold px-3 py-1 rounded-full bg-white text-[#4262ff] border border-[#ddd6fe] hover:bg-white/80 transition-all"
              >
                Clear Filters
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
            {/* Status (Yellow) */}
            <div className="space-y-1.5 p-3 rounded-xl bg-white border border-[#ddd6fe]">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#746019]">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full h-10 px-3 bg-[#fff8e0]/60 border border-[#fde89c] rounded-lg text-[#1c1c1e] font-semibold text-xs focus:outline-none focus:border-2 focus:border-[#4262ff]"
              >
                <option value="">All Statuses</option>
                <option value="Waiting for Approval">Waiting for Approval</option>
                <option value="Approved File">Approved File</option>
                <option value="Rejected File">Rejected File</option>
              </select>
            </div>

            {/* Region (Teal) */}
            <div className="space-y-1.5 p-3 rounded-xl bg-white border border-[#ddd6fe]">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#187574]">Region</label>
              <select
                name="region"
                value={formData.regionId}
                onChange={handleInputChange}
                className="w-full h-10 px-3 bg-[#c3faf5]/40 border border-[#9eece4] rounded-lg text-[#1c1c1e] font-semibold text-xs focus:outline-none focus:border-2 focus:border-[#0fbcb0]"
              >
                <option value="">All Regions</option>
                {regionOptions.map((reg) => (
                  <option key={reg.id} value={reg.id}>
                    {reg.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Category 1 (Rose) */}
            <div className="space-y-1.5 p-3 rounded-xl bg-white border border-[#ddd6fe]">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#86296b]">Category 1</label>
              <select
                name="category1"
                value={formData.category1}
                onChange={handleInputChange}
                disabled={!formData.regionId}
                className={`w-full h-10 px-3 bg-[#ffd8f4]/35 border border-[#f3bee5] rounded-lg text-[#1c1c1e] font-semibold text-xs focus:outline-none focus:border-2 focus:border-[#86296b] ${
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

            {/* Category 2 (Orange) */}
            <div className="space-y-1.5 p-3 rounded-xl bg-white border border-[#ddd6fe]">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#7c3a00]">Category 2</label>
              <select
                name="category2"
                value={formData.category2}
                onChange={handleInputChange}
                disabled={!formData.category1}
                className={`w-full h-10 px-3 bg-[#ffe6cd]/40 border border-[#fcd0a1] rounded-lg text-[#1c1c1e] font-semibold text-xs focus:outline-none focus:border-2 focus:border-[#ff7347] ${
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

            {/* Category 3 (Lavender) */}
            <div className="space-y-1.5 p-3 rounded-xl bg-white border border-[#ddd6fe]">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#4262ff]">Category 3</label>
              <select
                name="category3"
                value={formData.category3}
                onChange={handleInputChange}
                disabled={!formData.category2}
                className={`w-full h-10 px-3 bg-[#f5f3ff] border border-[#ddd6fe] rounded-lg text-[#1c1c1e] font-semibold text-xs focus:outline-none focus:border-2 focus:border-[#4262ff] ${
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

            {/* Category 4 (Neutral) */}
            <div className="space-y-1.5 p-3 rounded-xl bg-white border border-[#ddd6fe]">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#555a6a]">Category 4</label>
              <select
                name="category4"
                value={formData.category4}
                onChange={handleInputChange}
                disabled={!formData.category3 || category4Options.length === 0}
                className={`w-full h-10 px-3 bg-white border border-[#c7cad5] rounded-lg text-[#1c1c1e] font-semibold text-xs focus:outline-none focus:border-2 focus:border-[#4262ff] ${
                  !formData.category3 || category4Options.length === 0 ? "opacity-50 cursor-not-allowed bg-gray-50" : ""
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

        {/* Results Card */}
        <div className="bg-white rounded-2xl border border-[#e0e2e8] shadow-sm p-5 sm:p-7 space-y-6 w-full">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#e0e2e8]">
            <div className="flex items-center gap-2.5">
              <Users className="w-5 h-5 text-[#ff7347]" />
              <h2 className="text-lg sm:text-xl font-bold text-[#1c1c1e]">
                User Contributions ({filteredFiles.length})
              </h2>
            </div>
            {filteredFiles.length !== files.length && (
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#f5f3ff] text-[#4262ff] border border-[#ddd6fe]">
                Filtered from {files.length} submissions
              </span>
            )}
          </div>

          {isLoading ? (
            <MiroLoader message="Fetching community submissions..." />
          ) : filteredFiles.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-[#c7cad5] rounded-2xl p-6">
              <Search className="w-10 h-10 text-[#8e91a0] mx-auto mb-2" />
              <h3 className="text-base font-bold text-[#1c1c1e]">No user uploads found</h3>
              <p className="text-xs sm:text-sm text-[#555a6a] mt-1">Adjust filters or check back later for new community submissions</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto rounded-xl border border-[#e0e2e8]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#e0e2e8] text-xs font-bold text-[#555a6a] uppercase tracking-wider bg-[#f7f8fa]">
                      <th className="px-4 py-3.5">Region</th>
                      <th className="px-4 py-3.5">Category 1</th>
                      <th className="px-4 py-3.5">Category 2</th>
                      <th className="px-4 py-3.5">Category 3</th>
                      <th className="px-4 py-3.5 text-center">Status</th>
                      <th className="px-4 py-3.5">File Title</th>
                      <th className="px-4 py-3.5 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e0e2e8]">
                    {filteredFiles.map((file) => (
                      <tr key={file._id || file.id} className="hover:bg-[#f7f8fa] transition-colors text-sm">
                        <td className="px-4 py-3.5 font-bold text-[#1c1c1e] whitespace-nowrap">{file.region || "—"}</td>
                        <td className="px-4 py-3.5 text-[#555a6a]">{file.category1 || "—"}</td>
                        <td className="px-4 py-3.5 text-[#555a6a]">{file.category2 || "—"}</td>
                        <td className="px-4 py-3.5 text-[#555a6a]">{file.category3 || "—"}</td>
                        <td className="px-4 py-3.5 text-center">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${getStatusColor(file.status)}`}>
                            {file.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 font-semibold text-[#1c1c1e] max-w-xs truncate" title={file.fileTitle}>
                          {file.fileTitle}
                        </td>
                        <td className="px-4 py-3.5 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => navigate(`/view-file/${file._id || file.id}`)}
                              className="p-2 text-[#4262ff] hover:bg-[#f5f3ff] rounded-full transition-colors active:scale-95"
                              title="View File"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {file.status !== "Approved File" && (
                              <button
                                onClick={() => handleApprove(file)}
                                className="p-2 text-[#0fbcb0] hover:bg-[#c3faf5]/30 rounded-full transition-colors active:scale-95"
                                title="Approve File"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}
                            {file.status !== "Rejected File" && (
                              <button
                                onClick={() => handleReject(file)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors active:scale-95"
                                title="Reject File"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(file.fileTitle)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors active:scale-95"
                              title="Delete File"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards View */}
              <div className="lg:hidden space-y-3">
                {filteredFiles.map((file) => (
                  <div key={file._id || file.id} className="p-4 rounded-xl border border-[#e0e2e8] bg-white space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-sm sm:text-base text-[#1c1c1e]">{file.fileTitle}</h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold shrink-0 ${getStatusColor(file.status)}`}>
                        {file.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs bg-[#f7f8fa] p-2.5 rounded-lg">
                      <div><span className="font-semibold text-[#555a6a]">Region:</span> <span className="font-bold text-[#1c1c1e]">{file.region}</span></div>
                      <div><span className="font-semibold text-[#555a6a]">Cat 1:</span> <span className="text-[#1c1c1e]">{file.category1}</span></div>
                      <div><span className="font-semibold text-[#555a6a]">Cat 2:</span> <span className="text-[#1c1c1e]">{file.category2}</span></div>
                      <div><span className="font-semibold text-[#555a6a]">Cat 3:</span> <span className="text-[#1c1c1e]">{file.category3}</span></div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#e0e2e8]">
                      <button
                        onClick={() => navigate(`/view-file/${file._id || file.id}`)}
                        className="px-3 py-1.5 rounded-full bg-[#f5f3ff] text-[#4262ff] text-xs font-bold flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                      {file.status !== "Approved File" && (
                        <button
                          onClick={() => handleApprove(file)}
                          className="px-3 py-1.5 rounded-full bg-[#c3faf5] text-[#187574] text-xs font-bold flex items-center gap-1"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                      )}
                      {file.status !== "Rejected File" && (
                        <button
                          onClick={() => handleReject(file)}
                          className="px-3 py-1.5 rounded-full bg-[#fbd4d4] text-[#800000] text-xs font-bold flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(file.fileTitle)}
                        className="p-1.5 rounded-full text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default FilteruserFile