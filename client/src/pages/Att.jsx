import {useState,useEffect} from 'react';
import {Card,Stat,B,F,Sel,Bd,T,Bars,Grid,Filt,Ic,Logo,Cnt,LineC,Donut,Hero} from '../components/ui';
import {DEPT,EMP} from '../data';
function Att({role}){
 if(role==='emp'){const st=['present','present','late','present','present','absent','absent'].concat(Array.from({length:23},(_,i)=>i%9==4?'on_leave':i%7==3?'late':'present'));const c={present:'bg-a',late:'bg-c',absent:'bg-r',on_leave:'bg-b'};
 return <div className="space-y-4"><Card t="My attendance · October"><div className="grid grid-cols-7 gap-2">{st.map((s,i)=><div key={i} title={s} className={'day bdg '+c[s]} style={{animationDelay:i*18+'ms'}}>{i+1}</div>)}</div><div className="flex gap-3 mt-3 text-xs">{Object.keys(c).map(k=><Bd key={k} s={k}/>)}</div></Card><Card t="Request correction"><Grid n={3}><F l="Date" type="date"/><F l="Reason"/><div className="flex items-end"><B v="p">Submit request</B></div></Grid></Card></div>}
 return <div className="space-y-4"><Card t="Daily attendance board"><T h={['Employee','In','Out','Hours','Status']} rows={[['Ayesha Khan','08:52','17:30','8.6',<Bd s="present"/>],['Bilal Ahmed','09:41','17:45','8.1',<Bd s="late"/>],['Hira Noor','—','—','0',<Bd s="on_leave"/>],['Usman Ali','09:05','13:20','4.2',<Bd s="half_day"/>]]}/></Card>
 <Card t="Correction requests"><T h={['Employee','Date','Reason','Action']} rows={[['Usman Ali','22 Oct','Forgot to check out',role==='hr'?<span className="flex gap-2"><B v="p">Approve</B><B v="r">Reject</B></span>:<Bd s="pending"/>]]}/></Card></div>}
export default Att;
