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
      const isScrolled = window.scrollY > 30
      setScrolled(isScrolled)
      if (isScrolled) {
        setIsOpen(false)
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
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
            className="font-medium text-sm lg:text-base text-gray-200 hover:text-white hover:bg-white/10"
          >
            Login
          </Button>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              size="sm"
              onClick={() => navigate("/signup")}
              className="bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:brightness-110 text-white font-medium px-4 lg:px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-sm lg:text-base"
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
          className="w-full text-gray-200 hover:text-white hover:bg-white/10"
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
      initial={{ y: 0, opacity: 1 }}
      animate={{
        y: scrolled ? -100 : 0,
        opacity: scrolled ? 0 : 1,
      }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={`fixed top-0 left-0 right-0 z-50 bg-transparent transition-all duration-300 ${
        scrolled ? "pointer-events-none" : ""
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
            <span className="text-xl md:text-2xl font-extrabold bg-gradient-to-r from-white via-gray-100 to-purple-300 bg-clip-text text-transparent">
              clys
            </span>
          </motion.div>

          {/* Desktop Unified Floating Pill Navigation */}
          <div className="hidden md:flex items-center">
            <div className="flex items-center gap-1 rounded-full bg-white/5 px-2 py-1.5 ring-1 ring-white/10 backdrop-blur-md shadow-lg shadow-black/30">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavClick(item.route, item.href)}
                  className="px-3.5 py-1.5 text-sm font-medium text-white/80 hover:text-white transition-colors rounded-full hover:bg-white/10 font-sans"
                >
                  {item.name}
                </button>
              ))}
              <button
                onClick={() => {
                  if (isLoggedIn) {
                    if (userRole === "admin") navigate("/admin/dashboard")
                    else if (userRole === "manager") navigate("/manager/dashboard")
                    else navigate("/user/dashboard")
                  } else {
                    navigate("/signup")
                  }
                }}
                className="ml-1 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-neutral-900 hover:bg-white/90 font-sans transition-all shadow"
              >
                <span>{isLoggedIn ? "Dashboard" : "Get Started"}</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <path d="M7 7h10v10" />
                  <path d="M7 17 17 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/15 backdrop-blur-md text-white"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
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
          className="lg:hidden overflow-hidden bg-[#090c18]/95 backdrop-blur-2xl rounded-2xl mt-2 border border-white/10 shadow-2xl"
        >
          <div className="px-4 py-6 space-y-4">
            {navItems.map((item) => (
              <motion.button
                key={item.name}
                onClick={() => handleNavClick(item.route, item.href)}
                whileHover={{ x: 6 }}
                className="block w-full text-left text-gray-200 hover:text-white font-medium transition-colors duration-300 py-2"
              >
                {item.name}
              </motion.button>
            ))}
            <div className="pt-4 border-t border-white/10 space-y-3">
              {renderMobileAuthButtons()}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.nav>
  )
}