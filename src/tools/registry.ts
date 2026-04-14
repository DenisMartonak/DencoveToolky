import type { ComponentType } from "react";

export interface ToolMeta {
  id: string;
  name: string;
  description: string;
  icon: string;
  keywords: string[];
  category: "technical" | "puzzles";
  component: () => Promise<{ default: ComponentType }>;
}

export const tools: ToolMeta[] = [
  {
    id: "json",
    name: "JSON Formatter",
    description: "Format, validate & syntax-highlight JSON",
    icon: "{ }",
    keywords: ["json", "format", "validate", "pretty", "minify", "lint"],
    category: "technical",
    component: () => import("./JsonFormatter"),
  },
  {
    id: "base64",
    name: "Base64 Codec",
    description: "Encode & decode Base64 strings",
    icon: "B64",
    keywords: ["base64", "encode", "decode", "binary", "token"],
    category: "technical",
    component: () => import("./Base64Codec"),
  },
  {
    id: "url",
    name: "URL Codec",
    description: "Encode & decode URL components",
    icon: "%20",
    keywords: ["url", "encode", "decode", "query", "parameter", "percent"],
    category: "technical",
    component: () => import("./UrlCodec"),
  },
  {
    id: "jwt",
    name: "JWT Debugger",
    description: "Decode JWT tokens locally — no server involved",
    icon: "JWT",
    keywords: ["jwt", "json web token", "decode", "debug", "auth", "bearer"],
    category: "technical",
    component: () => import("./JwtDebugger"),
  },
  {
    id: "units",
    name: "CSS Unit Converter",
    description: "Convert between px, rem, em & more",
    icon: "px→",
    keywords: ["css", "px", "rem", "em", "convert", "unit", "pixel"],
    category: "technical",
    component: () => import("./CssUnitConverter"),
  },
  {
    id: "sudoku",
    name: "Sudoku Solver",
    description: "Solve any valid 9×9 Sudoku puzzle instantly",
    icon: "9×9",
    keywords: ["sudoku", "solver", "puzzle", "grid", "numbers"],
    category: "puzzles",
    component: () => import("./SudokuSolver"),
  },
  {
    id: "suko",
    name: "Suko Solver",
    description: "Solve Suko puzzles with colored regions & intersection clues",
    icon: "SKO",
    keywords: ["suko", "solver", "puzzle", "grid", "sum", "regions"],
    category: "puzzles",
    component: () => import("./SukoSolver"),
  },
];

export const categories = [
  { id: "technical" as const, label: "Technical Tools" },
  { id: "puzzles" as const, label: "Puzzles" },
];

export function findTool(id: string) {
  return tools.find((t) => t.id === id);
}
