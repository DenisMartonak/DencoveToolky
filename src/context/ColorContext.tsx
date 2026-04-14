import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export interface ColorVars {
  "--surface-0": string;
  "--surface-1": string;
  "--surface-2": string;
  "--surface-3": string;
  "--border": string;
  "--accent": string;
  "--accent-hover": string;
  "--fg": string;
  "--fg-muted": string;
  "--fg-faint": string;
}

export const LIGHT_DEFAULTS: ColorVars = {
  "--surface-0": "#ffffff",
  "--surface-1": "#f8f9fa",
  "--surface-2": "#f1f3f5",
  "--surface-3": "#e9ecef",
  "--border": "#dee2e6",
  "--accent": "#4263eb",
  "--accent-hover": "#3b5bdb",
  "--fg": "#1a1a2e",
  "--fg-muted": "#495057",
  "--fg-faint": "#868e96",
};

export const DARK_DEFAULTS: ColorVars = {
  "--surface-0": "#0d1117",
  "--surface-1": "#161b22",
  "--surface-2": "#1c2333",
  "--surface-3": "#2d333b",
  "--border": "#30363d",
  "--accent": "#6d8cff",
  "--accent-hover": "#8da4ff",
  "--fg": "#e6edf3",
  "--fg-muted": "#9ca3af",
  "--fg-faint": "#6b7280",
};

const STORAGE_KEY_LIGHT = "devkit-colors-light";
const STORAGE_KEY_DARK = "devkit-colors-dark";

interface ColorCtx {
  lightColors: ColorVars;
  darkColors: ColorVars;
  setLightColor: (key: keyof ColorVars, value: string) => void;
  setDarkColor: (key: keyof ColorVars, value: string) => void;
  setLightPalette: (colors: ColorVars) => void;
  setDarkPalette: (colors: ColorVars) => void;
  resetLight: () => void;
  resetDark: () => void;
  resetAll: () => void;
}

const ColorContext = createContext<ColorCtx | null>(null);

function loadColors(key: string, defaults: ColorVars): ColorVars {
  try {
    const stored = localStorage.getItem(key);
    if (stored) return { ...defaults, ...JSON.parse(stored) };
  } catch {}
  return { ...defaults };
}

function applyColors(colors: ColorVars, selector: "root" | "dark") {
  if (selector === "root") {
    const root = document.documentElement;
    if (!root.classList.contains("dark")) {
      for (const [k, v] of Object.entries(colors)) {
        root.style.setProperty(k, v);
      }
    }
  } else {
    const root = document.documentElement;
    if (root.classList.contains("dark")) {
      for (const [k, v] of Object.entries(colors)) {
        root.style.setProperty(k, v);
      }
    }
  }
}

export function ColorProvider({ children }: { children: ReactNode }) {
  const [lightColors, setLightColors] = useState<ColorVars>(() =>
    loadColors(STORAGE_KEY_LIGHT, LIGHT_DEFAULTS),
  );
  const [darkColors, setDarkColors] = useState<ColorVars>(() =>
    loadColors(STORAGE_KEY_DARK, DARK_DEFAULTS),
  );

  const applyCurrentTheme = useCallback(() => {
    const isDark = document.documentElement.classList.contains("dark");
    const colors = isDark ? darkColors : lightColors;
    for (const [k, v] of Object.entries(colors)) {
      document.documentElement.style.setProperty(k, v);
    }
  }, [lightColors, darkColors]);

  useEffect(() => {
    applyCurrentTheme();
  }, [applyCurrentTheme]);

  useEffect(() => {
    const observer = new MutationObserver(() => applyCurrentTheme());
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, [applyCurrentTheme]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_LIGHT, JSON.stringify(lightColors));
  }, [lightColors]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_DARK, JSON.stringify(darkColors));
  }, [darkColors]);

  const setLightColor = useCallback((key: keyof ColorVars, value: string) => {
    setLightColors((prev) => ({ ...prev, [key]: value }));
  }, []);

  const setDarkColor = useCallback((key: keyof ColorVars, value: string) => {
    setDarkColors((prev) => ({ ...prev, [key]: value }));
  }, []);

  const setLightPalette = useCallback((colors: ColorVars) => {
    setLightColors({ ...LIGHT_DEFAULTS, ...colors });
  }, []);

  const setDarkPalette = useCallback((colors: ColorVars) => {
    setDarkColors({ ...DARK_DEFAULTS, ...colors });
  }, []);

  const resetLight = useCallback(() => setLightColors({ ...LIGHT_DEFAULTS }), []);
  const resetDark = useCallback(() => setDarkColors({ ...DARK_DEFAULTS }), []);
  const resetAll = useCallback(() => {
    setLightColors({ ...LIGHT_DEFAULTS });
    setDarkColors({ ...DARK_DEFAULTS });
  }, []);

  return (
    <ColorContext.Provider
      value={{ lightColors, darkColors, setLightColor, setDarkColor, setLightPalette, setDarkPalette, resetLight, resetDark, resetAll }}
    >
      {children}
    </ColorContext.Provider>
  );
}

export function useColors() {
  const ctx = useContext(ColorContext);
  if (!ctx) throw new Error("useColors must be used within ColorProvider");
  return ctx;
}
