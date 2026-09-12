"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Eye, EyeOff, UserPlus, Lock, Mail, Check, X, ArrowLeft } from "lucide-react"
import toast from "react-hot-toast"
import { singup } from "../../../services/operations/authAPI"

export default function Register() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    role: "manager", 
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordMatch, setPasswordMatch] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Check password match
    if (name === "confirmPassword" || name === "password") {
      const password = name === "password" ? value : formData.password
      const confirmPassword = name === "confirmPassword" ? value : formData.confirmPassword

      if (confirmPassword) {
        setPasswordMatch(password === confirmPassword)
      } else {
        setPasswordMatch(null)
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!")
      return
    }

    setIsLoading(true)
    try {
      const result = await singup(formData) 

      if (result?.success) {
        toast.success("Manager account registered successfully!")
        navigate("/dashboard") 
      } else {
        toast.error(result?.message || "Registration failed!")
      }
    } catch (error) {
      console.error("Signup error:", error)
      toast.error("An error occurred during registration.")
    } finally {
      setIsLoading(false)
    }
  }

  const getPasswordStrength = (password) => {
    if (password.length === 0) return { strength: 0, text: "", color: "" }
    if (password.length < 6) return { strength: 1, text: "Weak", color: "text-[#800000]" }
    if (password.length < 10) return { strength: 2, text: "Medium", color: "text-[#746019]" }
    return { strength: 3, text: "Strong", color: "text-[#187574]" }
  }

  const passwordStrength = getPasswordStrength(formData.password)

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#1c1c1e] py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center w-full">
      <div className="w-full max-w-lg space-y-6">
        
        {/* Back navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("/dashboard")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#c7cad5] text-[#1c1c1e] hover:bg-[#f7f8fa] hover:border-[#1c1c1e] transition-all text-xs font-bold shadow-sm active:scale-95"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </button>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#ffd02f] text-[#1c1c1e]">
            MANAGER SETUP
          </span>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl border border-[#c7cad5] shadow-sm p-6 sm:p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-[#ffd02f] text-[#1c1c1e] flex items-center justify-center mx-auto shadow-sm">
              <UserPlus className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#1c1c1e]">
              Register Manager
            </h1>
            <p className="text-xs sm:text-sm text-[#555a6a]">
              Create operational administrative credentials for a team manager
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#555a6a] block">
                Manager Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555a6a] pointer-events-none" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="manager@domain.com"
                  className="w-full h-11 min-h-[44px] pl-10 pr-4 bg-[#fffdf5] border border-[#c7cad5] rounded-xl focus:border-[#1c1c1e] focus:ring-2 focus:ring-[#ffd02f]/30 focus:outline-none transition-all text-sm font-semibold text-[#1c1c1e]"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#555a6a] block">
                Temporary Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555a6a] pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Create a strong password"
                  className="w-full h-11 min-h-[44px] pl-10 pr-11 bg-white border border-[#c7cad5] rounded-xl focus:border-[#1c1c1e] focus:ring-2 focus:ring-[#ffd02f]/30 focus:outline-none transition-all text-sm font-semibold text-[#1c1c1e]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#555a6a] hover:text-[#1c1c1e] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {formData.password && (
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
                  <p className={`text-xs font-bold ${passwordStrength.color}`}>{passwordStrength.text}</p>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#555a6a] block">
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555a6a] pointer-events-none" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Re-enter password"
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
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-[#555a6a] hover:text-[#1c1c1e] transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              {passwordMatch === false && <p className="text-xs text-[#800000] font-bold">Passwords do not match</p>}
            </div>

            {/* Submit Button */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={!passwordMatch || !formData.email || !formData.password || isLoading}
                className="w-full h-12 min-h-[48px] bg-[#ffd02f] hover:bg-[#fcb900] disabled:bg-[#f7f8fa] disabled:border disabled:border-[#c7cad5] disabled:text-[#8e92a4] disabled:cursor-not-allowed text-[#1c1c1e] font-extrabold text-sm rounded-full shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#1c1c1e] border-t-transparent rounded-full animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <span>Create Manager Account</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}