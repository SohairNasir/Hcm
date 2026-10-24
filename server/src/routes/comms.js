import {Router} from 'express';import {Notice,Notif,Audit} from '../models.js';import {auth,role,h,audit} from '../auth.js';
const r=Router();r.use(auth);
r.get('/notices',h(async(q,s)=>s.json(await Notice.find().sort('-createdAt').limit(20))));
r.post('/notices',role('admin','hr'),h(async(q,s)=>{const {title,body}=q.body;if(!title||!body)return s.status(422).json({error:'title and body required'});
const n=await Notice.create({title,body,by:q.user.email});await audit(q,'create','notice/'+n._id,null,n);s.json(n)}));
r.get('/notifications',h(async(q,s)=>s.json(await Notif.find({user:q.user._id}).sort('-createdAt').limit(30))));
r.post('/notifications/read',h(async(q,s)=>{await Notif.updateMany({user:q.user._id},{read:true});s.json({ok:true})}));
r.get('/audit',role('admin'),h(async(q,s)=>{const {page=1,limit=20}=q.query;s.json({items:await Audit.find().sort('-createdAt').skip((page-1)*limit).limit(+limit),total:await Audit.countDocuments()})}));
export default r;
