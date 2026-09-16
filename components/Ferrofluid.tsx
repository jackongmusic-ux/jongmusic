"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { Mesh, Program, Renderer, Triangle } from "ogl";
import "./Ferrofluid.css";

const MAX_COLORS = 8;

type FerrofluidProps = {
  colors?: string[];
  backgroundColor?: string;
  speed?: number;
  scale?: number;
  turbulence?: number;
  fluidity?: number;
  rimWidth?: number;
  sharpness?: number;
  shimmer?: number;
  glow?: number;
  flowDirection?: "up" | "down" | "left" | "right";
  opacity?: number;
  mouseInteraction?: boolean;
  mouseStrength?: number;
  mouseRadius?: number;
  mouseDampening?: number;
  mixBlendMode?: CSSProperties["mixBlendMode"];
  paused?: boolean;
  dpr?: number;
  fps?: number;
  className?: string;
};

const hexToRgb = (hex: string) => {
  const value = hex.replace("#", "").padEnd(6, "0");
  return [0, 2, 4].map((offset) => Number.parseInt(value.slice(offset, offset + 2), 16) / 255);
};

const prepareColors = (input: string[]) => {
  const base = (input.length ? input : ["#4F46E5", "#06B6D4", "#E0F2FE"]).slice(0, MAX_COLORS);
  const values = Array.from({ length: MAX_COLORS }, (_, index) => hexToRgb(base[Math.min(index, base.length - 1)]));
  return { values, count: base.length };
};

const flowVector = (direction: FerrofluidProps["flowDirection"]) => {
  if (direction === "up") return [0, 1];
  if (direction === "left") return [-1, 0];
  if (direction === "right") return [1, 0];
  return [0, -1];
};

const vertex = `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}`;

const fragment = `
precision highp float;
uniform vec3 iResolution;
uniform vec2 iMouse;
uniform float iTime;
uniform vec3 uColor0; uniform vec3 uColor1; uniform vec3 uColor2; uniform vec3 uColor3;
uniform vec3 uColor4; uniform vec3 uColor5; uniform vec3 uColor6; uniform vec3 uColor7;
uniform int uColorCount;
uniform vec2 uFlow;
uniform float uSpeed; uniform float uScale; uniform float uTurbulence; uniform float uFluidity;
uniform float uRimWidth; uniform float uSharpness; uniform float uShimmer; uniform float uGlow;
uniform float uOpacity; uniform float uMouseEnabled; uniform float uMouseStrength; uniform float uMouseRadius;
varying vec2 vUv;
#define PI 3.14159265

vec3 palette(float h) {
  int count = uColorCount;
  if (count < 1) count = 1;
  int idx = int(floor(clamp(h, 0.0, 0.999999) * float(count)));
  if (idx <= 0) return uColor0; if (idx == 1) return uColor1; if (idx == 2) return uColor2;
  if (idx == 3) return uColor3; if (idx == 4) return uColor4; if (idx == 5) return uColor5;
  if (idx == 6) return uColor6; return uColor7;
}
float hash(vec3 p3) {
  p3 = fract(p3 * 0.1031);
  p3 += dot(p3, p3.zyx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
float smin(float a, float b, float k) {
  float r = exp2(-a / k) + exp2(-b / k);
  return -k * log2(r);
}
float sinlerp(float a, float b, float w) { return mix(a, b, (sin(w * PI - PI / 2.0) + 1.0) / 2.0); }
float vn(vec2 p, float s, float seed) {
  vec2 cellp = floor(p / s); vec2 relp = mod(p, s);
  float g1 = hash(vec3(cellp, seed)); float g2 = hash(vec3(cellp.x + 1.0, cellp.y, seed));
  float g3 = hash(vec3(cellp.x + 1.0, cellp.y + 1.0, seed)); float g4 = hash(vec3(cellp.x, cellp.y + 1.0, seed));
  float bx = sinlerp(g1, g2, relp.x / s); float tx = sinlerp(g4, g3, relp.x / s);
  return sinlerp(bx, tx, relp.y / s);
}
float dbn(vec2 p, float s, float seed) {
  float o = s / 2.0;
  float n0 = vn(p, s, seed); float n1 = vn(p + vec2(o, o), s, seed + 0.1);
  float n2 = vn(p + vec2(-o, o), s, seed + 0.2); float n3 = vn(p + vec2(o, -o), s, seed + 0.3);
  float n4 = vn(p + vec2(-o, -o), s, seed + 0.4);
  return (2.0 * n0 + 1.5 * n1 + 1.25 * n2 + 1.125 * n3 + n4) / 7.0;
}
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  float ref = 700.0 / max(uScale, 0.05); vec2 p = fragCoord / iResolution.y * ref;
  float spd = 200.0 * uSpeed; float t = iTime; vec2 dir = uFlow; vec2 perp = vec2(-dir.y, dir.x);
  float distort1 = vn(p + perp * (t * spd), 60.0, 10.0) * 50.0 * uTurbulence;
  float distort2 = vn(p - perp * (t * spd), 120.0, 15.0) * 100.0 * uTurbulence;
  float peaks = dbn(p + distort1 + dir * (t * spd * 0.5), 40.0, 1.0);
  float peaks2 = dbn(p + distort2 - dir * (t * spd * 0.5), 40.0, 0.0);
  float mapeaks = smin(peaks, peaks2, max(uFluidity, 0.001));
  float mGlow = 0.0;
  if (uMouseEnabled > 0.5) {
    vec2 mp = iMouse / iResolution.y * ref; float md = length(p - mp) / ref; float rr = max(uMouseRadius, 0.02);
    mGlow = exp(-md * md / (rr * rr)) * uMouseStrength;
  }
  float band = (uRimWidth - abs((mapeaks - 0.4) * 2.0)) * 5.0;
  float ltn = clamp(band - vn(p + dir * (t * spd * 0.5), 60.0, 12.0) * uShimmer, 0.0, 1.0);
  ltn = pow(ltn, uSharpness) * uGlow; ltn *= clamp(1.0 - mGlow, 0.0, 1.0);
  float h = clamp(0.5 + (peaks - peaks2) * 0.8, 0.0, 1.0); vec3 outc = palette(h) * ltn;
  float a = clamp(max(outc.r, max(outc.g, outc.b)), 0.0, 1.0);
  fragColor = vec4(outc, a * uOpacity);
}
void main() { vec4 color; mainImage(color, vUv * iResolution.xy); gl_FragColor = color; }`;

