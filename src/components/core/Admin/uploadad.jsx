"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  Save,
  Monitor,
  LayoutTemplate,
  Smartphone,
  Code,
  Info,
  CheckCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Layers,
  AlertTriangle
} from "lucide-react"
import { apiConnector } from "../../../services/apiconnector"
import { saveAdAPI } from "../../../services/apis"
import toast from "react-hot-toast"

export default function UploadAd() {
  const navigate = useNavigate()
  const [openCard, setOpenCard] = useState(null)
  const [category, setCategory] = useState("horizontal")
  const [adCode, setAdCode] = useState("")
  const [isSaved, setIsSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  const adTitles = [
    "Home Page",
    "Home File Page",
    "Home File Inside",
    "Inside Post",
    "Above Post",
    "Between Post and Comment",
    "Between File",
    "On the Files",
    "Between File and Comment",
    "Quiz Pages",
    "Inside Quiz",
    "Quiz Results",
    "Between Quiz Results and Comment",
    "Contest Pages",
    "Inside Contest",
    "Contest Result",
    "Between Contest Result and Comment"
  ]

  // Extract client and slot from adCode for preview
  const clientMatch = adCode.match(/data-ad-client=["']([^"']+)["']/)
  const slotMatch = adCode.match(/data-ad-slot=["']([^"']+)["']/)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!adCode) {
      toast.error("Please paste your AdSense code")
      return
    }
    
    if (!clientMatch || !slotMatch) {
      toast.error("Invalid AdSense code. Ensure it contains data-ad-client and data-ad-slot.")
      return
    }
    
    const client = clientMatch[1]
    const slot = slotMatch[1]

    setLoading(true)
    const loadingToast = toast.loading("Saving ad configuration...")

    try {
      const token = localStorage.getItem("token")
      await apiConnector(
        "POST",
        saveAdAPI,
        {
          title: openCard,
          format: category,
          client,
          slot
        },
        {
          Authorization: `Bearer ${token}`
        }
      )
      
      toast.success("Ad configuration saved successfully!", {
        id: loadingToast,
      })
      
      setIsSaved(true)
      setTimeout(() => setIsSaved(false), 3000)
    } catch (error) {
      console.error("Error saving ad:", error)
      toast.error(error.response?.data?.message || "Failed to save ad configuration", {
        id: loadingToast,
      })
    } finally {
      setLoading(false)
    }
  }

  const adFormats = [
    {
      id: "horizontal",
      name: "Horizontal Banner",
      icon: LayoutTemplate,
      desc: "Top or bottom placement (728x90 or responsive)"
    },
    {
      id: "vertical",
      name: "Vertical Sidebar",
      icon: Smartphone,
      desc: "Left/right column placement (300x600 skyscraper)"
    },
    {
      id: "square",
      name: "Square Unit",
      icon: Monitor,
      desc: "In-article & between content units (250x250 or 336x280)"
    }
  ]

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#1c1c1e] py-6 sm:py-8 px-4 sm:px-6 lg:px-8 xl:px-12 w-full">
      <div className="w-full space-y-6">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e0e2e8]">
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => navigate("/dashboard")}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#c7cad5] text-[#1c1c1e] hover:bg-[#f7f8fa] hover:border-[#1c1c1e] transition-all text-sm font-semibold shadow-sm active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </button>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#ffd02f] text-[#1c1c1e]">
              ADVERTISING STUDIO
            </span>
            <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#ffd8f4] text-[#86296b] border border-[#f3bee5]">
              ADSENSE ENGINE
            </span>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-[#c7cad5] text-xs font-bold text-[#1c1c1e]">
              <Layers className="w-3.5 h-3.5 text-[#4262ff]" />
              <span>{adTitles.length} Placements Available</span>
            </span>
          </div>
        </div>

        {/* Page Title */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#1c1c1e]">
            AdSense Configuration & Deployment
          </h1>
          <p className="text-sm sm:text-base text-[#555a6a]">
            Configure advertisement slots, inject responsive AdSense scripts, and manage monetization layouts across all curriculum zones.
          </p>
        </div>

        {/* Ad Placements Accordion List */}
        <div className="space-y-3">
          {adTitles.map((t, index) => {
            const isOpen = openCard === t
            return (
              <div
                key={t}
                className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden shadow-sm ${
                  isOpen ? "border-[#4262ff] shadow-md" : "border-[#c7cad5] hover:border-[#1c1c1e]"
                }`}
              >
                {/* Accordion Trigger Header */}
                <button
                  type="button"
                  onClick={() => {
                    if (isOpen) {
                      setOpenCard(null)
                    } else {
                      setOpenCard(t)
                      setAdCode("")
                      setCategory("horizontal")
                    }
                  }}
                  className={`w-full p-4 sm:p-5 flex items-center justify-between text-left transition-colors ${
                    isOpen ? "bg-[#f5f3ff]" : "bg-white hover:bg-[#fbfbfd]"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold flex-shrink-0 ${
                        isOpen
                          ? "bg-[#4262ff] text-white"
                          : "bg-[#f7f8fa] border border-[#c7cad5] text-[#1c1c1e]"
                      }`}
                    >
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <h3
                        className={`text-sm sm:text-base font-bold truncate ${
                          isOpen ? "text-[#4262ff]" : "text-[#1c1c1e]"
                        }`}
                      >
                        {t}
                      </h3>
                      <p className="text-xs text-[#555a6a] truncate hidden sm:block">
                        Slot location #{index + 1} • Deployment position
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                        isOpen
                          ? "bg-[#ffd02f] text-[#1c1c1e] border-[#fcb900]"
                          : "bg-[#f7f8fa] text-[#555a6a] border-[#e0e2e8]"
                      }`}
                    >
                      {isOpen ? "Editing Slot" : "Configure"}
                    </span>
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-[#4262ff]" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-[#555a6a]" />
                    )}
                  </div>
                </button>

                {/* Expanded Ad Slot Configuration Panel */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-[#e0e2e8] p-5 sm:p-7 space-y-6 bg-white"
                    >
                      {/* Step 1: Select Format */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <LayoutTemplate className="w-4 h-4 text-[#4262ff]" />
                          <h4 className="text-xs font-bold uppercase tracking-wider text-[#555a6a]">
                            1. Select Ad Format
                          </h4>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {adFormats.map((format) => {
                            const isSelected = category === format.id
                            const IconComponent = format.icon
                            return (
                              <button
                                key={format.id}
                                type="button"
                                onClick={() => !loading && setCategory(format.id)}
                                className={`p-4 rounded-xl border-2 text-left transition-all flex flex-col gap-2 ${
                                  isSelected
                                    ? "border-[#1c1c1e] bg-[#fffdf5] shadow-sm"
                                    : "border-[#c7cad5] bg-white hover:bg-[#f7f8fa]"
                                } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                              >
                                <div className="flex items-center justify-between">
                                  <div
                                    className={`p-2 rounded-lg ${
                                      isSelected
                                        ? "bg-[#ffd02f] text-[#1c1c1e]"
                                        : "bg-[#f7f8fa] text-[#555a6a]"
                                    }`}
                                  >
                                    <IconComponent className="w-5 h-5" />
                                  </div>
                                  {isSelected && (
                                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#1c1c1e] text-[#ffd02f]">
                                      Active
                                    </span>
                                  )}
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-[#1c1c1e]">
                                    {format.name}
                                  </p>
                                  <p className="text-xs text-[#555a6a] mt-0.5 leading-relaxed">
                                    {format.desc}
                                  </p>
                                </div>
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      {/* Step 2: AdSense Script Injection */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Code className="w-4 h-4 text-[#4262ff]" />
                            <h4 className="text-xs font-bold uppercase tracking-wider text-[#555a6a]">
                              2. AdSense Script Inject
                            </h4>
                          </div>
                          <span className="text-xs font-semibold text-[#555a6a]">
                            HTML / JS snippet
                          </span>
                        </div>
                        <div className="relative rounded-xl overflow-hidden border border-[#1c1c1e] bg-[#1c1c1e] shadow-inner">
                          <textarea
                            value={adCode}
                            onChange={(e) => setAdCode(e.target.value)}
                            disabled={loading}
                            rows={6}
                            placeholder={`<!-- Paste your Google AdSense code snippet here -->\n<ins class="adsbygoogle"\n     style="display:block"\n     data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"\n     data-ad-slot="XXXXXXXXXX"\n     data-ad-format="auto"></ins>\n<script>(adsbygoogle = window.adsbygoogle || []).push({});</script>`}
                            className="w-full p-4 bg-[#1c1c1e] text-[#ffd02f] font-mono text-xs sm:text-sm placeholder-[#6b6f7e] focus:outline-none resize-y min-h-[140px] leading-relaxed"
                          />
                        </div>
                        {adCode && adCode.length < 50 && (
                          <p className="text-xs text-[#b8860b] font-medium flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Code snippet seems short. Ensure both &lt;ins&gt; and &lt;script&gt; tags are included.</span>
                          </p>
                        )}
                      </div>

                      {/* Step 3: Verification & Save Row */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-2 border-t border-[#e0e2e8]">
                        {/* Status Diagnostics */}
                        <div className="lg:col-span-2 bg-[#f7f8fa] border border-[#e0e2e8] rounded-xl p-4 space-y-2.5">
                          <h5 className="text-xs font-bold uppercase tracking-wider text-[#555a6a]">
                            Diagnostics & Detection
                          </h5>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                            <div className="bg-white p-2.5 rounded-lg border border-[#e0e2e8]">
                              <span className="text-[#555a6a] block text-[11px]">Placement:</span>
                              <strong className="text-[#1c1c1e] truncate block">{t}</strong>
                            </div>
                            <div className="bg-white p-2.5 rounded-lg border border-[#e0e2e8]">
                              <span className="text-[#555a6a] block text-[11px]">Layout:</span>
                              <strong className="text-[#1c1c1e] capitalize block">{category}</strong>
                            </div>
                            <div className="bg-white p-2.5 rounded-lg border border-[#e0e2e8]">
                              <span className="text-[#555a6a] block text-[11px]">Code Status:</span>
                              {adCode.length > 10 ? (
                                <span className="font-bold text-[#187574] flex items-center gap-1">
                                  <CheckCircle className="w-3 h-3" /> Valid format
                                </span>
                              ) : (
                                <span className="text-[#b8860b] font-medium">Waiting for code</span>
                              )}
                            </div>
                          </div>

                          {clientMatch && slotMatch ? (
                            <div className="bg-[#c3faf5] border border-[#9eece4] rounded-lg p-2.5 text-xs text-[#187574] font-semibold space-y-0.5">
                              <p>✓ Detected Client: <code className="font-mono text-[#1c1c1e]">{clientMatch[1]}</code></p>
                              <p>✓ Detected Slot: <code className="font-mono text-[#1c1c1e]">{slotMatch[1]}</code></p>
                            </div>
                          ) : adCode.length > 10 ? (
                            <div className="bg-[#fbd4d4] border border-[#e3c5c5] rounded-lg p-2.5 text-xs text-[#800000] font-medium">
                              ⚠️ Could not detect data-ad-client or data-ad-slot. Please verify your AdSense snippet.
                            </div>
                          ) : null}
                        </div>

                        {/* Save Action */}
                        <div className="bg-[#fffdf5] border border-[#fde89c] rounded-xl p-4 flex flex-col items-center justify-center text-center space-y-3">
                          <div className="space-y-1">
                            <h5 className="text-sm font-bold text-[#1c1c1e]">
                              Save Placement
                            </h5>
                            <p className="text-xs text-[#555a6a]">
                              Deploy this ad unit immediately across the platform.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={!adCode.trim() || loading || !clientMatch || !slotMatch}
                            className="w-full h-11 min-h-[44px] rounded-full bg-[#ffd02f] hover:bg-[#fcb900] disabled:bg-gray-100 disabled:border disabled:border-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-[#1c1c1e] font-extrabold text-xs sm:text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
                          >
                            {loading ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin text-[#1c1c1e]" />
                                <span>Saving...</span>
                              </>
                            ) : isSaved ? (
                              <>
                                <CheckCircle className="w-4 h-4 text-[#187574]" />
                                <span>Saved Successfully!</span>
                              </>
                            ) : (
                              <>
                                <Save className="w-4 h-4 text-[#1c1c1e]" />
                                <span>Deploy Ad Unit</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>

        {/* AdSense Instructions Guide Card */}
        <div className="bg-[#f5f3ff] rounded-2xl border border-[#ddd6fe] shadow-sm p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-[#ddd6fe]">
            <div className="p-2 rounded-xl bg-[#4262ff] text-white">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#1c1c1e]">
                How to generate your Google AdSense code
              </h3>
              <p className="text-xs text-[#555a6a]">
                Quick setup guide for creating and exporting publisher tags
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 pt-1">
            <div className="bg-white rounded-xl p-4 border border-[#ddd6fe] space-y-2">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#ffd02f] text-[#1c1c1e] font-black text-xs">
                1
              </span>
              <p className="text-xs font-bold text-[#1c1c1e]">Login to AdSense</p>
              <p className="text-xs text-[#555a6a] leading-relaxed">
                Sign in to your authorized Google AdSense publisher console.
              </p>
            </div>

            <div className="bg-white rounded-xl p-4 border border-[#ddd6fe] space-y-2">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#ffd02f] text-[#1c1c1e] font-black text-xs">
                2
              </span>
              <p className="text-xs font-bold text-[#1c1c1e]">Navigate to Ad Units</p>
              <p className="text-xs text-[#555a6a] leading-relaxed">
                Open <strong>Ads &gt; By ad unit</strong> from the navigation sidebar.
              </p>
            </div>

            <div className="bg-white rounded-xl p-4 border border-[#ddd6fe] space-y-2">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#ffd02f] text-[#1c1c1e] font-black text-xs">
                3
              </span>
              <p className="text-xs font-bold text-[#1c1c1e]">Choose Unit Type</p>
              <p className="text-xs text-[#555a6a] leading-relaxed">
                Select Display, In-feed, or In-article format matching your slot.
              </p>
            </div>

            <div className="bg-white rounded-xl p-4 border border-[#ddd6fe] space-y-2">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#ffd02f] text-[#1c1c1e] font-black text-xs">
                4
              </span>
              <p className="text-xs font-bold text-[#1c1c1e]">Copy Code Snippet</p>
              <p className="text-xs text-[#555a6a] leading-relaxed">
                Click "Create" and copy the entire generated HTML &amp; JS tag.
              </p>
            </div>

            <div className="bg-white rounded-xl p-4 border border-[#ddd6fe] space-y-2">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#ffd02f] text-[#1c1c1e] font-black text-xs">
                5
              </span>
              <p className="text-xs font-bold text-[#1c1c1e]">Paste &amp; Deploy</p>
              <p className="text-xs text-[#555a6a] leading-relaxed">
                Paste into the snippet box above and click "Deploy Ad Unit".
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-[#fffdf5] rounded-xl border border-[#fde89c] flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-[#b8860b] flex-shrink-0" />
            <p className="text-xs font-semibold text-[#746019]">
              <strong>Pro Tip:</strong> Ensure that both the <code>&lt;ins class="adsbygoogle"&gt;</code> container and <code>&lt;script&gt;(adsbygoogle = window.adsbygoogle || []).push({});&lt;/script&gt;</code> trigger are present for live ad rendering.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
