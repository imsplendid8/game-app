import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  fullWidth?: boolean;
}

const base =
  "relative inline-flex min-h-[52px] items-center justify-center gap-1.5 overflow-hidden rounded-2xl px-5 text-base font-bold transition-transform active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100";

const variants: Record<Variant, string> = {
  primary: "bg-brand-gradient text-white shadow-glossy",
  secondary:
    "bg-white/80 text-brand-deep ring-1 ring-brand-soft shadow-card backdrop-blur",
  ghost: "bg-transparent text-subtle hover:bg-white/60",
};

export function Button({
  variant = "primary",
  fullWidth = false,
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`${base} ${variants[variant]} ${
        fullWidth ? "w-full" : ""
      } ${className}`}
      {...props}
    >
      {/* 유리 광택 */}
      {variant === "primary" && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-white/25"
        />
      )}
      <span className="relative flex items-center gap-1.5">{children}</span>
    </button>
  );
}
