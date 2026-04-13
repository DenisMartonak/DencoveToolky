import { Suspense, lazy, useEffect, useState, useCallback } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import CommandPalette from "./components/CommandPalette";
import { tools } from "./tools/registry";

const toolRoutes = tools.map((t) => ({
  path: t.id,
  Component: lazy(t.component),
}));

function Loader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  const openPalette = useCallback(() => setPaletteOpen(true), []);
  const closePalette = useCallback(() => setPaletteOpen(false), []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="min-h-screen">
      <Sidebar
        onOpenPalette={openPalette}
        mobileOpen={mobileMenu}
        onCloseMobile={() => setMobileMenu(false)}
      />
      <CommandPalette open={paletteOpen} onClose={closePalette} />

      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-20 h-14 bg-surface-1/80 backdrop-blur border-b border-border flex items-center px-4 gap-3">
        <button
          onClick={() => setMobileMenu(true)}
          className="p-1.5 rounded-md hover:bg-surface-2 text-fg-muted"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span className="font-bold text-fg text-sm">Dencove Toolky</span>
      </header>

      <main className="lg:ml-64 pt-14 lg:pt-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Suspense fallback={<Loader />}>
            <Routes>
              <Route path="/" element={<Navigate to="/json" replace />} />
              {toolRoutes.map((r) => (
                <Route key={r.path} path={r.path} element={<r.Component />} />
              ))}
            </Routes>
          </Suspense>
        </div>
      </main>
    </div>
  );
}
