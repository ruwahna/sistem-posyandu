"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  type?: "modal" | "drawer";
  children: React.ReactNode;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  type = "modal",
  children
}: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Prevent background scrolling when modal is open
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;
  // Next.js SSR Safety check
  if (!mounted) return null;

  const modalContent = (
    <div
      onClick={onClose} // Closes modal when clicking outside (on overlay backdrop)
      className={`fixed inset-0 w-screen h-screen top-0 left-0 bg-saas-dark/45 backdrop-blur-sm z-[9999] flex ${
        type === "drawer" ? "justify-end" : "items-center justify-center p-4"
      }`}
    >
      <div
        onClick={(e) => e.stopPropagation()} // Prevents clicks inside the modal card from closing it
        className={
          type === "drawer"
            ? "bg-white h-full w-full max-w-lg shadow-2xl flex flex-col justify-between p-4 sm:p-6 relative overflow-y-auto animate-slide-in"
            : "bg-white rounded-card shadow-xl border border-gray-100 max-w-xl w-full p-4 sm:p-6 space-y-4 sm:space-y-5 relative max-h-[92vh] overflow-y-auto mx-2"
        }
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 shrink-0">
          <div>
            <h3 className="font-extrabold text-base text-saas-dark">{title}</h3>
            {description && <p className="text-[11px] text-saas-muted mt-0.5">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-50 flex items-center justify-center text-saas-muted hover:text-saas-dark transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Container */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
