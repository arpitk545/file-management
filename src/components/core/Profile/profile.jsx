"use client";

import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Camera,
  Edit,
  MapPin,
  Mail,
  Phone,
  User,
  Shield,
  Clock,
  Globe,
  ArrowLeft,
  CheckCircle2,
  PlusCircle,
} from "lucide-react";
import { getMyProfile } from "../../../services/operations/profileAPI";
import countries from "i18n-iso-countries";
import { parsePhoneNumber } from "libphonenumber-js";
import "i18n-iso-countries/langs/en.json";

countries.registerLocale(require("i18n-iso-countries/langs/en.json"));

/**
 * Miro Design System - View Profile Page (DESIGN-miro.md)
 * - Desktop: Full maximum width across screen (w-full px-4 sm:px-6 lg:px-10 xl:px-14 2xl:px-20)
 * - Mobile: 100% responsive, zero horizontal overflow, touch-friendly tap targets
 * - Miro Pastel Cards:
 *    - Yellow: #fff4c4 (bg), #fcb900 (accent), #746019 (text)
 *    - Teal: #c3faf5 (bg), #0fbcb0 (accent), #187574 (text)
 *    - Rose: #ffd8f4 (bg), #e04192 (accent), #8e1d67 (text)
 *    - Orange: #ffe6cd (bg), #ff8800 (accent), #944605 (text)
 * - Action Buttons: #1c1c1e black pill (rounded-full)
 */

