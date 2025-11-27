import type { ReactNode } from "react";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children?: ReactNode;
}

export default function Modal({ open, onClose, title, children }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Background */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 bg-slate-50 border-b border-slate-200">
          <h3 className="font-semibold text-lg text-slate-800">{title}</h3>
          <button
            onClick={onClose}
            className="text-slate-500 hover:bg-slate-200 p-1 rounded-md transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
