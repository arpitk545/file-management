"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "../ui/button"
import { Menu, X, GraduationCap } from "lucide-react"
import { useNavigate } from "react-router-dom"

export default function Navbar({ onNavigate }) {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userRole, setUserRole] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem("token")
    const user = localStorage.getItem("user")
    if (token && user) {
      setIsLoggedIn(true)
      try {
        const parsedUser = JSON.parse(user)
        setUserRole(parsedUser?.role)
      } catch (e) {
        console.error("Failed to parse user from localStorage", e)
      }
    } else {
      setIsLoggedIn(false)
      setUserRole(null)
    }

    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navItems = [
    { name: "Home", href: "#home", route: "home" },
    { name: "About", route: "/about-us" },
    { name: "Contact", route: "/contact-us" },
    { name: "Privacy & Policy", route: "/privacy-policy" },
    { name: "Disclaimer", route: "/disclaimer" },
  ]

  const handleNavClick = (route, href) => {
    if (route.startsWith("/")) {
      navigate(route);
    }
    else if (onNavigate) {
      onNavigate(route);
    } else {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
    setIsOpen(false);
  };

    const renderAuthButtons = () => {
    if (isLoggedIn && userRole) {
      let dashboardPath = "/"

      if (userRole === "admin") dashboardPath = "/admin/dashboard"
      else if (userRole === "manager") dashboardPath = "/manager/dashboard"
      else if (userRole === "user") dashboardPath = "/user/dashboard"

      return (
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            size="sm"
            onClick={() => navigate(dashboardPath)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium px-4 lg:px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-sm lg:text-base"
          >
            Go to Dashboard
          </Button>
        </motion.div>
      )
    } else {
      return (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/login")}
            className={`font-medium text-sm lg:text-base ${
              scrolled ? "text-gray-700 hover:text-purple-600" : "text-white hover:text-purple-200"
            }`}
          >
            Login
          </Button>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              size="sm"
              onClick={() => navigate("/signup")}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium px-4 lg:px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-sm lg:text-base"
            >
              Get Started
            </Button>
          </motion.div>
        </>
      )
    }
  }

  // Render mobile auth buttons based on auth status
const renderMobileAuthButtons = () => {
  if (isLoggedIn && userRole) {
    let dashboardPath = "/"
    if (userRole === "admin") dashboardPath = "/admin/dashboard"
    else if (userRole === "manager") dashboardPath = "/manager/dashboard"
    else if (userRole === "user") dashboardPath = "/user/dashboard"

    return (
      <Button 
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
        onClick={() => navigate(dashboardPath)}
      >
        Go to Dashboard
      </Button>
    )
  } else {
    return (
      <>
        <Button
          variant="ghost"
          className="w-full text-gray-700 hover:text-purple-600"
          onClick={() => navigate("/login")}
        >
          Login
        </Button>
        <Button 
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
          onClick={() => navigate("/signup")}
        >
          Get Started
        </Button>
      </>
    )
  }
}

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
       scrolled
  ? "bg-gradient-to-r from-gray-900 to-gray-800/90 backdrop-blur-md shadow-lg border-b border-gray-700/40"
  : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => handleNavClick("home", "#home")}
          >
            <div className="relative">
              <motion.div
                className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center"
                whileHover={{ rotate: 5 }}
                transition={{ duration: 0.3 }}
              >
                <GraduationCap className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </motion.div>
              <motion.div
                className="absolute -top-1 -right-1 w-3 h-3 md:w-4 md:h-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              />
            </div>
            <span
              className={`text-lg md:text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent ${
                scrolled ? "text-gray-900" : "text-white"
              }`}
            >
               clys
            </span>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            {navItems.map((item, index) => (
              <motion.button
                key={item.name}
                onClick={() => handleNavClick(item.route, item.href)}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`relative font-medium transition-colors duration-300 group text-sm xl:text-base ${
                  scrolled ? "text-gray-700 hover:text-purple-600" : "text-white hover:text-purple-200"
                }`}
                whileHover={{ y: -2 }}
              >
                {item.name}
                <motion.div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-600 to-pink-600 group-hover:w-full transition-all duration-300" />
              </motion.button>
            ))}
          </div>

          {/* CTA Buttons - Desktop */}
          <div className="hidden md:flex items-center space-x-3 lg:space-x-4">
            {renderAuthButtons()}
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(!isOpen)}
            className={`lg:hidden p-2 rounded-lg transition-colors duration-300 ${
              scrolled ? "text-gray-700 hover:bg-gray-100" : "text-white hover:bg-white/10"
            }`}
          >
            {isOpen ? <X className="h-5 w-5 md:h-6 md:w-6" /> : <Menu className="h-5 w-5 md:h-6 md:w-6" />}
          </motion.button>
        </div>

        {/* Mobile Menu */}
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{
            opacity: isOpen ? 1 : 0,
            height: isOpen ? "auto" : 0,
          }}
          transition={{ duration: 0.3 }}
          className="lg:hidden overflow-hidden bg-white/95 backdrop-blur-lg rounded-2xl mt-2 border border-gray-200/20"
        >
          <div className="px-4 py-6 space-y-4">
            {navItems.map((item) => (
              <motion.button
                key={item.name}
                onClick={() => handleNavClick(item.route, item.href)}
                whileHover={{ x: 10 }}
                className="block w-full text-left text-gray-700 hover:text-purple-600 font-medium transition-colors duration-300 py-2"
              >
                {item.name}
              </motion.button>
            ))}
            <div className="pt-4 border-t border-gray-200 space-y-3">
              {renderMobileAuthButtons()}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.nav>
  )
}