let token=localStorage.getItem('hcm_token')||'';
export const setToken=t=>{token=t||'';t?localStorage.setItem('hcm_token',t):localStorage.removeItem('hcm_token')};
async function call(method,url,body){const r=await fetch('/api'+url,{method,headers:{'Content-Type':'application/json',...(token&&{Authorization:'Bearer '+token})},body:body&&JSON.stringify(body)});
const d=await r.json().catch(()=>({}));if(!r.ok)throw Object.assign(new Error(d.error||'Request failed'),{status:r.status,data:d});return d}
export const api={get:u=>call('GET',u),post:(u,b)=>call('POST',u,b||{}),put:(u,b)=>call('PUT',u,b),patch:(u,b)=>call('PATCH',u,b),del:u=>call('DELETE',u)};
