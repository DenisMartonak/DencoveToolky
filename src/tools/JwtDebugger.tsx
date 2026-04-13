import { useMemo } from "react";
import { z } from "zod";
import ToolLayout from "../components/ToolLayout";
import Panel from "../components/Panel";
import CopyButton from "../components/CopyButton";
import { useLocalStorage } from "../hooks/useLocalStorage";

const SAMPLE_JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

const jwtSchema = z.string().min(1, "Paste a JWT token above").refine(
  (val) => val.split(".").length === 3,
  "JWT must have 3 parts separated by dots (header.payload.signature)",
);

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) base64 += "=";
  return decodeURIComponent(
    atob(base64)
      .split("")
      .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join(""),
  );
}

function tryParse(encoded: string): { ok: true; data: unknown } | { ok: false; error: string } {
  try {
    const decoded = base64UrlDecode(encoded);
    return { ok: true, data: JSON.parse(decoded) };
  } catch {
    return { ok: false, error: "Failed to decode this section" };
  }
}

function formatTs(ts: number): string {
  try {
    return new Date(ts * 1000).toISOString().replace("T", " ").replace("Z", " UTC");
  } catch {
    return String(ts);
  }
}

function highlightJson(json: string): string {
  return json.replace(
    /("(?:\\.|[^"\\])*")\s*(:)?|(\b\d+\.?\d*\b)|(\btrue\b|\bfalse\b)|(\bnull\b)|([{}[\],])/g,
    (match, str, colon, num, bool, nil, bracket) => {
      if (str) return colon ? `<span class="token-key">${str}</span>:` : `<span class="token-string">${str}</span>`;
      if (num) return `<span class="token-number">${num}</span>`;
      if (bool) return `<span class="token-boolean">${bool}</span>`;
      if (nil) return `<span class="token-null">${nil}</span>`;
      if (bracket) return `<span class="token-bracket">${bracket}</span>`;
      return match;
    },
  );
}

interface DecodedSection {
  label: string;
  color: string;
  result: ReturnType<typeof tryParse>;
}

export default function JwtDebugger() {
  const [input, setInput] = useLocalStorage("devkit-jwt-input", SAMPLE_JWT);

  const decoded = useMemo(() => {
    const validation = jwtSchema.safeParse(input.trim());
    if (!validation.success) {
      return { ok: false as const, error: validation.error.errors[0].message };
    }
    const parts = validation.data.split(".");
    const sections: DecodedSection[] = [
      { label: "Header", color: "text-red-400", result: tryParse(parts[0]) },
      { label: "Payload", color: "text-purple-400", result: tryParse(parts[1]) },
    ];
    return { ok: true as const, sections, signature: parts[2] };
  }, [input]);

  const payloadData = decoded.ok && decoded.sections[1].result.ok
    ? (decoded.sections[1].result.data as Record<string, unknown>)
    : null;

  return (
    <ToolLayout title="JWT Debugger" description="Decode JWT tokens locally — header, payload & timestamps. Nothing leaves your browser.">
      <Panel
        label="Token"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setInput(SAMPLE_JWT)}
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
          className="w-full h-72 lg:h-[28rem] bg-transparent text-sm text-fg resize-none outline-none font-mono placeholder:text-fg-faint break-all"
          placeholder="Paste a JWT token here…"
        />
      </Panel>

      <Panel label="Decoded">
        {decoded.ok ? (
          <div className="h-72 lg:h-[28rem] overflow-y-auto space-y-5">
            {decoded.sections.map((section) => (
              <div key={section.label}>
                <h3 className={`text-xs font-bold uppercase tracking-wider mb-2 ${section.color}`}>
                  {section.label}
                </h3>
                {section.result.ok ? (
                  <div className="relative group">
                    <pre
                      className="text-sm font-mono leading-relaxed bg-surface-2 rounded-lg p-3 overflow-x-auto"
                      dangerouslySetInnerHTML={{
                        __html: highlightJson(JSON.stringify(section.result.data, null, 2)),
                      }}
                    />
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <CopyButton text={JSON.stringify(section.result.data, null, 2)} />
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-red-400">{section.result.error}</p>
                )}
              </div>
            ))}

            {payloadData && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider mb-2 text-fg-muted">
                  Timestamps
                </h3>
                <div className="bg-surface-2 rounded-lg p-3 space-y-1.5 text-sm font-mono">
                  {(["iat", "exp", "nbf"] as const).map((key) => {
                    const val = payloadData[key];
                    if (typeof val !== "number") return null;
                    const label = key === "iat" ? "Issued At" : key === "exp" ? "Expires" : "Not Before";
                    const isExpired = key === "exp" && val * 1000 < Date.now();
                    return (
                      <div key={key} className="flex items-center gap-2 text-fg-muted">
                        <span className="text-fg-faint w-20 shrink-0">{label}:</span>
                        <span className={isExpired ? "text-red-400" : "text-fg"}>
                          {formatTs(val)}
                        </span>
                        {isExpired && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 font-medium">
                            EXPIRED
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider mb-2 text-blue-400">
                Signature
              </h3>
              <p className="text-[11px] font-mono text-fg-muted bg-surface-2 rounded-lg p-3 break-all">
                {decoded.signature}
              </p>
              <p className="mt-2 text-[11px] text-fg-faint italic">
                Signature is displayed but not verified — verification requires the secret/key.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-sm">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="10" />
              <path strokeLinecap="round" d="M12 8v4m0 4h.01" />
            </svg>
            {decoded.error}
          </div>
        )}
      </Panel>
    </ToolLayout>
  );
}
