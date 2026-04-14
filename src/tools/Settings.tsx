import { useRef } from "react";
import { useColors, LIGHT_DEFAULTS, DARK_DEFAULTS, type ColorVars } from "../context/ColorContext";
import { useTheme } from "../context/ThemeContext";
import { useToast } from "../context/ToastContext";

interface ColorGroup {
  label: string;
  vars: { key: keyof ColorVars; label: string }[];
}

const COLOR_GROUPS: ColorGroup[] = [
  {
    label: "Surfaces",
    vars: [
      { key: "--surface-0", label: "Background" },
      { key: "--surface-1", label: "Surface 1" },
      { key: "--surface-2", label: "Surface 2" },
      { key: "--surface-3", label: "Surface 3" },
    ],
  },
  {
    label: "Accent",
    vars: [
      { key: "--accent", label: "Accent" },
      { key: "--accent-hover", label: "Accent Hover" },
    ],
  },
  {
    label: "Text",
    vars: [
      { key: "--fg", label: "Foreground" },
      { key: "--fg-muted", label: "Muted" },
      { key: "--fg-faint", label: "Faint" },
    ],
  },
  {
    label: "Border",
    vars: [
      { key: "--border", label: "Border" },
    ],
  },
];

function ColorPicker({
  label,
  value,
  defaultValue,
  onChange,
}: {
  label: string;
  value: string;
  defaultValue: string;
  onChange: (v: string) => void;
}) {
  const isModified = value.toLowerCase() !== defaultValue.toLowerCase();

  return (
    <div className="flex items-center gap-3 py-2">
      <label className="relative cursor-pointer group">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
        />
        <div
          className="w-9 h-9 rounded-lg border-2 border-border group-hover:border-accent transition-colors shadow-sm"
          style={{ backgroundColor: value }}
        />
      </label>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-fg flex items-center gap-2">
          {label}
          {isModified && (
            <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
          )}
        </div>
        <div className="text-xs font-mono text-fg-faint">{value}</div>
      </div>
    </div>
  );
}

const COLOR_VAR_KEYS: (keyof ColorVars)[] = [
  "--surface-0", "--surface-1", "--surface-2", "--surface-3",
  "--border", "--accent", "--accent-hover", "--fg", "--fg-muted", "--fg-faint",
];

function isValidColorVars(obj: unknown): obj is Partial<ColorVars> {
  if (!obj || typeof obj !== "object") return false;
  return Object.entries(obj as Record<string, unknown>).every(
    ([k, v]) => COLOR_VAR_KEYS.includes(k as keyof ColorVars) && typeof v === "string" && /^#[0-9a-f]{6}$/i.test(v),
  );
}

interface PaletteExport {
  _toolky: string;
  light: ColorVars;
  dark: ColorVars;
}

function isPaletteExport(obj: unknown): obj is PaletteExport {
  if (!obj || typeof obj !== "object") return false;
  const o = obj as Record<string, unknown>;
  return o._toolky === "palette" && isValidColorVars(o.light) && isValidColorVars(o.dark);
}

