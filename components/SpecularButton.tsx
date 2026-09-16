"use client";

import { type ButtonHTMLAttributes, type CSSProperties, type ReactNode } from "react";
import "./SpecularButton.css";

type SpecularButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "size"> & {
  children?: ReactNode;
  size?: "sm" | "md" | "lg";
  radius?: number;
  tint?: string;
  tintOpacity?: number;
  blur?: number;
  textColor?: string;
  lineColor?: string;
  baseColor?: string;
  intensity?: number;
  shineSize?: number;
  shineFade?: number;
  thickness?: number;
  speed?: number;
  followMouse?: boolean;
  proximity?: number;
  autoAnimate?: boolean;
};

export default function SpecularButton({
  children = "Get Started",
  size = "lg",
  radius = 18,
  tint = "#ffffff",
  tintOpacity = 0,
  blur = 0,
  textColor = "#f5f5f5",
  lineColor = "#ffffff",
  baseColor = "#525252",
  intensity = 1,
  shineSize = 10,
  shineFade = 40,
  thickness = 1,
  speed = 0.35,
  followMouse = true,
  proximity = 250,
  autoAnimate = false,
  disabled = false,
  className = "",
  style,
  type = "button",
  ...buttonProps
}: SpecularButtonProps) {
  const duration = `${Math.max(4.8, (Math.PI * 2) / Math.max(speed, 0.08)).toFixed(2)}s`;

  return (
    <button
      type={type}
      disabled={disabled}
      className={`specular-button specular-button--${size}${autoAnimate ? " is-auto-animated" : ""}${className ? ` ${className}` : ""}`}
      data-follow-mouse={followMouse ? "true" : "false"}
      data-proximity={proximity}
      style={{
        "--sb-radius": `${radius}px`,
        "--sb-tint": tint,
        "--sb-tint-opacity": tintOpacity,
        "--sb-blur": `${blur}px`,
        "--sb-text-color": textColor,
        "--sb-line-color": lineColor,
        "--sb-base-color": baseColor,
        "--sb-intensity": Math.max(0, intensity),
        "--sb-shine-size": `${Math.max(2, shineSize)}deg`,
        "--sb-shine-fade": `${Math.max(4, shineFade)}deg`,
        "--sb-thickness": `${Math.max(0.5, thickness)}px`,
        "--sb-duration": duration,
        ...style,
      } as CSSProperties}
      {...buttonProps}
    >
      <span className="specular-button__label">{children}</span>
    </button>
  );
}
