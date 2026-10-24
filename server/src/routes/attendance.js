import {Router} from 'express';import {Attendance,Correction,Employee} from '../models.js';import {auth,role,h,audit,notifyEmp} from '../auth.js';
import {settings,today,loc,haversine,daily} from '../lib.js';
const r=Router();r.use(auth);
// server stamps the time; optional camera/location payload is validated on the server
r.post('/check-in',role('employee'),h(async(q,s)=>{const set=await settings(),b=q.body||{};let src='web';
if(b.camera){if(b.faces!==1)return s.status(422).json({error:'Exactly one face must be detected'});if(!(b.accuracy<=100))return s.status(422).json({error:'GPS accuracy worse than 100 m'});
if(set.lat==null)return s.status(422).json({error:'Admin has not set the office location'});
const dist=haversine(b.lat,b.lng,set.lat,set.lng);if(dist>set.radius)return s.status(422).json({error:'Outside office area',distance:Math.round(dist)});src='camera'}
const d=loc(),min=d.getUTCHours()*60+d.getUTCMinutes(),[hh,mm]=set.start.split(':').map(Number);
const status=min>hh*60+mm+set.grace?'late':'present';
const rec=await Attendance.create({emp:q.user.employee,date:today(),inAt:new Date(),status,source:src,lat:b.lat,lng:b.lng}).catch(e=>{if(e.code===11000)return null;throw e});
if(!rec)return s.status(409).json({error:'Already checked in today'});s.json(rec)}));
r.post('/check-out',role('employee'),h(async(q,s)=>{const rec=await Attendance.findOne({emp:q.user.employee,date:today()});
if(!rec)return s.status(404).json({error:'No check-in today'});if(rec.outAt)return s.status(409).json({error:'Already checked out'});
const set=await settings();rec.outAt=new Date();rec.hours=+((rec.outAt-rec.inAt)/36e5).toFixed(2);if(rec.hours<set.halfDay)rec.status='half_day';await rec.save();s.json(rec)}));
r.get('/me',role('employee'),h(async(q,s)=>{const m=q.query.month||today().slice(0,7),e=await Employee.findById(q.user.employee);
s.json(await daily(m+'-01',m+'-31',[e]).then(x=>x.filter(d=>d.date.startsWith(m))))}));
r.get('/board',role('hr','admin'),h(async(q,s)=>{const date=q.query.date||today(),emps=await Employee.find({status:{$ne:'exited'}});
const rows=await daily(date,date,emps),recs=await Attendance.find({date});
s.json(emps.map(e=>{const row=rows.find(x=>String(x.emp)===String(e._id)),rec=recs.find(x=>String(x.emp)===String(e._id));
return{emp:e._id,code:e.code,name:e.name,dept:e.dept,status:row?.status||'weekend/holiday',inAt:rec?.inAt,outAt:rec?.outAt,hours:rec?.hours}}))}));
r.post('/corrections',role('employee'),h(async(q,s)=>{const {date,reason}=q.body;if(!date||!reason)return s.status(422).json({error:'date and reason required'});
s.json(await Correction.create({emp:q.user.employee,date,reason}))}));
r.get('/corrections',h(async(q,s)=>{const f=q.user.role==='employee'?{emp:q.user.employee}:{};if(q.query.status)f.status=q.query.status;
s.json(await Correction.find(f).populate('emp','name code').sort('-createdAt'))}));
r.post('/corrections/:id/decide',role('hr'),h(async(q,s)=>{const c=await Correction.findById(q.params.id);if(!c||c.status!=='pending')return s.status(409).json({error:'Not pending'});
c.status=q.body.approve?'approved':'rejected';c.by=q.user.email;await c.save();
if(q.body.approve){const set=await settings(),inAt=new Date(c.date+'T'+set.start+':00');
await Attendance.findOneAndUpdate({emp:c.emp,date:c.date},{inAt,outAt:new Date(+inAt+8*36e5),hours:8,status:'present',source:'correction'},{upsert:true})}
await audit(q,c.status,'correction/'+c._id,{status:'pending'},{status:c.status});await notifyEmp(c.emp,`Your attendance correction for ${c.date} was ${c.status}`);s.json(c)}));
export default r;
