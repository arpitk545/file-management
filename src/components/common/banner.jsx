"use client"

import React, { useEffect, useState, useRef } from "react"
import { motion } from "framer-motion"
import { apiConnector } from "../../services/apiconnector"
import { getAdAPI } from "../../services/apis"

// Official Google AdSense Test Credentials
const GOOGLE_TEST_AD = {
  client: "ca-pub-3940256099942544", // Official Google AdMob / AdSense Test Publisher ID
  slot: "6300978111",              // Official Google AdSense Test Slot ID
  format: "auto",
}

export default function Banner() {
  const [adConfig, setAdConfig] = useState(GOOGLE_TEST_AD);
  const [isAdLoaded, setIsAdLoaded] = useState(false);
  const adRef = useRef(null);

  // Fetch dynamic Ad Config from server, fallback to official Google test credentials
  useEffect(() => {
    let isMounted = true;
    const fetchAd = async () => {
      try {
        const response = await apiConnector("GET", getAdAPI);
        if (response.data?.success && response.data?.data) {
          if (isMounted) {
            setAdConfig({
              client: response.data.data.client || GOOGLE_TEST_AD.client,
              slot: response.data.data.slot || GOOGLE_TEST_AD.slot,
              format: response.data.data.format || GOOGLE_TEST_AD.format,
            });
          }
        }
      } catch (err) {
        if (isMounted) {
          setAdConfig(GOOGLE_TEST_AD);
        }
      }
    };
    fetchAd();
    return () => {
      isMounted = false;
    };
  }, []);

  // Initialize adsbygoogle and listen for when Google AdSense actually fills the ad
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        ((window).adsbygoogle = (window).adsbygoogle || []).push({});
      }
    } catch (e) {
      console.warn("Google AdSense init:", e);
    }

    const adElement = adRef.current;
    if (!adElement) return;

    // Function to check if Google AdSense has inserted an iframe or marked as filled
    const checkAdStatus = () => {
      const status = adElement.getAttribute("data-ad-status");
      const iframe = adElement.querySelector("iframe");
      if (status === "filled" || iframe) {
        setIsAdLoaded(true);
      } else if (status === "unfilled") {
        setIsAdLoaded(false);
      }
    };

    checkAdStatus();

    // Observe changes made by adsbygoogle script
    const observer = new MutationObserver(() => {
      checkAdStatus();
    });

    observer.observe(adElement, {
      attributes: true,
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, [adConfig]);

  return (
    <section
      className={`relative overflow-hidden font-sans transition-all duration-300 ${
        isAdLoaded
          ? "w-full bg-[#fafbfc] border-y border-[#e0e2e8] py-4 sm:py-6 opacity-100 block"
          : "h-0 min-h-0 max-h-0 overflow-hidden opacity-0 pointer-events-none p-0 m-0 border-0 block"
      }`}
    >
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div
          className={
            isAdLoaded
              ? "relative rounded-2xl overflow-hidden border border-[#c7cad5] bg-white p-2 sm:p-4 shadow-xs flex items-center justify-center min-h-[90px]"
              : ""
          }
        >
          <ins
            ref={adRef}
            className="adsbygoogle"
            style={{ display: "block", width: "100%", textAlign: "center" }}
            data-ad-client={adConfig.client}
            data-ad-slot={adConfig.slot}
            data-ad-format={adConfig.format || "auto"}
            data-ad-test="on"
            data-full-width-responsive="true"
          />
        </div>
      </div>
    </section>
  );
}