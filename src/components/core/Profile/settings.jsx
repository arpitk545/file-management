"use client"

import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Camera, Save, Lock, Trash2, AlertTriangle, User, ArrowLeft } from "lucide-react"
import { getMyProfile, updateProfile } from "../../../services/operations/profileAPI"
import { changePassword } from "../../../services/operations/authAPI"
import toast from "react-hot-toast"

const MiroLoader = ({ message = "Loading profile settings..." }) => (
  <div className="flex flex-col items-center justify-center py-20 gap-3">
    <div className="relative w-12 h-12">
      <div className="w-12 h-12 rounded-full border-4 border-[#eef0f3] border-t-[#ffd02f] border-r-[#1c1c1e] animate-spin" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-3 h-3 rounded-full bg-[#ffd02f]" />
      </div>
    </div>
    <span className="text-xs font-bold uppercase tracking-wider text-[#555a6a]">{message}</span>
  </div>
)

export default function Settings() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [profileData, setProfileData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updatingProfile, setUpdatingProfile] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [deletingAccount, setDeletingAccount] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getMyProfile()
        setProfileData(response) 
      } catch (error) {
        console.error("Failed to load profile:", error)
        toast.error("Failed to load profile information")
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [deleteAccount, setDeleteAccount] = useState({
    confirmDelete: false,
  })

  const [errors, setErrors] = useState({})

  const handleProfileChange = (field, value) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }))
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }))
    }
  }

  const handlePasswordChange = (field, value) => {
    setPasswordData((prev) => ({
      ...prev,
      [field]: value,
    }))
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }))
    }
  }

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setProfileData((prev) => ({
          ...prev,
          profileImage: e.target.result,
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const validateProfile = () => {
    const newErrors = {}
    if (!profileData?.fullName?.trim()) newErrors.fullName = "Full name is required"
    if (!profileData?.user?.email?.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(profileData.user.email)) {
      newErrors.email = "Email is invalid"
    }
    if (!profileData?.mobile?.trim()) newErrors.mobile = "Mobile number is required"
    if (!profileData?.address?.trim()) newErrors.address = "Address is required"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validatePassword = () => {
    const newErrors = {}
    if (!passwordData.currentPassword) newErrors.currentPassword = "Current password is required"
    if (!passwordData.newPassword) {
      newErrors.newPassword = "New password is required"
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters"
    }
    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password"
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    if (!validateProfile()) return
    setUpdatingProfile(true)

    try {
      const response = await updateProfile(profileData)
      if (response) {
        toast.success("Profile updated successfully!")
        setProfileData(response)
      } else {
        toast.error("Failed to update profile. Please try again.")
      }
    } catch (error) {
      toast.error("An error occurred while updating profile.")
    } finally {
      setUpdatingProfile(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (!validatePassword()) return
    setChangingPassword(true)

    try {
      const response = await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmNewPassword: passwordData.confirmPassword,
      })

      if (response?.success) {
        toast.success("Password changed successfully. Logging out...")
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        })

        setTimeout(() => {
          localStorage.clear()
          window.location.href = "/login"
        }, 1500)
      } else {
        toast.error(response?.message || "Failed to change password.")
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "An error occurred while changing password.")
    } finally {
      setChangingPassword(false)
    }
  }

  const handleDeleteAccount = async (e) => {
    e.preventDefault()
    if (!deleteAccount.confirmDelete) return
    setDeletingAccount(true)

    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      alert("Account deletion initiated! Please contact support for account closure.")
    } finally {
      setDeletingAccount(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f8fa] flex items-center justify-center">
        <MiroLoader />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#1c1c1e] py-6 sm:py-8 px-4 sm:px-6 lg:px-8 xl:px-12 w-full">
      <div className="w-full space-y-6">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e0e2e8]">
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => navigate("/dashboard")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#c7cad5] text-[#1c1c1e] hover:bg-[#f7f8fa] hover:border-[#1c1c1e] transition-all text-sm font-semibold shadow-sm active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </button>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#ffd02f] text-[#1c1c1e]">
              ACCOUNT STUDIO
            </span>
            <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#f5f3ff] text-[#4262ff] border border-[#ddd6fe]">
              PREFERENCES
            </span>
          </div>
        </div>

        {/* Page Title */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#1c1c1e]">
            Account Settings
          </h1>
          <p className="text-sm sm:text-base text-[#555a6a]">
            Manage your personal profile details, authentication credentials, and system security.
          </p>
        </div>

        {/* Profile Information Card */}
        <div className="bg-white rounded-2xl border border-[#c7cad5] shadow-sm p-5 sm:p-7 space-y-6">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#e0e2e8]">
            <User className="w-5 h-5 text-[#4262ff]" />
            <h2 className="text-base sm:text-lg font-bold text-[#1c1c1e]">
              Profile Information
            </h2>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-6">
            {/* Avatar Row */}
            <div className="flex flex-col sm:flex-row items-center gap-5">
              <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-[#c7cad5] bg-[#f7f8fa]">
                  <img
                    src={profileData?.profileImage || "/placeholder.svg"}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 bg-[#ffd02f] hover:bg-[#fcb900] text-[#1c1c1e] p-2 rounded-full shadow-md border border-[#c7cad5] transition-all active:scale-95"
                  title="Upload New Photo"
                >
                  <Camera className="w-4 h-4" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              <div className="text-center sm:text-left space-y-1">
                <h3 className="text-base font-bold text-[#1c1c1e]">
                  {profileData?.fullName || "Your Avatar"}
                </h3>
                <p className="text-xs text-[#555a6a]">
                  PNG, JPG or WEBP. Upload a professional square avatar image.
                </p>
              </div>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#555a6a]">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={profileData?.fullName || ""}
                  onChange={(e) => handleProfileChange("fullName", e.target.value)}
                  className={`w-full h-11 min-h-[44px] px-3.5 text-sm font-semibold rounded-xl border ${
                    errors.fullName ? "border-red-500 bg-[#fff8f8]" : "border-[#c7cad5] bg-[#fffdf5]"
                  } text-[#1c1c1e] focus:border-[#1c1c1e] focus:ring-2 focus:ring-[#ffd02f]/30 focus:outline-none transition-all`}
                  placeholder="Enter your full name"
                />
                {errors.fullName && <p className="text-red-500 text-xs mt-1 font-medium">{errors.fullName}</p>}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#555a6a]">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={profileData?.user?.email || ""}
                  onChange={(e) => handleProfileChange("email", e.target.value)}
                  className={`w-full h-11 min-h-[44px] px-3.5 text-sm font-semibold rounded-xl border ${
                    errors.email ? "border-red-500 bg-[#fff8f8]" : "border-[#c7cad5] bg-[#fffdf5]"
                  } text-[#1c1c1e] focus:border-[#1c1c1e] focus:ring-2 focus:ring-[#ffd02f]/30 focus:outline-none transition-all`}
                  placeholder="Enter your email"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1 font-medium">{errors.email}</p>}
              </div>

              {/* Mobile */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#555a6a]">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  value={profileData?.mobile || ""}
                  onChange={(e) => handleProfileChange("mobile", e.target.value)}
                  className={`w-full h-11 min-h-[44px] px-3.5 text-sm font-semibold rounded-xl border ${
                    errors.mobile ? "border-red-500 bg-[#fff8f8]" : "border-[#c7cad5] bg-[#fffdf5]"
                  } text-[#1c1c1e] focus:border-[#1c1c1e] focus:ring-2 focus:ring-[#ffd02f]/30 focus:outline-none transition-all`}
                  placeholder="Enter your mobile number"
                />
                {errors.mobile && <p className="text-red-500 text-xs mt-1 font-medium">{errors.mobile}</p>}
              </div>

              {/* Gender */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#555a6a]">
                  Gender
                </label>
                <select
                  value={profileData?.gender || "Male"}
                  onChange={(e) => handleProfileChange("gender", e.target.value)}
                  className="w-full h-11 min-h-[44px] px-3.5 text-sm font-semibold rounded-xl border border-[#c7cad5] bg-[#fbf9fe] text-[#1c1c1e] focus:border-[#1c1c1e] focus:ring-2 focus:ring-[#ffd02f]/30 focus:outline-none transition-all"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Date of Birth */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#555a6a]">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={profileData?.dob ? new Date(profileData.dob).toISOString().split("T")[0] : ""}
                  onChange={(e) => handleProfileChange("dob", e.target.value)}
                  className="w-full h-11 min-h-[44px] px-3.5 text-sm font-semibold rounded-xl border border-[#c7cad5] bg-[#f4fbfb] text-[#1c1c1e] focus:border-[#1c1c1e] focus:ring-2 focus:ring-[#ffd02f]/30 focus:outline-none transition-all"
                />
              </div>

              {/* Country */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#555a6a]">
                  Country *
                </label>
                <input
                  type="text"
                  value={profileData?.country || ""}
                  onChange={(e) => handleProfileChange("country", e.target.value)}
                  className={`w-full h-11 min-h-[44px] px-3.5 text-sm font-semibold rounded-xl border ${
                    errors.country ? "border-red-500 bg-[#fff8f8]" : "border-[#c7cad5] bg-[#fdf6fa]"
                  } text-[#1c1c1e] focus:border-[#1c1c1e] focus:ring-2 focus:ring-[#ffd02f]/30 focus:outline-none transition-all`}
                  placeholder="Enter your Country"
                />
                {errors.country && <p className="text-red-500 text-xs mt-1 font-medium">{errors.country}</p>}
              </div>

              {/* Address */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#555a6a]">
                  Address *
                </label>
                <textarea
                  value={profileData?.address || ""}
                  onChange={(e) => handleProfileChange("address", e.target.value)}
                  rows={3}
                  className={`w-full px-3.5 py-3 text-sm font-semibold rounded-xl border ${
                    errors.address ? "border-red-500 bg-[#fff8f8]" : "border-[#c7cad5] bg-white"
                  } text-[#1c1c1e] focus:border-[#1c1c1e] focus:ring-2 focus:ring-[#ffd02f]/30 focus:outline-none transition-all resize-none`}
                  placeholder="Enter full mailing address"
                />
                {errors.address && <p className="text-red-500 text-xs mt-1 font-medium">{errors.address}</p>}
              </div>
            </div>

            {/* Profile Action Bar */}
            <div className="pt-4 border-t border-[#e0e2e8] flex justify-end">
              <button
                type="submit"
                disabled={updatingProfile}
                className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full bg-[#ffd02f] hover:bg-[#fcb900] text-[#1c1c1e] font-extrabold text-sm shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updatingProfile ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#1c1c1e] border-t-transparent rounded-full animate-spin" />
                    <span>Updating Profile...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 text-[#1c1c1e]" />
                    <span>Save Profile Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="bg-white rounded-2xl border border-[#c7cad5] shadow-sm p-5 sm:p-7 space-y-6">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#e0e2e8]">
            <Lock className="w-5 h-5 text-[#4262ff]" />
            <h2 className="text-base sm:text-lg font-bold text-[#1c1c1e]">
              Change Password
            </h2>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Current Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#555a6a]">
                  Current Password *
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => handlePasswordChange("currentPassword", e.target.value)}
                  className={`w-full h-11 min-h-[44px] px-3.5 text-sm font-semibold rounded-xl border ${
                    errors.currentPassword ? "border-red-500 bg-[#fff8f8]" : "border-[#c7cad5] bg-white"
                  } text-[#1c1c1e] focus:border-[#1c1c1e] focus:ring-2 focus:ring-[#ffd02f]/30 focus:outline-none transition-all`}
                  placeholder="Enter current password"
                />
                {errors.currentPassword && (
                  <p className="text-red-500 text-xs mt-1 font-medium">{errors.currentPassword}</p>
                )}
              </div>

              {/* New Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#555a6a]">
                  New Password *
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => handlePasswordChange("newPassword", e.target.value)}
                  className={`w-full h-11 min-h-[44px] px-3.5 text-sm font-semibold rounded-xl border ${
                    errors.newPassword ? "border-red-500 bg-[#fff8f8]" : "border-[#c7cad5] bg-white"
                  } text-[#1c1c1e] focus:border-[#1c1c1e] focus:ring-2 focus:ring-[#ffd02f]/30 focus:outline-none transition-all`}
                  placeholder="At least 6 characters"
                />
                {errors.newPassword && (
                  <p className="text-red-500 text-xs mt-1 font-medium">{errors.newPassword}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#555a6a]">
                  Confirm New Password *
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => handlePasswordChange("confirmPassword", e.target.value)}
                  className={`w-full h-11 min-h-[44px] px-3.5 text-sm font-semibold rounded-xl border ${
                    errors.confirmPassword ? "border-red-500 bg-[#fff8f8]" : "border-[#c7cad5] bg-white"
                  } text-[#1c1c1e] focus:border-[#1c1c1e] focus:ring-2 focus:ring-[#ffd02f]/30 focus:outline-none transition-all`}
                  placeholder="Re-enter new password"
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1 font-medium">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            {/* Password Action Bar */}
            <div className="pt-4 border-t border-[#e0e2e8] flex justify-end">
              <button
                type="submit"
                disabled={changingPassword}
                className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full bg-[#4262ff] hover:bg-[#2a41b6] text-white font-bold text-sm shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {changingPassword ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-[#ffd02f]" />
                    <span>Update Password</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Danger Zone / Delete Account Card */}
        <div className="bg-[#fff8f8] rounded-2xl border border-[#e3c5c5] shadow-sm p-5 sm:p-7 space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#fbd4d4]">
            <AlertTriangle className="w-5 h-5 text-[#800000]" />
            <h2 className="text-base sm:text-lg font-bold text-[#800000]">
              Danger Zone
            </h2>
          </div>

          <form onSubmit={handleDeleteAccount} className="space-y-4">
            <div className="bg-white border border-[#fbd4d4] rounded-xl p-4 space-y-1.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#800000]">
                Permanent Account Deletion
              </h3>
              <p className="text-xs sm:text-sm text-[#555a6a] leading-relaxed">
                Deleting your account is irreversible. Your profile, history, active submissions, and credentials will be removed.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <input
                type="checkbox"
                id="confirmDelete"
                checked={deleteAccount.confirmDelete}
                onChange={(e) => setDeleteAccount({ confirmDelete: e.target.checked })}
                className="w-4 h-4 text-[#800000] border-[#c7cad5] rounded focus:ring-[#fbd4d4]"
              />
              <label htmlFor="confirmDelete" className="text-xs sm:text-sm font-semibold text-[#1c1c1e] cursor-pointer select-none">
                I understand the consequences and request account deletion
              </label>
            </div>

            <div className="pt-3 border-t border-[#fbd4d4] flex justify-end">
              <button
                type="submit"
                disabled={!deleteAccount.confirmDelete || deletingAccount}
                className={`inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold transition-all shadow-sm active:scale-95 ${
                  deleteAccount.confirmDelete
                    ? "bg-[#fbd4d4] hover:bg-[#f9a9a9] border border-[#e3c5c5] text-[#800000]"
                    : "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
                }`}
              >
                {deletingAccount ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>Processing request...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete My Account</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}