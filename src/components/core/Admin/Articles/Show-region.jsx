'use client'

import { useState, useEffect } from "react"
import { getAllRegionsWithStructure } from "../../../../services/operations/articelsAPI"

const ShowRegion = ({
  selectedRegion,
  selectedCategory,
  selectedSubcategory,
  onRegionChange,
  onCategoryChange,
  onSubcategoryChange
}) => {
  const [regionsData, setRegionsData] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadRegionsData = async () => {
      setIsLoading(true)
      try {
        const data = await getAllRegionsWithStructure()
        setRegionsData(data?.regions || data || [])
      } catch (error) {
        console.error("Error loading regions data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadRegionsData()
  }, [])

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-14 bg-gray-200 rounded-2xl animate-pulse"></div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Region Select */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">Region</label>
        <select
          value={selectedRegion?._id || ""}
          onChange={(e) => {
            const region = regionsData.find(r => r._id === e.target.value)
            onRegionChange(region)
          }}
          className="w-full h-14 px-4 bg-white border-2 border-gray-200 rounded-2xl"
        >
          <option value="">Select Region</option>
          {regionsData.map((region) => (
            <option key={region._id} value={region._id}>
              {region.name}
            </option>
          ))}
        </select>
      </div>

      {/* Category Select */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">Category</label>
        <select
          value={selectedCategory?._id || ""}
          onChange={(e) => {
            const category = selectedRegion?.category?.find(c => c._id === e.target.value)
            onCategoryChange(category)
          }}
          disabled={!selectedRegion}
          className="w-full h-14 px-4 bg-white border-2 border-gray-200 rounded-2xl"
        >
          <option value="">Select Category</option>
          {selectedRegion?.category?.map((category) => (
            <option key={category._id} value={category._id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Subcategory Select */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">Subcategory</label>
        <select
          value={selectedSubcategory?._id || ""}
          onChange={(e) => {
            const subcat = selectedCategory?.subCategory?.find(sc => sc._id === e.target.value)
            onSubcategoryChange(subcat)
          }}
          disabled={!selectedCategory}
          className="w-full h-14 px-4 bg-white border-2 border-gray-200 rounded-2xl"
        >
          <option value="">Select Subcategory</option>
          {selectedCategory?.subCategory?.map((subcat) => (
            <option key={subcat._id} value={subcat._id}>
              {subcat.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

export default ShowRegion
