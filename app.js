const COL={BTC:'#f7931a',ETH:'#627eea',SOL:'#9945ff',XRP:'#23292f',AVAX:'#e84142',SUI:'#4da2ff',NVDA:'#76b900',AAPL:'#555',MSFT:'#00a4ef',TSLA:'#cc0000',AMZN:'#ff9900',META:'#0866ff',GOOGL:'#34a853',AAOI:'#8a5cf6',SNDK:'#d11f2f'};
const TINT={BTC:'#fde9d2',ETH:'#e3e2fb',SOL:'#ece0fb',XRP:'#e6e8ea',AVAX:'#fbdcdc',SUI:'#dcecfb'};
let ST=null,bookSym='BTC';const $=id=>document.getElementById(id);
const fmt=(v,d=2)=>v.toLocaleString('es-ES',{minimumFractionDigits:d,maximumFractionDigits:d});
const eu=(usd,d=2)=>`${fmt(usd/ST.fx,d)} € (${fmt(usd,d)} $)`;
const sg=(usd,d=2)=>(usd>=0?'+':'−')+eu(Math.abs(usd),d);
const ico=s=>`<span class="coin" style="background:${COL[s]||'#888'}">${s[0]}</span>`;
const px=p=>p>=100?fmt(p,2):p>=1?fmt(p,4):fmt(p,5);
function spark(h,c){if(h.length<2)h=[h[0],h[0]];const mn=Math.min(...h),mx=Math.max(...h),r=mx-mn||1;
 const pts=h.map((v,i)=>`${(i/(h.length-1)*300).toFixed(1)},${(42-(v-mn)/r*38).toFixed(1)}`).join(' ');
 const [x,y]=pts.split(' ').pop().split(',');return `<svg viewBox="0 0 300 46" preserveAspectRatio="none"><polyline fill="none" stroke="${c}" stroke-width="1.6" points="${pts}"/><circle cx="${x}" cy="${y}" r="3" fill="${c}"/></svg>`}
function render(){const s=ST;const eq=s.equity,g=eq-s.start;const e=eq/s.fx;
 $('eqBig').innerHTML=`${fmt(Math.floor(e),0)}<small>,${String(Math.round((e%1)*100)).padStart(2,'0')} €</small>`;
 $('eqUsd').textContent=`(${fmt(eq)} $)`;$('gain').className=g>=0?'g':'r';
 $('gain').textContent=`${g>=0?'▲':'▼'} ${sg(g)} · ${fmt(g/s.start*100)}%`;
 const lev=s.positions.reduce((a,p)=>a+p.notional,0)/Math.max(eq,1);$('levinfo').textContent=`${fmt(lev,1)}x expo · libre ${fmt(s.cash/s.fx,0)} €`;
 $('barfill').style.width=Math.min(100,s.positions.length/4*100)+'%';
 $('npos').textContent=`${s.positions.length}/4`;
 const ps=[...s.positions].sort((a,b)=>a.opened-b.opened);
 $('stack').innerHTML=ps.length?ps.map((p,i)=>{const top=i==ps.length-1,c=p.upnl>=0?'#1e9e5a':'#d9534f';
  return `<div class="pc glass ${top?'top':''}" style="background:linear-gradient(135deg,${TINT[p.sym]||'#eceaf5'}cc,#ffffffaa)">
  <div class="h">${ico(p.sym)} ${p.sym} <span class="side ${p.side[0]}">${p.side}</span><span class="badge">${p.lev}x</span></div>
  ${spark(p.hist,'#333')}<div class="f"><span class="pnl" style="color:${c}">${p.upnl>=0?'+':'−'}${fmt(Math.abs(p.upnl)/s.fx)} € <small style="font-size:12px">(${fmt(Math.abs(p.upnl))} $)</small></span><b style="color:${c}">${p.upct>=0?'+':''}${fmt(p.upct,1)}%</b></div>
  <div class="meta">Margen ${eu(p.margin,0)} · entrada ${px(p.entry)} · ahora ${px(p.px)}<br>SL ${px(p.sl)} · TP ${px(p.tp)} · Liq ${px(p.liq)} · riesgo ${p.risk}/10</div></div>`}).join('')
  :`<div class="card glass empty">Sin posiciones abiertas. Los agentes buscan oportunidades…${Object.keys(s.pending).length?'<br>Esperando retroceso en: '+Object.keys(s.pending).join(', '):''}</div>`;
 const tot=s.settled.reduce((a,t)=>a+t.pnl,0);$('setTot').innerHTML=`<span class="${tot>=0?'g':'r'}">${sg(tot)}</span>`;
 $('settled').innerHTML=s.settled.length?s.settled.map(t=>`<div class="st">${ico(t.sym)}<div><b>${t.sym} ${t.lev}x</b> <span class="side ${t.side[0]}">${t.side}</span><div class="rs">${t.reason} · ${new Date(t.closed*1000).toLocaleString('es-ES',{hour:'2-digit',minute:'2-digit',day:'2-digit',month:'2-digit'})}</div></div><div class="v ${t.pnl>=0?'g':'r'}">${sg(t.pnl)}<div class="rs">${fmt(t.pct,1)}%</div></div></div>`).join(''):'<div class="empty">Aún no hay operaciones cerradas</div>';
 $('feed').innerHTML=s.feed.map(f=>`<div class="fd ${f.kind}"><span class="t">${new Date(f.t*1000).toLocaleTimeString('es-ES')}</span><b>${f.agent}</b> · ${f.sym}<br>${f.msg}</div>`).join('');
 $('chips').innerHTML=s.assets.map(a=>`<button class="${a==bookSym?'on':''}" onclick="bookSym='${a}';renderBook();render()">${a}</button>`).join('')}
const DATA='https://raw.githubusercontent.com/Jessule/perps-sim/data/state.json';
async function loadState(){try{ST=await (await fetch(DATA+'?t='+Date.now(),{cache:'no-store'})).json();render();renderBook();
 $('upd').textContent='datos de '+new Date(ST.generated*1000).toLocaleString('es-ES')}catch(e){}}
function renderBook(){const b=ST&&ST.books&&ST.books[bookSym];if(!b||!b.price)return;
 $('bookSym').textContent=b.sym;$('bookIco').style.background=COL[b.sym];$('bookIco').textContent=b.sym[0];
 const mx=Math.max(...b.asks.slice(0,3).concat(b.bids.slice(0,3)).map(x=>x[1]));
 const row=(x,c)=>`<div class="lv ${c}"><span>${px(x[0])}</span><i style="width:${Math.max(2,x[1]/mx*70)}%"></i></div>`;
 $('asks').innerHTML=b.asks.slice(0,3).reverse().map(x=>row(x,'ask')).join('');$('bids').innerHTML=b.bids.slice(0,3).map(x=>row(x,'bid')).join('');
 $('mid').textContent=px(b.price);$('ch24').innerHTML=`<span class="${b.ch24>=0?'g':'r'}">${b.ch24>=0?'+':''}${fmt(b.ch24,1)}% 24h</span>`}
setInterval(()=>$('clock').textContent=new Date().toLocaleTimeString('es-ES'),1000);
loadState();setInterval(loadState,60000);
if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js');
