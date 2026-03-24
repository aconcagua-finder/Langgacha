import { useEffect } from "react";

import { GuideContent } from "../../pages/GuidePage";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function GuideDrawer({ open, onClose }: Props) {
  useEffect(() => {
    if (!open) return undefined;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Гайд"
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <aside className="absolute inset-y-0 right-0 w-full border-l border-slate-800/60 bg-slate-950/95 shadow-2xl sm:max-w-[400px]">
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between gap-3 border-b border-slate-800/60 px-4 py-4 sm:px-6">
            <div className="text-sm font-extrabold text-slate-50">Справка</div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-800/60 bg-slate-950/40 text-sm font-extrabold text-slate-200/80 hover:bg-slate-900/60"
              aria-label="Закрыть гайд"
            >
              ✕
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
            <GuideContent />
          </div>
        </div>
      </aside>
    </div>
  );
}
