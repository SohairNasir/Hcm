import jwt from 'jsonwebtoken';
import {User,Audit,Notif} from './models.js';
export const h=f=>(q,s,n)=>f(q,s,n).catch(n);
export const sign=u=>jwt.sign({id:u._id},process.env.JWT_SECRET||'dev',{expiresIn:'1d'});
export const auth=h(async(q,s,n)=>{const t=(q.headers.authorization||'').replace('Bearer ','');let p;
try{p=jwt.verify(t,process.env.JWT_SECRET||'dev')}catch{return s.status(401).json({error:'Unauthorized'})}
const u=await User.findById(p.id);if(!u||!u.active)return s.status(401).json({error:'Unauthorized'});
if(u.mustChange&&!q.originalUrl.includes('change-password')&&!q.originalUrl.includes('/auth/me'))return s.status(403).json({error:'Change your temporary password first',mustChange:true});
q.user=u;n()});
export const role=(...r)=>(q,s,n)=>r.includes(q.user.role)?n():s.status(403).json({error:'Forbidden'});
export const audit=(q,action,entity,before,after)=>Audit.create({actor:q.user.email,role:q.user.role,action,entity,before,after});
export const notifyEmp=async(emp,text)=>{const u=await User.findOne({employee:emp});if(u)await Notif.create({user:u._id,text})};
