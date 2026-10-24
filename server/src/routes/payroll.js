import {Router} from 'express';import PDF from 'pdfkit';import {Employee,Leave,Payroll} from '../models.js';import {auth,role,h,audit,notifyEmp} from '../auth.js';
import {settings,holSet,workDays,daily,tax,iso,today} from '../lib.js';
const r=Router();r.use(auth);
// gross = 1.5 x basic (HRA 40%, medical 10%); deduct absent + unpaid + 0.5 x half days; prorate joiners/leavers
async function line(e,month,s,hol){const first=month+'-01',[y,m]=month.split('-').map(Number),last=iso(new Date(Date.UTC(y,m,0)));
const st=e.joinDate>first?e.joinDate:first,en=e.exitDate&&e.exitDate<last?e.exitDate:last;if(st>en)return null;
const wd=workDays(first,last,s,hol),emp=workDays(st,en,s,hol),gross=1.5*e.basic,per=gross/Math.max(wd,1);
const rows=await daily(st,en<today()?en:today(),[e]),absent=rows.filter(x=>x.status==='absent').length,half=rows.filter(x=>x.status==='half_day').length;
const ul=await Leave.find({emp:e._id,type:'unpaid',status:'approved',start:{$lte:en},end:{$gte:st}});
const unpaid=ul.reduce((a,l)=>a+workDays(l.start>st?l.start:st,l.end<en?l.end:en,s,hol),0);
const ded=(absent+unpaid+.5*half)*per,base=per*emp,tx=tax(gross),R=Math.round;
return{emp:e._id,code:e.code,name:e.name,dept:e.dept,basic:e.basic,hra:R(.4*e.basic),medical:R(.1*e.basic),gross:R(gross),base:R(base),absent,unpaid,half,ded:R(ded),tax:R(tx),net:R(Math.max(base-ded-tx,0))}}
r.post('/draft',role('hr'),h(async(q,s)=>{const month=q.body.month;if(!/^\d{4}-\d{2}$/.test(month||''))return s.status(422).json({error:'month must be YYYY-MM'});
const ex=await Payroll.findOne({month});if(ex?.status==='finalized')return s.status(409).json({error:'Finalized payroll is locked'});
const set=await settings(),hol=await holSet(),lines=[];for(const e of await Employee.find({basic:{$gt:0}})){const l=await line(e,month,set,hol);if(l)lines.push(l)}
const p=await Payroll.findOneAndUpdate({month},{status:'draft',lines},{upsert:true,new:true});await audit(q,'draft','payroll/'+month,null,{employees:lines.length});s.json(p)}));
r.get('/slips/me',role('employee'),h(async(q,s)=>{const ps=await Payroll.find({status:'finalized','lines.emp':q.user.employee}).sort('-month');
s.json(ps.map(p=>({month:p.month,...p.lines.find(l=>String(l.emp)===String(q.user.employee))})))}));
r.get('/slips/:month/:emp/pdf',h(async(q,s)=>{if(q.user.role==='employee'&&String(q.user.employee)!==q.params.emp)return s.status(403).json({error:'Forbidden'});
const p=await Payroll.findOne({month:q.params.month,...(q.user.role==='employee'?{status:'finalized'}:{})});const l=p?.lines.find(x=>String(x.emp)===q.params.emp);
if(!l)return s.status(404).json({error:'Payslip not found'});s.type('application/pdf');const d=new PDF({margin:50});d.pipe(s);
d.fontSize(20).text('Payslip - '+p.month).moveDown().fontSize(12).text(`${l.name} (${l.code}) - ${l.dept}`).moveDown();
[['Basic',l.basic],['HRA 40%',l.hra],['Medical 10%',l.medical],['Gross',l.gross],['Absent days',l.absent],['Unpaid leave days',l.unpaid],['Half days',l.half],['Deductions',l.ded],['Tax',l.tax],['NET PAY',l.net]].forEach(([k,v])=>d.text(`${k}: ${v}`));d.end()}));
r.get('/:month',role('hr','admin'),h(async(q,s)=>s.json(await Payroll.findOne({month:q.params.month})||{month:q.params.month,status:'none',lines:[]})));
r.post('/:month/finalize',role('admin'),h(async(q,s)=>{const p=await Payroll.findOne({month:q.params.month});if(!p)return s.status(404).json({error:'No draft'});if(p.status==='finalized')return s.status(409).json({error:'Already finalized'});
p.status='finalized';p.finalizedBy=q.user.email;await p.save();await audit(q,'finalize','payroll/'+p.month,{status:'draft'},{status:'finalized'});
for(const l of p.lines)await notifyEmp(l.emp,`Your ${p.month} payslip is ready`);s.json(p)}));
export default r;
