import {useState,useEffect} from 'react';
import {Card,Stat,B,F,Sel,Bd,T,Bars,Grid,Filt,Ic,Logo,Cnt,LineC,Donut,Hero} from '../components/ui';
import {DEPT,EMP} from '../data';
function Ann({role}){return <div className="space-y-4">{role!=='emp'&&<Card t="Post announcement"><F l="Title"/><label className="block text-sm mt-2"><span className="text-[var(--mut)]">Message</span><textarea className="inp" rows="3"/></label><B v="p" className="mt-3">Post to all dashboards</B></Card>}<Card t="Announcements">{['Eid holiday notice','New attendance policy','Payroll cut-off 25th'].map((x,i)=><p key={x} className="py-2 border-t first:border-0 border-[var(--bd)] text-sm rise" style={{animationDelay:i*80+'ms'}}><span className="flex items-center gap-2"><span className="t-b"><Ic n="ann" s={16}/></span>{x}</span></p>)}</Card></div>}
export default Ann;
