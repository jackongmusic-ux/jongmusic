"use client";

import { type CSSProperties, type HTMLAttributes, type ReactNode } from "react";
import "./BorderGlow.css";

type BorderGlowProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  children: ReactNode;
  edgeSensitivity?: number;
  glowColor?: string;
  backgroundColor?: string;
  borderRadius?: number;
  glowRadius?: number;
  glowIntensity?: number;
  coneSpread?: number;
  colors?: string[];
  fillOpacity?: number;
};

const gradientPositions = ["80% 55%", "69% 34%", "8% 6%", "41% 38%", "86% 85%", "82% 18%", "51% 4%"];
const gradientKeys = ["--gradient-one", "--gradient-two", "--gradient-three", "--gradient-four", "--gradient-five", "--gradient-six", "--gradient-seven"];
const colorMap = [0, 1, 2, 0, 1, 2, 1];

function parseHsl(value: string) {
  const match = value.match(/([\d.]+)\s*([\d.]+)%?\s*([\d.]+)%?/);
  return match
    ? { h: Number(match[1]), s: Number(match[2]), l: Number(match[3]) }
    : { h: 220, s: 85, l: 78 };
}

function buildGlowVars(value: string, intensity: number) {
  const { h, s, l } = parseHsl(value);
  const levels = [100, 60, 50, 40, 30, 20, 10];
  const suffixes = ["", "-60", "-50", "-40", "-30", "-20", "-10"];
  return Object.fromEntries(levels.map((level, index) => [
    `--glow-color${suffixes[index]}`,
    `hsl(${h}deg ${s}% ${l}% / ${Math.min(level * intensity, 100)}%)`,
  ]));
}

function buildGradientVars(colors: string[]) {
  const safeColors = colors.length ? colors : ["#819cff"];
  const entries = gradientKeys.map((key, index) => {
    const color = safeColors[Math.min(colorMap[index], safeColors.length - 1)];
    return [key, `radial-gradient(at ${gradientPositions[index]}, ${color} 0px, transparent 50%)`];
  });
  return Object.fromEntries([...entries, ["--gradient-base", `linear-gradient(${safeColors[0]} 0 100%)`]]);
}

export default function BorderGlow({
  children,
  className = "",
  edgeSensitivity = 24,
  glowColor = "220 85 78",
  backgroundColor = "#0d1623",
  borderRadius = 0,
  glowRadius = 28,
  glowIntensity = 0.78,
  coneSpread = 23,
  colors = ["#8a78ff", "#5286ff", "#85d7ff"],
  fillOpacity = 0.22,
  style,
  ...rest
}: BorderGlowProps) {
  return (
    <div
      {...rest}
      className={`border-glow-card ${className}`.trim()}
      style={{
        "--card-bg": backgroundColor,
        "--edge-sensitivity": edgeSensitivity,
        "--border-radius": `${borderRadius}px`,
        "--glow-padding": `${glowRadius}px`,
        "--cone-spread": coneSpread,
        "--fill-opacity": fillOpacity,
        "--glow-duration": `${Math.max(4.8, 8.4 - edgeSensitivity * 0.08)}s`,
        ...buildGlowVars(glowColor, glowIntensity),
        ...buildGradientVars(colors),
        ...style,
      } as CSSProperties}
    >
      <span className="edge-light" aria-hidden="true" />
      <div className="border-glow-inner">{children}</div>
    </div>
  );
}
