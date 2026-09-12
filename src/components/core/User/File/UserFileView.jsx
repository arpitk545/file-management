"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { Filter, ArrowLeft, ArrowRight, Search, FileText, ImageIcon, X, Loader2 } from "lucide-react"
import { getAllFiles, GetFileRegion } from "../../../../services/operations/filesAPI"
import toast from "react-hot-toast"

export default function UserFileView() {
  const navigate = useNavigate()
  const [files, setFiles] = useState([])
  const [regions, setRegions] = useState([])
  const [regionOptions, setRegionOptions] = useState([])
  const [category1Options, setCategory1Options] = useState([])
  const [category2Options, setCategory2Options] = useState([])
  const [category3Options, setCategory3Options] = useState([])
  const [category4Options, setCategory4Options] = useState([])
  const [category5Options, setCategory5Options] = useState([])
  const [filters, setFilters] = useState({
    region: "",
    regionId: "",
    category1: "",
    category2: "",
    category3: "",
    category4: "",
    category5: "",
    status: "Approved File",
  })
  const [loading, setLoading] = useState(true)

  // Fetch regions and files on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const regionResponse = await GetFileRegion()
        const regionData = regionResponse?.data || []
        setRegions(regionData)
        setRegionOptions(
          regionData.map((region) => ({
            name: region.name,
            id: region._id,
          }))
        )

        const filesResponse = await getAllFiles()
        setFiles(filesResponse?.data || [])
      } catch (error) {
        console.error("Error fetching initial data:", error)
        toast.error("Failed to load data")
      } finally {
        setLoading(false)
      }
    }
    fetchInitialData()
  }, [])

  // Update category1 options when region changes
  useEffect(() => {
    if (filters.regionId) {
      const selectedRegion = regions.find((r) => r._id === filters.regionId)
      if (selectedRegion) {
        setFilters((prev) => ({
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
    } else {
      setCategory1Options([])
      setCategory2Options([])
      setCategory3Options([])
      setCategory4Options([])
      setCategory5Options([])
    }
  }, [filters.regionId, regions])

  // Update category2 options when category1 changes
  useEffect(() => {
    if (filters.regionId && filters.category1) {
      const selectedRegion = regions.find((r) => r._id === filters.regionId)
      if (selectedRegion) {
        const selectedCat1 = selectedRegion.category1?.find((cat) => cat.name === filters.category1)
        const cat2Options = selectedCat1?.category2?.map((cat) => cat.name) || []
        setCategory2Options(cat2Options)

        setFilters((prev) => ({
          ...prev,
          category2: "",
          category3: "",
          category4: "",
          category5: "",
        }))
        setCategory3Options([])
        setCategory4Options([])
        setCategory5Options([])
      }
    } else {
      setCategory2Options([])
      setCategory3Options([])
      setCategory4Options([])
      setCategory5Options([])
    }
  }, [filters.category1, filters.regionId, regions])

  // Update category3 options when category2 changes
  useEffect(() => {
    if (filters.regionId && filters.category1 && filters.category2) {
      const selectedRegion = regions.find((r) => r._id === filters.regionId)
      if (selectedRegion) {
        const selectedCat1 = selectedRegion.category1?.find((cat) => cat.name === filters.category1)
        const selectedCat2 = selectedCat1?.category2?.find((cat) => cat.name === filters.category2)
        const cat3Options = selectedCat2?.category3?.map((cat) => cat.name) || []
        setCategory3Options(cat3Options)

        setFilters((prev) => ({
          ...prev,
          category3: "",
          category4: "",
          category5: "",
        }))
        setCategory4Options([])
        setCategory5Options([])
      }
    } else {
      setCategory3Options([])
      setCategory4Options([])
      setCategory5Options([])
    }
  }, [filters.category2, filters.category1, filters.regionId, regions])

  // Update category4 options when category3 changes
  useEffect(() => {
    if (filters.regionId && filters.category1 && filters.category2 && filters.category3) {
      const selectedRegion = regions.find((r) => r._id === filters.regionId)
      if (selectedRegion) {
        const selectedCat1 = selectedRegion.category1?.find((cat) => cat.name === filters.category1)
        const selectedCat2 = selectedCat1?.category2?.find((cat) => cat.name === filters.category2)
        const selectedCat3 = selectedCat2?.category3?.find((cat) => cat.name === filters.category3)
        const cat4Options = selectedCat3?.category4?.map((cat) => cat.name) || []
        setCategory4Options(cat4Options)

        setFilters((prev) => ({
          ...prev,
          category4: "",
          category5: "",
        }))
        setCategory5Options([])
      }
    } else {
      setCategory4Options([])
      setCategory5Options([])
    }
  }, [filters.category3, filters.category2, filters.category1, filters.regionId, regions])

  // Update category5 options when category4 changes
  useEffect(() => {
    if (
      filters.regionId &&
      filters.category1 &&
      filters.category2 &&
      filters.category3 &&
      filters.category4
    ) {
      const selectedRegion = regions.find((r) => r._id === filters.regionId)
      if (selectedRegion) {
        const selectedCat1 = selectedRegion.category1?.find((cat) => cat.name === filters.category1)
        const selectedCat2 = selectedCat1?.category2?.find((cat) => cat.name === filters.category2)
        const selectedCat3 = selectedCat2?.category3?.find((cat) => cat.name === filters.category3)
        const selectedCat4 = selectedCat3?.category4?.find((cat) => cat.name === filters.category4)
        const cat5Options = selectedCat4?.category5?.map((cat) => cat.name) || []
        setCategory5Options(cat5Options)

        setFilters((prev) => ({
          ...prev,
          category5: "",
        }))
      }
    } else {
      setCategory5Options([])
    }
  }, [
    filters.category4,
    filters.category3,
    filters.category2,
    filters.category1,
    filters.regionId,
    regions,
  ])

  const filteredFiles = files.filter((file) => {
    return Object.keys(filters).every((key) => {
      if (!filters[key]) return true
      if (key === "regionId") return true
      return file[key] === filters[key]
    })
  })

  const handleFilterChange = (filterType, value) => {
    if (filterType === "region") {
      const selectedRegion = regionOptions.find((region) => region.name === value)
      setFilters((prev) => ({
        ...prev,
        region: value,
        regionId: selectedRegion ? selectedRegion.id : "",
        category1: "",
        category2: "",
        category3: "",
        category4: "",
        category5: "",
      }))
    } else {
      setFilters((prev) => ({
        ...prev,
        [filterType]: value,
      }))
    }
  }

  const clearFilters = () => {
    setFilters({
      region: "",
      regionId: "",
      category1: "",
      category2: "",
      category3: "",
      category4: "",
      category5: "",
      status: "Approved File",
    })
  }

  const handleViewClick = (id) => {
    navigate(`/show-file/${id}`)
  }

  const isFiltered =
    Boolean(filters.region) ||
    Boolean(filters.category1) ||
    Boolean(filters.category2) ||
    Boolean(filters.category3) ||
    Boolean(filters.category4) ||
    Boolean(filters.category5)

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f8fa] flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="w-12 h-12 rounded-2xl bg-[#ffd02f] flex items-center justify-center mb-4 shadow-sm animate-pulse">
          <Loader2 className="animate-spin h-6 w-6 text-[#1c1c1e]" />
        </div>
        <p className="text-xs font-bold uppercase tracking-wider text-[#6a6d7c]">
          Loading verified files...
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#1c1c1e] py-6 sm:py-10 px-4 sm:px-6 lg:px-8 xl:px-12 w-full font-sans">
      <div className="w-full space-y-6 sm:space-y-8">
        {/* Navigation & Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#c7cad5] bg-white text-xs font-semibold text-[#1c1c1e] hover:bg-[#ebecf0] transition-colors shadow-sm active:scale-95 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </button>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-[#ffd02f] text-[#1c1c1e] text-[11px] font-black uppercase tracking-widest rounded-full shadow-sm">
                RESOURCE LIBRARY
              </span>
              <span className="px-3 py-1 bg-[#c3faf5] text-[#187574] text-[11px] font-bold uppercase tracking-wider rounded-full">
                VERIFIED STUDY FILES
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#1c1c1e]">
              Browse Academic Resources
            </h1>
            <p className="text-xs sm:text-sm text-[#6a6d7c] max-w-2xl leading-relaxed">
              Explore syllabus guides, past exam question papers, and lecture notes curated and approved for your curriculum.
            </p>
          </div>
        </div>

        {/* Filter Card */}
        <div className="bg-white rounded-2xl border border-[#c7cad5] shadow-sm p-5 sm:p-7 space-y-4 w-full">
          <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-[#e6e8ec]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#ffd02f] border border-[#fde89c] flex items-center justify-center text-[#1c1c1e] shadow-2xs">
                <Filter className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-[#1c1c1e]">Filter Files</h2>
                <p className="text-xs text-[#6a6d7c]">Select regional board and academic levels</p>
              </div>
            </div>

            {isFiltered && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#fbd4d4] hover:bg-[#ffc6c6] text-[#800000] border border-[#e3c5c5] rounded-full text-xs font-bold transition-colors cursor-pointer shadow-2xs"
              >
                <X className="w-3.5 h-3.5" />
                <span>Clear All Filters</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* Region */}
            <div className="space-y-1.5 p-3 rounded-xl bg-[#fff4c4]/40 border border-[#fde89c]">
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#746019]">
                Region
              </label>
              <select
                value={filters.region}
                onChange={(e) => handleFilterChange("region", e.target.value)}
                className="w-full h-10 px-2.5 bg-white border border-[#fde89c] rounded-lg text-[#1c1c1e] font-semibold text-xs focus:outline-none focus:border-2 focus:border-[#ffd02f] cursor-pointer"
              >
                <option value="">All Regions</option>
                {regionOptions.map((option) => (
                  <option key={option.id} value={option.name}>
                    {option.name}
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
                value={filters.category1}
                onChange={(e) => handleFilterChange("category1", e.target.value)}
                disabled={!filters.regionId}
                className={`w-full h-10 px-2.5 bg-white border border-[#9eece4] rounded-lg text-[#1c1c1e] font-semibold text-xs focus:outline-none focus:border-2 focus:border-[#0fbcb0] cursor-pointer ${
                  !filters.regionId ? "opacity-50 cursor-not-allowed bg-gray-50" : ""
                }`}
              >
                <option value="">All Category 1</option>
                {category1Options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
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
                value={filters.category2}
                onChange={(e) => handleFilterChange("category2", e.target.value)}
                disabled={!filters.category1}
                className={`w-full h-10 px-2.5 bg-white border border-[#f3bee5] rounded-lg text-[#1c1c1e] font-semibold text-xs focus:outline-none focus:border-2 focus:border-[#86296b] cursor-pointer ${
                  !filters.category1 ? "opacity-50 cursor-not-allowed bg-gray-50" : ""
                }`}
              >
                <option value="">All Category 2</option>
                {category2Options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
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
                value={filters.category3}
                onChange={(e) => handleFilterChange("category3", e.target.value)}
                disabled={!filters.category2}
                className={`w-full h-10 px-2.5 bg-white border border-[#fcd0a1] rounded-lg text-[#1c1c1e] font-semibold text-xs focus:outline-none focus:border-2 focus:border-[#ff7347] cursor-pointer ${
                  !filters.category2 ? "opacity-50 cursor-not-allowed bg-gray-50" : ""
                }`}
              >
                <option value="">All Category 3</option>
                {category3Options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
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
                value={filters.category4}
                onChange={(e) => handleFilterChange("category4", e.target.value)}
                disabled={!filters.category3}
                className={`w-full h-10 px-2.5 bg-white border border-[#ddd6fe] rounded-lg text-[#1c1c1e] font-semibold text-xs focus:outline-none focus:border-2 focus:border-[#4262ff] cursor-pointer ${
                  !filters.category3 ? "opacity-50 cursor-not-allowed bg-gray-50" : ""
                }`}
              >
                <option value="">All Category 4</option>
                {category4Options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* Category 5 */}
            <div className="space-y-1.5 p-3 rounded-xl bg-[#f7f8fa] border border-[#c7cad5]">
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#555a6a]">
                Category 5
              </label>
              <select
                value={filters.category5}
                onChange={(e) => handleFilterChange("category5", e.target.value)}
                disabled={!filters.category4}
                className={`w-full h-10 px-2.5 bg-white border border-[#c7cad5] rounded-lg text-[#1c1c1e] font-semibold text-xs focus:outline-none focus:border-2 focus:border-[#1c1c1e] cursor-pointer ${
                  !filters.category4 ? "opacity-50 cursor-not-allowed bg-gray-50" : ""
                }`}
              >
                <option value="">All Category 5</option>
                {category5Options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-[#f0f1f4]">
            <p className="text-xs text-[#6a6d7c] font-medium">
              Showing <span className="font-bold text-[#1c1c1e]">{filteredFiles.length}</span> of{" "}
              <span className="font-bold text-[#1c1c1e]">{files.length}</span> verified files
            </p>
            {isFiltered && (
              <button
                onClick={clearFilters}
                className="text-xs text-[#4262ff] hover:underline font-bold cursor-pointer"
              >
                Clear All Filters
              </button>
            )}
          </div>
        </div>

        {/* Files Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
          {filteredFiles.map((file) => (
            <motion.div
              key={file._id || file.id}
              className="bg-white rounded-2xl border border-[#c7cad5] hover:border-[#1c1c1e] shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between p-4 group"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              <div>
                {/* Image Preview Container */}
                {file?.imageUrl ? (
                  <div className="w-full aspect-video flex items-center justify-center mb-3 rounded-xl overflow-hidden bg-[#f0f1f4] border border-[#e6e8ec]">
                    <img
                      src={file.imageUrl}
                      alt="File Preview"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="bg-[#f7f8fa] w-full aspect-video flex flex-col items-center justify-center rounded-xl mb-3 border border-[#e6e8ec] text-[#8e91a0]">
                    <FileText className="w-8 h-8 text-[#ffd02f] mb-1" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">
                      Study Document
                    </span>
                  </div>
                )}

                {/* File Title */}
                <h3 className="text-sm sm:text-base font-extrabold text-[#1c1c1e] leading-snug line-clamp-2 group-hover:text-[#4262ff] transition-colors mb-4">
                  {file.fileTitle}
                </h3>
              </div>

              {/* View Button - Miro button-primary (Black Pill) */}
              <button
                onClick={() => handleViewClick(file._id || file.id)}
                className="w-full py-3 px-6 bg-[#1c1c1e] hover:bg-[#2c2c34] active:bg-[#2c2c34] text-white font-bold text-xs uppercase tracking-wider rounded-full shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer mt-auto group/btn"
              >
                <span>View Resource</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#ffd02f] group-hover/btn:translate-x-0.5 transition-transform" />
              </button>
            </motion.div>
          ))}
        </div>

        {/* No Results Message */}
        {filteredFiles.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-[#c7cad5] space-y-3">
            <div className="w-12 h-12 bg-[#fff4c4] rounded-2xl flex items-center justify-center mx-auto text-[#746019] shadow-2xs">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-extrabold text-[#1c1c1e]">
              {files.length === 0 ? "No files available" : "No files found matching your filters"}
            </h3>
            <p className="text-xs text-[#6a6d7c] max-w-sm mx-auto">
              {files.length === 0
                ? "There are currently no approved files in the library."
                : "Try adjusting your taxonomy filters to discover available resources."}
            </p>
            {files.length > 0 && isFiltered && (
              <div className="pt-1">
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 rounded-full bg-[#ffd02f] hover:bg-[#fcb900] active:bg-[#e0b020] text-[#1c1c1e] text-xs font-black uppercase tracking-wider transition-all shadow-sm cursor-pointer"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}