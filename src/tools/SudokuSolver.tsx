import { useState, useCallback, useRef } from "react";
import ToolLayout from "../components/ToolLayout";
import Panel from "../components/Panel";

type Grid = (number | null)[][];

function createEmptyGrid(): Grid {
  return Array.from({ length: 9 }, () => Array(9).fill(null));
}

function cloneGrid(grid: Grid): Grid {
  return grid.map((row) => [...row]);
}

function isValid(grid: Grid, row: number, col: number, num: number): boolean {
  for (let i = 0; i < 9; i++) {
    if (grid[row][i] === num) return false;
    if (grid[i][col] === num) return false;
  }
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if (grid[r][c] === num) return false;
    }
  }
  return true;
}

function solve(grid: Grid): boolean {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (grid[r][c] === null) {
        for (let num = 1; num <= 9; num++) {
          if (isValid(grid, r, c, num)) {
            grid[r][c] = num;
            if (solve(grid)) return true;
            grid[r][c] = null;
          }
        }
        return false;
      }
    }
  }
  return true;
}

function validateInput(grid: Grid): string | null {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const val = grid[r][c];
      if (val === null) continue;
      grid[r][c] = null;
      if (!isValid(grid, r, c, val)) {
        grid[r][c] = val;
        return `Conflict at row ${r + 1}, col ${c + 1}`;
      }
      grid[r][c] = val;
    }
  }
  return null;
}

const SAMPLE: Grid = [
  [5, 3, null, null, 7, null, null, null, null],
  [6, null, null, 1, 9, 5, null, null, null],
  [null, 9, 8, null, null, null, null, 6, null],
  [8, null, null, null, 6, null, null, null, 3],
  [4, null, null, 8, null, 3, null, null, 1],
  [7, null, null, null, 2, null, null, null, 6],
  [null, 6, null, null, null, null, 2, 8, null],
  [null, null, null, 4, 1, 9, null, null, 5],
  [null, null, null, null, 8, null, null, 7, 9],
];

