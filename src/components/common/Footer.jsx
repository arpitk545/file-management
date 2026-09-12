"use client";

import React from "react";
import { useNavigate } from "react-router-dom";
import {
  GraduationCap,
  Github,
  Linkedin,
  Twitter,
  Instagram,
  Heart,
  ArrowUp,
} from "lucide-react";

export default function FooterSection() {
  const navigate = useNavigate();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const footerLinks = {
    platform: [
      { name: "Browse Files", route: "/documentation" },
      { name: "Take Quizzes", route: "/view-user-quiz" },
      { name: "Join Contests", route: "/contest" },
      { name: "Q & A Community", route: "/qnada" },
    ],
    company: [
      { name: "About Us", route: "/about-us" },
      { name: "Contact", route: "/contact-us" },
      { name: "Articles & News", route: "/articles" },
      { name: "Terms & Condition", route: "/terms-condition" },
    ],
    support: [
      { name: "Help Center", route: "/contact-us" },
      { name: "Documentation", route: "/documentation" },
      { name: "Privacy Policy", route: "/privacy-policy" },
      { name: "Disclaimer", route: "/disclaimer" },
    ],
  };

  const socialLinks = [
    { icon: Github, href: "https://github.com", color: "hover:bg-gray-800", label: "GitHub" },
    { icon: Linkedin, href: "https://linkedin.com", color: "hover:bg-blue-600", label: "LinkedIn" },
    { icon: Twitter, href: "https://twitter.com", color: "hover:bg-sky-500", label: "Twitter" },
    { icon: Instagram, href: "https://instagram.com", color: "hover:bg-pink-600", label: "Instagram" },
  ];

  return (
    <footer
      id="contact"
      className="relative bg-[#050711] text-white pt-14 sm:pt-20 lg:pt-24 pb-8 sm:pb-12 overflow-hidden border-t border-white/10"
    >
      {/* Ambient background glow */}
      <div className="absolute top-0 right-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-purple-600/10 rounded-full blur-[120px] sm:blur-[140px] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 sm:gap-10 lg:gap-12 pb-10 sm:pb-14 lg:pb-16 border-b border-white/10">
          {/* Brand Section: Full width on mobile/tablet, 2 cols on desktop */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-2 space-y-4 sm:space-y-5">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 rounded-2xl p-[1px] shadow-lg shadow-purple-500/30">
                  <div className="w-full h-full bg-[#0a0e20] rounded-2xl flex items-center justify-center">
                    <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6 text-purple-400" />
                  </div>
                </div>
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full animate-pulse" />
              </div>
              <span className="text-2xl font-extrabold bg-gradient-to-r from-purple-400 via-pink-400 to-white bg-clip-text text-transparent font-sans">
                clys
              </span>
            </div>

            <p className="text-gray-300 text-sm sm:text-base leading-relaxed max-w-sm font-sans">
              Empowering students worldwide with verified study tools, competitive quiz arenas, and a thriving peer learning community.
            </p>

            {/* Social Icons with safe tap size */}
            <div className="flex items-center gap-2.5 sm:gap-3 pt-1">
              {socialLinks.map((social, idx) => (
                <a
                  key={idx}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-300 hover:text-white transition-all active:scale-95 ${social.color}`}
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns: Balanced on mobile (Platform + Company on Row 1, Support 2x2 on Row 2), 3-col on tablet, 5-col on desktop */}
          {Object.entries(footerLinks).map(([title, links]) => {
            const isSupport = title === "support";
            return (
              <div
                key={title}
                className={`${
                  isSupport
                    ? "col-span-2 sm:col-span-1 pt-4 sm:pt-0 border-t border-white/5 sm:border-0"
                    : "col-span-1"
                } space-y-3 sm:space-y-4 text-left items-start flex flex-col`}
              >
                <h4 className="text-xs font-bold uppercase tracking-widest text-purple-400 font-sans text-left w-full">
                  {title}
                </h4>
                <ul
                  className={`${
                    isSupport
                      ? "grid grid-cols-2 sm:grid-cols-1 gap-x-6 gap-y-2 sm:gap-y-0 sm:space-y-2.5"
                      : "space-y-2 sm:space-y-2.5"
                  } text-xs sm:text-sm text-gray-300 font-sans text-left w-full`}
                >
                  {links.map((link) => (
                    <li key={link.name} className="text-left w-full">
                      <button
                        onClick={() => navigate(link.route)}
                        className="py-1 block hover:text-white hover:translate-x-1 transition-all text-left w-full active:text-purple-300 truncate"
                      >
                        {link.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Bottom Bar: Stacked neatly on mobile with back to top button */}
        <div className="pt-6 sm:pt-8 flex flex-col-reverse sm:flex-row items-center justify-between gap-4 text-xs text-gray-400 font-sans">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 text-center">
            <span>© {new Date().getFullYear()} clys. All rights reserved. Built with</span>
            <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500 inline shrink-0" />
            <span>for students worldwide.</span>
          </div>

          <button
            onClick={scrollToTop}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs sm:text-sm font-medium transition-all active:scale-95"
            aria-label="Scroll back to top"
          >
            <span>Back to top</span>
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      </div>
    </footer>
  );
}