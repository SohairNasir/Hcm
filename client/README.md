# HCM Lite - Frontend (React 19 + Tailwind v4 + Vite)

```
npm install
npm run dev
```

Structure
- src/App.jsx - layout, sidebar, role menus, theme toggle, routes (HashRouter)
- src/pages/*.jsx - one file per page (Dash, Emp, Att, Leave, Pay, AI, ...)
- src/components/ui.jsx - shared UI (Card, Stat, charts, icons, logo)
- src/data.js - role menus and sample values (replace with API calls)

Next: connect to backend REST + JWT; AI chat calls POST /ai/chat (key stays on server).
