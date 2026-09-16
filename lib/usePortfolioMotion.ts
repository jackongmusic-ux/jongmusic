"use client";

import { useLayoutEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function usePortfolioMotion() {
  useLayoutEffect(() => {
    const root = document.documentElement;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      root.classList.remove("motion-boot");
      root.classList.add("motion-reduced");
      return () => root.classList.remove("motion-reduced");
    }

    gsap.registerPlugin(ScrollTrigger);
    root.classList.add("motion-enhanced", "motion-opening");

    const isMobile = window.matchMedia("(max-width: 700px)").matches;
    const enterDistance = isMobile ? 92 : 145;

    const context = gsap.context(() => {
      const opening = gsap.timeline({
        defaults: { ease: "power4.out" },
        onComplete: () => {
          root.classList.remove("motion-boot", "motion-opening");
          gsap.set(".opening-sequence", { display: "none" });
          ScrollTrigger.refresh();
        },
      });

      gsap.set(".opening-sequence__panel", { scaleY: 1, transformOrigin: "50% 0%" });
      gsap.set(".site-header", { autoAlpha: 0, y: -32 });
      gsap.set(".hero-portrait", {
        clipPath: "inset(0% 0% 100% 0%)",
        scale: 1.075,
        transformOrigin: "50% 28%",
      });
      gsap.set(".hero-profile-top", { autoAlpha: 0, y: 48 });
      gsap.set(".hero-name-lockup", {
        autoAlpha: 0,
        y: 110,
        scaleX: 0.66,
        transformOrigin: "0% 55%",
      });
      gsap.set(".hero-panel-rule", { autoAlpha: 0, scaleX: 0.22, transformOrigin: "0% 50%" });
      gsap.set(".hero-summary p", { autoAlpha: 0, y: 34 });
      gsap.set(".hero-works-cta", { autoAlpha: 0, y: 55, x: -18 });
      gsap.set(".hero-releases", { autoAlpha: 0, y: 70, clipPath: "inset(100% 0% 0% 0%)" });

      opening
        .fromTo(".opening-sequence__index", { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.7 }, 0.08)
        .fromTo(".opening-sequence__line", { scaleX: 0 }, { scaleX: 1, duration: 1.05, transformOrigin: "0% 50%" }, 0.14)
        .to(".opening-sequence__index", { autoAlpha: 0, y: -16, duration: 0.38, ease: "power2.in" }, 0.92)
        .to(".opening-sequence__panel", {
          scaleY: 0,
          duration: 1.55,
          stagger: 0.13,
          ease: "power4.inOut",
        }, 0.94)
        .to(".hero-portrait", { clipPath: "inset(0% 0% 0% 0%)", scale: 1, duration: 2.25, ease: "expo.inOut" }, 0.95)
        .to(".site-header", { autoAlpha: 1, y: 0, duration: 1.05 }, 1.12)
        .to(".hero-profile-top", { autoAlpha: 1, y: 0, duration: 1.15 }, 1.26)
        .to(".hero-name-lockup", { autoAlpha: 1, y: 0, scaleX: 1, duration: 1.55, ease: "expo.out" }, 1.34)
        .to(".hero-panel-rule", { autoAlpha: 1, scaleX: 1, duration: 1.2 }, 1.66)
        .to(".hero-summary p", { autoAlpha: 1, y: 0, duration: 0.92, stagger: 0.13 }, 1.9)
        .to(".hero-works-cta", { autoAlpha: 1, y: 0, x: 0, duration: 1.1 }, 2.12)
        .to(".hero-releases", { autoAlpha: 1, y: 0, clipPath: "inset(0% 0% 0% 0%)", duration: 1.35 }, 2.2);

      if (!isMobile) {
        gsap.to(".hero-portrait", {
          yPercent: 5,
          ease: "none",
          scrollTrigger: {
            trigger: ".hero",
            start: "top top",
            end: "bottom top",
            scrub: 1.2,
          },
        });
      }

      gsap.utils.toArray<HTMLElement>(".editorial-section").forEach((section) => {
        const reference = section.querySelector<HTMLElement>(".section-ref");
        const title = section.querySelector<HTMLElement>(".section-title");
        const intro = section.querySelectorAll<HTMLElement>(".works-intro > *, .capability-intro > *");
        if (!title) return;

        gsap.set(title, {
          autoAlpha: 0,
          y: enterDistance,
          scaleX: isMobile ? 0.72 : 0.62,
          clipPath: "inset(0% 0% 100% 0%)",
          transformOrigin: "0% 100%",
        });

        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top 78%",
            once: true,
          },
        });

        if (reference) {
          timeline.fromTo(reference, { autoAlpha: 0, x: -46 }, { autoAlpha: 1, x: 0, duration: 0.9, ease: "power3.out" });
        }
        timeline.to(title, {
          autoAlpha: 1,
          y: 0,
          scaleX: 1,
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 1.65,
          ease: "expo.out",
        }, reference ? "-=0.58" : 0);
        if (intro.length) {
          timeline.fromTo(intro, {
            autoAlpha: 0,
            y: 70,
            clipPath: "inset(0% 0% 100% 0%)",
          }, {
            autoAlpha: 1,
            y: 0,
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 1.15,
            stagger: 0.16,
            ease: "power4.out",
          }, "-=0.82");
        }
      });

      gsap.fromTo(".portrait-gallery", {
        autoAlpha: 0,
        y: 110,
        clipPath: "inset(0% 100% 0% 0%)",
      }, {
        autoAlpha: 1,
        y: 0,
        clipPath: "inset(0% 0% 0% 0%)",
        duration: 1.6,
        ease: "expo.out",
        scrollTrigger: { trigger: ".about-layout", start: "top 74%", once: true },
      });

      gsap.fromTo(".about-copy > *", {
        autoAlpha: 0,
        y: 52,
      }, {
        autoAlpha: 1,
        y: 0,
        duration: 1,
        stagger: 0.11,
        ease: "power4.out",
        scrollTrigger: { trigger: ".about-copy", start: "top 76%", once: true },
      });

      gsap.fromTo(".stat", {
        autoAlpha: 0,
        y: 82,
        scaleY: 0.78,
        transformOrigin: "50% 100%",
      }, {
        autoAlpha: 1,
        y: 0,
        scaleY: 1,
        duration: 1.25,
        stagger: 0.18,
        ease: "expo.out",
        scrollTrigger: { trigger: ".stats", start: "top 82%", once: true },
      });

      gsap.fromTo(".project-card", {
        autoAlpha: 0,
        y: 135,
        scale: 0.955,
        clipPath: "inset(0% 0% 100% 0%)",
      }, {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        clipPath: "inset(0% 0% 0% 0%)",
        duration: 1.55,
        stagger: 0.2,
        ease: "expo.out",
        scrollTrigger: { trigger: ".project-grid", start: "top 78%", once: true },
      });

      if (!isMobile) {
        gsap.utils.toArray<HTMLElement>(".project-image-wrap img").forEach((image) => {
          gsap.fromTo(image, { "--parallax-y": "-4%" }, {
            "--parallax-y": "4%",
            ease: "none",
            scrollTrigger: {
              trigger: image.closest(".project-card"),
              start: "top bottom",
              end: "bottom top",
              scrub: 1.1,
            },
          });
        });
      }

      gsap.fromTo(".strength-glow", {
        autoAlpha: 0,
        y: 105,
        scaleY: 0.88,
        transformOrigin: "50% 100%",
      }, {
        autoAlpha: 1,
        y: 0,
        scaleY: 1,
        duration: 1.35,
        stagger: 0.17,
        ease: "expo.out",
        scrollTrigger: { trigger: ".strength-grid", start: "top 82%", once: true },
      });

      gsap.fromTo(".contact-kicker, .contact-statement, .contact-bottom", {
        autoAlpha: 0,
        y: 86,
        clipPath: "inset(0% 0% 100% 0%)",
      }, {
        autoAlpha: 1,
        y: 0,
        clipPath: "inset(0% 0% 0% 0%)",
        duration: 1.45,
        stagger: 0.2,
        ease: "expo.out",
        scrollTrigger: { trigger: ".contact-kicker", start: "top 84%", once: true },
      });

      ScrollTrigger.refresh();
    }, document.body);

    return () => {
      context.revert();
      root.classList.remove("motion-boot", "motion-enhanced", "motion-opening");
    };
  }, []);
}
