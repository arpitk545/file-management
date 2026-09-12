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
    <div className="min-h-screen bg-[#f7f8fa] text-[#1c1c1e] py-6 sm:py-8 px-4 sm:px-6 lg:px-8 xl:px-12 w-full">
      <div className="w-full space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#e0e2e8] pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#c3faf5] text-[#00635b] mb-2">
              📁 File Repository Structure
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#1c1c1e] tracking-tight">
              Create File Region & Categories
            </h1>
            <p className="text-sm sm:text-base text-[#65676e] mt-1">
              Construct multi-tier organizational taxonomies and folders for file classification
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
                  Hierarchical File Structure
                </h2>
                <p className="text-xs sm:text-sm text-[#65676e]">
                  Manage regions and sub-categories down to 5 hierarchical tiers
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Level 1: Region */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#ffd02f]"></span>
                <h3 className="text-base sm:text-lg font-bold text-[#1c1c1e]">Region (Root Level)</h3>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full items-stretch">
                <input
                  type="text"
                  value={newRegion}
                  onChange={(e) => setNewRegion(e.target.value)}
                  placeholder="Enter region name..."
                  className="w-full sm:flex-1 h-12 min-h-[48px] shrink-0 px-4 py-3 bg-white border border-[#c7cad5] rounded-xl text-[#1c1c1e] placeholder-[#9497a1] focus:outline-none focus:border-2 focus:border-[#4262ff] transition-all text-sm sm:text-base leading-normal shadow-2xs"
                  onKeyPress={(e) => e.key === "Enter" && handleAddRegion()}
                />
                <button
                  onClick={handleAddRegion}
                  disabled={!newRegion.trim()}
                  className="w-full sm:w-auto h-12 min-h-[48px] shrink-0 px-6 bg-[#ffd02f] hover:bg-[#e6bb28] text-[#1c1c1e] font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 text-sm sm:text-base shadow-sm active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  Add Region
                </button>
              </div>

              {/* Existing Regions */}
              {regions.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {regions.map((region, index) => (
                    <div
                      key={index}
                      onClick={() => selectRegion(index)}
                      className={`p-3 sm:p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedRegionIndex === index
                          ? "border-[#ffd02f] bg-[#fffdf0] shadow-sm"
                          : "border-[#e0e2e8] bg-white hover:border-[#ffd02f]"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[#735400] flex-shrink-0" />
                        <input
                          type="text"
                          value={region.name}
                          onChange={(e) => updateRegionName(e, index)}
                          className="flex-1 bg-transparent border-b border-transparent focus:border-[#4262ff] focus:outline-none px-1 font-semibold text-[#1c1c1e] text-sm sm:text-base min-w-0"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <button
                          onClick={(e) => deleteRegion(index, e)}
                          className="p-1.5 text-[#e53935] hover:bg-[#fbd4d4] rounded-lg transition-colors flex-shrink-0"
                          title="Delete Region"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="mt-2 text-xs text-[#65676e] font-medium flex items-center justify-between">
                        <span>Categories: {region.category1.length}</span>
                        {selectedRegionIndex === index && (
                          <span className="text-xs font-bold text-[#735400]">Selected</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Categories for selected region */}
              {selectedRegionIndex !== null && (
                <div className="space-y-6 mt-6 pt-6 border-t border-[#f0f1f5]">
                  {/* Category 1 */}
                  <div className="rounded-xl border border-[#9eece4] bg-[#f0fdfa] p-4 sm:p-6 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-[#0fbcb0]"></span>
                        <h3 className="text-base sm:text-lg font-bold text-[#00635b]">Category 1</h3>
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#c3faf5] text-[#00635b]">
                          under: {regions[selectedRegionIndex]?.name}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full items-stretch">
                      <input
                        type="text"
                        value={newCategory1}
                        onChange={(e) => setNewCategory1(e.target.value)}
                        placeholder="Enter Category 1 name..."
                        className="w-full sm:flex-1 h-12 min-h-[48px] shrink-0 px-4 py-3 bg-white border border-[#c7cad5] rounded-xl text-[#1c1c1e] placeholder-[#9497a1] focus:outline-none focus:border-2 focus:border-[#0fbcb0] transition-all text-sm sm:text-base leading-normal shadow-2xs"
                        onKeyPress={(e) => e.key === "Enter" && handleAddCategory1()}
                      />
                      <button
                        onClick={handleAddCategory1}
                        disabled={!newCategory1.trim()}
                        className="w-full sm:w-auto h-12 min-h-[48px] shrink-0 px-6 bg-[#0fbcb0] hover:bg-[#0da69b] text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 text-sm sm:text-base shadow-sm active:scale-95"
                      >
                        <Plus className="w-4 h-4" />
                        Add Category 1
                      </button>
                    </div>

                    {/* Existing Category 1 items */}
                    {regions[selectedRegionIndex].category1.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {regions[selectedRegionIndex].category1.map((category, index) => (
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
                            under: {selectedRegion.category1[selectedCategory1Index]?.name}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 w-full items-stretch">
                        <input
                          type="text"
                          value={newCategory2}
                          onChange={(e) => setNewCategory2(e.target.value)}
                          placeholder="Enter Category 2 name..."
                          className="w-full sm:flex-1 h-12 min-h-[48px] shrink-0 px-4 py-3 bg-white border border-[#c7cad5] rounded-xl text-[#1c1c1e] placeholder-[#9497a1] focus:outline-none focus:border-2 focus:border-[#4262ff] transition-all text-sm sm:text-base leading-normal shadow-2xs"
                          onKeyPress={(e) => e.key === "Enter" && handleAddCategory2()}
                        />
                        <button
                          onClick={handleAddCategory2}
                          disabled={!newCategory2.trim()}
                          className="w-full sm:w-auto h-12 min-h-[48px] shrink-0 px-6 bg-[#4262ff] hover:bg-[#3451e0] text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 text-sm sm:text-base shadow-sm active:scale-95"
                        >
                          <Plus className="w-4 h-4" />
                          Add Category 2
                        </button>
                      </div>

                      {/* Existing Category 2 items */}
                      {selectedRegion.category1[selectedCategory1Index]?.category2.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {selectedRegion.category1[selectedCategory1Index]?.category2.map((category, index) => (
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
                            under: {selectedCategory1.category2[selectedCategory2Index]?.name}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 w-full items-stretch">
                        <input
                          type="text"
                          value={newCategory3}
                          onChange={(e) => setNewCategory3(e.target.value)}
                          placeholder="Enter Category 3 name..."
                          className="w-full sm:flex-1 h-12 min-h-[48px] shrink-0 px-4 py-3 bg-white border border-[#c7cad5] rounded-xl text-[#1c1c1e] placeholder-[#9497a1] focus:outline-none focus:border-2 focus:border-[#d1259e] transition-all text-sm sm:text-base leading-normal shadow-2xs"
                          onKeyPress={(e) => e.key === "Enter" && handleAddCategory3()}
                        />
                        <button
                          onClick={handleAddCategory3}
                          disabled={!newCategory3.trim()}
                          className="w-full sm:w-auto h-12 min-h-[48px] shrink-0 px-6 bg-[#d1259e] hover:bg-[#b81e89] text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 text-sm sm:text-base shadow-sm active:scale-95"
                        >
                          <Plus className="w-4 h-4" />
                          Add Category 3
                        </button>
                      </div>

                      {/* Existing Category 3 items */}
                      {selectedCategory1.category2[selectedCategory2Index].category3.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {selectedCategory1.category2[selectedCategory2Index].category3.map((category, index) => (
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
                            under: {selectedCategory2.category3[selectedCategory3Index]?.name}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 w-full items-stretch">
                        <input
                          type="text"
                          value={newCategory4}
                          onChange={(e) => setNewCategory4(e.target.value)}
                          placeholder="Enter Category 4 name..."
                          className="w-full sm:flex-1 h-12 min-h-[48px] shrink-0 px-4 py-3 bg-white border border-[#c7cad5] rounded-xl text-[#1c1c1e] placeholder-[#9497a1] focus:outline-none focus:border-2 focus:border-[#ff7347] transition-all text-sm sm:text-base leading-normal shadow-2xs"
                          onKeyPress={(e) => e.key === "Enter" && handleAddCategory4()}
                        />
                        <button
                          onClick={handleAddCategory4}
                          disabled={!newCategory4.trim()}
                          className="w-full sm:w-auto h-12 min-h-[48px] shrink-0 px-6 bg-[#ff7347] hover:bg-[#e86036] text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 text-sm sm:text-base shadow-sm active:scale-95"
                        >
                          <Plus className="w-4 h-4" />
                          Add Category 4
                        </button>
                      </div>

                      {/* Existing Category 4 items */}
                      {selectedCategory2.category3[selectedCategory3Index]?.category4.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {selectedCategory2.category3[selectedCategory3Index]?.category4.map((category, index) => (
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
                      )}
                    </div>
                  )}

                  {/* Category 5 */}
                  {selectedCategory4Index !== null && (
                    <div className="rounded-xl border border-[#e9d5ff] bg-[#faf5ff] p-4 sm:p-6 space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-[#7c3aed]"></span>
                          <h3 className="text-base sm:text-lg font-bold text-[#6b21a8]">Category 5 (Deepest Tier)</h3>
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#ede9fe] text-[#6b21a8]">
                            under: {selectedCategory3.category4[selectedCategory4Index]?.name}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 w-full items-stretch">
                        <input
                          type="text"
                          value={newCategory5}
                          onChange={(e) => setNewCategory5(e.target.value)}
                          placeholder="Enter Category 5 name..."
                          className="w-full sm:flex-1 h-12 min-h-[48px] shrink-0 px-4 py-3 bg-white border border-[#c7cad5] rounded-xl text-[#1c1c1e] placeholder-[#9497a1] focus:outline-none focus:border-2 focus:border-[#7c3aed] transition-all text-sm sm:text-base leading-normal shadow-2xs"
                          onKeyPress={(e) => e.key === "Enter" && handleAddCategory5()}
                        />
                        <button
                          onClick={handleAddCategory5}
                          disabled={!newCategory5.trim()}
                          className="w-full sm:w-auto h-12 min-h-[48px] shrink-0 px-6 bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 text-sm sm:text-base shadow-sm active:scale-95"
                        >
                          <Plus className="w-4 h-4" />
                          Add Category 5
                        </button>
                      </div>

                      {/* Existing Category 5 items */}
                      {selectedCategory3.category4[selectedCategory4Index]?.category5.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {selectedCategory3.category4[selectedCategory4Index]?.category5.map((category, index) => (
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
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Summary & Submit Card */}
        {regions.length > 0 && (
          <div className="bg-white rounded-2xl border border-[#e0e2e8] shadow-sm p-5 sm:p-7 md:p-8 w-full space-y-6">
            <h3 className="text-base sm:text-lg font-bold text-[#1c1c1e] flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#4262ff]"></span>
              Structure Summary & Deployment
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="p-3 sm:p-4 bg-[#fff8e0] border border-[#fde89c] rounded-xl text-center">
                <div className="text-xl sm:text-2xl font-black text-[#735400]">{regions.length}</div>
                <div className="text-xs font-semibold text-[#735400] mt-0.5">Regions</div>
              </div>
              <div className="p-3 sm:p-4 bg-[#f0fdfa] border border-[#9eece4] rounded-xl text-center">
                <div className="text-xl sm:text-2xl font-black text-[#00635b]">
                  {regions.reduce((sum, region) => sum + region.category1.length, 0)}
                </div>
                <div className="text-xs font-semibold text-[#00635b] mt-0.5">Category 1</div>
              </div>
              <div className="p-3 sm:p-4 bg-[#eff6ff] border border-[#bfdbfe] rounded-xl text-center">
                <div className="text-xl sm:text-2xl font-black text-[#1e40af]">
                  {regions.reduce((sum, region) => sum + region.category1.reduce((s, cat1) => s + cat1.category2.length, 0), 0)}
                </div>
                <div className="text-xs font-semibold text-[#1e40af] mt-0.5">Category 2</div>
              </div>
              <div className="p-3 sm:p-4 bg-[#fdf2f8] border border-[#fbcfe8] rounded-xl text-center">
                <div className="text-xl sm:text-2xl font-black text-[#9d174d]">
                  {regions.reduce((sum, region) => sum + region.category1.reduce((s, cat1) => s + cat1.category2.reduce((s2, cat2) => s2 + cat2.category3.length, 0), 0), 0)}
                </div>
                <div className="text-xs font-semibold text-[#9d174d] mt-0.5">Category 3</div>
              </div>
              <div className="p-3 sm:p-4 bg-[#fff7ed] border border-[#fed7aa] rounded-xl text-center">
                <div className="text-xl sm:text-2xl font-black text-[#9a3412]">
                  {regions.reduce((sum, region) => sum + region.category1.reduce((s, cat1) => s + cat1.category2.reduce((s2, cat2) => s2 + cat2.category3.reduce((s3, cat3) => s3 + cat3.category4.length, 0), 0), 0), 0)}
                </div>
                <div className="text-xs font-semibold text-[#9a3412] mt-0.5">Category 4</div>
              </div>
              <div className="p-3 sm:p-4 bg-[#faf5ff] border border-[#e9d5ff] rounded-xl text-center">
                <div className="text-xl sm:text-2xl font-black text-[#6b21a8]">
                  {regions.reduce((sum, region) => sum + region.category1.reduce((s, cat1) => s + cat1.category2.reduce((s2, cat2) => s2 + cat2.category3.reduce((s3, cat3) => s3 + cat3.category4.reduce((s4, cat4) => s4 + cat4.category5.length, 0), 0), 0), 0), 0)}
                </div>
                <div className="text-xs font-semibold text-[#6b21a8] mt-0.5">Category 5</div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-3">
              <button
                onClick={handleSubmitToServer}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-3.5 bg-[#1c1c1e] hover:bg-[#2c2c34] text-white font-bold rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-sm text-sm sm:text-base active:scale-95"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting Structure...
                  </>
                ) : (
                  "Save & Deploy File Structure"
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileRegion;
