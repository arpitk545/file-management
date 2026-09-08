"use client"

import { useState } from "react"
import { Plus, ChevronRight, MapPin, Tag, Grid3X3, Trash2 } from "lucide-react"
import { createRegionWithStructure } from "../../../../services/operations/articelsAPI"
import { toast } from "react-hot-toast"

const Regio = () => {
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

      // Update selectedRegion to reflect the new category
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

      // Update selectedRegion and selectedCategory to reflect the new subcategory
      const updatedRegion = updatedRegions.find((r) => r.id === selectedRegion.id)
      const updatedCategory = updatedRegion.categories.find((c) => c.id === selectedCategory.id)
      setSelectedRegion(updatedRegion)
      setSelectedCategory(updatedCategory)
    }
  }

  const handleDeleteRegion = (regionId, e) => {
    e.stopPropagation()
    const updatedRegions = regions.filter(region => region.id !== regionId)
    setRegions(updatedRegions)
    if (selectedRegion?.id === regionId) {
      setSelectedRegion(null)
      setSelectedCategory(null)
    }
  }

  const handleDeleteCategory = (categoryId, e) => {
    e.stopPropagation()
    if (!selectedRegion) return

    const updatedRegions = regions.map(region => {
      if (region.id === selectedRegion.id) {
        return {
          ...region,
          categories: region.categories.filter(category => category.id !== categoryId)
        }
      }
      return region
    })

    setRegions(updatedRegions)
    if (selectedCategory?.id === categoryId) {
      setSelectedCategory(null)
    }
    // Update selectedRegion to reflect the changes
    const updatedRegion = updatedRegions.find(r => r.id === selectedRegion.id)
    setSelectedRegion(updatedRegion)
  }

  const handleDeleteSubcategory = (subcategoryId, e) => {
    e.stopPropagation()
    if (!selectedRegion || !selectedCategory) return

    const updatedRegions = regions.map(region => {
      if (region.id === selectedRegion.id) {
        return {
          ...region,
          categories: region.categories.map(category => {
            if (category.id === selectedCategory.id) {
              return {
                ...category,
                subcategories: category.subcategories.filter(sub => sub.id !== subcategoryId)
              }
            }
            return category
          })
        }
      }
      return region
    })

    setRegions(updatedRegions)
    // Update selectedRegion and selectedCategory to reflect the changes
    const updatedRegion = updatedRegions.find(r => r.id === selectedRegion.id)
    const updatedCategory = updatedRegion.categories.find(c => c.id === selectedCategory.id)
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
        category: regions[0].categories.map(cat => ({
          name: cat.name,
          subCategory: cat.subcategories.map(sub => sub.name)
        }))
      };

      // Call the API
      const response = await createRegionWithStructure(payload);
      
      if (response.message) {
        toast.success(response.message);
        // Reset form after successful submission
        setRegions([]);
        setNewRegion("");
        setSelectedRegion(null);
        setSelectedCategory(null);
      } else {
        throw new Error("Unexpected response from server");
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error(error.response?.data?.error || "Failed to submit regions");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectRegion = (region) => {
    setSelectedRegion(region)
    setSelectedCategory(null)
  }

  const selectCategory = (category) => {
    setSelectedCategory(category)
  }

  return (
    <div className="fixed inset-0 overflow-auto bg-gradient-to-br from-teal-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-teal-500 via-blue-500 to-indigo-500 rounded-full mb-4">
            <MapPin className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-teal-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Regional Management
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Organize your content with regions, categories, and subcategories
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-teal-500 via-blue-500 to-indigo-500 p-6">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Grid3X3 className="w-5 h-5" />
              Hierarchical Structure
            </h2>
            <p className="text-teal-100 mt-1">Build your organizational tree</p>
          </div>

          <div className="p-6">
            {/* Level 1: Region */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full"></div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Region</h3>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={newRegion}
                  onChange={(e) => setNewRegion(e.target.value)}
                  placeholder="Enter region name..."
                  className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 transition-all duration-200"
                  onKeyPress={(e) => e.key === "Enter" && handleAddRegion()}
                />
                <button
                  onClick={handleAddRegion}
                  disabled={!newRegion.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-lg hover:from-teal-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>

              {/* Existing Regions */}
              {regions.length > 0 && (
                <div className="space-y-2">
                  {regions.map((region) => (
                    <div
                      key={region.id}
                      onClick={() => selectRegion(region)}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                        selectedRegion?.id === region.id
                          ? "border-teal-500 bg-teal-50 dark:bg-teal-900/20"
                          : "border-gray-200 dark:border-gray-600 hover:border-teal-300 dark:hover:border-teal-600"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-teal-500" />
                        <span className="font-medium text-gray-800 dark:text-white">{region.name}</span>
                        <div className="ml-auto flex items-center gap-2">
                          <Trash2 
                            className="w-4 h-4 text-red-400 hover:text-red-500 transition-colors"
                            onClick={(e) => handleDeleteRegion(region.id, e)}
                          />
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Level 2: Category */}
              {selectedRegion && (
                <div className="ml-4 sm:ml-6 border-l-2 border-gradient-to-b from-teal-300 to-blue-300 pl-4 sm:pl-6 space-y-4">
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Category</h3>
                    <span className="text-sm text-gray-500 dark:text-gray-400">in {selectedRegion.name}</span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      placeholder="Enter category name..."
                      className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-200"
                      onKeyPress={(e) => e.key === "Enter" && handleAddCategory()}
                    />
                    <button
                      onClick={handleAddCategory}
                      disabled={!newCategory.trim()}
                      className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add
                    </button>
                  </div>

                  {/* Existing Categories */}
                  {selectedRegion.categories.length > 0 && (
                    <div className="space-y-2">
                      {selectedRegion.categories.map((category) => (
                        <div
                          key={category.id}
                          onClick={() => selectCategory(category)}
                          className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                            selectedCategory?.id === category.id
                              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                              : "border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-600"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Tag className="w-4 h-4 text-blue-500" />
                            <span className="font-medium text-gray-800 dark:text-white">{category.name}</span>
                            <div className="ml-auto flex items-center gap-2">
                              <Trash2 
                                className="w-4 h-4 text-red-400 hover:text-red-500 transition-colors"
                                onClick={(e) => handleDeleteCategory(category.id, e)}
                              />
                              <ChevronRight className="w-4 h-4 text-gray-400" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Level 3: Subcategory */}
                  {selectedCategory && (
                    <div className="ml-4 sm:ml-6 border-l-2 border-gradient-to-b from-blue-300 to-indigo-300 pl-4 sm:pl-6 space-y-4">
                      <div className="flex flex-wrap items-center gap-3 mb-4">
                        <div className="w-3 h-3 bg-gradient-to-r from-indigo-500 to-teal-500 rounded-full"></div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Subcategory</h3>
                        <span className="text-sm text-gray-500 dark:text-gray-400">in {selectedCategory.name}</span>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3">
                        <input
                          type="text"
                          value={newSubcategory}
                          onChange={(e) => setNewSubcategory(e.target.value)}
                          placeholder="Enter subcategory name..."
                          className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-200"
                          onKeyPress={(e) => e.key === "Enter" && handleAddSubcategory()}
                        />
                        <button
                          onClick={handleAddSubcategory}
                          disabled={!newSubcategory.trim()}
                          className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-teal-500 text-white rounded-lg hover:from-indigo-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Add
                        </button>
                      </div>

                      {/* Existing Subcategories */}
                      {selectedCategory.subcategories.length > 0 && (
                        <div className="space-y-2">
                          {selectedCategory.subcategories.map((subcategory) => (
                            <div
                              key={subcategory.id}
                              className="p-3 rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-indigo-50 dark:bg-indigo-900/20"
                            >
                              <div className="flex items-center gap-2">
                                <Grid3X3 className="w-4 h-4 text-indigo-500" />
                                <span className="font-medium text-gray-800 dark:text-white">{subcategory.name}</span>
                                <div className="ml-auto flex items-center gap-2">
                                  <Trash2 
                                    className="w-4 h-4 text-red-400 hover:text-red-500 transition-colors hover:cursor-pointer"
                                    onClick={(e) => handleDeleteSubcategory(subcategory.id, e)}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Summary Card */}
        {regions.length > 0 && (
          <div className="mt-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-gradient-to-r from-teal-500 to-indigo-500 rounded-full"></div>
              Structure Summary
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
                <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">{regions.length}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Regions</div>
              </div>
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {regions.reduce((sum, region) => sum + region.categories.length, 0)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Categories</div>
              </div>
              <div className="text-center p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                  {regions.reduce(
                    (sum, region) =>
                      sum + region.categories.reduce((catSum, category) => catSum + category.subcategories.length, 0),
                    0,
                  )}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Subcategories</div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSubmitToServer}
                disabled={isSubmitting}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  "Submit Structure"
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