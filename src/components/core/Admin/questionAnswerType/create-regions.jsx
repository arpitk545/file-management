"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  ChevronRight,
  MapPin,
  Tag,
  Grid3X3,
  BookOpen,
  Trash2,
  ArrowLeft,
  Layers,
  Sparkles,
  CheckCircle,
  Loader2
} from "lucide-react";
import { createQAndARegion } from "../../../../services/operations/qandA";
import { toast } from "react-hot-toast";

const QandARegion = () => {
  const navigate = useNavigate();
  const [regions, setRegions] = useState([]);
  const [newRegion, setNewRegion] = useState("");
  const [selectedRegionIndex, setSelectedRegionIndex] = useState(null);
  const [selectedExamTypeIndex, setSelectedExamTypeIndex] = useState(null);
  const [selectedSpecificClassIndex, setSelectedSpecificClassIndex] = useState(null);
  const [newExamType, setNewExamType] = useState("");
  const [newSpecificClass, setNewSpecificClass] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedRegion =
    selectedRegionIndex !== null ? regions[selectedRegionIndex] : null;
  const selectedExamType =
    selectedExamTypeIndex !== null && selectedRegion
      ? selectedRegion.examTypes[selectedExamTypeIndex]
      : null;
  const selectedSpecificClass =
    selectedSpecificClassIndex !== null && selectedExamType
      ? selectedExamType.specificClasses[selectedSpecificClassIndex]
      : null;

  const handleAddRegion = () => {
    if (newRegion.trim()) {
      const region = {
        name: newRegion.trim(),
        examTypes: [],
      };
      const updated = [...regions, region];
      setRegions(updated);
      setNewRegion("");
      setSelectedRegionIndex(updated.length - 1);
      setSelectedExamTypeIndex(null);
      setSelectedSpecificClassIndex(null);
    }
  };

  const handleAddExamType = () => {
    if (newExamType.trim() && selectedRegionIndex !== null) {
      const examType = {
        name: newExamType.trim(),
        specificClasses: [],
      };
      const updatedRegions = [...regions];
      updatedRegions[selectedRegionIndex].examTypes.push(examType);
      setRegions(updatedRegions);
      setNewExamType("");
      setSelectedExamTypeIndex(
        updatedRegions[selectedRegionIndex].examTypes.length - 1
      );
      setSelectedSpecificClassIndex(null);
    }
  };

  const handleAddSpecificClass = () => {
    if (
      newSpecificClass.trim() &&
      selectedRegionIndex !== null &&
      selectedExamTypeIndex !== null
    ) {
      const updatedRegions = [...regions];
      const specificClass = {
        name: newSpecificClass.trim(),
        subjects: [],
      };

      updatedRegions[selectedRegionIndex].examTypes[
        selectedExamTypeIndex
      ].specificClasses.push(specificClass);
      setRegions(updatedRegions);
      setNewSpecificClass("");
      setSelectedSpecificClassIndex(
        updatedRegions[selectedRegionIndex].examTypes[selectedExamTypeIndex]
          .specificClasses.length - 1
      );
    }
  };

  const handleAddSubject = () => {
    if (
      newSubject.trim() &&
      selectedRegionIndex !== null &&
      selectedExamTypeIndex !== null &&
      selectedSpecificClassIndex !== null
    ) {
      const updatedRegions = [...regions];
      const subject = {
        name: newSubject.trim(),
      };

      updatedRegions[selectedRegionIndex].examTypes[
        selectedExamTypeIndex
      ].specificClasses[selectedSpecificClassIndex].subjects.push(subject);
      setRegions(updatedRegions);
      setNewSubject("");
    }
  };

  const handleDeleteRegion = (index, e) => {
    e.stopPropagation();
    const updated = regions.filter((_, i) => i !== index);
    setRegions(updated);
    if (selectedRegionIndex === index) {
      setSelectedRegionIndex(null);
      setSelectedExamTypeIndex(null);
      setSelectedSpecificClassIndex(null);
    } else if (selectedRegionIndex > index) {
      setSelectedRegionIndex(selectedRegionIndex - 1);
    }
  };

  const handleDeleteExamType = (index, e) => {
    e.stopPropagation();
    if (selectedRegionIndex === null) return;
    const updatedRegions = [...regions];
    updatedRegions[selectedRegionIndex].examTypes.splice(index, 1);
    setRegions(updatedRegions);
    if (selectedExamTypeIndex === index) {
      setSelectedExamTypeIndex(null);
      setSelectedSpecificClassIndex(null);
    } else if (selectedExamTypeIndex > index) {
      setSelectedExamTypeIndex(selectedExamTypeIndex - 1);
    }
  };

  const handleDeleteSpecificClass = (index, e) => {
    e.stopPropagation();
    if (selectedRegionIndex === null || selectedExamTypeIndex === null) return;
    const updatedRegions = [...regions];
    updatedRegions[selectedRegionIndex].examTypes[
      selectedExamTypeIndex
    ].specificClasses.splice(index, 1);
    setRegions(updatedRegions);
    if (selectedSpecificClassIndex === index) {
      setSelectedSpecificClassIndex(null);
    } else if (selectedSpecificClassIndex > index) {
      setSelectedSpecificClassIndex(selectedSpecificClassIndex - 1);
    }
  };

  const handleDeleteSubject = (index, e) => {
    e.stopPropagation();
    if (
      selectedRegionIndex === null ||
      selectedExamTypeIndex === null ||
      selectedSpecificClassIndex === null
    )
      return;
    const updatedRegions = [...regions];
    updatedRegions[selectedRegionIndex].examTypes[
      selectedExamTypeIndex
    ].specificClasses[selectedSpecificClassIndex].subjects.splice(index, 1);
    setRegions(updatedRegions);
  };

  const handleSubmitToServer = async () => {
    if (regions.length === 0) {
      toast.error("Please add at least one region before submitting");
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await createQAndARegion(regions);

      if (response.message) {
        toast.success(response.message);
        setRegions([]);
        setNewRegion("");
        setSelectedRegionIndex(null);
        setSelectedExamTypeIndex(null);
        setSelectedSpecificClassIndex(null);
        navigate("/view-qa");
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

  // Count totals
  const totalExamTypes = regions.reduce(
    (sum, r) => sum + (r.examTypes?.length || 0),
    0
  );
  const totalClasses = regions.reduce(
    (sum, r) =>
      sum +
      (r.examTypes?.reduce(
        (eSum, e) => eSum + (e.specificClasses?.length || 0),
        0
      ) || 0),
    0
  );
  const totalSubjects = regions.reduce(
    (sum, r) =>
      sum +
      (r.examTypes?.reduce(
        (eSum, e) =>
          eSum +
          (e.specificClasses?.reduce(
            (cSum, c) => cSum + (c.subjects?.length || 0),
            0
          ) || 0),
        0
      ) || 0),
    0
  );

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#1c1c1e] py-6 sm:py-8 px-4 sm:px-6 lg:px-8 xl:px-12 w-full">
      <div className="w-full space-y-6">

        {/* Header Bar */}
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
            onClick={() => navigate("/edit-qa-region")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1c1c1e] text-white hover:bg-[#2c2c34] text-sm font-semibold transition-all shadow-xs self-start sm:self-auto active:scale-98"
          >
            <span>Edit Existing Regions</span>
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
            Q&amp;A Regional Management
          </h1>
          <p className="text-sm sm:text-base text-[#555a6a]">
            Organize academic territories, exam types, classes, and specific subjects for Q&amp;A curation.
          </p>
        </div>

        {/* Main Structure Card */}
        <div className="bg-white rounded-2xl border border-[#e0e2e8] shadow-xs p-5 sm:p-7 space-y-6 w-full">

          {/* Level 1: Region Level (Canary Yellow Theme) */}
          <div className="p-5 rounded-2xl bg-[#fff8e0] border-2 border-[#fde89c] space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-[#ffd02f] text-[#1c1c1e] flex items-center justify-center font-bold text-xs shadow-xs">
                  1
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-[#1c1c1e]">Region Level</h2>
                  <p className="text-xs text-[#746019]">Top-level territory, state, or educational board</p>
                </div>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-white text-[#746019] border border-[#fde89c] shadow-2xs">
                {regions.length} {regions.length === 1 ? "Region" : "Regions"}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full items-stretch">
              <input
                type="text"
                value={newRegion}
                onChange={(e) => setNewRegion(e.target.value)}
                placeholder="Enter region name (e.g. CBSE, ICSE, JEE, NEET, Maharashtra Board)..."
                className="w-full sm:flex-1 h-12 min-h-[48px] shrink-0 px-4 py-3 bg-white border border-[#c7cad5] rounded-xl text-[#1c1c1e] placeholder-[#8e91a0] focus:outline-hidden focus:border-2 focus:border-[#4262ff] transition-all text-sm font-medium leading-normal shadow-2xs"
                onKeyDown={(e) => e.key === "Enter" && handleAddRegion()}
              />
              <button
                onClick={handleAddRegion}
                disabled={!newRegion.trim()}
                className="w-full sm:w-auto h-12 min-h-[48px] shrink-0 px-6 rounded-xl sm:rounded-full bg-[#ffd02f] text-[#1c1c1e] hover:bg-[#fcb900] disabled:opacity-40 disabled:cursor-not-allowed font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-2xs active:scale-98"
              >
                <Plus className="w-4 h-4" />
                <span>Add Region</span>
              </button>
            </div>

            {/* Existing Regions Grid */}
            {regions.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 pt-1">
                {regions.map((region, index) => {
                  const isSelected = selectedRegionIndex === index;
                  return (
                    <div
                      key={index}
                      onClick={() => {
                        setSelectedRegionIndex(index);
                        setSelectedExamTypeIndex(null);
                        setSelectedSpecificClassIndex(null);
                      }}
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
                        <button
                          onClick={(e) => handleDeleteRegion(index, e)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Region"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Level 2: Exam Type Level (Teal Theme) */}
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
                      Entrance exams, Board exams, or Academic streams
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-white text-[#187574] border border-[#9eece4]">
                  {selectedRegion.examTypes?.length || 0} Exam Types
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full items-stretch">
                <input
                  type="text"
                  value={newExamType}
                  onChange={(e) => setNewExamType(e.target.value)}
                  placeholder={`Enter exam type for "${selectedRegion.name}" (e.g. Board Exams, Mains, Advanced)...`}
                  className="w-full sm:flex-1 h-12 min-h-[48px] shrink-0 px-4 py-3 bg-white border border-[#c7cad5] rounded-xl text-[#1c1c1e] placeholder-[#8e91a0] focus:outline-hidden focus:border-2 focus:border-[#0fbcb0] transition-all text-sm font-medium leading-normal shadow-2xs"
                  onKeyDown={(e) => e.key === "Enter" && handleAddExamType()}
                />
                <button
                  onClick={handleAddExamType}
                  disabled={!newExamType.trim()}
                  className="w-full sm:w-auto h-12 min-h-[48px] shrink-0 px-6 rounded-xl sm:rounded-full bg-[#0fbcb0] text-white hover:bg-[#187574] disabled:opacity-40 disabled:cursor-not-allowed font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-2xs active:scale-98"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Exam Type</span>
                </button>
              </div>

              {/* Existing Exam Types Grid */}
              {selectedRegion.examTypes?.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 pt-1">
                  {selectedRegion.examTypes.map((examType, index) => {
                    const isSelected = selectedExamTypeIndex === index;
                    return (
                      <div
                        key={index}
                        onClick={() => {
                          setSelectedExamTypeIndex(index);
                          setSelectedSpecificClassIndex(null);
                        }}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                          isSelected
                            ? "bg-white border-2 border-[#0fbcb0] shadow-md ring-2 ring-[#0fbcb0]/20"
                            : "bg-white/90 border-[#9eece4] hover:border-[#0fbcb0] hover:bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Tag
                            className={`w-4 h-4 shrink-0 ${
                              isSelected ? "text-[#0fbcb0]" : "text-[#187574]"
                            }`}
                          />
                          <span className="font-bold text-[#1c1c1e] text-sm truncate">
                            {examType.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#c3faf5] text-[#187574]">
                            {examType.specificClasses?.length || 0}
                          </span>
                          <button
                            onClick={(e) => handleDeleteExamType(index, e)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Exam Type"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Level 3: Specific Class Level (Rose Theme) */}
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
                      Grade 10, Grade 12, Class 11th, Foundation, etc.
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-white text-[#86296b] border border-[#f3bee5]">
                  {selectedExamType.specificClasses?.length || 0} Classes
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full items-stretch">
                <input
                  type="text"
                  value={newSpecificClass}
                  onChange={(e) => setNewSpecificClass(e.target.value)}
                  placeholder={`Enter class for "${selectedExamType.name}" (e.g. Class 12, Class 10, Dropper)...`}
                  className="w-full sm:flex-1 h-12 min-h-[48px] shrink-0 px-4 py-3 bg-white border border-[#c7cad5] rounded-xl text-[#1c1c1e] placeholder-[#8e91a0] focus:outline-hidden focus:border-2 focus:border-[#86296b] transition-all text-sm font-medium leading-normal shadow-2xs"
                  onKeyDown={(e) => e.key === "Enter" && handleAddSpecificClass()}
                />
                <button
                  onClick={handleAddSpecificClass}
                  disabled={!newSpecificClass.trim()}
                  className="w-full sm:w-auto h-12 min-h-[48px] shrink-0 px-6 rounded-xl sm:rounded-full bg-[#86296b] text-white hover:bg-[#6e2257] disabled:opacity-40 disabled:cursor-not-allowed font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-2xs active:scale-98"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Class</span>
                </button>
              </div>

              {/* Existing Classes Grid */}
              {selectedExamType.specificClasses?.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 pt-1">
                  {selectedExamType.specificClasses.map((specificClass, index) => {
                    const isSelected = selectedSpecificClassIndex === index;
                    return (
                      <div
                        key={index}
                        onClick={() => setSelectedSpecificClassIndex(index)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                          isSelected
                            ? "bg-white border-2 border-[#86296b] shadow-md ring-2 ring-[#86296b]/20"
                            : "bg-white/90 border-[#f3bee5] hover:border-[#86296b] hover:bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Grid3X3
                            className={`w-4 h-4 shrink-0 ${
                              isSelected ? "text-[#86296b]" : "text-[#86296b]/70"
                            }`}
                          />
                          <span className="font-bold text-[#1c1c1e] text-sm truncate">
                            {specificClass.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#ffd8f4] text-[#86296b]">
                            {specificClass.subjects?.length || 0}
                          </span>
                          <button
                            onClick={(e) => handleDeleteSpecificClass(index, e)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Class"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Level 4: Subject Level (Lavender Theme) */}
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
                      Physics, Mathematics, Biology, Chemistry, English, etc.
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-white text-[#4262ff] border border-[#ddd6fe]">
                  {selectedSpecificClass.subjects?.length || 0} Subjects
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full items-stretch">
                <input
                  type="text"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder={`Enter subject for "${selectedSpecificClass.name}" (e.g. Physics, Chemistry, Biology)...`}
                  className="w-full sm:flex-1 h-12 min-h-[48px] shrink-0 px-4 py-3 bg-white border border-[#c7cad5] rounded-xl text-[#1c1c1e] placeholder-[#8e91a0] focus:outline-hidden focus:border-2 focus:border-[#4262ff] transition-all text-sm font-medium leading-normal shadow-2xs"
                  onKeyDown={(e) => e.key === "Enter" && handleAddSubject()}
                />
                <button
                  onClick={handleAddSubject}
                  disabled={!newSubject.trim()}
                  className="w-full sm:w-auto h-12 min-h-[48px] shrink-0 px-6 rounded-xl sm:rounded-full bg-[#4262ff] text-white hover:bg-[#3350e0] disabled:opacity-40 disabled:cursor-not-allowed font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-2xs active:scale-98"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Subject</span>
                </button>
              </div>

              {/* Existing Subjects Grid */}
              {selectedSpecificClass.subjects?.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 pt-1">
                  {selectedSpecificClass.subjects.map((subject, index) => (
                    <div
                      key={index}
                      className="p-3 rounded-xl border border-[#ddd6fe] bg-white hover:border-[#4262ff] transition-all flex items-center justify-between gap-2 shadow-2xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <BookOpen className="w-4 h-4 text-[#4262ff] shrink-0" />
                        <span className="font-bold text-[#1c1c1e] text-sm truncate">
                          {subject.name}
                        </span>
                      </div>
                      <button
                        onClick={(e) => handleDeleteSubject(index, e)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                        title="Delete Subject"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Summary & Submit Card */}
        {regions.length > 0 && (
          <div className="bg-white rounded-2xl border border-[#e0e2e8] shadow-xs p-5 sm:p-7 flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
            <div className="space-y-1">
              <h3 className="font-bold text-base sm:text-lg text-[#1c1c1e]">
                Ready to Publish Hierarchy
              </h3>
              <p className="text-xs sm:text-sm text-[#555a6a]">
                {regions.length} Regions &bull; {totalExamTypes} Exam Types &bull; {totalClasses} Classes &bull; {totalSubjects} Subjects prepared
              </p>
            </div>
            <button
              onClick={handleSubmitToServer}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#ffd02f] hover:bg-[#fcb900] text-[#1c1c1e] font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-98"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4 text-[#1c1c1e]" />
                  <span>Submitting Regions...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Submit Q&amp;A Regions to Database</span>
                </>
              )}
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default QandARegion;