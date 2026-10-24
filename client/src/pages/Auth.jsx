import {useState,useEffect} from 'react';
import {B,F,Logo,Hero} from '../components/ui';
import {api,setToken} from '../api';
export default function Auth({go}){
 const [tab,setTab]=useState('in'),[f,setF]=useState({}),[err,setErr]=useState(''),[busy,setBusy]=useState(false),[chg,setChg]=useState(false);
 useEffect(()=>{api.get('/auth/status').then(d=>setTab(d.setup?'in':'setup')).catch(()=>setErr('Backend not reachable - start the server on :5000'))},[]);
 const on=k=>e=>setF({...f,[k]:e.target.value});
 const enter=u=>go(u.role==='employee'?'emp':u.role,u);
 const run=async fn=>{setErr('');setBusy(true);try{await fn()}catch(e){if(e.data?.mustChange)setChg(true);setErr(e.message)}setBusy(false)};
 const submit=()=>run(async()=>{
  if(chg){await api.post('/auth/change-password',{current:f.password,next:f.next});setChg(false);setErr('Password changed - sign in again');setF({email:f.email});return}
  const d=tab==='setup'?await api.post('/auth/setup',{company:f.company,email:f.email,password:f.password}):await api.post('/auth/login',{email:f.email,password:f.password});
  setToken(d.token);if(d.user.mustChange){setChg(true);setErr('Set a new password to continue');return}enter(d.user)});
 return <div className="min-h-screen flex items-center justify-center gap-14 p-4 relative z-10"><Hero/><div className="card rise w-full max-w-md !p-7">
  <div className="text-center mb-5"><div className="flex justify-center mb-2"><Logo s={52}/></div><h1 className="text-3xl font-extrabold bg-gradient-to-r from-[var(--a)] to-[var(--b)] bg-clip-text text-transparent">HCM Lite</h1></div>
  <div className="flex gap-2 mb-4">{[['setup','First-run setup'],['in','Sign in']].map(([k,l])=><B key={k} v={tab===k?'p':''} className="flex-1" onClick={()=>setTab(k)}>{l}</B>)}</div>
  <div className="space-y-3">{tab==='setup'&&<F l="Company name" value={f.company||''} onChange={on('company')}/>}
   <F l="Email" type="email" value={f.email||''} onChange={on('email')}/><F l={chg?'Current (temporary) password':'Password'} type="password" value={f.password||''} onChange={on('password')}/>
   {chg&&<F l="New password" type="password" value={f.next||''} onChange={on('next')}/>}
   {err&&<p className="text-sm t-r">{err}</p>}<B v="p" className="w-full" disabled={busy} onClick={submit}>{chg?'Change password':tab==='setup'?'Create company & Admin':'Sign in'}</B></div></div></div>}
