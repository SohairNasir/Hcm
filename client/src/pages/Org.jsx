import {useState,useEffect} from 'react';
import {Card,Stat,B,F,Sel,Bd,T,Bars,Grid,Filt,Ic,Logo,Cnt,LineC,Donut,Hero} from '../components/ui';
import {DEPT,EMP} from '../data';
function Org(){const [t,setT]=useState('Departments');const L={Departments:['HR','Engineering','Sales','Ops','Finance'],Designations:['Developer','Executive','Officer','Supervisor'],'Leave types':['Annual · 14','Sick · 8','Casual · 10','Unpaid · unlimited'],Holidays:['14 Aug · Independence Day','25 Dec · Quaid Day']};
 return <Card t="Organization setup"><div className="flex flex-wrap gap-2 mb-4">{Object.keys(L).map(k=><B key={k} v={t===k?'p':''} onClick={()=>setT(k)}>{k}</B>)}</div><div key={t} className="flex flex-wrap gap-2 mb-4">{L[t].map((x,i)=><span key={x} className="bdg bg-b rise !text-sm !px-4 !py-1.5" style={{animationDelay:i*60+'ms'}}>{x}</span>)}</div><div className="flex gap-2 max-w-md"><input className="inp !mt-0" placeholder={'Add to '+t}/><B v="p">Add</B></div></Card>}
export default Org;
