"use client"

import { useState, useEffect } from "react"
import { Plus, ChevronRight, MapPin, Tag, Grid3X3, Trash2, Edit, Save, ArrowLeft, Layers, Sparkles } from "lucide-react"
import { getAllRegionsWithStructure, updateRegionByName, deleteRegionByName } from "../../../../services/operations/articelsAPI"
import { toast } from "react-hot-toast"
import { useNavigate } from "react-router-dom"

const EditRegion = () => {
  const [regions, setRegions] = useState([])
  const [selectedRegion, setSelectedRegion] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [newRegionName, setNewRegionName] = useState("")

  const navigate = useNavigate()

  useEffect(() => {
    const loadRegions = async () => {
      try {
        const data = await getAllRegionsWithStructure()
        setRegions(data?.regions || data || [])
      } catch (error) {
        console.error("Error loading regions:", error)
        toast.error("Failed to load regions")
      } finally {
        setIsLoading(false)
      }
    }
    loadRegions()
  }, [])

  useEffect(() => {
    if (selectedRegion) {
      setNewRegionName("")
    }
  }, [selectedRegion])

  const handleUpdateRegion = async () => {
    if (!selectedRegion) {
      toast.error("Please select a region to update")
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        name: (newRegionName.trim() || selectedRegion.name)?.trim(),
        category: selectedRegion.category.map((cat) => ({
          name: cat.name,
          subCategory: cat.subCategory.map((sub) => ({ name: sub.name })),
        })),
      }

      const response = await updateRegionByName(selectedRegion.name, payload)

      if (response.message) {
        toast.success(response.message)
        const updatedData = await getAllRegionsWithStructure()
        setRegions(updatedData?.regions || updatedData || [])
        setNewRegionName("")
        navigate("/dashboard")
      } else {
        throw new Error("Unexpected response from server")
      }
    } catch (error) {
      console.error("Update error:", error)
      toast.error(error.response?.data?.error || "Failed to update region")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteRegion = async () => {
    if (!selectedRegion) {
      toast.error("Please select a region to delete")
      return
    }

    if (!window.confirm(`Are you sure you want to permanently delete region "${selectedRegion.name}"?`)) {
      return
    }

    setIsDeleting(true)
    try {
      const response = await deleteRegionByName(selectedRegion.name)

      if (response.message) {
        toast.success(response.message)
        const updatedData = await getAllRegionsWithStructure()
        setRegions(updatedData?.regions || updatedData || [])
        navigate("/dashboard")
        setSelectedRegion(null)
        setSelectedCategory(null)
        setNewRegionName("")
      } else {
        throw new Error("Unexpected response from server")
      }
    } catch (error) {
      console.error("Delete error:", error)
      toast.error(error.response?.data?.error || "Failed to delete region")
    } finally {
      setIsDeleting(false)
    }
  }

  const selectRegion = (region) => {
    setSelectedRegion(JSON.parse(JSON.stringify(region)))
    setSelectedCategory(null)
    setNewRegionName("")
  }

  const selectCategory = (category) => {
    setSelectedCategory(JSON.parse(JSON.stringify(category)))
  }

  const updateCategoryName = (categoryId, e) => {
    const newName = e.target.value
    setSelectedRegion((prev) => ({
      ...prev,
      category: prev.category.map((cat) =>
        cat._id === categoryId ? { ...cat, name: newName } : cat
      ),
    }))
    if (selectedCategory?._id === categoryId) {
      setSelectedCategory((prev) => ({ ...prev, name: newName }))
    }
  }

  const updateSubcategoryName = (categoryId, subcategoryId, e) => {
    const newName = e.target.value
    setSelectedRegion((prev) => ({
      ...prev,
      category: prev.category.map((cat) =>
        cat._id === categoryId
          ? {
              ...cat,
              subCategory: cat.subCategory.map((sub) =>
                sub._id === subcategoryId ? { ...sub, name: newName } : sub
              ),
            }
          : cat
      ),
    }))
    if (selectedCategory?._id === categoryId) {
      setSelectedCategory((prev) => ({
        ...prev,
        subCategory: prev.subCategory.map((sub) =>
          sub._id === subcategoryId ? { ...sub, name: newName } : sub
        ),
      }))
    }
  }

  const addNewCategory = () => {
    const newCat = {
      _id: `temp-${Date.now()}`,
      name: "",
      subCategory: [],
    }
    setSelectedRegion((prev) => ({
      ...prev,
      category: [...prev.category, newCat],
    }))
    setSelectedCategory(newCat)
  }

  const addNewSubcategory = () => {
    if (!selectedCategory) return

    const newSub = {
      _id: `temp-${Date.now()}`,
      name: "",
    }
    setSelectedRegion((prev) => ({
      ...prev,
      category: prev.category.map((cat) =>
        cat._id === selectedCategory._id
          ? { ...cat, subCategory: [...cat.subCategory, newSub] }
          : cat
      ),
    }))
    setSelectedCategory((prev) => ({
      ...prev,
      subCategory: [...prev.subCategory, newSub],
    }))
  }

  const deleteCategory = (categoryId, e) => {
    e.stopPropagation()
    setSelectedRegion((prev) => ({
      ...prev,
      category: prev.category.filter((cat) => cat._id !== categoryId),
    }))
    if (selectedCategory?._id === categoryId) {
      setSelectedCategory(null)
    }
  }

  const deleteSubcategory = (categoryId, subcategoryId, e) => {
    e?.stopPropagation()
    setSelectedRegion((prev) => ({
      ...prev,
      category: prev.category.map((cat) =>
        cat._id === categoryId
          ? {
              ...cat,
              subCategory: cat.subCategory.filter((sub) => sub._id !== subcategoryId),
            }
          : cat
      ),
    }))
    if (selectedCategory?._id === categoryId) {
      setSelectedCategory((prev) => ({
        ...prev,
        subCategory: prev.subCategory.filter((sub) => sub._id !== subcategoryId),
      }))
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f7f8fa] flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#ffd02f] border-t-[#1c1c1e] rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-[#555a6a]">Loading regions...</p>
        </div>
      </div>
    )
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
          </div>
          <button
            onClick={() => navigate("/create-region")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1c1c1e] text-white hover:bg-[#2c2c34] text-sm font-bold transition-all shadow-sm self-start sm:self-auto active:scale-98"
          >
            <Plus className="w-4 h-4 text-[#ffd02f]" />
            <span>Create New Region</span>
          </button>
        </div>

        {/* Page Title */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#fff4c4] text-[#746019] border border-[#fde89c] mb-1">
            <Edit className="w-3.5 h-3.5" />
            <span>LIVE TAXONOMY EDITOR</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#1c1c1e]">
            Edit Regional Structure
          </h1>
          <p className="text-sm sm:text-base text-[#555a6a]">
            Select a region to rename, modify nested categories, or reorganize subcategories in real-time.
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl border border-[#e0e2e8] shadow-sm p-5 sm:p-7 space-y-6 w-full">
          {/* Level 1: Region Selection (Yellow Theme) */}
          <div className="p-5 rounded-2xl bg-[#fff8e0] border-2 border-[#fde89c] space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-[#ffd02f] text-[#1c1c1e] flex items-center justify-center font-bold text-xs shadow-sm">
                  1
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-[#1c1c1e]">Select Region</h2>
                  <p className="text-xs text-[#746019]">Pick a region to reveal its nested hierarchy</p>
                </div>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-white text-[#746019] border border-[#fde89c]">
                {regions.length} {regions.length === 1 ? "Region" : "Regions"}
              </span>
            </div>

            {regions.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
                {regions.map((region) => {
                  const isSelected = selectedRegion?._id === region._id
                  return (
                    <div
                      key={region._id}
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
                          {region.category?.length || 0}
                        </span>
                        <ChevronRight className={`w-4 h-4 ${isSelected ? "text-[#4262ff]" : "text-gray-400"}`} />
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-6 text-sm text-[#555a6a]">
                No regions found. Create some regions first.
              </div>
            )}

            {/* Rename Input (Blue Tint Card) */}
            {selectedRegion && (
              <div className="p-4 rounded-xl bg-[#f5f3ff] border border-[#ddd6fe] space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#4262ff]">
                    Rename Selected Region: "{selectedRegion.name}"
                  </label>
                  {newRegionName.trim() && (
                    <span className="text-xs font-bold text-[#4262ff] bg-white px-2.5 py-0.5 rounded-full border border-[#ddd6fe]">
                      Will save as: "{newRegionName.trim()}"
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  value={newRegionName}
                  onChange={(e) => setNewRegionName(e.target.value)}
                  placeholder={`Type new name to rename "${selectedRegion.name}"...`}
                  className="w-full h-12 px-4 bg-white border border-[#c7cad5] rounded-xl text-[#1c1c1e] placeholder-[#8e91a0] focus:outline-none focus:border-2 focus:border-[#4262ff] transition-all text-sm font-medium"
                />
              </div>
            )}
          </div>

          {/* Level 2: Category (Teal Theme) */}
          {selectedRegion && (
            <div className="p-5 rounded-2xl bg-[#c3faf5]/40 border-2 border-[#9eece4] space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-[#0fbcb0] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                    2
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-[#1c1c1e]">
                      Categories <span className="text-sm font-semibold text-[#187574]">in "{selectedRegion.name}"</span>
                    </h3>
                    <p className="text-xs text-[#187574]">Edit category names directly inline</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-white text-[#187574] border border-[#9eece4]">
                    {selectedRegion.category?.length || 0} Categories
                  </span>
                  <button
                    onClick={addNewCategory}
                    className="px-4 py-1.5 rounded-full bg-[#0fbcb0] hover:bg-[#187574] text-white text-xs font-bold transition-all flex items-center gap-1 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New</span>
                  </button>
                </div>
              </div>

              {selectedRegion.category?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
                  {selectedRegion.category.map((category) => {
                    const isCatSelected = selectedCategory?._id === category._id
                    return (
                      <div
                        key={category._id}
                        onClick={() => selectCategory(category)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                          isCatSelected
                            ? "bg-white border-2 border-[#0fbcb0] shadow-md ring-2 ring-[#0fbcb0]/20"
                            : "bg-white/90 border-[#9eece4] hover:border-[#0fbcb0] hover:bg-white"
                        }`}
                      >
                        <Tag className={`w-4 h-4 shrink-0 ${isCatSelected ? "text-[#0fbcb0]" : "text-[#187574]"}`} />
                        <input
                          type="text"
                          value={category.name}
                          onChange={(e) => updateCategoryName(category._id, e)}
                          onClick={(e) => e.stopPropagation()}
                          className="flex-1 bg-transparent font-bold text-sm text-[#1c1c1e] border-b border-transparent focus:border-[#0fbcb0] focus:outline-none px-1"
                          placeholder="Category name..."
                        />
                        <button
                          onClick={(e) => deleteCategory(category._id, e)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors shrink-0"
                          title="Delete category"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-4 text-sm text-[#187574]">
                  No categories found for this region. Click "+ Add New" to add one.
                </div>
              )}
            </div>
          )}

          {/* Level 3: Subcategory (Rose Theme) */}
          {selectedCategory && (
            <div className="p-5 rounded-2xl bg-[#ffd8f4]/35 border-2 border-[#f3bee5] space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-[#86296b] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                    3
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-[#1c1c1e]">
                      Subcategories <span className="text-sm font-semibold text-[#86296b]">in "{selectedCategory.name}"</span>
                    </h3>
                    <p className="text-xs text-[#86296b]">Edit subcategory names directly inline</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-white text-[#86296b] border border-[#f3bee5]">
                    {selectedCategory.subCategory?.length || 0} Subcategories
                  </span>
                  <button
                    onClick={addNewSubcategory}
                    className="px-4 py-1.5 rounded-full bg-[#86296b] hover:bg-[#6e2257] text-white text-xs font-bold transition-all flex items-center gap-1 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New</span>
                  </button>
                </div>
              </div>

              {selectedCategory.subCategory?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
                  {selectedCategory.subCategory.map((subcategory) => (
                    <div
                      key={subcategory._id}
                      className="p-3 rounded-xl border border-[#f3bee5] bg-white flex items-center justify-between gap-2 shadow-xs"
                    >
                      <Grid3X3 className="w-4 h-4 text-[#86296b] shrink-0" />
                      <input
                        type="text"
                        value={subcategory.name}
                        onChange={(e) => updateSubcategoryName(selectedCategory._id, subcategory._id, e)}
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 bg-transparent font-bold text-sm text-[#1c1c1e] border-b border-transparent focus:border-[#86296b] focus:outline-none px-1"
                        placeholder="Subcategory name..."
                      />
                      <button
                        onClick={(e) => deleteSubcategory(selectedCategory._id, subcategory._id, e)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors shrink-0"
                        title="Delete subcategory"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-sm text-[#86296b]">
                  No subcategories found for this category. Click "+ Add New" to add one.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons Bar */}
        {selectedRegion && (
          <div className="bg-white rounded-2xl border border-[#e0e2e8] shadow-sm p-5 sm:p-7 flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
            <div>
              <h3 className="font-bold text-base sm:text-lg text-[#1c1c1e]">
                Editing Region: <span className="text-[#4262ff]">{selectedRegion.name}</span>
                {newRegionName.trim() && (
                  <span className="text-[#0fbcb0] ml-2">→ {newRegionName.trim()}</span>
                )}
              </h3>
              <p className="text-xs sm:text-sm text-[#555a6a]">
                {selectedRegion.category?.length || 0} categories linked
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <button
                onClick={handleDeleteRegion}
                disabled={isDeleting}
                className="flex-1 sm:flex-none px-6 py-3 rounded-full bg-[#fbd4d4] hover:bg-[#f9a9a9] text-[#600000] border border-[#e3c5c5] font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Region</span>
                  </>
                )}
              </button>
              <button
                onClick={handleUpdateRegion}
                disabled={isSubmitting}
                className="flex-1 sm:flex-none px-8 py-3 rounded-full bg-[#4262ff] hover:bg-[#2a41b6] text-white font-bold text-sm shadow-md hover:shadow transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-98"
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
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
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

export default EditRegion
