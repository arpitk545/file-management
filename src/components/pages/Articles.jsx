"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "../ui/card"
import { BookOpen, Filter, Eye, Clock, Calendar, Users, CheckCircle } from "lucide-react"
import { getAllArticles, getAllRegionsWithStructure } from "../../services/operations/articelsAPI"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"

export default function Articles({ onNavigate }) {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedRegion, setSelectedRegion] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedSubCategory, setSelectedSubCategory] = useState(null)
  const [allArticles, setAllArticles] = useState([]) // Renamed to hold all fetched articles
  const [regionStructure, setRegionStructure] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch articles on component mount
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await getAllArticles()
        if (response.success) {
          const approvedArticles = response.data.filter((article) => article.status === "approved")
          setAllArticles(approvedArticles) // Store all approved articles
        } else {
          toast.error("Failed to fetch articles")
        }
      } catch (error) {
        console.error("Error fetching articles:", error)
        toast.error("Error loading articles")
      }
    }
    fetchArticles()
  }, [])

  // Fetch region structure with categories and subcategories
  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const response = await getAllRegionsWithStructure()
        if (response?.regions?.length > 0) {
          setRegionStructure(response.regions)
        } else {
          console.error("Failed to fetch region structure:", response.message)
        }
      } catch (error) {
        console.error("Error fetching region structure:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchRegions()
  }, [])

  const handleRegionSelect = (region) => {
    setSelectedRegion(region)
    setSelectedCategory(null)
    setSelectedSubCategory(null)
    setCurrentStep(2)
  }

  const handleCategorySelect = (category) => {
    setSelectedCategory(category)
    setSelectedSubCategory(null)
    setCurrentStep(3)
  }

  const handleSubCategorySelect = (subCategory) => {
    setSelectedSubCategory(subCategory)
    setCurrentStep(4)
  }

  const resetFilters = () => {
    setCurrentStep(1)
    setSelectedRegion(null)
    setSelectedCategory(null)
    setSelectedSubCategory(null)
  }

  const areFiltersActive = () => {
    return selectedRegion !== null || selectedCategory !== null || selectedSubCategory !== null
  }

  const getFilteredArticles = () => {
    return allArticles.filter((article) => {
      if (selectedRegion && article.region !== selectedRegion.name) return false
      if (selectedCategory && article.category !== selectedCategory.name) return false
      if (selectedSubCategory && article.subCategory !== selectedSubCategory.name) return false
      return true
    })
  }

  const getArticlesToDisplay = () => {
    if (!areFiltersActive() && allArticles.length > 0) {
      return [allArticles[0]] // Show only the first article if no filters are active
    }
    return getFilteredArticles() // Show filtered articles otherwise
  }

  const articlesToRender = getArticlesToDisplay()

  const handleArticleClick = (articleId) => {
      navigate(`/post-view/${articleId}`)
  }

  // Get categories for selected region
  const categories = selectedRegion ? selectedRegion.category || [] : []

  // Get subcategories for selected category
  const subCategories = selectedCategory ? selectedCategory.subCategory || [] : []

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading posts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 overflow-auto bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Header - Keep the same */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 md:mb-12"
        >
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Educational{" "}
            <span className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
              Posts
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover insightful posts and research papers from experts worldwide
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
                    {areFiltersActive() && ( // Show reset button if any filter is active
                      <motion.button
                        onClick={resetFilters}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="text-sm text-green-600 hover:text-green-700 font-medium"
                      >
                        Reset
                      </motion.button>
                    )}
                  </div>

                  {/* Progress Indicator - Keep the same */}
                  <div className="flex items-center mb-8">
                    {[1, 2, 3].map((step) => (
                      <div key={step} className="flex items-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                            currentStep >= step ? "bg-green-600 text-white" : "bg-gray-200 text-gray-600"
                          }`}
                        >
                          {step}
                        </div>
                        {step < 3 && (
                          <div className={`w-8 h-0.5 mx-2 ${currentStep > step ? "bg-green-600" : "bg-gray-200"}`} />
                        )}
                      </div>
                    ))}
                  </div>

                  <AnimatePresence mode="wait">
                    {/* Step 1: Region Selection - Modified */}
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
                          {regionStructure.map((region) => (
                            <motion.button
                              key={region._id}
                              onClick={() => handleRegionSelect(region)}
                              whileHover={{ scale: 1.02, x: 5 }}
                              whileTap={{ scale: 0.98 }}
                              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-green-50 rounded-2xl transition-all duration-300 group"
                            >
                              <span className="font-medium text-gray-700 group-hover:text-green-600">
                                {region.name}
                              </span>
                              <CheckCircle className="h-5 w-5 text-gray-300 group-hover:text-green-600" />
                            </motion.button>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {/* Step 2: Category Selection - Modified */}
                    {currentStep === 2 && (
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="mb-4">
                          <span className="text-sm text-green-600 font-medium">Selected: {selectedRegion?.name}</span>
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Select Category</h4>
                        <div className="space-y-3">
                          {categories.map((category) => (
                            <motion.button
                              key={category._id}
                              onClick={() => handleCategorySelect(category)}
                              whileHover={{ scale: 1.02, x: 5 }}
                              whileTap={{ scale: 0.98 }}
                              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-green-50 rounded-2xl transition-all duration-300 group"
                            >
                              <span className="font-medium text-gray-700 group-hover:text-green-600">
                                {category.name}
                              </span>
                              <CheckCircle className="h-5 w-5 text-gray-300 group-hover:text-green-600" />
                            </motion.button>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {/* Step 3: Sub-Category Selection - Modified */}
                    {currentStep === 3 && (
                      <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="mb-4 space-y-1">
                          <span className="text-sm text-green-600 font-medium block">
                            Region: {selectedRegion?.name}
                          </span>
                          <span className="text-sm text-blue-600 font-medium block">
                            Category: {selectedCategory?.name}
                          </span>
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Select Specific Level</h4>
                        <div className="space-y-3">
                          {subCategories.map((subCategory) => (
                            <motion.button
                              key={subCategory._id}
                              onClick={() => handleSubCategorySelect(subCategory)}
                              whileHover={{ scale: 1.02, x: 5 }}
                              whileTap={{ scale: 0.98 }}
                              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-green-50 rounded-2xl transition-all duration-300 group"
                            >
                              <span className="font-medium text-gray-700 group-hover:text-green-600">
                                {subCategory.name}
                              </span>
                              <CheckCircle className="h-5 w-5 text-gray-300 group-hover:text-green-600" />
                            </motion.button>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {/* Step 4: Results Summary - Modified */}
                    {currentStep === 4 && (
                      <motion.div
                        key="step4"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Filter Applied</h4>
                        <div className="space-y-3 mb-6">
                          <div className="p-3 bg-green-50 rounded-xl">
                            <span className="text-sm font-medium text-green-700">Region: {selectedRegion?.name}</span>
                          </div>
                          <div className="p-3 bg-blue-50 rounded-xl">
                            <span className="text-sm font-medium text-blue-700">
                              Category: {selectedCategory?.name}
                            </span>
                          </div>
                          <div className="p-3 bg-purple-50 rounded-xl">
                            <span className="text-sm font-medium text-purple-700">
                              Level: {selectedSubCategory?.name}
                            </span>
                          </div>
                        </div>
                        <div className="text-center p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl">
                          <span className="text-2xl font-bold text-green-600">{articlesToRender.length}</span>
                          <p className="text-sm text-gray-600 mt-1">Articles found</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right Side - Articles */}
          <div className="lg:col-span-2">
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                Posts
                {areFiltersActive() && ( // Show results count only if filters are active
                  <span className="text-lg font-normal text-gray-600 ml-2">({articlesToRender.length} results)</span>
                )}
              </h2>

              {articlesToRender.length > 0 ? (
                <div className="grid gap-6">
                  {articlesToRender.map((article, index) => (
                    <motion.div
                      key={article._id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      whileHover={{ scale: 1.02, y: -5 }}
                      className="group cursor-pointer"
                      onClick={() => handleArticleClick(article._id)}
                    >
                      <Card className="border-0 shadow-lg hover:shadow-2xl transition-all duration-500 rounded-3xl overflow-hidden bg-white/80 backdrop-blur-sm">
                        <CardContent className="p-6 md:p-8 relative">
                          <div className="flex items-center justify-between mb-6">
                            <motion.div
                              className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                              whileHover={{ rotate: 5 }}
                            >
                              <BookOpen className="h-6 w-6 text-white" />
                            </motion.div>
                            <div className="flex items-center space-x-1">
                              <Eye className="h-8 w-8 text-blue-500" />
                              <span className="text-sm font-semibold text-gray-700">{article.views}</span>
                            </div>
                          </div>

                          <h3 className="font-bold text-xl text-gray-900 mb-3 group-hover:text-green-600 transition-colors duration-300">
                            {article.title}
                          </h3>

                          <p
                            className="text-gray-600 mb-4 leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: article.content.substring(0, 150) + "more..." }}
                          ></p>

                          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                            <div className="flex items-center">
                              <Users className="h-4 w-4 mr-2" />
                              By {article.author?.username || "Admin"}
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-2" />
                              {Math.ceil(article.content.length / 1000) || 5} min read
                            </div>
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2" />
                              {new Date(article.createdAt).toLocaleDateString()}
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {article.category && (
                              <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-xs font-medium">
                                {article.region}
                              </span>
                            )}
                            {article.region && (
                              <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-medium">
                                {article.category}
                              </span>
                            )}
                            {article.subCategory && (
                              <span className="bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-xs font-medium">
                                {article.subCategory}
                              </span>
                            )}
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 mt-4"
                          >
                            <Eye className="h-4 w-4 mr-2 inline" />
                            View Post
                          </motion.button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 text-center">
                  <Filter className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    {areFiltersActive() ? "No articles found matching your filters" : "Use filters to find articles"}
                  </h3>
                  <p className="text-gray-600">
                    {areFiltersActive()
                      ? "Try adjusting your filters or check back later."
                      : "Select your region, category, and specific requirements to see relevant articles"}
                  </p>
                  {areFiltersActive() && (
                    <button
                      onClick={resetFilters}
                      className="mt-4 bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors duration-200"
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
