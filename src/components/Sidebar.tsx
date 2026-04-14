import { NavLink } from "react-router-dom";
import { tools, categories } from "../tools/registry";
import { useTheme } from "../context/ThemeContext";

interface Props {
  onOpenPalette: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export default function Sidebar({ onOpenPalette, mobileOpen, onCloseMobile }: Props) {
  const { theme, toggle } = useTheme();
  const isMac = navigator.platform.toUpperCase().includes("MAC");

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={onCloseMobile} />
      )}

      <aside
        className={`fixed top-0 left-0 z-40 h-full w-64 bg-surface-1 border-r border-border flex flex-col transition-transform duration-200
          lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Brand */}
        <div className="px-5 py-5 border-b border-border">
          <h1 className="text-lg font-bold text-fg tracking-tight">Dencove Toolky</h1>
        </div>

        {/* Search trigger */}
        <div className="px-3 pt-4 pb-2">
          <button
            onClick={onOpenPalette}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-surface-2/50
              text-xs text-fg-muted hover:bg-surface-2 transition-colors focus-ring"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="8" />
              <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
            </svg>
            <span className="flex-1 text-left">Search tools…</span>
            <kbd className="text-[10px] font-mono text-fg-faint">
              {isMac ? "⌘" : "Ctrl+"}K
            </kbd>
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-2">
          {categories.map((cat) => {
            const catTools = tools.filter((t) => t.category === cat.id);
            if (catTools.length === 0) return null;
            return (
              <div key={cat.id} className="mb-4">
                <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-fg-faint">
                  {cat.label}
                </div>
                <ul className="space-y-0.5">
                  {catTools.map((tool) => (
                    <li key={tool.id}>
                      <NavLink
                        to={`/${tool.id}`}
                        onClick={onCloseMobile}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                            isActive
                              ? "bg-accent/10 text-accent font-medium"
                              : "text-fg-muted hover:bg-surface-2 hover:text-fg"
                          }`
                        }
                      >
                        <span className="w-8 h-8 rounded-md bg-surface-2 border border-border flex items-center justify-center text-[10px] font-mono font-bold shrink-0">
                          {tool.icon}
                        </span>
                        <span className="truncate">{tool.name}</span>
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-border space-y-2">
          <div className="flex items-center gap-2 px-1 py-1 text-[11px] text-fg-faint">
            <svg className="w-3.5 h-3.5 text-green-500 shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15l-5-5 1.41-1.41L11 14.17l7.59-7.59L20 8l-9 9z" />
            </svg>
            No data leaves your browser
          </div>
          <NavLink
            to="/settings"
            onClick={onCloseMobile}
            className={({ isActive }) =>
              `w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-border
              text-xs font-medium transition-colors focus-ring ${
                isActive
                  ? "bg-accent/10 text-accent border-accent/30"
                  : "text-fg-muted hover:bg-surface-2"
              }`
            }
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            Settings
          </NavLink>
          <button
            onClick={toggle}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-border
              text-xs text-fg-muted hover:bg-surface-2 transition-colors focus-ring"
          >
            {theme === "dark" ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="5" />
                <path strokeLinecap="round" d="M12 1v2m0 18v2m-9-11h2m18 0h2m-3.64-6.36l-1.41 1.41M6.05 17.95l-1.41 1.41m0-12.73l1.41 1.41m11.31 11.31l1.41 1.41" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
              </svg>
            )}
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </button>
        </div>
      </aside>
    </>
  );
}
