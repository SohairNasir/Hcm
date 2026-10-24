import {Router} from 'express';import {Employee,Leave,Correction,Notice,Audit,Attendance,Payroll} from '../models.js';import {auth,h} from '../auth.js';
import * as S from '../stats.js';import {today,balance,loc,iso,daily} from '../lib.js';
const r=Router();r.use(auth);
r.get('/',h(async(q,s)=>{const u=q.user,t=today(),{from=t.slice(0,8)+'01',to=t,department}=q.query;
if(u.role==='employee'){const e=u.employee,wk=iso(new Date(loc().getTime()-((loc().getUTCDay()+6)%7)*864e5));
const recs=await Attendance.find({emp:e,date:{$gte:wk}}),p=await Payroll.findOne({status:'finalized','lines.emp':e}).sort('-month'),l=p?.lines.find(x=>String(x.emp)===String(e));
return s.json({role:'employee',today:await Attendance.findOne({emp:e,date:t}),hoursThisWeek:+recs.reduce((a,x)=>a+(x.hours||0),0).toFixed(1),
lateCount:(await S.attendanceSummary(u,{from,to})).counts.late||0,leaveBalance:await balance(e),lastPayslip:l&&{month:p.month,net:l.net},notices:await Notice.find().sort('-createdAt').limit(5)})}
const hc=(await S.headcount(u,{department})).headcount,emps=await S.scope(u,department),tr={};
(await daily(iso(new Date(Date.now()-6*864e5)),t,emps)).forEach(x=>{if(['present','late','missing_checkout','half_day'].includes(x.status))tr[x.date]=(tr[x.date]||0)+1});
const base={headcount:hc,attendance:await S.attendanceSummary(u,{from,to,department}),trend:tr,lateComers:await S.lateComers(u,{from,to,department}),leave:await S.leaveSummary(u,{from,to,department})};
const byDept=await Employee.aggregate([{$match:{status:{$ne:'exited'}}},{$group:{_id:'$dept',headcount:{$sum:1},avgBasic:{$avg:'$basic'}}}]);
if(u.role==='hr')return s.json({...base,role:'hr',today:(await S.attendanceSummary(u,{from:t,to:t,department})).counts,
pendingApprovals:{leave:await Leave.countDocuments({status:'pending'}),corrections:await Correction.countDocuments({status:'pending'})},headcountByDept:byDept});
const exits=await Employee.countDocuments({exitDate:{$regex:'^'+t.slice(0,4)}});
s.json({...base,role:'admin',attritionYtdPct:+(exits/Math.max(hc+exits/2,1)*100).toFixed(1),payroll:await S.payrollSummary(u),
avgSalary:Math.round(byDept.reduce((a,d)=>a+d.avgBasic*1.5*d.headcount,0)/Math.max(hc,1)),headcountByDept:byDept,
genders:await Employee.aggregate([{$group:{_id:'$gender',n:{$sum:1}}}]),auditFeed:await Audit.find().sort('-createdAt').limit(8)})}));
export default r;
