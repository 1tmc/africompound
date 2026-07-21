import * as React from "react";

type DialogProps = {
  open?: boolean;
  children: React.ReactNode;
};

type PanelProps = {
  children: React.ReactNode;
  className?: string;
};

export function Dialog({ open = false, children }: DialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      {children}
    </div>
  );
}

export function DialogContent({ children, className = "" }: PanelProps) {
  return (
    <div className={["w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-lg", className].filter(Boolean).join(" ")}>
      {children}
    </div>
  );
}

export function DialogHeader({ children, className = "" }: PanelProps) {
  return <div className={["mb-4 space-y-1", className].filter(Boolean).join(" ")}>{children}</div>;
}

export function DialogTitle({ children, className = "" }: PanelProps) {
  return <h2 className={["text-lg font-semibold text-slate-900", className].filter(Boolean).join(" ")}>{children}</h2>;
}

export function DialogDescription({ children, className = "" }: PanelProps) {
  return <p className={["text-sm text-slate-600", className].filter(Boolean).join(" ")}>{children}</p>;
}

export function DialogFooter({ children, className = "" }: PanelProps) {
  return <div className={["mt-6 flex items-center justify-end gap-2", className].filter(Boolean).join(" ")}>{children}</div>;
}
