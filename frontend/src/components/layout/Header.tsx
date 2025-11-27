// src/components/layout/Header.tsx
import type { ComponentType, ReactNode } from "react";
import Badge from "../ui/Badge";

interface HeaderProps {
  icon?: ComponentType<{ size?: number }>;
  title: string;
  subtitle?: string;
  status?: "connected" | "demo" | string;
  right?: ReactNode;
}

export default function Header({
  icon: Icon,
  title,
  subtitle,
  status,
  right,
}: HeaderProps) {
  return (
    <header className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-white rounded-xl shadow flex items-center justify-center text-blue-600">
          {Icon && <Icon size={24} />}
        </div>

        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {status && (
          <Badge
            text={status === "connected" ? "Connected" : "Demo Mode"}
            active={status === "connected"}
          />
        )}
        {right}
      </div>
    </header>
  );
}
