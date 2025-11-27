// src/components/ui/Input.tsx
import type { ChangeEventHandler } from "react";
import { twMerge } from "tailwind-merge";

interface InputProps {
  label?: string;
  value?: string | number;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  type?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export default function Input({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  className,
  disabled,
}: InputProps) {
  const base =
    "w-full px-3 py-2 text-sm rounded-md border border-slate-200 bg-[#F8F9FB] text-slate-700 " +
    "focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none transition";

  return (
    <div className="space-y-1">
      {label && <label className="block text-sm text-slate-600">{label}</label>}

      <input
        value={value}
        onChange={onChange}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        className={twMerge(base, className)}
      />
    </div>
  );
}
