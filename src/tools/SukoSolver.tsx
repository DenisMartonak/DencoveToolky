import { useState, useMemo, useCallback } from "react";
import ToolLayout from "../components/ToolLayout";
import Panel from "../components/Panel";

const REGION_COLORS = [
  { bg: "bg-red-500/15", border: "border-red-500/40", text: "text-red-400", hex: "#ef4444" },
  { bg: "bg-blue-500/15", border: "border-blue-500/40", text: "text-blue-400", hex: "#3b82f6" },
  { bg: "bg-green-500/15", border: "border-green-500/40", text: "text-green-400", hex: "#22c55e" },
];

interface SukoState {
  regions: number[];
  regionSums: [string, string, string];
  circleSums: [string, string, string, string];
}

const SAMPLE: SukoState = {
  regions: [0, 0, 1, 0, 2, 1, 2, 2, 1],
  regionSums: ["20", "12", "13"],
  circleSums: ["20", "16", "13", "17"],
};

function createEmpty(): SukoState {
  return {
    regions: [0, 0, 1, 0, 2, 1, 2, 2, 1],
    regionSums: ["", "", ""],
    circleSums: ["", "", "", ""],
  };
}

function getCircleCells(idx: number): [number, number, number, number] {
  const row = Math.floor(idx / 2);
  const col = idx % 2;
  const tl = row * 3 + col;
  return [tl, tl + 1, tl + 3, tl + 4];
}

function solveSuko(state: SukoState): number[] | null {
  const regionSums = state.regionSums.map(Number);
  const circleSums = state.circleSums.map(Number);

  if (regionSums.some(isNaN) || circleSums.some(isNaN)) return null;

  const regionGroups: number[][] = [[], [], []];
  for (let i = 0; i < 9; i++) {
    regionGroups[state.regions[i]].push(i);
  }

  const result = new Array<number>(9).fill(0);
  const used = new Set<number>();

  function backtrack(cellIdx: number): boolean {
    if (cellIdx === 9) {
      for (let r = 0; r < 3; r++) {
        const sum = regionGroups[r].reduce((s, i) => s + result[i], 0);
        if (sum !== regionSums[r]) return false;
      }
      for (let ci = 0; ci < 4; ci++) {
        const cells = getCircleCells(ci);
        const sum = cells.reduce((s, i) => s + result[i], 0);
        if (sum !== circleSums[ci]) return false;
      }
      return true;
    }

    for (let num = 1; num <= 9; num++) {
      if (used.has(num)) continue;

      result[cellIdx] = num;
      used.add(num);

      let feasible = true;

      for (let r = 0; r < 3; r++) {
        const cells = regionGroups[r];
        const placed = cells.filter((i) => i <= cellIdx);
        const unplaced = cells.filter((i) => i > cellIdx);
        const currentSum = placed.reduce((s, i) => s + result[i], 0);
        if (currentSum > regionSums[r]) { feasible = false; break; }
        if (unplaced.length === 0 && currentSum !== regionSums[r]) { feasible = false; break; }
      }

      if (feasible) {
        for (let ci = 0; ci < 4; ci++) {
          const cells = getCircleCells(ci);
          const placed = cells.filter((i) => i <= cellIdx);
          const unplaced = cells.filter((i) => i > cellIdx);
          if (placed.length === 0) continue;
          const currentSum = placed.reduce((s, i) => s + result[i], 0);
          if (currentSum > circleSums[ci]) { feasible = false; break; }
          if (unplaced.length === 0 && currentSum !== circleSums[ci]) { feasible = false; break; }
        }
      }

      if (feasible && backtrack(cellIdx + 1)) return true;

      result[cellIdx] = 0;
      used.delete(num);
    }
    return false;
  }

  return backtrack(0) ? [...result] : null;
}

