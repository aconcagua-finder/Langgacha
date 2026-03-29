import { useEffect } from "react";

export type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = "Отмена",
  danger,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  const lines = description.split("\n").filter(Boolean);

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/90 p-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={[
          "w-full max-w-md rounded-2xl border bg-slate-950 p-5 shadow-2xl",
          danger ? "border-rose-500/40" : "border-slate-800/60",
        ].join(" ")}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-lg font-extrabold tracking-tight text-slate-50">
              {title}
            </div>
            <div className="mt-2 flex flex-col gap-1 text-sm text-slate-200/70">
              {lines.map((l, idx) => (
                <div key={idx}>{l}</div>
              ))}
            </div>
          </div>
          {danger ? (
            <div className="rounded-xl bg-rose-500/15 px-3 py-2 text-xs font-bold text-rose-200">
              !
            </div>
          ) : null}
        </div>

        <div className="mt-5 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-50 hover:bg-slate-700"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={[
              "px-4 py-3 text-sm font-semibold",
              danger
                ? "border border-rose-500/30 bg-rose-500/10 text-rose-100 hover:bg-rose-500/15"
                : "btn-primary",
            ].join(" ")}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
