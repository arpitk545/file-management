"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { apiConnector } from "../../services/apiconnector"
import { getAdAPI } from "../../services/apis"

export default function Banner() {
  const [adConfig, setAdConfig] = useState(null);
  const [adInitialized, setAdInitialized] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch dynamic Ad Config from server
  useEffect(() => {
    const fetchAd = async () => {
      try {
        setLoading(true);
        const response = await apiConnector("GET", getAdAPI);
        if (response.data?.success && response.data?.data) {
          setAdConfig(response.data.data);
        }
      } catch (err) {
        console.error("Error fetching Ad configuration:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAd();
  }, []);

  // Google AdSense initialization effect
  useEffect(() => {
    if (!adConfig) return;
    if (adInitialized) return;

    // Add the AdSense script if not already present
    const existingScript = document.querySelector('script[src*="adsbygoogle.js"]');
    if (!existingScript) {
      const script = document.createElement('script');
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adConfig.client}`;
      script.async = true;
      script.crossOrigin = 'anonymous';
      document.head.appendChild(script);
    }

    // Small delay to ensure script loads
    const timer = setTimeout(() => {
      try {
        // Check if ad container exists and doesn't already have an ad
        const adContainer = document.querySelector('.adsbygoogle');
        if (adContainer && !adContainer.hasAttribute('data-ad-status')) {
          ((window).adsbygoogle = (window).adsbygoogle || []).push({});
          setAdInitialized(true);
        }
      } catch (error) {
        console.error("AdSense error:", error);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [adConfig, adInitialized]);

  if (loading) {
    return (
      <section className="py-8 md:py-12 relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-2xl md:rounded-3xl overflow-hidden shadow-sm bg-gray-50 border border-gray-100 flex items-center justify-center min-h-[120px]">
             <div className="animate-pulse w-full max-w-2xl h-[90px] bg-gray-200 rounded-xl m-4"></div>
          </div>
        </div>
      </section>
    );
  }

  if (!adConfig) {
    return (
      <section className="py-8 md:py-12 relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center p-8 border-2 border-dashed border-gray-200 rounded-2xl md:rounded-3xl bg-gray-50/50 min-h-[120px]"
          >
            <p className="text-gray-400 font-medium text-center">No advertisement to show yet.</p>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 md:py-12 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           whileInView={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.6 }}
           viewport={{ once: true }}
           className="relative"
        >
          <div className="text-center mb-3">
             <span className="inline-block px-3 py-1 bg-gray-100 text-gray-500 text-[10px] sm:text-xs font-semibold tracking-widest uppercase rounded-full">
               Advertisement
             </span>
          </div>

          <div className="relative rounded-2xl md:rounded-3xl overflow-hidden shadow-xl md:shadow-2xl bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="w-full flex justify-center items-center p-4 md:p-6 min-h-[120px]">
              <div className="w-full max-w-4xl flex justify-center">
                 <ins
                  className="adsbygoogle"
                  style={{ display: "block", width: "100%" }}
                  data-ad-client={adConfig.client}
                  data-ad-slot={adConfig.slot}
                  data-ad-format={adConfig.format || "auto"}
                  data-full-width-responsive="true"
                 />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}