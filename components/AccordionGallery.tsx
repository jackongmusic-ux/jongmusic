"use client";

import { useMemo, useRef, useState } from "react";
import "./AccordionGallery.css";

export type AccordionGalleryItem = {
  image: string;
  alt: string;
  label?: string;
  position?: string;
};

type AccordionGalleryProps = {
  items: AccordionGalleryItem[];
  defaultIndex?: number;
  accentColor?: string;
  overlayColor?: string;
  expandRatio?: number;
  height?: number;
  gap?: number;
  radius?: number;
  duration?: number;
  ease?: string;
  parallax?: number;
  tilt?: number;
  trigger?: "hover" | "click";
  grayscale?: boolean;
  showLabels?: boolean;
};

export default function AccordionGallery({
  items,
  defaultIndex = 0,
  accentColor = "#dce9ff",
  overlayColor = "#061426",
  expandRatio = 0.58,
  height = 620,
  gap = 10,
  radius = 28,
  duration = 0.72,
  ease = "power4.out",
  parallax = 0.5,
  tilt = 6,
  trigger = "hover",
  grayscale = true,
}: AccordionGalleryProps) {
  const safeDefault = Math.min(Math.max(defaultIndex, 0), Math.max(items.length - 1, 0));
  const [activeIndex, setActiveIndex] = useState(safeDefault);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const [activeBasis, idleBasis] = useMemo(() => {
    const ratio = Math.min(Math.max(expandRatio, 0.35), 0.8);
    const active = ratio * 100;
    const idle = items.length > 1 ? (100 - active) / (items.length - 1) : 100;
    return [active, idle];
  }, [expandRatio, items.length]);

  const moveFocus = (index: number) => {
    const next = (index + items.length) % items.length;
    setActiveIndex(next);
    panelRefs.current[next]?.focus();
  };

  return (
    <div
      className="ag-root"
      ref={rootRef}
      role="group"
      aria-label="翁梓铭艺术家肖像"
      style={{
        "--ag-height": `${height}px`,
        "--ag-gap": `${gap}px`,
        "--ag-radius": `${radius}px`,
        "--ag-accent": accentColor,
        "--ag-overlay": overlayColor,
        "--ag-duration": `${duration}s`,
        "--ag-ease": ease === "power2.inOut" ? "cubic-bezier(.65, 0, .35, 1)" : "cubic-bezier(.2, .8, .2, 1)",
      } as React.CSSProperties}
    >
      {items.map((item, index) => {
        const active = index === activeIndex;
        const imageTilt = active ? 0 : (index < activeIndex ? tilt : -tilt) * 0.08;
        const drift = Math.max(-1.5, Math.min(1.5, activeIndex - index));
        const imageFilter = grayscale
          ? active
            ? "grayscale(.08) saturate(.86) contrast(1.06) brightness(.72)"
            : "grayscale(.94) saturate(.4) contrast(1.12) brightness(.46)"
          : active
            ? "saturate(.9) contrast(1.05) brightness(.72)"
            : "saturate(.55) contrast(1.1) brightness(.48)";
        return (
          <button
            className={`ag-panel${active ? " ag-panel--active" : ""}`}
            key={item.image}
            ref={(node) => { panelRefs.current[index] = node; }}
            type="button"
            aria-pressed={active}
            aria-label={`查看${item.label ?? `第 ${index + 1} 张肖像`}`}
            style={{ flexBasis: `${active ? activeBasis : idleBasis}%` }}
            onPointerEnter={() => {
              if (trigger === "hover" && window.matchMedia("(hover: hover)").matches) setActiveIndex(index);
            }}
            onClick={() => setActiveIndex(index)}
            onFocus={() => setActiveIndex(index)}
            onKeyDown={(event) => {
              if (event.key === "ArrowRight" || event.key === "ArrowDown") {
                event.preventDefault();
                moveFocus(index + 1);
              }
              if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
                event.preventDefault();
                moveFocus(index - 1);
              }
              if (event.key === "Home") {
                event.preventDefault();
                moveFocus(0);
              }
              if (event.key === "End") {
                event.preventDefault();
                moveFocus(items.length - 1);
              }
            }}
          >
            <img
              src={item.image}
              alt={item.alt}
              loading={active ? "eager" : "lazy"}
              decoding="async"
              style={{
                objectPosition: item.position ?? "center",
                filter: imageFilter,
                transform: `translate3d(${active ? 0 : drift * parallax * 3.4}%, 0, 0) scale(${active ? 1.01 : 1.1}) rotate(${imageTilt}deg)`,
              }}
            />
            <span className="ag-panel__shade" aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}
