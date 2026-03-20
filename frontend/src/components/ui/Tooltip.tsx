import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type Props = {
  text: string;
  children: React.ReactNode;
};

type Placement = "top" | "bottom";

export function Tooltip({ text, children }: Props) {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [placement, setPlacement] = useState<Placement>("top");
  const [pos, setPos] = useState<{ left: number; top: number }>({ left: 0, top: 0 });
  const wrapRef = useRef<HTMLSpanElement | null>(null);
  const bubbleRef = useRef<HTMLDivElement | null>(null);

  const EDGE = 8;
  const GAP = 8;

  const recomputePlacement = () => {
    const wrap = wrapRef.current;
    const bubble = bubbleRef.current;
    if (!wrap || !bubble) return;

    const rect = wrap.getBoundingClientRect();
    const bubbleRect = bubble.getBoundingClientRect();
    const padding = EDGE;

    const canFitTop = rect.top >= bubbleRect.height + padding + GAP;
    const canFitBottom =
      window.innerHeight - rect.bottom >= bubbleRect.height + padding + GAP;

    const nextPlacement: Placement = !canFitTop && canFitBottom ? "bottom" : "top";
    setPlacement(nextPlacement);

    const centerX = rect.left + rect.width / 2;
    const left = Math.max(
      EDGE,
      Math.min(centerX - bubbleRect.width / 2, window.innerWidth - bubbleRect.width - EDGE),
    );

    const topTop = rect.top - bubbleRect.height - GAP;
    const topBottom = rect.bottom + GAP;
    const top = nextPlacement === "top" ? topTop : topBottom;

    setPos({ left, top });
  };

  useEffect(() => {
    if (!open) {
      setVisible(false);
      return;
    }

    const raf = window.requestAnimationFrame(() => {
      recomputePlacement();
      setVisible(true);
    });

    const onViewportChange = () => recomputePlacement();
    window.addEventListener("resize", onViewportChange);
    window.addEventListener("scroll", onViewportChange, true);

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", onViewportChange);
      window.removeEventListener("scroll", onViewportChange, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, text]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      const wrap = wrapRef.current;
      if (!wrap) return;
      if (wrap.contains(e.target as Node)) return;
      setOpen(false);
    };
    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  return (
    <span
      ref={wrapRef}
      className="relative inline-flex items-center"
      onPointerEnter={() => setOpen(true)}
      onPointerLeave={() => setOpen(false)}
      onPointerDown={(e) => {
        // Tap to toggle on touch devices; keep click-through for non-touch UX.
        if (e.pointerType !== "touch") return;
        e.stopPropagation();
        setOpen((v) => !v);
      }}
    >
      {children}
      {open
        ? createPortal(
            <div
              ref={bubbleRef}
              className={[
                "pointer-events-none fixed z-50 w-max max-w-[240px]",
                "rounded-lg border border-slate-700/60 bg-slate-950 px-3 py-2 text-xs text-slate-200 shadow-lg",
                "transition-opacity duration-150",
                visible ? "opacity-100" : "opacity-0",
              ].join(" ")}
              style={{ left: pos.left, top: pos.top }}
            >
              {text}
            </div>,
            document.body,
          )
        : null}
    </span>
  );
}
