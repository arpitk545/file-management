"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Filter, Search, X } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { getAllArticles, getAllRegionsWithStructure } from "../../../../services/operations/articelsAPI"
import toast from "react-hot-toast"

const AllPost = () => {
  const navigate = useNavigate()
  const [articles, setArticles] = useState([])
  const [regionsData, setRegionsData] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedRegion, setSelectedRegion] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedSubcategory, setSelectedSubcategory] = useState(null)

  // Fetch articles on component mount
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await getAllArticles()
        if (response.success) {
          // Filter only approved articles
          const approvedArticles = response.data.filter((article) => article.status === "approved")
          setArticles(approvedArticles)
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

  // Fetch region structure
  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const response = await getAllRegionsWithStructure()
        setRegionsData(response.regions || response)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching region structure:", error)
        toast.error("Failed to load regions data")
        setLoading(false)
      }
    }
    fetchRegions()
  }, [])

  useEffect(() => {
  const handleBackButton = (event) => {
    event.preventDefault();
    navigate("/dashboard", { replace: true }); 
  };

  window.addEventListener("popstate", handleBackButton);

  return () => {
    window.removeEventListener("popstate", handleBackButton);
  };
}, [navigate]);


  const getCategoriesForRegion = (regionId) => {
    const region = regionsData.find(r => r._id === regionId)
    return region ? region.category : []
  }

  const getSubcategoriesForCategory = (regionId, categoryId) => {
    const region = regionsData.find(r => r._id === regionId)
    if (!region) return []
    
    const category = region.category.find(cat => cat._id === categoryId)
    return category ? category.subCategory : []
  }

  const handleRegionChange = (e) => {
    const regionId = e.target.value
    const region = regionsData.find(r => r._id === regionId)
    setSelectedRegion(region || null)
    setSelectedCategory(null)
    setSelectedSubcategory(null)
  }

  const handleCategoryChange = (e) => {
    const categoryId = e.target.value
    if (!selectedRegion) return
    
    const category = selectedRegion.category.find(cat => cat._id === categoryId)
    setSelectedCategory(category || null)
    setSelectedSubcategory(null)
  }

  const handleSubcategoryChange = (e) => {
    const subcategoryId = e.target.value
    if (!selectedRegion || !selectedCategory) return
    
    const subcategory = selectedCategory.subCategory.find(sub => sub._id === subcategoryId)
    setSelectedSubcategory(subcategory || null)
  }

  // Filter articles based on selected filters
  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      const matchesRegion = !selectedRegion || article.region === selectedRegion.name
      const matchesCategory = !selectedCategory || article.category === selectedCategory.name
      const matchesSubCategory = !selectedSubcategory || article.subCategory === selectedSubcategory.name

      return matchesRegion && matchesCategory && matchesSubCategory
    })
  }, [articles, selectedRegion, selectedCategory, selectedSubcategory])

  const clearFilters = () => {
    setSelectedRegion(null)
    setSelectedCategory(null)
    setSelectedSubcategory(null)
  }

  const handleArticleClick = (articleId) => {
    navigate(`/post-view/${articleId}`)
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.4 },
    },
  }

 if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800">Loading your Posts...</h2>
          <p className="text-gray-600">Please wait while we process your Posts</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 overflow-auto bg-gradient-to-br from-white via-blue-50 to-gray-100 p-4 md:p-8 lg:p-12">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Filter Section */}
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="w-full">
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <Filter className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Filter Posts</h2>
                  <p className="text-sm text-gray-500">Find posts by region and category</p>
                </div>
              </div>
              {(selectedRegion || selectedCategory || selectedSubcategory) && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={clearFilters}
                  className="flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-lg transition-all duration-200 border border-red-200"
                >
                  <X className="w-4 h-4" />
                  Clear All
                </motion.button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Region Filter */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Region</label>
                <select
                  value={selectedRegion?._id || ""}
                  onChange={handleRegionChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-700"
                >
                  <option value="">All Regions</option>
                  {regionsData.map((region) => (
                    <option key={region._id} value={region._id}>
                      {region.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category Filter */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Category</label>
                <select
                  value={selectedCategory?._id || ""}
                  onChange={handleCategoryChange}
                  disabled={!selectedRegion}
                  className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-700 ${
                    !selectedRegion ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <option value="">All Categories</option>
                  {selectedRegion &&
                    getCategoriesForRegion(selectedRegion._id).map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* Subcategory Filter */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Subcategory</label>
                <select
                  value={selectedSubcategory?._id || ""}
                  onChange={handleSubcategoryChange}
                  disabled={!selectedCategory}
                  className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-gray-700 ${
                    !selectedCategory ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <option value="">All Subcategories</option>
                  {selectedRegion &&
                    selectedCategory &&
                    getSubcategoriesForCategory(selectedRegion._id, selectedCategory._id).map((subcategory) => (
                      <option key={subcategory._id} value={subcategory._id}>
                        {subcategory.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            {/* Filter Summary */}
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Search className="w-4 h-4" />
                <span>
                  Showing {filteredArticles.length} of {articles.length} posts
                </span>
              </div>
              {(selectedRegion || selectedCategory || selectedSubcategory) && (
                <div className="flex items-center gap-2">
                  {selectedRegion && (
                    <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-medium">
                      {selectedRegion.name}
                    </span>
                  )}
                  {selectedCategory && (
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                      {selectedCategory.name}
                    </span>
                  )}
                  {selectedSubcategory && (
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                      {selectedSubcategory.name}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Articles Section */}
        <motion.div variants={containerVariants} className="w-full">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Posts</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <AnimatePresence>
              {filteredArticles.map((article, index) => (
                <motion.div
                  key={article._id}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative rounded-2xl overflow-hidden shadow-lg cursor-pointer group transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
                  onClick={() => handleArticleClick(article._id)}
                >
                 <div className="w-full h-60 rounded-lg overflow-hidden bg-gray-100">
                   <img
                     src={article.thumbnail || "/placeholder.svg"}
                     alt={article.title || "Article thumbnail"}
                     className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                   />
                 </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white text-lg font-semibold text-left leading-tight hover:underline focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-900">
                      {article.title}
                    </h3>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* No Results Message */}
          {filteredArticles.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 bg-white rounded-2xl shadow-lg"
            >
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No posts found</h3>
              <p className="text-gray-600 mb-4">
                {articles.length === 0
                  ? "No approved posts available at the moment."
                  : "Try adjusting your filter criteria to find more posts."}
              </p>
              {(selectedRegion || selectedCategory || selectedSubcategory) && (
                <button
                  onClick={clearFilters}
                  className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-200"
                >
                  Clear Filters
                </button>
              )}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default AllPost