export default function SudokuSolver() {
  const [grid, setGrid] = useState<Grid>(() => cloneGrid(SAMPLE));
  const [original, setOriginal] = useState<Grid>(() => cloneGrid(SAMPLE));
  const [error, setError] = useState<string | null>(null);
  const [solved, setSolved] = useState(false);
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const handleCellChange = useCallback(
    (row: number, col: number, value: string) => {
      if (solved) return;
      const num = value === "" ? null : parseInt(value, 10);
      if (num !== null && (isNaN(num) || num < 1 || num > 9)) return;
      setError(null);
      setGrid((prev) => {
        const next = cloneGrid(prev);
        next[row][col] = num;
        return next;
      });
      setOriginal((prev) => {
        const next = cloneGrid(prev);
        next[row][col] = num;
        return next;
      });
    },
    [solved],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, row: number, col: number) => {
      if (solved && e.key !== "Tab") return;
      let nextRow = row;
      let nextCol = col;
      if (e.key === "ArrowRight") nextCol = Math.min(8, col + 1);
      else if (e.key === "ArrowLeft") nextCol = Math.max(0, col - 1);
      else if (e.key === "ArrowDown") nextRow = Math.min(8, row + 1);
      else if (e.key === "ArrowUp") nextRow = Math.max(0, row - 1);
      else if (e.key === "Backspace" || e.key === "Delete") {
        handleCellChange(row, col, "");
        return;
      } else return;
      e.preventDefault();
      setSelectedCell([nextRow, nextCol]);
      const cell = gridRef.current?.querySelector(
        `[data-cell="${nextRow}-${nextCol}"]`,
      ) as HTMLInputElement | null;
      cell?.focus();
    },
    [solved, handleCellChange],
  );

  const handleSolve = () => {
    const working = cloneGrid(grid);
    const validationError = validateInput(working);
    if (validationError) {
      setError(validationError);
      return;
    }
    const working2 = cloneGrid(grid);
    if (solve(working2)) {
      setGrid(working2);
      setSolved(true);
      setError(null);
    } else {
      setError("No solution exists for this puzzle");
    }
  };

  const handleClear = () => {
    setGrid(createEmptyGrid());
    setOriginal(createEmptyGrid());
    setSolved(false);
    setError(null);
  };

  const handleReset = () => {
    setGrid(cloneGrid(original));
    setSolved(false);
    setError(null);
  };

  const handleSample = () => {
    setGrid(cloneGrid(SAMPLE));
    setOriginal(cloneGrid(SAMPLE));
    setSolved(false);
    setError(null);
  };

  const isOriginal = (row: number, col: number) => original[row][col] !== null;

  return (
    <ToolLayout title="Sudoku Solver" description="Enter a puzzle and solve it instantly using backtracking.">
      <Panel
        label="Puzzle"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={handleSample}
              className="text-[10px] text-fg-faint hover:text-fg-muted transition-colors"
            >
              Sample
            </button>
            <button
              onClick={handleReset}
              className="text-[10px] text-fg-faint hover:text-fg-muted transition-colors"
            >
              Reset
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
        <div className="flex flex-col items-center gap-4">
          <div
            ref={gridRef}
            className="inline-grid grid-cols-9 border-2 border-fg/30 rounded-lg overflow-hidden"
          >
            {grid.map((row, r) =>
              row.map((cell, c) => (
                <input
                  key={`${r}-${c}`}
                  data-cell={`${r}-${c}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={cell ?? ""}
                  onChange={(e) => handleCellChange(r, c, e.target.value)}
                  onFocus={() => setSelectedCell([r, c])}
                  onKeyDown={(e) => handleKeyDown(e, r, c)}
                  readOnly={solved && isOriginal(r, c)}
                  className={`w-9 h-9 sm:w-11 sm:h-11 text-center text-sm sm:text-base font-mono outline-none transition-colors
                    ${r % 3 === 2 && r !== 8 ? "border-b-2 border-b-fg/30" : "border-b border-b-border"}
                    ${c % 3 === 2 && c !== 8 ? "border-r-2 border-r-fg/30" : "border-r border-r-border"}
                    ${isOriginal(r, c) ? "font-bold text-fg bg-surface-2" : solved ? "text-accent bg-surface-1" : "text-fg bg-surface-0"}
                    ${selectedCell?.[0] === r && selectedCell?.[1] === c ? "ring-2 ring-accent ring-inset" : ""}
                    focus:ring-2 focus:ring-accent focus:ring-inset`}
                />
              )),
            )}
          </div>

          <button
            onClick={handleSolve}
            disabled={solved}
            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-colors focus-ring ${
              solved
                ? "bg-surface-2 text-fg-faint cursor-not-allowed"
                : "bg-accent text-white hover:bg-accent-hover"
            }`}
          >
            {solved ? "Solved" : "Solve Puzzle"}
          </button>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="10" />
                <path strokeLinecap="round" d="M12 8v4m0 4h.01" />
              </svg>
              {error}
            </div>
          )}
        </div>
      </Panel>

      <Panel label="How It Works">
        <div className="space-y-4 text-sm text-fg-muted">
          <div className="space-y-2">
            <h3 className="font-medium text-fg">Instructions</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Fill in the known numbers (1–9)</li>
              <li>Leave unknown cells empty</li>
              <li>Click <span className="text-accent font-medium">Solve Puzzle</span> to find the solution</li>
              <li>Use arrow keys to navigate between cells</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium text-fg">Rules</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Each row must contain 1–9 with no repeats</li>
              <li>Each column must contain 1–9 with no repeats</li>
              <li>Each 3×3 box must contain 1–9 with no repeats</li>
            </ul>
          </div>
          <div className="rounded-lg bg-surface-2 p-3 text-xs text-fg-faint">
            The solver uses a backtracking algorithm — it tries each possibility
            and backtracks when a conflict is found, guaranteeing a correct
            solution if one exists.
          </div>
        </div>
      </Panel>
    </ToolLayout>
  );
}
