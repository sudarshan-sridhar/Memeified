"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface ScrollAnimationsProps {
  children: React.ReactNode;
}

export default function ScrollAnimations({ children }: ScrollAnimationsProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      // Hero text entrance
      gsap.from("[data-anim='hero-title']", {
        y: 60,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
      });

      gsap.from("[data-anim='hero-subtitle']", {
        y: 40,
        opacity: 0,
        duration: 0.8,
        delay: 0.3,
        ease: "power3.out",
      });

      gsap.from("[data-anim='hero-cta']", {
        y: 30,
        opacity: 0,
        duration: 0.6,
        delay: 0.6,
        ease: "power3.out",
      });

      // Feature cards staggered reveal
      gsap.from("[data-anim='feature-card']", {
        scrollTrigger: {
          trigger: "[data-anim='features-section']",
          start: "top 80%",
          toggleActions: "play none none none",
        },
        y: 80,
        opacity: 0,
        duration: 0.6,
        stagger: 0.15,
        ease: "power2.out",
      });

      // How it works steps
      gsap.from("[data-anim='step']", {
        scrollTrigger: {
          trigger: "[data-anim='steps-section']",
          start: "top 80%",
          toggleActions: "play none none none",
        },
        y: 60,
        opacity: 0,
        scale: 0.9,
        duration: 0.6,
        stagger: 0.2,
        ease: "back.out(1.4)",
      });

      // CTA footer fade in
      gsap.from("[data-anim='cta-section']", {
        scrollTrigger: {
          trigger: "[data-anim='cta-section']",
          start: "top 85%",
          toggleActions: "play none none none",
        },
        y: 50,
        opacity: 0,
        duration: 0.8,
        ease: "power2.out",
      });

      // Section headings slide in
      gsap.from("[data-anim='section-heading']", {
        scrollTrigger: {
          trigger: "[data-anim='features-section']",
          start: "top 85%",
          toggleActions: "play none none none",
        },
        y: 40,
        opacity: 0,
        duration: 0.6,
        ease: "power2.out",
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return <div ref={containerRef}>{children}</div>;
}
