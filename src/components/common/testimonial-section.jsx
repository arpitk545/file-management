"use client"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Star, Quote, Users, TrendingUp } from "lucide-react"
import { Card, CardContent } from "../ui/card"
import { getAllComments } from "../../services/operations/commentAPI"
//import toast from "react-hot-toast"
// Responsive configuration
  const responsiveConfig = {
    breakpoints: {
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
    },
    itemsPerSlide: {
      base: 1,
      sm: 1,
      md: 2,
      lg: 3,
      xl: 3,
    },
    spacing: {
      base: 16,
      sm: 20,
      md: 24,
      lg: 28,
      xl: 32,
    }
  };

export default function TestimonialsSection() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [windowWidth, setWindowWidth] = useState(0);
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
async function fetchComments() {
  setLoading(true);
  try {
    const response = await getAllComments();
    // Validate the response structure
    if (!response) {
      throw new Error("No response received from server");
    }

    if (!response.success) {
      throw new Error(response.message || "Failed to fetch comments");
    }

    const commentsData = Array.isArray(response.comments?.comments)? response.comments.comments: [];

    const approvedComments = commentsData.filter(
      (comment) => comment?.status === "approved"
    );
    const transformedComments = approvedComments.map(comment => {
      // Safely extract user profile with defaults
      const userProfile = {
        name: comment.userProfile?.name || "Anonymous",
        avatar: comment.userProfile?.avatar || null,
        initials: comment.userProfile?.initials || 
                 (comment.userProfile?.name ? 
                  comment.userProfile.name.charAt(0).toUpperCase() : "A"),
        email: comment.userProfile?.email || null
      };

      return {
        ...comment,
        id: comment._id || `temp-${Math.random().toString(36).substr(2, 9)}`,
        userProfile,
        rating: typeof comment.rating === 'number' ? comment.rating : 4,
        category: comment.category || "General",
        content: comment.content || "No content provided",
        title: comment.title || "Student",
        createdAt: comment.createdAt || new Date().toISOString()
      };
    });

    setComments(transformedComments);
    
  } catch (error) {
    console.error("Error fetching comments:", error);
    setComments([]); 
  } finally {
    setLoading(false);
  }
}
    fetchComments();
  }, []);

  // Calculate average rating and success rate
  const averageRating = comments.length > 0 
    ? (comments.reduce((sum, comment) => sum + (comment.rating || 4), 0) / comments.length).toFixed(1)
    : "4.9";

  const successRate = comments.length > 0 
    ? `${Math.round((averageRating / 5) * 100)}%`
    : "95%";

  const stats = [
    { value: "50,000+", label: "Happy Students", icon: Users },
    { value: successRate, label: "Success Rate", icon: TrendingUp },
    { value: `${averageRating}/5`, label: "Average Rating", icon: Star },
  ];

  
  const [currentItemsPerSlide, setCurrentItemsPerSlide] = useState(responsiveConfig.itemsPerSlide.base);
  const [currentSpacing, setCurrentSpacing] = useState(responsiveConfig.spacing.base);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setWindowWidth(width);

      if (width < responsiveConfig.breakpoints.sm) {
        setCurrentItemsPerSlide(responsiveConfig.itemsPerSlide.base);
        setCurrentSpacing(responsiveConfig.spacing.base);
      } else if (width < responsiveConfig.breakpoints.md) {
        setCurrentItemsPerSlide(responsiveConfig.itemsPerSlide.sm);
        setCurrentSpacing(responsiveConfig.spacing.sm);
      } else if (width < responsiveConfig.breakpoints.lg) {
        setCurrentItemsPerSlide(responsiveConfig.itemsPerSlide.md);
        setCurrentSpacing(responsiveConfig.spacing.md);
      } else if (width < responsiveConfig.breakpoints.xl) {
        setCurrentItemsPerSlide(responsiveConfig.itemsPerSlide.lg);
        setCurrentSpacing(responsiveConfig.spacing.lg);
      } else {
        setCurrentItemsPerSlide(responsiveConfig.itemsPerSlide.xl);
        setCurrentSpacing(responsiveConfig.spacing.xl);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const totalSlides = Math.max(1, Math.ceil(comments.length / currentItemsPerSlide));

  useEffect(() => {
    if (!isAutoPlaying || hoveredCard !== null || comments.length === 0) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 5000);

    return () => clearInterval(timer);
  }, [totalSlides, isAutoPlaying, currentItemsPerSlide, hoveredCard, comments.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const getCurrentTestimonials = () => {
    const startIndex = currentSlide * currentItemsPerSlide;
    const endIndex = startIndex + currentItemsPerSlide;
    const currentTestimonials = comments.slice(startIndex, endIndex);
   // console.log(`Displaying testimonials ${startIndex}-${endIndex}:`, currentTestimonials);
    return currentTestimonials;
  };

  // Responsive padding calculations
  const sectionPadding = {
    py: windowWidth < responsiveConfig.breakpoints.md ? 'py-12' : 'py-20',
    px: windowWidth < responsiveConfig.breakpoints.md ? 'px-4' : 'px-6'
  };

  if (loading) {
    return (
      <section className={`${sectionPadding.py} ${sectionPadding.px} bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 relative overflow-hidden`}>
        <div className="container mx-auto relative z-10 text-center">
          <div className="animate-pulse flex flex-col items-center justify-center h-64">
            <div className="h-8 w-48 bg-purple-200 rounded mb-4"></div>
            <div className="h-4 w-64 bg-purple-100 rounded mb-8"></div>
            <div className="flex space-x-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 w-full bg-white rounded-lg shadow"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (comments.length === 0) {
    return (
      <section className={`${sectionPadding.py} ${sectionPadding.px} bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 relative overflow-hidden`}>
        <div className="container mx-auto relative z-10 text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 max-w-2xl mx-auto shadow-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4">No Testimonials Yet</h3>
            <p className="text-gray-600 mb-6">Be the first to share your experience!</p>
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors">
              Share Your Story
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`${sectionPadding.py} ${sectionPadding.px} bg-gradient-to-br from-white via-blue-100 to-purple-200 relative overflow-hidden`}>
      {/* Background Elements */}
      <motion.div
        className="absolute top-10 left-10 w-64 h-64 bg-gradient-to-br from-purple-200/20 to-pink-200/20 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 180, 360],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute bottom-10 right-10 w-80 h-80 bg-gradient-to-br from-blue-200/20 to-cyan-200/20 rounded-full blur-3xl"
        animate={{
          scale: [1.2, 1, 1.2],
          rotate: [360, 180, 0],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      />

      <div className="container mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "0px 0px -100px 0px" }}
          className="text-center mb-8 md:mb-12"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="inline-flex items-center bg-gradient-to-r from-purple-100 to-pink-100 rounded-full px-4 md:px-6 py-2 md:py-3 mb-4 md:mb-6"
          >
            <Quote className="h-4 w-4 md:h-5 md:w-5 text-purple-600 mr-2" />
            <span className="text-purple-600 font-semibold text-sm md:text-base">Student Success Stories</span>
          </motion.div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 md:mb-6">
            What Students{" "}
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
              Say About Us
            </span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Join thousands of students who have transformed their academic journey and achieved remarkable success with
            our comprehensive learning platform.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true, margin: "0px 0px -50px 0px" }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-8 md:mb-12"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.03, y: -5 }}
              className="text-center bg-white/60 backdrop-blur-sm rounded-xl md:rounded-2xl p-4 sm:p-6 shadow-lg border border-white/20"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg sm:rounded-xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <stat.icon className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-white" />
              </div>
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">{stat.value}</div>
              <div className="text-gray-600 font-medium text-xs sm:text-sm md:text-base">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Testimonials Slider */}
        <div className="relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            viewport={{ once: true, margin: "0px 0px -50px 0px" }}
            className="relative overflow-hidden"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: 300 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -300 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className={`grid gap-4 sm:gap-6 md:gap-8 mb-2 ${
                  currentItemsPerSlide === 1 ? "grid-cols-1" :
                  currentItemsPerSlide === 2 ? "grid-cols-1 sm:grid-cols-2" :
                  "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                }`}
                style={{ gap: `${currentSpacing}px` }}
              >
                {getCurrentTestimonials().map((testimonial, index) => {
                  try {
                    return (
                      <motion.div
                        key={`${currentSlide}-${testimonial.id || index}`}
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                        whileHover={{
                          scale: 1.02,
                          rotateY: 2,
                          boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.15)",
                        }}
                        className="group cursor-pointer h-full"
                        onMouseEnter={() => setHoveredCard(testimonial.id)}
                        onMouseLeave={() => setHoveredCard(null)}
                      >
                        <Card className="h-full border-0 shadow-md hover:shadow-xl transition-all duration-300 rounded-xl sm:rounded-2xl overflow-hidden bg-white/80 backdrop-blur-sm">
                          <CardContent className="p-4 sm:p-6 md:p-8 relative h-full flex flex-col">
                            {/* Quote Icon */}
                            <motion.div
                              className="absolute top-3 right-3 sm:top-4 sm:right-4 w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center opacity-20 group-hover:opacity-40 transition-opacity duration-300"
                              whileHover={{ rotate: 15, scale: 1.1 }}
                            >
                              <Quote className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                            </motion.div>

                            {/* Profile */}
                            <div className="flex items-center mb-4 sm:mb-6 mt-6 sm:mt-8">
                              {testimonial.userProfile?.avatar ? (
                                <motion.div
                                  className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-lg sm:rounded-xl mr-3 sm:mr-4 overflow-hidden"
                                  whileHover={{ scale: 1.05, rotate: 2 }}
                                >
                                  <img 
                                    src={testimonial.userProfile.avatar} 
                                    alt={testimonial.userProfile.name} 
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23EEE'/%3E%3Ctext x='50%' y='50%' font-size='40' fill='%23AAA' text-anchor='middle' dominant-baseline='middle'%3E" + 
                                      (testimonial.userProfile?.initials || "U") + "%3C/text%3E%3C/svg%3E";
                                    }}
                                  />
                                </motion.div>
                              ) : (
                                <motion.div
                                  className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-lg sm:rounded-xl mr-3 sm:mr-4 bg-gradient-to-br from-purple-200 to-pink-200 flex items-center justify-center text-purple-600 font-bold text-lg border-2 border-purple-200 group-hover:border-purple-400 transition-colors duration-300"
                                  whileHover={{ scale: 1.05, rotate: 2 }}
                                >
                                  {testimonial.userProfile?.initials || "A"}
                                </motion.div>
                              )}
                              <div className="flex-1">
                                <h4 className="font-bold text-gray-900 text-sm sm:text-base md:text-lg group-hover:text-purple-600 transition-colors duration-300">
                                  {testimonial.userProfile?.name || "Anonymous"}
                                </h4>
                                <p className="text-xs text-gray-600 mb-1">{testimonial.title}</p>
                                <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded-full font-medium">
                                  {testimonial.category}
                                </span>
                              </div>
                            </div>

                            {/* Rating */}
                            <div className="flex mb-4 sm:mb-6">
                              {[...Array(5)].map((_, i) => (
                                <motion.div
                                  key={i}
                                  initial={{ opacity: 0.8, scale: 0.9 }}
                                  whileInView={{ opacity: 1, scale: 1 }}
                                  transition={{ duration: 0.3, delay: i * 0.1 }}
                                  whileHover={{ scale: 1.1, rotate: 10 }}
                                  className="mr-1"
                                >
                                  <Star className={`h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 ${i < (testimonial.rating || 0) ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
                                </motion.div>
                              ))}
                            </div>

                            {/* Quote */}
                            <motion.p
                              className="text-gray-700 leading-relaxed italic group-hover:text-gray-800 transition-colors duration-300 flex-1 text-xs sm:text-sm md:text-base"
                              initial={{ opacity: 0.8 }}
                              whileHover={{ opacity: 1 }}
                            >
                              "{testimonial.content}"
                            </motion.p>

                            {/* Hover Effect */}
                            <motion.div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl sm:rounded-2xl" />
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  } catch (error) {
                    console.error("Error rendering testimonial:", error, testimonial);
                    return null;
                  }
                })}
              </motion.div>
            </AnimatePresence>

            {/* Navigation Arrows */}
            {totalSlides > 1 && (
              <>
                <motion.button
                  onClick={prevSlide}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute left-1 sm:left-2 md:left-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-700 hover:bg-white shadow-md hover:shadow-lg transition-all duration-300 z-10"
                  aria-label="Previous testimonial"
                >
                  <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </motion.button>

                <motion.button
                  onClick={nextSlide}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute right-1 sm:right-2 md:right-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-700 hover:bg-white shadow-md hover:shadow-lg transition-all duration-300 z-10"
                  aria-label="Next testimonial"
                >
                  <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </motion.button>
              </>
            )}
          </motion.div>

          {/* Slide Indicators */}
          {totalSlides > 1 && (
            <div className="flex justify-center mt-6 sm:mt-8 space-x-2">
              {Array.from({ length: totalSlides }).map((_, index) => (
                <motion.button
                  key={index}
                  onClick={() => {
                    setCurrentSlide(index);
                    setIsAutoPlaying(false);
                    setTimeout(() => setIsAutoPlaying(true), 10000);
                  }}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.8 }}
                  className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
                    index === currentSlide 
                      ? "bg-purple-600 shadow-md" 
                      : "bg-gray-300 hover:bg-gray-400"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true, margin: "0px 0px -50px 0px" }}
          className="text-center mt-8 sm:mt-12"
        >
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
            const token = window.localStorage.getItem("token");
             if (!token) {
            window.location.href = "/login";
            }else{
               window.location.href = "/dashboard";
            }
            }}
            className="inline-flex items-center bg-gradient-to-r from-purple-600 to-pink-600 text-white px-5 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group text-sm sm:text-base"
          >
            <Users className="h-4 w-4 sm:h-5 sm:w-5 mr-2 group-hover:scale-110 transition-transform duration-300" />
            Join Our Success Community
            <motion.div
              className="ml-2"
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              →
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}