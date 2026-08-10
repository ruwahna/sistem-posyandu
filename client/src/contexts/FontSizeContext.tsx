"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

export type FontSizeLevel = "kecil" | "normal" | "besar" | "sangat-besar";

interface FontSizeContextType {
  fontSizeLevel: FontSizeLevel;
  setFontSizeLevel: (level: FontSizeLevel) => void;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
}

const FONT_SIZE_LEVELS: FontSizeLevel[] = [
  "kecil",
  "normal",
  "besar",
  "sangat-besar",
];

const FONT_SIZE_SCALE: Record<FontSizeLevel, string> = {
  kecil: "87.5%",   // ~14px base
  normal: "100%",   // 16px base (default)
  besar: "112.5%",  // ~18px base
  "sangat-besar": "125%", // 20px base
};

const STORAGE_KEY = "posyandu_font_size_level";

const FontSizeContext = createContext<FontSizeContextType | undefined>(
  undefined
);

export function FontSizeProvider({ children }: { children: ReactNode }) {
  const [fontSizeLevel, setFontSizeLevelState] = useState<FontSizeLevel>(
    () => {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem(STORAGE_KEY) as FontSizeLevel;
        if (saved && FONT_SIZE_LEVELS.includes(saved)) return saved;
      }
      return "normal";
    }
  );

  // Apply font size to <html> element
  useEffect(() => {
    const scale = FONT_SIZE_SCALE[fontSizeLevel];
    document.documentElement.style.fontSize = scale;
    localStorage.setItem(STORAGE_KEY, fontSizeLevel);
  }, [fontSizeLevel]);

  const setFontSizeLevel = (level: FontSizeLevel) => {
    setFontSizeLevelState(level);
  };

  const increaseFontSize = () => {
    const currentIndex = FONT_SIZE_LEVELS.indexOf(fontSizeLevel);
    if (currentIndex < FONT_SIZE_LEVELS.length - 1) {
      setFontSizeLevelState(FONT_SIZE_LEVELS[currentIndex + 1]);
    }
  };

  const decreaseFontSize = () => {
    const currentIndex = FONT_SIZE_LEVELS.indexOf(fontSizeLevel);
    if (currentIndex > 0) {
      setFontSizeLevelState(FONT_SIZE_LEVELS[currentIndex - 1]);
    }
  };

  return (
    <FontSizeContext.Provider
      value={{
        fontSizeLevel,
        setFontSizeLevel,
        increaseFontSize,
        decreaseFontSize,
      }}
    >
      {children}
    </FontSizeContext.Provider>
  );
}

export function useFontSize() {
  const context = useContext(FontSizeContext);
  if (!context) {
    throw new Error("useFontSize must be used within FontSizeProvider");
  }
  return context;
}
