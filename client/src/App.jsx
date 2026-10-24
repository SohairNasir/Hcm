import {useState,useEffect} from 'react';
import {useNavigate,useLocation} from 'react-router-dom';
import {Card,Stat,B,F,Sel,Bd,T,Bars,Grid,Filt,Ic,Logo,Cnt,LineC,Donut,Hero} from './components/ui';
import {M,RL,SUB} from './data';
import AI from './pages/AI';
import Dash from './pages/Dash';
import Auth from './pages/Auth';
import Setup from './pages/Setup';
import Org from './pages/Org';
import Users from './pages/Users';
import Emp from './pages/Emp';
import Reg from './pages/Reg';
import Att from './pages/Att';
import Leave from './pages/Leave';
import Pay from './pages/Pay';
import Slips from './pages/Slips';
import Prof from './pages/Prof';
import Ann from './pages/Ann';
import Notif from './pages/Notif';
import Audit from './pages/Audit';
const P={dash:Dash,setup:Setup,org:Org,users:Users,emp:Emp,reg:Reg,att:Att,leave:Leave,pay:Pay,slips:Slips,prof:Prof,ai:AI,ann:Ann,notif:Notif,audit:Audit};
export default function App(){
 const [role,setRole]=useState(null);const nav=useNavigate();const loc=useLocation();const pg=loc.pathname.slice(1)||'dash';const setPg=k=>nav('/'+k);const [dark,setDark]=useState(true);const [open,setOpen]=useState(false);
 useEffect(()=>{document.documentElement.dataset.theme=dark?'dark':'light'},[dark]);
 const Tg=<B onClick={()=>setDark(!dark)} title="Toggle theme"><span className="flex items-center gap-1.5"><Ic n={dark?'sun':'moon'} s={16}/>{dark?'Light':'Dark'}</span></B>;
 if(!role)return <><div className="fixed top-3 right-3 z-20">{Tg}</div><Auth go={r=>{setRole(r);setPg('dash')}}/></>;
 const cur=M[role].find(x=>x[0]===pg)||M[role][0];const Pg=P[cur[0]];
 return <div className="relative z-10 flex min-h-screen">
 <aside className={'fixed md:sticky top-0 h-screen w-64 p-4 z-30 backdrop-blur-xl border-r border-[var(--bd)] transition-transform md:translate-x-0 '+(open?'':'-translate-x-full')} style={{background:'var(--side)'}}>
 <div className="flex items-center gap-2.5 mb-2"><Logo/><span className="text-xl font-extrabold">HCM Lite</span></div><span className="bdg bg-b mb-4 inline-block">{RL[role]} workspace</span>
 <nav className="space-y-1 overflow-y-auto max-h-[calc(100vh-170px)]">{M[role].map(([k,l,i])=><button key={k} className={'nav '+(pg===k?'on':'')} onClick={()=>{setPg(k);setOpen(false)}}><Ic n={k}/>{l}</button>)}</nav>
 <B className="absolute bottom-4 left-4 right-4" onClick={()=>setRole(null)}><span className="inline-flex items-center gap-2"><Ic n="out" s={16}/>Log out</span></B></aside>
 <main className="flex-1 min-w-0 p-4 md:p-7">
 <header className="flex items-center justify-between mb-5 gap-3"><div className="flex items-center gap-3"><B className="md:hidden" onClick={()=>setOpen(!open)}><Ic n="menu"/></B><div><h2 key={pg} className="text-2xl font-extrabold rise flex items-center gap-2"><span className="t-a"><Ic n={pg} s={26}/></span>{cur[1]}</h2><p key={pg+'s'} className="text-sm text-[var(--mut)] rise">{SUB[pg]}</p></div></div><div className="flex items-center gap-2">{Tg}<span className="hidden sm:grid w-9 h-9 rounded-full place-items-center text-white bg-gradient-to-br from-[var(--a)] to-[var(--b)]">{RL[role][0]}</span></div></header>
 <div key={pg+role}><Pg role={role}/></div>
 <p className="text-xs text-[var(--mut)] mt-8">UI preview with sample values · the real app starts empty and every number comes from user activity.</p></main></div>}
