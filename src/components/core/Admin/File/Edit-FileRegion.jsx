"use client";

import { useState, useEffect } from "react";
import { Plus, ChevronRight, MapPin, Tag, Grid3X3, Trash2, Save, Edit } from "lucide-react";
import { GetFileRegion, UpdateFileRegion, DeleteFileRegion } from "../../../../services/operations/filesAPI";
import { toast } from "react-hot-toast";

const EditFileRegion = () => {
  const [regions, setRegions] = useState([]);
  const [selectedRegionIndex, setSelectedRegionIndex] = useState(null);
  const [selectedCategory1Index, setSelectedCategory1Index] = useState(null);
  const [selectedCategory2Index, setSelectedCategory2Index] = useState(null);
  const [selectedCategory3Index, setSelectedCategory3Index] = useState(null);
  const [selectedCategory4Index, setSelectedCategory4Index] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [newRegionName, setNewRegionName] = useState(""); // New state for region rename
  const [newCategoryInputs, setNewCategoryInputs] = useState({
    category1: false,
    category2: false,
    category3: false,
    category4: false,
    category5: false,
  });
  const [newCategoryValues, setNewCategoryValues] = useState({
    category1: "",
    category2: "",
    category3: "",
    category4: "",
    category5: "",
  });

  const selectedRegion = selectedRegionIndex !== null ? regions[selectedRegionIndex] : null;
  const selectedCategory1 = selectedCategory1Index !== null && selectedRegion ? selectedRegion.category1[selectedCategory1Index] : null;
  const selectedCategory2 = selectedCategory2Index !== null && selectedCategory1 ? selectedCategory1.category2[selectedCategory2Index] : null;
  const selectedCategory3 = selectedCategory3Index !== null && selectedCategory2 ? selectedCategory2.category3[selectedCategory3Index] : null;
  const selectedCategory4 = selectedCategory4Index !== null && selectedCategory3 ? selectedCategory3.category4[selectedCategory4Index] : null;

  useEffect(() => {
    const loadAllRegions = async () => {
      try {
        const response = await GetFileRegion();
        setRegions(response?.data || []);
      } catch (error) {
        console.error("Error loading regions:", error);
        toast.error("Failed to load regions");
      } finally {
        setIsLoading(false);
      }
    };
    loadAllRegions();
  }, []);

  // Reset new region name when selected region changes
  useEffect(() => {
    if (selectedRegion) {
      setNewRegionName(""); // Clear the new name field when region changes
    }
  }, [selectedRegion]);

  const handleUpdateRegion = async () => {
    if (selectedRegionIndex === null) {
      toast.error("Please select a region to update");
      return;
    }

    setIsUpdating(true);
    try {
      const regionToUpdate = {
        ...selectedRegion,
        ...(newRegionName.trim() && { name: newRegionName.trim() }) // Only include new name if provided
      };

      const response = await UpdateFileRegion(selectedRegion.name, regionToUpdate);
      
      if (response.message) {
        toast.success(response.message);
        const updatedResponse = await GetFileRegion();
        setRegions(updatedResponse?.data || []);
        setNewRegionName(""); // Reset new name field
        const newIndex = updatedResponse?.data?.findIndex(r => r.name === (newRegionName.trim() || selectedRegion.name));
        setSelectedRegionIndex(newIndex ?? null);
      } else {
        throw new Error("Unexpected response from server");
      }
    } catch (error) {
      console.error("Update error:", error);
      toast.error(error.response?.data?.error || "Failed to update region");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteRegion = async () => {
    if (selectedRegionIndex === null) {
      toast.error("Please select a region to delete");
      return;
    }

    setIsDeleting(true);
    try {
      const response = await DeleteFileRegion(selectedRegion.name);
      
      if (response.message) {
        toast.success(response.message);
        const updatedResponse = await GetFileRegion();
        setRegions(updatedResponse?.data || []);
        setSelectedRegionIndex(null);
        setNewRegionName(""); // Reset new name field
      } else {
        throw new Error("Unexpected response from server");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(error.response?.data?.error || "Failed to delete region");
    } finally {
      setIsDeleting(false);
    }
  };

  const selectRegion = (index) => {
    setSelectedRegionIndex(index);
    setSelectedCategory1Index(null);
    setSelectedCategory2Index(null);
    setSelectedCategory3Index(null);
    setSelectedCategory4Index(null);
  };

  const selectCategory1 = (index) => {
    setSelectedCategory1Index(index);
    setSelectedCategory2Index(null);
    setSelectedCategory3Index(null);
    setSelectedCategory4Index(null);
  };

  const selectCategory2 = (index) => {
    setSelectedCategory2Index(index);
    setSelectedCategory3Index(null);
    setSelectedCategory4Index(null);
  };

  const selectCategory3 = (index) => {
    setSelectedCategory3Index(index);
    setSelectedCategory4Index(null);
  };

  const selectCategory4 = (index) => {
    setSelectedCategory4Index(index);
  };

  const updateCategoryName = (categoryType, index, e) => {
    const newName = e.target.value;
    setRegions(prev => prev.map((region, i) => {
      if (i !== selectedRegionIndex) return region;
      
      if (categoryType === 'category1') {
        const updatedCategories = [...region.category1];
        updatedCategories[index] = { ...updatedCategories[index], name: newName };
        return { ...region, category1: updatedCategories };
      }

      if (categoryType === 'category2') {
        return {
          ...region,
          category1: region.category1.map((cat1, idx1) => {
            if (idx1 !== selectedCategory1Index) return cat1;
            const updatedCategories = [...cat1.category2];
            updatedCategories[index] = { ...updatedCategories[index], name: newName };
            return { ...cat1, category2: updatedCategories };
          })
        };
      }

      if (categoryType === 'category3') {
        return {
          ...region,
          category1: region.category1.map((cat1, idx1) => {
            if (idx1 !== selectedCategory1Index) return cat1;
            return {
              ...cat1,
              category2: cat1.category2.map((cat2, idx2) => {
                if (idx2 !== selectedCategory2Index) return cat2;
                const updatedCategories = [...cat2.category3];
                updatedCategories[index] = { ...updatedCategories[index], name: newName };
                return { ...cat2, category3: updatedCategories };
              })
            };
          })
        };
      }

      if (categoryType === 'category4') {
        return {
          ...region,
          category1: region.category1.map((cat1, idx1) => {
            if (idx1 !== selectedCategory1Index) return cat1;
            return {
              ...cat1,
              category2: cat1.category2.map((cat2, idx2) => {
                if (idx2 !== selectedCategory2Index) return cat2;
                return {
                  ...cat2,
                  category3: cat2.category3.map((cat3, idx3) => {
                    if (idx3 !== selectedCategory3Index) return cat3;
                    const updatedCategories = [...cat3.category4];
                    updatedCategories[index] = { ...updatedCategories[index], name: newName };
                    return { ...cat3, category4: updatedCategories };
                  })
                };
              })
            };
          })
        };
      }

      if (categoryType === 'category5') {
        return {
          ...region,
          category1: region.category1.map((cat1, idx1) => {
            if (idx1 !== selectedCategory1Index) return cat1;
            return {
              ...cat1,
              category2: cat1.category2.map((cat2, idx2) => {
                if (idx2 !== selectedCategory2Index) return cat2;
                return {
                  ...cat2,
                  category3: cat2.category3.map((cat3, idx3) => {
                    if (idx3 !== selectedCategory3Index) return cat3;
                    return {
                      ...cat3,
                      category4: cat3.category4.map((cat4, idx4) => {
                        if (idx4 !== selectedCategory4Index) return cat4;
                        const updatedCategories = [...cat4.category5];
                        updatedCategories[index] = { ...updatedCategories[index], name: newName };
                        return { ...cat4, category5: updatedCategories };
                      })
                    };
                  })
                };
              })
            };
          })
        };
      }

      return region;
    }));
  };

  const toggleNewCategoryInput = (categoryType) => {
    setNewCategoryInputs(prev => ({
      ...prev,
      [categoryType]: !prev[categoryType]
    }));
    setNewCategoryValues(prev => ({
      ...prev,
      [categoryType]: ""
    }));
  };

  const handleNewCategoryChange = (categoryType, e) => {
    setNewCategoryValues(prev => ({
      ...prev,
      [categoryType]: e.target.value
    }));
  };

  const addNewCategory = (categoryType) => {
    if (!newCategoryValues[categoryType].trim()) {
      toast.error("Please enter a name for the new category");
      return;
    }

    const newCategory = {
      name: newCategoryValues[categoryType].trim(),
      [`category${parseInt(categoryType.replace('category', '')) + 1}`]: []
    };

    setRegions(prev => prev.map((region, i) => {
      if (i !== selectedRegionIndex) return region;

      if (categoryType === 'category1') {
        return {
          ...region,
          category1: [...region.category1, newCategory]
        };
      }

      if (categoryType === 'category2') {
        return {
          ...region,
          category1: region.category1.map((cat1, idx1) => {
            if (idx1 !== selectedCategory1Index) return cat1;
            return {
              ...cat1,
              category2: [...cat1.category2, newCategory]
            };
          })
        };
      }

      if (categoryType === 'category3') {
        return {
          ...region,
          category1: region.category1.map((cat1, idx1) => {
            if (idx1 !== selectedCategory1Index) return cat1;
            return {
              ...cat1,
              category2: cat1.category2.map((cat2, idx2) => {
                if (idx2 !== selectedCategory2Index) return cat2;
                return {
                  ...cat2,
                  category3: [...cat2.category3, newCategory]
                };
              })
            };
          })
        };
      }

      if (categoryType === 'category4') {
        return {
          ...region,
          category1: region.category1.map((cat1, idx1) => {
            if (idx1 !== selectedCategory1Index) return cat1;
            return {
              ...cat1,
              category2: cat1.category2.map((cat2, idx2) => {
                if (idx2 !== selectedCategory2Index) return cat2;
                return {
                  ...cat2,
                  category3: cat2.category3.map((cat3, idx3) => {
                    if (idx3 !== selectedCategory3Index) return cat3;
                    return {
                      ...cat3,
                      category4: [...cat3.category4, newCategory]
                    };
                  })
                };
              })
            };
          })
        };
      }

      if (categoryType === 'category5') {
        return {
          ...region,
          category1: region.category1.map((cat1, idx1) => {
            if (idx1 !== selectedCategory1Index) return cat1;
            return {
              ...cat1,
              category2: cat1.category2.map((cat2, idx2) => {
                if (idx2 !== selectedCategory2Index) return cat2;
                return {
                  ...cat2,
                  category3: cat2.category3.map((cat3, idx3) => {
                    if (idx3 !== selectedCategory3Index) return cat3;
                    return {
                      ...cat3,
                      category4: cat3.category4.map((cat4, idx4) => {
                        if (idx4 !== selectedCategory4Index) return cat4;
                        return {
                          ...cat4,
                          category5: [...cat4.category5, { name: newCategoryValues[categoryType].trim() }]
                        };
                      })
                    };
                  })
                };
              })
            };
          })
        };
      }

      return region;
    }));

    // Reset the input
    setNewCategoryInputs(prev => ({
      ...prev,
      [categoryType]: false
    }));
    setNewCategoryValues(prev => ({
      ...prev,
      [categoryType]: ""
    }));
  };

  const deleteCategory = (categoryType, index, e) => {
    e.stopPropagation();
    setRegions(prev => prev.map((region, i) => {
      if (i !== selectedRegionIndex) return region;

      if (categoryType === 'category1') {
        return {
          ...region,
          category1: region.category1.filter((_, i) => i !== index)
        };
      }

      if (categoryType === 'category2') {
        return {
          ...region,
          category1: region.category1.map((cat1, idx1) => {
            if (idx1 !== selectedCategory1Index) return cat1;
            return {
              ...cat1,
              category2: cat1.category2.filter((_, i) => i !== index)
            };
          })
        };
      }

      if (categoryType === 'category3') {
        return {
          ...region,
          category1: region.category1.map((cat1, idx1) => {
            if (idx1 !== selectedCategory1Index) return cat1;
            return {
              ...cat1,
              category2: cat1.category2.map((cat2, idx2) => {
                if (idx2 !== selectedCategory2Index) return cat2;
                return {
                  ...cat2,
                  category3: cat2.category3.filter((_, i) => i !== index)
                };
              })
            };
          })
        };
      }

      if (categoryType === 'category4') {
        return {
          ...region,
          category1: region.category1.map((cat1, idx1) => {
            if (idx1 !== selectedCategory1Index) return cat1;
            return {
              ...cat1,
              category2: cat1.category2.map((cat2, idx2) => {
                if (idx2 !== selectedCategory2Index) return cat2;
                return {
                  ...cat2,
                  category3: cat2.category3.map((cat3, idx3) => {
                    if (idx3 !== selectedCategory3Index) return cat3;
                    return {
                      ...cat3,
                      category4: cat3.category4.filter((_, i) => i !== index)
                    };
                  })
                };
              })
            };
          })
        };
      }

      if (categoryType === 'category5') {
        return {
          ...region,
          category1: region.category1.map((cat1, idx1) => {
            if (idx1 !== selectedCategory1Index) return cat1;
            return {
              ...cat1,
              category2: cat1.category2.map((cat2, idx2) => {
                if (idx2 !== selectedCategory2Index) return cat2;
                return {
                  ...cat2,
                  category3: cat2.category3.map((cat3, idx3) => {
                    if (idx3 !== selectedCategory3Index) return cat3;
                    return {
                      ...cat3,
                      category4: cat3.category4.map((cat4, idx4) => {
                        if (idx4 !== selectedCategory4Index) return cat4;
                        return {
                          ...cat4,
                          category5: cat4.category5.filter((_, i) => i !== index)
                        };
                      })
                    };
                  })
                };
              })
            };
          })
        };
      }

      return region;
    }));
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 overflow-auto bg-gradient-to-br from-teal-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 p-4 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 overflow-auto bg-gradient-to-br from-teal-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 p-2 sm:p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-4 sm:mb-6 md:mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-teal-500 via-blue-500 to-indigo-500 rounded-full mb-2 sm:mb-4">
            <Edit className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-teal-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-1 sm:mb-2">
            Edit File Regions
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
            Modify existing regions and their categories
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-teal-500 via-blue-500 to-indigo-500 p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-white flex items-center gap-2">
              <Grid3X3 className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base md:text-lg">Edit Hierarchical Structure</span>
            </h2>
            <p className="text-teal-100 text-xs sm:text-sm mt-1">Update your organizational tree</p>
          </div>

          <div className="p-3 sm:p-4 md:p-6">
            {/* Level 1: Region */}
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-4">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full"></div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white">Region</h3>
              </div>

              {/* Existing Regions */}
              {regions.length > 0 ? (
                <div className="space-y-1 sm:space-y-2">
                  {regions.map((region, index) => (
                    <div
                      key={region._id || index}
                      onClick={() => selectRegion(index)}
                      className={`p-2 sm:p-3 rounded-md sm:rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                        selectedRegionIndex === index
                          ? "border-teal-500 bg-teal-50 dark:bg-teal-900/20"
                          : "border-gray-200 dark:border-gray-600 hover:border-teal-300 dark:hover:border-teal-600"
                      }`}
                    >
                      <div className="flex items-center gap-1 sm:gap-2">
                        <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-teal-500" />
                        <span className="text-sm sm:text-base font-medium text-gray-800 dark:text-white">{region.name}</span>
                        <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 ml-auto" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-2 sm:py-3 text-sm text-gray-500">
                  No regions found.
                </div>
              )}

              {/* Region Name Update Section - Only show when a region is selected */}
{selectedRegion && (
  <div className="mt-2">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
      Update Region Name (Optional)
    </label>
    <input
      type="text"
      value={newRegionName}
      onChange={(e) => setNewRegionName(e.target.value)}
      placeholder={`Rename "${selectedRegion.name}"...`}
      className="
        w-full
        p-2 sm:p-3
        rounded-md sm:rounded-lg
        border-2
        border-gray-200 dark:border-gray-600
        bg-teal-50 dark:bg-gray-800
        text-gray-800 dark:text-white
        focus:outline-none
        focus:border-teal-500
        transition-all duration-200
        text-sm sm:text-base
      "
    />
    {newRegionName?.trim()?.length > 0 && (
      <p className="text-xs text-teal-600 dark:text-teal-400 mt-2">
        Will rename from "{selectedRegion.name}" to "{newRegionName}"
      </p>
    )}
  </div>
)}

              {/* Categories for selected region */}
              {selectedRegion && (
                <div className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
                  {/* Category 1 */}
                  <div className="ml-2 sm:ml-4 md:ml-6 border-l-2 border-teal-300 pl-2 sm:pl-4 md:pl-6 space-y-2 sm:space-y-4">
                    <div className="flex flex-wrap items-center gap-1 sm:gap-2 md:gap-3 mb-2 sm:mb-4">
                      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
                      <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800 dark:text-white">Category 1</h3>
                      <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">in {selectedRegion.name}</span>
                      <button
                        onClick={() => toggleNewCategoryInput('category1')}
                        className="ml-auto px-2 sm:px-3 py-1 sm:py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded-md sm:rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-all duration-200 flex items-center justify-center gap-1 text-xs sm:text-sm"
                      >
                        <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">Add</span>
                      </button>
                    </div>

                    {newCategoryInputs.category1 && (
                      <div className="flex flex-col sm:flex-row gap-3">
                        <input
                          type="text"
                          value={newCategoryValues.category1}
                          onChange={(e) => handleNewCategoryChange('category1', e)}
                          placeholder="Enter new category name"
                          className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-200"
                        />
                        <button
                          onClick={() => addNewCategory('category1')}
                          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                        >
                        <Plus className="w-4 h-4" />
                          Add
                        </button>
                      </div>
                    )}

                    {selectedRegion.category1?.length > 0 ? (
                      <div className="space-y-1 sm:space-y-2">
                        {selectedRegion.category1.map((category, index) => (
                          <div
                            key={index}
                            onClick={() => selectCategory1(index)}
                            className={`p-2 sm:p-3 rounded-md sm:rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                              selectedCategory1Index === index
                                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                : "border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-600"
                            }`}
                          >
                            <div className="flex items-center gap-1 sm:gap-2">
                              <Tag className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
                              <input
                                type="text"
                                value={category.name}
                                onChange={(e) => updateCategoryName('category1', index, e)}
                                className="flex-1 text-sm sm:text-base font-medium text-gray-800 dark:text-white bg-transparent border-b border-transparent focus:border-blue-300 focus:outline-none px-1"
                                onClick={(e) => e.stopPropagation()}
                              />
                              <button
                                onClick={(e) => deleteCategory('category1', index, e)}
                                className="ml-auto p-0.5 sm:p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                              >
                                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-2 sm:py-3 text-xs sm:text-sm text-gray-500">
                        No Category 1 items found.
                      </div>
                    )}
                  </div>

                  {/* Category 2 - Only show if a category1 is selected */}
                  {selectedCategory1Index !== null && (
                    <div className="ml-4 sm:ml-6 md:ml-8 border-l-2 border-blue-300 pl-2 sm:pl-4 md:pl-6 space-y-2 sm:space-y-4">
                      <div className="flex flex-wrap items-center gap-1 sm:gap-2 md:gap-3 mb-2 sm:mb-4">
                        <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
                        <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800 dark:text-white">Category 2</h3>
                        <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">in {selectedCategory1.name}</span>
                        <button
                          onClick={() => toggleNewCategoryInput('category2')}
                          className="ml-auto px-2 sm:px-3 py-1 sm:py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 rounded-md sm:rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900/40 transition-all duration-200 flex items-center justify-center gap-1 text-xs sm:text-sm"
                        >
                          <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="hidden sm:inline">Add</span>
                        </button>
                      </div>

                      {newCategoryInputs.category2 && (
                        <div className="flex flex-col sm:flex-row gap-3">
                          <input
                            type="text"
                            value={newCategoryValues.category2}
                            onChange={(e) => handleNewCategoryChange('category2', e)}
                            placeholder="Enter new category name"
                            className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-200"
                          />
                          <button
                            onClick={() => addNewCategory('category2')}
                             className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                        >
                        <Plus className="w-4 h-4" />
                          Add
                          </button>
                          
                        </div>
                      )}

                      {selectedCategory1.category2?.length > 0 ? (
                        <div className="space-y-1 sm:space-y-2">
                          {selectedCategory1.category2.map((category, index) => (
                            <div
                              key={index}
                              onClick={() => selectCategory2(index)}
                              className={`p-2 sm:p-3 rounded-md sm:rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                                selectedCategory2Index === index
                                  ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                                  : "border-gray-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-600"
                              }`}
                            >
                              <div className="flex items-center gap-1 sm:gap-2">
                                <Tag className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-500" />
                                <input
                                  type="text"
                                  value={category.name}
                                  onChange={(e) => updateCategoryName('category2', index, e)}
                                  className="flex-1 text-sm sm:text-base font-medium text-gray-800 dark:text-white bg-transparent border-b border-transparent focus:border-indigo-300 focus:outline-none px-1"
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <button
                                  onClick={(e) => deleteCategory('category2', index, e)}
                                  className="ml-auto p-0.5 sm:p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                >
                                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-2 sm:py-3 text-xs sm:text-sm text-gray-500">
                          No Category 2 items found.
                        </div>
                      )}
                    </div>
                  )}

                  {/* Category 3 - Only show if a category2 is selected */}
                  {selectedCategory2Index !== null && (
                    <div className="ml-6 sm:ml-8 md:ml-10 border-l-2 border-indigo-300 pl-2 sm:pl-4 md:pl-6 space-y-2 sm:space-y-4">
                      <div className="flex flex-wrap items-center gap-1 sm:gap-2 md:gap-3 mb-2 sm:mb-4">
                        <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                        <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800 dark:text-white">Category 3</h3>
                        <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">in {selectedCategory2.name}</span>
                        <button
                          onClick={() => toggleNewCategoryInput('category3')}
                          className="ml-auto px-2 sm:px-3 py-1 sm:py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 rounded-md sm:rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/40 transition-all duration-200 flex items-center justify-center gap-1 text-xs sm:text-sm"
                        >
                          <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="hidden sm:inline">Add</span>
                        </button>
                      </div>

                      {newCategoryInputs.category3 && (
                        <div className="flex flex-col sm:flex-row gap-3">
                          <input
                            type="text"
                            value={newCategoryValues.category3}
                            onChange={(e) => handleNewCategoryChange('category3', e)}
                            placeholder="Enter new category name"
                            className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-200"
                          />
                          <button
                            onClick={() => addNewCategory('category3')}
                            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                        >
                        <Plus className="w-4 h-4" />
                          Add
                          </button>
                          
                        </div>
                      )}

                      {selectedCategory2.category3?.length > 0 ? (
                        <div className="space-y-1 sm:space-y-2">
                          {selectedCategory2.category3.map((category, index) => (
                            <div
                              key={index}
                              onClick={() => selectCategory3(index)}
                              className={`p-2 sm:p-3 rounded-md sm:rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                                selectedCategory3Index === index
                                  ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                                  : "border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-600"
                              }`}
                            >
                              <div className="flex items-center gap-1 sm:gap-2">
                                <Tag className="w-3 h-3 sm:w-4 sm:h-4 text-purple-500" />
                                <input
                                  type="text"
                                  value={category.name}
                                  onChange={(e) => updateCategoryName('category3', index, e)}
                                  className="flex-1 text-sm sm:text-base font-medium text-gray-800 dark:text-white bg-transparent border-b border-transparent focus:border-purple-300 focus:outline-none px-1"
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <button
                                  onClick={(e) => deleteCategory('category3', index, e)}
                                  className="ml-auto p-0.5 sm:p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                >
                                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-2 sm:py-3 text-xs sm:text-sm text-gray-500">
                          No Category 3 items found.
                        </div>
                      )}
                    </div>
                  )}

                  {/* Category 4 - Only show if a category3 is selected */}
                  {selectedCategory3Index !== null && (
                    <div className="ml-8 sm:ml-10 md:ml-12 border-l-2 border-purple-300 pl-2 sm:pl-4 md:pl-6 space-y-2 sm:space-y-4">
                      <div className="flex flex-wrap items-center gap-1 sm:gap-2 md:gap-3 mb-2 sm:mb-4">
                        <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gradient-to-r from-pink-500 to-red-500 rounded-full"></div>
                        <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800 dark:text-white">Category 4 (Optional)</h3>
                        <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">in {selectedCategory3.name}</span>
                        <button
                          onClick={() => toggleNewCategoryInput('category4')}
                          className="ml-auto px-2 sm:px-3 py-1 sm:py-2 bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-300 rounded-md sm:rounded-lg hover:bg-pink-200 dark:hover:bg-pink-900/40 transition-all duration-200 flex items-center justify-center gap-1 text-xs sm:text-sm"
                        >
                          <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="hidden sm:inline">Add</span>
                        </button>
                      </div>

                      {newCategoryInputs.category4 && (
                        <div className="flex flex-col sm:flex-row gap-3">
                          <input
                            type="text"
                            value={newCategoryValues.category4}
                            onChange={(e) => handleNewCategoryChange('category4', e)}
                            placeholder="Enter new category name"
                            className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-200"
                          />
                          <button
                            onClick={() => addNewCategory('category4')}
                             className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                        >
                        <Plus className="w-4 h-4" />
                          Add
                          </button>
                          
                        </div>
                      )}

                      {selectedCategory3.category4?.length > 0 ? (
                        <div className="space-y-1 sm:space-y-2">
                          {selectedCategory3.category4.map((category, index) => (
                            <div
                              key={index}
                              onClick={() => selectCategory4(index)}
                              className={`p-2 sm:p-3 rounded-md sm:rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                                selectedCategory4Index === index
                                  ? "border-pink-500 bg-pink-50 dark:bg-pink-900/20"
                                  : "border-gray-200 dark:border-gray-600 hover:border-pink-300 dark:hover:border-pink-600"
                              }`}
                            >
                              <div className="flex items-center gap-1 sm:gap-2">
                                <Tag className="w-3 h-3 sm:w-4 sm:h-4 text-pink-500" />
                                <input
                                  type="text"
                                  value={category.name}
                                  onChange={(e) => updateCategoryName('category4', index, e)}
                                  className="flex-1 text-sm sm:text-base font-medium text-gray-800 dark:text-white bg-transparent border-b border-transparent focus:border-pink-300 focus:outline-none px-1"
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <button
                                  onClick={(e) => deleteCategory('category4', index, e)}
                                  className="ml-auto p-0.5 sm:p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                >
                                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-2 sm:py-3 text-xs sm:text-sm text-gray-500">
                          No Category 4 items found.
                        </div>
                      )}
                    </div>
                  )}

                  {/* Category 5 - Only show if a category4 is selected */}
                  {selectedCategory4Index !== null && (
                    <div className="ml-10 sm:ml-12 md:ml-14 border-l-2 border-pink-300 pl-2 sm:pl-4 md:pl-6 space-y-2 sm:space-y-4">
                      <div className="flex flex-wrap items-center gap-1 sm:gap-2 md:gap-3 mb-2 sm:mb-4">
                        <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gradient-to-r from-red-500 to-orange-500 rounded-full"></div>
                        <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800 dark:text-white">Category 5 (Optional)</h3>
                        <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">in {selectedCategory4.name}</span>
                        <button
                          onClick={() => toggleNewCategoryInput('category5')}
                          className="ml-auto px-2 sm:px-3 py-1 sm:py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300 rounded-md sm:rounded-lg hover:bg-red-200 dark:hover:bg-red-900/40 transition-all duration-200 flex items-center justify-center gap-1 text-xs sm:text-sm"
                        >
                          <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="hidden sm:inline">Add</span>
                        </button>
                      </div>

                      {newCategoryInputs.category5 && (
                        <div className="flex flex-col sm:flex-row gap-3">
                          <input
                            type="text"
                            value={newCategoryValues.category5}
                            onChange={(e) => handleNewCategoryChange('category5', e)}
                            placeholder="Enter new category name"
                            className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-200"
                          />
                          <button
                            onClick={() => addNewCategory('category5')}
                            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                        >
                        <Plus className="w-4 h-4" />
                          Add
                          </button>
                         
                        </div>
                      )}

                      {selectedCategory4.category5?.length > 0 ? (
                        <div className="space-y-1 sm:space-y-2">
                          {selectedCategory4.category5.map((category, index) => (
                            <div
                              key={index}
                              className="p-2 sm:p-3 rounded-md sm:rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-red-50 dark:bg-red-900/20"
                            >
                              <div className="flex items-center gap-1 sm:gap-2">
                                <Tag className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />
                                <input
                                  type="text"
                                  value={category.name}
                                  onChange={(e) => updateCategoryName('category5', index, e)}
                                  className="flex-1 text-sm sm:text-base font-medium text-gray-800 dark:text-white bg-transparent border-b border-transparent focus:border-red-300 focus:outline-none px-1"
                                />
                                <button
                                  onClick={(e) => deleteCategory('category5', index, e)}
                                  className="ml-auto p-0.5 sm:p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                >
                                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-2 sm:py-3 text-xs sm:text-sm text-gray-500">
                          No Category 5 items found.
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
          <div className="mt-4 sm:mt-6 bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-md sm:shadow-lg border border-gray-100 dark:border-gray-700 p-3 sm:p-4 md:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex-1">
                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800 dark:text-white mb-1">
                  Editing: {selectedRegion.name}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  {selectedRegion.category1?.length || 0} Category 1 items,{' '}
                  {selectedRegion.category1?.reduce((sum, cat1) => sum + (cat1.category2?.length || 0), 0) || 0} Category 2 items,{' '}
                  {selectedRegion.category1?.reduce((sum, cat1) => sum + (cat1.category2?.reduce((s, cat2) => s + (cat2.category3?.length || 0), 0) || 0), 0) || 0} Category 3 items
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <button
                  onClick={handleDeleteRegion}
                  disabled={isDeleting}
                  className="px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:from-red-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 text-xs sm:text-sm"
                >
                  {isDeleting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-1 h-3 w-3 sm:h-4 sm:w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      Delete
                    </>
                  )}
                </button>
                <button
                  onClick={handleUpdateRegion}
                  disabled={isUpdating}
                  className="px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-lg hover:from-teal-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 text-xs sm:text-sm"
                >
                  {isUpdating ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-1 h-3 w-3 sm:h-4 sm:w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="w-3 h-3 sm:w-4 sm:h-4" />
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
  );
};

export default EditFileRegion;