"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Filter,
  Search,
  X,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Sparkles,
  Calendar,
  Layers,
  MapPin,
  Tag,
  Loader2,
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { getAllArticles, getAllRegionsWithStructure } from "../../../../services/operations/articelsAPI"
import toast from "react-hot-toast"

export default function AllPost() {
  const navigate = useNavigate()
  const [articles, setArticles] = useState([])
  const [regionsData, setRegionsData] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRegion, setSelectedRegion] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedSubcategory, setSelectedSubcategory] = useState(null)

  // Fetch articles on mount
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await getAllArticles()
        if (response?.success) {
          const approvedArticles = (response.data || []).filter(
            (article) => article.status === "approved"
          )
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
        setRegionsData(response?.regions || response || [])
      } catch (error) {
        console.error("Error fetching region structure:", error)
        toast.error("Failed to load regions data")
      } finally {
        setLoading(false)
      }
    }
    fetchRegions()
  }, [])

  // Popstate handler for back navigation
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

  const getCategoriesForRegion = (regionId) => {
    const region = regionsData.find((r) => r._id === regionId)
    return region ? region.category || [] : []
  }

  const getSubcategoriesForCategory = (regionId, categoryId) => {
    const region = regionsData.find((r) => r._id === regionId)
    if (!region) return []

    const category = (region.category || []).find((cat) => cat._id === categoryId)
    return category ? category.subCategory || [] : []
  }

  const handleRegionChange = (e) => {
    const regionId = e.target.value
    const region = regionsData.find((r) => r._id === regionId)
    setSelectedRegion(region || null)
    setSelectedCategory(null)
    setSelectedSubcategory(null)
  }

  const handleCategoryChange = (e) => {
    const categoryId = e.target.value
    if (!selectedRegion) return

    const category = (selectedRegion.category || []).find((cat) => cat._id === categoryId)
    setSelectedCategory(category || null)
    setSelectedSubcategory(null)
  }

  const handleSubcategoryChange = (e) => {
    const subcategoryId = e.target.value
    if (!selectedRegion || !selectedCategory) return

    const subcategory = (selectedCategory.subCategory || []).find(
      (sub) => sub._id === subcategoryId
    )
    setSelectedSubcategory(subcategory || null)
  }

  // Filter articles based on region, category, subcategory and text search
  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      const matchesRegion =
        !selectedRegion || article.region === selectedRegion.name
      const matchesCategory =
        !selectedCategory || article.category === selectedCategory.name
      const matchesSubCategory =
        !selectedSubcategory || article.subCategory === selectedSubcategory.name

      const matchesSearch =
        !searchQuery.trim() ||
        (article.title &&
          article.title.toLowerCase().includes(searchQuery.trim().toLowerCase())) ||
        (article.category &&
          article.category.toLowerCase().includes(searchQuery.trim().toLowerCase())) ||
        (article.region &&
          article.region.toLowerCase().includes(searchQuery.trim().toLowerCase()))

      return matchesRegion && matchesCategory && matchesSubCategory && matchesSearch
    })
  }, [articles, selectedRegion, selectedCategory, selectedSubcategory, searchQuery])

  const clearFilters = () => {
    setSelectedRegion(null)
    setSelectedCategory(null)
    setSelectedSubcategory(null)
    setSearchQuery("")
  }

  const handleArticleClick = (articleId) => {
    navigate(`/post-view/${articleId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f8fa] flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="w-12 h-12 rounded-2xl bg-[#ffd02f] flex items-center justify-center mb-4 shadow-sm animate-pulse">
          <Loader2 className="animate-spin h-6 w-6 text-[#1c1c1e]" />
        </div>
        <p className="text-xs font-bold uppercase tracking-wider text-[#6a6d7c]">
          Loading educational articles...
        </p>
      </div>
    )
  }

  const isFiltered = selectedRegion || selectedCategory || selectedSubcategory || searchQuery.trim()

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#1c1c1e] py-6 sm:py-10 px-4 sm:px-6 lg:px-8 xl:px-12 w-full font-sans">
      <div className="w-full space-y-8">
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
                KNOWLEDGE HUB
              </span>
              <span className="px-3 py-1 bg-[#c3faf5] text-[#187574] text-[11px] font-bold uppercase tracking-wider rounded-full">
                VERIFIED ARTICLES
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#1c1c1e]">
              Explore Academic Posts & Guides
            </h1>
            <p className="text-xs sm:text-sm text-[#6a6d7c] max-w-2xl leading-relaxed">
              Discover syllabus-aligned study posts, academic guidelines, and expert learning materials categorized by curriculum region and subject.
            </p>
          </div>
        </div>

        {/* Filter Card */}
        <div className="bg-white rounded-2xl border border-[#c7cad5] shadow-sm p-5 sm:p-7 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e6e8ec] pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#ffd02f] border border-[#fde89c] flex items-center justify-center text-[#1c1c1e] shadow-2xs">
                <Filter className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[#1c1c1e]">Filter Knowledge Base</h3>
                <p className="text-xs text-[#6a6d7c]">Select region, curriculum level, or search keywords</p>
              </div>
            </div>

            {isFiltered && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#fbd4d4] hover:bg-[#ffc6c6] text-[#800000] border border-[#e3c5c5] rounded-full text-xs font-bold transition-colors cursor-pointer shadow-2xs self-start sm:self-auto"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>

          {/* Filter Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-sans">
            {/* Search Keyword */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#6a6d7c]">
                Search Topic or Title
              </label>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8e91a0] pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g. Physics, Calculus..."
                  className="w-full h-11 min-h-[44px] pl-10 pr-4 bg-[#f7f8fa] border border-[#c7cad5] rounded-xl text-xs font-semibold text-[#1c1c1e] placeholder-[#8e91a0] focus:bg-white focus:outline-none focus:border-[#1c1c1e] transition-all"
                />
              </div>
            </div>

            {/* Region Select */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#6a6d7c]">
                Region / Board
              </label>
              <select
                value={selectedRegion?._id || ""}
                onChange={handleRegionChange}
                className="w-full h-11 min-h-[44px] px-3.5 bg-[#f7f8fa] border border-[#c7cad5] rounded-xl text-xs font-semibold text-[#1c1c1e] focus:bg-white focus:outline-none focus:border-[#1c1c1e] transition-all cursor-pointer"
              >
                <option value="">All Regions & Boards</option>
                {regionsData.map((region) => (
                  <option key={region._id} value={region._id}>
                    {region.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Select */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#6a6d7c]">
                Academic Category
              </label>
              <select
                value={selectedCategory?._id || ""}
                onChange={handleCategoryChange}
                disabled={!selectedRegion}
                className={`w-full h-11 min-h-[44px] px-3.5 bg-[#f7f8fa] border border-[#c7cad5] rounded-xl text-xs font-semibold text-[#1c1c1e] focus:bg-white focus:outline-none focus:border-[#1c1c1e] transition-all cursor-pointer ${
                  !selectedRegion ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <option value="">
                  {selectedRegion ? "All Categories" : "Select Region First"}
                </option>
                {selectedRegion &&
                  getCategoriesForRegion(selectedRegion._id).map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
              </select>
            </div>

            {/* Subcategory Select */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#6a6d7c]">
                Subcategory / Stream
              </label>
              <select
                value={selectedSubcategory?._id || ""}
                onChange={handleSubcategoryChange}
                disabled={!selectedCategory}
                className={`w-full h-11 min-h-[44px] px-3.5 bg-[#f7f8fa] border border-[#c7cad5] rounded-xl text-xs font-semibold text-[#1c1c1e] focus:bg-white focus:outline-none focus:border-[#1c1c1e] transition-all cursor-pointer ${
                  !selectedCategory ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <option value="">
                  {selectedCategory ? "All Subcategories" : "Select Category First"}
                </option>
                {selectedRegion &&
                  selectedCategory &&
                  getSubcategoriesForCategory(selectedRegion._id, selectedCategory._id).map(
                    (subcategory) => (
                      <option key={subcategory._id} value={subcategory._id}>
                        {subcategory.name}
                      </option>
                    )
                  )}
              </select>
            </div>
          </div>

          {/* Active Filter Chips & Counter */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-[#f0f1f4]">
            <div className="text-xs text-[#6a6d7c] font-medium flex items-center gap-1.5">
              <span className="font-bold text-[#1c1c1e]">{filteredArticles.length}</span>
              <span>of</span>
              <span className="font-bold text-[#1c1c1e]">{articles.length}</span>
              <span>posts available</span>
            </div>

            {isFiltered && (
              <div className="flex items-center gap-2 flex-wrap">
                {selectedRegion && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#fff4c4] text-[#746019] border border-[#fde89c]">
                    <MapPin className="w-3 h-3" />
                    <span>{selectedRegion.name}</span>
                  </span>
                )}
                {selectedCategory && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#c3faf5] text-[#187574] border border-[#9eece4]">
                    <Layers className="w-3 h-3" />
                    <span>{selectedCategory.name}</span>
                  </span>
                )}
                {selectedSubcategory && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#ffd8f4] text-[#86296b] border border-[#fbd4d4]">
                    <Tag className="w-3 h-3" />
                    <span>{selectedSubcategory.name}</span>
                  </span>
                )}
                {searchQuery.trim() && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#e1f0ff] text-[#2a41b6] border border-[#c7cad5]">
                    <Search className="w-3 h-3" />
                    <span>"{searchQuery.trim()}"</span>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Posts Gallery */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#1c1c1e] tracking-tight">
              Published Academic Articles
            </h2>
            <span className="text-xs font-bold text-[#6a6d7c] uppercase tracking-wider">
              {filteredArticles.length} {filteredArticles.length === 1 ? "Result" : "Results"}
            </span>
          </div>

          {filteredArticles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
              {filteredArticles.map((article) => {
                const formattedDate = article.createdAt
                  ? new Date(article.createdAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                  : null

                return (
                  <div
                    key={article._id}
                    onClick={() => handleArticleClick(article._id)}
                    className="group bg-white rounded-2xl border border-[#c7cad5] hover:border-[#1c1c1e] shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between cursor-pointer"
                  >
                    <div>
                      {/* Thumbnail Container: Complete Image Fit */}
                      <div className="relative w-full h-48 sm:h-52 bg-[#f0f1f4] p-2.5 sm:p-3 flex items-center justify-center overflow-hidden border-b border-[#e6e8ec]">
                        {(article.thumbnail || article.image) ? (
                          <img
                            src={article.thumbnail || article.image}
                            alt={article.title || "Article thumbnail"}
                            className="w-full h-full object-contain object-center group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-[#6a6d7c] bg-[#f7f8fa] rounded-lg">
                            <BookOpen className="w-8 h-8 text-[#ffd02f] mb-1" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Academic Article</span>
                          </div>
                        )}

                        {/* Top Badges */}
                        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1.5 pointer-events-none z-10">
                          {article.region && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/95 text-[#1c1c1e] backdrop-blur-xs border border-[#c7cad5] shadow-xs">
                              {article.region}
                            </span>
                          )}
                          {article.category && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#ffd02f] text-[#1c1c1e] shadow-xs">
                              {article.category}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Content Body */}
                      <div className="p-4 sm:p-5 space-y-2">
                        {article.subCategory && (
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#187574] px-2 py-0.5 rounded-md bg-[#c3faf5] inline-block">
                            {article.subCategory}
                          </span>
                        )}

                        <h3 className="text-base font-extrabold text-[#1c1c1e] leading-snug line-clamp-2 group-hover:text-[#4262ff] transition-colors">
                          {article.title || "Untitled Article"}
                        </h3>

                        {article.description && (
                          <p className="text-xs text-[#6a6d7c] leading-relaxed line-clamp-2">
                            {article.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="px-4 sm:px-5 py-3 border-t border-[#f0f1f4] bg-[#fafbfc] flex items-center justify-between text-xs font-semibold">
                      <div className="flex items-center gap-1.5 text-[#6a6d7c] text-[11px]">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{formattedDate || "Verified Post"}</span>
                      </div>

                      <span className="inline-flex items-center gap-1 text-xs font-bold text-[#1c1c1e] group-hover:text-[#4262ff] transition-colors">
                        <span>Read</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            /* Empty State */
            <div className="bg-white rounded-2xl border border-[#c7cad5] p-10 sm:p-14 text-center space-y-4 shadow-sm w-full">
              <div className="w-14 h-14 rounded-2xl bg-[#fff4c4] border border-[#fde89c] text-[#746019] flex items-center justify-center mx-auto shadow-2xs">
                <Search className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-extrabold text-[#1c1c1e]">No Articles Found</h3>
                <p className="text-xs sm:text-sm text-[#6a6d7c] max-w-md mx-auto leading-relaxed">
                  {articles.length === 0
                    ? "There are currently no approved articles published in the knowledge base."
                    : "No articles matched your active filters. Try searching for broader terms or clearing current filter selections."}
                </p>
              </div>

              {isFiltered && (
                <div className="pt-2">
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#ffd02f] hover:bg-[#fcb900] text-[#1c1c1e] text-xs font-black uppercase tracking-wider transition-all shadow-sm active:scale-95 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                    <span>Clear All Filters</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}