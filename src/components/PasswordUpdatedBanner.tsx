export function PasswordUpdatedBanner({
  onDismiss,
  tone = "light",
}: {
  onDismiss: () => void;
  tone?: "light" | "dark";
}) {
  const isDark = tone === "dark";
  return (
    <div
      role="status"
      aria-live="polite"
      className={
        isDark
          ? "mb-8 flex items-start gap-4 border border-gold/40 bg-gold/10 px-5 py-4 text-ivory"
          : "mb-8 flex items-start gap-4 border border-teal/40 bg-teal/5 px-5 py-4 text-charcoal"
      }
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        className={isDark ? "mt-0.5 h-5 w-5 text-gold" : "mt-0.5 h-5 w-5 text-teal"}
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l5 5 10-11" />
      </svg>
      <div className="flex-1">
        <p
          className={
            isDark
              ? "text-[0.68rem] font-light uppercase tracking-[0.24em] text-gold"
              : "label-eyebrow text-teal"
          }
        >
          Password updated
        </p>
        <p
          className={
            isDark
              ? "mt-2 text-sm font-light leading-relaxed text-ivory/80"
              : "mt-2 text-sm font-light leading-relaxed text-charcoal-soft"
          }
        >
          Your new password is saved. Please sign in below to continue.
        </p>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        className={
          isDark
            ? "text-ivory/60 transition-colors duration-500 hover:text-gold"
            : "text-charcoal/50 transition-colors duration-500 hover:text-teal"
        }
      >
        ×
      </button>
    </div>
  );
}

export default PasswordUpdatedBanner;
