import {useState,useEffect} from 'react';
import {Card,Stat,B,F,Sel,Bd,T,Bars,Grid,Filt,Ic,Logo,Cnt,LineC,Donut,Hero} from '../components/ui';
import {DEPT,EMP} from '../data';
function Emp({role}){const [s,setS]=useState('');const [sel,setSel]=useState(null);const [dry,setDry]=useState(0);const rows=EMP.filter(r=>r.join(' ').toLowerCase().includes(s.toLowerCase()));
 return <div className="space-y-4"><Card t="Employee directory" r={role==='hr'&&<div className="flex gap-2"><B onClick={()=>setDry(1)}>CSV dry run</B><B>Export CSV</B></div>}><div className="flex gap-3 mb-3"><input className="inp !mt-0 max-w-xs" placeholder="Search name, code, dept..." value={s} onChange={e=>setS(e.target.value)}/></div><T h={['Code','Name','Dept','Designation','Status','']} rows={rows.map(r=>[...r.slice(0,4),<Bd s={r[4]}/>,<B onClick={()=>setSel(r)}>360°</B>])}/><p className="text-xs text-[var(--mut)] mt-3">Server-side search, filters and paging · page 1 of 1</p></Card>
 {dry?<Card t="CSV dry-run report"><T h={['Row','Field','Reason']} rows={[[3,'email','Invalid email'],[5,'department','Unknown department'],[8,'salary','Must be > 0']]}/></Card>:null}
 {sel&&<Card t={'Employee 360 · '+sel[1]} r={<B onClick={()=>setSel(null)}>Close</B>}><Grid n={3}><Stat l="Attendance rate" v="94%"/><Stat l="Leave used" v="6 days" k="b"/><Stat l="Gross salary" v={role==='hr'||role==='admin'?'PKR 150k':'—'} k="c"/></Grid></Card>}</div>}
export default Emp;
