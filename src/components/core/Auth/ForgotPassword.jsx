"use client"

import { useState } from "react"
import { Eye, EyeOff, Mail, Lock, AlertCircle, CheckCircle, ChevronLeft } from "lucide-react"
import { Button } from "../../ui/button"
import { Input } from "../../ui/input"
import { forgotPasswordNew } from "../../../services/operations/authAPI"

const ForgotPassword = () => {
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

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required"
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    // Password validation
    if (!formData.newPassword) {
      newErrors.newPassword = "New password is required"
    } else if (!passwordRegex.test(formData.newPassword)) {
      newErrors.newPassword = "Password must be at least 8 characters with uppercase, lowercase, and number"
    }

    // Confirm password validation
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

    // Clear error when user starts typing
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

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!validateForm()) {
    return;
  }

  setIsSubmitting(true);

  try {
    const response = await forgotPasswordNew({
      email: formData.email,
      newPassword: formData.newPassword,
      confirmNewPassword: formData.confirmPassword,
    });
    setSuccess(true);
    
    // Reset form
    setFormData({
      email: "",
      newPassword: "",
      confirmPassword: "",
    });
  } catch (error) {
    console.error("Error updating password:", error);
  } finally {
    setIsSubmitting(false);
  }
};

  const handleCancel = () => {
    setFormData({
      email: "",
      newPassword: "",
      confirmPassword: "",
    })
    setErrors({})
    setSuccess(false)
    // Navigate back or close modal
    window.history.back()
  }

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, text: "", color: "" }

    let strength = 0
    if (password.length >= 8) strength++
    if (/[a-z]/.test(password)) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/\d/.test(password)) strength++
    if (/[@$!%*?&]/.test(password)) strength++

    const strengthLevels = [
      { text: "Very Weak", color: "bg-red-500" },
      { text: "Weak", color: "bg-orange-500" },
      { text: "Fair", color: "bg-yellow-500" },
      { text: "Good", color: "bg-blue-500" },
      { text: "Strong", color: "bg-green-500" },
    ]

    return {
      strength: (strength / 5) * 100,
      text: strengthLevels[Math.min(strength - 1, 4)]?.text || "Very Weak",
      color: strengthLevels[Math.min(strength - 1, 4)]?.color || "bg-red-500",
    }
  }

  const passwordStrength = getPasswordStrength(formData.newPassword)

  return (
    <div className="fixed inset-0 overflow-auto bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-md mx-auto">
        {/* Main Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Header with back button */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6">
            <button
              onClick={handleCancel}
              className="flex items-center text-white/90 hover:text-white transition-colors mb-4"
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              <span className="text-sm font-medium">Back</span>
            </button>
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Reset Password</h1>
                <p className="text-white/80 text-sm">
                  Secure your account with a new password
                </p>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6 md:p-8 space-y-6">
            {success ? (
              <div className="text-center py-8">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Password Updated!</h3>
                <p className="text-gray-600 mb-6">
                  Your password has been successfully updated. You can now log in with your new password.
                </p>
                <Button
                  onClick={handleCancel}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                >
                  Return to Login
                </Button>
              </div>
            ) : (
              <>
                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Email Field */}
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute rounded-2xl inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`pl-10 ${errors.email ? "rounded-2xl border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-2xl border-2"}`}
                        placeholder="your@email.com"
                        aria-describedby={errors.email ? "email-error" : undefined}
                      />
                    </div>
                    {errors.email && (
                      <div id="email-error" className="flex items-center space-x-1 text-red-600 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        <span>{errors.email}</span>
                      </div>
                    )}
                  </div>

                  {/* New Password Field */}
                  <div className="space-y-2">
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                      New Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 rounded-2xl flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <Input
                        id="newPassword"
                        name="newPassword"
                        type={showPassword.newPassword ? "text" : "password"}
                        value={formData.newPassword}
                        onChange={handleInputChange}
                        className={`pl-10 pr-10 ${errors.newPassword ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-2xl border-2"}`}
                        placeholder="••••••••"
                        aria-describedby={errors.newPassword ? "newPassword-error" : undefined}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => togglePasswordVisibility("newPassword")}
                      >
                        {showPassword.newPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        )}
                      </button>
                    </div>

                    {/* Password Strength Indicator */}
                    {formData.newPassword && (
                      <div className="space-y-2 pt-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">Password Strength</span>
                          <span
                            className={`font-medium ${passwordStrength.strength >= 80 ? "text-green-600" : passwordStrength.strength >= 60 ? "text-blue-600" : passwordStrength.strength >= 40 ? "text-yellow-600" : "text-red-600"}`}
                          >
                            {passwordStrength.text}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                            style={{ width: `${passwordStrength.strength}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500">
                          Must be at least 8 characters with uppercase, lowercase, and number
                        </p>
                      </div>
                    )}

                    {errors.newPassword && (
                      <div id="newPassword-error" className="flex items-center space-x-1 text-red-600 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        <span>{errors.newPassword}</span>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password Field */}
                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showPassword.confirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className={`pl-10 pr-10 ${errors.confirmPassword ? "border-red-500 focus:border-red-500 focus:ring-red-500" : formData.confirmPassword && formData.newPassword === formData.confirmPassword ? "border-green-500 focus:border-green-500 focus:ring-green-500" : "border-gray-300 focus:border-purple-500 focus:ring-purple-500 rounded-2xl border-2"}`}
                        placeholder="••••••••"
                        aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => togglePasswordVisibility("confirmPassword")}
                      >
                        {showPassword.confirmPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        )}
                      </button>
                    </div>

                    {/* Password Match Indicator */}
                    {formData.confirmPassword && (
                      <div className="flex items-center space-x-1 text-sm pt-1">
                        {formData.newPassword === formData.confirmPassword ? (
                          <>
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-green-600">Passwords match</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-4 h-4 text-red-600" />
                            <span className="text-red-600">Passwords do not match</span>
                          </>
                        )}
                      </div>
                    )}

                    {errors.confirmPassword && (
                      <div id="confirmPassword-error" className="flex items-center space-x-1 text-red-600 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        <span>{errors.confirmPassword}</span>
                      </div>
                    )}
                  </div>

                  {/* Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium py-3 px-6 rounded-2xl transition-all duration-200 transform hover:scale-[1.02] focus:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Updating...</span>
                        </div>
                      ) : (
                        "Update Password"
                      )}
                    </Button>
                  </div>
                </form>

                {/* Security Note */}
                <div className="text-center pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    <Lock className="inline w-3 h-3 mr-1" />
                    Your password will be encrypted and stored securely
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Additional Help - Only shown when not in success state */}
        {!success && (
          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              Need help?{" "}
              <a href="#" className="text-purple-600 hover:text-purple-700 font-medium hover:underline">
                Contact Support
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ForgotPassword