export default function Profile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timezone, setTimezone] = useState("");
  const [offset, setOffset] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getMyProfile();
        setUserData(response);
      } catch (error) {
        console.error("Failed to load profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Timezone and offset
  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const date = new Date();
    const offsetMinutes = -date.getTimezoneOffset();
    const sign = offsetMinutes >= 0 ? "+" : "-";
    const hours = String(Math.floor(Math.abs(offsetMinutes) / 60)).padStart(2, "0");
    const minutes = String(Math.abs(offsetMinutes) % 60).padStart(2, "0");
    const formattedOffset = `UTC${sign}${hours}:${minutes}`;

    setTimezone(tz);
    setOffset(formattedOffset);
  }, []);

  // Country alpha2 code
  useEffect(() => {
    if (userData?.country) {
      const code = countries.getAlpha2Code(userData.country, "en");
      if (code) {
        setUserData((prev) => ({
          ...prev,
          countryCode: code.toLowerCase(),
        }));
      }
    }
  }, [userData?.country]);

  // Phone number parsing
  useEffect(() => {
    if (userData?.mobile) {
      try {
        const phoneNumber = parsePhoneNumber(userData.mobile);
        const countryCode = phoneNumber?.country?.toLowerCase();
        if (countryCode) {
          setUserData((prev) => ({
            ...prev,
            countryCode: countryCode,
            country: phoneNumber.country,
          }));
        }
      } catch (err) {
        console.warn("Could not parse phone number:", err);
      }
    }
  }, [userData?.mobile]);

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUserData((prev) => ({
          ...prev,
          profileImage: e.target.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const getRoleBadgeStyle = (role) => {
    const r = role ? role.toLowerCase() : "";
    if (r === "admin") {
      return "bg-[#1c1c1e] text-white border-[#1c1c1e]";
    } else if (r === "manager") {
      return "bg-[#0fbcb0] text-white border-[#0fbcb0]";
    } else {
      return "bg-[#ffd02f] text-[#1c1c1e] border-[#fcb900]";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not provided";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatAccountCreated = (dateString) => {
    if (!dateString) return "Recently joined";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateAgeFromDate = (dateString) => {
    if (!dateString) return "N/A";
    const createdDate = new Date(dateString);
    const now = new Date();
    let years = now.getFullYear() - createdDate.getFullYear();
    let months = now.getMonth() - createdDate.getMonth();
    let days = now.getDate() - createdDate.getDate();

    if (days < 0) {
      months -= 1;
      days += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }

    return `${years}y ${months}m active`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f8fa] flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-[#e0e2e8] border-t-[#1c1c1e] animate-spin mb-4" />
        <p className="text-sm font-semibold text-[#6b6f7e]">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#f7f8fa] text-[#1c1c1e] font-sans antialiased flex flex-col selection:bg-[#ffd02f] selection:text-[#1c1c1e]">
      {/* Top Miro Header: Spans Full Desktop Width */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#e0e2e8] w-full">
        <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-14 2xl:px-20 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <button
              onClick={() => navigate("/dashboard")}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#555a6a] hover:text-[#1c1c1e] transition-colors py-1.5 px-3 rounded-full hover:bg-[#f7f8fa] border border-transparent hover:border-[#e0e2e8] shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Dashboard</span>
            </button>
            <div className="h-4 w-px bg-[#e0e2e8] hidden sm:block shrink-0" />
            <div className="hidden sm:flex items-center gap-2 text-xs sm:text-sm truncate">
              <span className="text-[#8e91a0]">Identity</span>
              <span className="text-[#c7cad5]">/</span>
              <span className="font-bold text-[#1c1c1e] truncate">
                My Profile
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={() => navigate("/create-profile")}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full border border-[#c7cad5] bg-white hover:bg-[#f7f8fa] text-xs sm:text-sm font-semibold text-[#1c1c1e] transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5 text-[#4262ff]" />
              <span className="hidden xs:inline">Update Info</span>
              <span className="xs:hidden">Edit</span>
            </button>
            <button
              onClick={() => navigate("/settings")}
              className="inline-flex items-center gap-1.5 px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-full bg-[#1c1c1e] hover:bg-[#2c2c34] text-white text-xs sm:text-sm font-semibold shadow-xs transition-all"
            >
              <Edit className="w-3.5 h-3.5 text-[#ffd02f]" />
              <span className="hidden sm:inline">Settings</span>
              <span className="sm:hidden">Settings</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container: Full Width on Desktop with Comfortable Fluid Padding */}
      <main className="w-full flex-1 px-4 sm:px-6 lg:px-10 xl:px-14 2xl:px-20 py-6 sm:py-8 lg:py-10 space-y-6 sm:space-y-8">
        {/* Profile Hero Card: Miro Canvas Banner with Yellow Accent */}
        <div className="w-full bg-white rounded-3xl border border-[#e0e2e8] p-5 sm:p-7 lg:p-9 xl:p-10 shadow-sm relative overflow-hidden text-left">
          {/* Subtle Miro Pastel Corner Glows */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#fff4c4] rounded-full blur-3xl opacity-35 pointer-events-none -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-[#c3faf5] rounded-full blur-3xl opacity-25 pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-5 sm:gap-7 lg:gap-9">
            {/* Avatar with Miro Canary Yellow Ring */}
            <div className="relative group shrink-0">
              <div className="w-24 h-24 sm:w-32 sm:h-32 lg:w-36 lg:h-36 rounded-full overflow-hidden border-4 border-white ring-4 ring-[#ffd02f] shadow-md bg-[#fafbfc]">
                <img
                  src={userData?.profileImage || "/placeholder.svg"}
                  alt={userData?.fullName || "User Profile"}
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 sm:bottom-1 sm:right-1 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#1c1c1e] text-white flex items-center justify-center shadow-md hover:bg-[#2c2c34] transition-all hover:scale-105"
                title="Change Photo"
              >
                <Camera className="w-4 h-4 text-[#ffd02f]" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            {/* Profile Overview Details */}
            <div className="flex-1 text-center md:text-left space-y-3 w-full min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-full">
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#fff4c4] text-[#746019] text-[11px] font-bold uppercase tracking-wider border border-[#fcb900]/30">
                      Academic Identity
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0fbcb0]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#0fbcb0]" />
                      Verified
                    </span>
                  </div>
                  <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-[#1c1c1e] tracking-tight truncate">
                    {userData?.fullName || "Student Name"}
                  </h1>
                </div>

                {/* Role Pill */}
                <div className="flex items-center justify-center sm:justify-end shrink-0">
                  <span
                    className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border shadow-xs ${getRoleBadgeStyle(
                      userData?.user?.role
                    )}`}
                  >
                    {userData?.user?.role || "Student"}
                  </span>
                </div>
              </div>

              {/* Quick Contact Chips */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 pt-1 text-xs sm:text-sm text-[#555a6a]">
                {userData?.user?.email && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f7f8fa] border border-[#e0e2e8] max-w-full truncate">
                    <Mail className="w-3.5 h-3.5 text-[#6b6f7e] shrink-0" />
                    <span className="truncate">{userData?.user?.email}</span>
                  </div>
                )}
                {userData?.mobile && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f7f8fa] border border-[#e0e2e8]">
                    <Phone className="w-3.5 h-3.5 text-[#6b6f7e] shrink-0" />
                    <span>{userData?.mobile}</span>
                  </div>
                )}
                {userData?.country && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f7f8fa] border border-[#e0e2e8]">
                    {userData?.countryCode ? (
                      <img
                        src={`https://flagcdn.com/w40/${userData.countryCode}.png`}
                        alt={`${userData.country} flag`}
                        className="w-4 h-3 rounded-xs object-cover"
                      />
                    ) : (
                      <Globe className="w-3.5 h-3.5 text-[#6b6f7e] shrink-0" />
                    )}
                    <span>{userData?.country}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Miro Bento Grid: Spans Full Desktop Width with 4 Pastel Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 w-full text-left">
          {/* Card 1: Personal Details (Yellow Pastel Accent) */}
          <div className="bg-white rounded-2xl border border-[#e0e2e8] overflow-hidden shadow-xs hover:shadow-sm transition-shadow flex flex-col">
            <div className="bg-[#fff4c4] border-b border-[#fcb900]/30 px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#ffd02f] flex items-center justify-center text-[#1c1c1e]">
                  <User className="w-3.5 h-3.5" />
                </div>
                <h3 className="font-bold text-sm text-[#1c1c1e]">
                  Personal Info
                </h3>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#746019]">
                Bio
              </span>
            </div>

            <div className="p-5 space-y-3.5 flex-1 flex flex-col justify-between">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8e91a0]">
                    Gender
                  </span>
                  <p className="text-sm font-semibold text-[#1c1c1e]">
                    {userData?.gender || "Not specified"}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8e91a0]">
                    Date of Birth
                  </span>
                  <p className="text-sm font-semibold text-[#1c1c1e]">
                    {formatDate(userData?.dob)}
                  </p>
                </div>
              </div>

              <div className="pt-2.5 border-t border-[#eef0f3] space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8e91a0]">
                  Permanent Address
                </span>
                <p className="text-xs sm:text-sm text-[#1c1c1e] font-medium flex items-start gap-1.5 pt-0.5 leading-relaxed break-words">
                  <MapPin className="w-3.5 h-3.5 text-[#4262ff] shrink-0 mt-0.5" />
                  <span>{userData?.address || "No address recorded"}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Contact & Regional (Teal Pastel Accent) */}
          <div className="bg-white rounded-2xl border border-[#e0e2e8] overflow-hidden shadow-xs hover:shadow-sm transition-shadow flex flex-col">
            <div className="bg-[#c3faf5] border-b border-[#0fbcb0]/30 px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#0fbcb0] flex items-center justify-center text-white">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <h3 className="font-bold text-sm text-[#1c1c1e]">
                  Contact & Region
                </h3>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#187574]">
                Reach
              </span>
            </div>

            <div className="p-5 space-y-3.5 flex-1 flex flex-col justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8e91a0]">
                  Email Address
                </span>
                <p className="text-xs sm:text-sm font-semibold text-[#1c1c1e] truncate">
                  {userData?.user?.email || "No email"}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8e91a0]">
                  Phone Number
                </span>
                <p className="text-xs sm:text-sm font-semibold text-[#1c1c1e]">
                  {userData?.mobile || "No phone number"}
                </p>
              </div>

              <div className="pt-2.5 border-t border-[#eef0f3] space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8e91a0]">
                  Country & Locale
                </span>
                <div className="flex items-center gap-2 pt-0.5">
                  {userData?.countryCode && (
                    <img
                      src={`https://flagcdn.com/w40/${userData.countryCode}.png`}
                      alt="flag"
                      className="w-4 h-3 rounded-xs object-cover border border-[#c7cad5]"
                    />
                  )}
                  <span className="text-xs sm:text-sm font-semibold text-[#1c1c1e]">
                    {userData?.country || "International"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Account & Credentials (Rose Pastel Accent) */}
          <div className="bg-white rounded-2xl border border-[#e0e2e8] overflow-hidden shadow-xs hover:shadow-sm transition-shadow flex flex-col">
            <div className="bg-[#ffd8f4] border-b border-[#e04192]/30 px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#1c1c1e] flex items-center justify-center text-[#ffd02f]">
                  <Shield className="w-3.5 h-3.5" />
                </div>
                <h3 className="font-bold text-sm text-[#1c1c1e]">
                  Account Status
                </h3>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8e1d67]">
                Access
              </span>
            </div>

            <div className="p-5 space-y-3.5 flex-1 flex flex-col justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8e91a0]">
                  Assigned Role
                </span>
                <div className="pt-0.5">
                  <span
                    className={`inline-block px-3 py-0.5 rounded-full text-xs font-bold ${getRoleBadgeStyle(
                      userData?.user?.role
                    )}`}
                  >
                    {userData?.user?.role || "Student"}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8e91a0]">
                  Member Since
                </span>
                <p className="text-xs sm:text-sm font-semibold text-[#1c1c1e]">
                  {formatAccountCreated(userData?.user?.createdAt)}
                </p>
              </div>

              <div className="pt-2.5 border-t border-[#eef0f3] flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8e91a0]">
                  Status
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00b473] bg-[#00b473]/10 px-2.5 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00b473] animate-pulse" />
                  Active
                </span>
              </div>
            </div>
          </div>

          {/* Card 4: System & Timezone (Orange Pastel Accent) */}
          <div className="bg-white rounded-2xl border border-[#e0e2e8] overflow-hidden shadow-xs hover:shadow-sm transition-shadow flex flex-col">
            <div className="bg-[#ffe6cd] border-b border-[#ff8800]/30 px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#ff8800] flex items-center justify-center text-white">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <h3 className="font-bold text-sm text-[#1c1c1e]">
                  System & Session
                </h3>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#944605]">
                Sync
              </span>
            </div>

            <div className="p-5 space-y-3.5 flex-1 flex flex-col justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8e91a0]">
                  Tenure
                </span>
                <p className="text-xs sm:text-sm font-semibold text-[#1c1c1e]">
                  {calculateAgeFromDate(userData?.user?.createdAt)}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8e91a0]">
                  Timezone
                </span>
                <p className="text-xs sm:text-sm font-semibold text-[#1c1c1e] truncate">
                  {offset} ({timezone || "UTC"})
                </p>
              </div>

              <div className="pt-2.5 border-t border-[#eef0f3] space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8e91a0]">
                  Last Sign-in
                </span>
                <p className="text-xs sm:text-sm font-semibold text-[#1c1c1e]">
                  {userData?.lastLogin
                    ? formatDate(userData.lastLogin)
                    : "Current session"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Full-Width Miro Sticky Note (Tips & Guidance) across the bottom */}
        <div className="w-full bg-[#fff4c4] border border-[#fcb900]/40 rounded-2xl p-5 sm:p-7 lg:p-8 text-left shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#fcb900] text-[#1c1c1e] flex items-center justify-center font-bold text-xs">
                ★
              </span>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#746019]">
                clys Academic Workspace Notes
              </h4>
            </div>

            <h2 className="text-lg sm:text-xl md:text-2xl font-extrabold text-[#1c1c1e]">
              Keep your academic profile fresh & connected
            </h2>
            <p className="text-xs sm:text-sm text-[#1c1c1e]/80 leading-relaxed">
              Your profile credentials appear on live quiz rankings, certified diplomas, and peer study groups. Make sure your name and photo reflect your true academic identity.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0 w-full sm:w-auto">
            <button
              onClick={() => navigate("/create-profile")}
              className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[#1c1c1e] hover:bg-[#2c2c34] text-white text-xs sm:text-sm font-semibold shadow-xs transition-all text-center"
            >
              Update Profile Details
            </button>
            <button
              onClick={() => navigate("/view-user-quiz")}
              className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-white hover:bg-[#f7f8fa] text-[#1c1c1e] border border-[#fcb900] text-xs sm:text-sm font-semibold transition-all text-center"
            >
              Explore Quizzes
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}