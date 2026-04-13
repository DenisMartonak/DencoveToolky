import type { ComponentType } from "react";

export interface ToolMeta {
  id: string;
  name: string;
  description: string;
  icon: string;
  keywords: string[];
  component: () => Promise<{ default: ComponentType }>;
}

export const tools: ToolMeta[] = [
  {
    id: "json",
    name: "JSON Formatter",
    description: "Format, validate & syntax-highlight JSON",
    icon: "{ }",
    keywords: ["json", "format", "validate", "pretty", "minify", "lint"],
    component: () => import("./JsonFormatter"),
  },
  {
    id: "base64",
    name: "Base64 Codec",
    description: "Encode & decode Base64 strings",
    icon: "B64",
    keywords: ["base64", "encode", "decode", "binary", "token"],
    component: () => import("./Base64Codec"),
  },
  {
    id: "url",
    name: "URL Codec",
    description: "Encode & decode URL components",
    icon: "%20",
    keywords: ["url", "encode", "decode", "query", "parameter", "percent"],
    component: () => import("./UrlCodec"),
  },
  {
    id: "jwt",
    name: "JWT Debugger",
    description: "Decode JWT tokens locally — no server involved",
    icon: "JWT",
    keywords: ["jwt", "json web token", "decode", "debug", "auth", "bearer"],
    component: () => import("./JwtDebugger"),
  },
  {
    id: "units",
    name: "CSS Unit Converter",
    description: "Convert between px, rem, em & more",
    icon: "px→",
    keywords: ["css", "px", "rem", "em", "convert", "unit", "pixel"],
    component: () => import("./CssUnitConverter"),
  },
];

export function findTool(id: string) {
  return tools.find((t) => t.id === id);
}
