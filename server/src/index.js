import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import authR, { users, bootstrap } from "./routes/auth.js";
import org from "./routes/org.js";
import emp from "./routes/employees.js";
import att from "./routes/attendance.js";
import leave from "./routes/leave.js";
import pay from "./routes/payroll.js";
import dash from "./routes/dashboard.js";
import ai from "./routes/ai.js";
import comms from "./routes/comms.js";
import { Setting } from "./models.js";
const app = express();
app.use(cors(), express.json({ limit: "2mb" }));
app.get("/api/health", (q, s) => s.json({ ok: true }));
app.use("/api/auth", authR);
app.use("/api/users", users);
app.use("/api/org", org);
app.use("/api/employees", emp);
app.use("/api/attendance", att);
app.use("/api/leave", leave);
app.use("/api/payroll", pay);
app.use("/api/dashboard", dash);
app.use("/api/ai", ai);
app.use("/api", comms);
import dns from 'dns';
dns.setServers(['8.8.8.8','8.8.4.4']);

const dist = path.resolve("../client/dist");
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get("*", (q, s) => s.sendFile(dist + "/index.html"));
}
app.use((e, q, s, n) => {
  if (e.code === 11000)
    return s.status(409).json({ error: "Duplicate record" });
  if (e.name === "ValidationError" || e.name === "CastError")
    return s.status(422).json({ error: e.message });
  console.error(e);
  s.status(500).json({ error: "Server error" });
});

await mongoose.connect(
  process.env.MONGO_URI ||
    "mongodb+srv://sohairarain002_db_user:sohair329256@gwmpakistan.tbigten.mongodb.net/Alluser",
);
const { ADMIN_EMAIL: e, ADMIN_PASSWORD: p, COMPANY_NAME: c } = process.env;
if (!(await Setting.findOne()) && e && p) {
  await bootstrap(c || "My Company", e, p);
  console.log("First Admin created from env");
}
app.listen(process.env.PORT || 5000, () =>
  console.log("HCM Lite API on :" + (process.env.PORT || 5000)),
);
