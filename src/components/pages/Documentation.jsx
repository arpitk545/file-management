"use client"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Filter, FileText, Download, Star, Calendar } from "lucide-react"
import { useNavigate} from "react-router-dom"
import { Card, CardContent } from "../ui/card"
import { getAllFiles, GetFileRegion } from "../../services/operations/filesAPI"
import toast from "react-hot-toast"

export default function Documentation({ onNavigate }) {
  const navigate = useNavigate()
 //const location = useLocation()
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedRegion, setSelectedRegion] = useState("")
  const [selectedCategory1, setSelectedCategory1] = useState("")
  const [selectedCategory2, setSelectedCategory2] = useState("")
  const [selectedCategory3, setSelectedCategory3] = useState("")
  const [selectedCategory4, setSelectedCategory4] = useState("")
  const [selectedCategory5, setSelectedCategory5] = useState("")
  const [allFiles, setAllFiles] = useState([]) // Renamed from 'files'
  const [regions, setRegions] = useState([])
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)

  // State for "See More" functionality
  const [showAllRegions, setShowAllRegions] = useState(false)
  const [showAllCategory1, setShowAllCategory1] = useState(false)
  const [showAllCategory2, setShowAllCategory2] = useState(false)
  const [showAllCategory3, setShowAllCategory3] = useState(false)
  const [showAllCategory4, setShowAllCategory4] = useState(false)
  const [showAllCategory5, setShowAllCategory5] = useState(false)

  // Fetch regions and files on component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true)
        // Fetch regions
        const regionResponse = await GetFileRegion()
        const regionData = regionResponse?.data || []
        setRegions(regionData)
        // Fetch files
        const filesResponse = await getAllFiles()
        setAllFiles(filesResponse?.data || []) // Use setAllFiles
      } catch (error) {
        console.error("Error fetching initial data:", error)
        toast.error("Failed to load data")
      } finally {
        setLoading(false)
      }
    }
    fetchInitialData()
    const token = localStorage.getItem("token")
    setIsLoggedIn(!!token)
  }, [])

  // Get category options based on selected region
  const getCategory1Options = () => {
    if (!selectedRegion) return []
    const region = regions.find((r) => r.name === selectedRegion)
    return region?.category1?.map((cat) => cat.name) || []
  }
  const getCategory2Options = () => {
    if (!selectedRegion || !selectedCategory1) return []
    const region = regions.find((r) => r.name === selectedRegion)
    const category1 = region?.category1?.find((cat) => cat.name === selectedCategory1)
    return category1?.category2?.map((cat) => cat.name) || []
  }
  const getCategory3Options = () => {
    if (!selectedRegion || !selectedCategory1 || !selectedCategory2) return []
    const region = regions.find((r) => r.name === selectedRegion)
    const category1 = region?.category1?.find((cat) => cat.name === selectedCategory1)
    const category2 = category1?.category2?.find((cat) => cat.name === selectedCategory2)
    return category2?.category3?.map((cat) => cat.name) || []
  }
  const getCategory4Options = () => {
    if (!selectedRegion || !selectedCategory1 || !selectedCategory2 || !selectedCategory3) return []
    const region = regions.find((r) => r.name === selectedRegion)
    const category1 = region?.category1?.find((cat) => cat.name === selectedCategory1)
    const category2 = category1?.category2?.find((cat) => cat.name === selectedCategory2)
    const category3 = category2?.category3?.find((cat) => cat.name === selectedCategory3)
    return category3?.category4?.map((cat) => cat.name) || []
  }
  const getCategory5Options = () => {
    if (!selectedRegion || !selectedCategory1 || !selectedCategory2 || !selectedCategory3 || !selectedCategory4)
      return []
    const region = regions.find((r) => r.name === selectedRegion)
    const category1 = region?.category1?.find((cat) => cat.name === selectedCategory1)
    const category2 = category1?.category2?.find((cat) => cat.name === selectedCategory2)
    const category3 = category2?.category3?.find((cat) => cat.name === selectedCategory3)
    const category4 = category3?.category4?.find((cat) => cat.name === selectedCategory4)
    return category4?.category5?.map((cat) => cat.name) || []
  }

  const handleRegionSelect = (region) => {
    setSelectedRegion(region)
    setSelectedCategory1("")
    setSelectedCategory2("")
    setSelectedCategory3("")
    setSelectedCategory4("")
    setSelectedCategory5("")
    setCurrentStep(2)
    setShowAllRegions(false) // Reset "See More" for regions
  }
  const handleCategory1Select = (category) => {
    setSelectedCategory1(category)
    setSelectedCategory2("")
    setSelectedCategory3("")
    setSelectedCategory4("")
    setSelectedCategory5("")
    setCurrentStep(3)
    setShowAllCategory1(false) // Reset "See More" for category1
  }
  const handleCategory2Select = (category) => {
    setSelectedCategory2(category)
    setSelectedCategory3("")
    setSelectedCategory4("")
    setSelectedCategory5("")
    setCurrentStep(4)
    setShowAllCategory2(false) // Reset "See More" for category2
  }
  const handleCategory3Select = (category) => {
    setSelectedCategory3(category)
    setSelectedCategory4("")
    setSelectedCategory5("")
    setCurrentStep(5)
    setShowAllCategory3(false) // Reset "See More" for category3
  }
  const handleCategory4Select = (category) => {
    setSelectedCategory4(category)
    setSelectedCategory5("")
    setCurrentStep(6)
    setShowAllCategory4(false) // Reset "See More" for category4
  }
  const handleCategory5Select = (category) => {
    setSelectedCategory5(category)
    setCurrentStep(7)
    setShowAllCategory5(false) // Reset "See More" for category5
  }

  const resetFilters = () => {
    setCurrentStep(1)
    setSelectedRegion("")
    setSelectedCategory1("")
    setSelectedCategory2("")
    setSelectedCategory3("")
    setSelectedCategory4("")
    setSelectedCategory5("")
    setShowAllRegions(false)
    setShowAllCategory1(false)
    setShowAllCategory2(false)
    setShowAllCategory3(false)
    setShowAllCategory4(false)
    setShowAllCategory5(false)
  }

  const areFiltersActive = () => {
    return (
      selectedRegion !== "" ||
      selectedCategory1 !== "" ||
      selectedCategory2 !== "" ||
      selectedCategory3 !== "" ||
      selectedCategory4 !== "" ||
      selectedCategory5 !== ""
    )
  }

  const getFilteredFiles = () => {
    return allFiles.filter((file) => {
      // Filter from allFiles
      if (selectedRegion && file.region !== selectedRegion) return false
      if (selectedCategory1 && file.category1 !== selectedCategory1) return false
      if (selectedCategory2 && file.category2 !== selectedCategory2) return false
      if (selectedCategory3 && file.category3 !== selectedCategory3) return false
      if (selectedCategory4 && file.category4 && file.category4 !== selectedCategory4) return false
      if (selectedCategory5 && file.category5 && file.category5 !== selectedCategory5) return false
      return true
    })
  }

  const getFilesToDisplay = () => {
    const filtered = getFilteredFiles()
    if (!areFiltersActive() && allFiles.length > 0) {
      return [allFiles[0]] // Show only the first file if no filters are active
    }
    return filtered
  }

  const filesToRender = getFilesToDisplay()

  const handleViewFile = (fileId) => {
    // if (!isLoggedIn) {
    //   // Pass the current path as state to the login page for redirection after login
    //   navigate("/login", { state: { from: `/show-file/${fileId}` } })
    //   return
    // }
    navigate(`/show-file/${fileId}`)
  }

  // const handleDownloadFile = (fileId) => {
  //   if (!isLoggedIn) {
  //     navigate("/login", { state: { from: location.pathname } })
  //     return
  //   }
  //   // Implement download logic here
  //   toast.success("Downloading file...")
  // }

  if (loading) {
    return (
      <div className="fixed inset-0 overflow-auto bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading study materials...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 overflow-auto bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 md:mb-12"
        >
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Study{" "}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Documentation
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Find the perfect study materials with our advanced filtering system
          </p>
        </motion.div>
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Side - Filter UI */}
          <div className="lg:col-span-1 lg:order-1">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="sticky top-24"
            >
              <Card className="border-0 shadow-xl rounded-3xl overflow-hidden bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Smart Filters</h3>
                    {areFiltersActive() && ( // Show reset button if any filter is active
                      <motion.button
                        onClick={resetFilters}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                      >
                        Reset
                      </motion.button>
                    )}
                  </div>
                  {/* Progress Indicator */}
                  <div className="flex items-center mb-8 overflow-x-auto pb-2">
                    {[1, 2, 3, 4, 5, 6].map((step) => (
                      <div key={step} className="flex items-center flex-shrink-0">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                            currentStep >= step ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-600"
                          }`}
                        >
                          {step}
                        </div>
                        {step < 6 && (
                          <div className={`w-4 h-0.5 mx-1 ${currentStep > step ? "bg-purple-600" : "bg-gray-200"}`} />
                        )}
                      </div>
                    ))}
                  </div>
                  <AnimatePresence mode="wait">
                    {/* Step 1: Region Selection */}
                    {currentStep === 1 && (
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Select Region</h4>
                        <div className="space-y-3">
                          {regions.slice(0, showAllRegions ? regions.length : 4).map((region) => (
                            <motion.label
                              key={region._id}
                              whileHover={{ scale: 1.02, x: 5 }}
                              className="w-full flex items-center p-4 bg-gray-50 hover:bg-purple-50 rounded-2xl transition-all duration-300 group cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={selectedRegion === region.name}
                                onChange={() => handleRegionSelect(region.name)}
                                className="w-5 h-5 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2 mr-3"
                              />
                              <span className="font-medium text-gray-700 group-hover:text-purple-600">
                                {region.name}
                              </span>
                            </motion.label>
                          ))}
                          {regions.length > 4 && (
                            <button
                              onClick={() => setShowAllRegions((prev) => !prev)}
                              className="text-sm text-purple-600 hover:text-purple-700 font-medium mt-2"
                            >
                              {showAllRegions ? "See Less" : "See More"}
                            </button>
                          )}
                        </div>
                      </motion.div>
                    )}
                    {/* Step 2: Category 1 Selection */}
                    {currentStep === 2 && (
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="mb-4">
                          <span className="text-sm text-purple-600 font-medium">Selected: {selectedRegion}</span>
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Select Category 1</h4>
                        <div className="space-y-3">
                          {getCategory1Options()
                            .slice(0, showAllCategory1 ? getCategory1Options().length : 4)
                            .map((category) => (
                              <motion.label
                                key={category}
                                whileHover={{ scale: 1.02, x: 5 }}
                                className="w-full flex items-center p-4 bg-gray-50 hover:bg-purple-50 rounded-2xl transition-all duration-300 group cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedCategory1 === category}
                                  onChange={() => handleCategory1Select(category)}
                                  className="w-5 h-5 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2 mr-3"
                                />
                                <span className="font-medium text-gray-700 group-hover:text-purple-600">
                                  {category}
                                </span>
                              </motion.label>
                            ))}
                          {getCategory1Options().length > 4 && (
                            <button
                              onClick={() => setShowAllCategory1((prev) => !prev)}
                              className="text-sm text-purple-600 hover:text-purple-700 font-medium mt-2"
                            >
                              {showAllCategory1 ? "See Less" : "See More"}
                            </button>
                          )}
                        </div>
                      </motion.div>
                    )}
                    {/* Step 3: Category 2 Selection */}
                    {currentStep === 3 && (
                      <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="mb-4 space-y-1">
                          <span className="text-sm text-purple-600 font-medium block">Region: {selectedRegion}</span>
                          <span className="text-sm text-blue-600 font-medium block">
                            Category 1: {selectedCategory1}
                          </span>
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Select Category 2</h4>
                        <div className="space-y-3">
                          {getCategory2Options()
                            .slice(0, showAllCategory2 ? getCategory2Options().length : 4)
                            .map((category) => (
                              <motion.label
                                key={category}
                                whileHover={{ scale: 1.02, x: 5 }}
                                className="w-full flex items-center p-4 bg-gray-50 hover:bg-purple-50 rounded-2xl transition-all duration-300 group cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedCategory2 === category}
                                  onChange={() => handleCategory2Select(category)}
                                  className="w-5 h-5 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2 mr-3"
                                />
                                <span className="font-medium text-gray-700 group-hover:text-purple-600">
                                  {category}
                                </span>
                              </motion.label>
                            ))}
                          {getCategory2Options().length > 4 && (
                            <button
                              onClick={() => setShowAllCategory2((prev) => !prev)}
                              className="text-sm text-purple-600 hover:text-purple-700 font-medium mt-2"
                            >
                              {showAllCategory2 ? "See Less" : "See More"}
                            </button>
                          )}
                        </div>
                      </motion.div>
                    )}
                    {/* Step 4: Category 3 Selection */}
                    {currentStep === 4 && (
                      <motion.div
                        key="step4"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="mb-4 space-y-1">
                          <span className="text-sm text-purple-600 font-medium block">Region: {selectedRegion}</span>
                          <span className="text-sm text-blue-600 font-medium block">
                            Category 1: {selectedCategory1}
                          </span>
                          <span className="text-sm text-green-600 font-medium block">
                            Category 2: {selectedCategory2}
                          </span>
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Select Category 3</h4>
                        <div className="space-y-3">
                          {getCategory3Options()
                            .slice(0, showAllCategory3 ? getCategory3Options().length : 4)
                            .map((category) => (
                              <motion.label
                                key={category}
                                whileHover={{ scale: 1.02, x: 5 }}
                                className="w-full flex items-center p-4 bg-gray-50 hover:bg-purple-50 rounded-2xl transition-all duration-300 group cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedCategory3 === category}
                                  onChange={() => handleCategory3Select(category)}
                                  className="w-5 h-5 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2 mr-3"
                                />
                                <span className="font-medium text-gray-700 group-hover:text-purple-600">
                                  {category}
                                </span>
                              </motion.label>
                            ))}
                          {getCategory3Options().length > 4 && (
                            <button
                              onClick={() => setShowAllCategory3((prev) => !prev)}
                              className="text-sm text-purple-600 hover:text-purple-700 font-medium mt-2"
                            >
                              {showAllCategory3 ? "See Less" : "See More"}
                            </button>
                          )}
                        </div>
                      </motion.div>
                    )}
                    {/* Step 5: Category 4 Selection */}
                    {currentStep === 5 && (
                      <motion.div
                        key="step5-cat4"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="mb-4 space-y-1">
                          <span className="text-sm text-purple-600 font-medium block">Region: {selectedRegion}</span>
                          <span className="text-sm text-blue-600 font-medium block">
                            Category 1: {selectedCategory1}
                          </span>
                          <span className="text-sm text-green-600 font-medium block">
                            Category 2: {selectedCategory2}
                          </span>
                          <span className="text-sm text-yellow-600 font-medium block">
                            Category 3: {selectedCategory3}
                          </span>
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Select Category 4</h4>
                        <div className="space-y-3">
                          {getCategory4Options()
                            .slice(0, showAllCategory4 ? getCategory4Options().length : 4)
                            .map((category) => (
                              <motion.label
                                key={category}
                                whileHover={{ scale: 1.02, x: 5 }}
                                className="w-full flex items-center p-4 bg-gray-50 hover:bg-purple-50 rounded-2xl transition-all duration-300 group cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedCategory4 === category}
                                  onChange={() => handleCategory4Select(category)}
                                  className="w-5 h-5 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2 mr-3"
                                />
                                <span className="font-medium text-gray-700 group-hover:text-purple-600">
                                  {category}
                                </span>
                              </motion.label>
                            ))}
                          {getCategory4Options().length > 4 && (
                            <button
                              onClick={() => setShowAllCategory4((prev) => !prev)}
                              className="text-sm text-purple-600 hover:text-purple-700 font-medium mt-2"
                            >
                              {showAllCategory4 ? "See Less" : "See More"}
                            </button>
                          )}
                        </div>
                      </motion.div>
                    )}
                    {/* Step 6: Category 5 Selection */}
                    {currentStep === 6 && (
                      <motion.div
                        key="step6-cat5"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="mb-4 space-y-1">
                          <span className="text-sm text-purple-600 font-medium block">Region: {selectedRegion}</span>
                          <span className="text-sm text-blue-600 font-medium block">
                            Category 1: {selectedCategory1}
                          </span>
                          <span className="text-sm text-green-600 font-medium block">
                            Category 2: {selectedCategory2}
                          </span>
                          <span className="text-sm text-yellow-600 font-medium block">
                            Category 3: {selectedCategory3}
                          </span>
                          <span className="text-sm text-pink-600 font-medium block">
                            Category 4: {selectedCategory4}
                          </span>
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Select Category 5</h4>
                        <div className="space-y-3">
                          {getCategory5Options()
                            .slice(0, showAllCategory5 ? getCategory5Options().length : 4)
                            .map((category) => (
                              <motion.label
                                key={category}
                                whileHover={{ scale: 1.02, x: 5 }}
                                className="w-full flex items-center p-4 bg-gray-50 hover:bg-purple-50 rounded-2xl transition-all duration-300 group cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedCategory5 === category}
                                  onChange={() => handleCategory5Select(category)}
                                  className="w-5 h-5 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2 mr-3"
                                />
                                <span className="font-medium text-gray-700 group-hover:text-purple-600">
                                  {category}
                                </span>
                              </motion.label>
                            ))}
                          {getCategory5Options().length > 4 && (
                            <button
                              onClick={() => setShowAllCategory5((prev) => !prev)}
                              className="text-sm text-purple-600 hover:text-purple-700 font-medium mt-2"
                            >
                              {showAllCategory5 ? "See Less" : "See More"}
                            </button>
                          )}
                        </div>
                      </motion.div>
                    )}
                    {/* Step 7: Results Summary */}
                    {currentStep >= 7 && (
                      <motion.div
                        key="step7"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Filter Applied</h4>
                        <div className="space-y-3 mb-6">
                          <div className="p-3 bg-purple-50 rounded-xl">
                            <span className="text-sm font-medium text-purple-700">Region: {selectedRegion}</span>
                          </div>
                          {selectedCategory1 && (
                            <div className="p-3 bg-blue-50 rounded-xl">
                              <span className="text-sm font-medium text-blue-700">Category 1: {selectedCategory1}</span>
                            </div>
                          )}
                          {selectedCategory2 && (
                            <div className="p-3 bg-green-50 rounded-xl">
                              <span className="text-sm font-medium text-green-700">
                                Category 2: {selectedCategory2}
                              </span>
                            </div>
                          )}
                          {selectedCategory3 && (
                            <div className="p-3 bg-yellow-50 rounded-xl">
                              <span className="text-sm font-medium text-yellow-700">
                                Category 3: {selectedCategory3}
                              </span>
                            </div>
                          )}
                          {selectedCategory4 && (
                            <div className="p-3 bg-pink-50 rounded-xl">
                              <span className="text-sm font-medium text-pink-700">Category 4: {selectedCategory4}</span>
                            </div>
                          )}
                          {selectedCategory5 && (
                            <div className="p-3 bg-indigo-50 rounded-xl">
                              <span className="text-sm font-medium text-indigo-700">
                                Category 5: {selectedCategory5}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                          <span className="text-2xl font-bold text-purple-600">{filesToRender.length}</span>
                          <p className="text-sm text-gray-600 mt-1">Study files found</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          </div>
          {/* Right Side - Study Files */}
          <div className="lg:col-span-2 lg:order-2">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                Study Files
                {areFiltersActive() && ( // Only show count if filters are active
                  <span className="text-lg font-normal text-gray-600 ml-2">({filesToRender.length} results)</span>
                )}
              </h2>
              {filesToRender.length > 0 ? ( // Check filesToRender.length
                <div className="grid gap-6">
                  {filesToRender.map((file, index) => (
                    <motion.div
                      key={file._id || file.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      whileHover={{ scale: 1.02, y: -5 }}
                      className="group cursor-pointer"
                    >
                      <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-500 rounded-3xl overflow-hidden bg-white/80 backdrop-blur-sm">
                        <CardContent className="p-6 md:p-8 relative">
                          <div className="flex items-center justify-between mb-6">
                            <motion.div
                              className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                              whileHover={{ rotate: 5 }}
                            >
                              <FileText className="h-6 w-6 text-white" />
                            </motion.div>
                            {file.rating && (
                              <div className="flex items-center space-x-1">
                                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                                <span className="text-sm font-semibold text-gray-700">{file.rating}</span>
                              </div>
                            )}
                          </div>
                          <h3 className="font-bold text-xl text-gray-900 mb-2 group-hover:text-purple-600 transition-colors duration-300">
                            {file.fileTitle}
                          </h3>
                          {/* File Description */}
                          {file.fileDescription && (
                            <div
                              className="text-sm text-gray-700 mb-4"
                              dangerouslySetInnerHTML={{ __html: file.fileDescription }}
                            />
                          )}
                          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                            <div className="flex items-center">
                              <FileText className="h-4 w-4 mr-2" />
                              {file.fileType} • {file.fileSize}
                            </div>
                            {file.downloads && (
                              <div className="flex items-center">
                                <Download className="h-4 w-4 mr-2" />
                                {file.downloads} downloads
                              </div>
                            )}
                            {file.createdAt && (
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-2" />
                                {new Date(file.createdAt).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {file.region && (
                              <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-medium">
                                {file.region}
                              </span>
                            )}
                            {file.category1 && (
                              <span className="bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-xs font-medium">
                                {file.category1}
                              </span>
                            )}
                            {file.category2 && (
                              <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-xs font-medium">
                                {file.category2}
                              </span>
                            )}
                            {file.category3 && (
                              <span className="bg-yellow-100 text-yellow-600 px-3 py-1 rounded-full text-xs font-medium">
                                {file.category3}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-col gap-3 mt-4">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleViewFile(file._id || file.id)}
                              className="bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                              <FileText className="h-4 w-4 mr-2 inline" />
                              View File
                            </motion.button>
                            {/* <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleDownloadFile(file._id || file.id)}
                              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                              <Download className="h-4 w-4 mr-2 inline" />
                              Download
                            </motion.button> */}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 text-center">
                  <Filter className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    {areFiltersActive()
                      ? "No study files found matching your filters."
                      : "Use filters to find study materials"}
                  </h3>
                  <p className="text-gray-600">
                    {areFiltersActive()
                      ? "Try adjusting your selections or reset filters."
                      : "Select your region and categories to see relevant study files"}
                  </p>
                  {areFiltersActive() && (
                    <button
                      onClick={resetFilters}
                      className="mt-4 bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600 transition-colors duration-200"
                    >
                      Reset Filters
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
