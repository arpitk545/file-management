"use client"

import { useState, useEffect } from "react"
import { Plus, ChevronRight, MapPin, Tag, Grid3X3, Trash2, Edit, Save } from "lucide-react"
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
        category: selectedRegion.category.map(cat => ({
          name: cat.name,
          subCategory: cat.subCategory.map(sub => ({ name: sub.name }))
        }))
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
    setSelectedRegion(prev => ({
      ...prev,
      category: prev.category.map(cat =>
        cat._id === categoryId ? { ...cat, name: newName } : cat
      )
    }))
    if (selectedCategory?._id === categoryId) {
      setSelectedCategory(prev => ({ ...prev, name: newName }))
    }
  }

  const updateSubcategoryName = (categoryId, subcategoryId, e) => {
    const newName = e.target.value
    setSelectedRegion(prev => ({
      ...prev,
      category: prev.category.map(cat =>
        cat._id === categoryId
          ? {
              ...cat,
              subCategory: cat.subCategory.map(sub =>
                sub._id === subcategoryId ? { ...sub, name: newName } : sub
              )
            }
          : cat
      )
    }))
    if (selectedCategory?._id === categoryId) {
      setSelectedCategory(prev => ({
        ...prev,
        subCategory: prev.subCategory.map(sub =>
          sub._id === subcategoryId ? { ...sub, name: newName } : sub
        )
      }))
    }
  }

  const addNewCategory = () => {
    const newCategory = {
      _id: `temp-${Date.now()}`,
      name: "",
      subCategory: []
    }
    setSelectedRegion(prev => ({
      ...prev,
      category: [...prev.category, newCategory]
    }))
    setSelectedCategory(newCategory)
  }

  const addNewSubcategory = () => {
    if (!selectedCategory) return

    const newSubcategory = {
      _id: `temp-${Date.now()}`,
      name: ""
    }
    setSelectedRegion(prev => ({
      ...prev,
      category: prev.category.map(cat =>
        cat._id === selectedCategory._id
          ? { ...cat, subCategory: [...cat.subCategory, newSubcategory] }
          : cat
      )
    }))
    setSelectedCategory(prev => ({
      ...prev,
      subCategory: [...prev.subCategory, newSubcategory]
    }))
  }

  const deleteCategory = (categoryId, e) => {
    e.stopPropagation()
    setSelectedRegion(prev => ({
      ...prev,
      category: prev.category.filter(cat => cat._id !== categoryId)
    }))
    if (selectedCategory?._id === categoryId) {
      setSelectedCategory(null)
    }
  }

  const deleteSubcategory = (categoryId, subcategoryId, e) => {
    e?.stopPropagation()
    setSelectedRegion(prev => ({
      ...prev,
      category: prev.category.map(cat =>
        cat._id === categoryId
          ? {
              ...cat,
              subCategory: cat.subCategory.filter(sub => sub._id !== subcategoryId)
            }
          : cat
      )
    }))
    if (selectedCategory?._id === categoryId) {
      setSelectedCategory(prev => ({
        ...prev,
        subCategory: prev.subCategory.filter(sub => sub._id !== subcategoryId)
      }))
    }
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 overflow-auto bg-gradient-to-br from-teal-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 p-4 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 overflow-auto bg-gradient-to-br from-teal-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-teal-500 via-blue-500 to-indigo-500 rounded-full mb-3">
            <Edit className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-1">
            Edit Regional Structure
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base">
            Modify existing regions, categories, and subcategories
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl md:rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-teal-500 via-blue-500 to-indigo-500 p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-semibold text-white flex items-center gap-2">
              <Grid3X3 className="w-4 h-4 md:w-5 md:h-5" />
              Edit Hierarchical Structure
            </h2>
            <p className="text-teal-100 text-xs md:text-sm mt-1">Update your organizational tree</p>
          </div>

          {/* Card Content */}
          <div className="p-4 md:p-6">
            <div className="space-y-4 md:space-y-6">
              {/* Regions */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-2 h-2 md:w-3 md:h-3 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full"></div>
                <h3 className="text-base md:text-lg font-semibold text-gray-800 dark:text-white">Region</h3>
              </div>

              {regions.length > 0 ? (
                <div className="space-y-2">
                  {regions.map((region) => (
                    <div
                      key={region._id}
                      onClick={() => selectRegion(region)}
                      className={`p-2 md:p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                        selectedRegion?._id === region._id
                          ? "border-teal-500 bg-teal-50 dark:bg-teal-900/20"
                          : "border-gray-200 dark:border-gray-600 hover:border-teal-300 dark:hover:border-teal-600"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3 h-3 md:w-4 md:h-4 text-teal-500" />
                        <span className="text-sm md:text-base font-medium text-gray-800 dark:text-white">
                          {region.name}
                        </span>
                        <ChevronRight className="w-3 h-3 md:w-4 md:h-4 text-gray-400 ml-auto" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-3 text-sm md:text-base text-gray-500">
                  No regions found. Create some regions first.
                </div>
              )}

              {/* Single New Region Name input matching Region tile size */}
              {selectedRegion && (
                <div className="mt-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    New Region Name
                  </label>
                  <input
                    type="text"
                    value={newRegionName}
                    onChange={(e) => setNewRegionName(e.target.value)}
                    placeholder={`Rename "${selectedRegion.name}"...`}
                    className="
                      w-full
                      p-2 md:p-3
                      rounded-lg
                      border-2
                      border-gray-200 dark:border-gray-600
                      bg-teal-50 dark:bg-gray-800
                      text-gray-800 dark:text-white
                      focus:outline-none
                      focus:border-teal-500
                      transition-all duration-200
                    "
                  />
                  {newRegionName?.trim()?.length > 0 && (
                    <p className="text-xs text-teal-600 dark:text-teal-400 mt-2">
                      Will rename from "{selectedRegion.name}" to "{newRegionName}"
                    </p>
                  )}
                </div>
              )}

              {/* Categories */}
              {selectedRegion && (
                <div className="ml-2 sm:ml-4 md:ml-6 border-l-2 border-gradient-to-b from-teal-300 to-blue-300 pl-2 sm:pl-4 md:pl-6 space-y-3 md:space-y-4">
                  <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-3">
                    <div className="w-2 h-2 md:w-3 md:h-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
                    <h3 className="text-base md:text-lg font-semibold text-gray-800 dark:text-white">Category</h3>
                    <span className="text-xs md:text-sm text-gray-500 dark:text-gray-400">in {selectedRegion.name}</span>
                    <button
                      onClick={addNewCategory}
                      className="ml-auto px-2 py-1 md:px-3 md:py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-all duration-200 flex items-center justify-center gap-1 text-xs md:text-sm"
                    >
                      <Plus className="w-2 h-2 md:w-3 md:h-3" />
                      Add New
                    </button>
                  </div>

                  {selectedRegion.category?.length > 0 ? (
                    <div className="space-y-2">
                      {selectedRegion.category.map((category) => (
                        <div
                          key={category._id}
                          onClick={() => selectCategory(category)}
                          className={`p-2 md:p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                            selectedCategory?._id === category._id
                              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                              : "border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-600"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Tag className="w-3 h-3 md:w-4 md:h-4 text-blue-500" />
                            <input
                              type="text"
                              value={category.name}
                              onChange={(e) => updateCategoryName(category._id, e)}
                              className="flex-1 text-sm md:text-base font-medium text-gray-800 dark:text-white bg-transparent border-b border-transparent focus:border-blue-300 focus:outline-none px-1"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <button
                              onClick={(e) => deleteCategory(category._id, e)}
                              className="ml-auto p-0.5 md:p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                            >
                              <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                            </button>
                            <ChevronRight className="w-3 h-3 md:w-4 md:h-4 text-gray-400" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-3 text-sm md:text-base text-gray-500">
                      No categories found for this region.
                    </div>
                  )}

                  {/* Subcategories */}
                  {selectedCategory && (
                    <div className="ml-2 sm:ml-4 md:ml-6 border-l-2 border-gradient-to-b from-blue-300 to-indigo-300 pl-2 sm:pl-4 md:pl-6 space-y-3 md:space-y-4">
                      <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-3">
                        <div className="w-2 h-2 md:w-3 md:h-3 bg-gradient-to-r from-indigo-500 to-teal-500 rounded-full"></div>
                        <h3 className="text-base md:text-lg font-semibold text-gray-800 dark:text-white">Subcategory</h3>
                        <span className="text-xs md:text-sm text-gray-500 dark:text-gray-400">in {selectedCategory.name}</span>
                        <button
                          onClick={addNewSubcategory}
                          className="ml-auto px-2 py-1 md:px-3 md:py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900/40 transition-all duration-200 flex items-center justify-center gap-1 text-xs md:text-sm"
                        >
                          <Plus className="w-2 h-2 md:w-3 md:h-3" />
                          Add New
                        </button>
                      </div>

                      {selectedCategory.subCategory?.length > 0 ? (
                        <div className="space-y-2">
                          {selectedCategory.subCategory.map((subcategory) => (
                            <div
                              key={subcategory._id}
                              className="p-2 md:p-3 rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-indigo-50 dark:bg-indigo-900/20 flex items-center gap-2"
                            >
                              <Grid3X3 className="w-3 h-3 md:w-4 md:h-4 text-indigo-500" />
                              <input
                                type="text"
                                value={subcategory.name}
                                onChange={(e) => updateSubcategoryName(selectedCategory._id, subcategory._id, e)}
                                className="flex-1 text-sm md:text-base font-medium text-gray-800 dark:text-white bg-transparent border-b border-transparent focus:border-indigo-300 focus:outline-none px-1"
                                onClick={(e) => e.stopPropagation()}
                              />
                              <button
                                onClick={(e) => deleteSubcategory(selectedCategory._id, subcategory._id, e)}
                                className="ml-auto p-0.5 md:p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                              >
                                <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-3 text-sm md:text-base text-gray-500">
                          No subcategories found for this category.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {selectedRegion && (
          <div className="mt-4 md:mt-6 bg-white dark:bg-gray-800 rounded-xl md:rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
              <div className="mb-2 md:mb-0">
                <h3 className="text-base md:text-lg font-semibold text-gray-800 dark:text-white mb-1">
                  Editing: {selectedRegion.name}
                  {newRegionName && (
                    <span className="text-teal-600 dark:text-teal-400 ml-2">
                      → {newRegionName}
                    </span>
                  )}
                </h3>
                <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                  {selectedRegion.category?.length || 0} categories
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
                <button
                  onClick={handleDeleteRegion}
                  disabled={isDeleting}
                  className="px-4 py-2 md:px-6 md:py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:from-red-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 text-sm md:text-base"
                >
                  {isDeleting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-3 w-3 md:h-4 md:w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                      Delete
                    </>
                  )}
                </button>
                <button
                  onClick={handleUpdateRegion}
                  disabled={isSubmitting}
                  className="px-4 py-2 md:px-6 md:py-3 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-lg hover:from-teal-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 text-sm md:text-base"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-3 w-3 md:h-4 md:w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="w-3 h-3 md:w-4 md:h-4" />
                      Update
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default EditRegion
