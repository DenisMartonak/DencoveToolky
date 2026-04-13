import type { ReactNode } from "react";

interface Props {
  label: string;
  actions?: ReactNode;
  children: ReactNode;
}

export default function Panel({ label, actions, children }: Props) {
  return (
    <div className="flex flex-col rounded-xl border border-border bg-surface-1 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-surface-2/50">
        <span className="text-xs font-semibold uppercase tracking-wider text-fg-muted">
          {label}
        </span>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      <div className="flex-1 p-4">{children}</div>
    </div>
  );
}
