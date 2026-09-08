import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../../ui/card';
import { ArrowLeft, Save, Monitor, LayoutTemplate, Smartphone, Code, Info, CheckCircle, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { apiConnector } from '../../../services/apiconnector';
import { saveAdAPI } from '../../../services/apis';
import toast, { Toaster } from 'react-hot-toast';

// Spinner Component
const Spinner = () => (
  <div className="inline-flex items-center">
    <Loader2 className="w-4 h-4 animate-spin mr-2" />
    <span>Saving...</span>
  </div>
);

export default function UploadAd() {
  const navigate = useNavigate();
  const [openCard, setOpenCard] = useState(null);
  const [category, setCategory] = useState("horizontal");
  const [adCode, setAdCode] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);

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
  ];

  // Extract client and slot from adCode for preview
  const clientMatch = adCode.match(/data-ad-client=["']([^"']+)["']/);
  const slotMatch = adCode.match(/data-ad-slot=["']([^"']+)["']/);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!adCode) {
      toast.error("Please paste your AdSense code", {
        duration: 3000,
        position: 'top-center',
        icon: '⚠️',
      });
      return;
    }
    
    if (!clientMatch || !slotMatch) {
      toast.error("Invalid AdSense code. Ensure it contains data-ad-client and data-ad-slot.", {
        duration: 4000,
        position: 'top-center',
      });
      return;
    }
    
    const client = clientMatch[1];
    const slot = slotMatch[1];

    setLoading(true);
    const loadingToast = toast.loading("Saving ad configuration...", {
      position: 'top-center',
    });

    try {
      const token = localStorage.getItem("token");
      await apiConnector("POST", saveAdAPI, {
        title: openCard,
        format: category,
        client,
        slot
      }, {
        Authorization: `Bearer ${token}`
      });
      
      toast.success("Ad configuration saved successfully!", {
        id: loadingToast,
        duration: 3000,
        position: 'top-center',
        icon: '✅',
      });
      
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (error) {
      console.error("Error saving ad:", error);
      toast.error(error.response?.data?.message || "Failed to save ad configuration", {
        id: loadingToast,
        duration: 4000,
        position: 'top-center',
      });
    } finally {
      setLoading(false);
    }
  };

  const adFormats = [
    { id: "horizontal", name: "Horizontal Banner", icon: LayoutTemplate, desc: "Best for top or bottom placement (e.g., 728x90)" },
    { id: "vertical", name: "Vertical Sidebar", icon: Smartphone, desc: "Ideal for left/right columns (e.g., 300x600)" },
    { id: "square", name: "Square Unit", icon: Monitor, desc: "Perfect for in-article content (e.g., 250x250)" }
  ];

  return (
    <>
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
            borderRadius: '12px',
            padding: '12px 16px',
            fontSize: '14px',
          },
          success: {
            style: {
              background: '#10b981',
              color: '#fff',
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#10b981',
            },
          },
          error: {
            style: {
              background: '#ef4444',
              color: '#fff',
            },
            duration: 4000,
          },
          loading: {
            style: {
              background: '#3b82f6',
              color: '#fff',
            },
          },
        }}
      />
      
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-200 p-3 sm:p-4 md:p-6 lg:p-8">
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="max-w-4xl mx-auto space-y-4 sm:space-y-6"
        >
          {/* Header with Back Button */}
          <div className="flex items-center gap-3 mb-2">
            <motion.button
              onClick={() => navigate('/admin/dashboard')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 bg-blue-500 rounded-full hover:bg-blue-600 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 text-white" />
            </motion.button>
          </div>

          {/* Title Section - Centered */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-2">
              AdSense Configuration
            </h1>
            <p className="text-sm sm:text-base text-gray-500">
              Manage and deploy advertisement code across your platform
            </p>
          </div>

          {/* Main Content */}
          <div className="space-y-4">
            {/* Title Accordion Cards */}
            {adTitles.map((t) => (
              <Card key={t} className="border border-gray-200 shadow-sm rounded-xl overflow-hidden bg-white">
                {/* Accordion Header */}
                <div 
                  className={`p-4 sm:p-5 flex justify-between items-center cursor-pointer transition-colors ${openCard === t ? 'bg-blue-50/50' : 'hover:bg-gray-50'}`}
                  onClick={() => {
                    if (openCard === t) {
                      setOpenCard(null);
                    } else {
                      setOpenCard(t);
                      setAdCode("");
                      setCategory("horizontal");
                    }
                  }}
                >
                  <h3 className={`text-base sm:text-lg font-semibold flex items-center ${openCard === t ? 'text-blue-700' : 'text-gray-800'}`}>
                    <LayoutTemplate className={`w-5 h-5 mr-3 ${openCard === t ? 'text-blue-600' : 'text-gray-400'}`} />
                    {t}
                  </h3>
                  {openCard === t ? (
                    <ChevronUp className="w-5 h-5 text-blue-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>

                {/* Expanded Content */}
                {openCard === t && (
                  <div className="border-t border-gray-100 bg-gray-50/30 p-4 sm:p-6 space-y-6">
                    {/* Select Ad Format Section */}
                    <div>
                      <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-3 flex items-center">
                        <LayoutTemplate className="w-4 h-4 mr-2 text-blue-500" />
                        Select Ad Format
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                        {adFormats.map((format) => (
                          <div 
                            key={format.id}
                            onClick={() => !loading && setCategory(format.id)}
                            className={`cursor-pointer p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all duration-200 flex flex-col items-center text-center gap-2 sm:gap-3 ${
                              loading ? 'opacity-50 cursor-not-allowed' : ''
                            } ${
                              category === format.id 
                                ? 'border-blue-500 bg-white shadow-sm' 
                                : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/50'
                            }`}
                          >
                            <div className={`p-2 sm:p-3 rounded-full ${category === format.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                              <format.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <div>
                              <p className={`text-sm sm:text-base font-semibold ${category === format.id ? 'text-blue-700' : 'text-gray-700'}`}>{format.name}</p>
                              <p className="text-xs text-gray-500 mt-1">{format.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* AdSense Script Inject Section */}
                    <div>
                      <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-3 flex items-center">
                        <Code className="w-4 h-4 mr-2 text-blue-500" />
                        AdSense Script Inject
                      </h3>
                      <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-lg sm:rounded-xl blur opacity-20 group-hover:opacity-30 transition duration-500"></div>
                        <textarea
                          value={adCode}
                          onChange={(e) => setAdCode(e.target.value)}
                          disabled={loading}
                          rows="8"
                          placeholder="<!-- Paste your HTML/JS code here... -->&#10;<ins class='adsbygoogle' style='display:block' data-ad-format='auto'></ins>&#10;<script>(adsbygoogle = window.adsbygoogle || []).push({});</script>"
                          className="relative w-full p-4 sm:p-5 bg-gray-900 border border-gray-800 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-green-400 font-mono text-xs sm:text-sm placeholder-gray-600 shadow-inner resize-y transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        ></textarea>
                      </div>
                      {adCode && adCode.length < 50 && (
                        <p className="text-xs text-amber-600 mt-2">⚠️ Code seems short. Please paste the complete AdSense snippet.</p>
                      )}
                    </div>

                    {/* Preview Status and Save Button Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Preview Status */}
                      <div className="border border-gray-100 shadow-sm rounded-xl sm:rounded-2xl bg-white p-4">
                        <h3 className="text-xs font-semibold text-gray-800 mb-3 uppercase tracking-wider">Preview Status</h3>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                            <span className="text-xs text-gray-600">Selected Location</span>
                            <span className="text-xs font-medium text-blue-600 capitalize py-1 px-2 bg-blue-50 rounded-md">
                              {openCard}
                            </span>
                          </div>
                          <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                            <span className="text-xs text-gray-600">Selected Layout</span>
                            <span className="text-xs font-medium text-blue-600 capitalize py-1 px-2 bg-blue-50 rounded-md">
                              {category} Format
                            </span>
                          </div>
                          <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                            <span className="text-xs text-gray-600">Code Status</span>
                            {adCode.length > 10 ? (
                              <span className="text-xs font-medium text-green-600 flex items-center">
                                <CheckCircle className="w-3 h-3 mr-1"/> Valid length
                              </span>
                            ) : (
                              <span className="text-xs font-medium text-amber-600 flex items-center">
                                Waiting for code...
                              </span>
                            )}
                          </div>
                          {clientMatch && slotMatch && (
                            <div className="p-2 bg-blue-50 rounded-lg">
                              <p className="text-[10px] text-gray-600 mb-1">Detected Configuration:</p>
                              <p className="text-[10px] font-mono text-blue-700 break-all">Client: {clientMatch[1]}</p>
                              <p className="text-[10px] font-mono text-blue-700 mt-1 break-all">Slot: {slotMatch[1]}</p>
                            </div>
                          )}
                          {adCode.length > 10 && (!clientMatch || !slotMatch) && (
                            <div className="p-2 bg-red-50 rounded-lg">
                              <p className="text-[10px] text-red-600">
                                ⚠️ Could not detect data-ad-client or data-ad-slot in the provided code. Please ensure you've pasted the complete AdSense snippet.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Save Button */}
                      <div className="border border-gray-100 shadow-sm rounded-xl sm:rounded-2xl bg-white p-4 flex flex-col items-center justify-center">
                        <div className="text-center">
                          <div className="mb-3">
                            <Save className="w-8 h-8 text-blue-500 mx-auto mb-1" />
                            <h3 className="text-sm font-semibold text-gray-800">Ready to Save?</h3>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleSubmit}
                            disabled={!adCode.trim() || loading || !clientMatch || !slotMatch}
                            className={`inline-flex items-center justify-center px-4 py-2 rounded-xl font-medium transition-all w-full text-sm ${
                              !adCode.trim() || loading || !clientMatch || !slotMatch
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                : 'bg-blue-600 text-white shadow-sm hover:bg-blue-700 hover:shadow'
                            }`}
                          >
                            {loading ? (
                              <Spinner />
                            ) : isSaved ? (
                              <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Saved Successfully!
                              </>
                            ) : (
                              <>
                                <Save className="h-4 w-4 mr-2" />
                                Save Configuration
                              </>
                            )}
                          </motion.button>
                          {adCode.length > 10 && (!clientMatch || !slotMatch) && (
                            <p className="text-[10px] text-red-500 mt-2">
                              Cannot save: Invalid code format
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>

            {/* Instructions Section */}
            <Card className="border-0 shadow-sm rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                    <Info className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold">How to get your AdSense code</h3>
                </div>
                <ol className="space-y-4 text-sm text-blue-50">
                  <li className="flex gap-3">
                    <span className="font-bold text-white bg-white/20 w-6 h-6 flex items-center justify-center rounded-full shrink-0">1</span>
                    <p>Log in to your Google AdSense account.</p>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-white bg-white/20 w-6 h-6 flex items-center justify-center rounded-full shrink-0">2</span>
                    <p>Navigate to <strong>Ads &gt; By ad unit</strong>.</p>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-white bg-white/20 w-6 h-6 flex items-center justify-center rounded-full shrink-0">3</span>
                    <p>Select your desired ad format (Display, In-feed, etc).</p>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-white bg-white/20 w-6 h-6 flex items-center justify-center rounded-full shrink-0">4</span>
                    <p>Click on "Create" and then copy the generated HTML snippet.</p>
                  </li>
                  <li className="flex gap-3">
                    <span className="font-bold text-white bg-white/20 w-6 h-6 flex items-center justify-center rounded-full shrink-0">5</span>
                    <p>Paste the entire code in the "AdSense Script Inject" textarea above.</p>
                  </li>
                </ol>
                <div className="mt-4 p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                  <p className="text-xs text-blue-100">
                    💡 <strong>Pro Tip:</strong> Make sure to copy the complete script including both the &lt;ins&gt; and &lt;script&gt; tags for proper functionality.
                  </p>
                </div>
              </CardContent>
            </Card>
        </motion.div>
      </div>
    </>
  );
}
