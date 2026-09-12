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
    <div className="min-h-screen bg-[#f7f8fa] text-[#1c1c1e] py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center w-full font-sans">
      <div className="w-full max-w-lg space-y-6">
        {/* Top Navigation Bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("/login")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#c7cad5] text-[#1c1c1e] hover:bg-[#ebecf0] hover:border-[#1c1c1e] transition-all text-xs font-bold shadow-sm active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Login</span>
          </button>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#ffd02f] text-[#1c1c1e] shadow-xs">
            SECURITY DESK
          </span>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl border border-[#c7cad5] shadow-sm p-6 sm:p-8 space-y-6">
          {success ? (
            <div className="text-center py-6 space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-[#c3faf5] text-[#187574] flex items-center justify-center mx-auto border border-[#9eece4] shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <span className="px-3 py-1 bg-[#c3faf5] text-[#187574] text-[11px] font-black uppercase tracking-wider rounded-full">
                  CREDENTIALS UPDATED
                </span>
                <h2 className="text-2xl font-extrabold tracking-tight text-[#1c1c1e]">
                  Password Successfully Reset
                </h2>
                <p className="text-xs sm:text-sm text-[#555a6a] max-w-sm mx-auto leading-relaxed">
                  Your account password has been updated securely. You can now use your new credentials to log in to CLYS.
                </p>
              </div>

              <div className="pt-2">
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
            <>
              {/* Header */}
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-[#ffd02f] text-[#1c1c1e] flex items-center justify-center mx-auto shadow-sm">
                  <Lock className="w-6 h-6" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-[#1c1c1e]">
                  Reset Your Password
                </h1>
                <p className="text-xs sm:text-sm text-[#555a6a]">
                  Enter your verified account email and define a new secure password
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
                      placeholder="Enter new password (min. 8 chars)"
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
                      {showPassword.newPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password Strength Indicator */}
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
                      <p className={`text-xs font-bold ${passwordStrength.color}`}>
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
                      placeholder="Confirm new password"
                      className={`w-full h-11 min-h-[44px] pl-10 pr-11 bg-white border rounded-xl focus:outline-none focus:ring-2 transition-all text-sm font-semibold text-[#1c1c1e] ${
                        passwordMatch === null
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
                        {showPassword.confirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  {passwordMatch === false && (
                    <p className="text-xs text-[#800000] font-bold">Passwords do not match</p>
                  )}
                  {errors.confirmPassword && (
                    <div className="flex items-center gap-1.5 text-xs text-[#800000] font-bold mt-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.confirmPassword}</span>
                    </div>
                  )}
                </div>

                {/* Submit Action */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting || !formData.email || !formData.newPassword || passwordMatch === false}
                    className="w-full h-12 min-h-[48px] bg-[#ffd02f] hover:bg-[#fcb900] disabled:bg-[#f7f8fa] disabled:border disabled:border-[#c7cad5] disabled:text-[#8e92a4] disabled:cursor-not-allowed text-[#1c1c1e] font-extrabold text-sm rounded-full shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
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

              {/* Security Footnote */}
              <div className="pt-3 border-t border-[#e6e8ec] text-center">
                <p className="text-[11px] text-[#6a6d7c] flex items-center justify-center gap-1.5 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#187574]" />
                  <span>Passwords are hashed and securely protected end-to-end</span>
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer Support Link */}
        <div className="text-center">
          <p className="text-xs text-[#6a6d7c]">
            Need further assistance?{" "}
            <button
              onClick={() => navigate("/contact-us")}
              className="font-bold text-[#4262ff] hover:underline cursor-pointer"
            >
              Contact Support
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}