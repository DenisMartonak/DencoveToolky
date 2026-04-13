import { useMemo } from "react";
import { z } from "zod";
import ToolLayout from "../components/ToolLayout";
import Panel from "../components/Panel";
import CopyButton from "../components/CopyButton";
import { useLocalStorage } from "../hooks/useLocalStorage";

const numberSchema = z.coerce.number().finite();
const rootSchema = z.coerce.number().positive().finite();

type Unit = "px" | "rem" | "em" | "pt" | "vw";

const UNITS: Unit[] = ["px", "rem", "em", "pt", "vw"];

function convert(value: number, from: Unit, to: Unit, rootPx: number, viewportWidth: number): number | null {
  const toPx: Record<Unit, (v: number) => number> = {
    px: (v) => v,
    rem: (v) => v * rootPx,
    em: (v) => v * rootPx,
    pt: (v) => v * (96 / 72),
    vw: (v) => (v / 100) * viewportWidth,
  };

  const fromPx: Record<Unit, (px: number) => number> = {
    px: (px) => px,
    rem: (px) => px / rootPx,
    em: (px) => px / rootPx,
    pt: (px) => px * (72 / 96),
    vw: (px) => (px / viewportWidth) * 100,
  };

  try {
    const px = toPx[from](value);
    return fromPx[to](px);
  } catch {
    return null;
  }
}

function formatNum(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(4).replace(/0+$/, "").replace(/\.$/, "");
}

export default function CssUnitConverter() {
  const [inputVal, setInputVal] = useLocalStorage("devkit-css-input", "16");
  const [fromUnit, setFromUnit] = useLocalStorage<Unit>("devkit-css-from", "px");
  const [rootSize, setRootSize] = useLocalStorage("devkit-css-root", "16");
  const [viewportW, setViewportW] = useLocalStorage("devkit-css-vw", "1920");

  const conversions = useMemo(() => {
    const num = numberSchema.safeParse(inputVal);
    const root = rootSchema.safeParse(rootSize);
    const vw = rootSchema.safeParse(viewportW);

    if (!num.success) return null;
    const rootPx = root.success ? root.data : 16;
    const vpWidth = vw.success ? vw.data : 1920;

    return UNITS.filter((u) => u !== fromUnit).map((toUnit) => {
      const result = convert(num.data, fromUnit, toUnit, rootPx, vpWidth);
      return {
        unit: toUnit,
        value: result !== null ? formatNum(result) : "—",
        copyText: result !== null ? `${formatNum(result)}${toUnit}` : "",
      };
    });
  }, [inputVal, fromUnit, rootSize, viewportW]);

  return (
    <ToolLayout title="CSS Unit Converter" description="Convert between px, rem, em, pt & vw with a configurable root size.">
      <Panel label="Input">
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-fg-muted mb-1.5">Value</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                className="flex-1 px-3 py-2.5 rounded-lg bg-surface-2 border border-border text-fg font-mono text-sm outline-none focus-ring"
                placeholder="16"
              />
              <select
                value={fromUnit}
                onChange={(e) => setFromUnit(e.target.value as Unit)}
                className="px-3 py-2.5 rounded-lg bg-surface-2 border border-border text-fg text-sm outline-none focus-ring"
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-fg-muted mb-1.5">
                Root font-size (px)
              </label>
              <input
                type="text"
                value={rootSize}
                onChange={(e) => setRootSize(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-surface-2 border border-border text-fg font-mono text-sm outline-none focus-ring"
                placeholder="16"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-fg-muted mb-1.5">
                Viewport width (px)
              </label>
              <input
                type="text"
                value={viewportW}
                onChange={(e) => setViewportW(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-surface-2 border border-border text-fg font-mono text-sm outline-none focus-ring"
                placeholder="1920"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-border">
            <h3 className="text-xs font-semibold text-fg-muted uppercase tracking-wider mb-3">
              Quick Reference
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs text-fg-muted font-mono">
              <div className="bg-surface-2 rounded-lg p-2.5">1rem = {rootSchema.safeParse(rootSize).success ? rootSize : "16"}px</div>
              <div className="bg-surface-2 rounded-lg p-2.5">1pt = 1.333px</div>
              <div className="bg-surface-2 rounded-lg p-2.5">1em = parent font-size</div>
              <div className="bg-surface-2 rounded-lg p-2.5">1vw = {rootSchema.safeParse(viewportW).success ? formatNum(Number(viewportW) / 100) : "19.2"}px</div>
            </div>
          </div>
        </div>
      </Panel>

      <Panel label="Results">
        {conversions ? (
          <div className="space-y-3">
            {conversions.map((c) => (
              <div
                key={c.unit}
                className="flex items-center justify-between p-4 rounded-lg bg-surface-2 border border-border"
              >
                <div>
                  <span className="text-xl font-mono font-bold text-fg">{c.value}</span>
                  <span className="ml-1.5 text-sm text-accent font-medium">{c.unit}</span>
                </div>
                {c.copyText && <CopyButton text={c.copyText} />}
              </div>
            ))}

            {conversions.length > 0 && conversions[0].copyText && (
              <div className="pt-3 border-t border-border">
                <p className="text-xs text-fg-faint mb-2">CSS snippet:</p>
                <div className="relative group">
                  <pre className="text-sm font-mono bg-surface-2 rounded-lg p-3 text-fg">
{`/* ${inputVal}${fromUnit} equivalent */
font-size: ${conversions.find((c) => c.unit === "rem")?.value ?? "—"}rem;`}
                  </pre>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <CopyButton
                      text={`font-size: ${conversions.find((c) => c.unit === "rem")?.value ?? "—"}rem;`}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-sm">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="10" />
              <path strokeLinecap="round" d="M12 8v4m0 4h.01" />
            </svg>
            Enter a valid number
          </div>
        )}
      </Panel>
    </ToolLayout>
  );
}
