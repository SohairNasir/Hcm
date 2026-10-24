import {Setting,Holiday,Attendance,Leave,LeaveType} from './models.js';
export const loc=()=>new Date(Date.now()-new Date().getTimezoneOffset()*6e4);
export const iso=d=>d.toISOString().slice(0,10);
export const today=()=>iso(loc());
export const settings=async()=>(await Setting.findOne())?.toObject()||{start:'09:00',grace:15,halfDay:5,weekend:[0,6],radius:150};
export const holSet=async()=>new Set((await Holiday.find()).map(x=>x.date));
export const isWork=(ds,s,hol)=>!s.weekend.includes(new Date(ds+'T00:00:00Z').getUTCDay())&&!hol.has(ds);
export function workDays(a,b,s,hol){let n=0;for(const d=new Date(a+'T00:00:00Z');iso(d)<=b;d.setUTCDate(d.getUTCDate()+1))if(isWork(iso(d),s,hol))n++;return n}
// annual tax slab applied to gross x 12, returned per month
export function tax(g){const a=g*12;const t=a<=6e5?0:a<=1.2e6?.05*(a-6e5):a<=2.4e6?3e4+.15*(a-1.2e6):a<=3.6e6?2.1e5+.25*(a-2.4e6):5.1e5+.35*(a-3.6e6);return t/12}
export function haversine(lat1,lng1,lat2,lng2){const R=6371000,r=x=>x*Math.PI/180,dl=r(lat2-lat1),dn=r(lng2-lng1);const h=Math.sin(dl/2)**2+Math.cos(r(lat1))*Math.cos(r(lat2))*Math.sin(dn/2)**2;return 2*R*Math.asin(Math.sqrt(h))}
export async function balance(emp,year=today().slice(0,4),withPending=false){const types=await LeaveType.find();const ls=await Leave.find({emp,status:{$in:withPending?['approved','pending']:['approved']},start:{$regex:'^'+year}});
return types.map(t=>{const used=ls.filter(l=>l.type===t.name).reduce((a,l)=>a+l.days,0);return{type:t.name,quota:t.quota??null,used,left:t.quota==null?null:t.quota-used}})}
// one row per employee per working day: present|late|half_day|missing_checkout|on_leave|absent|not_in
export async function daily(from,to,emps){const s=await settings(),hol=await holSet(),t=today(),ids=emps.map(e=>e._id);
const recs=await Attendance.find({emp:{$in:ids},date:{$gte:from,$lte:to}});
const lv=await Leave.find({emp:{$in:ids},status:'approved',start:{$lte:to},end:{$gte:from}});
const rm=new Map(recs.map(r=>[r.emp+'|'+r.date,r])),out=[];
for(const d=new Date(from+'T00:00:00Z');iso(d)<=to;d.setUTCDate(d.getUTCDate()+1)){const ds=iso(d);if(ds>t||!isWork(ds,s,hol))continue;
for(const e of emps){if(ds<(e.joinDate||'')||(e.exitDate&&ds>e.exitDate))continue;const r=rm.get(e._id+'|'+ds);
const st=r?(!r.outAt&&ds<t?'missing_checkout':r.status):lv.some(l=>String(l.emp)==String(e._id)&&l.start<=ds&&l.end>=ds)?'on_leave':ds<t?'absent':'not_in';
out.push({emp:e._id,date:ds,status:st})}}return out}
