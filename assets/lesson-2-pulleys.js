(function(){
'use strict';
const G=9.81,L1=6,L2=4;
function model(m1,m2,m3,x0=2.8,y0=2){
 const S=m2+m3,D=m1*S+4*m2*m3;
 const ax=G*(m1*S-4*m2*m3)/D,ay=2*G*m1*(m2-m3)/D;
 let end=3;
 for(const [q,a,lo,hi] of [[x0,ax,1,4.2],[y0,ay,.9,3.1]]) if(Math.abs(a)>1e-10)end=Math.min(end,Math.sqrt(2*((a>0?hi:lo)-q)/a));
 function at(t){let x=x0+ax*t*t/2,y=y0+ay*t*t/2,vx=ax*t,vy=ay*t;
 let z=[x,L1-x+y,L1-x+L2-y],v=[vx,-vx+vy,-vx-vy];
 let T=(m1*v[0]**2+m2*v[1]**2+m3*v[2]**2)/2,U=-G*(m1*z[0]+m2*z[1]+m3*z[2]);
 return {x,y,z,v,T,U,E:T+U,t};}
 return {ax,ay,end,at,m:[m1,m2,m3]};
}
function diagram(s,m=[2,1,1]){
 const Y=110,K=60,P=Y+(L1-s.x)*K,z=s.z.map(v=>Y+v*K);
 const txt=(x,y,t,col='#244c3f',size=17)=>`<text x="${x}" y="${y}" fill="${col}" font-size="${size}" text-anchor="middle">${t}</text>`;
 const line=(x1,y1,x2,y2,c='#54766a',dash='')=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="2" ${dash?'stroke-dasharray="4 4"':''}/>`;
 const dim=(x,a,b,label)=>line(x,a,x,b)+line(x-5,a,x+5,a)+line(x-5,b,x+5,b)+txt(x-19,(a+b)/2+5,label);
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 700" role="img" aria-label="Dos poleas: fija y móvil; tres masas, coordenadas x e y positivas hacia abajo."><rect width="600" height="700" rx="16" fill="#f2f7f3"/><g font-family="Arial,sans-serif"><rect x="145" y="18" width="255" height="14" rx="3" fill="#244c3f"/>${line(240,32,240,110)}<circle cx="240" cy="110" r="55" fill="#dce9e0" stroke="#244c3f" stroke-width="3"/><path d="M185 ${z[0]} V110 A55 55 0 0 1 295 110 V${P}" stroke="#b57821" stroke-width="4" fill="none"/><circle cx="295" cy="${P}" r="45" fill="#dce9e0" stroke="#244c3f" stroke-width="3"/><path d="M250 ${z[1]} V${P} A45 45 0 0 1 340 ${P} V${z[2]}" stroke="#247e9b" stroke-width="4" fill="none"/><circle cx="240" cy="110" r="5" fill="#244c3f"/><circle cx="295" cy="${P}" r="5" fill="#244c3f"/>${txt(240,140,'Fija')}${txt(295,P+28,'Móvil')}${[185,250,340].map((x,i)=>`<rect x="${x-25}" y="${z[i]}" width="50" height="40" rx="5" fill="${['#f0d6a7','#c7e4eb','#c7e4eb'][i]}" stroke="#244c3f"/>${txt(x,z[i]+25,'m'+['₁','₂','₃'][i])}`).join('')}${dim(115,Y,z[0],'x')}${dim(450,Y,P,'ℓ₁−x')}${dim(215,P,z[1],'y')}${dim(525,P,z[2],'ℓ₂−y')}${line(120,Y,450,Y,'#91a89c',true)}${txt(470,665,'+z ↓')}${txt(300,692,'Cuerdas ideales · longitudes constantes','#54766a',15)}</g></svg>`;
}
if(typeof module!=='undefined')module.exports={model,diagram};
if(typeof document==='undefined')return;
const root=document.getElementById('pulley-simulator');if(!root)return;
const find=s=>root.querySelector(s),inputs=[...root.querySelectorAll('[data-param]')];
let sim,t=0,running=false,prev=null,raf=null;
function plot(){
 const colors=['#efc378','#8dd6e8','#b6d695'];let paths='';
 for(let i=0;i<3;i++){let d='';for(let n=0;n<=80;n++){const tt=sim.end*n/80;d+=(n?'L':'M')+(48+tt/sim.end*492)+','+(235-sim.at(tt).z[i]*23);}paths+=`<path d="${d}" fill="none" stroke="${colors[i]}" stroke-width="3"/>`;}
 find('[data-plot]').innerHTML=`<svg viewBox="0 0 580 280" role="img" aria-label="Posiciones de las tres masas respecto del tiempo"><path d="M48 20V235H545" stroke="#90ac9d" fill="none"/>${[0,2,4,6,8].map(v=>`<text x="28" y="${240-v*23}">${v}</text>`).join('')}<text x="52" y="17">z (m), hacia abajo</text><text x="470" y="270">t (s)</text><text x="45" y="255">0</text><text x="520" y="255">${sim.end.toFixed(2)}</text>${paths}<line x1="${48+t/sim.end*492}" x2="${48+t/sim.end*492}" y1="20" y2="235" stroke="#fff" stroke-dasharray="4 4"/></svg>`;
}
function draw(){const s=sim.at(t);find('[data-drawing]').innerHTML=diagram(s,sim.m);plot();find('[data-time]').value=t/sim.end;find('[data-clock]').textContent=t.toFixed(2)+' s';find('[data-values]').innerHTML=`<p>x = ${s.x.toFixed(3)} m · y = ${s.y.toFixed(3)} m</p><p>ẍ = ${sim.ax.toFixed(3)} m/s² · ÿ = ${sim.ay.toFixed(3)} m/s²</p><p>T = ${s.T.toFixed(2)} J · U = ${s.U.toFixed(2)} J<br><strong>E = T + U = ${s.E.toFixed(2)} J</strong></p>`;}
function pause(){if(raf!==null)cancelAnimationFrame(raf);raf=null;running=false;prev=null;find('[data-play]').textContent='Iniciar';}
function reset(){pause();t=0;sim=model(...inputs.map(x=>+x.value));inputs.forEach(x=>{root.querySelector(`[data-out="${x.dataset.param}"]`).textContent=(+x.value).toFixed(1)+(x.dataset.param.startsWith('m')?' kg':' m');});find('[data-status]').textContent='Parte del reposo. Modificar un control reinicia el movimiento.';draw();}
inputs.forEach(x=>x.addEventListener('input',reset));
find('[data-play]').addEventListener('click',()=>{if(running){pause();return;}if(t>=sim.end)t=0;running=true;prev=null;find('[data-play]').textContent='Pausar';raf=requestAnimationFrame(step);});
function step(now){if(!running)return;if(prev!==null)t=Math.min(sim.end,t+Math.min((now-prev)/1000,.05));prev=now;draw();if(t>=sim.end){pause();find('[data-status]').textContent=sim.end<3?'Se alcanzó el límite geométrico de la visualización. Reinicia o cambia las masas.':'Fin de los 3 segundos de observación.';}else raf=requestAnimationFrame(step);}
find('[data-reset]').addEventListener('click',reset);
find('[data-balanced]').addEventListener('click',()=>{[2,1,1,2.8,2].forEach((v,i)=>inputs[i].value=v);reset();find('[data-status]').textContent='Equilibrio: m₁ = 2m₂ = 2m₃; las aceleraciones son nulas.';});
find('[data-time]').addEventListener('input',e=>{pause();t=+e.target.value*sim.end;draw();});
root.classList.add('sim-ready');reset();
})();