export default function Settings() {
  const { theme } = useTheme();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    lightColors,
    darkColors,
    setLightColor,
    setDarkColor,
    setLightPalette,
    setDarkPalette,
    resetLight,
    resetDark,
    resetAll,
  } = useColors();

  const isDark = theme === "dark";
  const currentColors = isDark ? darkColors : lightColors;
  const defaults = isDark ? DARK_DEFAULTS : LIGHT_DEFAULTS;
  const setColor = isDark ? setDarkColor : setLightColor;
  const resetCurrent = isDark ? resetDark : resetLight;

  const hasChanges = Object.keys(defaults).some(
    (k) =>
      currentColors[k as keyof ColorVars].toLowerCase() !==
      defaults[k as keyof ColorVars].toLowerCase(),
  );

  const handleExport = () => {
    const data: PaletteExport = {
      _toolky: "palette",
      light: { ...lightColors },
      dark: { ...darkColors },
    };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "toolky-palette.json";
    a.click();
    URL.revokeObjectURL(url);
    toast("Palette exported!");
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        if (isPaletteExport(data)) {
          setLightPalette(data.light);
          setDarkPalette(data.dark);
          toast("Palette imported successfully!");
        } else {
          toast("Invalid palette file format");
        }
      } catch {
        toast("Failed to parse palette file");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-fg">Settings</h1>
        <p className="mt-1 text-sm text-fg-muted">
          Customize colors for the current theme. Changes are saved automatically.
        </p>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-2 border border-border text-sm font-medium text-fg">
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: isDark ? "#e6edf3" : "#1a1a2e" }}
          />
          Editing: {isDark ? "Dark" : "Light"} Theme
        </span>
        <span className="text-xs text-fg-faint">
          Switch theme in the sidebar to edit the other palette
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {COLOR_GROUPS.map((group) => (
          <div
            key={group.label}
            className="rounded-xl border border-border bg-surface-1 overflow-hidden"
          >
            <div className="px-4 py-2.5 border-b border-border bg-surface-2/50">
              <span className="text-xs font-semibold uppercase tracking-wider text-fg-muted">
                {group.label}
              </span>
            </div>
            <div className="px-4 py-2 divide-y divide-border/50">
              {group.vars.map((v) => (
                <ColorPicker
                  key={v.key}
                  label={v.label}
                  value={currentColors[v.key]}
                  defaultValue={defaults[v.key]}
                  onChange={(val) => setColor(v.key, val)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Preview */}
      <div className="rounded-xl border border-border bg-surface-1 overflow-hidden mb-8">
        <div className="px-4 py-2.5 border-b border-border bg-surface-2/50">
          <span className="text-xs font-semibold uppercase tracking-wider text-fg-muted">
            Preview
          </span>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ backgroundColor: currentColors["--accent"] }}>
              Primary Button
            </button>
            <button className="px-4 py-2 rounded-lg text-sm font-medium border" style={{ borderColor: currentColors["--border"], color: currentColors["--fg-muted"] }}>
              Secondary Button
            </button>
          </div>
          <div className="rounded-lg p-3" style={{ backgroundColor: currentColors["--surface-2"] }}>
            <p className="text-sm" style={{ color: currentColors["--fg"] }}>
              This is sample text on Surface 2.{" "}
              <span style={{ color: currentColors["--fg-muted"] }}>Muted text.</span>{" "}
              <span style={{ color: currentColors["--fg-faint"] }}>Faint text.</span>
            </p>
          </div>
        </div>
      </div>

      {/* Import / Export */}
      <div className="rounded-xl border border-border bg-surface-1 overflow-hidden mb-8">
        <div className="px-4 py-2.5 border-b border-border bg-surface-2/50">
          <span className="text-xs font-semibold uppercase tracking-wider text-fg-muted">
            Share Palette
          </span>
        </div>
        <div className="p-4 space-y-3">
          <p className="text-sm text-fg-muted">
            Export your color palette as a JSON file to share with others, or import one to apply their colors.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-accent/30 bg-accent/10 text-sm font-medium text-accent hover:bg-accent/20 transition-colors focus-ring"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export Palette
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-surface-2 text-sm font-medium text-fg-muted hover:bg-surface-3 transition-colors focus-ring"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Import Palette
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* Reset buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={resetCurrent}
          disabled={!hasChanges}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors focus-ring ${
            hasChanges
              ? "border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20"
              : "border-border bg-surface-2 text-fg-faint cursor-not-allowed"
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Reset {isDark ? "Dark" : "Light"} Theme
        </button>
        <button
          onClick={resetAll}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-surface-2 text-sm font-medium text-fg-muted hover:bg-surface-3 transition-colors focus-ring"
        >
          Reset All Themes
        </button>
      </div>
    </div>
  );
}
