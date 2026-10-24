import {useState,useEffect} from 'react';
import {Card,Stat,B,F,Sel,Bd,T,Bars,Grid,Filt,Ic,Logo,Cnt,LineC,Donut,Hero} from '../components/ui';
import {DEPT,EMP} from '../data';
function Notif(){return <Card t="Notifications">{[['Your sick leave was approved','2h ago'],['September payslip is ready','2d ago']].map(([a,b])=><div key={a} className="flex justify-between py-2.5 border-t first:border-0 border-[var(--bd)] text-sm"><span className="flex items-center gap-2"><span className="t-a"><Ic n="notif" s={16}/></span>{a}</span><span className="text-[var(--mut)]">{b}</span></div>)}</Card>}
export default Notif;
