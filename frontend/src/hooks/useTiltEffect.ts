import { useCallback, useEffect, useMemo, useRef } from "react";
import type React from "react";

type Params = {
  enabled?: boolean;
  maxTiltDeg?: number;
  scale?: number;
};

export const useTiltEffect = (params: Params = {}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const enabled = params.enabled ?? true;
  const maxTiltDeg = params.maxTiltDeg ?? 12;
  const scale = params.scale ?? 1.02;

  const canHover = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  }, []);

  const isEnabled = enabled && canHover;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--tilt-rx", "0deg");
    el.style.setProperty("--tilt-ry", "0deg");
    el.style.setProperty("--tilt-scale", "1");
    el.style.setProperty("--tilt-x", "50%");
    el.style.setProperty("--tilt-y", "50%");
    el.style.setProperty("--tilt-glare", "0");
  }, []);

  const onMouseEnter = useCallback(() => {
    if (!isEnabled) return;
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--tilt-scale", String(scale));
    el.style.setProperty("--tilt-glare", "1");
  }, [isEnabled, scale]);

  const onMouseLeave = useCallback(() => {
    if (!isEnabled) return;
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--tilt-rx", "0deg");
    el.style.setProperty("--tilt-ry", "0deg");
    el.style.setProperty("--tilt-scale", "1");
    el.style.setProperty("--tilt-x", "50%");
    el.style.setProperty("--tilt-y", "50%");
    el.style.setProperty("--tilt-glare", "0");
  }, [isEnabled]);

  const frame = useRef<number | null>(null);
  const lastEvent = useRef<{ clientX: number; clientY: number } | null>(null);

  const apply = useCallback(() => {
    frame.current = null;
    if (!isEnabled) return;
    const el = ref.current;
    const ev = lastEvent.current;
    if (!el || !ev) return;

    const rect = el.getBoundingClientRect();
    const x = rect.width > 0 ? (ev.clientX - rect.left) / rect.width : 0.5;
    const y = rect.height > 0 ? (ev.clientY - rect.top) / rect.height : 0.5;
    const clampedX = Math.max(0, Math.min(1, x));
    const clampedY = Math.max(0, Math.min(1, y));

    const rotateY = (clampedX - 0.5) * (maxTiltDeg * 2);
    const rotateX = -(clampedY - 0.5) * (maxTiltDeg * 2);

    el.style.setProperty("--tilt-ry", `${rotateY.toFixed(2)}deg`);
    el.style.setProperty("--tilt-rx", `${rotateX.toFixed(2)}deg`);
    el.style.setProperty("--tilt-x", `${(clampedX * 100).toFixed(1)}%`);
    el.style.setProperty("--tilt-y", `${(clampedY * 100).toFixed(1)}%`);
  }, [isEnabled, maxTiltDeg]);

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isEnabled) return;
      lastEvent.current = { clientX: e.clientX, clientY: e.clientY };
      if (frame.current != null) return;
      frame.current = window.requestAnimationFrame(apply);
    },
    [apply, isEnabled],
  );

  const style = useMemo<React.CSSProperties>(
    () =>
      isEnabled
        ? {
            transform:
              "perspective(600px) rotateX(var(--tilt-rx)) rotateY(var(--tilt-ry)) scale(var(--tilt-scale))",
            transition: "transform 150ms ease-out",
            willChange: "transform",
          }
        : {},
    [isEnabled],
  );

  return { ref, isEnabled, style, onMouseEnter, onMouseLeave, onMouseMove };
};
