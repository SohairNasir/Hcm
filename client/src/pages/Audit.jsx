import {useState,useEffect} from 'react';
import {Card,Stat,B,F,Sel,Bd,T,Bars,Grid,Filt,Ic,Logo,Cnt,LineC,Donut,Hero} from '../components/ui';
import {DEPT,EMP} from '../data';
function Audit(){return <Card t="Audit log (read-only)"><T h={['Time','Actor','Action','Entity','Before → After']} rows={[['10:12','Admin','finalize','payroll/2026-09',<code className="text-xs">{'{status:"draft"} → {status:"final"}'}</code>],['09:40','HR','approve','leave/L-018',<code className="text-xs">{'{pending} → {approved}'}</code>],['09:10','HR','create','employee/E-004',<code className="text-xs">{'null → {...}'}</code>]]}/></Card>}
export default Audit;
