"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "../ui/card"
import { Filter, CheckCircle, Loader2, FileText, Eye, HelpCircle, MessageCircle } from "lucide-react"
import toast from "react-hot-toast"
import { useNavigate } from "react-router-dom"
import { getAllQandARegions, getAllQandA } from "../../services/operations/qandA"

export default function Qanda() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [filters, setFilters] = useState({
    region: "",
    examType: "",
    specificClass: "",
    subject: "",
    chapter: "",
  })
  const [qandas, setQandas] = useState([])
  const [regionsData, setRegionsData] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch Q&A and regions on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [qandaRes, regionsRes] = await Promise.all([
          getAllQandA(),
          getAllQandARegions()
        ])

        const activeQandAs = (qandaRes?.data || []).filter(
          (q) => q.status === "active"
        )
         
        setQandas(activeQandAs)
        setRegionsData(regionsRes?.data || [])
      } catch (error) {
        console.error("Failed to fetch data:", error)
        toast.error("Failed to load data")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Navigation handlers
  useEffect(() => {
    const handleBackButton = (event) => {
      event.preventDefault()
      navigate("/dashboard", { replace: true }) 
    }
  
    window.addEventListener("popstate", handleBackButton)
  
    return () => {
      window.removeEventListener("popstate", handleBackButton)
    }
  }, [navigate])

  const handleFilterChange = (name, value) => {
    setFilters((prev) => {
      const newFilters = { ...prev, [name]: value }

      // Reset dependent filters when parent changes
      if (name === "region") {
        newFilters.examType = ""
        newFilters.specificClass = ""
        newFilters.subject = ""
        newFilters.chapter = ""
        setCurrentStep(2)
      } else if (name === "examType") {
        newFilters.specificClass = ""
        newFilters.subject = ""
        newFilters.chapter = ""
        setCurrentStep(3)
      } else if (name === "specificClass") {
        newFilters.subject = ""
        newFilters.chapter = ""
        setCurrentStep(4)
      } else if (name === "subject") {
        newFilters.chapter = ""
        setCurrentStep(5)
      } else if (name === "chapter") {
        setCurrentStep(6)
      }
      return newFilters
    })
  }

  const getExamTypes = () => {
    if (!filters.region) return []
    const selectedRegion = regionsData.find((region) => region.name === filters.region || region._id === filters.region)
    return selectedRegion?.examTypes?.map((type) => type.name) || []
  }

  const getSpecificClasses = () => {
    if (!filters.region || !filters.examType) return []
    const selectedRegion = regionsData.find((region) => region.name === filters.region || region._id === filters.region)
    const selectedExamType = selectedRegion?.examTypes.find((et) => et.name === filters.examType)
    return selectedExamType?.specificClasses?.map((cls) => cls.name) || []
  }

  const getSubjects = () => {
    if (!filters.region || !filters.examType || !filters.specificClass) return []
    const selectedRegion = regionsData.find((region) => region.name === filters.region || region._id === filters.region)
    const selectedExamType = selectedRegion?.examTypes.find((et) => et.name === filters.examType)
    const selectedSpecificClass = selectedExamType?.specificClasses.find((sc) => sc.name === filters.specificClass)
    return selectedSpecificClass?.subjects?.map((subject) => subject.name) || []
  }

  const getChapters = () => {
    if (!filters.region || !filters.examType || !filters.specificClass || !filters.subject) return []
    const selectedRegion = regionsData.find((region) => region.name === filters.region || region._id === filters.region)
    const selectedExamType = selectedRegion?.examTypes.find((et) => et.name === filters.examType)
    const selectedSpecificClass = selectedExamType?.specificClasses.find((sc) => sc.name === filters.specificClass)
    const selectedSubject = selectedSpecificClass?.subjects.find((sub) => sub.name === filters.subject)
    return selectedSubject?.chapters?.map((ch) => ch.name) || []
  }

  const resetFilters = () => {
    setCurrentStep(1)
    setFilters({
      region: "",
      examType: "",
      specificClass: "",
      subject: "",
      chapter: "",
    })
  }

  const areFiltersActive = () => {
    return (
      filters.region !== "" ||
      filters.examType !== "" ||
      filters.specificClass !== "" ||
      filters.subject !== "" ||
      filters.chapter !== ""
    )
  }

  // FIXED: Corrected filtering logic
  const getQandasToDisplay = () => {
    // If no filters are active and there are qandas, show only the first one
    if (!areFiltersActive() && qandas.length > 0) {
      return [qandas[0]]
    }
    
    // Resolve the actual region name from the selected filter
    let selectedRegionName = filters.region
    if (filters.region) {
      const selectedRegion = regionsData.find(r => r._id === filters.region || r.name === filters.region)
      selectedRegionName = selectedRegion?.name || filters.region
    }
    
    const filtered = qandas.filter((qanda) => {
      const category = qanda.category || {}
      
      // Region comparison
      if (filters.region && category.region !== selectedRegionName) {
        return false
      }
      
      // Exam type comparison
      if (filters.examType && category.examType !== filters.examType) {
        return false
      }
      
      // Specific class comparison
      if (filters.specificClass && category.specificClass !== filters.specificClass) {
        return false
      }
      
      // Subject comparison
      if (filters.subject && category.subject !== filters.subject) {
        return false
      }
      
      // Chapter comparison
      if (filters.chapter && qanda.chapterName !== filters.chapter) {
        return false
      }
      
      return true
    })
    
    return filtered
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-12 w-12 text-indigo-500" />
      </div>
    )
  }

  const qandasToRender = getQandasToDisplay()

  return (
    <div className="fixed inset-0 overflow-auto bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 md:mb-12"
        >
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Interactive{" "}
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Q & A
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Find detailed study material questions and answers through our filtering system
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Side - Filter UI */}
          <div className="lg:col-span-1 order-first">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="sticky top-24"
            >
              <Card className="border-0 shadow-xl rounded-3xl overflow-hidden bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Smart Filters</h3>
                    {areFiltersActive() && (
                      <motion.button
                        onClick={resetFilters}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                      >
                        Reset
                      </motion.button>
                    )}
                  </div>

                  {/* Progress Indicator */}
                  <div className="flex items-center mb-8 overflow-x-auto pb-2">
                    {[1, 2, 3, 4, 5].map((step) => (
                      <div key={step} className="flex items-center flex-shrink-0">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                            currentStep >= step ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-600"
                          }`}
                        >
                          {step}
                        </div>
                        {step < 5 && (
                          <div className={`w-4 h-0.5 mx-1 ${currentStep > step ? "bg-indigo-600" : "bg-gray-200"}`} />
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
                          {regionsData.map((region) => (
                            <motion.button
                              key={region._id}
                              onClick={() => handleFilterChange("region", region.name || region._id)}
                              whileHover={{ scale: 1.02, x: 5 }}
                              whileTap={{ scale: 0.98 }}
                              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-indigo-50 rounded-2xl transition-all duration-300 group"
                            >
                              <span className="font-medium text-gray-700 group-hover:text-indigo-600">
                                {region.name}
                              </span>
                              <CheckCircle className="h-5 w-5 text-gray-300 group-hover:text-indigo-600" />
                            </motion.button>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {/* Step 2: Exam Type Selection */}
                    {currentStep === 2 && (
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="mb-4">
                          <span className="text-sm text-indigo-600 font-medium">
                            Selected Region: {regionsData.find((r) => r.name === filters.region || r._id === filters.region)?.name}
                          </span>
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Select Exam Type</h4>
                        <div className="space-y-3">
                          {getExamTypes().map((type) => (
                            <motion.button
                              key={type}
                              onClick={() => handleFilterChange("examType", type)}
                              whileHover={{ scale: 1.02, x: 5 }}
                              whileTap={{ scale: 0.98 }}
                              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-indigo-50 rounded-2xl transition-all duration-300 group"
                            >
                              <span className="font-medium text-gray-700 group-hover:text-indigo-600">{type}</span>
                              <CheckCircle className="h-5 w-5 text-gray-300 group-hover:text-indigo-600" />
                            </motion.button>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {/* Step 3: Specific Class Selection */}
                    {currentStep === 3 && (
                      <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="mb-4 space-y-1">
                          <span className="text-sm text-indigo-600 font-medium block">
                            Region: {regionsData.find((r) => r.name === filters.region || r._id === filters.region)?.name}
                          </span>
                          <span className="text-sm text-blue-600 font-medium block">Exam Type: {filters.examType}</span>
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Select Specific Class</h4>
                        <div className="space-y-3">
                          {getSpecificClasses().map((cls) => (
                            <motion.button
                              key={cls}
                              onClick={() => handleFilterChange("specificClass", cls)}
                              whileHover={{ scale: 1.02, x: 5 }}
                              whileTap={{ scale: 0.98 }}
                              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-indigo-50 rounded-2xl transition-all duration-300 group"
                            >
                              <span className="font-medium text-gray-700 group-hover:text-indigo-600">{cls}</span>
                              <CheckCircle className="h-5 w-5 text-gray-300 group-hover:text-indigo-600" />
                            </motion.button>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {/* Step 4: Subject Selection */}
                    {currentStep === 4 && (
                      <motion.div
                        key="step4"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="mb-4 space-y-1">
                          <span className="text-sm text-indigo-600 font-medium block">
                            Region: {regionsData.find((r) => r.name === filters.region || r._id === filters.region)?.name}
                          </span>
                          <span className="text-sm text-blue-600 font-medium block">Exam Type: {filters.examType}</span>
                          <span className="text-sm text-purple-600 font-medium block">
                            Class: {filters.specificClass}
                          </span>
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Select Subject</h4>
                        <div className="space-y-3">
                          {getSubjects().map((sub) => (
                            <motion.button
                              key={sub}
                              onClick={() => handleFilterChange("subject", sub)}
                              whileHover={{ scale: 1.02, x: 5 }}
                              whileTap={{ scale: 0.98 }}
                              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-indigo-50 rounded-2xl transition-all duration-300 group"
                            >
                              <span className="font-medium text-gray-700 group-hover:text-indigo-600">{sub}</span>
                              <CheckCircle className="h-5 w-5 text-gray-300 group-hover:text-indigo-600" />
                            </motion.button>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {/* Step 5: Chapter Selection */}
                    {currentStep === 5 && (
                      <motion.div
                        key="step5"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="mb-4 space-y-1">
                          <span className="text-sm text-indigo-600 font-medium block">
                            Region: {regionsData.find((r) => r.name === filters.region || r._id === filters.region)?.name}
                          </span>
                          <span className="text-sm text-blue-600 font-medium block">Exam Type: {filters.examType}</span>
                          <span className="text-sm text-purple-600 font-medium block">
                            Class: {filters.specificClass}
                          </span>
                          <span className="text-sm text-green-600 font-medium block">Subject: {filters.subject}</span>
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Select Chapter</h4>
                        <div className="space-y-3">
                          {getChapters().map((ch) => (
                            <motion.button
                              key={ch}
                              onClick={() => handleFilterChange("chapter", ch)}
                              whileHover={{ scale: 1.02, x: 5 }}
                              whileTap={{ scale: 0.98 }}
                              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-indigo-50 rounded-2xl transition-all duration-300 group"
                            >
                              <span className="font-medium text-gray-700 group-hover:text-indigo-600">{ch}</span>
                              <CheckCircle className="h-5 w-5 text-gray-300 group-hover:text-indigo-600" />
                            </motion.button>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {/* Step 6: Results Summary */}
                    {currentStep === 6 && (
                      <motion.div
                        key="step6"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Filter Applied</h4>
                        <div className="space-y-3 mb-6">
                          {filters.region && (
                            <div className="p-3 bg-indigo-50 rounded-xl">
                              <span className="text-sm font-medium text-indigo-700">
                                Region: {regionsData.find((r) => r.name === filters.region || r._id === filters.region)?.name || filters.region}
                              </span>
                            </div>
                          )}
                          {filters.examType && (
                            <div className="p-3 bg-blue-50 rounded-xl">
                              <span className="text-sm font-medium text-blue-700">Exam Type: {filters.examType}</span>
                            </div>
                          )}
                          {filters.specificClass && (
                            <div className="p-3 bg-purple-50 rounded-xl">
                              <span className="text-sm font-medium text-purple-700">
                                Class: {filters.specificClass}
                              </span>
                            </div>
                          )}
                          {filters.subject && (
                            <div className="p-3 bg-green-50 rounded-xl">
                              <span className="text-sm font-medium text-green-700">Subject: {filters.subject}</span>
                            </div>
                          )}
                          {filters.chapter && (
                            <div className="p-3 bg-red-50 rounded-xl">
                              <span className="text-sm font-medium text-red-700">Chapter: {filters.chapter}</span>
                            </div>
                          )}
                        </div>
                        <div className="text-center p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
                          <span className="text-2xl font-bold text-indigo-600">{qandasToRender.length}</span>
                          <p className="text-sm text-gray-600 mt-1">Active Q & As found</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right Side - Q&A */}
          <div className="lg:col-span-2">
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                Active Q & A
                {areFiltersActive() && (
                  <span className="text-lg font-normal text-gray-600 ml-2">({qandasToRender.length} results)</span>
                )}
              </h2>

              {qandasToRender.length > 0 ? (
                <div className="grid gap-6">
                  {qandasToRender.map((qanda, index) => (
                    <motion.div
                      key={qanda._id}
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
                              className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                              whileHover={{ rotate: 5 }}
                            >
                              <MessageCircle className="h-6 w-6 text-white" />
                            </motion.div>
                          </div>

                          <h3 className="font-bold text-xl text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors duration-300">
                            {qanda.chapterName || "Untitled Q&A"}
                          </h3>

                          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                            <div className="flex items-center">
                              <HelpCircle className="h-4 w-4 mr-2" />
                              {qanda.questions?.length || 0} questions
                            </div>
                            <div className="flex items-center">
                              <FileText className="h-4 w-4 mr-2" />
                              {qanda.category?.examType || "N/A"}
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 mb-4">
                            <span className="bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full text-xs font-medium">
                              {qanda.category?.region || "N/A"}
                            </span>
                            <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-medium">
                              {qanda.category?.examType || "N/A"}
                            </span>
                            <span className="bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-xs font-medium">
                              {qanda.category?.specificClass || "N/A"}
                            </span>
                            {qanda.category?.subject && (
                              <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-xs font-medium">
                                {qanda.category?.subject}
                              </span>
                            )}
                            {qanda.chapterName && (
                              <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-medium">
                                {qanda.chapterName}
                              </span>
                            )}
                          </div>

                          <motion.button
                            onClick={() => navigate(`/user-qanda-detail/${qanda._id}`)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
                          >
                            <Eye className="w-5 h-5" />
                            View Q & A
                          </motion.button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 text-center">
                  <Filter className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No active Q & As found.</h3>
                  <p className="text-gray-600">Try adjusting your filters or check back later for new additions.</p>
                  {areFiltersActive() && (
                    <button
                      onClick={resetFilters}
                      className="mt-4 bg-indigo-500 text-white px-6 py-2 rounded-lg hover:bg-indigo-600 transition-colors duration-200"
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