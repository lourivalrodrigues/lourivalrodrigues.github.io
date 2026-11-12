/* Geometría Axiomática, capítulo 3. Construcciones SVG sin dependencias. */
(function(root){
'use strict';
const add=(a,b)=>[a[0]+b[0],a[1]+b[1]],sub=(a,b)=>[a[0]-b[0],a[1]-b[1]],mul=(a,t)=>[a[0]*t,a[1]*t],dot=(a,b)=>a[0]*b[0]+a[1]*b[1],cross=(a,b)=>a[0]*b[1]-a[1]*b[0],len=a=>Math.hypot(...a),dist=(a,b)=>len(sub(a,b)),lerp=(a,b,t)=>add(a,mul(sub(b,a),t)),unit=a=>mul(a,1/len(a)),perp=a=>[-a[1],a[0]],rad=x=>x*Math.PI/180;
const intersect=(a,b,c,d)=>{let u=sub(b,a),v=sub(d,c),den=cross(u,v);if(Math.abs(den)<1e-10)throw Error('Rectas paralelas');return add(a,mul(u,cross(sub(c,a),v)/den));};
const foot=(p,a,b)=>add(a,mul(sub(b,a),dot(sub(p,a),sub(b,a))/dot(sub(b,a),sub(b,a))));
const circlehits=(p,u,o,r)=>{u=unit(u);let v=sub(p,o),b=dot(v,u),disc=b*b-dot(v,v)+r*r;if(disc<-1e-8)throw Error('No hay secante');let h=Math.sqrt(Math.max(0,disc));return [-b-h,-b+h].map(t=>add(p,mul(u,t)));};
const tangentpoints=(p,o,r)=>{let v=sub(p,o),d2=dot(v,v),q=add(o,mul(v,r*r/d2)),w=mul(perp(v),r*Math.sqrt(d2-r*r)/d2);return [add(q,w),sub(q,w)];};
const fmt=x=>Number(x).toLocaleString('es',{maximumFractionDigits:3});
const controls={
 similarity:[['k','Factor k',.45,1.7,.01,1.25]],
 parallels:[['case','Caso: interior / más allá de B / opuesto',1,3,1,1],['t','Posición en el caso elegido',.2,.8,.01,.55]],
 projection:[['t','Altura de la paralela intermedia',.2,.8,.01,.45]],
 criteria:[['t','Escala de APQ respecto de ABC',.25,.8,.01,.55]],
 pythagoras:[['p','Longitud p = AD',1,5,.05,2.2]],
 apollonius:[['x','Posición horizontal de A',-1.4,7.4,.1,4],['h','Altura de A',1.8,4.5,.1,3]],
 stewart:[['t','Posición D sobre BC',.15,.85,.01,.4],['x','Posición horizontal de A',-1,7,.1,2.2]],
 bisectors:[['x','Posición horizontal de A (AB < AC)',.3,2.1,.05,1.4]],
 medians:[['x','Posición horizontal de A',.5,5.5,.1,2.2]],
 collinearity:[['p','Fracción BP/BC',.15,.85,.01,.4],['q','Fracción DQ/DE',.15,.85,.01,.4]],
 division:[['step','Paso de la construcción',1,4,1,4],['angle','Ángulo de la semirrecta',25,60,1,38]],
 transversal:[['x','Posición horizontal de P',1.5,4,.05,2.7]],
 anglecircles:[['angle','Dirección AP dentro del ángulo',-12,12,1,7]],
 homothety:[['k','Razón k (0 no es homotecia)',-2,3,.1,2]],
 translation:[['q','Altura de Q sobre l',2,4,.1,3]],
 tangents:[['step','Paso de la construcción',1,4,1,4],['d','Distancia entre centros',4.3,7,.1,5.5]],
 secants:[['mode','P interior (0) o exterior (1)',0,1,1,1],['angle','Inclinación de una secante',-22,22,1,15]],
 tangentpower:[['d','Distancia OP',2.6,5,.1,3.6]],
 power:[['d','Distancia OP',0,4,.05,1.2]],
 square:[['x','Posición horizontal de A',1,5,.1,2.4],['h','Altura del triángulo',2,5,.1,3.8]],
 eyeball:[['r','Radio de la circunferencia de centro P',.65,1.5,.05,1.1]],
 butterfly:[['a','Inclinación de AB',110,150,1,125],['c','Inclinación de CD',35,65,1,55]]
};
const defaults=name=>Object.fromEntries((controls[name]||[]).map(([key,l,a,b,step,value])=>[key,value]));
function scene(name,state={}){
 const v={...defaults(name),...state},shapes=[],pts=[],pairs=[];let read='',bounds=null;
 const line=(a,b,color='green',dash=false)=>{shapes.push({type:'line',a,b,color,dash});};
 const poly=(ps,color='green')=>{shapes.push({type:'poly',ps,color});};
 const circle=(o,r,color='green',dash=false)=>{shapes.push({type:'circle',o,r,color,dash});};
 const point=(p,label,dx=10,dy=-10)=>{pts.push({p,label,dx,dy});return p;};
 const label=(p,label)=>shapes.push({type:'text',p,label});
 const triangle=(A,B,C)=>poly([A,B,C]);
 const check=(a,b)=>pairs.push([a,b]);
 const lengths=(A,B,C)=>({a:dist(B,C),b:dist(A,C),c:dist(A,B)});
 const base=()=>[[2.2,3.6],[0,0],[6,0]];
 if(name==='similarity'){
  const D=[0,0],E=[3,0],F=[.8,2],offset=[4.2,0],B=add(offset,mul(E,v.k)),A=offset,C=add(offset,mul(F,v.k));
  triangle(D,E,F);triangle(A,B,C);for(const [p,n] of [[A,'A'],[B,'B'],[C,'C'],[D,'D'],[E,'E'],[F,'F']])point(p,n);
  read=`AB/DE = BC/EF = AC/DF = k = ${fmt(v.k)}. La correspondencia de los vértices es A↔D, B↔E, C↔F.`;check(dist(A,B)/dist(D,E),v.k);
 }else if(name==='parallels'||name==='criteria'||name==='collinearity'){
  const [A,B,C]=base(),t=name==='parallels'?(v.case===1?v.t:v.case===2?1+v.t:-v.t):name==='criteria'?v.t:.58,D=lerp(A,B,t),E=lerp(A,C,t);
  triangle(A,B,C);line(A,D,'muted',true);line(A,E,'muted',true);line(D,E,'gold');
  point(A,'A');point(B,'B');point(C,'C');point(D,name==='criteria'?'P':'D',-23,-5);point(E,name==='criteria'?'Q':'E');
  if(name==='collinearity'){const P=lerp(B,C,v.p),Q=lerp(D,E,v.q);line(A,P,'blue');line(A,Q,'gold',true);point(P,'P',0,23);point(Q,'Q',0,-15);let r=v.p/(1-v.p),s=v.q/(1-v.q);read=`BP/PC = ${fmt(r)}; DQ/QE = ${fmt(s)}. ${Math.abs(v.p-v.q)<1e-8?'A, P y Q están alineados.':'Las razones son distintas: A, P y Q no están alineados.'}`;}
  else {let ratio=dist(A,D)/dist(D,B);read=name==='criteria'?`AP/AB = AQ/AC = PQ/BC = ${fmt(t)}.`:`AD/DB = AE/EC = ${fmt(ratio)}. ABC/ADE tiene factor ${fmt(1/Math.abs(t))}.`;check(dist(A,D)/dist(A,B),dist(A,E)/dist(A,C));}
 }else if(name==='projection'){
  const ys=[0,v.t*4,4],L=ys.map(y=>[.5+y*.3,y]),R=ys.map(y=>[4.5-y*.2,y]);ys.forEach((y,i)=>{line([-1,y],[6,y],'muted');label([5.6,y+.18],['n','m','l'][i]);});line(L[0],L[2]);line(R[0],R[2],'blue');L.forEach((p,i)=>point(p,['C','B','A'][i],-22,-5));R.forEach((p,i)=>point(p,["C′","B′","A′"][i]));let r=dist(L[2],L[1])/dist(L[1],L[0]),s=dist(R[2],R[1])/dist(R[1],R[0]);read=`AB/BC = ${fmt(r)}; A′B′/B′C′ = ${fmt(s)}.`;check(r,s);
 }else if(name==='pythagoras'){
  const A=[0,0],B=[6,0],D=[v.p,0],C=[v.p,Math.sqrt(v.p*(6-v.p))];triangle(A,B,C);line(C,D,'gold');point(A,'A',-18,18);point(B,'B');point(C,'C');point(D,'D',0,22);label(lerp(A,C,.55),'b');label(lerp(B,C,.55),'a');label([v.p/2,-.35],'p');label([(v.p+6)/2,-.35],'q');const a=dist(B,C),b=dist(A,C);read=`a² = cq = ${fmt(a*a)}; b² = cp = ${fmt(b*b)}; a²+b² = c² = 36.`;check(a*a+b*b,36);
 }else if(name==='apollonius'||name==='stewart'){
  const A=[v.x,name==='apollonius'?v.h:3.5],B=[0,0],C=[6,0],D=[name==='apollonius'?3:6*v.t,0];triangle(A,B,C);line(A,D,'gold');point(A,'A');point(B,'B',-20,15);point(C,'C');point(D,name==='apollonius'?'M':'D',0,22);const {a,b,c}=lengths(A,B,C),d=dist(A,D),m=D[0],n=6-m;
  if(name==='apollonius'){let lhs=b*b+c*c,rhs=2*d*d+18;read=`AB²+AC² = ${fmt(lhs)}; 2AM²+2BM² = ${fmt(rhs)}. AM = ${fmt(d)}.`;check(lhs,rhs);}
  else {label([m/2,-.35],'m');label([(m+6)/2,-.35],'n');label(lerp(A,D,.5),'d');let lhs=c*c*n+b*b*m,rhs=a*(d*d+m*n);read=`c²n+b²m = ${fmt(lhs)}; a(d²+mn) = ${fmt(rhs)}.`;check(lhs,rhs);}
 }else if(name==='bisectors'){
  const A=[v.x,2.8],B=[0,0],C=[6,0],{a,b,c}=lengths(A,B,C),D=[6*c/(b+c),0],E=[6*c/(c-b),0];triangle(A,B,C);line(E,C,'muted',true);line(A,D,'gold');line(A,E,'blue');point(A,'A');point(B,'B',0,22);point(C,'C');point(D,'D',0,22);point(E,'D ext.',0,22);read=`AB/AC = ${fmt(c/b)}; BD/DC = ${fmt(dist(B,D)/dist(D,C))}; BD ext./D ext.C = ${fmt(dist(B,E)/dist(E,C))}. D ext. pertenece a la bisectriz exterior.`;check(c/b,dist(B,E)/dist(E,C));
 }else if(name==='medians'){
  const A=[v.x,3.7],B=[0,0],C=[6,0],D=lerp(B,C,.5),E=lerp(A,C,.5),F=lerp(A,B,.5),G=mul(add(add(A,B),C),1/3);triangle(A,B,C);for(const [p,q] of [[A,D],[B,E],[C,F]])line(p,q,'blue');line(E,F,'gold');for(const [p,n] of [[A,'A'],[B,'B'],[C,'C'],[D,'D'],[E,'E'],[F,'F'],[G,'G']])point(p,n);read=`EG/GB = ${fmt(dist(E,G)/dist(G,B))}; FG/GC = ${fmt(dist(F,G)/dist(G,C))}; FE/BC = 0,5.`;check(dist(E,G)/dist(G,B),.5);
 }else if(name==='division'){
  const P=[0,0],Q=[6,0],u=[Math.cos(rad(v.angle)),Math.sin(rad(v.angle))],Qp=mul(u,5.4);line(P,Q);point(P,'P',-17,15);point(Q,'Q');if(v.step>=1)line(P,mul(u,6),'blue');
  if(v.step>=2){for(let i=1;i<=3;i++)point(mul(u,1.8*i),['R′','S′','Q′'][i-1]);}
  if(v.step>=3)line(Qp,Q,'gold');
  if(v.step>=4){for(let i=1;i<=2;i++){let p=[2*i,0];line(mul(u,1.8*i),p,'gold');point(p,i===1?'R':'S',0,23);}}
  read=['','Trace la semirrecta auxiliar desde P.','Marque PR′ = R′S′ = S′Q′ con la misma abertura.','Una Q′ con Q.','Trace las paralelas: PR = RS = SQ = 2.'][v.step];bounds=[-.3,-.6,6.7,5.6];
 }else if(name==='transversal'){
  const A=[.6,2],B=[0,0],Q=[1.2,4],P=[v.x,1],C=intersect(Q,P,A,[5,2]),D=intersect(Q,P,B,[5,0]);line([-.5,0],[5.5,0],'muted');line([-.5,2],[5.5,2],'muted');line(B,Q,'blue');line(Q,D,'gold');for(const [p,n] of [[A,'A'],[B,'B'],[Q,'Q'],[P,'P'],[C,'C'],[D,'D']])point(p,n);read=`AC = ${fmt(dist(A,C))}; BD = ${fmt(dist(B,D))}; AC = BD/2.`;check(dist(A,C),dist(B,D)/2);
 }else if(name==='anglecircles'){
  const A=[0,0],alpha=rad(28),theta=rad(v.angle),P=[3*Math.cos(theta),3*Math.sin(theta)],z=Math.sqrt(Math.sin(alpha)**2-Math.sin(theta)**2),ts=[3/(Math.cos(theta)+z),3/(Math.cos(theta)-z)];
  for(const t of ts)circle([t,0],t*Math.sin(alpha),t===ts[0]?'blue':'gold');let xmax=ts[1]*(1+Math.sin(alpha))+.4;line(A,[xmax,xmax*Math.tan(alpha)],'green');line(A,[xmax,-xmax*Math.tan(alpha)],'green');line(A,[xmax,0],'muted',true);line(A,P,'muted',true);point(A,'A');point(P,'P',8,-15);point([ts[0],0],'O',0,23);point([ts[1],0],'O″');read='Ambos centros están en la bisectriz. En cada circunferencia, OP coincide con el radio perpendicular a los lados.';for(const t of ts)check(dist([t,0],P),t*Math.sin(alpha));
 }else if(name==='homothety'){
  const A=[0,0],ps=[[1,.7],[2,.6],[1.4,1.6]],qs=ps.map(p=>mul(p,v.k));point(A,'A',-20,18);poly(ps,'blue');ps.forEach((p,i)=>point(p,['P','R','S'][i]));if(Math.abs(v.k)>.001){poly(qs,'gold');ps.forEach((p,i)=>{line(mul(p,-2.2),mul(p,3.2),'muted',true);point(qs[i],['Q','R′','S′'][i],8,17);});read=`H(A, ${fmt(v.k)}): razón de longitudes = ${fmt(Math.abs(v.k))}; ${v.k>0?'misma semirrecta':'semirrecta opuesta'}.`;}else read='k=0 colapsaría la figura en A y se excluye de la definición de homotecia de estas notas.';bounds=[-4.7,-3.7,6.8,5.6];
 }else if(name==='translation'){
  const P=[0,1],Q=[0,v.q],r=(1+v.q)/2,x=Math.sqrt(v.q),Os=[[-x,r],[x,r]];line([-5,0],[5,0],'green');line([-5,r],[5,r],'muted',true);label([4.6,.15],'l');label([4.6,r+.15],'m');Os.forEach((o,i)=>{circle(o,r,i?'gold':'blue');point(o,i?'O₂':'O₁');line(o,[o[0],0],'muted',true);});point(P,'P');point(Q,'Q');read=`Radio r = ${fmt(r)}. Ambos centros están en la mediatriz; OP = OQ = r.`;Os.forEach(o=>check(dist(o,P),r));
 }else if(name==='tangents'){
  const O=[0,0],Q=[v.d,0],R=2,r=.8;circle(O,R);circle(Q,r,'blue');point(O,'O');point(Q,'Q');let ts=tangentpoints(Q,O,R-r);if(v.step>=1)circle(O,R-r,'muted',true);
  ts.forEach((S,i)=>{const P=mul(S,R/(R-r)),U=add(Q,sub(P,S));if(v.step>=2){line(Q,S,'gold',true);point(S,i?'T':'S',-19,-8);}if(v.step>=3){line(O,P,'muted');point(P,i?'W':'P');}if(v.step>=4){line(lerp(P,U,-.12),lerp(P,U,1.12),'gold');point(U,i?'V':'U');check(dist(foot(Q,P,U),Q),r);}});read=`Paso ${v.step}: ${['','circunferencia auxiliar de radio R−r','tangentes desde Q a la auxiliar','radios hasta la circunferencia mayor','paralelas tangentes a ambas circunferencias'][v.step]}.`;bounds=[-2.5,-2.7,v.d+1.3,2.7];
 }else if(name==='secants'){
  const O=[0,0],r=2,P=v.mode?[3.6,0]:[.5,.2],angles=v.mode?[rad(150),rad(180+v.angle)]:[rad(25),rad(100+v.angle)],hits=angles.map(a=>circlehits(P,[Math.cos(a),Math.sin(a)],O,r));circle(O,r);point(O,'O',0,22);point(P,'P');hits.forEach((h,i)=>{line(v.mode?P:h[0],h[1],i?'gold':'blue');h.forEach((p,j)=>point(p,['A','B','C','D'][i*2+j],j?10:-22,j?20:-10));});let x=dist(P,hits[0][0])*dist(P,hits[0][1]),y=dist(P,hits[1][0])*dist(P,hits[1][1]);read=`PA·PB = ${fmt(x)}; PC·PD = ${fmt(y)} (longitudes positivas).`;check(x,y);
 }else if(name==='tangentpower'){
  const O=[0,0],r=2,P=[v.d,0],T=tangentpoints(P,O,r)[0],A=[2,0],B=[-2,0];circle(O,r);line(P,B,'blue');line(P,T,'gold');line(O,T,'muted',true);for(const [p,n] of [[O,'O'],[P,'P'],[T,'T'],[A,'A'],[B,'B']])point(p,n,8,n==='O'?22:-12);let t=dist(P,T)**2;read=`PT² = ${fmt(t)}; PA·PB = ${fmt((v.d-2)*(v.d+2))}.`;check(t,(v.d-2)*(v.d+2));
 }else if(name==='power'){
  const O=[0,0],r=2,P=[v.d,0],A=[-2,0],B=[2,0];circle(O,r);line([-2.5,0],[4.6,0],'blue');point(O,'O',0,25);point(A,'A',-12,-14);point(B,'B',0,25);point(P,'P',0,-18);label([4.4,.2],'+');let pa=-2-v.d,pb=2-v.d;read=`PA dirigida = ${fmt(pa)}; PB dirigida = ${fmt(pb)}; producto = ${fmt(pa*pb)} = OP²−r². P es ${v.d>2?'exterior':v.d===2?'un punto de la circunferencia':'interior'}.`;check(pa*pb,v.d*v.d-4);bounds=[-2.7,-2.5,4.8,2.5];
 }else if(name==='lily'){
  const O=[0,0],P=[0,12],T=[5,12],S=[-5,12],A=[0,13],B=[0,-13];circle(O,13);line([-7,12],[7,12],'blue');line(A,B,'gold');line(O,T);for(const [p,n] of [[O,'O'],[P,'P'],[T,'T'],[S,'S'],[A,'A'],[B,'B']])point(p,n,n==='A'?-20:10,n==='P'?22:-8);label([2.5,13],'50');label([-2.2,6],'120');label([5.6,6.7],'130');read='Longitudes en centímetros. PA=10, PB=250 y PT=PS=50; 10×250=50².';
 }else if(name==='horizon'){
  const O=[0,0],r=2,P=[3.3,0],T=tangentpoints(P,O,r)[0],A=[2,0],B=[-2,0];circle(O,r);line(P,B,'blue');line(P,T,'gold');line(O,T,'muted');point(O,'O',0,24);point(P,'Observador',-45,24);point(T,'Horizonte',-35,-16);point(A,'A',0,23);point(B,'B',-20,18);label([2.65,-.35],'1');label([0,-.35],'x');label(lerp(P,T,.5),'113');read='Esquema no a escala. 1·(x+1)=113² ⇒ x=12768 km.';
 }else if(name==='rectangles'){
  poly([[0,0],[2,0],[2,1],[0,1]]);poly([[3.2,0],[6.2,0],[6.2,1],[3.2,1]],'blue');label([1,-.3],'2');label([4.7,-.3],'3');label([-.35,.5],'1');label([6.5,.5],'1');read='Cuatro ángulos rectos en ambos; las razones de lados no coinciden: 2/3 ≠ 1/1.';
 }else if(name==='bisectororder'){
  const A=[4.5,3],B=[0,0],C=[6,0],{a,b,c}=lengths(A,B,C),E=lerp(A,C,c/(a+c)),F=lerp(A,B,b/(a+b)),beta=Math.acos(dot(sub(A,B),sub(C,B))/(c*a))/2,cv=sub(F,C),ang=Math.atan2(cv[1],cv[0])-beta,G=intersect(C,add(C,[Math.cos(ang),Math.sin(ang)]),B,E);triangle(A,B,C);line(B,E,'blue');line(C,F,'gold');line(C,G,'muted',true);for(const [p,n] of [[A,'A'],[B,'B'],[C,'C'],[E,'E'],[F,'F'],[G,'G']])point(p,n);read=`CF = ${fmt(dist(C,F))} < BG = ${fmt(dist(B,G))} < BE = ${fmt(dist(B,E))}.`;
 }else if(name==='problem3'){
  const D=[0,0],A=[0,5],half=5/Math.sqrt(8),B=[-half,0],C=[half,0],F=[0,1],E=foot(F,A,C);triangle(A,B,C);line(A,D,'muted');line(F,E,'gold');for(const [p,n] of [[A,'A'],[B,'B'],[C,'C'],[D,'D'],[F,'F'],[E,'E']])point(p,n,n==='F'?-24:10,n==='D'?22:-8);read='AD=5, AF=4 y FD=1. El dibujo respeta AB=(3/2)BC. Determine FE sin medir la pantalla.';check(dist(A,B),1.5*dist(B,C));
 }else if(name==='eyeball'){
  const P=[0,0],Q=[5,0],r=v.r,R=1.8,uv=tangentpoints(P,Q,R),st=tangentpoints(Q,P,r),ab=uv.map(u=>add(P,mul(unit(sub(u,P)),r))),cd=st.map(s=>add(Q,mul(unit(sub(s,Q)),R)));circle(P,r);circle(Q,R,'blue');line(P,Q,'muted',true);uv.forEach((u,i)=>{line(P,u,'gold');point(u,i?'V':'U');});st.forEach((s,i)=>{line(Q,s,'muted');point(s,i?'T':'S');});line(ab[0],ab[1],'gold');line(cd[0],cd[1],'gold');point(P,'P',-20,15);point(Q,'Q',10,15);ab.forEach((p,i)=>point(p,i?'B':'A',-15,i?20:-12));cd.forEach((p,i)=>point(p,i?'D':'C',5,i?20:-12));read=`AB = ${fmt(dist(...ab))}; CD = ${fmt(dist(...cd))}. Explore y luego demuestre la igualdad.`;check(dist(...ab),dist(...cd));
 }else if(name==='square'){
  const A=[v.x,v.h],B=[0,0],C=[6,0],s=6*v.h/(6+v.h),R=lerp(B,A,s/v.h),S=lerp(C,A,s/v.h),Q=[R[0],0],P=[S[0],0];triangle(A,B,C);poly([P,Q,R,S],'gold');for(const [p,n] of [[A,'A'],[B,'B'],[C,'C'],[P,'P'],[Q,'Q'],[R,'R'],[S,'S']])point(p,n,n==='R'?-20:8,['P','Q'].includes(n)?23:-12);read=`PQ = QR = RS = SP = ${fmt(s)}. Use semejanza para justificar la construcción.`;check(dist(R,S),s);
 }else if(name==='problem11'){
  const P=[0,0],C=[6,0],ax=29/12,ay=Math.sqrt(9-ax*ax),A=[ax,ay],B=mul(A,20/9);circle(P,3);circle(C,4,'blue');line(P,B,'gold');line(C,B);line(C,A,'muted',true);line(P,C,'muted');for(const [p,n] of [[P,'P'],[C,'C'],[A,'A'],[B,'B']])point(p,n);read='PA=3, CA=CB=4, PC=6. A es una intersección de las circunferencias y B la segunda intersección de PA con la mayor.';check(dist(C,A),4);check(dist(C,B),4);
 }else if(name==='problem13'){
  const O=[0,0],r=2,y=Math.sqrt(4-2.25),A=[-1.5,y],B=[1.5,y];circle(O,r);line([-3.5,y],[3.5,y],'blue');point(A,'A',-18,-12);point(B,'B');label([0,y+.3],'3');label([3.25,y+.2],'l');read='Busque sobre l todos los puntos cuyo producto dirigido respecto de A y B sea 4.';
 }else if(name==='butterfly'){
  const O=[0,.5],r=2.5,M=[0,0],P=[-Math.sqrt(6),0],Q=[Math.sqrt(6),0],u=[Math.cos(rad(v.a)),Math.sin(rad(v.a))],w=[Math.cos(rad(v.c)),Math.sin(rad(v.c))],ab=circlehits(M,u,O,r),cd=circlehits(M,w,O,r),A=ab[1],B=ab[0],C=cd[1],D=cd[0],X=intersect(A,D,P,Q),Y=intersect(B,C,P,Q);circle(O,r);line(P,Q,'blue');line(A,B);line(C,D);line(A,D,'gold');line(B,C,'gold');for(const [p,n] of [[P,'P'],[Q,'Q'],[M,'M'],[A,'A'],[B,'B'],[C,'C'],[D,'D'],[X,'X'],[Y,'Y']])point(p,n,['P','X'].includes(n)?-18:8,['X','Y','M'].includes(n)?22:-10);read=`MX = ${fmt(dist(M,X))}; MY = ${fmt(dist(M,Y))}. La igualdad observada requiere una demostración.`;check(dist(M,X),dist(M,Y));
 }else throw Error('Figura desconocida: '+name);
 return {name,shapes,pts,pairs,read,bounds};
}
function svg(s){
 let xs=[],ys=[];const addp=p=>{xs.push(p[0]);ys.push(p[1]);};
 s.shapes.forEach(o=>{if(o.type==='line'){addp(o.a);addp(o.b);}if(o.type==='poly')o.ps.forEach(addp);if(o.type==='circle'){addp([o.o[0]-o.r,o.o[1]-o.r]);addp([o.o[0]+o.r,o.o[1]+o.r]);}if(o.type==='text')addp(o.p);});s.pts.forEach(o=>addp(o.p));
 const b=s.bounds||[Math.min(...xs),Math.min(...ys),Math.max(...xs),Math.max(...ys)],W=800,H=410,pad=65,scale=Math.min((W-2*pad)/Math.max(.2,b[2]-b[0]),(H-2*pad)/Math.max(.2,b[3]-b[1])),cx=(b[0]+b[2])/2,cy=(b[1]+b[3])/2,X=p=>W/2+(p[0]-cx)*scale,Y=p=>H/2-(p[1]-cy)*scale;
 const colors={green:'#245b48',blue:'#38678d',gold:'#9b671b',muted:'#8a9c91'},esc=t=>String(t).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
 let out=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(s.name)}"><rect width="800" height="410" fill="#f3f7f3"/><g stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round">`;
 for(const o of s.shapes){const c=colors[o.color]||colors.green,dash=o.dash?' stroke-dasharray="6 5"':'';if(o.type==='line')out+=`<line x1="${X(o.a)}" y1="${Y(o.a)}" x2="${X(o.b)}" y2="${Y(o.b)}" stroke="${c}"${dash}/>`;if(o.type==='poly')out+=`<polygon points="${o.ps.map(p=>X(p)+','+Y(p)).join(' ')}" fill="${c}" fill-opacity=".06" stroke="${c}"/>`;if(o.type==='circle')out+=`<circle cx="${X(o.o)}" cy="${Y(o.o)}" r="${o.r*scale}" fill="none" stroke="${c}"${dash}/>`;}
 out+='</g><g font-family="DejaVu Sans, Arial, sans-serif" font-size="20" fill="#17392e">';for(const o of s.shapes)if(o.type==='text')out+=`<text x="${X(o.p)}" y="${Y(o.p)}" text-anchor="middle">${esc(o.label)}</text>`;
 for(const o of s.pts)out+=`<circle cx="${X(o.p)}" cy="${Y(o.p)}" r="3.2" fill="#245b48"/><text x="${X(o.p)+o.dx}" y="${Y(o.p)+o.dy}">${esc(o.label)}</text>`;
 return out+'</g></svg>';
}
function init(){document.querySelectorAll('[data-geometry3]').forEach((el,idx)=>{
 const name=el.dataset.geometry3;if(!controls[name])return;
 const state=defaults(name),live=document.createElement('div'),panel=document.createElement('div'),read=document.createElement('p');live.className='geometry-live';panel.className='geometry-controls';read.className='geometry-readout';read.setAttribute('aria-live','polite');const inputs=[];
 const draw=()=>{const s=scene(name,state);live.innerHTML=svg(s);live.querySelector('svg').setAttribute('aria-label',el.querySelector('img')?.alt||name);read.textContent=s.read;};
 controls[name].forEach(([key,title,min,max,step,value])=>{const label=document.createElement('label'),span=document.createElement('span'),input=document.createElement('input'),output=document.createElement('output');input.id=`g3-${idx}-${key}`;input.type='range';Object.assign(input,{min,max,step,value});label.htmlFor=input.id;span.textContent=title;output.htmlFor=input.id;output.textContent=fmt(value);input.addEventListener('input',()=>{state[key]=Number(input.value);output.textContent=fmt(state[key]);draw();});label.append(span,input,output);panel.append(label);inputs.push([input,output,key,value]);});
 const button=document.createElement('button');button.type='button';button.textContent='Restablecer';button.addEventListener('click',()=>{inputs.forEach(([input,output,key,value])=>{input.value=value;state[key]=value;output.textContent=fmt(value);});draw();});panel.append(button);
 draw();el.insertBefore(live,el.querySelector('figcaption'));el.append(panel,read);el.classList.add('geometry-ready');
 });}
const api={scene,svg,controls,defaults};if(typeof module!=='undefined'&&module.exports)module.exports=api;else{root.GeometryChapter3=api;if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();}
})(typeof window!=='undefined'?window:globalThis);
