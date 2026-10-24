import { Employee, Leave, Payroll } from "./models.js";
import { daily, today, balance } from "./lib.js";
const ms = () => today().slice(0, 8) + "01",
  D = (d) => (d && d !== "All" ? { dept: d } : {});
// all numbers (dashboard + AI tools) come from here, always scoped to the caller
export const scope = (u, dept) =>
  u.role === "employee"
    ? Employee.find({ _id: u.employee })
    : Employee.find({ status: { $ne: "exited" }, ...D(dept) });
export const headcount = async (u, { department } = {}) => ({
  headcount: await Employee.countDocuments({
    status: { $in: ["active", "probation"] },
    ...D(department),
  }),
});
export async function attendanceSummary(
  u,
  { from = ms(), to = today(), department } = {},
) {
  const rows = await daily(from, to, await scope(u, department));
  const c = {};
  rows.forEach((r) => (c[r.status] = (c[r.status] || 0) + 1));
  const den =
    rows.filter((r) => r.status !== "not_in").length - (c.on_leave || 0);
  return {
    from,
    to,
    counts: c,
    attendanceRatePct: den
      ? +(
          (((c.present || 0) +
            (c.late || 0) +
            (c.missing_checkout || 0) +
            0.5 * (c.half_day || 0)) /
            den) *
          100
        ).toFixed(1)
      : 0,
  };
}
export async function lateComers(
  u,
  { from = ms(), to = today(), department, limit = 5 } = {},
) {
  const emps = await scope(u, department),
    m = {};
  (await daily(from, to, emps))
    .filter((r) => r.status === "late")
    .forEach((r) => (m[r.emp] = (m[r.emp] || 0) + 1));
  return Object.entries(m)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id, n]) => ({
      name: emps.find((e) => String(e._id) === id)?.name,
      lates: n,
    }));
}
export async function leaveSummary(
  u,
  { from = ms(), to = today(), department } = {},
) {
  const ids = (await scope(u, department)).map((e) => e._id),
    by = {};
  (
    await Leave.find({
      emp: { $in: ids },
      status: "approved",
      start: { $lte: to },
      end: { $gte: from },
    })
  ).forEach((l) => (by[l.type] = (by[l.type] || 0) + l.days));
  return {
    approvedDaysByType: by,
    pending: await Leave.countDocuments({
      status: "pending",
      emp: { $in: ids },
    }),
  };
}
export const myLeaveBalance = async (u) => ({
  balance: await balance(u.employee),
});
export async function payrollSummary(u, { month } = {}) {
  const p = await Payroll.findOne(
    month ? { month } : { status: "finalized" },
  ).sort({ month: -1 });
  if (!p) return { note: "No payroll run yet" };
  const sum = (l, k) => l.reduce((a, x) => a + x[k], 0),
    byDept = {};
  p.lines.forEach((l) => (byDept[l.dept] = (byDept[l.dept] || 0) + l.gross));
  return {
    month: p.month,
    status: p.status,
    employees: p.lines.length,
    gross: sum(p.lines, "gross"),
    net: sum(p.lines, "net"),
    grossByDept: byDept,
  };
}
export async function searchEmployees(u, { q = "" } = {}) {
  const r = new RegExp(String(q).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
  return (
    await Employee.find({ $or: [{ name: r }, { code: r }, { dept: r }] }).limit(
      10,
    )
  ).map((e) => ({
    name: e.name,
    code: e.code,
    dept: e.dept,
    desig: e.desig,
    status: e.status,
  }));
}
