import { useMemo, useState } from "react";
import { z } from "zod";
import ToolLayout from "../components/ToolLayout";
import Panel from "../components/Panel";
import CopyButton from "../components/CopyButton";
import { useLocalStorage } from "../hooks/useLocalStorage";

type Mode = "encode" | "decode";

const inputSchema = z.string().min(1, "Input is empty");

export default function Base64Codec() {
  const [mode, setMode] = useState<Mode>("encode");
  const [input, setInput] = useLocalStorage("devkit-b64-input", "Hello, DevKit!");

  const result = useMemo(() => {
    const parsed = inputSchema.safeParse(input);
    if (!parsed.success) return { ok: false as const, error: "Input is empty" };
    try {
      if (mode === "encode") {
        return { ok: true as const, output: btoa(unescape(encodeURIComponent(parsed.data))) };
      } else {
        return { ok: true as const, output: decodeURIComponent(escape(atob(parsed.data))) };
      }
    } catch {
      return {
        ok: false as const,
        error: mode === "decode"
          ? "Invalid Base64 string"
          : "Failed to encode input",
      };
    }
  }, [input, mode]);

  return (
    <ToolLayout title="Base64 Codec" description="Encode plain text to Base64 or decode Base64 back to text.">
      <Panel
        label="Input"
        actions={
          <div className="flex items-center gap-1 bg-surface-2 rounded-lg p-0.5 border border-border">
            {(["encode", "decode"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-2.5 py-1 text-[10px] font-medium rounded-md transition-colors ${
                  mode === m
                    ? "bg-accent text-white"
                    : "text-fg-muted hover:text-fg"
                }`}
              >
                {m === "encode" ? "Encode" : "Decode"}
              </button>
            ))}
          </div>
        }
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          spellCheck={false}
          className="w-full h-72 lg:h-[28rem] bg-transparent text-sm text-fg resize-none outline-none font-mono placeholder:text-fg-faint"
          placeholder={mode === "encode" ? "Enter text to encode…" : "Enter Base64 to decode…"}
        />
      </Panel>

      <Panel
        label="Output"
        actions={result.ok ? <CopyButton text={result.output} /> : undefined}
      >
        {result.ok ? (
          <pre className="w-full h-72 lg:h-[28rem] overflow-auto text-sm font-mono text-fg whitespace-pre-wrap break-all leading-relaxed">
            {result.output}
          </pre>
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
