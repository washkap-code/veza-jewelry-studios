import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type Tone = "light" | "dark";

export function PasswordInput({
  label,
  value,
  onChange,
  autoComplete,
  required,
  tone = "light",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  required?: boolean;
  tone?: Tone;
}) {
  const [visible, setVisible] = useState(false);

  const labelCls =
    tone === "dark"
      ? "text-[0.68rem] font-light uppercase tracking-[0.24em] text-ivory/60"
      : "label-eyebrow";
  const inputCls =
    tone === "dark"
      ? "mt-3 block w-full border-b border-ivory/30 bg-transparent py-2 pr-10 text-sm font-light text-ivory outline-none transition-colors focus:border-gold"
      : "mt-3 block w-full border-b border-border bg-transparent py-3 pr-10 text-sm font-light text-charcoal outline-none transition-colors duration-500 focus:border-teal";
  const btnCls =
    tone === "dark"
      ? "absolute right-0 bottom-2 text-ivory/50 transition-colors hover:text-gold"
      : "absolute right-0 bottom-2.5 text-charcoal-soft/60 transition-colors hover:text-teal";

  return (
    <label className="block">
      <span className={labelCls}>{label}</span>
      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          required={required}
          className={inputCls}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className={btnCls}
          tabIndex={-1}
        >
          {visible ? <EyeOff strokeWidth={1.25} size={16} /> : <Eye strokeWidth={1.25} size={16} />}
        </button>
      </div>
    </label>
  );
}

export default PasswordInput;
