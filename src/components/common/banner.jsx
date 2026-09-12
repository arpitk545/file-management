"use client";

import React, { useEffect, useState, useRef } from "react";
import { apiConnector } from "../../services/apiconnector";
import { getAdAPI } from "../../services/apis";

export default function Banner() {
  const [adConfig, setAdConfig] = useState(null);
  const [isAdLoaded, setIsAdLoaded] = useState(false);
  const adRef = useRef(null);
  const hasPushedRef = useRef(false);

  // Fetch dynamic Ad Config from server
  useEffect(() => {
    let isMounted = true;
    const fetchAd = async () => {
      try {
        const response = await apiConnector("GET", getAdAPI);
        if (response.data?.success && response.data?.data) {
          const ad = response.data.data;
          // Only configure if real client and slot exist and are not dummy test placeholders
          const isDummy =
            !ad.client ||
            !ad.slot ||
            ad.client === "ca-pub-3940256099942544" ||
            ad.client === "ca-pub-1234567890123456" ||
            ad.client === "1234567890123456";

          if (!isDummy && ad.isActive !== false) {
            if (isMounted) {
              setAdConfig({
                client: ad.client,
                slot: ad.slot,
                format: ad.format || "auto",
              });
            }
            return;
          }
        }
        // If no active or valid ad found, don't show anything
        if (isMounted) {
          setAdConfig(null);
          setIsAdLoaded(false);
        }
      } catch (err) {
        // When server has no active ad (404), do not show anything
        if (isMounted) {
          setAdConfig(null);
          setIsAdLoaded(false);
        }
      }
    };

    fetchAd();
    return () => {
      isMounted = false;
    };
  }, []);

  // Initialize adsbygoogle and listen for when Google AdSense fills the ad
  useEffect(() => {
    if (!adConfig) return;

    const adElement = adRef.current;
    if (!adElement) return;

    // Guard against duplicate adsbygoogle.push() to avoid TagError
    if (
      !hasPushedRef.current &&
      !adElement.getAttribute("data-adsbygoogle-status")
    ) {
      hasPushedRef.current = true;
      try {
        if (typeof window !== "undefined") {
          ((window).adsbygoogle = (window).adsbygoogle || []).push({});
        }
      } catch (e) {
        // Gracefully ignore TagError if AdSense already loaded
      }
    }

    // Function to check if Google AdSense has inserted an iframe or marked as filled
    const checkAdStatus = () => {
      if (!adElement) return;
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

    return () => {
      observer.disconnect();
    };
  }, [adConfig]);

  // If no ad is configured in database, show absolutely nothing
  if (!adConfig) {
    return null;
  }

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
            data-full-width-responsive="true"
          />
        </div>
      </div>
    </section>
  );
}