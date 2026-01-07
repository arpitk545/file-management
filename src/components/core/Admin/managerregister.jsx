"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Eye, EyeOff, UserPlus, Lock, Mail, Check, X } from "lucide-react"
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

  try {
    const result = await singup(formData) 

    if (result?.success) {
      toast.success("Registration successful!")
      navigate("/login") 
    } else {
      toast.error(result?.message || "Registration failed!")
    }
  } catch (error) {
    console.error("Signup error:", error)
    toast.error("An error occurred during registration.")
  }
}


//   const handleLoginClick = () => {
//     navigate("/login")
//   }

  const getPasswordStrength = (password) => {
    if (password.length === 0) return { strength: 0, text: "", color: "" }
    if (password.length < 6) return { strength: 1, text: "Weak", color: "text-red-500" }
    if (password.length < 10) return { strength: 2, text: "Medium", color: "text-yellow-500" }
    return { strength: 3, text: "Strong", color: "text-green-500" }
  }

  const passwordStrength = getPasswordStrength(formData.password)

  return (
    <div className="fixed inset-0 overflow-auto bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl">
        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-6 sm:p-8 md:p-10 lg:p-12 mx-auto">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <UserPlus className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Manager Sign Up</h1>
            <p className="text-sm sm:text-base text-gray-600">Create your new account</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 md:space-y-6">
            {/* Email Field */}
            <div className="space-y-1 sm:space-y-2">
              <label className="text-xs sm:text-sm font-medium text-gray-700 block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 text-sm sm:text-base"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1 sm:space-y-2">
              <label className="text-xs sm:text-sm font-medium text-gray-700 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Create a password"
                  className="w-full pl-9 sm:pl-10 pr-11 sm:pr-12 py-2 sm:py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 text-sm sm:text-base"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  {showPassword ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5" />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="space-y-1 sm:space-y-2">
                  <div className="flex space-x-1">
                    {[1, 2, 3].map((level) => (
                      <div
                        key={level}
                        className={`h-1 sm:h-2 flex-1 rounded-full transition-all duration-300 ${
                          level <= passwordStrength.strength
                            ? level === 1
                              ? "bg-red-500"
                              : level === 2
                                ? "bg-yellow-500"
                                : "bg-green-500"
                            : "bg-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs font-medium ${passwordStrength.color}`}>{passwordStrength.text}</p>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-1 sm:space-y-2">
              <label className="text-xs sm:text-sm font-medium text-gray-700 block">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm your password"
                  className={`w-full pl-9 sm:pl-10 pr-11 sm:pr-12 py-2 sm:py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 text-sm sm:text-base ${
                    passwordMatch === null
                      ? "border-gray-200 focus:ring-emerald-500"
                      : passwordMatch
                        ? "border-green-200 focus:ring-green-500 bg-green-50"
                        : "border-red-200 focus:ring-red-500 bg-red-50"
                  }`}
                  required
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1 sm:space-x-2">
                  {passwordMatch !== null && (
                    <div className={`${passwordMatch ? "text-green-500" : "text-red-500"}`}>
                      {passwordMatch ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5" />}
                  </button>
                </div>
              </div>
              {passwordMatch === false && <p className="text-xs text-red-500 font-medium">Passwords do not match</p>}
            </div>

            {/* Sign Up Button */}
            <button
              type="submit"
              disabled={!passwordMatch || !formData.email || !formData.password}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-semibold py-2 sm:py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:hover:scale-100 transition-all duration-300 text-sm sm:text-base"
            >
              Create Account
            </button>
          </form>

          {/* Login Link */}
          {/* <div className="mt-6 sm:mt-8 text-center">
            <p className="text-xs sm:text-sm text-gray-600">
              Already have an account?{" "}
              <button
                onClick={handleLoginClick}
                className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors duration-200"
              >
                Login
              </button>
            </p>
          </div> */}
        </div>

        {/* Decorative Elements */}
        <div className="fixed top-10 left-10 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full opacity-20 blur-xl"></div>
        <div className="fixed bottom-10 right-10 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full opacity-20 blur-xl"></div>
      </div>
    </div>
  )
}