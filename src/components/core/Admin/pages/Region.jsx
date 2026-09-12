"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Plus, ChevronRight, MapPin, Tag, Grid3X3, Trash2, ArrowLeft, Layers, Sparkles } from "lucide-react"
import { createRegionWithStructure } from "../../../../services/operations/articelsAPI"
import { toast } from "react-hot-toast"

const Regio = () => {
  const navigate = useNavigate()
  const [regions, setRegions] = useState([])
  const [newRegion, setNewRegion] = useState("")
  const [selectedRegion, setSelectedRegion] = useState(null)
  const [newCategory, setNewCategory] = useState("")
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [newSubcategory, setNewSubcategory] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAddRegion = () => {
    if (newRegion.trim()) {
      const region = {
        id: Date.now(),
        name: newRegion.trim(),
        categories: [],
      }
      setRegions([...regions, region])
      setNewRegion("")
      setSelectedRegion(region)
      setSelectedCategory(null)
    }
  }

  const handleAddCategory = () => {
    if (newCategory.trim() && selectedRegion) {
      const category = {
        id: Date.now(),
        name: newCategory.trim(),
        subcategories: [],
      }

      const updatedRegions = regions.map((region) => {
        if (region.id === selectedRegion.id) {
          return {
            ...region,
            categories: [...region.categories, category],
          }
        }
        return region
      })

      setRegions(updatedRegions)
      setNewCategory("")
      setSelectedCategory(category)

      const updatedRegion = updatedRegions.find((r) => r.id === selectedRegion.id)
      setSelectedRegion(updatedRegion)
    }
  }

  const handleAddSubcategory = () => {
    if (newSubcategory.trim() && selectedRegion && selectedCategory) {
      const subcategory = {
        id: Date.now(),
        name: newSubcategory.trim(),
      }

      const updatedRegions = regions.map((region) => {
        if (region.id === selectedRegion.id) {
          return {
            ...region,
            categories: region.categories.map((category) => {
              if (category.id === selectedCategory.id) {
                return {
                  ...category,
                  subcategories: [...category.subcategories, subcategory],
                }
              }
              return category
            }),
          }
        }
        return region
      })

      setRegions(updatedRegions)
      setNewSubcategory("")

      const updatedRegion = updatedRegions.find((r) => r.id === selectedRegion.id)
      const updatedCategory = updatedRegion.categories.find((c) => c.id === selectedCategory.id)
      setSelectedRegion(updatedRegion)
      setSelectedCategory(updatedCategory)
    }
  }

  const handleDeleteRegion = (regionId, e) => {
    e.stopPropagation()
    const updatedRegions = regions.filter((region) => region.id !== regionId)
    setRegions(updatedRegions)
    if (selectedRegion?.id === regionId) {
      setSelectedRegion(null)
      setSelectedCategory(null)
    }
  }

  const handleDeleteCategory = (categoryId, e) => {
    e.stopPropagation()
    if (!selectedRegion) return

    const updatedRegions = regions.map((region) => {
      if (region.id === selectedRegion.id) {
        return {
          ...region,
          categories: region.categories.filter((category) => category.id !== categoryId),
        }
      }
      return region
    })

    setRegions(updatedRegions)
    if (selectedCategory?.id === categoryId) {
      setSelectedCategory(null)
    }
    const updatedRegion = updatedRegions.find((r) => r.id === selectedRegion.id)
    setSelectedRegion(updatedRegion)
  }

  const handleDeleteSubcategory = (subcategoryId, e) => {
    e.stopPropagation()
    if (!selectedRegion || !selectedCategory) return

    const updatedRegions = regions.map((region) => {
      if (region.id === selectedRegion.id) {
        return {
          ...region,
          categories: region.categories.map((category) => {
            if (category.id === selectedCategory.id) {
              return {
                ...category,
                subcategories: category.subcategories.filter((sub) => sub.id !== subcategoryId),
              }
            }
            return category
          }),
        }
      }
      return region
    })

    setRegions(updatedRegions)
    const updatedRegion = updatedRegions.find((r) => r.id === selectedRegion.id)
    const updatedCategory = updatedRegion.categories.find((c) => c.id === selectedCategory.id)
    setSelectedRegion(updatedRegion)
    setSelectedCategory(updatedCategory)
  }

  const handleSubmitToServer = async () => {
    if (regions.length === 0) {
      toast.error("Please add at least one region before submitting")
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        name: regions[0].name,
        category: regions[0].categories.map((cat) => ({
          name: cat.name,
          subCategory: cat.subcategories.map((sub) => sub.name),
        })),
      }

      const response = await createRegionWithStructure(payload)

      if (response.message) {
        toast.success(response.message)
        setRegions([])
        setNewRegion("")
        setSelectedRegion(null)
        setSelectedCategory(null)
      } else {
        throw new Error("Unexpected response from server")
      }
    } catch (error) {
      console.error("Submission error:", error)
      toast.error(error.response?.data?.error || "Failed to submit regions")
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectRegion = (region) => {
    setSelectedRegion(region)
    setSelectedCategory(null)
  }

  const selectCategory = (category) => {
    setSelectedCategory(category)
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#1c1c1e] py-6 sm:py-8 px-4 sm:px-6 lg:px-8 xl:px-12 w-full">
      <div className="w-full space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e0e2e8]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#c7cad5] text-[#1c1c1e] hover:bg-[#f7f8fa] hover:border-[#1c1c1e] transition-all text-sm font-semibold shadow-sm active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </button>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#ffd02f] text-[#1c1c1e]">
              POSTS TAXONOMY
            </span>
            <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#f5f3ff] text-[#4262ff] border border-[#ddd6fe]">
              CANVAS STUDIO
            </span>
          </div>
          <button
            onClick={() => navigate("/edit-region")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1c1c1e] text-white hover:bg-[#2c2c34] text-sm font-semibold transition-all shadow-sm self-start sm:self-auto active:scale-98"
          >
            <span>Edit Existing Regions</span>
            <ChevronRight className="w-4 h-4 text-[#ffd02f]" />
          </button>
        </div>

        {/* Page Title */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#c3faf5] text-[#187574] border border-[#9eece4] mb-1">
            <Layers className="w-3.5 h-3.5" />
            <span>3-TIER HIERARCHY</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#1c1c1e]">
            Regional Management
          </h1>
          <p className="text-sm sm:text-base text-[#555a6a]">
            Organize your platform's geographic regions, topical categories, and granular subcategories.
          </p>
        </div>

        {/* Main Structure Card */}
        <div className="bg-white rounded-2xl border border-[#e0e2e8] shadow-sm p-5 sm:p-7 space-y-6 w-full">
          {/* Level 1: Region (Canary Yellow Theme) */}
          <div className="p-5 rounded-2xl bg-[#fff8e0] border-2 border-[#fde89c] space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-[#ffd02f] text-[#1c1c1e] flex items-center justify-center font-bold text-xs shadow-sm">
                  1
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-[#1c1c1e]">Region Level</h2>
                  <p className="text-xs text-[#746019]">Top-level territory or primary topic</p>
                </div>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-white text-[#746019] border border-[#fde89c] shadow-xs">
                {regions.length} {regions.length === 1 ? "Region" : "Regions"}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full items-stretch">
              <input
                type="text"
                value={newRegion}
                onChange={(e) => setNewRegion(e.target.value)}
                placeholder="Enter region name (e.g. North America, Global, India)..."
                className="w-full sm:flex-1 h-12 min-h-[48px] shrink-0 px-4 py-3 bg-white border border-[#c7cad5] rounded-xl text-[#1c1c1e] placeholder-[#8e91a0] focus:outline-none focus:border-2 focus:border-[#4262ff] transition-all text-sm font-medium leading-normal shadow-2xs"
                onKeyPress={(e) => e.key === "Enter" && handleAddRegion()}
              />
              <button
                onClick={handleAddRegion}
                disabled={!newRegion.trim()}
                className="w-full sm:w-auto h-12 min-h-[48px] shrink-0 px-6 rounded-xl sm:rounded-full bg-[#ffd02f] text-[#1c1c1e] hover:bg-[#fcb900] disabled:opacity-40 disabled:cursor-not-allowed font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-xs active:scale-98"
              >
                <Plus className="w-4 h-4" />
                <span>Add Region</span>
              </button>
            </div>

            {/* Existing Regions */}
            {regions.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 pt-1">
                {regions.map((region) => {
                  const isSelected = selectedRegion?.id === region.id
                  return (
                    <div
                      key={region.id}
                      onClick={() => selectRegion(region)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                        isSelected
                          ? "bg-white border-2 border-[#4262ff] shadow-md ring-2 ring-[#4262ff]/20"
                          : "bg-white/90 border-[#fde89c] hover:border-[#ffd02f] hover:bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <MapPin className={`w-4 h-4 shrink-0 ${isSelected ? "text-[#4262ff]" : "text-[#746019]"}`} />
                        <span className="font-bold text-[#1c1c1e] text-sm truncate">{region.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#fff4c4] text-[#746019]">
                          {region.categories.length}
                        </span>
                        <button
                          onClick={(e) => handleDeleteRegion(region.id, e)}
                          className="p-1 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                          title="Delete Region"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <ChevronRight className={`w-4 h-4 ${isSelected ? "text-[#4262ff]" : "text-gray-400"}`} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Level 2: Category (Miro Teal Theme) */}
          {selectedRegion && (
            <div className="p-5 rounded-2xl bg-[#c3faf5]/40 border-2 border-[#9eece4] space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-[#0fbcb0] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                    2
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-[#1c1c1e]">
                      Category Level <span className="text-sm font-semibold text-[#187574]">in "{selectedRegion.name}"</span>
                    </h3>
                    <p className="text-xs text-[#187574]">Topical division inside the chosen region</p>
                  </div>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-white text-[#187574] border border-[#9eece4] shadow-xs">
                  {selectedRegion.categories.length} Categories
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full items-stretch">
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder={`Enter category for "${selectedRegion.name}"...`}
                  className="w-full sm:flex-1 h-12 min-h-[48px] shrink-0 px-4 py-3 bg-white border border-[#c7cad5] rounded-xl text-[#1c1c1e] placeholder-[#8e91a0] focus:outline-none focus:border-2 focus:border-[#0fbcb0] transition-all text-sm font-medium leading-normal shadow-2xs"
                  onKeyPress={(e) => e.key === "Enter" && handleAddCategory()}
                />
                <button
                  onClick={handleAddCategory}
                  disabled={!newCategory.trim()}
                  className="w-full sm:w-auto h-12 min-h-[48px] shrink-0 px-6 rounded-xl sm:rounded-full bg-[#0fbcb0] hover:bg-[#187574] text-white disabled:opacity-40 disabled:cursor-not-allowed font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-xs active:scale-98"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Category</span>
                </button>
              </div>

              {/* Existing Categories */}
              {selectedRegion.categories.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 pt-1">
                  {selectedRegion.categories.map((category) => {
                    const isCatSelected = selectedCategory?.id === category.id
                    return (
                      <div
                        key={category.id}
                        onClick={() => selectCategory(category)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                          isCatSelected
                            ? "bg-white border-2 border-[#0fbcb0] shadow-md ring-2 ring-[#0fbcb0]/20"
                            : "bg-white/90 border-[#9eece4] hover:border-[#0fbcb0] hover:bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Tag className={`w-4 h-4 shrink-0 ${isCatSelected ? "text-[#0fbcb0]" : "text-[#187574]"}`} />
                          <span className="font-bold text-[#1c1c1e] text-sm truncate">{category.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#c3faf5] text-[#187574]">
                            {category.subcategories.length}
                          </span>
                          <button
                            onClick={(e) => handleDeleteCategory(category.id, e)}
                            className="p-1 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                            title="Delete Category"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <ChevronRight className={`w-4 h-4 ${isCatSelected ? "text-[#0fbcb0]" : "text-gray-400"}`} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Level 3: Subcategory (Miro Rose / Magenta Theme) */}
          {selectedCategory && (
            <div className="p-5 rounded-2xl bg-[#ffd8f4]/35 border-2 border-[#f3bee5] space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-[#86296b] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                    3
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-[#1c1c1e]">
                      Subcategory Level <span className="text-sm font-semibold text-[#86296b]">in "{selectedCategory.name}"</span>
                    </h3>
                    <p className="text-xs text-[#86296b]">Granular tagging topics for articles</p>
                  </div>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-white text-[#86296b] border border-[#f3bee5] shadow-xs">
                  {selectedCategory.subcategories.length} Subcategories
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full items-stretch">
                <input
                  type="text"
                  value={newSubcategory}
                  onChange={(e) => setNewSubcategory(e.target.value)}
                  placeholder={`Enter subcategory for "${selectedCategory.name}"...`}
                  className="w-full sm:flex-1 h-12 min-h-[48px] shrink-0 px-4 py-3 bg-white border border-[#c7cad5] rounded-xl text-[#1c1c1e] placeholder-[#8e91a0] focus:outline-none focus:border-2 focus:border-[#86296b] transition-all text-sm font-medium leading-normal shadow-2xs"
                  onKeyPress={(e) => e.key === "Enter" && handleAddSubcategory()}
                />
                <button
                  onClick={handleAddSubcategory}
                  disabled={!newSubcategory.trim()}
                  className="w-full sm:w-auto h-12 min-h-[48px] shrink-0 px-6 rounded-xl sm:rounded-full bg-[#86296b] hover:bg-[#6e2257] text-white disabled:opacity-40 disabled:cursor-not-allowed font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-xs active:scale-98"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Subcategory</span>
                </button>
              </div>

              {/* Existing Subcategories */}
              {selectedCategory.subcategories.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 pt-1">
                  {selectedCategory.subcategories.map((subcategory) => (
                    <div
                      key={subcategory.id}
                      className="p-3 rounded-xl border border-[#f3bee5] bg-white flex items-center justify-between gap-2 shadow-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Grid3X3 className="w-4 h-4 text-[#86296b] shrink-0" />
                        <span className="font-bold text-[#1c1c1e] text-sm truncate">{subcategory.name}</span>
                      </div>
                      <button
                        onClick={(e) => handleDeleteSubcategory(subcategory.id, e)}
                        className="p-1 rounded-lg hover:bg-red-50 text-red-500 transition-colors shrink-0"
                        title="Delete Subcategory"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Structure Summary Card (Rich 3-Color Pastel Bento) */}
        {regions.length > 0 && (
          <div className="bg-white rounded-2xl border border-[#e0e2e8] shadow-sm p-5 sm:p-7 space-y-6 w-full">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-base sm:text-lg font-bold text-[#1c1c1e]">
                Structure Summary
              </h3>
              <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-[#c3faf5] text-[#187574]">
                <Sparkles className="w-3.5 h-3.5" />
                Live Tree
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Region Stat: Yellow */}
              <div className="p-4 rounded-xl bg-[#fff8e0] border-2 border-[#fde89c] text-center space-y-1">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#746019]">1. Regions</span>
                <div className="text-3xl sm:text-4xl font-extrabold text-[#1c1c1e]">{regions.length}</div>
                <p className="text-xs text-[#746019] font-medium">Top territories</p>
              </div>

              {/* Category Stat: Teal */}
              <div className="p-4 rounded-xl bg-[#c3faf5] border-2 border-[#9eece4] text-center space-y-1">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#187574]">2. Categories</span>
                <div className="text-3xl sm:text-4xl font-extrabold text-[#1c1c1e]">
                  {regions.reduce((sum, r) => sum + r.categories.length, 0)}
                </div>
                <p className="text-xs text-[#187574] font-medium">Nested groups</p>
              </div>

              {/* Subcategory Stat: Orange Light */}
              <div className="p-4 rounded-xl bg-[#ffe6cd] border-2 border-[#fcd0a1] text-center space-y-1">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#7c3a00]">3. Subcategories</span>
                <div className="text-3xl sm:text-4xl font-extrabold text-[#1c1c1e]">
                  {regions.reduce(
                    (sum, r) =>
                      sum + r.categories.reduce((catSum, c) => catSum + c.subcategories.length, 0),
                    0
                  )}
                </div>
                <p className="text-xs text-[#7c3a00] font-medium">Granular topics</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-[#e0e2e8]">
              <p className="text-xs text-[#555a6a]">
                Submitting writes this taxonomy to the server for live article categorization.
              </p>
              <button
                onClick={handleSubmitToServer}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#1c1c1e] hover:bg-[#2c2c34] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-98"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Structure</span>
                    <Sparkles className="w-4 h-4 text-[#ffd02f]" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Regio