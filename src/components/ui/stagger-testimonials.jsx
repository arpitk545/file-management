"use client"

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, MessageSquareQuote } from 'lucide-react';
import { cn } from '../../lib/utils';

const SQRT_5000 = Math.sqrt(5000);

const TestimonialCard = ({ 
  position, 
  testimonial, 
  handleMove, 
  cardSize 
}) => {
  const isCenter = position === 0;

  return (
    <div
      onClick={() => handleMove(position)}
      className={cn(
        "absolute left-1/2 top-1/2 cursor-pointer border-2 p-6 sm:p-8 transition-all duration-500 ease-in-out select-none",
        isCenter 
          ? "z-10 bg-[#1c1c1e] text-white border-[#1c1c1e] shadow-2xl" 
          : "z-0 bg-white text-[#1c1c1e] border-[#e0e2e8] hover:border-[#1c1c1e]/50 shadow-md"
      )}
      style={{
        width: cardSize,
        height: cardSize,
        clipPath: `polygon(50px 0%, calc(100% - 50px) 0%, 100% 50px, 100% 100%, calc(100% - 50px) 100%, 50px 100%, 0 100%, 0 0)`,
        transform: `
          translate(-50%, -50%) 
          translateX(${(cardSize / 1.5) * position}px)
          translateY(${isCenter ? -65 : position % 2 ? 15 : -15}px)
          rotate(${isCenter ? 0 : position % 2 ? 2.5 : -2.5}deg)
        `,
        boxShadow: isCenter ? "0px 12px 24px -4px rgba(0,0,0,0.3)" : "0px 2px 8px rgba(0,0,0,0.05)"
      }}
    >
      <span
        className="absolute block origin-top-right rotate-45 bg-[#e0e2e8]"
        style={{
          right: -2,
          top: 48,
          width: SQRT_5000,
          height: 2
        }}
      />
      <div className="mb-4 flex items-center gap-3">
        {testimonial.imgSrc ? (
          <img
            src={testimonial.imgSrc}
            alt={testimonial.by || 'Reviewer'}
            className="h-12 w-12 bg-gray-100 object-cover object-top rounded-full shadow-sm border border-gray-200"
          />
        ) : (
          <div className="h-12 w-12 rounded-full bg-[#e8edff] text-[#4262ff] font-bold flex items-center justify-center text-base">
            {(testimonial.by || 'U').charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      <h3 className={cn(
        "text-sm sm:text-base font-medium leading-snug line-clamp-4",
        isCenter ? "text-white font-sans" : "text-[#1c1c1e] font-sans"
      )}>
        "{testimonial.testimonial}"
      </h3>
      <p className={cn(
        "absolute bottom-6 left-6 right-6 text-xs sm:text-sm font-semibold truncate",
        isCenter ? "text-yellow-300" : "text-[#555a6a]"
      )}>
        — {testimonial.by}
      </p>
    </div>
  );
};

export const StaggerTestimonials = ({ customTestimonials = [] }) => {
  const [cardSize, setCardSize] = useState(365);
  const [testimonialsList, setTestimonialsList] = useState(customTestimonials || []);

  useEffect(() => {
    if (customTestimonials && customTestimonials.length > 0) {
      setTestimonialsList(customTestimonials);
    } else {
      setTestimonialsList([]);
    }
  }, [customTestimonials]);

  const handleMove = (steps) => {
    if (!testimonialsList || testimonialsList.length === 0) return;
    const newList = [...testimonialsList];
    if (steps > 0) {
      for (let i = steps; i > 0; i--) {
        const item = newList.shift();
        if (!item) return;
        newList.push({ ...item, tempId: Math.random() });
      }
    } else {
      for (let i = steps; i < 0; i++) {
        const item = newList.pop();
        if (!item) return;
        newList.unshift({ ...item, tempId: Math.random() });
      }
    }
    setTestimonialsList(newList);
  };

  useEffect(() => {
    const updateSize = () => {
      const { matches } = window.matchMedia("(min-width: 640px)");
      setCardSize(matches ? 365 : 280);
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  if (!testimonialsList || testimonialsList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center text-[#555a6a]">
        <MessageSquareQuote className="w-12 h-12 text-[#999eb0] mb-3 opacity-60" />
        <p className="text-base font-medium">No verified reviews available in database.</p>
      </div>
    );
  }

  return (
    <div
      className="relative w-full overflow-hidden py-6"
      style={{ height: 580 }}
    >
      {testimonialsList.map((testimonial, index) => {
        const position = testimonialsList.length % 2
          ? index - (testimonialsList.length + 1) / 2
          : index - testimonialsList.length / 2;
        return (
          <TestimonialCard
            key={testimonial.tempId ?? index}
            testimonial={testimonial}
            handleMove={handleMove}
            position={position}
            cardSize={cardSize}
          />
        );
      })}
      <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-3 z-20">
        <button
          onClick={() => handleMove(-1)}
          className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-white border-2 border-[#1c1c1e] text-[#1c1c1e] hover:bg-[#1c1c1e] hover:text-white transition-all shadow-md active:scale-95"
          aria-label="Previous testimonial"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={() => handleMove(1)}
          className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-white border-2 border-[#1c1c1e] text-[#1c1c1e] hover:bg-[#1c1c1e] hover:text-white transition-all shadow-md active:scale-95"
          aria-label="Next testimonial"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default StaggerTestimonials;
