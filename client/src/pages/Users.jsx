import {useState,useEffect} from 'react';
import {Card,Stat,B,F,Sel,Bd,T,Bars,Grid,Filt,Ic,Logo,Cnt,LineC,Donut,Hero} from '../components/ui';
import {DEPT,EMP} from '../data';
function Users(){return <div className="space-y-4"><Card t="Create HR login"><Grid n={3}><F l="Name"/><F l="Email" type="email"/><F l="Temporary password" type="password"/></Grid><B v="p" className="mt-3">Create login</B></Card><Card t="Logins"><T h={['Name','Role','Status','Actions']} rows={[['Sana Iqbal','HR',<Bd s="Active"/>,<span className="flex gap-2"><B>Reset</B><B v="r">Deactivate</B></span>],['Hira Noor','Employee',<Bd s="Active"/>,<span className="flex gap-2"><B>Reset</B><B v="r">Deactivate</B></span>]]}/></Card></div>}
export default Users;
