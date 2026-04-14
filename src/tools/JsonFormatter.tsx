import { useState, useMemo } from "react";
import { z } from "zod";
import ToolLayout from "../components/ToolLayout";
import Panel from "../components/Panel";
import CopyButton from "../components/CopyButton";
import { useLocalStorage } from "../hooks/useLocalStorage";

const SAMPLE = `{"name":"Toolky","version":1,"features":["json","base64","url","jwt","css"],"config":{"theme":"dark","local":true}}`;

function highlightJson(json: string): string {
  return json.replace(
    /("(?:\\.|[^"\\])*")\s*(:)?|(\b\d+\.?\d*\b)|(\btrue\b|\bfalse\b)|(\bnull\b)|([{}[\],])/g,
    (match, str, colon, num, bool, nil, bracket) => {
      if (str) {
        return colon
          ? `<span class="token-key">${str}</span>:`
          : `<span class="token-string">${str}</span>`;
      }
      if (num) return `<span class="token-number">${num}</span>`;
      if (bool) return `<span class="token-boolean">${bool}</span>`;
      if (nil) return `<span class="token-null">${nil}</span>`;
      if (bracket) return `<span class="token-bracket">${bracket}</span>`;
      return match;
    },
  );
}

const jsonSchema = z.string().min(1, "Input is empty");

export default function JsonFormatter() {
  const [input, setInput] = useLocalStorage("devkit-json-input", SAMPLE);
  const [indent, setIndent] = useState(2);

  const result = useMemo(() => {
    const parsed = jsonSchema.safeParse(input);
    if (!parsed.success) return { ok: false as const, error: "Input is empty" };
    try {
      const obj = JSON.parse(parsed.data);
      const formatted = JSON.stringify(obj, null, indent);
      return { ok: true as const, formatted, highlighted: highlightJson(formatted) };
    } catch (e) {
      return { ok: false as const, error: (e as Error).message };
    }
  }, [input, indent]);

  const minified = useMemo(() => {
    try {
      return JSON.stringify(JSON.parse(input));
    } catch {
      return "";
    }
  }, [input]);

  return (
    <ToolLayout title="JSON Formatter" description="Paste ugly JSON → get beautiful, syntax-highlighted output.">
      <Panel
        label="Input"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setInput(SAMPLE)}
              className="text-[10px] text-fg-faint hover:text-fg-muted transition-colors"
            >
              Sample
            </button>
            <button
              onClick={() => setInput("")}
              className="text-[10px] text-fg-faint hover:text-fg-muted transition-colors"
            >
              Clear
            </button>
          </div>
        }
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          spellCheck={false}
          className="w-full h-72 lg:h-[28rem] bg-transparent text-sm text-fg resize-none outline-none font-mono placeholder:text-fg-faint"
          placeholder='Paste JSON here…  e.g. {"key": "value"}'
        />
      </Panel>

      <Panel
        label="Output"
        actions={
          <div className="flex items-center gap-2">
            <select
              value={indent}
              onChange={(e) => setIndent(Number(e.target.value))}
              className="bg-surface-2 border border-border rounded px-2 py-0.5 text-[10px] text-fg-muted outline-none focus-ring"
            >
              <option value={2}>2 spaces</option>
              <option value={4}>4 spaces</option>
              <option value={1}>1 tab</option>
            </select>
            {result.ok && <CopyButton text={result.formatted} />}
            {minified && <CopyButton text={minified} label="Minified" />}
          </div>
        }
      >
        {result.ok ? (
          <pre
            className="w-full h-72 lg:h-[28rem] overflow-auto text-sm font-mono leading-relaxed"
            dangerouslySetInnerHTML={{ __html: result.highlighted }}
          />
        ) : (
          <div className="flex items-center gap-2 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="10" />
              <path strokeLinecap="round" d="M12 8v4m0 4h.01" />
            </svg>
            {result.error}
          </div>
        )}
      </Panel>
    </ToolLayout>
  );
}
