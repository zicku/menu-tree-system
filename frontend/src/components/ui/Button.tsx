import type { ReactNode, MouseEventHandler } from "react";
import { twMerge } from "tailwind-merge";

interface ButtonProps {
  children?: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  className?: string;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "icon";
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  title?: string;
}

export default function Button({
  children,
  onClick,
  className,
  variant = "primary",
  size = "md",
  disabled,
  type = "button",
  title,
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-md font-medium transition-all focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed active:scale-95";

  const variants = {
    primary: "bg-[#004BCE] text-white hover:bg-[#003DA8]",
    secondary:
      "bg-white text-slate-700 border border-slate-300 hover:bg-slate-100",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100",
  } as const;

  const sizes = {
    sm: "text-xs px-3 py-1.5",
    md: "text-sm px-3 py-1.5",
    icon: "p-1.5 w-8 h-8",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={twMerge(base, variants[variant], sizes[size], className)}
    >
      {children}
    </button>
  );
}
