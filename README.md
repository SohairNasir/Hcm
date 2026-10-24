# HCM Lite - Saylani Hackathon (React 19 + Tailwind v4 + Node/Express + MongoDB)

## Run (about 5 minutes)
```
# 1. API  (needs MongoDB: local or a free Atlas URI)
cd server && cp .env.example .env     # set MONGO_URI, JWT_SECRET, AI_API_KEY
npm install && npm run dev            # http://localhost:5000

# 2. Web
cd client && npm install && npm run dev   # http://localhost:5173 (proxies /api)
```
Production: `cd client && npm run build` - the server then serves `client/dist` on one host.

## First Admin
Open the app on an empty database -> **First-run setup** (company + Admin), or set ADMIN_EMAIL / ADMIN_PASSWORD / COMPANY_NAME in `server/.env`.
Admin creates HR logins; HR registering an employee returns a temporary password (must be changed on first sign-in).

## AI key
Any OpenAI-compatible provider with tool calling (Groq, Gemini, OpenAI). Set `AI_API_KEY`, `AI_BASE_URL`, `AI_MODEL` in `server/.env`. The key never reaches the browser.

## Layout
server/src: models.js, lib.js (rules: working days, tax, haversine, daily status), stats.js (shared by dashboards AND AI tools), routes/* (auth, org, employees, attendance, leave, payroll, dashboard, ai, comms).
client/src: pages/*, components/ui.jsx, api.js.

## Done
Modules M1-M9 on the API: JWT + bcrypt + role/data-scope guards, settings/org, employees (+CSV dry-run import/export), attendance (server time, 409, late/half/missing, corrections, camera+geofence check), leave (422 rules), payroll (draft/finalize lock/PDF payslip), dashboards (server aggregation), AI (chat tools, summary, smart leave, policy, 20/h limit, 15s timeout, ai_logs), announcements, notifications, audit log. `npm test` in server runs rule tests.
Client: Auth (first-run/login/change password) and AI chat call the API.

## Not done yet
Remaining client pages still show sample values - wire each with `api.get/post` (endpoints above). Face detection in the browser/mobile app, late-penalty and other bonus items.
