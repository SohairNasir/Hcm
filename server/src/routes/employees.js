import {Router} from 'express';import bcrypt from 'bcryptjs';import crypto from 'crypto';
import {Employee,User,Dept} from '../models.js';import {auth,role,h,audit} from '../auth.js';import {balance,daily,today} from '../lib.js';
const r=Router();r.use(auth);const ISO=/^\d{4}-\d{2}-\d{2}$/,EM=/^[^@\s]+@[^@\s]+\.[^@\s]+$/;
async function problems(row,depts,seen){const p=[];for(const f of['code','name','email','dept','joinDate','basic'])if(!row[f])p.push([f,'required']);
if(row.email&&!EM.test(row.email))p.push(['email','invalid email']);if(row.dept&&!depts.has(row.dept))p.push(['dept','unknown department']);
if(row.joinDate&&!ISO.test(row.joinDate))p.push(['joinDate','must be ISO date YYYY-MM-DD']);if(row.basic&&!(+row.basic>0))p.push(['basic','must be > 0']);
const em=(row.email||'').toLowerCase();
if(row.code&&(seen.has('c'+row.code)||await Employee.exists({code:row.code})))p.push(['code','duplicate code']);
if(em&&(seen.has('e'+em)||await Employee.exists({email:em})||await User.exists({email:em})))p.push(['email','duplicate email']);
seen.add('c'+row.code);seen.add('e'+em);return p}
async function create(q,row){const tmp=crypto.randomBytes(4).toString('hex');const e=await Employee.create({...row,basic:+row.basic});
await User.create({email:e.email,password:await bcrypt.hash(tmp,10),role:'employee',employee:e._id,name:e.name,mustChange:true});
await audit(q,'create','employee/'+e.code,null,e);return{employee:e,tempPassword:tmp}}
const depts=async()=>new Set((await Dept.find()).map(d=>d.name));
r.get('/me',role('employee'),h(async(q,s)=>s.json(await Employee.findById(q.user.employee))));
r.patch('/me',role('employee'),h(async(q,s)=>{const {phone,address}=q.body;const e=await Employee.findByIdAndUpdate(q.user.employee,{$set:{phone,address}},{new:true});s.json(e)}));
r.get('/export',role('hr'),h(async(q,s)=>{const c=['code','name','email','dept','desig','joinDate','basic','phone','status'];
const rows=await Employee.find();s.type('text/csv').send([c.join(','),...rows.map(e=>c.map(k=>e[k]??'').join(','))].join('\n'))}));
r.post('/import',role('hr'),h(async(q,s)=>{const lines=String(q.body.csv||'').trim().split(/\r?\n/);const head=lines.shift().split(',').map(x=>x.trim());
const ds=await depts(),seen=new Set(),errors=[],ok=[];
for(const [i,l] of lines.entries()){const v=l.split(',').map(x=>x.trim()),row=Object.fromEntries(head.map((k,j)=>[k,v[j]]));
const p=await problems(row,ds,seen);p.length?p.forEach(([field,reason])=>errors.push({row:i+2,field,reason})):ok.push(row)}
if(q.query.dry||errors.length)return s.json({dryRun:!!q.query.dry,valid:ok.length,errors});
const out=[];for(const row of ok)out.push(await create(q,row));s.json({imported:out.length,credentials:out.map(o=>({email:o.employee.email,tempPassword:o.tempPassword}))})}));
r.get('/',role('hr','admin'),h(async(q,s)=>{const {search,dept,status,page=1,limit=10}=q.query,f={};
if(dept&&dept!=='All')f.dept=dept;if(status)f.status=status;if(search){const x=new RegExp(String(search).replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'i');f.$or=[{name:x},{code:x},{email:x}]}
const [items,total]=await Promise.all([Employee.find(f).sort('code').skip((page-1)*limit).limit(+limit),Employee.countDocuments(f)]);s.json({items,total,page:+page,pages:Math.ceil(total/limit)})}));
r.post('/',role('hr'),h(async(q,s)=>{const p=await problems(q.body,await depts(),new Set());if(p.length)return s.status(422).json({errors:p.map(([field,reason])=>({field,reason}))});s.json(await create(q,q.body))}));
r.get('/:id',h(async(q,s)=>{if(q.user.role==='employee'&&String(q.user.employee)!==q.params.id)return s.status(403).json({error:'Forbidden'});
const e=await Employee.findById(q.params.id);if(!e)return s.status(404).json({error:'Not found'});
const from=today().slice(0,8)+'01',rows=await daily(from,today(),[e]),c={};rows.forEach(x=>c[x.status]=(c[x.status]||0)+1);
s.json({employee:e,attendanceThisMonth:c,leaveBalance:await balance(e._id)})}));
r.put('/:id',role('hr'),h(async(q,s)=>{const old=await Employee.findById(q.params.id);if(!old)return s.status(404).json({error:'Not found'});
const F=['name','dept','desig','joinDate','exitDate','basic','phone','address','gender','status'],set={};F.forEach(k=>{if(q.body[k]!==undefined)set[k]=q.body[k]});
if(set.basic!==undefined&&!(+set.basic>0))return s.status(422).json({error:'basic must be > 0'});
const n=await Employee.findByIdAndUpdate(q.params.id,{$set:set},{new:true});if(set.status==='exited')await User.updateOne({employee:n._id},{active:false});
await audit(q,'update','employee/'+n.code,old,n);s.json(n)}));
export default r;