export default function SukoSolver() {
  const [state, setState] = useState<SukoState>(() => ({ ...SAMPLE }));
  const [painting, setPainting] = useState<number | null>(null);

  const solution = useMemo(() => {
    const allFilled =
      state.regionSums.every((s) => s !== "") &&
      state.circleSums.every((s) => s !== "");
    if (!allFilled) return { status: "incomplete" as const };
    const result = solveSuko(state);
    return result
      ? { status: "solved" as const, grid: result }
      : { status: "nosolution" as const };
  }, [state]);

  const setRegionSum = useCallback((idx: number, val: string) => {
    if (val !== "" && !/^\d{0,2}$/.test(val)) return;
    setState((prev) => {
      const sums = [...prev.regionSums] as [string, string, string];
      sums[idx] = val;
      return { ...prev, regionSums: sums };
    });
  }, []);

  const setCircleSum = useCallback((idx: number, val: string) => {
    if (val !== "" && !/^\d{0,2}$/.test(val)) return;
    setState((prev) => {
      const sums = [...prev.circleSums] as [string, string, string, string];
      sums[idx] = val;
      return { ...prev, circleSums: sums };
    });
  }, []);

  const cycleRegion = useCallback((cellIdx: number) => {
    if (painting !== null) {
      setState((prev) => {
        const regions = [...prev.regions];
        regions[cellIdx] = painting;
        return { ...prev, regions };
      });
    } else {
      setState((prev) => {
        const regions = [...prev.regions];
        regions[cellIdx] = (regions[cellIdx] + 1) % 3;
        return { ...prev, regions };
      });
    }
  }, [painting]);

  const handleSample = () => setState({ ...SAMPLE });
  const handleClear = () => setState(createEmpty());

  return (
    <ToolLayout title="Suko Solver" description="Enter region colors, sums and intersection clues to solve Suko puzzles.">
      <Panel
        label="Puzzle Setup"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={handleSample}
              className="text-[10px] text-fg-faint hover:text-fg-muted transition-colors"
            >
              Sample
            </button>
            <button
              onClick={handleClear}
              className="text-[10px] text-fg-faint hover:text-fg-muted transition-colors"
            >
              Clear
            </button>
          </div>
        }
      >
        <div className="space-y-5">
          {/* Region sums */}
          <div>
            <h3 className="text-xs font-semibold text-fg-muted uppercase tracking-wider mb-2">
              Region Sums
            </h3>
            <div className="flex gap-3">
              {state.regionSums.map((val, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span
                    className={`w-4 h-4 rounded-sm border ${REGION_COLORS[i].border}`}
                    style={{ backgroundColor: REGION_COLORS[i].hex + "30" }}
                  />
                  <input
                    type="text"
                    inputMode="numeric"
                    value={val}
                    onChange={(e) => setRegionSum(i, e.target.value)}
                    placeholder="—"
                    className="w-14 px-2 py-1.5 rounded-lg bg-surface-2 border border-border text-fg font-mono text-sm text-center outline-none focus-ring"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Circle sums */}
          <div>
            <h3 className="text-xs font-semibold text-fg-muted uppercase tracking-wider mb-2">
              Intersection Sums (circles)
            </h3>
            <div className="grid grid-cols-2 gap-2 max-w-[12rem]">
              {state.circleSums.map((val, i) => (
                <input
                  key={i}
                  type="text"
                  inputMode="numeric"
                  value={val}
                  onChange={(e) => setCircleSum(i, e.target.value)}
                  placeholder={`Circle ${i + 1}`}
                  className="w-full px-2 py-1.5 rounded-lg bg-surface-2 border border-border text-fg font-mono text-sm text-center outline-none focus-ring"
                />
              ))}
            </div>
          </div>

          {/* Region painter */}
          <div>
            <h3 className="text-xs font-semibold text-fg-muted uppercase tracking-wider mb-2">
              Paint Regions
            </h3>
            <div className="flex gap-2 mb-3">
              {REGION_COLORS.map((color, i) => (
                <button
                  key={i}
                  onClick={() => setPainting(painting === i ? null : i)}
                  className={`w-8 h-8 rounded-lg border-2 transition-all ${
                    painting === i
                      ? `${color.border} ring-2 ring-accent scale-110`
                      : `${color.border} hover:scale-105`
                  }`}
                  style={{ backgroundColor: color.hex + "30" }}
                />
              ))}
              {painting !== null && (
                <button
                  onClick={() => setPainting(null)}
                  className="px-2 py-1 text-[10px] text-fg-faint hover:text-fg-muted transition-colors"
                >
                  Done
                </button>
              )}
            </div>
            <p className="text-[11px] text-fg-faint mb-2">
              {painting !== null ? "Click cells to paint them" : "Click a color above then click cells, or click cells to cycle colors"}
            </p>
          </div>

          {/* Grid preview */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="inline-grid grid-cols-3 gap-0 border-2 border-fg/30 rounded-lg overflow-hidden">
                {Array.from({ length: 9 }).map((_, i) => {
                  const regionIdx = state.regions[i];
                  const color = REGION_COLORS[regionIdx];
                  const value = solution.status === "solved" ? solution.grid[i] : null;
                  return (
                    <button
                      key={i}
                      onClick={() => cycleRegion(i)}
                      className={`w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center text-lg font-mono font-bold
                        border border-border/50 transition-colors cursor-pointer ${color.bg}
                        ${painting !== null ? "hover:brightness-125" : ""}`}
                    >
                      {value && (
                        <span className="text-fg">{value}</span>
                      )}
                    </button>
                  );
                })}
              </div>
              {/* Circle overlays at intersections */}
              {[0, 1, 2, 3].map((ci) => {
                const row = Math.floor(ci / 2);
                const col = ci % 2;
                const cellSize = 64;
                const left = (col + 1) * cellSize - 12;
                const top = (row + 1) * cellSize - 12;
                return (
                  <div
                    key={ci}
                    className="absolute w-6 h-6 rounded-full bg-surface-0 border-2 border-fg/30 flex items-center justify-center text-[10px] font-bold text-fg pointer-events-none"
                    style={{ left, top }}
                  >
                    {state.circleSums[ci] || "?"}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Panel>

      <Panel label="Solution">
        {solution.status === "solved" ? (
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="inline-grid grid-cols-3 gap-0 border-2 border-fg/30 rounded-lg overflow-hidden">
                {solution.grid.map((val, i) => {
                  const regionIdx = state.regions[i];
                  const color = REGION_COLORS[regionIdx];
                  return (
                    <div
                      key={i}
                      className={`w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center text-xl font-mono font-bold
                        border border-border/50 ${color.bg}`}
                    >
                      <span className="text-fg">{val}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="space-y-2 text-sm text-fg-muted">
              <h3 className="font-medium text-fg">Verification</h3>
              <div className="grid grid-cols-1 gap-1.5">
                {state.regionSums.map((sum, i) => {
                  const cells = state.regions
                    .map((r, idx) => (r === i ? solution.grid[idx] : null))
                    .filter((v): v is number => v !== null);
                  return (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <span
                        className={`w-3 h-3 rounded-sm border ${REGION_COLORS[i].border}`}
                        style={{ backgroundColor: REGION_COLORS[i].hex + "30" }}
                      />
                      <span className="font-mono">
                        {cells.join(" + ")} = {cells.reduce((a, b) => a + b, 0)}
                      </span>
                      <span className="text-fg-faint">(target: {sum})</span>
                    </div>
                  );
                })}
                {state.circleSums.map((sum, ci) => {
                  const cellIdxs = getCircleCells(ci);
                  const vals = cellIdxs.map((i) => solution.grid[i]);
                  return (
                    <div key={`c${ci}`} className="flex items-center gap-2 text-xs">
                      <span className="w-3 h-3 rounded-full border border-fg/30 bg-surface-2" />
                      <span className="font-mono">
                        {vals.join(" + ")} = {vals.reduce((a, b) => a + b, 0)}
                      </span>
                      <span className="text-fg-faint">(target: {sum})</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : solution.status === "nosolution" ? (
          <div className="flex items-center gap-2 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="10" />
              <path strokeLinecap="round" d="M12 8v4m0 4h.01" />
            </svg>
            No solution found — check your region assignments and sums.
          </div>
        ) : (
          <div className="space-y-4 text-sm text-fg-muted">
            <div className="flex items-center gap-2 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-500">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="10" />
                <path strokeLinecap="round" d="M12 8v4m0 4h.01" />
              </svg>
              Fill in all region sums and intersection clues to solve.
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-fg">What is Suko?</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Place digits 1–9 in a 3×3 grid (each digit once)</li>
                <li>Cells are divided into 3 colored regions</li>
                <li>Each region's cells must sum to its target</li>
                <li>Each circle shows the sum of its 4 surrounding cells</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-fg">How to Use</h3>
              <ol className="list-decimal list-inside space-y-1">
                <li>Set the 3 region sums and 4 circle sums</li>
                <li>Paint cells to assign them to color regions</li>
                <li>The solution will appear automatically</li>
              </ol>
            </div>
          </div>
        )}
      </Panel>
    </ToolLayout>
  );
}
