# DevKit — Local Dev Utilities

A privacy-first, local-only suite of developer utilities that eliminates the need for ad-heavy, slow, third-party conversion websites.

**No data ever leaves your browser.**

## Tools

| Tool | Description |
|------|-------------|
| JSON Formatter | Format, validate & syntax-highlight JSON |
| Base64 Codec | Encode & decode Base64 strings |
| URL Codec | Encode & decode URL components |
| JWT Debugger | Decode JWT tokens locally |
| CSS Unit Converter | Convert between px, rem, em, pt & vw |

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Architecture

- **React 19** + **TypeScript** + **Vite**
- **Tailwind CSS** for styling with dark/light themes
- **React Router** for modular tool routing
- **Zod** for input validation
- **LocalStorage** for persisting user input and theme preference

Each tool lives in `src/tools/` as a self-contained component. Adding a new tool is as simple as:

1. Create a new file in `src/tools/`
2. Add an entry to `src/tools/registry.ts`
3. That's it — routing, sidebar, and command palette pick it up automatically

### Key Features

- **Cmd+K / Ctrl+K** command palette for instant tool switching
- **One-click copy** on every output with toast confirmation
- **Dark/Light theme** that persists across sessions
- **Responsive** sidebar collapses on mobile with hamburger menu
- **Zero network requests** — everything runs in the browser
