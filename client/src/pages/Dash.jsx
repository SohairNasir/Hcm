import {useState,useEffect} from 'react';
import {Card,Stat,B,F,Sel,Bd,T,Bars,Grid,Filt,Ic,Logo,Cnt,LineC,Donut,Hero} from '../components/ui';
import {DEPT,EMP} from '../data';
import AI from './AI';
function Dash({role}){
 const [sum,setSum]=useState(0);const [inn,setIn]=useState(null);
 const Sm=()=><Card t="AI summary" r={<B v="p" onClick={()=>setSum(1)}>Summarize</B>}>{sum?<ul className="text-sm space-y-1.5 list-disc pl-5 rise"><li>Attendance rate is 93% this month.</li><li>Engineering has the most late arrivals.</li><li>5 leave requests are waiting for approval.</li><li className="text-[var(--mut)] text-xs list-none -ml-5">AI-generated from KPI JSON only</li></ul>:<p className="text-sm text-[var(--mut)]">Click Summarize for 3–5 insight bullets.</p>}</Card>;
 if(role==='admin')return <div className="space-y-4"><Filt/><Grid n={4}><Stat l="Headcount" v="44" s="+3 this month"/><Stat l="Attrition YTD" v="4.2%" k="r"/><Stat l="Payroll cost" v="PKR 6.8M" k="b"/><Stat l="Avg salary" v="PKR 155k" k="c"/></Grid>
 <Grid><Card t="Headcount by department"><Bars d={DEPT}/></Card><Card t="Payroll cost share (PKR k)"><Donut d={DEPT.map(([n,v],i)=>[n,v*52,['#0f9d8a','#5b4fcf','#f0932b','#e5484d','#35d0b8'][i]])}/></Card></Grid>
 <Grid><Card t="Audit feed"><ul className="text-sm space-y-2">{['Admin finalized Sept payroll','HR approved leave L-018','HR registered E-004','Admin updated office radius'].map(x=><li key={x} className="flex gap-2"><span className="t-a">●</span>{x}</li>)}</ul></Card><Sm/></Grid></div>;
 if(role==='hr')return <div className="space-y-4"><Filt/><Grid n={4}><Stat l="Headcount" v="44"/><Stat l="Present" v="42"/><Stat l="On leave" v="5" k="b"/><Stat l="Late today" v="3" k="c"/></Grid>
 <Grid><Card t="Attendance trend"><LineC d={[['Mon',40],['Tue',42],['Wed',39],['Thu',43],['Fri',41]]}/></Card><Card t="Absenteeism by dept"><Bars d={DEPT.map(([n,v])=>[n,Math.round(v/3)])} k="c"/></Card></Grid>
 <Grid><Card t="Top 5 late-comers"><T h={['Name','Lates']} rows={[['Bilal Ahmed',4],['Usman Ali',3],['Hira Noor',2]]}/></Card><Sm/></Grid><div className="card rise flex justify-between items-center"><span>Pending approvals</span><span className="bdg bg-c">5 leave · 2 corrections</span></div></div>;
 return <div className="space-y-4"><Grid n={2}><Card t="Check-in" c="text-center"><div className="w-28 h-28 mx-auto rounded-full grid place-items-center text-4xl bg-gradient-to-br from-[var(--a)] to-[var(--b)] text-white animate-pulse shadow-[0_0_40px_#0f9d8a66]">{inn?<Ic n="check" s={48}/>:<Ic n="att" s={48}/>}</div><p className="mt-3 text-sm text-[var(--mut)]">{inn?'Checked in at '+inn:'Server stamps the time'}</p><div className="flex gap-2 justify-center mt-3"><B v="p" onClick={()=>setIn(new Date().toLocaleTimeString())}>Check in</B><B onClick={()=>setIn(null)}>Check out</B></div><p className="text-xs mt-3 t-a">Inside office area · camera check-in optional</p></Card>
 <div className="grid grid-cols-2 gap-4"><Stat l="Hours this week" v="31 / 40" s="78%"/><Stat l="Late count" v="1" k="c"/><Stat l="Leave left" v="22" k="b" s="annual 14 · sick 6 · casual 8 (demo)"/><Stat l="Last payslip" v="Sep" k="r" s="net PKR 128k"/></div></Grid>
 <Card t="Announcements"><p className="text-sm">📣 Eid holiday notice: office closed Monday.</p></Card><AI role="emp"/></div>}

export default Dash;
