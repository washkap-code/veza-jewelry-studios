import type { ReactNode } from "react";

export function AdminField({
  label, value, onChange, type = "text", required, className = "", placeholder,
}: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; required?: boolean; className?: string; placeholder?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="label-eyebrow">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        className="mt-2 block w-full border-b border-border bg-transparent py-2.5 text-sm font-light text-charcoal outline-none transition-colors duration-500 placeholder:text-charcoal-soft/50 focus:border-teal"
      />
    </label>
  );
}

export function AdminTextArea({
  label, value, onChange, rows = 4, className = "",
}: {
  label: string; value: string; onChange: (v: string) => void; rows?: number; className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="label-eyebrow">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="mt-2 block w-full border border-border/60 bg-transparent p-3 text-sm font-light text-charcoal outline-none transition-colors duration-500 focus:border-teal"
      />
    </label>
  );
}

export function AdminToggle({
  label, checked, onChange,
}: {
  label: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center gap-3"
      aria-pressed={checked}
    >
      <span
        className={`relative h-5 w-9 rounded-full transition-colors duration-500 ${checked ? "bg-teal" : "bg-border"}`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-warm-white transition-all duration-500 ${checked ? "left-4" : "left-0.5"}`}
        />
      </span>
      <span className="text-xs font-light uppercase tracking-[0.18em] text-charcoal-soft">{label}</span>
    </button>
  );
}

export function AdminSelect({
  label, value, onChange, options, className = "",
}: {
  label: string; value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[]; className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="label-eyebrow">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 block w-full appearance-none border-b border-border bg-transparent py-2.5 text-sm font-light text-charcoal outline-none transition-colors duration-500 focus:border-teal"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const tone =
    status === "pending" || status === "new"
      ? "text-gold border-gold/40"
      : status === "cancelled" || status === "declined"
        ? "text-destructive border-destructive/40"
        : "text-teal border-teal/40";
  return (
    <span className={`inline-block border px-2.5 py-1 text-[0.65rem] font-light uppercase tracking-[0.2em] ${tone}`}>
      {status}
    </span>
  );
}

export function AdminEmpty({ children }: { children: ReactNode }) {
  return (
    <p className="py-12 text-center text-sm font-light text-charcoal-soft">{children}</p>
  );
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
