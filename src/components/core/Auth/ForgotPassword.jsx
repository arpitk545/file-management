"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  Check,
  X,
  Loader2,
  ShieldCheck,
} from "lucide-react"
import toast from "react-hot-toast"
import { forgotPasswordNew } from "../../../services/operations/authAPI"

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [showPassword, setShowPassword] = useState({
    newPassword: false,
    confirmPassword: false,
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  // Password validation (at least 8 characters, 1 uppercase, 1 lowercase, 1 number)
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/

  const validateForm = () => {
    const newErrors = {}

    if (!formData.email) {
      newErrors.email = "Email address is required"
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (!formData.newPassword) {
      newErrors.newPassword = "New password is required"
    } else if (!passwordRegex.test(formData.newPassword)) {
      newErrors.newPassword = "Password must be 8+ chars with uppercase, lowercase & number"
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password"
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const togglePasswordVisibility = (field) => {
    setShowPassword((prev) => ({
      ...prev,
      [field]: !prev[field],
    }))
  }

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, text: "", color: "" }

    let score = 0
    if (password.length >= 8) score++
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++
    if (/\d/.test(password) || /[@$!%*?&]/.test(password)) score++

    if (score === 1) return { strength: 1, text: "Weak password", color: "text-[#800000]" }
    if (score === 2) return { strength: 2, text: "Fair strength", color: "text-[#746019]" }
    return { strength: 3, text: "Strong password", color: "text-[#187574]" }
  }

  const passwordStrength = getPasswordStrength(formData.newPassword)
  const passwordMatch =
    formData.confirmPassword.length > 0 ? formData.newPassword === formData.confirmPassword : null

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    const toastId = toast.loading("Updating password...")

    try {
      const response = await forgotPasswordNew({
        email: formData.email,
        newPassword: formData.newPassword,
        confirmNewPassword: formData.confirmPassword,
      })

      if (response) {
        toast.dismiss(toastId)
        toast.success("Password updated successfully!")
        setSuccess(true)
        setFormData({
          email: "",
          newPassword: "",
          confirmPassword: "",
        })
      }
    } catch (error) {
      toast.dismiss(toastId)
      const errorMsg =
        error?.response?.data?.message || error.message || "Failed to update password"
      toast.error(errorMsg)
      console.error("Error updating password:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#1c1c1e] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 xl:px-12 flex flex-col justify-center items-center w-full font-sans">
      <div className="w-full max-w-xl lg:max-w-6xl space-y-4 sm:space-y-6">
        {/* Top Navigation Bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("/login")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#c7cad5] text-[#1c1c1e] hover:bg-[#ebecf0] hover:border-[#1c1c1e] transition-all text-xs font-bold shadow-sm active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Login</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#fff4c4] border border-[#ffd02f]/60 text-[#746019]">
              Account Recovery
            </span>
            <span className="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#ffd02f] text-[#1c1c1e] shadow-xs">
              Security Desk
            </span>
          </div>
        </div>

        {/* 2-Column Wide Grid (Showcase hidden on mobile, visible on desktop) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          {/* Left Column: Security Recovery Showcase (Desktop only) */}
          <div className="hidden lg:flex lg:col-span-5 bg-[#1c1c1e] text-white rounded-3xl p-8 sm:p-10 flex-col justify-between border border-[#1c1c1e] shadow-md relative overflow-hidden">
            {/* Background ambient glow */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#ffd02f]/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[#187574]/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[#ffd02f] text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-[#ffd02f]" />
                <span>Protected Credentials</span>
              </div>

              <div className="space-y-3">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
                  Restore Access to Your Account
                </h2>
                <p className="text-sm text-[#a1a1aa] leading-relaxed">
                  Enter your registered academic email address to define a new secure password. Your account history, quiz records, and submissions remain completely intact.
                </p>
              </div>

              {/* Password Guidelines List */}
              <div className="space-y-3 pt-2">
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-start gap-3">
                  <span className="text-[#ffd02f] font-bold text-sm">01</span>
                  <div>
                    <p className="text-xs font-bold text-white">8+ Characters Length</p>
                    <p className="text-[11px] text-[#a1a1aa]">Include at least one uppercase, one lowercase letter, and a number.</p>
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-start gap-3">
                  <span className="text-[#ffd02f] font-bold text-sm">02</span>
                  <div>
                    <p className="text-xs font-bold text-white">Bcrypt One-Way Encryption</p>
                    <p className="text-[11px] text-[#a1a1aa]">Your credentials are salt-hashed before database persistence.</p>
                  </div>
                </div>
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-start gap-3">
                  <span className="text-[#34A853] font-bold text-sm">✓</span>
                  <div>
                    <p className="text-xs font-bold text-white">Instant Sign-In After Update</p>
                    <p className="text-[11px] text-[#a1a1aa]">Your new password is immediately active across all devices.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Support Note */}
            <div className="relative z-10 pt-8 mt-8 border-t border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-[#a1a1aa]">
                <span>Need support?</span>
                <button
                  onClick={() => navigate("/contact-us")}
                  className="text-[#ffd02f] hover:underline font-bold cursor-pointer"
                >
                  Contact Desk
                </button>
              </div>
              <span className="text-[11px] text-[#71717a]">CLYS 2.0</span>
            </div>
          </div>

          {/* Right Column: Main Reset Card (Full width on mobile) */}
          <div className="col-span-1 lg:col-span-7 bg-white rounded-3xl border border-[#c7cad5] shadow-sm p-6 sm:p-10 flex flex-col justify-between">
            {success ? (
              <div className="text-center py-10 space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-[#c3faf5] text-[#187574] flex items-center justify-center mx-auto border border-[#9eece4] shadow-sm">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div className="space-y-2">
                  <span className="px-3 py-1 bg-[#c3faf5] text-[#187574] text-[11px] font-black uppercase tracking-wider rounded-full">
                    CREDENTIALS UPDATED
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1c1c1e]">
                    Password Successfully Reset
                  </h2>
                  <p className="text-xs sm:text-sm text-[#555a6a] max-w-md mx-auto leading-relaxed">
                    Your account password has been updated securely. You can now use your new credentials to log in to CLYS.
                  </p>
                </div>

                <div className="pt-4 max-w-sm mx-auto">
                  <button
                    onClick={() => navigate("/login")}
                    className="w-full h-12 min-h-[48px] bg-[#ffd02f] hover:bg-[#fcb900] text-[#1c1c1e] font-extrabold text-sm rounded-full shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
                  >
                    <span>Return to Sign In</span>
                    <ArrowLeft className="w-4 h-4 rotate-180" />
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {/* Header */}
                <div className="space-y-1.5 mb-6">
                  <div className="w-11 h-11 rounded-2xl bg-[#ffd02f] text-[#1c1c1e] flex items-center justify-center shadow-xs mb-3">
                    <Lock className="w-5 h-5" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#1c1c1e]">
                    Reset Your Password
                  </h1>
                  <p className="text-xs sm:text-sm text-[#555a6a]">
                    Enter your verified account email and define a new secure password.
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Email Address */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#555a6a] block">
                      Registered Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555a6a] pointer-events-none" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="name@example.com"
                        className={`w-full h-11 min-h-[44px] pl-10 pr-4 bg-[#fffdf5] border rounded-xl focus:outline-none focus:ring-2 transition-all text-sm font-semibold text-[#1c1c1e] ${
                          errors.email
                            ? "border-[#800000] focus:ring-[#fbd4d4]"
                            : "border-[#c7cad5] focus:border-[#1c1c1e] focus:ring-[#ffd02f]/30"
                        }`}
                        required
                      />
                    </div>
                    {errors.email && (
                      <div className="flex items-center gap-1.5 text-xs text-[#800000] font-bold mt-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{errors.email}</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* New Password */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-[#555a6a] block">
                        New Password *
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555a6a] pointer-events-none" />
                        <input
                          type={showPassword.newPassword ? "text" : "password"}
                          name="newPassword"
                          value={formData.newPassword}
                          onChange={handleInputChange}
                          placeholder="Enter new password"
                          className={`w-full h-11 min-h-[44px] pl-10 pr-11 bg-white border rounded-xl focus:outline-none focus:ring-2 transition-all text-sm font-semibold text-[#1c1c1e] ${
                            errors.newPassword
                              ? "border-[#800000] focus:ring-[#fbd4d4]"
                              : "border-[#c7cad5] focus:border-[#1c1c1e] focus:ring-[#ffd02f]/30"
                          }`}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility("newPassword")}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#555a6a] hover:text-[#1c1c1e] transition-colors cursor-pointer"
                        >
                          {showPassword.newPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                      {/* Strength indicator */}
                      {formData.newPassword && (
                        <div className="space-y-1 pt-1">
                          <div className="flex space-x-1">
                            {[1, 2, 3].map((level) => (
                              <div
                                key={level}
                                className={`h-1.5 flex-1 rounded-full transition-all ${
                                  level <= passwordStrength.strength
                                    ? level === 1
                                      ? "bg-[#800000]"
                                      : level === 2
                                        ? "bg-[#ffd02f]"
                                        : "bg-[#187574]"
                                    : "bg-[#e0e2e8]"
                                }`}
                              />
                            ))}
                          </div>
                          <p className={`text-[11px] font-bold ${passwordStrength.color}`}>
                            {passwordStrength.text}
                          </p>
                        </div>
                      )}
                      {errors.newPassword && (
                        <div className="flex items-center gap-1.5 text-xs text-[#800000] font-bold mt-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{errors.newPassword}</span>
                        </div>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-[#555a6a] block">
                        Confirm New Password *
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555a6a] pointer-events-none" />
                        <input
                          type={showPassword.confirmPassword ? "text" : "password"}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          placeholder="Re-enter new password"
                          className={`w-full h-11 min-h-[44px] pl-10 pr-11 bg-white border rounded-xl focus:outline-none focus:ring-2 transition-all text-sm font-semibold text-[#1c1c1e] ${
                            errors.confirmPassword
                              ? "border-[#800000] focus:ring-[#fbd4d4]"
                              : passwordMatch === null
                                ? "border-[#c7cad5] focus:border-[#1c1c1e] focus:ring-[#ffd02f]/30"
                                : passwordMatch
                                  ? "border-[#9eece4] bg-[#f4fbfb] focus:ring-[#c3faf5]"
                                  : "border-[#e3c5c5] bg-[#fff8f8] focus:ring-[#fbd4d4]"
                          }`}
                          required
                        />
                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center space-x-2">
                          {passwordMatch !== null && (
                            <div className={passwordMatch ? "text-[#187574]" : "text-[#800000]"}>
                              {passwordMatch ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility("confirmPassword")}
                            className="text-[#555a6a] hover:text-[#1c1c1e] transition-colors cursor-pointer"
                          >
                            {showPassword.confirmPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                      {errors.confirmPassword && (
                        <div className="flex items-center gap-1.5 text-xs text-[#800000] font-bold mt-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{errors.confirmPassword}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-12 min-h-[48px] bg-[#ffd02f] hover:bg-[#fcb900] disabled:bg-[#f7f8fa] disabled:border disabled:border-[#c7cad5] disabled:text-[#8e92a4] disabled:cursor-not-allowed text-[#1c1c1e] font-extrabold text-sm rounded-full shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-[#1c1c1e]" />
                          <span>Updating Password...</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4" />
                          <span>Update Password</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* Footer Link */}
                <div className="text-center pt-4 border-t border-[#f0f2f5] mt-6">
                  <p className="text-xs text-[#555a6a]">
                    Remembered your password?{" "}
                    <button
                      type="button"
                      onClick={() => navigate("/login")}
                      className="text-[#4262ff] hover:underline font-bold cursor-pointer"
                    >
                      Return to Sign In
                    </button>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}