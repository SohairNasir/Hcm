import {useState} from 'react';
import {Card,B} from '../components/ui';
import {api} from '../api';
export default function AI({role}){
 const [m,setM]=useState([{u:0,t:'Assalam o Alaikum! Main HCM Lite assistant hoon. Data ya policy ke bare mein poochein.'}]),[q,setQ]=useState(''),[busy,setBusy]=useState(false);
 const send=async t=>{t=t||q;if(!t||busy)return;setQ('');setBusy(true);setM(x=>[...x,{u:1,t}]);
  try{const d=await api.post('/ai/chat',{message:t});setM(x=>[...x,{u:0,t:d.answer,ai:1}])}catch(e){setM(x=>[...x,{u:0,t:e.message}])}setBusy(false)};
 return <Card t="AI Assistant" r={<span className="bdg bg-b">tools run with your own access</span>}><div className="space-y-3 h-80 overflow-y-auto mb-3 pr-1">{m.map((x,i)=><div key={i} className={'flex rise '+(x.u?'justify-end':'')}><div className={'max-w-[80%] px-4 py-2.5 rounded-2xl text-sm '+(x.u?'bg-gradient-to-r from-[var(--a)] to-[var(--b)] text-white':'bg-[var(--bg)]')}>{x.t}{x.ai&&<p className="text-[10px] opacity-60 mt-1">AI-generated</p>}</div></div>)}{busy&&<p className="text-xs text-[var(--mut)] animate-pulse">Thinking...</p>}</div>
 <div className="flex flex-wrap gap-2 mb-3">{(role==='emp'?['How many sick leaves do I have left?','What is the late policy?']:['Who is on leave today?','Who came late most this month?','What is this month’s attendance rate?']).map(s=><button key={s} onClick={()=>send(s)} className="bdg bg-b cursor-pointer">{s}</button>)}</div>
 <div className="flex gap-2"><input className="inp !mt-0" value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} placeholder="Type a question..."/><B v="p" onClick={()=>send()}>Send</B></div></Card>}
