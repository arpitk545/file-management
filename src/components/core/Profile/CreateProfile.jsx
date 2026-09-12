"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { upsertProfile } from "../../../services/operations/profileAPI";
import {
  User,
  Phone,
  MapPin,
  Calendar,
  CheckCircle,
  X,
  Loader2,
  ChevronDown,
  Camera,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Award,
} from "lucide-react";

/**
 * Miro Design System - Create Profile Page (DESIGN-miro.md)
 * - Desktop: Full maximum width (w-full px-4 sm:px-6 lg:px-10 xl:px-14 2xl:px-20)
 * - Mobile: 100% responsive, zero horizontal overflow, touch-friendly tap targets
 * - Miro styling: #1c1c1e black-pill buttons, #4262ff brand blue focus, #ffd02f canary yellow accents
 * - Miro pastels: #fff4c4 (yellow), #c3faf5 (teal), #ffd8f4 (rose), #ffe6cd (orange)
 */

export default function CreateProfile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [genderOpen, setGenderOpen] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    mobile: "",
    country: "",
    gender: "",
    dob: "",
    address: "",
    profileImage: null,
  });

  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);

  const countries = [
    "India",
    "United States",
    "United Kingdom",
    "Canada",
    "Australia",
    "Germany",
    "France",
    "Japan",
    "Brazil",
    "South Africa",
    "Singapore",
    "United Arab Emirates",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleImageFile = (file) => {
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        profileImage: "Image size must be less than 2MB",
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      profileImage: file,
    }));

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);

    if (errors.profileImage) {
      setErrors((prev) => ({
        ...prev,
        profileImage: "",
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    handleImageFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFile(e.dataTransfer.files[0]);
    }
  };

  const removeImage = (e) => {
    e.stopPropagation();
    setImagePreview(null);
    setFormData((prev) => ({ ...prev, profileImage: null }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const selectGender = (gender) => {
    setFormData((prev) => ({ ...prev, gender }));
    setGenderOpen(false);
    if (errors.gender) {
      setErrors((prev) => ({ ...prev, gender: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.mobile.trim()) {
      newErrors.mobile = "Mobile number is required";
    } else {
      const mobile = formData.mobile.trim();
      const validMobilePattern = /^(\+91)?\d{10}$/;
      if (!validMobilePattern.test(mobile)) {
        newErrors.mobile =
          "Please enter a valid 10-digit mobile number, optionally prefixed with +91";
      }
    }

    if (!formData.country) {
      newErrors.country = "Please select your country";
    }

    if (!formData.gender) {
      newErrors.gender = "Please select your gender";
    }

    if (!formData.dob) {
      newErrors.dob = "Date of birth is required";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }

    if (!formData.profileImage) {
      newErrors.profileImage = "Profile photo is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please complete all required fields correctly");
      return;
    }

    setIsSubmitting(true);

    try {
      const profileData = new FormData();
      profileData.append("fullName", formData.fullName);
      profileData.append("mobile", formData.mobile);
      profileData.append("country", formData.country);
      profileData.append("gender", formData.gender);
      profileData.append("dob", formData.dob);
      profileData.append("address", formData.address);
      profileData.append("profileImage", formData.profileImage);

      const response = await upsertProfile(profileData);

      if (response?.success) {
        toast.success("Profile created successfully!");
        navigate("/profile");
      } else {
        throw new Error(response?.message || "Failed to create profile");
      }
    } catch (error) {
      console.error("Error creating profile:", error);
      toast.error(error.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f7f8fa] text-[#1c1c1e] font-sans antialiased flex flex-col selection:bg-[#ffd02f] selection:text-[#1c1c1e]">
      {/* Top Miro Header: Spans Full Desktop Width */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#e0e2e8] w-full">
        <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-14 2xl:px-20 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#555a6a] hover:text-[#1c1c1e] transition-colors py-1.5 px-3 rounded-full hover:bg-[#f7f8fa] border border-transparent hover:border-[#e0e2e8] shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <div className="h-4 w-px bg-[#e0e2e8] hidden sm:block shrink-0" />
            <div className="hidden sm:flex items-center gap-2 text-xs sm:text-sm truncate">
              <span className="text-[#8e91a0]">Settings</span>
              <span className="text-[#c7cad5]">/</span>
              <span className="font-bold text-[#1c1c1e] truncate">
                Create Profile
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Miro canary yellow pill badge */}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffd02f] text-[#1c1c1e] text-xs font-bold uppercase tracking-wider shadow-xs">
              <Sparkles className="w-3.5 h-3.5 fill-[#1c1c1e]" />
              <span className="hidden xs:inline">Student Setup</span>
              <span className="xs:hidden">Setup</span>
            </span>
          </div>
        </div>
      </header>

      {/* Main Container: Full Width on Desktop, Edge-to-Edge Fluid with Comfortable Padding */}
      <main className="w-full flex-1 px-4 sm:px-6 lg:px-10 xl:px-14 2xl:px-20 py-6 sm:py-8 lg:py-10">
        {/* Header Hero Section */}
        <div className="mb-6 sm:mb-8 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#fff4c4] text-[#746019] text-xs font-bold uppercase tracking-wider mb-2.5 border border-[#fcb900]/30">
            <span>Identity & Verification</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#1c1c1e] tracking-tight leading-tight">
            Create your student profile
          </h1>
          <p className="mt-2 text-xs sm:text-sm md:text-base text-[#555a6a] max-w-3xl leading-relaxed">
            Personalize your academic identity on clys. Connect with peers, participate in live quiz contests, and showcase your verified credentials across the platform.
          </p>
        </div>

        {/* Full-Width Grid: Left Sidebar (Upload & Live Badge) + Right Expansive Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 xl:gap-10 items-start w-full">
          {/* LEFT COLUMN: Photo Upload & Student Live Preview Card (4 cols on lg, 3 on 2xl) */}
          <div className="lg:col-span-5 xl:col-span-4 2xl:col-span-3 space-y-6 w-full">
            {/* Avatar Upload Card */}
            <div className="bg-white rounded-2xl border border-[#e0e2e8] p-5 sm:p-6 lg:p-7 shadow-sm text-left w-full">
              <div className="flex items-center justify-between pb-3.5 border-b border-[#eef0f3] mb-5">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-[#1c1c1e]">
                    Profile Photo
                  </h3>
                  <p className="text-xs text-[#6b6f7e]">
                    Clear photo for your student badge
                  </p>
                </div>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#f7f8fa] text-[#555a6a] border border-[#e0e2e8]">
                  Required
                </span>
              </div>

              {/* Upload Dropzone */}
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative group cursor-pointer rounded-2xl border-2 border-dashed p-6 flex flex-col items-center justify-center transition-all ${
                  errors.profileImage
                    ? "border-red-400 bg-red-50/40"
                    : imagePreview
                    ? "border-[#ffd02f] bg-[#fff8e0]/30"
                    : "border-[#c7cad5] bg-[#fafbfc] hover:border-[#1c1c1e] hover:bg-[#f7f8fa]"
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                />

                {imagePreview ? (
                  <div className="relative">
                    <div className="w-28 h-28 sm:w-32 sm:h-32 lg:w-36 lg:h-36 rounded-full overflow-hidden ring-4 ring-[#ffd02f] shadow-md mx-auto">
                      <img
                        src={imagePreview}
                        alt="Profile Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-1 -right-1 w-8 h-8 bg-[#1c1c1e] text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
                      title="Remove photo"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-center py-3">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#ffd02f]/20 border border-[#ffd02f]/60 flex items-center justify-center text-[#1c1c1e] mb-3 group-hover:scale-105 transition-transform">
                      <Camera className="w-6 h-6 sm:w-7 sm:h-7 text-[#1c1c1e]" />
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-[#1c1c1e]">
                      Click or drag image here
                    </p>
                    <p className="text-[11px] text-[#6b6f7e] mt-1">
                      JPG, PNG or WEBP (Max 2MB)
                    </p>
                  </div>
                )}
              </div>

              {errors.profileImage && (
                <p className="mt-2 text-xs text-red-600 font-semibold">
                  {errors.profileImage}
                </p>
              )}

              {/* Live Preview Card */}
              <div className="mt-5 pt-5 border-t border-[#eef0f3]">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#6b6f7e]">
                    Live Badge Preview
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0fbcb0]">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified Student
                  </span>
                </div>

                <div className="bg-[#f7f8fa] border border-[#e0e2e8] rounded-xl p-3.5 flex items-center gap-3">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-white border border-[#c7cad5] shrink-0 flex items-center justify-center">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Badge Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-5 h-5 text-[#8e91a0]" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs sm:text-sm font-bold text-[#1c1c1e] truncate">
                      {formData.fullName || "Student Name"}
                    </h4>
                    <p className="text-[11px] text-[#6b6f7e] truncate">
                      {formData.country || "Country"} • {formData.gender || "Gender"}
                    </p>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-[#ffd02f] flex items-center justify-center shrink-0">
                    <Award className="w-4 h-4 text-[#1c1c1e]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Miro Pastel Yellow Sticky Note */}
            <div className="bg-[#fff4c4] border border-[#fcb900]/40 rounded-2xl p-5 text-left shadow-xs">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#fcb900] flex items-center justify-center text-[#1c1c1e] shrink-0 mt-0.5 font-bold text-xs">
                  ★
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#746019]">
                    clys Community Tip
                  </h4>
                  <p className="text-xs sm:text-sm text-[#1c1c1e] leading-relaxed">
                    Keeping your phone number and authentic name ensures instant verification for peer quizzes and certificates!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Expansive Form Spanning Full Width (8 cols on lg, 9 on 2xl) */}
          <div className="lg:col-span-7 xl:col-span-8 2xl:col-span-9 w-full">
            <form
              onSubmit={handleSubmit}
              noValidate
              className="bg-white rounded-2xl border border-[#e0e2e8] p-5 sm:p-7 lg:p-9 xl:p-10 shadow-sm text-left space-y-8 w-full"
            >
              {/* Section 1: Basic Information */}
              <div className="space-y-5">
                <div className="pb-3 border-b border-[#eef0f3]">
                  <h2 className="text-base sm:text-lg lg:text-xl font-bold text-[#1c1c1e]">
                    1. Basic Information
                  </h2>
                  <p className="text-xs sm:text-sm text-[#6b6f7e]">
                    Your name and academic identity across the clys platform
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Full Name */}
                  <div className="md:col-span-2">
                    <label
                      htmlFor="fullName"
                      className="block text-xs font-bold uppercase tracking-wider text-[#1c1c1e] mb-2"
                    >
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="e.g. Alex Henderson"
                        className={`w-full h-12 px-4 pr-11 bg-white text-[#1c1c1e] placeholder-[#8e91a0] rounded-lg border text-sm sm:text-base transition-all focus:outline-none ${
                          errors.fullName
                            ? "border-red-500 ring-1 ring-red-500"
                            : "border-[#c7cad5] focus:border-[#4262ff] focus:ring-2 focus:ring-[#4262ff]/20"
                        }`}
                      />
                      <User className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8e91a0]" />
                    </div>
                    {errors.fullName && (
                      <p className="mt-1.5 text-xs text-red-600 font-semibold">
                        {errors.fullName}
                      </p>
                    )}
                  </div>

                  {/* Gender Dropdown */}
                  <div className="relative">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#1c1c1e] mb-2">
                      Gender <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setGenderOpen(!genderOpen)}
                      className={`w-full h-12 px-4 flex items-center justify-between bg-white text-sm sm:text-base rounded-lg border transition-all focus:outline-none ${
                        errors.gender
                          ? "border-red-500 ring-1 ring-red-500"
                          : "border-[#c7cad5] focus:border-[#4262ff] focus:ring-2 focus:ring-[#4262ff]/20"
                      }`}
                    >
                      <span
                        className={
                          formData.gender ? "text-[#1c1c1e] font-medium" : "text-[#8e91a0]"
                        }
                      >
                        {formData.gender || "Select gender"}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-[#8e91a0] transition-transform duration-200 ${
                          genderOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    <AnimatePresence>
                      {genderOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          className="absolute z-20 mt-1.5 w-full bg-white rounded-xl shadow-xl border border-[#e0e2e8] py-1.5 overflow-hidden"
                        >
                          {["Male", "Female", "Other"].map((g) => (
                            <button
                              key={g}
                              type="button"
                              onClick={() => selectGender(g)}
                              className={`w-full px-4 py-2.5 text-left text-sm flex items-center justify-between hover:bg-[#f7f8fa] transition-colors ${
                                formData.gender === g
                                  ? "bg-[#fff8e0] text-[#1c1c1e] font-bold"
                                  : "text-[#1c1c1e]"
                              }`}
                            >
                              <span>{g}</span>
                              {formData.gender === g && (
                                <CheckCircle className="w-4 h-4 text-[#1c1c1e]" />
                              )}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {errors.gender && (
                      <p className="mt-1.5 text-xs text-red-600 font-semibold">
                        {errors.gender}
                      </p>
                    )}
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <label
                      htmlFor="dob"
                      className="block text-xs font-bold uppercase tracking-wider text-[#1c1c1e] mb-2"
                    >
                      Date of Birth <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        id="dob"
                        name="dob"
                        value={formData.dob}
                        onChange={handleChange}
                        className={`w-full h-12 px-4 pr-11 bg-white text-[#1c1c1e] rounded-lg border text-sm sm:text-base transition-all focus:outline-none ${
                          errors.dob
                            ? "border-red-500 ring-1 ring-red-500"
                            : "border-[#c7cad5] focus:border-[#4262ff] focus:ring-2 focus:ring-[#4262ff]/20"
                        }`}
                      />
                      <Calendar className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8e91a0] pointer-events-none" />
                    </div>
                    {errors.dob && (
                      <p className="mt-1.5 text-xs text-red-600 font-semibold">
                        {errors.dob}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Section 2: Contact & Location */}
              <div className="space-y-5">
                <div className="pb-3 border-b border-[#eef0f3]">
                  <h2 className="text-base sm:text-lg lg:text-xl font-bold text-[#1c1c1e]">
                    2. Contact & Location
                  </h2>
                  <p className="text-xs sm:text-sm text-[#6b6f7e]">
                    Where you study from and how educators connect with you
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Mobile Number */}
                  <div>
                    <label
                      htmlFor="mobile"
                      className="block text-xs font-bold uppercase tracking-wider text-[#1c1c1e] mb-2"
                    >
                      Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        id="mobile"
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleChange}
                        placeholder="e.g. 9876543210"
                        className={`w-full h-12 px-4 pr-11 bg-white text-[#1c1c1e] placeholder-[#8e91a0] rounded-lg border text-sm sm:text-base transition-all focus:outline-none ${
                          errors.mobile
                            ? "border-red-500 ring-1 ring-red-500"
                            : "border-[#c7cad5] focus:border-[#4262ff] focus:ring-2 focus:ring-[#4262ff]/20"
                        }`}
                      />
                      <Phone className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8e91a0]" />
                    </div>
                    {errors.mobile && (
                      <p className="mt-1.5 text-xs text-red-600 font-semibold">
                        {errors.mobile}
                      </p>
                    )}
                  </div>

                  {/* Country Dropdown */}
                  <div>
                    <label
                      htmlFor="country"
                      className="block text-xs font-bold uppercase tracking-wider text-[#1c1c1e] mb-2"
                    >
                      Country <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        className={`w-full h-12 px-4 pr-10 bg-white text-[#1c1c1e] rounded-lg border text-sm sm:text-base appearance-none transition-all focus:outline-none ${
                          errors.country
                            ? "border-red-500 ring-1 ring-red-500"
                            : "border-[#c7cad5] focus:border-[#4262ff] focus:ring-2 focus:ring-[#4262ff]/20"
                        }`}
                      >
                        <option value="">Select country</option>
                        {countries.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8e91a0] pointer-events-none" />
                    </div>
                    {errors.country && (
                      <p className="mt-1.5 text-xs text-red-600 font-semibold">
                        {errors.country}
                      </p>
                    )}
                  </div>

                  {/* Address (Spans Full Width) */}
                  <div className="md:col-span-2">
                    <label
                      htmlFor="address"
                      className="block text-xs font-bold uppercase tracking-wider text-[#1c1c1e] mb-2"
                    >
                      Full Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <textarea
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        rows={3}
                        placeholder="Street, City, State / Province, Postal Code"
                        className={`w-full p-4 bg-white text-[#1c1c1e] placeholder-[#8e91a0] rounded-lg border text-sm sm:text-base transition-all focus:outline-none resize-none ${
                          errors.address
                            ? "border-red-500 ring-1 ring-red-500"
                            : "border-[#c7cad5] focus:border-[#4262ff] focus:ring-2 focus:ring-[#4262ff]/20"
                        }`}
                      />
                      <MapPin className="absolute right-3.5 top-4 w-4 h-4 text-[#8e91a0]" />
                    </div>
                    {errors.address && (
                      <p className="mt-1.5 text-xs text-red-600 font-semibold">
                        {errors.address}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons: Miro Black Pill Primary Button + Secondary Pill */}
              <div className="pt-6 border-t border-[#eef0f3] flex flex-col sm:flex-row items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-full border border-[#c7cad5] text-[#1c1c1e] font-semibold text-sm sm:text-base hover:bg-[#f7f8fa] transition-all text-center order-2 sm:order-1"
                >
                  Cancel
                </button>

                <div className="w-full sm:w-auto flex items-center gap-3 order-1 sm:order-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto min-w-[200px] px-8 py-3.5 rounded-full bg-[#1c1c1e] hover:bg-[#2c2c34] text-white font-bold text-sm sm:text-base shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.99]"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>Saving Profile...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 text-[#ffd02f]" />
                        <span>Create Profile</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}