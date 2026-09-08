"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Eye, EyeOff, UserPlus, Lock, Mail, Check, X } from "lucide-react"
import toast from "react-hot-toast"
import { singup } from "../../../services/operations/authAPI"
import { googleLogin } from "../../../services/operations/googleauth"

export default function Signup() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    role: "user", // Only user role
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

    const toastId = toast.loading("Creating account...")

    try {
      const result = await singup(formData)
      
      if (result?.success) {
        toast.dismiss(toastId)
        toast.success("Registration successful!")
        navigate("/login")
      } else {
        toast.dismiss(toastId)
        toast.error(result?.message || "Registration failed!")
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "An error occurred during registration."

      toast.dismiss(toastId)
      toast.error(errorMessage)
      console.error("Registration failed:", error)
    }
  }

  const handleLoginClick = () => {
    navigate("/login")
  }

  const handleGoogleSignup = async () => {
    const toastId = toast.loading("Redirecting to Google...")
    
    try {
      // Since we only have user role, we always pass "user" to Google login
      await googleLogin("user")
      // The googleLogin function will handle the redirect
      // The OAuth handler will process the response
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || error.message || "Google signup error"
      toast.dismiss(toastId)
      toast.error(errorMessage)
      console.error("Google signup failed:", error)
    }
  }

  // Browser back to home 
  useEffect(() => {
    const handleBackButton = (event) => {
      event.preventDefault();
      navigate("/", { replace: true });
    };

    window.addEventListener("popstate", handleBackButton);

    return () => {
      window.removeEventListener("popstate", handleBackButton);
    };
  }, [navigate]);

  const getPasswordStrength = (password) => {
    if (password.length === 0) return { strength: 0, text: "", color: "" }
    if (password.length < 6) return { strength: 1, text: "Weak", color: "text-red-500" }
    if (password.length < 10) return { strength: 2, text: "Medium", color: "text-yellow-500" }
    return { strength: 3, text: "Strong", color: "text-green-500" }
  }

  const passwordStrength = getPasswordStrength(formData.password)

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl">
        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-6 sm:p-8 md:p-10 lg:p-12 mx-auto">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <UserPlus className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">User Sign Up</h1>
            <p className="text-sm sm:text-base text-gray-600">Create your new account</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 md:space-y-6">
            {/* User role is fixed, no selection needed */}
            <input type="hidden" name="role" value="user" />

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

          {/* Divider */}
          <div className="my-6 sm:my-8 flex items-center">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-3 text-xs sm:text-sm text-gray-500">Or continue with</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Google Signup Button */}
          <button
            onClick={handleGoogleSignup}
            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 text-gray-700 font-medium py-2 sm:py-3 px-6 rounded-xl shadow-md hover:shadow-lg hover:bg-gray-50 transform hover:scale-[1.02] transition-all duration-300 text-sm sm:text-base"
          >
            <svg className="h-5 w-5" viewBox="0 0 533.5 544.3">
              <path
                fill="#4285F4"
                d="M533.5 278.4c0-17.4-1.6-34.1-4.6-50.4H272v95.3h146.9c-6.4 34-25.3 62.8-53.9 82.1v68.2h87.1c51-47 80.4-116.2 80.4-195.2z"
              />
              <path
                fill="#34A853"
                d="M272 544.3c72.6 0 133.6-24.1 178.1-65.4l-87.1-68.2c-24.2 16.2-55.3 25.8-91 25.8-69.9 0-129.2-47.1-150.4-110.5H32.9v69.4C77.5 475.6 167.3 544.3 272 544.3z"
              />
              <path
                fill="#FBBC04"
                d="M121.6 325.9c-10.4-30.8-10.4-64.2 0-94.9V161.6H32.9c-34 68-34 150.7 0 218.7l88.7-54.4z"
              />
              <path
                fill="#EA4335"
                d="M272 107.7c39.5-.6 77.5 13.9 106.4 40.7l79.4-79.4C411.1 24.5 343.5 0 272 0 167.3 0 77.5 68.7 32.9 161.6l88.7 69.4C142.8 154.8 202.1 107.7 272 107.7z"
              />
            </svg>
            Sign up with Google
          </button>

          {/* Login Link */}
          <div className="mt-6 sm:mt-8 text-center">
            <p className="text-xs sm:text-sm text-gray-600">
              Already have an account?{" "}
              <button
                onClick={handleLoginClick}
                className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors duration-200"
              >
                Login
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}