"use client";

import { useState, useRef, useEffect } from "react";
import { MoreHorizontal } from "lucide-react";

export interface ActionMenuItem {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant?: "default" | "danger"; // danger untuk delete
}

interface ActionMenuProps {
  items: ActionMenuItem[];
  triggerClassName?: string;
  alignDirection?: "bottom" | "top";
}

export default function ActionMenu({ items, triggerClassName, alignDirection }: ActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [computedDirection, setComputedDirection] = useState<"bottom" | "top">("bottom");
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Auto detect or set align direction
  const handleToggle = () => {
    if (!isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      if (alignDirection) {
        setComputedDirection(alignDirection);
      } else if (spaceBelow < 160) {
        setComputedDirection("top");
      } else {
        setComputedDirection("bottom");
      }
    }
    setIsOpen(!isOpen);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const handleMenuItemClick = (callback: () => void) => {
    callback();
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        onClick={handleToggle}
        className={
          triggerClassName ||
          "p-1.5 rounded-lg text-saas-muted hover:text-saas-dark hover:bg-gray-100 transition-all"
        }
      >
        <MoreHorizontal className="w-5 h-5" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          ref={menuRef}
          className={`absolute right-0 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-50 overflow-hidden ${
            computedDirection === "top" ? "bottom-full mb-2" : "top-full mt-2"
          }`}
        >
          {items.map((item, index) => (
            <button
              key={index}
              onClick={() => handleMenuItemClick(item.onClick)}
              className={`w-full px-4 py-2.5 flex items-center gap-3 text-sm font-medium transition-all hover:bg-gray-50 ${
                item.variant === "danger"
                  ? "text-red-600 hover:bg-red-50"
                  : "text-saas-dark hover:bg-gray-50"
              } ${index !== items.length - 1 ? "border-b border-gray-100" : ""}`}
            >
              <span className="w-4 h-4 flex items-center justify-center">
                {item.icon}
              </span>
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
