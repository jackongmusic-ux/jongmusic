"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const Ferrofluid = dynamic(() => import("@/components/Ferrofluid"), { ssr: false });
const colors = ["#00476b", "#004770", "#ffffff"];

export default function EditorialBackground() {
  const shellRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const shell = shellRef.current;
    if (!shell) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setActive(true);
      observer.disconnect();
    }, { rootMargin: "110% 0px" });
    observer.observe(shell);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={shellRef} className="editorial-ferrofluid" aria-hidden="true">
      {active ? (
        <Ferrofluid
          className="editorial-ferrofluid__canvas"
          colors={colors}
          backgroundColor="#000000"
          speed={0.36}
          scale={1.28}
          turbulence={0.72}
          fluidity={0.12}
          rimWidth={0.19}
          sharpness={3.15}
          shimmer={1.25}
          glow={1.55}
          flowDirection="down"
          opacity={0.54}
          mouseInteraction={false}
          dpr={0.55}
          fps={24}
        />
      ) : null}
    </div>
  );
}
