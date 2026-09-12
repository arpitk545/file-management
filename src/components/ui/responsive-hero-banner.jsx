"use client";

import React, { useState } from 'react';

const ResponsiveHeroBanner = ({
    logoUrl = "",
    backgroundImageUrl = "",
    navLinks = [
        { label: "Home", href: "#home", isActive: true },
        { label: "Features", href: "#features" },
        { label: "Explore", href: "#explore" },
        { label: "Reviews", href: "#testimonials" },
        { label: "Documentation", href: "/documentation" }
    ],
    ctaButtonText = "Get Started",
    ctaButtonHref = "/signup",
    onCtaClick,
    badgeLabel = "NEW",
    badgeText = "The AI-Powered Visual Workspace",
    title = "See how teams get",
    titleLine2 = "great done with CLYS",
    description = "The AI-powered visual workspace for innovation, collaboration, and learning. Design custom quizzes, participate in educational contests, and turn ideas into academic excellence.",
    primaryButtonText = "Get started free",
    primaryButtonHref = "/signup",
    onPrimaryClick,
    secondaryButtonText = "Book a demo",
    secondaryButtonHref = "#features",
    onSecondaryClick,
    partnersTitle = "Trusted by learners & educators across top universities",
    partners = [
        { name: "Stanford", href: "#" },
        { name: "MIT", href: "#" },
        { name: "Oxford", href: "#" },
        { name: "Berkeley", href: "#" },
        { name: "Harvard", href: "#" }
    ],
    children
}) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <section className="w-full isolate min-h-screen overflow-hidden relative bg-[#060814] text-white">
            {backgroundImageUrl && (
                <img
                    src={backgroundImageUrl}
                    alt=""
                    className="w-full h-full object-cover absolute top-0 right-0 bottom-0 left-0 opacity-20 pointer-events-none"
                />
            )}
            <div className="pointer-events-none absolute inset-0 ring-1 ring-white/10" />

            {/* Ambient Background Glows */}
            <div className="absolute top-[-10%] left-[25%] w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[160px] pointer-events-none" />
            <div className="absolute top-[30%] right-[10%] w-[550px] h-[550px] bg-indigo-600/20 rounded-full blur-[160px] pointer-events-none" />

            <header className="z-20 xl:top-4 relative">
                <div className="mx-6 max-w-7xl lg:mx-auto">
                    <div className="flex items-center justify-between pt-4">
                        <a
                            href="#home"
                            className="inline-flex items-center gap-2.5 group focus:outline-none"
                        >
                            {logoUrl ? (
                                <span
                                    className="inline-flex items-center justify-center bg-center w-[100px] h-[40px] bg-cover rounded"
                                    style={{ backgroundImage: `url(${logoUrl})` }}
                                />
                            ) : (
                                <div className="flex items-center gap-2.5">
                                    <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 p-[1px] shadow-lg shadow-purple-500/30">
                                        <div className="w-full h-full rounded-2xl bg-[#0a0e20] flex items-center justify-center font-bold text-white text-base">
                                            C
                                        </div>
                                    </div>
                                    <span className="text-2xl font-extrabold bg-gradient-to-r from-white via-gray-100 to-purple-300 bg-clip-text text-transparent">
                                        clys
                                    </span>
                                </div>
                            )}
                        </a>

                        <nav className="hidden md:flex items-center gap-2">
                            <div className="flex items-center gap-1 rounded-full bg-white/5 px-2 py-1.5 ring-1 ring-white/10 backdrop-blur-xl shadow-lg">
                                {navLinks.map((link, index) => (
                                    <a
                                        key={index}
                                        href={link.href}
                                        className={`px-3.5 py-2 text-sm font-medium hover:text-white transition-colors rounded-full ${link.isActive ? 'text-white bg-white/10' : 'text-white/80'
                                            }`}
                                    >
                                        {link.label}
                                    </a>
                                ))}
                                <a
                                    href={ctaButtonHref}
                                    onClick={onCtaClick}
                                    className="ml-1 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 px-4 py-2 text-sm font-semibold text-white hover:brightness-110 shadow-md transition-all active:scale-95"
                                >
                                    {ctaButtonText}
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                                        <path d="M7 7h10v10" />
                                        <path d="M7 17 17 7" />
                                    </svg>
                                </a>
                            </div>
                        </nav>

                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/15 backdrop-blur text-white"
                            aria-expanded={mobileMenuOpen}
                            aria-label="Toggle menu"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-white/90">
                                <path d="M4 5h16" />
                                <path d="M4 12h16" />
                                <path d="M4 19h16" />
                            </svg>
                        </button>
                    </div>

                    {/* Mobile Drawer */}
                    {mobileMenuOpen && (
                        <div className="md:hidden mt-3 p-4 rounded-2xl bg-[#090d1e]/95 backdrop-blur-2xl ring-1 ring-white/15 space-y-2">
                            {navLinks.map((link, index) => (
                                <a
                                    key={index}
                                    href={link.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block px-3 py-2 text-sm font-medium text-gray-200 hover:text-white rounded-xl hover:bg-white/5"
                                >
                                    {link.label}
                                </a>
                            ))}
                            <a
                                href={ctaButtonHref}
                                onClick={(e) => {
                                    setMobileMenuOpen(false);
                                    if (onCtaClick) onCtaClick(e);
                                }}
                                className="block text-center py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold text-sm mt-2"
                            >
                                {ctaButtonText}
                            </a>
                        </div>
                    )}
                </div>
            </header>

            <div className="z-10 relative">
                <div className="sm:pt-20 md:pt-24 lg:pt-28 max-w-7xl mx-auto pt-16 px-6 pb-16">
                    <div className="mx-auto max-w-3xl text-center">
                        {/* Centered Badge Pill */}
                        <div className="mb-6 inline-flex items-center gap-3 rounded-full bg-white/10 px-3 py-1.5 ring-1 ring-white/15 backdrop-blur-xl animate-fade-slide-in-1 shadow-lg">
                            <span className="inline-flex items-center text-xs font-bold text-neutral-900 bg-gradient-to-r from-yellow-300 to-amber-400 rounded-full py-0.5 px-2.5 font-sans shadow-sm">
                                {badgeLabel}
                            </span>
                            <span className="text-sm font-medium text-white/90 font-sans">
                                {badgeText}
                            </span>
                        </div>

                        {/* Centered Large Typography */}
                        <h1 className="sm:text-5xl md:text-6xl lg:text-7xl leading-tight text-4xl text-white tracking-tight font-extrabold animate-fade-slide-in-2">
                            {title}
                            <br className="hidden sm:block" />
                            <span className="bg-gradient-to-r from-yellow-300 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                                {" " + titleLine2}
                            </span>
                        </h1>

                        <p className="sm:text-lg animate-fade-slide-in-3 text-base text-white/80 max-w-2xl mt-6 mx-auto leading-relaxed">
                            {description}
                        </p>

                        {/* Dual Action Buttons */}
                        <div className="flex flex-col sm:flex-row sm:gap-4 mt-10 gap-3 items-center justify-center animate-fade-slide-in-4">
                            <a
                                href={primaryButtonHref}
                                onClick={onPrimaryClick}
                                className="inline-flex items-center gap-2 hover:brightness-110 text-sm font-bold text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 ring-white/15 ring-1 rounded-full py-3.5 px-7 font-sans shadow-xl shadow-purple-600/30 transition-all active:scale-95"
                            >
                                {primaryButtonText}
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                                    <path d="M5 12h14" />
                                    <path d="m12 5 7 7-7 7" />
                                </svg>
                            </a>
                            <a
                                href={secondaryButtonHref}
                                onClick={onSecondaryClick}
                                className="inline-flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/15 ring-1 ring-white/15 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-xl font-sans transition-all active:scale-95"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 fill-purple-400 text-purple-400">
                                    <path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z" />
                                </svg>
                                {secondaryButtonText}
                            </a>
                        </div>
                    </div>

                    {/* Custom 3D Child Elements (e.g. 3D exploded showcase or pedestal) */}
                    {children && (
                        <div className="mt-12">
                            {children}
                        </div>
                    )}

                    {/* Bottom Partners / Trust Strip */}
                    <div className="mx-auto mt-20 max-w-5xl">
                        <p className="animate-fade-slide-in-1 text-xs font-semibold uppercase tracking-widest text-white/60 text-center">
                            {partnersTitle}
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 animate-fade-slide-in-2 text-white/70 mt-6 items-center justify-items-center gap-4">
                            {partners.map((partner, index) => (
                                <a
                                    key={index}
                                    href={partner.href}
                                    className="px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:border-purple-500/40 text-xs font-semibold text-gray-300 hover:text-white transition-all hover:scale-105"
                                >
                                    {partner.name || `Partner ${index + 1}`}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ResponsiveHeroBanner;
