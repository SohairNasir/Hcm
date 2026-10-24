import {useState,useEffect} from 'react';
import {Card,Stat,B,F,Sel,Bd,T,Bars,Grid,Filt,Ic,Logo,Cnt,LineC,Donut,Hero} from '../components/ui';
import {DEPT,EMP} from '../data';
function Reg(){return <Card t="Register employee (creates login)"><Grid n={3}><F l="Employee code"/><F l="Full name"/><F l="Email" type="email"/><Sel l="Department" o={['HR','Engineering','Sales','Ops']}/><F l="Designation"/><F l="Join date" type="date"/><F l="Basic salary" type="number"/><F l="Phone"/><F l="Temporary password" type="password"/></Grid><div className="mt-3 flex items-center gap-3"><B v="p">Register</B><span className="text-xs text-[var(--mut)]">Employee must change password on first sign-in</span></div></Card>}
export default Reg;