export default function Ferrofluid({
  colors = ["#ffffff", "#ffffff", "#ffffff"],
  backgroundColor = "#000000",
  speed = 0.5,
  scale = 1.6,
  turbulence = 1,
  fluidity = 0.1,
  rimWidth = 0.2,
  sharpness = 2.5,
  shimmer = 1.5,
  glow = 2,
  flowDirection = "down",
  opacity = 1,
  mouseInteraction = true,
  mouseStrength = 1,
  mouseRadius = 0.35,
  mouseDampening = 0.15,
  mixBlendMode,
  paused = false,
  dpr = 1,
  fps = 60,
  className = "",
}: FerrofluidProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.dataset.fallback = "true";
    const probe = document.createElement("canvas").getContext("webgl");
    if (!probe) return;
    probe.getExtension("WEBGL_lose_context")?.loseContext();
    let renderer: Renderer;
    try {
      const compactViewport = window.matchMedia("(max-width: 700px)").matches;
      const renderDpr = compactViewport ? Math.min(dpr, 0.5) : dpr;
      renderer = new Renderer({
        webgl: 1,
        dpr: Math.min(Math.max(renderDpr, 0.5), 1.25),
        alpha: true,
        antialias: false,
        powerPreference: "low-power",
      });
    } catch {
      return;
    }

    const gl = renderer.gl;
    const canvas = gl.canvas;
    gl.clearColor(0, 0, 0, 0);
    canvas.setAttribute("aria-hidden", "true");
    container.appendChild(canvas);
    delete container.dataset.fallback;
    const { values, count } = prepareColors(colors);
    const uniforms = {
      iResolution: { value: new Float32Array([1, 1, 1]) },
      iMouse: { value: new Float32Array([0, 0]) },
      iTime: { value: 0 },
      uColor0: { value: new Float32Array(values[0]) }, uColor1: { value: new Float32Array(values[1]) },
      uColor2: { value: new Float32Array(values[2]) }, uColor3: { value: new Float32Array(values[3]) },
      uColor4: { value: new Float32Array(values[4]) }, uColor5: { value: new Float32Array(values[5]) },
      uColor6: { value: new Float32Array(values[6]) }, uColor7: { value: new Float32Array(values[7]) },
      uColorCount: { value: count }, uFlow: { value: new Float32Array(flowVector(flowDirection)) },
      uSpeed: { value: speed }, uScale: { value: scale }, uTurbulence: { value: turbulence },
      uFluidity: { value: fluidity }, uRimWidth: { value: rimWidth }, uSharpness: { value: sharpness },
      uShimmer: { value: shimmer }, uGlow: { value: glow }, uOpacity: { value: opacity },
      uMouseEnabled: { value: mouseInteraction ? 1 : 0 }, uMouseStrength: { value: mouseStrength },
      uMouseRadius: { value: mouseRadius },
    };

    let geometry: Triangle;
    let program: Program;
    let mesh: Mesh;
    try {
      geometry = new Triangle(gl);
      program = new Program(gl, { vertex, fragment, uniforms });
      mesh = new Mesh(gl, { geometry, program });
    } catch {
      if (canvas.parentElement === container) container.removeChild(canvas);
      container.dataset.fallback = "true";
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      return;
    }

    let frameId = 0;
    let visible = true;
    let pageVisible = !document.hidden;
    let previous = performance.now();
    let elapsed = 0;
    let lastRender = 0;
    const targetMouse = [0, 0];
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const targetFps = window.matchMedia("(max-width: 700px)").matches ? Math.min(fps, 20) : fps;
    const canAnimate = () => visible && pageVisible && !paused && !reducedMotion.matches;
    const render = () => renderer.render({ scene: mesh });
    const stop = () => { if (frameId) cancelAnimationFrame(frameId); frameId = 0; };
    const loop = (time: number) => {
      frameId = 0;
      if (!canAnimate()) return;
      const delta = Math.min((time - previous) / 1000, 0.1);
      previous = time;
      elapsed += delta;
      if (mouseDampening > 0) {
        const factor = Math.min(1, 1 - Math.exp(-delta / Math.max(0.0001, mouseDampening)));
        uniforms.iMouse.value[0] += (targetMouse[0] - uniforms.iMouse.value[0]) * factor;
        uniforms.iMouse.value[1] += (targetMouse[1] - uniforms.iMouse.value[1]) * factor;
      }
      if (time - lastRender >= 1000 / Math.max(1, targetFps) - 0.5) {
        uniforms.iTime.value = elapsed;
        render();
        lastRender = time;
      }
      frameId = requestAnimationFrame(loop);
    };
    const start = () => { if (!frameId && canAnimate()) { previous = performance.now(); frameId = requestAnimationFrame(loop); } };
    const resize = () => {
      const rect = container.getBoundingClientRect();
      renderer.setSize(Math.max(1, Math.floor(rect.width)), Math.max(1, Math.floor(rect.height)));
      uniforms.iResolution.value[0] = gl.drawingBufferWidth;
      uniforms.iResolution.value[1] = gl.drawingBufferHeight;
      render();
    };
    const onPointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const scale = renderer.dpr || 1;
      targetMouse[0] = (event.clientX - rect.left) * scale;
      targetMouse[1] = (rect.height - (event.clientY - rect.top)) * scale;
      if (mouseDampening <= 0) uniforms.iMouse.value.set(targetMouse);
    };
    const onVisibilityChange = () => { pageVisible = !document.hidden; if (canAnimate()) start(); else stop(); };
    const onReducedMotionChange = () => { if (canAnimate()) start(); else { stop(); render(); } };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (canAnimate()) start(); else stop();
    });
    intersectionObserver.observe(container);
    document.addEventListener("visibilitychange", onVisibilityChange);
    reducedMotion.addEventListener("change", onReducedMotionChange);
    if (mouseInteraction) canvas.addEventListener("pointermove", onPointerMove);
    resize();
    start();

    return () => {
      stop();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      reducedMotion.removeEventListener("change", onReducedMotionChange);
      canvas.removeEventListener("pointermove", onPointerMove);
      if (canvas.parentElement === container) container.removeChild(canvas);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [colors, speed, scale, turbulence, fluidity, rimWidth, sharpness, shimmer, glow, flowDirection, opacity, mouseInteraction, mouseStrength, mouseRadius, mouseDampening, paused, dpr, fps]);

  return (
    <div
      ref={containerRef}
      className={`ferrofluid-container ${className}`.trim()}
      style={{ backgroundColor, ...(mixBlendMode ? { mixBlendMode } : {}) }}
      aria-hidden="true"
    />
  );
}
