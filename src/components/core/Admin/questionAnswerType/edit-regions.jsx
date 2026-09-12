"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  ChevronRight,
  MapPin,
  Tag,
  Grid3X3,
  BookOpen,
  Trash2,
  Save,
  ArrowLeft,
  Layers,
  Sparkles,
  Loader2
} from "lucide-react";
import {
  getAllQandARegions,
  updateQandARegion,
  deleteQandARegion
} from "../../../../services/operations/qandA";
import { toast } from "react-hot-toast";

const EditQandARegion = () => {
  const navigate = useNavigate();
  const [regions, setRegions] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [selectedExamTypeIndex, setSelectedExamTypeIndex] = useState(null);
  const [selectedSpecificClassIndex, setSelectedSpecificClassIndex] = useState(null);

  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [newRegionName, setNewRegionName] = useState("");

  const selectedExamType =
    selectedExamTypeIndex !== null && selectedRegion
      ? selectedRegion.examTypes?.[selectedExamTypeIndex]
      : null;
  const selectedSpecificClass =
    selectedSpecificClassIndex !== null && selectedExamType
      ? selectedExamType.specificClasses?.[selectedSpecificClassIndex]
      : null;

  useEffect(() => {
    const loadAllRegions = async () => {
      try {
        setIsLoading(true);
        const response = await getAllQandARegions();
        const regionList = response?.data || [];
        setRegions(regionList);
        if (regionList.length > 0) {
          setSelectedRegion(JSON.parse(JSON.stringify(regionList[0])));
          setSelectedExamTypeIndex(null);
          setSelectedSpecificClassIndex(null);
        }
      } catch (error) {
        console.error("Error loading regions:", error);
        toast.error("Failed to load regions");
      } finally {
        setIsLoading(false);
      }
    };
    loadAllRegions();
  }, []);

  useEffect(() => {
    if (selectedRegion) {
      setNewRegionName("");
    }
  }, [selectedRegion?.name]);

  const selectRegion = (region) => {
    setSelectedRegion(JSON.parse(JSON.stringify(region)));
    setSelectedExamTypeIndex(null);
    setSelectedSpecificClassIndex(null);
    setNewRegionName("");
  };

  const selectExamType = (index) => {
    setSelectedExamTypeIndex(index);
    setSelectedSpecificClassIndex(null);
  };

  const selectSpecificClass = (index) => {
    setSelectedSpecificClassIndex(index);
  };

  // Add new items
  const addNewExamType = () => {
    if (!selectedRegion) return;
    const name = prompt("Enter new Exam Type name (e.g. JEE Mains, Board Exams):");
    if (!name || !name.trim()) return;

    setSelectedRegion((prev) => {
      const updatedExamTypes = [
        ...(prev.examTypes || []),
        { name: name.trim(), specificClasses: [] }
      ];
      return {
        ...prev,
        examTypes: updatedExamTypes
      };
    });
    setSelectedExamTypeIndex((selectedRegion.examTypes?.length || 0));
    setSelectedSpecificClassIndex(null);
  };

  const addNewSpecificClass = () => {
    if (!selectedRegion || selectedExamTypeIndex === null) return;
    const name = prompt("Enter new Class / Grade name (e.g. Class 12, Class 10):");
    if (!name || !name.trim()) return;

    setSelectedRegion((prev) => {
      const updatedExamTypes = [...(prev.examTypes || [])];
      const targetET = updatedExamTypes[selectedExamTypeIndex];
      if (targetET) {
        targetET.specificClasses = [
          ...(targetET.specificClasses || []),
          { name: name.trim(), subjects: [] }
        ];
      }
      return {
        ...prev,
        examTypes: updatedExamTypes
      };
    });
    const currentClassesCount =
      selectedRegion.examTypes?.[selectedExamTypeIndex]?.specificClasses?.length || 0;
    setSelectedSpecificClassIndex(currentClassesCount);
  };

  const addNewSubject = () => {
    if (
      !selectedRegion ||
      selectedExamTypeIndex === null ||
      selectedSpecificClassIndex === null
    )
      return;
    const name = prompt("Enter new Subject name (e.g. Physics, Mathematics, History):");
    if (!name || !name.trim()) return;

    setSelectedRegion((prev) => {
      const updatedExamTypes = [...(prev.examTypes || [])];
      const targetET = updatedExamTypes[selectedExamTypeIndex];
      if (targetET && targetET.specificClasses?.[selectedSpecificClassIndex]) {
        targetET.specificClasses[selectedSpecificClassIndex].subjects = [
          ...(targetET.specificClasses[selectedSpecificClassIndex].subjects || []),
          { name: name.trim() }
        ];
      }
      return {
        ...prev,
        examTypes: updatedExamTypes
      };
    });
  };

  // Inline rename handlers
  const updateExamTypeName = (index, e) => {
    const newName = e.target.value;
    setSelectedRegion((prev) => {
      const updated = [...(prev.examTypes || [])];
      if (updated[index]) {
        updated[index] = { ...updated[index], name: newName };
      }
      return { ...prev, examTypes: updated };
    });
  };

  const updateSpecificClassName = (index, e) => {
    const newName = e.target.value;
    setSelectedRegion((prev) => {
      const updatedET = [...(prev.examTypes || [])];
      if (
        updatedET[selectedExamTypeIndex] &&
        updatedET[selectedExamTypeIndex].specificClasses?.[index]
      ) {
        updatedET[selectedExamTypeIndex].specificClasses[index] = {
          ...updatedET[selectedExamTypeIndex].specificClasses[index],
          name: newName
        };
      }
      return { ...prev, examTypes: updatedET };
    });
  };

  const updateSubjectName = (index, e) => {
    const newName = e.target.value;
    setSelectedRegion((prev) => {
      const updatedET = [...(prev.examTypes || [])];
      const sc =
        updatedET[selectedExamTypeIndex]?.specificClasses?.[
          selectedSpecificClassIndex
        ];
      if (sc && sc.subjects?.[index]) {
        sc.subjects[index] = { ...sc.subjects[index], name: newName };
      }
      return { ...prev, examTypes: updatedET };
    });
  };

  // Delete handlers
  const deleteExamType = (index, e) => {
    e.stopPropagation();
    setSelectedRegion((prev) => {
      const updated = [...(prev.examTypes || [])];
      updated.splice(index, 1);
      return { ...prev, examTypes: updated };
    });
    if (selectedExamTypeIndex === index) {
      setSelectedExamTypeIndex(null);
      setSelectedSpecificClassIndex(null);
    } else if (selectedExamTypeIndex > index) {
      setSelectedExamTypeIndex(selectedExamTypeIndex - 1);
    }
  };

  const deleteSpecificClass = (index, e) => {
    e.stopPropagation();
    setSelectedRegion((prev) => {
      const updatedET = [...(prev.examTypes || [])];
      if (updatedET[selectedExamTypeIndex]) {
        updatedET[selectedExamTypeIndex].specificClasses = updatedET[
          selectedExamTypeIndex
        ].specificClasses.filter((_, i) => i !== index);
      }
      return { ...prev, examTypes: updatedET };
    });
    if (selectedSpecificClassIndex === index) {
      setSelectedSpecificClassIndex(null);
    } else if (selectedSpecificClassIndex > index) {
      setSelectedSpecificClassIndex(selectedSpecificClassIndex - 1);
    }
  };

  const deleteSubject = (index, e) => {
    e.stopPropagation();
    setSelectedRegion((prev) => {
      const updatedET = [...(prev.examTypes || [])];
      const sc =
        updatedET[selectedExamTypeIndex]?.specificClasses?.[
          selectedSpecificClassIndex
        ];
      if (sc) {
        sc.subjects = sc.subjects.filter((_, i) => i !== index);
      }
      return { ...prev, examTypes: updatedET };
    });
  };

  // Save to DB
  const handleUpdateRegion = async () => {
    if (!selectedRegion || !selectedRegion.name) {
      toast.error("Please select a region to update");
      return;
    }
    setIsUpdating(true);
    try {
      const originalName = selectedRegion.name;
      const updatedPayload = {
        name: (newRegionName.trim() || selectedRegion.name).trim(),
        examTypes: (selectedRegion.examTypes || []).map((et) => ({
          name: et.name,
          specificClasses: (et.specificClasses || []).map((sc) => ({
            name: sc.name,
            subjects: (sc.subjects || []).map((sub) => ({
              name: sub.name
            }))
          }))
        }))
      };

      const response = await updateQandARegion(originalName, {
        updatedData: updatedPayload
      });

      if (response.message) {
        toast.success(response.message);
        const updatedResponse = await getAllQandARegions();
        const updatedList = updatedResponse?.data || [];
        setRegions(updatedList);
        const refreshed =
          updatedList.find((r) => r.name === updatedPayload.name) ||
          updatedList[0];
        if (refreshed) {
          setSelectedRegion(JSON.parse(JSON.stringify(refreshed)));
        }
        setNewRegionName("");
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
    if (!selectedRegion || !selectedRegion.name) {
      toast.error("Please select a region to delete");
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to permanently delete region "${selectedRegion.name}" and all its subcategories?`
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await deleteQandARegion(selectedRegion.name);

      if (response.message) {
        toast.success(response.message);
        const updatedResponse = await getAllQandARegions();
        const updatedList = updatedResponse?.data || [];
        setRegions(updatedList);
        if (updatedList.length > 0) {
          setSelectedRegion(JSON.parse(JSON.stringify(updatedList[0])));
          setSelectedExamTypeIndex(null);
          setSelectedSpecificClassIndex(null);
        } else {
          setSelectedRegion(null);
          setSelectedExamTypeIndex(null);
          setSelectedSpecificClassIndex(null);
        }
        setNewRegionName("");
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f7f8fa] text-[#1c1c1e] py-12 px-4 flex items-center justify-center">
        <div className="bg-white rounded-2xl border border-[#c7cad5] p-10 text-center space-y-3 shadow-xs max-w-sm w-full">
          <Loader2 className="w-8 h-8 animate-spin text-[#4262ff] mx-auto" />
          <h3 className="text-sm font-bold text-[#1c1c1e]">Loading Q&amp;A Regions...</h3>
          <p className="text-xs text-[#555a6a]">Fetching academic hierarchies</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#1c1c1e] py-6 sm:py-8 px-4 sm:px-6 lg:px-8 xl:px-12 w-full">
      <div className="w-full space-y-6">

        {/* Top Header Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e0e2e8]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#c7cad5] text-[#1c1c1e] hover:bg-[#f7f8fa] hover:border-[#1c1c1e] transition-all text-sm font-semibold shadow-xs active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </button>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#ffd02f] text-[#1c1c1e]">
              Q&amp;A TAXONOMY
            </span>
            <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#f5f3ff] text-[#4262ff] border border-[#ddd6fe]">
              CANVAS STUDIO
            </span>
          </div>
          <button
            onClick={() => navigate("/create-qa-region")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1c1c1e] text-white hover:bg-[#2c2c34] text-sm font-semibold transition-all shadow-xs self-start sm:self-auto active:scale-98"
          >
            <span>Create New Regions</span>
            <ChevronRight className="w-4 h-4 text-[#ffd02f]" />
          </button>
        </div>

        {/* Page Title */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#c3faf5] text-[#187574] border border-[#9eece4] mb-1">
            <Layers className="w-3.5 h-3.5" />
            <span>4-TIER HIERARCHY</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#1c1c1e]">
            Edit Q&amp;A Regions &amp; Hierarchies
          </h1>
          <p className="text-sm sm:text-base text-[#555a6a]">
            Modify existing academic structures, rename territories, and manage exam types, classes, and subjects.
          </p>
        </div>

        {/* Main Structure Card */}
        <div className="bg-white rounded-2xl border border-[#e0e2e8] shadow-xs p-5 sm:p-7 space-y-6 w-full">

          {/* Level 1: Region Selection & Rename Grid (Canary Yellow Theme) */}
          <div className="p-5 rounded-2xl bg-[#fff8e0] border-2 border-[#fde89c] space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-[#ffd02f] text-[#1c1c1e] flex items-center justify-center font-bold text-xs shadow-xs">
                  1
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-[#1c1c1e]">Select Region to Edit</h2>
                  <p className="text-xs text-[#746019]">Click a region to manage its academic structure</p>
                </div>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-white text-[#746019] border border-[#fde89c] shadow-2xs">
                {regions.length} {regions.length === 1 ? "Region" : "Regions"}
              </span>
            </div>

            {/* Existing Regions Grid */}
            {regions.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 pt-1">
                {regions.map((region) => {
                  const isSelected = selectedRegion?.name === region.name;
                  return (
                    <div
                      key={region._id || region.name}
                      onClick={() => selectRegion(region)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                        isSelected
                          ? "bg-white border-2 border-[#4262ff] shadow-md ring-2 ring-[#4262ff]/20"
                          : "bg-white/90 border-[#fde89c] hover:border-[#ffd02f] hover:bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <MapPin
                          className={`w-4 h-4 shrink-0 ${
                            isSelected ? "text-[#4262ff]" : "text-[#746019]"
                          }`}
                        />
                        <span className="font-bold text-[#1c1c1e] text-sm truncate">
                          {region.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#fff4c4] text-[#746019]">
                          {region.examTypes?.length || 0}
                        </span>
                        <ChevronRight
                          className={`w-4 h-4 ${
                            isSelected ? "text-[#4262ff]" : "text-gray-400"
                          }`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 text-sm text-[#555a6a]">
                No regions found. Please create some regions first.
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
                  className="w-full h-12 px-4 bg-white border border-[#c7cad5] rounded-xl text-[#1c1c1e] placeholder-[#8e91a0] focus:outline-hidden focus:border-2 focus:border-[#4262ff] transition-all text-sm font-medium"
                />
              </div>
            )}
          </div>

          {/* Level 2: Exam Types (Teal Theme) */}
          {selectedRegion && (
            <div className="p-5 rounded-2xl bg-[#c3faf5]/40 border-2 border-[#9eece4] space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-[#0fbcb0] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    2
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-[#1c1c1e]">
                      Exam Types{" "}
                      <span className="text-sm font-semibold text-[#187574]">
                        in "{selectedRegion.name}"
                      </span>
                    </h3>
                    <p className="text-xs text-[#187574]">
                      Edit exam type names directly inline or select to manage classes
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-white text-[#187574] border border-[#9eece4]">
                    {selectedRegion.examTypes?.length || 0} Exam Types
                  </span>
                  <button
                    onClick={addNewExamType}
                    className="px-4 py-1.5 rounded-full bg-[#0fbcb0] hover:bg-[#187574] text-white text-xs font-bold transition-all flex items-center gap-1 shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New</span>
                  </button>
                </div>
              </div>

              {selectedRegion.examTypes?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
                  {selectedRegion.examTypes.map((examType, index) => {
                    const isETSelected = selectedExamTypeIndex === index;
                    return (
                      <div
                        key={index}
                        onClick={() => selectExamType(index)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                          isETSelected
                            ? "bg-white border-2 border-[#0fbcb0] shadow-md ring-2 ring-[#0fbcb0]/20"
                            : "bg-white/90 border-[#9eece4] hover:border-[#0fbcb0] hover:bg-white"
                        }`}
                      >
                        <Tag
                          className={`w-4 h-4 shrink-0 ${
                            isETSelected ? "text-[#0fbcb0]" : "text-[#187574]"
                          }`}
                        />
                        <input
                          type="text"
                          value={examType.name}
                          onChange={(e) => updateExamTypeName(index, e)}
                          onClick={(e) => e.stopPropagation()}
                          className="flex-1 bg-transparent font-bold text-sm text-[#1c1c1e] border-b border-transparent focus:border-[#0fbcb0] focus:outline-hidden px-1"
                          placeholder="Exam type name..."
                        />
                        <button
                          onClick={(e) => deleteExamType(index, e)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                          title="Delete exam type"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-4 text-sm text-[#187574]">
                  No exam types found. Click "+ Add New" to add one.
                </div>
              )}
            </div>
          )}

          {/* Level 3: Specific Classes (Rose Theme) */}
          {selectedExamType && (
            <div className="p-5 rounded-2xl bg-[#ffd8f4]/35 border-2 border-[#f3bee5] space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-[#86296b] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    3
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-[#1c1c1e]">
                      Specific Classes{" "}
                      <span className="text-sm font-semibold text-[#86296b]">
                        in "{selectedExamType.name}"
                      </span>
                    </h3>
                    <p className="text-xs text-[#86296b]">
                      Edit class names inline or click to manage subjects
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-white text-[#86296b] border border-[#f3bee5]">
                    {selectedExamType.specificClasses?.length || 0} Classes
                  </span>
                  <button
                    onClick={addNewSpecificClass}
                    className="px-4 py-1.5 rounded-full bg-[#86296b] hover:bg-[#6e2257] text-white text-xs font-bold transition-all flex items-center gap-1 shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New</span>
                  </button>
                </div>
              </div>

              {selectedExamType.specificClasses?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
                  {selectedExamType.specificClasses.map((specificClass, index) => {
                    const isSCSelected = selectedSpecificClassIndex === index;
                    return (
                      <div
                        key={index}
                        onClick={() => selectSpecificClass(index)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                          isSCSelected
                            ? "bg-white border-2 border-[#86296b] shadow-md ring-2 ring-[#86296b]/20"
                            : "bg-white/90 border-[#f3bee5] hover:border-[#86296b] hover:bg-white"
                        }`}
                      >
                        <Grid3X3
                          className={`w-4 h-4 shrink-0 ${
                            isSCSelected ? "text-[#86296b]" : "text-[#86296b]/70"
                          }`}
                        />
                        <input
                          type="text"
                          value={specificClass.name}
                          onChange={(e) => updateSpecificClassName(index, e)}
                          onClick={(e) => e.stopPropagation()}
                          className="flex-1 bg-transparent font-bold text-sm text-[#1c1c1e] border-b border-transparent focus:border-[#86296b] focus:outline-hidden px-1"
                          placeholder="Class name..."
                        />
                        <button
                          onClick={(e) => deleteSpecificClass(index, e)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                          title="Delete class"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-4 text-sm text-[#86296b]">
                  No classes found. Click "+ Add New" to add one.
                </div>
              )}
            </div>
          )}

          {/* Level 4: Subjects (Lavender Theme) */}
          {selectedSpecificClass && (
            <div className="p-5 rounded-2xl bg-[#f5f3ff] border-2 border-[#ddd6fe] space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-[#4262ff] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    4
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-[#1c1c1e]">
                      Subjects{" "}
                      <span className="text-sm font-semibold text-[#4262ff]">
                        in "{selectedSpecificClass.name}"
                      </span>
                    </h3>
                    <p className="text-xs text-[#4262ff]">
                      Edit subject names directly inline
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-white text-[#4262ff] border border-[#ddd6fe]">
                    {selectedSpecificClass.subjects?.length || 0} Subjects
                  </span>
                  <button
                    onClick={addNewSubject}
                    className="px-4 py-1.5 rounded-full bg-[#4262ff] hover:bg-[#3350e0] text-white text-xs font-bold transition-all flex items-center gap-1 shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New</span>
                  </button>
                </div>
              </div>

              {selectedSpecificClass.subjects?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
                  {selectedSpecificClass.subjects.map((subject, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-xl border border-[#ddd6fe] bg-white hover:border-[#4262ff] transition-all flex items-center justify-between gap-2 shadow-2xs"
                    >
                      <BookOpen className="w-4 h-4 text-[#4262ff] shrink-0" />
                      <input
                        type="text"
                        value={subject.name}
                        onChange={(e) => updateSubjectName(index, e)}
                        className="flex-1 bg-transparent font-bold text-sm text-[#1c1c1e] border-b border-transparent focus:border-[#4262ff] focus:outline-hidden px-1"
                        placeholder="Subject name..."
                      />
                      <button
                        onClick={(e) => deleteSubject(index, e)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                        title="Delete subject"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-sm text-[#4262ff]">
                  No subjects found. Click "+ Add New" to add one.
                </div>
              )}
            </div>
          )}

        </div>

        {/* Action Buttons Bar */}
        {selectedRegion && (
          <div className="bg-white rounded-2xl border border-[#e0e2e8] shadow-xs p-5 sm:p-7 flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
            <div>
              <h3 className="font-bold text-base sm:text-lg text-[#1c1c1e]">
                Editing Region:{" "}
                <span className="text-[#4262ff]">{selectedRegion.name}</span>
                {newRegionName.trim() && (
                  <span className="text-[#0fbcb0] ml-2">
                    &rarr; {newRegionName.trim()}
                  </span>
                )}
              </h3>
              <p className="text-xs sm:text-sm text-[#555a6a]">
                {selectedRegion.examTypes?.length || 0} exam types configured
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <button
                onClick={handleDeleteRegion}
                disabled={isDeleting}
                className="flex-1 sm:flex-none px-6 py-3 rounded-full bg-[#fbd4d4] hover:bg-[#f9a9a9] text-[#600000] border border-[#e3c5c5] font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isDeleting ? (
                  "Deleting..."
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Region</span>
                  </>
                )}
              </button>
              <button
                onClick={handleUpdateRegion}
                disabled={isUpdating}
                className="flex-1 sm:flex-none px-8 py-3 rounded-full bg-[#4262ff] hover:bg-[#2a41b6] text-white font-bold text-sm shadow-md hover:shadow transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-98"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4 text-white" />
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
  );
};

export default EditQandARegion;