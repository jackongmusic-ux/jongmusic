"use client";

import { useEffect, useRef } from "react";
import { Mesh, Program, Renderer, Triangle } from "ogl";
import "./GhostFibers.css";

type GhostFibersProps = {
  lineColor?: string;
  glowColor?: string;
  speed?: number;
  scale?: number;
  rotation?: number;
  rotationSpeed?: number;
  layers?: number;
  waveAmplitude?: number;
  waveFrequency?: number;
  waveSpeed?: number;
  layerSpeed?: number;
  twist?: number;
  twistFrequency?: number;
  twistSpeed?: number;
  lineFrequency?: number;
  lineSpacing?: number;
  lineSharpness?: number;
  glowFalloff?: number;
  glowIntensity?: number;
  brightness?: number;
  blueBoost?: number;
  vignette?: number;
  grain?: number;
  dpr?: number;
  fps?: number;
  paused?: boolean;
  className?: string;
};

const hexToRgb = (hex: string) => {
  const value = hex.trim().replace(/^#/, "");
  const normalized = value.length === 3 ? value.replace(/./g, (channel) => channel + channel) : value;
  const match = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(normalized);
  return match
    ? [parseInt(match[1], 16) / 255, parseInt(match[2], 16) / 255, parseInt(match[3], 16) / 255]
    : [1, 1, 1];
};

const vertex = `#version 300 es
in vec2 position;
void main() { gl_Position = vec4(position, 0.0, 1.0); }
`;

const fragment = `#version 300 es
precision highp float;
uniform vec2 uResolution;
uniform float uTime;
uniform float uSpeed;
uniform float uScale;
uniform float uRotation;
uniform float uRotationSpeed;
uniform float uLayers;
uniform float uWaveAmplitude;
uniform float uWaveFrequency;
uniform float uWaveSpeed;
uniform float uLayerSpeed;
uniform float uTwist;
uniform float uTwistFrequency;
uniform float uTwistSpeed;
uniform float uLineFrequency;
uniform float uLineSpacing;
uniform float uLineSharpness;
uniform float uGlowFalloff;
uniform float uGlowIntensity;
uniform float uBrightness;
uniform float uBlueBoost;
uniform float uVignette;
uniform float uGrain;
uniform vec3 uLineColor;
uniform vec3 uGlowColor;
out vec4 fragColor;
#define MAX_LAYERS 10

mat2 rotate2d(float angle) {
  float sine = sin(angle);
  float cosine = cos(angle);
  return mat2(cosine, -sine, sine, cosine);
}

float grainHash(vec2 point) {
  point = floor(point);
  float hash = 52.9829189 * fract(dot(point, vec2(0.065, 0.005)));
  return fract(hash);
}

float layeredGrain(vec2 fragmentPixel) {
  vec2 point = mod(fragmentPixel + vec2(uTime * 30.0, -uTime * 21.0), 1024.0);
  vec2 rotated = mat2(0.8, -0.5, 0.5, 0.8) * point;
  float grain = 0.0;
  grain += 0.40 * grainHash(rotated);
  grain += 0.25 * grainHash(rotated * 2.0 + 17.0);
  grain += 0.20 * grainHash(rotated * 4.0 + 47.0);
  grain += 0.10 * grainHash(rotated * 8.0 + 113.0);
  grain += 0.05 * grainHash(rotated * 16.0 + 191.0);
  return grain;
}

void main() {
  vec2 resolution = max(uResolution, vec2(1.0));
  vec2 uv = (2.0 * gl_FragCoord.xy - resolution) / resolution.y;
  float time = uTime * uSpeed;
  vec3 backdrop = vec3(0.070588, 0.058824, 0.090196);
  vec3 centerTone = max(uLineColor * 0.85567 - uGlowColor * 0.06186, vec3(0.0));
  vec3 cloudTone = uLineColor * 0.19588 + uGlowColor * 0.2268;
  vec2 p = rotate2d(radians(uRotation) + time * uRotationSpeed) * (uv / max(uScale, 0.05));
  vec3 color = vec3(0.0);

  for (int index = 0; index < MAX_LAYERS; index++) {
    float fi = float(index) + 1.0;
    if (fi > uLayers) break;
    p += uWaveAmplitude * sin(p.yx * fi * uWaveFrequency + time * (uWaveSpeed + fi * uLayerSpeed));
    float radius = length(p);
    float polarAngle = atan(p.y, p.x);
    polarAngle += sin(radius * uTwistFrequency - time * uTwistSpeed + fi) * uTwist;
    p = vec2(cos(polarAngle), sin(polarAngle)) * radius;
    float lines = abs(sin(p.x * (uLineFrequency + fi * uLineSpacing) + sin(p.y * 3.0 + time)));
    lines = pow(max(0.0, 1.0 - lines), uLineSharpness);
    color += uLineColor * lines / fi;
    float glow = exp(-uGlowFalloff * abs(sin(p.x * 3.0 + time + fi)));
    color += uGlowColor * glow * uGlowIntensity / (fi * 2.0);
  }

  float center = exp(-2.2 * dot(uv, uv));
  color += centerTone * center;
  float cloud = exp(-1.5 * length(uv + vec2(sin(time * 0.3) * 0.25, cos(time * 0.25) * 0.18)));
  color += cloudTone * cloud;
  float vignette = 1.0 - smoothstep(0.35, 1.45, length(uv));
  color *= mix(1.0 - uVignette, 1.0, vignette);
  color = 1.0 - exp(-color * uBrightness);
  color.b *= uBlueBoost;
  vec3 outputColor = backdrop + color;
  float noise = (layeredGrain(gl_FragCoord.xy) - 0.5) * uGrain;
  fragColor = vec4(clamp(outputColor + noise, 0.0, 1.0), 1.0);
}
`;

type FiberContext = {
  program: Program;
  render: () => void;
  setPaused: (value: boolean) => void;
  setFps: (value: number) => void;
};

const contexts = new WeakMap<HTMLDivElement, FiberContext>();

export default function GhostFibers({
  lineColor = "#140E35",
  glowColor = "#3437A0",
  speed = 0.2,
  scale = 2,
  rotation = 0,
  rotationSpeed = 0.25,
  layers = 4,
  waveAmplitude = 0.015,
  waveFrequency = 3,
  waveSpeed = 0.15,
  layerSpeed = 0.08,
  twist = 0.1,
  twistFrequency = 5,
  twistSpeed = 1.2,
  lineFrequency = 5,
  lineSpacing = 2,
  lineSharpness = 16,
  glowFalloff = 10,
  glowIntensity = 1.6,
  brightness = 2,
  blueBoost = 1.25,
  vignette = 0.8,
  grain = 0.05,
  dpr = 1,
  fps = 60,
  paused = false,
  className = "",
}: GhostFibersProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const probe = document.createElement("canvas").getContext("webgl2");
    if (!probe) {
      container.dataset.fallback = "true";
      return;
    }
    probe.getExtension("WEBGL_lose_context")?.loseContext();
    let renderer: Renderer;
    try {
      renderer = new Renderer({ webgl: 2, alpha: false, antialias: false, dpr: Math.min(Math.max(dpr, 0.5), 2) });
    } catch {
      container.dataset.fallback = "true";
      return;
    }

    const gl = renderer.gl;
    const canvas = gl.canvas;
    canvas.setAttribute("aria-hidden", "true");
    container.appendChild(canvas);
    const geometry = new Triangle(gl);
    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        uResolution: { value: new Float32Array([1, 1]) },
        uTime: { value: 0 }, uSpeed: { value: 0.2 }, uScale: { value: 2 },
        uRotation: { value: 0 }, uRotationSpeed: { value: 0.25 }, uLayers: { value: 4 },
        uWaveAmplitude: { value: 0.015 }, uWaveFrequency: { value: 3 }, uWaveSpeed: { value: 0.15 },
        uLayerSpeed: { value: 0.08 }, uTwist: { value: 0.1 }, uTwistFrequency: { value: 5 },
        uTwistSpeed: { value: 1.2 }, uLineFrequency: { value: 5 }, uLineSpacing: { value: 2 },
        uLineSharpness: { value: 16 }, uGlowFalloff: { value: 10 }, uGlowIntensity: { value: 1.6 },
        uBrightness: { value: 2 }, uBlueBoost: { value: 1.25 }, uVignette: { value: 0.8 },
        uGrain: { value: 0.05 }, uLineColor: { value: new Float32Array(hexToRgb("#140E35")) },
        uGlowColor: { value: new Float32Array(hexToRgb("#3437A0")) },
      },
    });
    const mesh = new Mesh(gl, { geometry, program });
    let frameId = 0;
    let elapsed = 0;
    let previousTime = performance.now();
    let lastRenderTime = 0;
    let frameRate = 60;
    let isPaused = false;
    let isVisible = true;
    let isPageVisible = !document.hidden;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const render = () => renderer.render({ scene: mesh });
    const stop = () => { if (frameId) cancelAnimationFrame(frameId); frameId = 0; };
    const canAnimate = () => isVisible && isPageVisible && !isPaused && !reducedMotion.matches;
    const loop = (now: number) => {
      frameId = 0;
      if (!canAnimate()) return;
      elapsed += Math.min((now - previousTime) / 1000, 0.1);
      previousTime = now;
      if (now - lastRenderTime >= 1000 / frameRate - 0.5) {
        program.uniforms.uTime.value = elapsed;
        render();
        lastRenderTime = now;
      }
      frameId = requestAnimationFrame(loop);
    };
    const start = () => {
      if (!canAnimate() || frameId) return;
      previousTime = performance.now();
      frameId = requestAnimationFrame(loop);
    };
    const setSize = () => {
      const rect = container.getBoundingClientRect();
      renderer.setSize(Math.max(1, Math.floor(rect.width)), Math.max(1, Math.floor(rect.height)));
      program.uniforms.uResolution.value[0] = gl.drawingBufferWidth;
      program.uniforms.uResolution.value[1] = gl.drawingBufferHeight;
      render();
    };
    const updatePageVisibility = () => {
      isPageVisible = !document.hidden;
      if (canAnimate()) start();
      else stop();
    };
    const updateReducedMotion = () => {
      if (canAnimate()) start();
      else stop();
      render();
    };
    const resizeObserver = new ResizeObserver(setSize);
    resizeObserver.observe(container);
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      if (canAnimate()) start();
      else stop();
    });
    intersectionObserver.observe(container);
    document.addEventListener("visibilitychange", updatePageVisibility);
    reducedMotion.addEventListener("change", updateReducedMotion);
    contexts.set(container, {
      program, render,
      setPaused(value) {
        isPaused = value;
        if (canAnimate()) start();
        else {
          stop();
          render();
        }
      },
      setFps(value) { frameRate = Math.min(Math.max(value, 1), 120); },
    });
    setSize();
    start();

    return () => {
      stop();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", updatePageVisibility);
      reducedMotion.removeEventListener("change", updateReducedMotion);
      contexts.delete(container);
      if (canvas.parentNode === container) container.removeChild(canvas);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [dpr]);

  useEffect(() => {
    const container = containerRef.current;
    const context = container ? contexts.get(container) : undefined;
    if (!context) return;
    const uniforms = context.program.uniforms;
    const setColor = (name: string, value: string) => {
      const rgb = hexToRgb(value);
      uniforms[name].value.set(rgb);
    };
    setColor("uLineColor", lineColor);
    setColor("uGlowColor", glowColor);
    Object.entries({ uSpeed: speed, uScale: scale, uRotation: rotation, uRotationSpeed: rotationSpeed,
      uLayers: Math.min(Math.max(Math.round(layers), 1), 10), uWaveAmplitude: waveAmplitude,
      uWaveFrequency: waveFrequency, uWaveSpeed: waveSpeed, uLayerSpeed: layerSpeed, uTwist: twist,
      uTwistFrequency: twistFrequency, uTwistSpeed: twistSpeed, uLineFrequency: lineFrequency,
      uLineSpacing: lineSpacing, uLineSharpness: lineSharpness, uGlowFalloff: glowFalloff,
      uGlowIntensity: glowIntensity, uBrightness: brightness, uBlueBoost: blueBoost,
      uVignette: vignette, uGrain: grain }).forEach(([name, value]) => { uniforms[name].value = value; });
    context.setFps(fps);
    context.setPaused(paused);
    context.render();
  }, [lineColor, glowColor, speed, scale, rotation, rotationSpeed, layers, waveAmplitude, waveFrequency, waveSpeed, layerSpeed, twist, twistFrequency, twistSpeed, lineFrequency, lineSpacing, lineSharpness, glowFalloff, glowIntensity, brightness, blueBoost, vignette, grain, fps, paused, dpr]);

  return <div ref={containerRef} className={`ghost-fibers-container ${className}`.trim()} aria-hidden="true" />;
}
