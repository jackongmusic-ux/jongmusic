"use client";

import React, { useEffect, useRef, type ReactNode } from "react";

type FuzzyTextProps = {
  children: ReactNode;
  fontSize?: number | string;
  fontWeight?: number | string;
  fontFamily?: string;
  color?: string;
  enableHover?: boolean;
  baseIntensity?: number;
  hoverIntensity?: number;
  fuzzRange?: number;
  fps?: number;
  direction?: "horizontal" | "vertical" | "both";
  transitionDuration?: number;
  clickEffect?: boolean;
  glitchMode?: boolean;
  glitchInterval?: number;
  glitchDuration?: number;
  gradient?: string[] | null;
  letterSpacing?: number | string;
  className?: string;
};

export default function FuzzyText({
  children,
  fontSize = "clamp(2rem, 8vw, 8rem)",
  fontWeight = 900,
  fontFamily = "inherit",
  color = "#fff",
  enableHover = true,
  baseIntensity = 0.18,
  hoverIntensity = 0.5,
  fuzzRange = 30,
  fps = 60,
  direction = "horizontal",
  transitionDuration = 0,
  clickEffect = false,
  glitchMode = false,
  glitchInterval = 2000,
  glitchDuration = 200,
  gradient = null,
  letterSpacing = 0,
  className = "",
}: FuzzyTextProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let animationFrameId = 0;
    let glitchTimeoutId = 0;
    let glitchEndTimeoutId = 0;
    let clickTimeoutId = 0;
    let resizeTimeoutId = 0;
    let cancelled = false;
    let initialiseVersion = 0;
    let dispose = () => {};

    const initialise = async () => {
      const version = ++initialiseVersion;
      dispose();
      const context = canvas.getContext("2d");
      if (!context) return;

      const computedFontFamily = fontFamily === "inherit"
        ? window.getComputedStyle(canvas).fontFamily || "sans-serif"
        : fontFamily;
      const measuringNode = document.createElement("span");
      measuringNode.style.cssText = "position:absolute;visibility:hidden;pointer-events:none;white-space:nowrap;";
      measuringNode.style.fontSize = typeof fontSize === "number" ? `${fontSize}px` : fontSize;
      measuringNode.style.fontFamily = computedFontFamily;
      (canvas.parentElement ?? document.body).appendChild(measuringNode);
      const numericFontSize = Number.parseFloat(window.getComputedStyle(measuringNode).fontSize) || 128;
      measuringNode.remove();
      const fontString = `${fontWeight} ${numericFontSize}px ${computedFontFamily}`;
      const text = React.Children.toArray(children).join("");
      const resolveLetterSpacing = () => {
        if (typeof letterSpacing === "number") return letterSpacing;
        const normalizedSpacing = letterSpacing.trim().toLowerCase();
        const numericSpacing = Number.parseFloat(normalizedSpacing);
        if (!Number.isFinite(numericSpacing)) return 0;
        if (normalizedSpacing.endsWith("rem")) {
          const rootFontSize = Number.parseFloat(window.getComputedStyle(document.documentElement).fontSize) || 16;
          return numericSpacing * rootFontSize;
        }
        if (normalizedSpacing.endsWith("em")) return numericSpacing * numericFontSize;
        if (normalizedSpacing.endsWith("%")) return numericSpacing * numericFontSize / 100;
        return numericSpacing;
      };
      const resolvedLetterSpacing = resolveLetterSpacing();

      if (document.fonts) {
        try {
          await document.fonts.load(fontString, text);
        } catch {
          // Keep the fallback stack available if a font request is interrupted.
        }
      }

      if (cancelled || version !== initialiseVersion) return;

      const offscreen = document.createElement("canvas");
      const offscreenContext = offscreen.getContext("2d");
      if (!offscreenContext) return;
      offscreenContext.font = fontString;
      offscreenContext.textBaseline = "alphabetic";

      let totalWidth = 0;
      if (resolvedLetterSpacing !== 0) {
        for (const character of text) totalWidth += offscreenContext.measureText(character).width + resolvedLetterSpacing;
        totalWidth -= resolvedLetterSpacing;
      } else {
        totalWidth = offscreenContext.measureText(text).width;
      }

      const metrics = offscreenContext.measureText(text);
      const actualLeft = metrics.actualBoundingBoxLeft || 0;
      const actualRight = resolvedLetterSpacing !== 0 ? totalWidth : metrics.actualBoundingBoxRight || metrics.width;
      const actualAscent = metrics.actualBoundingBoxAscent || numericFontSize;
      const actualDescent = metrics.actualBoundingBoxDescent || numericFontSize * 0.2;
      const textWidth = Math.ceil(resolvedLetterSpacing !== 0 ? totalWidth : actualLeft + actualRight);
      const textHeight = Math.ceil(actualAscent + actualDescent);
      const buffer = 10;
      const offscreenWidth = textWidth + buffer;
      offscreen.width = offscreenWidth;
      offscreen.height = textHeight;
      offscreenContext.font = fontString;
      offscreenContext.textBaseline = "alphabetic";

      if (gradient && gradient.length >= 2) {
        const fill = offscreenContext.createLinearGradient(0, 0, offscreenWidth, 0);
        gradient.forEach((gradientColor, index) => fill.addColorStop(index / (gradient.length - 1), gradientColor));
        offscreenContext.fillStyle = fill;
      } else {
        offscreenContext.fillStyle = color;
      }

      const xOffset = buffer / 2;
      if (resolvedLetterSpacing !== 0) {
        let x = xOffset;
        for (const character of text) {
          offscreenContext.fillText(character, x, actualAscent);
          x += offscreenContext.measureText(character).width + resolvedLetterSpacing;
        }
      } else {
        offscreenContext.fillText(text, xOffset - actualLeft, actualAscent);
      }

      const horizontalMargin = fuzzRange + 20;
      canvas.width = offscreenWidth + horizontalMargin * 2;
      canvas.height = textHeight;
      context.setTransform(1, 0, 0, 1, horizontalMargin, 0);

      const interactiveLeft = horizontalMargin + xOffset;
      const interactiveRight = interactiveLeft + textWidth;
      let hovering = false;
      let clicking = false;
      let glitching = false;
      let currentIntensity = baseIntensity;
      let lastFrameTime = 0;
      const frameDuration = 1000 / Math.max(1, fps);
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      let inViewport = true;
      let pageVisible = !document.hidden;
      const shouldAnimate = () => inViewport && pageVisible && !reduceMotion;

      const startGlitchLoop = () => {
        if (!glitchMode || reduceMotion || cancelled) return;
        glitchTimeoutId = window.setTimeout(() => {
          glitching = true;
          glitchEndTimeoutId = window.setTimeout(() => {
            glitching = false;
            startGlitchLoop();
          }, glitchDuration);
        }, glitchInterval);
      };

      const scheduleNextFrame = () => {
        if (!animationFrameId && shouldAnimate() && !cancelled) animationFrameId = requestAnimationFrame(draw);
      };

      const draw = (timestamp: number) => {
        animationFrameId = 0;
        if (cancelled) return;
        if (timestamp - lastFrameTime < frameDuration) {
          scheduleNextFrame();
          return;
        }
        lastFrameTime = timestamp;
        context.clearRect(-horizontalMargin, -fuzzRange, canvas.width, textHeight + fuzzRange * 2);
        const targetIntensity = reduceMotion ? 0 : clicking || glitching ? 1 : hovering ? hoverIntensity : baseIntensity;
        if (transitionDuration > 0) {
          const step = Math.min(1, frameDuration / transitionDuration);
          currentIntensity += (targetIntensity - currentIntensity) * step;
        } else {
          currentIntensity = targetIntensity;
        }

        if (direction === "vertical") {
          for (let x = 0; x < offscreenWidth; x += 1) {
            const offset = Math.floor(currentIntensity * (Math.random() - 0.5) * fuzzRange);
            context.drawImage(offscreen, x, 0, 1, textHeight, x, offset, 1, textHeight);
          }
        } else {
          for (let y = 0; y < textHeight; y += 1) {
            const offset = Math.floor(currentIntensity * (Math.random() - 0.5) * fuzzRange);
            context.drawImage(offscreen, 0, y, offscreenWidth, 1, offset, y, offscreenWidth, 1);
          }
          if (direction === "both" && currentIntensity > 0) {
            const snapshot = document.createElement("canvas");
            snapshot.width = canvas.width;
            snapshot.height = canvas.height;
            snapshot.getContext("2d")?.drawImage(canvas, 0, 0);
            context.clearRect(-horizontalMargin, -fuzzRange, canvas.width, textHeight + fuzzRange * 2);
            for (let x = 0; x < offscreenWidth; x += 1) {
              const offset = Math.floor(currentIntensity * (Math.random() - 0.5) * fuzzRange * 0.45);
              context.drawImage(snapshot, x + horizontalMargin, 0, 1, textHeight, x, offset, 1, textHeight);
            }
          }
        }
        scheduleNextFrame();
      };

      const visibilityObserver = new IntersectionObserver(([entry]) => {
        inViewport = entry.isIntersecting && getComputedStyle(canvas).display !== "none";
        if (inViewport) scheduleNextFrame();
        else {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = 0;
        }
      }, { rootMargin: "160px" });
      visibilityObserver.observe(canvas);

      const onVisibilityChange = () => {
        pageVisible = !document.hidden;
        if (pageVisible) scheduleNextFrame();
        else {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = 0;
        }
      };
      document.addEventListener("visibilitychange", onVisibilityChange);

      const isInsideText = (event: PointerEvent) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / Math.max(1, rect.width);
        const scaleY = canvas.height / Math.max(1, rect.height);
        const x = (event.clientX - rect.left) * scaleX;
        const y = (event.clientY - rect.top) * scaleY;
        return x >= interactiveLeft && x <= interactiveRight && y >= 0 && y <= textHeight;
      };
      const onPointerMove = (event: PointerEvent) => { if (enableHover) hovering = isInsideText(event); };
      const onPointerLeave = () => { hovering = false; };
      const onClick = () => {
        if (!clickEffect) return;
        clicking = true;
        window.clearTimeout(clickTimeoutId);
        clickTimeoutId = window.setTimeout(() => { clicking = false; }, 150);
      };

      if (enableHover) {
        canvas.addEventListener("pointermove", onPointerMove);
        canvas.addEventListener("pointerleave", onPointerLeave);
      }
      if (clickEffect) canvas.addEventListener("click", onClick);
      startGlitchLoop();
      draw(performance.now() + frameDuration);

      dispose = () => {
        cancelAnimationFrame(animationFrameId);
        window.clearTimeout(glitchTimeoutId);
        window.clearTimeout(glitchEndTimeoutId);
        window.clearTimeout(clickTimeoutId);
        visibilityObserver.disconnect();
        document.removeEventListener("visibilitychange", onVisibilityChange);
        canvas.removeEventListener("pointermove", onPointerMove);
        canvas.removeEventListener("pointerleave", onPointerLeave);
        canvas.removeEventListener("click", onClick);
      };
    };

    const onResize = () => {
      window.clearTimeout(resizeTimeoutId);
      resizeTimeoutId = window.setTimeout(() => { void initialise(); }, 120);
    };
    window.addEventListener("resize", onResize);
    void initialise();
    return () => {
      cancelled = true;
      initialiseVersion += 1;
      window.removeEventListener("resize", onResize);
      window.clearTimeout(resizeTimeoutId);
      dispose();
    };
  }, [children, fontSize, fontWeight, fontFamily, color, enableHover, baseIntensity, hoverIntensity, fuzzRange, fps, direction, transitionDuration, clickEffect, glitchMode, glitchInterval, glitchDuration, gradient, letterSpacing]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
