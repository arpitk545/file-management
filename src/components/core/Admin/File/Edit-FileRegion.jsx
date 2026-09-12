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
      <div className="min-h-screen bg-[#f7f8fa] flex items-center justify-center p-6 w-full">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#c7cad5] border-t-[#4262ff] rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-[#65676e]">Loading File Regions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#1c1c1e] py-6 sm:py-8 px-4 sm:px-6 lg:px-8 xl:px-12 w-full">
      <div className="w-full space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#e0e2e8] pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#c3faf5] text-[#00635b] mb-2">
              📁 File Repository Structure
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#1c1c1e] tracking-tight">
              Edit File Regions & Categories
            </h1>
            <p className="text-sm sm:text-base text-[#65676e] mt-1">
              Modify folder taxonomies, rename categories, and update file tree branches
            </p>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl border border-[#e0e2e8] shadow-sm p-5 sm:p-7 md:p-8 w-full space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#f0f1f5]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#fff8e0] text-[#735400] flex items-center justify-center font-bold">
                <Grid3X3 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-[#1c1c1e]">
                  Edit Hierarchical Tree
                </h2>
                <p className="text-xs sm:text-sm text-[#65676e]">
                  Select a region to edit, rename, or manage its nested categories
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Level 1: Region Selection */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#ffd02f]"></span>
                  <h3 className="text-base sm:text-lg font-bold text-[#1c1c1e]">Select Region to Edit</h3>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#f0f1f5] text-[#65676e]">
                  Total: {regions.length}
                </span>
              </div>

              {/* Existing Regions */}
              {regions.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {regions.map((region, index) => (
                    <div
                      key={region._id || index}
                      onClick={() => selectRegion(index)}
                      className={`p-3 sm:p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedRegionIndex === index
                          ? "border-[#ffd02f] bg-[#fffdf0] shadow-sm"
                          : "border-[#e0e2e8] bg-white hover:border-[#ffd02f]"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <MapPin className="w-4 h-4 text-[#735400] flex-shrink-0" />
                          <span className="text-sm sm:text-base font-semibold text-[#1c1c1e] truncate">
                            {region.name}
                          </span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[#9497a1] flex-shrink-0" />
                      </div>
                      <div className="mt-2 text-xs text-[#65676e] flex items-center justify-between">
                        <span>Categories: {region.category1?.length || 0}</span>
                        {selectedRegionIndex === index && (
                          <span className="text-xs font-bold text-[#735400]">Editing Active</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 border border-dashed border-[#c7cad5] rounded-xl text-sm font-medium text-[#65676e]">
                  No regions found in database.
                </div>
              )}

              {/* Region Rename Section */}
              {selectedRegion && (
                <div className="p-4 sm:p-5 rounded-xl border border-[#fde89c] bg-[#fffdf0] space-y-2">
                  <label className="block text-xs sm:text-sm font-bold text-[#735400] uppercase tracking-wider">
                    Rename Region (Optional)
                  </label>
                  <input
                    type="text"
                    value={newRegionName}
                    onChange={(e) => setNewRegionName(e.target.value)}
                    placeholder={`Rename "${selectedRegion.name}"...`}
                    className="w-full h-11 px-4 bg-white border border-[#c7cad5] rounded-xl text-[#1c1c1e] focus:outline-none focus:border-2 focus:border-[#4262ff] text-sm sm:text-base"
                  />
                  {newRegionName?.trim()?.length > 0 && (
                    <p className="text-xs font-semibold text-[#00635b] mt-1">
                      Will update name from "{selectedRegion.name}" to "{newRegionName}" upon saving.
                    </p>
                  )}
                </div>
              )}

              {/* Categories for selected region */}
              {selectedRegion && (
                <div className="space-y-6 mt-6 pt-6 border-t border-[#f0f1f5]">
                  {/* Category 1 */}
                  <div className="rounded-xl border border-[#9eece4] bg-[#f0fdfa] p-4 sm:p-6 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-[#0fbcb0]"></span>
                        <h3 className="text-base sm:text-lg font-bold text-[#00635b]">Category 1</h3>
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#c3faf5] text-[#00635b]">
                          in {selectedRegion.name}
                        </span>
                      </div>
                      <button
                        onClick={() => toggleNewCategoryInput('category1')}
                        className="px-3 py-1.5 bg-[#0fbcb0] hover:bg-[#0da69b] text-white rounded-full transition-all flex items-center justify-center gap-1 text-xs font-bold shadow-sm"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Category 1
                      </button>
                    </div>

                    {newCategoryInputs.category1 && (
                      <div className="flex flex-col sm:flex-row gap-3 pt-2 w-full items-stretch">
                        <input
                          type="text"
                          value={newCategoryValues.category1}
                          onChange={(e) => handleNewCategoryChange('category1', e)}
                          placeholder="Enter new Category 1 name..."
                          className="w-full sm:flex-1 h-12 min-h-[48px] shrink-0 px-4 py-3 bg-white border border-[#c7cad5] rounded-xl text-[#1c1c1e] placeholder-[#9497a1] focus:outline-none focus:border-2 focus:border-[#0fbcb0] transition-all text-sm leading-normal shadow-2xs"
                        />
                        <button
                          onClick={() => addNewCategory('category1')}
                          className="w-full sm:w-auto h-12 min-h-[48px] shrink-0 px-5 bg-[#0fbcb0] hover:bg-[#0da69b] text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-xs active:scale-98"
                        >
                          <Plus className="w-4 h-4" />
                          Confirm Add
                        </button>
                      </div>
                    )}

                    {selectedRegion.category1?.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {selectedRegion.category1.map((category, index) => (
                          <div
                            key={index}
                            onClick={() => selectCategory1(index)}
                            className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                              selectedCategory1Index === index
                                ? "border-[#0fbcb0] bg-white shadow-sm ring-2 ring-[#0fbcb0]/20"
                                : "border-[#e0e2e8] bg-white/80 hover:border-[#0fbcb0]"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <Tag className="w-4 h-4 text-[#0fbcb0] flex-shrink-0" />
                              <input
                                type="text"
                                value={category.name}
                                onChange={(e) => updateCategoryName('category1', index, e)}
                                className="flex-1 bg-transparent border-b border-transparent focus:border-[#0fbcb0] focus:outline-none px-1 font-semibold text-[#1c1c1e] text-sm sm:text-base min-w-0"
                                onClick={(e) => e.stopPropagation()}
                              />
                              <button
                                onClick={(e) => deleteCategory('category1', index, e)}
                                className="p-1.5 text-[#e53935] hover:bg-[#fbd4d4] rounded-lg transition-colors flex-shrink-0"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="mt-1 text-xs text-[#65676e] flex justify-between">
                              <span>Sub-categories: {category.category2?.length || 0}</span>
                              {selectedCategory1Index === index && (
                                <span className="font-bold text-[#00635b]">Active</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-3 text-xs sm:text-sm text-[#65676e]">
                        No Category 1 items found.
                      </div>
                    )}
                  </div>

                  {/* Category 2 */}
                  {selectedCategory1Index !== null && (
                    <div className="rounded-xl border border-[#bfdbfe] bg-[#eff6ff] p-4 sm:p-6 space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-[#4262ff]"></span>
                          <h3 className="text-base sm:text-lg font-bold text-[#1e40af]">Category 2</h3>
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#dbeafe] text-[#1e40af]">
                            in {selectedCategory1?.name}
                          </span>
                        </div>
                        <button
                          onClick={() => toggleNewCategoryInput('category2')}
                          className="px-3 py-1.5 bg-[#4262ff] hover:bg-[#3451e0] text-white rounded-full transition-all flex items-center justify-center gap-1 text-xs font-bold shadow-sm"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Add Category 2
                        </button>
                      </div>

                      {newCategoryInputs.category2 && (
                        <div className="flex flex-col sm:flex-row gap-3 pt-2 w-full items-stretch">
                          <input
                            type="text"
                            value={newCategoryValues.category2}
                            onChange={(e) => handleNewCategoryChange('category2', e)}
                            placeholder="Enter new Category 2 name..."
                            className="w-full sm:flex-1 h-12 min-h-[48px] shrink-0 px-4 py-3 bg-white border border-[#c7cad5] rounded-xl text-[#1c1c1e] placeholder-[#9497a1] focus:outline-none focus:border-2 focus:border-[#4262ff] transition-all text-sm leading-normal shadow-2xs"
                          />
                          <button
                            onClick={() => addNewCategory('category2')}
                            className="w-full sm:w-auto h-12 min-h-[48px] shrink-0 px-5 bg-[#4262ff] hover:bg-[#3451e0] text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-xs active:scale-98"
                          >
                            <Plus className="w-4 h-4" />
                            Confirm Add
                          </button>
                        </div>
                      )}

                      {selectedCategory1?.category2?.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {selectedCategory1.category2.map((category, index) => (
                            <div
                              key={index}
                              onClick={() => selectCategory2(index)}
                              className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                                selectedCategory2Index === index
                                  ? "border-[#4262ff] bg-white shadow-sm ring-2 ring-[#4262ff]/20"
                                  : "border-[#e0e2e8] bg-white/80 hover:border-[#4262ff]"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <Tag className="w-4 h-4 text-[#4262ff] flex-shrink-0" />
                                <input
                                  type="text"
                                  value={category.name}
                                  onChange={(e) => updateCategoryName('category2', index, e)}
                                  className="flex-1 bg-transparent border-b border-transparent focus:border-[#4262ff] focus:outline-none px-1 font-semibold text-[#1c1c1e] text-sm sm:text-base min-w-0"
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <button
                                  onClick={(e) => deleteCategory('category2', index, e)}
                                  className="p-1.5 text-[#e53935] hover:bg-[#fbd4d4] rounded-lg transition-colors flex-shrink-0"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                              <div className="mt-1 text-xs text-[#65676e] flex justify-between">
                                <span>Sub-categories: {category.category3?.length || 0}</span>
                                {selectedCategory2Index === index && (
                                  <span className="font-bold text-[#1e40af]">Active</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-3 text-xs sm:text-sm text-[#65676e]">
                          No Category 2 items found.
                        </div>
                      )}
                    </div>
                  )}

                  {/* Category 3 */}
                  {selectedCategory2Index !== null && (
                    <div className="rounded-xl border border-[#fbcfe8] bg-[#fdf2f8] p-4 sm:p-6 space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-[#d1259e]"></span>
                          <h3 className="text-base sm:text-lg font-bold text-[#9d174d]">Category 3</h3>
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#fce7f3] text-[#9d174d]">
                            in {selectedCategory2?.name}
                          </span>
                        </div>
                        <button
                          onClick={() => toggleNewCategoryInput('category3')}
                          className="px-3 py-1.5 bg-[#d1259e] hover:bg-[#b81e89] text-white rounded-full transition-all flex items-center justify-center gap-1 text-xs font-bold shadow-sm"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Add Category 3
                        </button>
                      </div>

                      {newCategoryInputs.category3 && (
                        <div className="flex flex-col sm:flex-row gap-3 pt-2 w-full items-stretch">
                          <input
                            type="text"
                            value={newCategoryValues.category3}
                            onChange={(e) => handleNewCategoryChange('category3', e)}
                            placeholder="Enter new Category 3 name..."
                            className="w-full sm:flex-1 h-12 min-h-[48px] shrink-0 px-4 py-3 bg-white border border-[#c7cad5] rounded-xl text-[#1c1c1e] placeholder-[#9497a1] focus:outline-none focus:border-2 focus:border-[#d1259e] transition-all text-sm leading-normal shadow-2xs"
                          />
                          <button
                            onClick={() => addNewCategory('category3')}
                            className="w-full sm:w-auto h-12 min-h-[48px] shrink-0 px-5 bg-[#d1259e] hover:bg-[#b81e89] text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-xs active:scale-98"
                          >
                            <Plus className="w-4 h-4" />
                            Confirm Add
                          </button>
                        </div>
                      )}

                      {selectedCategory2?.category3?.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {selectedCategory2.category3.map((category, index) => (
                            <div
                              key={index}
                              onClick={() => selectCategory3(index)}
                              className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                                selectedCategory3Index === index
                                  ? "border-[#d1259e] bg-white shadow-sm ring-2 ring-[#d1259e]/20"
                                  : "border-[#e0e2e8] bg-white/80 hover:border-[#d1259e]"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <Tag className="w-4 h-4 text-[#d1259e] flex-shrink-0" />
                                <input
                                  type="text"
                                  value={category.name}
                                  onChange={(e) => updateCategoryName('category3', index, e)}
                                  className="flex-1 bg-transparent border-b border-transparent focus:border-[#d1259e] focus:outline-none px-1 font-semibold text-[#1c1c1e] text-sm sm:text-base min-w-0"
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <button
                                  onClick={(e) => deleteCategory('category3', index, e)}
                                  className="p-1.5 text-[#e53935] hover:bg-[#fbd4d4] rounded-lg transition-colors flex-shrink-0"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                              <div className="mt-1 text-xs text-[#65676e] flex justify-between">
                                <span>Sub-categories: {category.category4?.length || 0}</span>
                                {selectedCategory3Index === index && (
                                  <span className="font-bold text-[#9d174d]">Active</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-3 text-xs sm:text-sm text-[#65676e]">
                          No Category 3 items found.
                        </div>
                      )}
                    </div>
                  )}

                  {/* Category 4 */}
                  {selectedCategory3Index !== null && (
                    <div className="rounded-xl border border-[#fed7aa] bg-[#fff7ed] p-4 sm:p-6 space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-[#ff7347]"></span>
                          <h3 className="text-base sm:text-lg font-bold text-[#9a3412]">Category 4</h3>
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#ffedd5] text-[#9a3412]">
                            in {selectedCategory3?.name}
                          </span>
                        </div>
                        <button
                          onClick={() => toggleNewCategoryInput('category4')}
                          className="px-3 py-1.5 bg-[#ff7347] hover:bg-[#e86036] text-white rounded-full transition-all flex items-center justify-center gap-1 text-xs font-bold shadow-sm"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Add Category 4
                        </button>
                      </div>

                      {newCategoryInputs.category4 && (
                        <div className="flex flex-col sm:flex-row gap-3 pt-2 w-full items-stretch">
                          <input
                            type="text"
                            value={newCategoryValues.category4}
                            onChange={(e) => handleNewCategoryChange('category4', e)}
                            placeholder="Enter new Category 4 name..."
                            className="w-full sm:flex-1 h-12 min-h-[48px] shrink-0 px-4 py-3 bg-white border border-[#c7cad5] rounded-xl text-[#1c1c1e] placeholder-[#9497a1] focus:outline-none focus:border-2 focus:border-[#ff7347] transition-all text-sm leading-normal shadow-2xs"
                          />
                          <button
                            onClick={() => addNewCategory('category4')}
                            className="w-full sm:w-auto h-12 min-h-[48px] shrink-0 px-5 bg-[#ff7347] hover:bg-[#e86036] text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-xs active:scale-98"
                          >
                            <Plus className="w-4 h-4" />
                            Confirm Add
                          </button>
                        </div>
                      )}

                      {selectedCategory3?.category4?.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {selectedCategory3.category4.map((category, index) => (
                            <div
                              key={index}
                              onClick={() => selectCategory4(index)}
                              className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                                selectedCategory4Index === index
                                  ? "border-[#ff7347] bg-white shadow-sm ring-2 ring-[#ff7347]/20"
                                  : "border-[#e0e2e8] bg-white/80 hover:border-[#ff7347]"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <Tag className="w-4 h-4 text-[#ff7347] flex-shrink-0" />
                                <input
                                  type="text"
                                  value={category.name}
                                  onChange={(e) => updateCategoryName('category4', index, e)}
                                  className="flex-1 bg-transparent border-b border-transparent focus:border-[#ff7347] focus:outline-none px-1 font-semibold text-[#1c1c1e] text-sm sm:text-base min-w-0"
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <button
                                  onClick={(e) => deleteCategory('category4', index, e)}
                                  className="p-1.5 text-[#e53935] hover:bg-[#fbd4d4] rounded-lg transition-colors flex-shrink-0"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                              <div className="mt-1 text-xs text-[#65676e] flex justify-between">
                                <span>Sub-categories: {category.category5?.length || 0}</span>
                                {selectedCategory4Index === index && (
                                  <span className="font-bold text-[#9a3412]">Active</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-3 text-xs sm:text-sm text-[#65676e]">
                          No Category 4 items found.
                        </div>
                      )}
                    </div>
                  )}

                  {/* Category 5 */}
                  {selectedCategory4Index !== null && (
                    <div className="rounded-xl border border-[#e9d5ff] bg-[#faf5ff] p-4 sm:p-6 space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-[#7c3aed]"></span>
                          <h3 className="text-base sm:text-lg font-bold text-[#6b21a8]">Category 5</h3>
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#ede9fe] text-[#6b21a8]">
                            in {selectedCategory4?.name}
                          </span>
                        </div>
                        <button
                          onClick={() => toggleNewCategoryInput('category5')}
                          className="px-3 py-1.5 bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-full transition-all flex items-center justify-center gap-1 text-xs font-bold shadow-sm"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Add Category 5
                        </button>
                      </div>

                      {newCategoryInputs.category5 && (
                        <div className="flex flex-col sm:flex-row gap-3 pt-2 w-full items-stretch">
                          <input
                            type="text"
                            value={newCategoryValues.category5}
                            onChange={(e) => handleNewCategoryChange('category5', e)}
                            placeholder="Enter new Category 5 name..."
                            className="w-full sm:flex-1 h-12 min-h-[48px] shrink-0 px-4 py-3 bg-white border border-[#c7cad5] rounded-xl text-[#1c1c1e] placeholder-[#9497a1] focus:outline-none focus:border-2 focus:border-[#7c3aed] transition-all text-sm leading-normal shadow-2xs"
                          />
                          <button
                            onClick={() => addNewCategory('category5')}
                            className="w-full sm:w-auto h-12 min-h-[48px] shrink-0 px-5 bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-xs active:scale-98"
                          >
                            <Plus className="w-4 h-4" />
                            Confirm Add
                          </button>
                        </div>
                      )}

                      {selectedCategory4?.category5?.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {selectedCategory4.category5.map((category, index) => (
                            <div
                              key={index}
                              className="p-3 rounded-xl border border-[#e0e2e8] bg-white"
                            >
                              <div className="flex items-center gap-2">
                                <Tag className="w-4 h-4 text-[#7c3aed] flex-shrink-0" />
                                <input
                                  type="text"
                                  value={category.name}
                                  onChange={(e) => updateCategoryName('category5', index, e)}
                                  className="flex-1 bg-transparent border-b border-transparent focus:border-[#7c3aed] focus:outline-none px-1 font-semibold text-[#1c1c1e] text-sm sm:text-base min-w-0"
                                />
                                <button
                                  onClick={(e) => deleteCategory('category5', index, e)}
                                  className="p-1.5 text-[#e53935] hover:bg-[#fbd4d4] rounded-lg transition-colors flex-shrink-0"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-3 text-xs sm:text-sm text-[#65676e]">
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

        {/* Action Bottom Bar */}
        {selectedRegion && (
          <div className="bg-white rounded-2xl border border-[#e0e2e8] shadow-sm p-5 sm:p-7 md:p-8 w-full">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#4262ff]"></span>
                  <h3 className="text-base sm:text-lg font-bold text-[#1c1c1e]">
                    Region: {selectedRegion.name}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-[#65676e] mt-1">
                  {selectedRegion.category1?.length || 0} Category 1 items •{' '}
                  {selectedRegion.category1?.reduce((sum, cat1) => sum + (cat1.category2?.length || 0), 0) || 0} Category 2 items •{' '}
                  {selectedRegion.category1?.reduce((sum, cat1) => sum + (cat1.category2?.reduce((s, cat2) => s + (cat2.category3?.length || 0), 0) || 0), 0) || 0} Category 3 items
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <button
                  onClick={handleDeleteRegion}
                  disabled={isDeleting}
                  className="w-full sm:w-auto px-6 py-3 bg-[#fbd4d4] hover:bg-[#f8b4b4] text-[#780000] border border-[#e3c5c5] font-bold rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 text-sm shadow-sm active:scale-95"
                >
                  {isDeleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-[#780000] border-t-transparent rounded-full animate-spin"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Delete Entire Region
                    </>
                  )}
                </button>
                <button
                  onClick={handleUpdateRegion}
                  disabled={isUpdating}
                  className="w-full sm:w-auto px-8 py-3 bg-[#1c1c1e] hover:bg-[#2c2c34] text-white font-bold rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 text-sm shadow-sm active:scale-95"
                >
                  {isUpdating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save & Update Region
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