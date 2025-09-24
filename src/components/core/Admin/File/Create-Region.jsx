"use client";
import { useState } from "react";
import { Plus, MapPin, Tag, Grid3X3, Trash2 } from 'lucide-react';
import { CreateFileRegion } from "../../../../services/operations/filesAPI";
import { toast } from "react-hot-toast";

const FileRegion = () => {
  const [regions, setRegions] = useState([]);
  const [newRegion, setNewRegion] = useState("");
  const [selectedRegionIndex, setSelectedRegionIndex] = useState(null);
  const [selectedCategory1Index, setSelectedCategory1Index] = useState(null);
  const [selectedCategory2Index, setSelectedCategory2Index] = useState(null);
  const [selectedCategory3Index, setSelectedCategory3Index] = useState(null);
  const [selectedCategory4Index, setSelectedCategory4Index] = useState(null);
  const [newCategory1, setNewCategory1] = useState("");
  const [newCategory2, setNewCategory2] = useState("");
  const [newCategory3, setNewCategory3] = useState("");
  const [newCategory4, setNewCategory4] = useState("");
  const [newCategory5, setNewCategory5] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedRegion = selectedRegionIndex !== null ? regions[selectedRegionIndex] : null;
  const selectedCategory1 = selectedCategory1Index !== null && selectedRegion ? selectedRegion.category1[selectedCategory1Index] : null;
  const selectedCategory2 = selectedCategory2Index !== null && selectedCategory1 ? selectedCategory1.category2[selectedCategory2Index] : null;
  const selectedCategory3 = selectedCategory3Index !== null && selectedCategory2 ? selectedCategory2.category3[selectedCategory3Index] : null;
  const selectedCategory4 = selectedCategory4Index !== null && selectedCategory3 ? selectedCategory3.category4[selectedCategory4Index] : null;

  const handleAddRegion = () => {
    if (newRegion.trim()) {
      const region = {
        name: newRegion.trim(),
        category1: []
      };
      setRegions([...regions, region]);
      setNewRegion("");
      setSelectedRegionIndex(regions.length);
      setSelectedCategory1Index(null);
      setSelectedCategory2Index(null);
      setSelectedCategory3Index(null);
      setSelectedCategory4Index(null);
    }
  };

  const handleAddCategory1 = () => {
    if (newCategory1.trim() && selectedRegionIndex !== null) {
      const category = {
        name: newCategory1.trim(),
        category2: []
      };
      const updatedRegions = [...regions];
      updatedRegions[selectedRegionIndex].category1.push(category);
      setRegions(updatedRegions);
      setNewCategory1("");
      setSelectedCategory1Index(updatedRegions[selectedRegionIndex].category1.length - 1);
      setSelectedCategory2Index(null);
      setSelectedCategory3Index(null);
      setSelectedCategory4Index(null);
    }
  };

  const handleAddCategory2 = () => {
    if (newCategory2.trim() && selectedRegionIndex !== null && selectedCategory1Index !== null) {
      const updatedRegions = [...regions];
      const category = {
        name: newCategory2.trim(),
        category3: []
      };
      
      updatedRegions[selectedRegionIndex].category1[selectedCategory1Index].category2.push(category);
      setRegions(updatedRegions);
      setNewCategory2("");
      setSelectedCategory2Index(updatedRegions[selectedRegionIndex].category1[selectedCategory1Index].category2.length - 1);
      setSelectedCategory3Index(null);
      setSelectedCategory4Index(null);
    }
  };

  const handleAddCategory3 = () => {
    if (newCategory3.trim() && selectedRegionIndex !== null && selectedCategory1Index !== null && selectedCategory2Index !== null) {
      const updatedRegions = [...regions];
      const category = {
        name: newCategory3.trim(),
        category4: []
      };
      
      updatedRegions[selectedRegionIndex].category1[selectedCategory1Index].category2[selectedCategory2Index].category3.push(category);
      setRegions(updatedRegions);
      setNewCategory3("");
      setSelectedCategory3Index(updatedRegions[selectedRegionIndex].category1[selectedCategory1Index].category2[selectedCategory2Index].category3.length - 1);
      setSelectedCategory4Index(null);
    }
  };

  const handleAddCategory4 = () => {
    if (newCategory4.trim() && selectedRegionIndex !== null && selectedCategory1Index !== null && selectedCategory2Index !== null && selectedCategory3Index !== null) {
      const updatedRegions = [...regions];
      const category = {
        name: newCategory4.trim(),
        category5: []
      };
      
      updatedRegions[selectedRegionIndex].category1[selectedCategory1Index].category2[selectedCategory2Index].category3[selectedCategory3Index].category4.push(category);
      setRegions(updatedRegions);
      setNewCategory4("");
      setSelectedCategory4Index(updatedRegions[selectedRegionIndex].category1[selectedCategory1Index].category2[selectedCategory2Index].category3[selectedCategory3Index].category4.length - 1);
    }
  };

  const handleAddCategory5 = () => {
    if (newCategory5.trim() && selectedRegionIndex !== null && selectedCategory1Index !== null && selectedCategory2Index !== null && selectedCategory3Index !== null && selectedCategory4Index !== null) {
      const updatedRegions = [...regions];
      
      updatedRegions[selectedRegionIndex].category1[selectedCategory1Index].category2[selectedCategory2Index].category3[selectedCategory3Index].category4[selectedCategory4Index].category5.push({
        name: newCategory5.trim()
      });
      setRegions(updatedRegions);
      setNewCategory5("");
    }
  };

  const handleSubmitToServer = async () => {
    if (regions.length === 0) {
      toast.error("Please add at least one region before submitting");
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await CreateFileRegion(regions);
      
      if (response.message) {
        toast.success(response.message);
        setRegions([]);
        setNewRegion("");
        setSelectedRegionIndex(null);
        setSelectedCategory1Index(null);
        setSelectedCategory2Index(null);
        setSelectedCategory3Index(null);
        setSelectedCategory4Index(null);
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

  const updateRegionName = (e, index) => {
    const newName = e.target.value;
    setRegions(prev => prev.map((region, i) => 
      i === index ? { ...region, name: newName } : region
    ));
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

  const deleteRegion = (index, e) => {
    e.stopPropagation();
    setRegions(prev => prev.filter((_, i) => i !== index));
    if (selectedRegionIndex === index) {
      setSelectedRegionIndex(null);
      setSelectedCategory1Index(null);
      setSelectedCategory2Index(null);
      setSelectedCategory3Index(null);
      setSelectedCategory4Index(null);
    } else if (selectedRegionIndex > index) {
      setSelectedRegionIndex(selectedRegionIndex - 1);
    }
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

  return (
    <div className="fixed inset-0 overflow-auto bg-gradient-to-br from-teal-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 p-2 sm:p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-4 sm:mb-6 md:mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-teal-500 via-blue-500 to-indigo-500 rounded-full mb-2 sm:mb-4">
            <MapPin className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white" />
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-teal-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-1 sm:mb-2">
            Regional Management
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-300">
            Organize your content with regions and categories
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-teal-500 via-blue-500 to-indigo-500 p-3 sm:p-4 md:p-6">
            <h2 className="text-base sm:text-lg md:text-xl font-semibold text-white flex items-center gap-2">
              <Grid3X3 className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base md:text-lg">Hierarchical Structure</span>
            </h2>
            <p className="text-teal-100 text-xs sm:text-sm mt-1">Build your organizational tree</p>
          </div>

          <div className="p-3 sm:p-4 md:p-6">
            {/* Level 1: Region */}
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-4">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full"></div>
                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800 dark:text-white">Region</h3>
              </div>

              <div className="flex flex-col gap-2 sm:gap-3">
                <input
                  type="text"
                  value={newRegion}
                  onChange={(e) => setNewRegion(e.target.value)}
                  placeholder="Enter region name..."
                  className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 transition-all duration-200 text-sm sm:text-base"
                  onKeyPress={(e) => e.key === "Enter" && handleAddRegion()}
                />
                <button
                  onClick={handleAddRegion}
                  disabled={!newRegion.trim()}
                  className="w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-lg hover:from-teal-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                  Add Region
                </button>
              </div>

              {/* Existing Regions */}
              {regions.length > 0 && (
                <div className="space-y-1 sm:space-y-2">
                  {regions.map((region, index) => (
                    <div
                      key={index}
                      onClick={() => selectRegion(index)}
                      className={`p-2 sm:p-3 rounded-md sm:rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                        selectedRegionIndex === index
                          ? "border-teal-500 bg-teal-50 dark:bg-teal-900/20"
                          : "border-gray-200 dark:border-gray-600 hover:border-teal-300 dark:hover:border-teal-600"
                      }`}
                    >
                      <div className="flex items-center gap-1 sm:gap-2">
                        <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-teal-500 flex-shrink-0" />
                        <input
                          type="text"
                          value={region.name}
                          onChange={(e) => updateRegionName(e, index)}
                          className="flex-1 bg-transparent border-b border-transparent focus:border-teal-300 focus:outline-none px-1 font-medium text-gray-800 dark:text-white text-sm sm:text-base min-w-0"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <button
                          onClick={(e) => deleteRegion(index, e)}
                          className="ml-auto p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded flex-shrink-0"
                        >
                          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Categories for selected region */}
              {selectedRegionIndex !== null && (
                <div className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
                  {/* Category 1 */}
                  <div className="ml-2 sm:ml-4 md:ml-6 border-l-2 border-teal-300 pl-2 sm:pl-4 md:pl-6 space-y-2 sm:space-y-4">
                    <div className="flex flex-wrap items-center gap-1 sm:gap-2 md:gap-3 mb-2 sm:mb-4">
                      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
                      <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800 dark:text-white">Category 1</h3>
                      <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 break-all">in {regions[selectedRegionIndex].name}</span>
                    </div>

                    <div className="flex flex-col gap-2 sm:gap-3">
                      <input
                        type="text"
                        value={newCategory1}
                        onChange={(e) => setNewCategory1(e.target.value)}
                        placeholder="Enter Category 1 name..."
                        className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-200 text-sm sm:text-base"
                        onKeyPress={(e) => e.key === "Enter" && handleAddCategory1()}
                      />
                      <button
                        onClick={handleAddCategory1}
                        disabled={!newCategory1.trim()}
                        className="w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base"
                      >
                        <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                        Add Category 1
                      </button>
                    </div>

                    {/* Existing Category 1 items */}
                    {regions[selectedRegionIndex].category1.length > 0 && (
                      <div className="space-y-1 sm:space-y-2">
                        {regions[selectedRegionIndex].category1.map((category, index) => (
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
                              <Tag className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 flex-shrink-0" />
                              <input
                                type="text"
                                value={category.name}
                                onChange={(e) => updateCategoryName('category1', index, e)}
                                className="flex-1 bg-transparent border-b border-transparent focus:border-blue-300 focus:outline-none px-1 font-medium text-gray-800 dark:text-white text-sm sm:text-base min-w-0"
                                onClick={(e) => e.stopPropagation()}
                              />
                              <button
                                onClick={(e) => deleteCategory('category1', index, e)}
                                className="ml-auto p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded flex-shrink-0"
                              >
                                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Category 2 */}
                  {selectedCategory1Index !== null && (
                    <div className="ml-4 sm:ml-6 md:ml-8 border-l-2 border-blue-300 pl-2 sm:pl-4 md:pl-6 space-y-2 sm:space-y-4">
                      <div className="flex flex-wrap items-center gap-1 sm:gap-2 md:gap-3 mb-2 sm:mb-4">
                        <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
                        <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800 dark:text-white">Category 2</h3>
                        <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 break-all">in {selectedRegion.category1[selectedCategory1Index]?.name}</span>
                      </div>

                      <div className="flex flex-col gap-2 sm:gap-3">
                        <input
                          type="text"
                          value={newCategory2}
                          onChange={(e) => setNewCategory2(e.target.value)}
                          placeholder="Enter Category 2 name..."
                          className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-200 text-sm sm:text-base"
                          onKeyPress={(e) => e.key === "Enter" && handleAddCategory2()}
                        />
                        <button
                          onClick={handleAddCategory2}
                          disabled={!newCategory2.trim()}
                          className="w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base"
                        >
                          <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                          Add Category 2
                        </button>
                      </div>

                      {/* Existing Category 2 items */}
                      {selectedRegion.category1[selectedCategory1Index]?.category2.length > 0 && (
                        <div className="space-y-1 sm:space-y-2">
                          {selectedRegion.category1[selectedCategory1Index]?.category2.map((category, index) => (
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
                                <Tag className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-500 flex-shrink-0" />
                                <input
                                  type="text"
                                  value={category.name}
                                  onChange={(e) => updateCategoryName('category2', index, e)}
                                  className="flex-1 bg-transparent border-b border-transparent focus:border-indigo-300 focus:outline-none px-1 font-medium text-gray-800 dark:text-white text-sm sm:text-base min-w-0"
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <button
                                  onClick={(e) => deleteCategory('category2', index, e)}
                                  className="ml-auto p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded flex-shrink-0"
                                >
                                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Category 3 */}
                  {selectedCategory2Index !== null && (
                    <div className="ml-6 sm:ml-8 md:ml-10 border-l-2 border-indigo-300 pl-2 sm:pl-4 md:pl-6 space-y-2 sm:space-y-4">
                      <div className="flex flex-wrap items-center gap-1 sm:gap-2 md:gap-3 mb-2 sm:mb-4">
                        <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                        <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800 dark:text-white">Category 3</h3>
                        <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 break-all">in {selectedCategory1.category2[selectedCategory2Index].name}</span>
                      </div>

                      <div className="flex flex-col gap-2 sm:gap-3">
                        <input
                          type="text"
                          value={newCategory3}
                          onChange={(e) => setNewCategory3(e.target.value)}
                          placeholder="Enter Category 3 name..."
                          className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 transition-all duration-200 text-sm sm:text-base"
                          onKeyPress={(e) => e.key === "Enter" && handleAddCategory3()}
                        />
                        <button
                          onClick={handleAddCategory3}
                          disabled={!newCategory3.trim()}
                          className="w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base"
                        >
                          <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                          Add Category 3
                        </button>
                      </div>

                      {/* Existing Category 3 items */}
                      {selectedCategory1.category2[selectedCategory2Index].category3.length > 0 && (
                        <div className="space-y-1 sm:space-y-2">
                          {selectedCategory1.category2[selectedCategory2Index].category3.map((category, index) => (
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
                                <Tag className="w-3 h-3 sm:w-4 sm:h-4 text-purple-500 flex-shrink-0" />
                                <input
                                  type="text"
                                  value={category.name}
                                  onChange={(e) => updateCategoryName('category3', index, e)}
                                  className="flex-1 bg-transparent border-b border-transparent focus:border-purple-300 focus:outline-none px-1 font-medium text-gray-800 dark:text-white text-sm sm:text-base min-w-0"
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <button
                                  onClick={(e) => deleteCategory('category3', index, e)}
                                  className="ml-auto p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded flex-shrink-0"
                                >
                                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Category 4 (Optional) */}
                  {selectedCategory3Index !== null && (
                    <div className="ml-8 sm:ml-10 md:ml-12 border-l-2 border-purple-300 pl-2 sm:pl-4 md:pl-6 space-y-2 sm:space-y-4">
                      <div className="flex flex-wrap items-center gap-1 sm:gap-2 md:gap-3 mb-2 sm:mb-4">
                        <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gradient-to-r from-pink-500 to-red-500 rounded-full"></div>
                        <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800 dark:text-white">Category 4 (Optional)</h3>
                        <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 break-all">in {selectedCategory2.category3[selectedCategory3Index]?.name}</span>
                      </div>

                      <div className="flex flex-col gap-2 sm:gap-3">
                        <input
                          type="text"
                          value={newCategory4}
                          onChange={(e) => setNewCategory4(e.target.value)}
                          placeholder="Enter Category 4 name..."
                          className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 dark:focus:ring-pink-400 transition-all duration-200 text-sm sm:text-base"
                          onKeyPress={(e) => e.key === "Enter" && handleAddCategory4()}
                        />
                        <button
                          onClick={handleAddCategory4}
                          disabled={!newCategory4.trim()}
                          className="w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-lg hover:from-pink-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base"
                        >
                          <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                          Add Category 4
                        </button>
                      </div>

                      {/* Existing Category 4 items */}
                      {selectedCategory2.category3[selectedCategory3Index]?.category4.length > 0 && (
                        <div className="space-y-1 sm:space-y-2">
                          {selectedCategory2.category3[selectedCategory3Index]?.category4.map((category, index) => (
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
                                <Tag className="w-3 h-3 sm:w-4 sm:h-4 text-pink-500 flex-shrink-0" />
                                <input
                                  type="text"
                                  value={category.name}
                                  onChange={(e) => updateCategoryName('category4', index, e)}
                                  className="flex-1 bg-transparent border-b border-transparent focus:border-pink-300 focus:outline-none px-1 font-medium text-gray-800 dark:text-white text-sm sm:text-base min-w-0"
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <button
                                  onClick={(e) => deleteCategory('category4', index, e)}
                                  className="ml-auto p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded flex-shrink-0"
                                >
                                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Category 5 (Optional) */}
                  {selectedCategory4Index !== null && (
                    <div className="ml-10 sm:ml-12 md:ml-14 border-l-2 border-pink-300 pl-2 sm:pl-4 md:pl-6 space-y-2 sm:space-y-4">
                      <div className="flex flex-wrap items-center gap-1 sm:gap-2 md:gap-3 mb-2 sm:mb-4">
                        <div className="w-2 h-2 sm:w-3 sm:h-3 bg-gradient-to-r from-red-500 to-orange-500 rounded-full"></div>
                        <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800 dark:text-white">Category 5 (Optional)</h3>
                        <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 break-all">in {selectedCategory3.category4[selectedCategory4Index]?.name}</span>
                      </div>

                      <div className="flex flex-col gap-2 sm:gap-3">
                        <input
                          type="text"
                          value={newCategory5}
                          onChange={(e) => setNewCategory5(e.target.value)}
                          placeholder="Enter Category 5 name..."
                          className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 transition-all duration-200 text-sm sm:text-base"
                          onKeyPress={(e) => e.key === "Enter" && handleAddCategory5()}
                        />
                        <button
                          onClick={handleAddCategory5}
                          disabled={!newCategory5.trim()}
                          className="w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg hover:from-red-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base"
                        >
                          <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                          Add Category 5
                        </button>
                      </div>

                      {/* Existing Category 5 items */}
                      {selectedCategory3.category4[selectedCategory4Index]?.category5.length > 0 && (
                        <div className="space-y-1 sm:space-y-2">
                          {selectedCategory3.category4[selectedCategory4Index]?.category5.map((category, index) => (
                            <div
                              key={index}
                              className="p-2 sm:p-3 rounded-md sm:rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-red-50 dark:bg-red-900/20"
                            >
                              <div className="flex items-center gap-1 sm:gap-2">
                                <Tag className="w-3 h-3 sm:w-4 sm:h-4 text-red-500 flex-shrink-0" />
                                <input
                                  type="text"
                                  value={category.name}
                                  onChange={(e) => updateCategoryName('category5', index, e)}
                                  className="flex-1 bg-transparent border-b border-transparent focus:border-red-300 focus:outline-none px-1 font-medium text-gray-800 dark:text-white text-sm sm:text-base min-w-0"
                                />
                                <button
                                  onClick={(e) => deleteCategory('category5', index, e)}
                                  className="ml-auto p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded flex-shrink-0"
                                >
                                  <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                                </button>
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
          <div className="mt-4 sm:mt-6 bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-md sm:shadow-lg border border-gray-100 dark:border-gray-700 p-3 sm:p-4 md:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-gradient-to-r from-teal-500 to-indigo-500 rounded-full"></div>
              Structure Summary
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4">
              <div className="text-center p-2 sm:p-4 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
                <div className="text-lg sm:text-2xl font-bold text-teal-600 dark:text-teal-400">{regions.length}</div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Regions</div>
              </div>
              <div className="text-center p-2 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-lg sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {regions.reduce((sum, region) => sum + region.category1.length, 0)}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Category 1</div>
              </div>
              <div className="text-center p-2 sm:p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                <div className="text-lg sm:text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                  {regions.reduce((sum, region) => sum + region.category1.reduce((s, cat1) => s + cat1.category2.length, 0), 0)}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Category 2</div>
              </div>
              <div className="text-center p-2 sm:p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-lg sm:text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {regions.reduce((sum, region) => sum + region.category1.reduce((s, cat1) => s + cat1.category2.reduce((s2, cat2) => s2 + cat2.category3.length, 0), 0), 0)}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Category 3</div>
              </div>
              <div className="text-center p-2 sm:p-4 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
                <div className="text-lg sm:text-2xl font-bold text-pink-600 dark:text-pink-400">
                  {regions.reduce((sum, region) => sum + region.category1.reduce((s, cat1) => s + cat1.category2.reduce((s2, cat2) => s2 + cat2.category3.reduce((s3, cat3) => s3 + cat3.category4.length, 0), 0), 0), 0)}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Category 4</div>
              </div>
              <div className="text-center p-2 sm:p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="text-lg sm:text-2xl font-bold text-red-600 dark:text-red-400">
                 {regions.reduce((sum, region) => sum + region.category1.reduce((s, cat1) => s + cat1.category2.reduce((s2, cat2) => s2 + cat2.category3.reduce((s3, cat3) => s3 + cat3.category4.reduce((s4, cat4) => s4 + cat4.category5.length, 0), 0), 0), 0), 0)}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Category 5</div>
              </div>
            </div>
            {/* Submit Button */}
            <div className="mt-4 sm:mt-6 flex justify-center sm:justify-end">
              <button
                onClick={handleSubmitToServer}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-3 w-3 sm:h-4 sm:w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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

export default FileRegion;
