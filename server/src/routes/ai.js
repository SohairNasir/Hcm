import {Router} from 'express';import {AiLog} from '../models.js';import {auth,role,h} from '../auth.js';import * as S from '../stats.js';import {today} from '../lib.js';
const r=Router();r.use(auth);
const POLICY=`Policy: office start 09:00, grace 15 min (late after 09:15); half day if under 5 hours; absent if no record and no approved leave; weekend Sat-Sun; one check-in per day.
Leave: working days only (weekends/holidays skipped). Quotas per year: annual 14, sick 8, casual 10, unpaid unlimited. Overlap or over-balance is rejected.
Payroll: gross = 1.5 x basic (HRA 40%, medical 10%); per day = gross / working days; deduct absent + unpaid + 0.5 x half days; joiners/leavers prorated; tax slab on gross x 12: 0-600k 0%; 5% to 1.2M; 30k+15% to 2.4M; 210k+25% to 3.6M; 510k+35% above. Admin finalizes; finalized payroll is locked.`;
const obj=p=>({type:'object',properties:p});const rng={from:{type:'string',description:'YYYY-MM-DD'},to:{type:'string'},department:{type:'string'}};
const TOOLS={get_headcount:[obj({department:{type:'string'}}),S.headcount,'Number of active employees'],get_attendance_summary:[obj(rng),S.attendanceSummary,'Attendance counts and rate for a date range'],
get_late_comers:[obj(rng),S.lateComers,'Top late-comers'],get_leave_summary:[obj(rng),S.leaveSummary,'Approved leave days by type and pending count'],
get_my_leave_balance:[obj({}),S.myLeaveBalance,'Own leave balance this year'],get_payroll_summary:[obj({month:{type:'string'}}),S.payrollSummary,'Payroll totals for a month'],
search_employees:[obj({q:{type:'string'}}),S.searchEmployees,'Find employees by name, code or department']};
const ALLOW={admin:Object.keys(TOOLS).filter(k=>k!=='get_my_leave_balance'),hr:Object.keys(TOOLS).filter(k=>k!=='get_my_leave_balance'),employee:['get_my_leave_balance','get_attendance_summary']};
async function llm(messages,tools){const c=new AbortController(),t=setTimeout(()=>c.abort(),15000);
try{const res=await fetch((process.env.AI_BASE_URL||'')+'/chat/completions',{method:'POST',signal:c.signal,headers:{'Content-Type':'application/json',Authorization:'Bearer '+process.env.AI_API_KEY},
body:JSON.stringify({model:process.env.AI_MODEL,messages,temperature:.2,...(tools?.length?{tools}:{})})});if(!res.ok)throw new Error('AI '+res.status);return(await res.json()).choices[0].message}finally{clearTimeout(t)}}
const FALL='The AI assistant is unavailable right now. Please try again or use the dashboards.';
const limit=h(async(q,s,n)=>{if(!process.env.AI_API_KEY)return s.json({answer:FALL,aiGenerated:true,fallback:true});
if(await AiLog.countDocuments({user:q.user._id,createdAt:{$gt:new Date(Date.now()-36e5)}})>=20)return s.status(429).json({error:'AI limit: 20 requests per hour'});n()});
const sys=u=>`You are the HCM Lite assistant for ${u.name} (role: ${u.role}). Answer ONLY from tool results or the policy below; if you do not know, say so. Never share another employee's data or salary with an Employee - refuse politely. Be brief. Reply in the user's language (Roman Urdu is fine). Today is ${today()}.\n${POLICY}`;
r.post('/chat',limit,h(async(q,s)=>{const u=q.user,msg=String(q.body.message||'').slice(0,500);if(!msg)return s.status(422).json({error:'message required'});
const names=ALLOW[u.role],tools=names.map(n=>({type:'function',function:{name:n,description:TOOLS[n][2],parameters:TOOLS[n][0]}}));
const m=[{role:'system',content:sys(u)},{role:'user',content:msg}];let used='',ans=FALL,ok=false;
try{for(let i=0;i<3;i++){const o=await llm(m,tools);if(o.tool_calls?.length){m.push(o);for(const tc of o.tool_calls){const n=tc.function.name;used+=n+' ';
const out=names.includes(n)?await TOOLS[n][1](u,JSON.parse(tc.function.arguments||'{}')):{error:'not allowed for your role'};m.push({role:'tool',tool_call_id:tc.id,content:JSON.stringify(out)})}continue}
ans=o.content;ok=true;break}}catch(e){console.error(e.message)}
await AiLog.create({user:u._id,q:msg,tool:used.trim(),ok});s.json({answer:ans,aiGenerated:true,fallback:!ok})}));
r.post('/summary',role('admin','hr'),limit,h(async(q,s)=>{let ans=FALL,ok=false;
try{const o=await llm([{role:'system',content:'Write 3 to 5 short bullet insights using ONLY the numbers in the KPI JSON. Do not invent numbers.'},{role:'user',content:JSON.stringify(q.body.kpis).slice(0,6000)}]);ans=o.content;ok=true}catch(e){console.error(e.message)}
await AiLog.create({user:q.user._id,q:'summary',tool:'summary',ok});s.json({answer:ans,aiGenerated:true,fallback:!ok})}));
// smart leave: JSON is validated, retried once, then the normal form is used. The AI never saves anything.
r.post('/smart-leave',role('employee'),limit,h(async(q,s)=>{const ISO=/^\d{4}-\d{2}-\d{2}$/;let res=null;
for(let i=0;i<2&&!res;i++){try{const o=await llm([{role:'system',content:`Today is ${today()} (${new Date().toLocaleDateString('en',{weekday:'long'})}). Convert the request into JSON only: {"type":"annual|sick|casual|unpaid","start":"YYYY-MM-DD","end":"YYYY-MM-DD","reason":"short"}. No other text.`},{role:'user',content:String(q.body.text||'').slice(0,300)}]);
const j=JSON.parse((o.content.match(/\{[\s\S]*\}/)||[''])[0]);if(['annual','sick','casual','unpaid'].includes(j.type)&&ISO.test(j.start)&&ISO.test(j.end)&&j.end>=j.start)res={type:j.type,start:j.start,end:j.end,reason:String(j.reason||'')}}catch(e){}}
await AiLog.create({user:q.user._id,q:'smart-leave',tool:'smart-leave',ok:!!res});
res?s.json({form:res,aiGenerated:true}):s.status(422).json({fallback:true,error:'Could not understand - please fill the form manually'})}));
export default r;
