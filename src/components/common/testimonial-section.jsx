"use client"

import React, { useState, useEffect } from "react"
import { Quote, Loader2, MessageSquareQuote } from "lucide-react"
import { getAllComments } from "../../services/operations/commentAPI"
import StaggerTestimonials from "../ui/stagger-testimonials"

export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchComments() {
      try {
        setIsLoading(true)
        const response = await getAllComments()
        if (response && response.success) {
          const raw = Array.isArray(response.comments?.comments)
            ? response.comments.comments
            : Array.isArray(response.comments)
            ? response.comments
            : []

          const approved = raw
            .filter((c) => c?.status === "approved" || !c?.status)
            .filter((c) => (c?.content || c?.comment || "").trim().length > 0)
            .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))

          if (approved.length > 0) {
            const transformed = approved.map((c, idx) => ({
              tempId: c._id || idx,
              testimonial: c.content || c.comment,
              by: `${c.userProfile?.name || "Verified Student"}, ${
                typeof c.title === "string" && c.title.trim()
                  ? c.title
                  : typeof c.category === "string" && c.category.trim()
                  ? `${c.category} Contributor`
                  : "Active Member"
              }`,
              imgSrc:
                c.userProfile?.avatar ||
                `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                  c.userProfile?.name || "Student"
                )}`,
            }))

            setTestimonials(transformed)
          } else {
            setTestimonials([])
          }
        }
      } catch (err) {
        console.error("Failed to load live comments from backend:", err)
        setTestimonials([])
      } finally {
        setIsLoading(false)
      }
    }
    fetchComments()
  }, [])

  return (
    <section id="testimonials" className="py-24 sm:py-32 bg-white text-[#1c1c1e] relative overflow-hidden border-t border-[#e0e2e8]">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 relative z-10">
        {/* Header in Miro Style */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full bg-[#fff4c4] border border-[#ffd02f]/60 text-[#746019] mb-4 shadow-sm">
            <Quote className="w-3.5 h-3.5 text-[#fcb900]" />
            <span>Real Student & Community Reviews</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#1c1c1e] font-sans mb-3">
            Loved by Real Learners
          </h2>
          <p className="text-base sm:text-lg text-[#555a6a] max-w-xl mx-auto font-sans leading-relaxed">
            Real feedback from registered learners, academic contributors, and students actively using CLYS.
          </p>
        </div>

        {/* Dynamic State: Loading, Empty, or Real Database Testimonials */}
        {isLoading ? (
          <div className="w-full max-w-6xl mx-auto space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="relative overflow-hidden rounded-3xl bg-white border border-[#c7cad5] p-6 sm:p-8 shadow-sm flex flex-col justify-between min-h-[290px]"
                >
                  {/* Flash Light Beam Sweep Effect */}
                  <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none" />

                  <div className="space-y-5">
                    {/* Header Avatar & Reviewer Info Skeleton */}
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-full bg-[#e8edff] animate-pulse shrink-0" />
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-[#e0e2e8] rounded-full w-28 animate-pulse" />
                        <div className="h-3 bg-[#f0f2f5] rounded-full w-20 animate-pulse" />
                      </div>
                      <div className="w-8 h-8 rounded-xl bg-[#fff4c4] animate-pulse shrink-0" />
                    </div>

                    {/* Review Lines Skeleton */}
                    <div className="space-y-2.5 pt-2">
                      <div className="h-3.5 bg-[#e0e2e8] rounded-full w-full animate-pulse" />
                      <div className="h-3.5 bg-[#f0f2f5] rounded-full w-5/6 animate-pulse" />
                      <div className="h-3.5 bg-[#f0f2f5] rounded-full w-4/6 animate-pulse" />
                      <div className="h-3.5 bg-[#f0f2f5] rounded-full w-3/5 animate-pulse" />
                    </div>
                  </div>

                  {/* Footer Verified Status Skeleton */}
                  <div className="pt-4 border-t border-[#f0f2f5] flex items-center justify-between">
                    <div className="h-3.5 bg-[#c3faf5] rounded-full w-24 animate-pulse" />
                    <div className="h-3 bg-[#f0f2f5] rounded-full w-14 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-2 text-xs font-bold text-[#6a6d7c] pt-2">
              <span className="w-2 h-2 rounded-full bg-[#ffd02f] animate-ping" />
              <span>Fetching verified community feedback...</span>
            </div>
          </div>
        ) : testimonials.length > 0 ? (
          <div className="w-full">
            <StaggerTestimonials customTestimonials={testimonials} />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center text-[#555a6a] bg-[#f7f8fa] rounded-3xl border border-[#e0e2e8] max-w-xl mx-auto p-8">
            <MessageSquareQuote className="w-12 h-12 text-[#999eb0] mb-3 opacity-60" />
            <h4 className="text-lg font-bold text-[#1c1c1e] mb-1 font-sans">No reviews submitted yet</h4>
            <p className="text-sm text-[#555a6a] font-sans">
              Be the first learner or contributor to share your experience with our study resources!
            </p>
          </div>
        )}
      </div>
    </section>
  )
}