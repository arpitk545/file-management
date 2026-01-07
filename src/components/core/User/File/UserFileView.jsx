"use client"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { ChevronDown, ChevronUp, Filter } from "lucide-react"
import { getAllFiles, GetFileRegion } from "../../../../services/operations/filesAPI"
import toast from "react-hot-toast"

export default function UserFileView() {
  const navigate = useNavigate()
  const [expandedCard, setExpandedCard] = useState(null)
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

  // Fetch regions and files on component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch regions
        const regionResponse = await GetFileRegion()
        const regionData = regionResponse?.data || []
        setRegions(regionData)
        setRegionOptions(
          regionData.map((region) => ({
            name: region.name,
            id: region._id,
          })),
        )

        // Fetch files
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
        // Reset all categories when region changes
        setFilters((prev) => ({
          ...prev,
          category1: "",
          category2: "",
          category3: "",
          category4: "",
          category5: "",
        }))

        // Set category1 options
        const cat1Options = selectedRegion.category1?.map((cat) => cat.name) || []
        setCategory1Options(cat1Options)
        setCategory2Options([])
        setCategory3Options([])
        setCategory4Options([])
        setCategory5Options([])
      }
    } else {
      // Reset all category options when no region is selected
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

        // Reset subsequent categories
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

        // Reset subsequent categories
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

        // Reset subsequent categories
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
    if (filters.regionId && filters.category1 && filters.category2 && filters.category3 && filters.category4) {
      const selectedRegion = regions.find((r) => r._id === filters.regionId)
      if (selectedRegion) {
        const selectedCat1 = selectedRegion.category1?.find((cat) => cat.name === filters.category1)
        const selectedCat2 = selectedCat1?.category2?.find((cat) => cat.name === filters.category2)
        const selectedCat3 = selectedCat2?.category3?.find((cat) => cat.name === filters.category3)
        const selectedCat4 = selectedCat3?.category4?.find((cat) => cat.name === filters.category4)
        const cat5Options = selectedCat4?.category5?.map((cat) => cat.name) || []
        setCategory5Options(cat5Options)

        // Reset category5 if it doesn't exist in new options
        setFilters((prev) => ({
          ...prev,
          category5: "",
        }))
      }
    } else {
      setCategory5Options([])
    }
  }, [filters.category4, filters.category3, filters.category2, filters.category1, filters.regionId, regions])


  const filteredFiles = files.filter((file) => {
    return Object.keys(filters).every((key) => {
      if (!filters[key]) return true
      if (key === "regionId") return true 
      return file[key] === filters[key]
    })
  })

  const handleFilterChange = (filterType, value) => {
    if (filterType === "region") {
      // Find the region ID when region name is selected
      const selectedRegion = regionOptions.find((region) => region.name === value)
      setFilters((prev) => ({
        ...prev,
        region: value,
        regionId: selectedRegion ? selectedRegion.id : "",
        // Reset all categories when region changes
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

  const toggleCardExpansion = (id) => {
    setExpandedCard(expandedCard === id ? null : id)
  }

  const FilterDropdown = ({ label, value, options, onChange, filterKey, disabled = false }) => (
    <div className="flex flex-col">
      <label className="text-sm font-medium text-gray-700 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(filterKey, e.target.value)}
        disabled={disabled}
        className={`px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm ${
          disabled ? "bg-gray-100 cursor-not-allowed" : ""
        }`}
      >
        <option value="">All {label}</option>
        {options.map((option) => (
          <option
            key={typeof option === "string" ? option : option.name}
            value={typeof option === "string" ? option : option.name}
          >
            {typeof option === "string" ? option : option.name}
          </option>
        ))}
      </select>
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-gray-100 p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading files...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 overflow-auto bg-gradient-to-br from-white via-blue-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-screen-xl mx-auto">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">Browse Files</h1>

        {/* Filter Card */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-800">Filter Files</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
            <FilterDropdown
              label="Region"
              value={filters.region}
              options={regionOptions}
              onChange={handleFilterChange}
              filterKey="region"
            />
            <FilterDropdown
              label="Category 1"
              value={filters.category1}
              options={category1Options}
              onChange={handleFilterChange}
              filterKey="category1"
              disabled={!filters.regionId}
            />
            <FilterDropdown
              label="Category 2"
              value={filters.category2}
              options={category2Options}
              onChange={handleFilterChange}
              filterKey="category2"
              disabled={!filters.category1}
            />
            <FilterDropdown
              label="Category 3"
              value={filters.category3}
              options={category3Options}
              onChange={handleFilterChange}
              filterKey="category3"
              disabled={!filters.category2}
            />
            <FilterDropdown
              label="Category 4"
              value={filters.category4}
              options={category4Options}
              onChange={handleFilterChange}
              filterKey="category4"
              disabled={!filters.category3}
            />
            <FilterDropdown
              label="Category 5"
              value={filters.category5}
              options={category5Options}
              onChange={handleFilterChange}
              filterKey="category5"
              disabled={!filters.category4}
            />
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {filteredFiles.length} of {files.length} files
            </p>
            <button onClick={clearFilters} className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              Clear All Filters
            </button>
          </div>
        </motion.div>

        {/* Files Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredFiles.map((file) => (
            <motion.div
              key={file._id || file.id}
              className={`bg-white rounded-xl shadow-md overflow-hidden flex flex-col p-4 transform transition-all duration-300 hover:shadow-lg ${
                expandedCard === (file._id || file.id) ? "md:col-span-2 lg:col-span-2" : ""
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              layout
            >
              {file?.imageUrl ? (
              <div className="w-full max-h-[300px] flex items-center justify-center mb-4 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                <img
                  src={file.imageUrl}
                  alt="File Preview"
                  className="h-auto max-h-[300px] w-auto max-w-full object-contain"
                />
              </div>
            ) : (
              <div className="bg-gray-100 w-full h-40 flex items-center justify-center rounded-lg mb-4">
                <span className="text-gray-400">File Preview</span>
              </div>
            )}
              <h3 className="text-lg font-semibold text-gray-800 text-center mb-3">{file.fileTitle}</h3>

              {/* Show Details Button */}
              <button
                onClick={() => toggleCardExpansion(file._id || file.id)}
                className="flex items-center justify-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium mb-3 transition-colors duration-200"
              >
                <span>Show Details</span>
                {expandedCard === (file._id || file.id) ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>

              {/* Expanded Details */}
              <AnimatePresence>
                {expandedCard === (file._id || file.id) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mb-4 space-y-3"
                  >
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">Region:</span>
                        <span className="text-sm text-gray-800 bg-blue-100 px-2 py-1 rounded-full">{file.region}</span>
                      </div>

                      <div className="grid grid-cols-1 gap-2">
                        {[
                          { label: "Category 1", value: file.category1 },
                          { label: "Category 2", value: file.category2 },
                          { label: "Category 3", value: file.category3 },
                          { label: "Category 4", value: file.category4 },
                          { label: "Category 5", value: file.category5 },
                        ].map((category, index) => {
                          if (!category.value) return null
                          return (
                            <div key={index} className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-600">{category.label}:</span>
                              <span className="text-sm text-gray-800 bg-green-100 px-2 py-1 rounded-full">
                                {category.value}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* View Button */}
              <button
                onClick={() => handleViewClick(file._id || file.id)}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium py-2 px-6 rounded-full shadow-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-200 mt-auto"
              >
                View
              </button>
            </motion.div>
          ))}
        </div>

        {/* No Results Message */}
        {filteredFiles.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-12">
            <div className="text-gray-500 text-lg mb-4">
              {files.length === 0 ? "No files available" : "No files found matching your filters"}
            </div>
            {files.length > 0 && (
              <button
                onClick={clearFilters}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200"
              >
                Clear Filters
              </button>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}
