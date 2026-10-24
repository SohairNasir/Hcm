import {useState,useEffect} from 'react';
import {Card,Stat,B,F,Sel,Bd,T,Bars,Grid,Filt,Ic,Logo,Cnt,LineC,Donut,Hero} from '../components/ui';
import {DEPT,EMP} from '../data';
function Setup(){return <Card t="Company settings (Admin only)"><Grid><F l="Company name" defaultValue="Acme Pvt Ltd"/><F l="Office start" type="time" defaultValue="09:00"/><F l="Grace (min)" type="number" defaultValue="15"/><F l="Half day under (hours)" type="number" defaultValue="5"/><Sel l="Weekend" o={['Sat–Sun','Fri–Sat','Sun only']}/><F l="Office radius (m)" type="number" defaultValue="150"/><F l="Office latitude" defaultValue="24.8607"/><F l="Office longitude" defaultValue="67.0011"/></Grid><div className="mt-4 flex items-center gap-3"><B v="p">Save settings</B><span className="text-xs text-[var(--mut)]">Applied to new records only</span></div></Card>}
export default Setup;
