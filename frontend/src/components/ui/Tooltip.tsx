import { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  text: string;
  children: React.ReactNode;
};

type Placement = "top" | "bottom";

export function Tooltip({ text, children }: Props) {
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState<Placement>("top");
  const wrapRef = useRef<HTMLSpanElement | null>(null);
  const bubbleRef = useRef<HTMLDivElement | null>(null);

  const bubblePos = useMemo(() => {
    return placement === "top"
      ? "bottom-full mb-2 origin-bottom"
      : "top-full mt-2 origin-top";
  }, [placement]);

  const recomputePlacement = () => {
    const wrap = wrapRef.current;
    const bubble = bubbleRef.current;
    if (!wrap || !bubble) return;

    const rect = wrap.getBoundingClientRect();
    const bubbleRect = bubble.getBoundingClientRect();
    const padding = 8;

    const canFitTop = rect.top >= bubbleRect.height + padding;
    const canFitBottom = window.innerHeight - rect.bottom >= bubbleRect.height + padding;

    if (!canFitTop && canFitBottom) setPlacement("bottom");
    else setPlacement("top");
  };

  useEffect(() => {
    if (!open) return;
    const id = window.requestAnimationFrame(recomputePlacement);
    return () => window.cancelAnimationFrame(id);
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
      <div
        ref={bubbleRef}
        className={[
          "pointer-events-none absolute left-1/2 z-40 w-max max-w-[240px] -translate-x-1/2",
          bubblePos,
          "rounded-lg border border-slate-700/60 bg-slate-950 px-3 py-2 text-xs text-slate-200 shadow-lg",
          "transition-opacity duration-150",
          open ? "opacity-100" : "opacity-0",
        ].join(" ")}
      >
        {text}
      </div>
    </span>
  );
}
