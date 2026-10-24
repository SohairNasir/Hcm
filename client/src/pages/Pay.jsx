import {useState,useEffect} from 'react';
import {Card,Stat,B,F,Sel,Bd,T,Bars,Grid,Filt,Ic,Logo,Cnt,LineC,Donut,Hero} from '../components/ui';
import {DEPT,EMP} from '../data';
function Pay({role}){const [fin,setFin]=useState(0);const [dr,setDr]=useState(1);
 return <div className="space-y-4"><Card t="Payroll · October 2026" r={<Bd s={fin?'Finalized':'Draft'}/>}><div className="flex flex-wrap gap-2 mb-4">{role==='hr'&&<B v="p" onClick={()=>setDr(1)}>Create / refresh draft</B>}{role==='admin'&&<B v="p" disabled={fin} onClick={()=>setFin(1)}>{fin?'Locked':'Finalize & lock'}</B>}</div>
 {dr&&<T h={['Employee','Basic','Gross (1.5×)','Deductions','Tax','Net']} rows={[['Ayesha Khan','100,000','150,000','0','2,500','147,500'],['Bilal Ahmed','80,000','120,000','4,000','1,500','114,500'],['Usman Ali','70,000','105,000','1,600','1,000','102,400']]}/>}</Card>
 <Grid><Card t="Salary structure (HR)"><Grid><F l="Basic"/><F l="HRA 40%" disabled/><F l="Medical 10%" disabled/></Grid></Card><Card t="Tax slab · gross × 12"><ul className="text-sm space-y-1 text-[var(--mut)]"><li>0–600k → 0</li><li>600k–1.2M → 5%</li><li>1.2M–2.4M → 30k + 15%</li><li>2.4M–3.6M → 210k + 25%</li><li>3.6M+ → 510k + 35%</li></ul></Card></Grid></div>}
export default Pay;
