import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "../utils/cn";

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  icon?: ReactNode;
};

const variants: Record<ButtonVariant, string> = {
  primary: "bg-brand text-surface-base hover:bg-white",
  secondary: "border border-surface-border bg-surface-subtle text-brand hover:border-brand-muted",
  ghost: "text-brand-muted hover:bg-surface-subtle hover:text-brand",
};

export function Button({
  children,
  className,
  icon,
  variant = "primary",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        className,
      )}
      type={type}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
