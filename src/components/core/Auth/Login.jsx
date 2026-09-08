"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Eye, EyeOff, User, Lock, Mail } from "lucide-react" 
import toast from "react-hot-toast"
import { login } from "../../../services/operations/authAPI"
import { googleLogin } from "../../../services/operations/googleauth"

export default function Login() {
  const [formData, setFormData] = useState({
    role: "",
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const toastId = toast.loading("Logging in...")

    try {
      const result = await login(formData)

      if (result?.success) {
        localStorage.setItem("token", result.token)
        localStorage.setItem("user", JSON.stringify(result.user))

        toast.dismiss(toastId)
        toast.success("Login successful!")

        const role = result.user.role

        setTimeout(() => {
          if (role === "admin") {
            window.location.href = "/admin/dashboard"
          } else if (role === "manager") {
            window.location.href = "/manager/dashboard"
          } else if (role === "user") {
            window.location.href = "/user/dashboard"
          } else {
            window.location.href = "/"
          }
        }, 200)
      } else {
        toast.dismiss(toastId)
        toast.error(result?.message || "Login failed")
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || error.message || "Login error"
      toast.dismiss(toastId)
      toast.error(errorMessage)
      console.error("Login failed:", error)
    }
  }

  const handleRegisterClick = () => {
    navigate("/signup")
  }
   
  // Browser back to home 
  useEffect(() => {
    const handleBackButton = (event) => {
      event.preventDefault()
      navigate("/", { replace: true }) 
    }

    window.addEventListener("popstate", handleBackButton)
    return () => {
      window.removeEventListener("popstate", handleBackButton)
    }
  }, [navigate])

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl">
        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-6 sm:p-8 md:p-10 lg:p-12 mx-auto">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <User className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">Welcome Back</h1>
            <p className="text-sm sm:text-base text-gray-600">Sign in to your account</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 md:space-y-6">
            {/* Role Selection */}
            <div className="space-y-2 sm:space-y-3">
              <label className="text-xs sm:text-sm font-medium text-gray-700 block">Select Role</label>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {["admin", "manager", "user"].map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, role }))}
                    className={`px-3 py-2 sm:px-4 sm:py-3 rounded-xl border-2 font-medium transition-all duration-300 text-xs sm:text-sm ${
                      formData.role === role
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    {role ? role.charAt(0).toUpperCase() + role.slice(1) : ""}
                  </button>
                ))}
              </div>
            </div>

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
                  className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-sm sm:text-base"
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
                  placeholder="Enter your password"
                  className="w-full pl-9 sm:pl-10 pr-11 sm:pr-12 py-2 sm:py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-sm sm:text-base"
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
            </div>

            {/* Forgot Password */}
            <div className="text-right">
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
              >
                Forgot Password?
              </button>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2 sm:py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 text-sm sm:text-base"
            >
              LogIn
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 sm:my-8 flex items-center">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-3 text-xs sm:text-sm text-gray-500">Or continue with</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Google Login Button */}
          <button
            onClick={() => googleLogin(formData.role || "user")}
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
            Login as a User with Google
          </button>

          {/* Register Link */}
          <div className="mt-6 sm:mt-8 text-center">
            <p className="text-xs sm:text-sm text-gray-600">
              Not registered?{" "}
              <button
                onClick={handleRegisterClick}
                className="text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-200"
              >
                Register
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}