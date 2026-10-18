(function(){
'use strict';

const defaults={characteristic:{t:0.25,a:0.5},breaking:{t:1.5},shock:{t:1.5}};
const xs=t=>Math.sqrt(2*(1+t))-1;
function chars(a,t){return {x:a*Math.exp(2*t),p:1/(1/(2+Math.sin(a))-a/2*(Math.exp(2*t)-1))};}
function shockProfile(t){if(t<1)return [[-2,0],[-1,0],[t,1],[1,0],[5,0]];return [[-2,0],[-1,0],[xs(t),Math.sqrt(2/(1+t))],[xs(t),0],[5,0]];}
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');
let serial=0;
function plot(curves,{xmin=-5,xmax=5,ymin=-1.5,ymax=1.5,xlabel='x',ylabel='valor',title='' }={}){
 const clipId=`transport-clip-${++serial}`;
 let X=x=>60+(x-xmin)/(xmax-xmin)*610,Y=y=>260-(y-ymin)/(ymax-ymin)*210;
 let s=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 310" role="img" aria-label="${esc(title)}"><rect width="720" height="310" rx="12" fill="#f3f8f5"/><text x="60" y="25" font-size="16" fill="#123d30" font-family="sans-serif">${esc(title)}</text><defs><clipPath id="${clipId}"><rect x="59" y="49" width="612" height="212"/></clipPath></defs>`;
 for(let i=0;i<=4;i++){let y=ymin+(ymax-ymin)*i/4,x=xmin+(xmax-xmin)*i/4;s+=`<path d="M60 ${Y(y)}H670 M${X(x)} 50V260" stroke="#d4e3da"/><text x="50" y="${Y(y)+4}" text-anchor="end" font-size="12" font-family="sans-serif">${y.toFixed(1)}</text><text x="${X(x)}" y="280" text-anchor="middle" font-size="12" font-family="sans-serif">${x.toFixed(1)}</text>`;}
 s+='<path d="M60 50V260H670" fill="none" stroke="#547062"/>';
 for(const c of curves){let pts=c.points??Array.from({length:501},(_,i)=>{let x=xmin+(xmax-xmin)*i/500;return[x,c.fn(x)]});let d=pts.filter(p=>p.every(Number.isFinite)).map((p,i)=>(i?'L':'M')+X(p[0]).toFixed(2)+' '+Y(p[1]).toFixed(2)).join(' ');s+=`<path d="${d}" fill="none" stroke="${c.color??'#117452'}" stroke-width="${c.width??2.5}" ${c.dash?'stroke-dasharray="6 5"':''} clip-path="url(#${clipId})"/>`;}
 return s+`<text x="680" y="280" font-size="14" font-family="sans-serif">${xlabel}</text><text x="10" y="30" font-size="13" font-family="sans-serif">${ylabel}</text></svg>`;
}
function render(kind,v){let t=+v.t,info='',svgs=[];
 if(kind==='characteristic'){let a=+v.a,tb=a>0?.5*Math.log(1+2/(a*(2+Math.sin(a)))):Infinity,end=Math.min(.8,Number.isFinite(tb)?.9*tb:.8),now=Math.min(t,end),z=chars(a,now);const sampled=(f)=>Array.from({length:151},(_,i)=>{let u=end*i/150;return f(u);});svgs=[plot([{points:sampled(u=>[chars(a,u).x,u])},{points:[[z.x,0],[z.x,now]],color:'#ab6a12',dash:true}],{xmin:-5,xmax:5,ymin:0,ymax:.8,title:'Trayectoria X(t; A)',ylabel:'t'}),plot([{points:sampled(u=>[u,chars(a,u).p])},{points:[[now,0],[now,z.p]],color:'#ab6a12',dash:true}],{xmin:0,xmax:.8,ymin:0,ymax:Math.max(4,chars(a,end).p*1.05),xlabel:'t',ylabel:'P',title:'Valor P(t; A) sobre la trayectoria'})];info=`A = ${a.toFixed(2)} · tiempo mostrado = ${now.toFixed(3)} · X = ${z.x.toFixed(3)} · P = ${z.p.toFixed(3)}. ${a>0?'Explosión en t = '+tb.toFixed(3)+'. El tiempo se limita al 90 % de ese valor.':'No hay explosión para t ≥ 0 en esta característica.'}`;}
 if(kind==='breaking'){let curves=[];for(let a=-1.5;a<=2.01;a+=.15)curves.push({points:[[a,0],[a+3*Math.max(1-Math.abs(a),0),3]],color:'#9abaaa',width:1});curves.push({points:[[-2,t],[5,t]],color:'#ab6a12',dash:true});svgs=[plot([{points:[[-2,0],[-1,0],[t,1],[1,0],[5,0]]}],{xmin:-2,xmax:5,ymin:0,ymax:1.2,title:'Representación paramétrica (2.42)',ylabel:'p'}),plot(curves,{xmin:-2,xmax:5,ymin:0,ymax:3,title:'Características sin truncar',ylabel:'t'})];info=`t = ${t.toFixed(2)} · ${t<1?'Perfil univaluado antes del cruce.':t===1?'Primer cruce: x = 1, t = 1.':'Ramas superpuestas: esta curva no es una solución univaluada.'} Línea ocre: instante seleccionado.`;}
 if(kind==='shock'){let curves=[];for(let a=-1.5;a<=3.01;a+=.15){let points=[];for(let u=0;u<=3.001;u+=.025){let x=a+u*Math.max(1-Math.abs(a),0);if(u>=1&&((a<1&&x>=xs(u))||(a>=1&&x<=xs(u))))break;points.push([x,u]);}curves.push({points,color:'#9abaaa',width:1});}curves.push({points:Array.from({length:101},(_,i)=>{let u=1+i*.02;return[xs(u),u];}),color:'#b33c38',width:3});curves.push({points:[[-2,t],[5,t]],color:'#ab6a12',dash:true});svgs=[plot([{points:shockProfile(t)}],{xmin:-2,xmax:5,ymin:0,ymax:1.2,title:'Perfil conservativo: área = 1',ylabel:'p'}),plot(curves,{xmin:-2,xmax:5,ymin:0,ymax:3,title:'Características truncadas por el choque rojo',ylabel:'t'})];info=`t = ${t.toFixed(2)} · área = 1 · ${t<1?'compresión antes del choque': 'choque en x = '+xs(t).toFixed(3)+'; velocidad = '+(1/Math.sqrt(2*(1+t))).toFixed(3)}. Línea ocre: instante seleccionado.`;}
 return {html:svgs.join(''),svgs,info};
}
function mount(el){let kind=el.dataset.transport,values={...defaults[kind]},controls=`<label>Tiempo <input type="range" data-key="t" min="0" max="${kind==='characteristic'?.8:kind==='system'?2:3}" step="0.01" value="${values.t}"></label>`;
 if(kind==='characteristic')controls+='<label>Etiqueta A <input type="range" data-key="a" min="-1" max="1" step="0.05" value="0.5"></label>';
 el.innerHTML=`<div class="transport-controls">${controls}<button type="button">Restablecer</button></div><div class="transport-plots"></div><p class="transport-status" aria-live="polite"></p>`;
 const update=()=>{let r=render(kind,values);el.querySelector('.transport-plots').innerHTML=r.html;el.querySelector('.transport-status').textContent=r.info;};
 el.querySelectorAll('[data-key]').forEach(x=>x.addEventListener('input',()=>{values[x.dataset.key]=x.value;update();}));el.querySelector('button').addEventListener('click',()=>{values={...defaults[kind]};el.querySelectorAll('[data-key]').forEach(x=>x.value=values[x.dataset.key]);update();});update();
}
if(typeof document!=='undefined')document.querySelectorAll('[data-transport]').forEach(mount);
if(typeof module!=='undefined')module.exports={render,defaults,chars,xs,shockProfile,mount};
})();
