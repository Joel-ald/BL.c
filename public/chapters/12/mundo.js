(()=>{'use strict';
const $=id=>document.getElementById(id),host=$('world'),canvas=$('view'),detail=$('details'),ink=detail.getContext('2d'),moonButton=$('moon'),words=$('words');
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),mix=(a,b,t)=>a+(b-a)*t,smooth=v=>{v=clamp(v);return v*v*(3-2*v)};
let profile=window.__BLANCA_WORLD__||{},reduced=matchMedia('(prefers-reduced-motion: reduce)'),W=1,H=1,dpr=1,quality=1,raf=0,last=0,t=0,frames=0,slow=0,paused=false,disposed=false,lost=false;
let sun={x:0,y:0,r:0},moon={x:0,y:0,vx:0,vy:0},grab=null,entered=false,touched=false,coverage=0,total=0,revealed=0,hasNight=false,returned=false,lastMessage=-99,queued=null,fadeTimer=0,ripples=[],found=[false,false,false],wake=[0,0,0],intro=0;
const moonRatio=1.026;let gl,program,loc={},buffer,fallback=false;
const typography=document.createElement('style');
typography.textContent='#words{font-family:"Trebuchet MS","Segoe UI",sans-serif;font-size:21px;font-weight:400;line-height:1.5;letter-spacing:0;max-width:640px;left:50%;width:88%;transform:translateX(-50%);text-shadow:0 2px 9px #06121c}#words span+span{margin-top:6px;color:#dce7e1;font-size:.9em}@media(min-width:900px){#words{font-size:25px}}@media(max-height:440px){#words{font-size:16px}}';
document.head.append(typography);
let lureHit=-100,petalHit=-100;
const touchBlooms=[];
host.addEventListener('pointerdown',e=>{
  if(e.target===moonButton)return;
  const rect=host.getBoundingClientRect(),x=e.clientX-rect.left,y=e.clientY-rect.top;
  if(y<H*.6||y>H*.87)return;
  ripples.push({x,y,born:t});ripples=ripples.slice(-8);
  if(coverage>.65){touchBlooms.push({x:x/W,y:y/H,born:t});if(touchBlooms.length>12)touchBlooms.shift();sound(440)}
},{passive:true});
reflectionFeedback();
function reflectionFeedback(){
  $('reflection').addEventListener('click',()=>{lureHit=t});
  $('flower').addEventListener('click',()=>{petalHit=t});
}
const vertex=`attribute vec2 a;varying vec2 v;void main(){v=a;gl_Position=vec4(a,0.,1.);}`;
const fragment=`precision highp float;
varying vec2 v;uniform vec2 res,sol,luna;uniform float radius,time,dark,total,memory,quality,ripple,stone;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+1.),f.x),f.y);}
float ridge(float x,float seed){return sin(x*6.7+seed)*.4+sin(x*13.1+seed*1.9)*.21+sin(x*29.3+seed)*.08;}
float farLine(float x){return .568-.115*exp(-pow((x-.14)*7.,2.))-.087*exp(-pow((x-.79)*7.2,2.))-.053*exp(-pow((x-.99)*12.,2.))-.012*ridge(x,1.2)-.008*abs(sin(x*43.));}
float midLine(float x){return .584-.105*exp(-pow((x-.04)*3.8,2.))-.074*exp(-pow((x-.98)*4.7,2.))-.013*ridge(x,4.);}
vec3 heavens(vec2 uv){vec2 p=vec2((uv.x-.5)*res.x/res.y,.5-uv.y);float h=uv.y/.58;vec3 day=mix(vec3(.25,.46,.64),vec3(.84,.86,.80),pow(clamp(h,0.,1.),1.8));vec3 night=mix(vec3(.012,.018,.032),vec3(.055,.072,.085),pow(clamp(h,0.,1.),3.));night+=vec3(.24,.105,.044)*exp(-pow((uv.y-.577)*130.,2.));vec3 c=mix(day,night,dark);
float ds=length(p-sol),dm=length(p-luna),rr=ds/radius,a=atan(p.y-sol.y,p.x-sol.x);c+=vec3(.27,.19,.055)*exp(-ds*ds/0.048)*(1.-dark);
float angle=a+sin(a*3.+rr*.7+time*.025)*.11+sin(a*7.-rr*.35)*.028;float fan=pow(.5+.5*sin(angle*5.+rr*.6+1.),3.);float texture=noise(vec2(angle*25.,rr*1.2-time*.02));float stream=pow(noise(vec2(angle*13.+rr*.8,rr*.55-time*.012)),2.);float envelope=exp(-max(0.,rr-1.)*(4.8-fan*2.8));float fine=(.18+stream*.42+texture*.11)*envelope;float core=.42*exp(-max(0.,rr-1.)*19.);c+=vec3(.84,.89,.97)*(fine+core)*total*smoothstep(.995,1.025,rr);float promin=pow(.5+.5*sin(a*11.+.6),24.)*exp(-pow((rr-1.035)*48.,2.))*total;c+=vec3(.58,.14,.20)*promin;
float sun=1.-smoothstep(radius-.0005,radius+.0005,ds);c=mix(c,vec3(1.,.94,.75),sun);float moon=1.-smoothstep(radius*1.026-.00055,radius*1.026+.00055,dm);vec3 moonColor=mix(vec3(.13,.17,.21),vec3(.006,.009,.014),dark);moonColor+=noise((p-luna)/radius*17.)*.013*(1.-total);c=mix(c,moonColor,moon);
vec2 axis=normalize(luna-sol+vec2(.00001));float diamond=exp(-pow((length(luna-sol)/radius-.055)*36.,2.));float dd=length(p-(sol-axis*radius));c+=vec3(1.,.9,.68)*diamond*.007/(.005+dd*dd*650.)*smoothstep(radius*1.025,radius*1.033,dm);
vec2 cell=vec2(p.x,p.y)*185.;float seed=hash(floor(cell));float star=step(.991,seed)*pow(max(0.,1.-length(fract(cell)-.5)*2.),9.);float sparkle=.72+.28*sin(time*.6+seed*170.);c+=vec3(.73,.82,1.)*star*sparkle*.75*dark*dark*(1.-smoothstep(.39,.54,uv.y))*(1.-moon)*(1.-sun);return c;}
vec3 distant(vec2 uv){vec3 c=heavens(uv);float f=farLine(uv.x),m=midLine(uv.x);if(uv.y>f){float strata=sin(uv.x*38.+uv.y*17.)*.013*smoothstep(.56,.44,uv.y);float slope=clamp((uv.y-f)*10.,0.,1.);vec3 day=mix(vec3(.51,.61,.65),vec3(.58,.67,.67),slope);vec3 night=mix(vec3(.105,.137,.18),vec3(.12,.16,.18),slope);c=mix(day,night,dark)+strata*(1.-dark*.7);}if(uv.y>m){float shade=.018*sin(uv.x*27.+uv.y*10.)+.02*sin(uv.x*87.+uv.y*32.)*smoothstep(.55,.43,uv.y);c=mix(vec3(.30,.45,.43),vec3(.055,.11,.135),dark)+shade*(1.-dark*.6);}return c;}
float leftBank(float y){float z=clamp((y-.575)/.425,0.,1.);return .19+.11*sin(z*4.1+.3)+.06*z+.025*sin(z*9.);}
float rightBank(float y){float z=clamp((y-.575)/.425,0.,1.);return .83-.13*z*z+.02*sin(z*6.);}
void main(){vec2 uv=vec2(v.x*.5+.5,.5-v.y*.5);vec3 c=distant(uv);float y=uv.y;
if(y>.58){float depth=(y-.58)/.42;float wave=(sin(y*530.+time*.32)+sin(y*269.-time*.24))*.0014*depth;vec2 refl=vec2(uv.x+wave,.58-(y-.58)*1.30+wave*.4);vec3 reflection=distant(refl);float shade=.3+.6*pow(1.-depth,2.);vec3 water=mix(vec3(.16,.32,.36),vec3(.018,.046,.066),dark);c=mix(water,reflection,shade*.65+.15);float rippleLine=pow(.5+.5*sin(y*870.+noise(vec2(uv.x*18.,y*70.))*4.+time*.3),24.);float solar=exp(-pow((uv.x-(sol.x*res.y/res.x+.5))*res.x/res.y*17.,2.));c+=vec3(.19,.20,.17)*rippleLine*solar*(.07+.1*(1.-dark));float shore=min(abs(uv.x-leftBank(y)),abs(uv.x-rightBank(y)));c=mix(c,mix(vec3(.29,.35,.27),vec3(.045,.09,.092),dark),exp(-shore*55.)*.35);
for(int i=0;i<9;i++){float n=float(i),xx=.5+sin(n*2.4)*(.037+n*.004),yy=.698+cos(n*1.7)*.034;vec2 q=vec2((uv.x-xx+wave)*res.x/res.y,(y-yy)*2.);float submerged=exp(-dot(q,q)*(19000.-n*1000.));c+=vec3(.15,.34,.27)*submerged*dark*(.25+memory*.2);}
float wingFade=total*(.25+.75*exp(-pow((time-18.)*.03,2.)));for(int i=0;i<10;i++){float n=float(i),side=mod(n,2.)*2.-1.,j=floor(n*.5);vec2 pt=vec2(.53+side*(.015+j*.014),.715-.016*sin(j*.7));vec2 d=vec2((uv.x-pt.x)*res.x/res.y,(y-pt.y)*1.7);c+=vec3(.26,.37,.32)*exp(-dot(d,d)*85000.)*(wingFade*.55+memory*.10);}
float left=leftBank(y),right=rightBank(y);if(uv.x<left||uv.x>right){float side=uv.x<left?left-uv.x:uv.x-right;float texture=noise(vec2(uv.x*94.,y*71.))*.012;vec3 day=mix(vec3(.20,.32,.25),vec3(.10,.20,.17),depth);vec3 night=mix(vec3(.04,.075,.085),vec3(.018,.042,.05),depth);c=mix(day,night,dark)+texture*(1.-dark*.7);c+=mix(vec3(.045,.043,.017),vec3(.018,.029,.032),dark)*exp(-side*11.)*(.7+.3*sin(y*49.+uv.x*13.));c+=exp(-side*150.)*mix(vec3(.15,.17,.12),vec3(.035,.065,.067),dark);}}
c+=vec3(.14,.065,.026)*dark*exp(-pow((y-.578)*220.,2.))*(1.-smoothstep(.09,.35,abs(uv.x-.53)));float vignette=1.-.14*pow(abs(v.x),3.)-.12*pow(max(v.y,0.),4.);c*=vignette;c+=(hash(gl_FragCoord.xy)-.5)/400.;gl_FragColor=vec4(max(c,vec3(0.)),1.);}`;
function initGL(){try{gl=canvas.getContext('webgl',{alpha:false,antialias:false,powerPreference:'low-power',preserveDrawingBuffer:false});if(!gl)throw Error('no gl');const compile=(type,source)=>{const shader=gl.createShader(type);gl.shaderSource(shader,source);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){gl.deleteShader(shader);throw Error('shader')}return shader};const vs=compile(gl.VERTEX_SHADER,vertex),fs=compile(gl.FRAGMENT_SHADER,fragment);program=gl.createProgram();gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);gl.deleteShader(vs);gl.deleteShader(fs);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('link');gl.useProgram(program);buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);const a=gl.getAttribLocation(program,'a');gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0);for(const name of ['res','sol','luna','radius','time','dark','total','memory','quality','ripple','stone'])loc[name]=gl.getUniformLocation(program,name);fallback=false;canvas.style.display='block'}catch{fallback=true;canvas.style.display='none'}}
function resize(){const ow=W,oh=H;W=host.clientWidth;H=host.clientHeight;const mobile=W<700,low=profile.tier?['light','low'].includes(profile.tier):(navigator.deviceMemory?navigator.deviceMemory<=4:true);quality=low?0:1;dpr=Math.min(profile.pixelRatio||devicePixelRatio||1,low?1:1.6);sun={x:W*.53,y:H*.32,r:Math.min(W*.155,H*.088)};if(ow>1){moon.x=moon.x/ow*W;moon.y=moon.y/oh*H}else{moon.x=sun.x-sun.r*3.05;moon.y=sun.y+sun.r*.38}canvas.width=Math.max(1,Math.floor(W*dpr));canvas.height=Math.max(1,Math.floor(H*dpr));detail.width=Math.floor(W*Math.min(devicePixelRatio||1,1.5));detail.height=Math.floor(H*Math.min(devicePixelRatio||1,1.5));if(gl&&!fallback)gl.viewport(0,0,canvas.width,canvas.height);place();}
function place(){moonButton.style.cssText=`left:${moon.x-sun.r*1.13}px;top:${moon.y-sun.r*1.13}px;width:${sun.r*2.26}px;height:${sun.r*2.26}px`;const points=[[.18,.77,.14],[.53,.715,.17],[.84,.78,.18]];['flower','reflection','stone'].forEach((id,i)=>{const [x,y,size]=points[i],b=$(id);b.style.cssText=`left:${(x-size/2)*W}px;top:${y*H-size*W/2}px;width:${size*W}px;height:${size*W}px`;b.disabled=coverage<.88;b.tabIndex=coverage<.88?-1:0})}
function overlap(){const r=sun.r,R=r*moonRatio,d=Math.hypot(moon.x-sun.x,moon.y-sun.y);if(d>=r+R)return 0;if(d<=R-r)return 1;const a=Math.acos(clamp((d*d+r*r-R*R)/(2*d*r),-1,1)),b=Math.acos(clamp((d*d+R*R-r*r)/(2*d*R),-1,1));return clamp((r*r*a+R*R*b-.5*Math.sqrt(Math.max(0,(-d+r+R)*(d+r-R)*(d-r+R)*(d+r+R))))/(Math.PI*r*r))}
function say(text,priority=false){if(!priority&&t-lastMessage<9){queued=text;return}queued=null;lastMessage=t;words.style.opacity='0';clearTimeout(fadeTimer);fadeTimer=setTimeout(()=>{words.replaceChildren();text.split('\n').forEach(line=>{const s=document.createElement('span');s.textContent=line;words.append(s)});words.style.opacity='1'},reduced.matches?0:700)}
let audio=null,gain=null,osc=null,audioAllowed=false;
function sound(note=0){audioAllowed=true;if(profile.muted!==false||paused)return;try{if(!audio){audio=new (window.AudioContext||window.webkitAudioContext)();gain=audio.createGain();gain.gain.value=0;gain.connect(audio.destination);osc=audio.createOscillator();osc.type='sine';osc.frequency.value=83;osc.connect(gain);osc.start();const buf=audio.createBuffer(1,audio.sampleRate*2,audio.sampleRate),data=buf.getChannelData(0);let n=0;for(let i=0;i<data.length;i++){n=(n+(Math.random()*2-1)*.015)/1.015;data[i]=n}const source=audio.createBufferSource();source.buffer=buf;source.loop=true;const filter=audio.createBiquadFilter();filter.type='lowpass';filter.frequency.value=650;source.connect(filter);filter.connect(gain);source.start()}audio.resume();if(note){const o=audio.createOscillator(),g=audio.createGain(),now=audio.currentTime;o.frequency.value=note;o.connect(g);g.connect(audio.destination);g.gain.setValueAtTime(0,now);g.gain.linearRampToValueAtTime(.025,now+.07);g.gain.exponentialRampToValueAtTime(.0001,now+2.3);o.start();o.stop(now+2.4)}}catch{}}
function discovery(i){found[i]=true;wake[i]=1;if(i===1)ripples.push({x:W*.53,y:H*.715,born:t});say((coverage>.65?['Parecía una sombra amenazante.\nPero sus alas estaban cuidando las flores.','Lo oscuro daba miedo.\nY terminó mostrando un camino.','Parecía una piedra sin nada especial.\nHasta que dejó salir su luz.']:['La flor tenía espinas.\nY aquella sombra no dejaba acercarse.','Era una luz preciosa.\nPero seguirla llevaba al remolino.','A plena luz parecía no tener nada bueno.\nTodavía faltaba verla en la oscuridad.'])[i],true);sound([392,294,196][i])}
['flower','reflection','stone'].forEach((id,i)=>$(id).addEventListener('click',()=>discovery(i)));
moonButton.addEventListener('pointerdown',e=>{e.preventDefault();touched=true;grab={id:e.pointerId,dx:e.clientX-moon.x,dy:e.clientY-moon.y,last:performance.now()};moon.vx=moon.vy=0;moonButton.setPointerCapture(e.pointerId);sound()});moonButton.addEventListener('pointermove',e=>{if(!grab)return;const x=e.clientX-grab.dx,y=e.clientY-grab.dy,now=performance.now(),dt=Math.max(.016,(now-grab.last)/1000);moon.vx=clamp((x-moon.x)/dt,-500,500);moon.vy=clamp((y-moon.y)/dt,-500,500);moon.x=clamp(x,sun.r,W-sun.r);moon.y=clamp(y,sun.r,H*.46);grab.last=now;place()});function release(){if(grab&&performance.now()-grab.last>90)moon.vx=moon.vy=0;grab=null}moonButton.addEventListener('pointerup',release);moonButton.addEventListener('pointercancel',release);moonButton.addEventListener('lostpointercapture',release);moonButton.addEventListener('keydown',e=>{const step=sun.r*(e.shiftKey?.2:.045),keys={ArrowLeft:[-step,0],ArrowRight:[step,0],ArrowUp:[0,-step],ArrowDown:[0,step]};if(keys[e.key]){e.preventDefault();moon.x+=keys[e.key][0];moon.y+=keys[e.key][1]}else if(e.key==='Home'){e.preventDefault();moon.x=sun.x;moon.y=sun.y}else if(e.key==='End'){e.preventDefault();moon.x=sun.x-sun.r*2.8;moon.y=sun.y+sun.r*.25}else return;touched=true;moon.vx=moon.vy=0;sound();place()});

function ellipse(x,y,rx,ry,color,angle=0){ink.fillStyle=color;ink.beginPath();ink.ellipse(x,y,Math.max(.01,rx),Math.max(.01,ry),angle,0,Math.PI*2);ink.fill()}
function path(points,color,width=1){ink.strokeStyle=color;ink.lineWidth=width;ink.lineCap='round';ink.beginPath();points.forEach((p,i)=>i?ink.lineTo(...p):ink.moveTo(...p));ink.stroke()}
function canvasSky(){const n=smooth(coverage),h=H*.58;const g=ink.createLinearGradient(0,0,0,h);g.addColorStop(0,tint([64,117,163],[3,5,9],n));g.addColorStop(.92,tint([209,216,207],[14,19,24],n));g.addColorStop(1,tint([226,223,193],[71,39,26],n));ink.fillStyle=g;ink.fillRect(0,0,W,H);
const astros=(reflect=false)=>{ink.save();if(reflect){ink.translate(0,h+h/1.3);ink.scale(1,-1/1.3);ink.globalAlpha=.42}if(total>.01){for(let i=0;i<9;i++){ink.save();ink.translate(sun.x,sun.y);ink.rotate(i*.71);ink.scale(1+(i%3)*.13,1);const r=sun.r,halo=ink.createRadialGradient(0,0,r,0,0,r*1.9);halo.addColorStop(0,`rgba(223,233,246,${total*.21})`);halo.addColorStop(.2,`rgba(213,226,242,${total*.035})`);halo.addColorStop(1,'#d6e4f000');ellipse(0,0,r*1.9,r*1.9,halo);ink.restore()}}ellipse(sun.x,sun.y,sun.r,sun.r,'#ffefbd');ellipse(moon.x,moon.y,sun.r*moonRatio,sun.r*moonRatio,tint([34,45,55],[2,3,5],n));ink.restore()};astros();
const mountains=reflect=>{ink.save();if(reflect){ink.translate(0,h+h/1.3);ink.scale(1,-1/1.3);ink.globalAlpha=.42}for(let layer=0;layer<2;layer++){ink.fillStyle=tint(layer?[76,112,108]:[139,161,170],layer?[14,28,35]:[31,40,50],n);ink.beginPath();ink.moveTo(0,h);for(let i=0;i<=180;i++){const x=i/180,gauss=(c,k)=>Math.exp(-Math.pow((x-c)*k,2)),y=layer?.584-.105*gauss(.04,3.8)-.074*gauss(.98,4.7):.568-.115*gauss(.14,7)-.087*gauss(.79,7.2)-.012*Math.sin(x*15);ink.lineTo(x*W,y*H)}ink.lineTo(W,h);ink.closePath();ink.fill()}ink.restore()};mountains(false);ink.fillStyle=tint([51,86,95],[7,18,28],n);ink.fillRect(0,h,W,H-h);astros(true);mountains(true);
for(const side of [0,1]){ink.fillStyle=tint(side?[38,66,52]:[45,73,57],side?[8,20,29]:[13,27,35],n);ink.beginPath();ink.moveTo(side?W:0,h);for(let i=0;i<=100;i++){const z=i/100,x=side?.83-.13*z*z+.02*Math.sin(z*6):.19+.11*Math.sin(z*4.1+.3)+.06*z+.025*Math.sin(z*9);ink.lineTo(x*W,h+z*(H-h))}ink.lineTo(side?W:0,H);ink.closePath();ink.fill()}
if(n>.2){for(let i=0;i<9;i++){const x=W*(.5+Math.sin(i*2.4)*(.037+i*.004)),y=H*(.698+Math.cos(i*1.7)*.034);const glow=ink.createRadialGradient(x,y,0,x,y,6);glow.addColorStop(0,`rgba(83,141,117,${n*.42})`);glow.addColorStop(1,'#538d7500');ellipse(x,y,6,3,glow)}}}
function tint(day,night,n){return `rgb(${day.map((c,i)=>Math.round(mix(c,night[i],n))).join(',')})`}
function leaf(x,y,length,width,angle,color){ink.save();ink.translate(x,y);ink.rotate(angle);ink.fillStyle=color;ink.beginPath();ink.moveTo(0,0);ink.bezierCurveTo(-width,-length*.25,-width*.65,-length*.82,0,-length);ink.bezierCurveTo(width*.45,-length*.67,width,-length*.22,0,0);ink.fill();ink.restore()}
function drawDetails(){const scale=detail.width/W;ink.setTransform(scale,0,0,scale,0,0);ink.clearRect(0,0,W,H);if(fallback)canvasSky();const n=smooth(coverage),u=Math.min(W/650,H/800),motion=reduced.matches?0:Math.sin(t*.35)*.018;
updateMeaning();
const base=ink.createLinearGradient(0,H*.80,0,H);base.addColorStop(0,'#0d192100');base.addColorStop(1,tint([24,43,38],[6,14,24],n));ink.fillStyle=base;ink.fillRect(0,H*.80,W,H*.2);
// Reed clusters follow the bank, with overlapping leaves and a shared base.
for(const [bx,by,dir,amount] of [[.035,.87,1,17],[.92,.89,-1,20],[.16,.87,1,10],[.99,.70,-1,8]]){for(let i=0;i<amount;i++){const seed=Math.sin(i*38.73),x=W*bx+seed*26*u,y=H*by+Math.sin(i*7.1)*8*u,len=(40+(i*17%77))*u;leaf(x,y,len,(4+i%4)*u,dir*(.2+seed*.58)+motion,tint([47+i%5*5,74+i%6*4,57+i%4*3],[13+i%5*2,32+i%6*2,39+i%4],n));if(i%4===0){ink.strokeStyle=tint([108,122,75],[43,62,58],n);ink.lineWidth=.6*u;ink.beginPath();ink.moveTo(x,y);ink.quadraticCurveTo(x+dir*12*u,y-len*.4,x+dir*24*u,y-len*.95);ink.stroke()}}}
// Rounded slate boulders, lit on the sky-facing shoulder.
function rock(x,y,r,seed){ink.save();ink.translate(x,y);const g=ink.createLinearGradient(-r,-r,r,r*.5);g.addColorStop(0,tint([126,130,115],[53,67,75],n));g.addColorStop(.34,tint([87,100,91],[30,46,57],n));g.addColorStop(1,tint([42,63,59],[12,24,35],n));ink.beginPath();ink.moveTo(-r,0);ink.bezierCurveTo(-r*.9,-r*.5,-r*.44,-r*.83,-r*.09,-r*.8);ink.bezierCurveTo(r*.45,-r*.94,r*.71,-r*.32,r,0);ink.quadraticCurveTo(r*.7,r*.22,-r*.5,r*.12);ink.closePath();ink.fillStyle=g;ink.fill();ink.save();ink.clip();for(let j=0;j<8;j++){ink.strokeStyle=`rgba(151,163,163,${.055*(1-n*.5)})`;ink.lineWidth=.7;ink.beginPath();ink.moveTo(-r,-r*.65+j*r*.14);ink.bezierCurveTo(-r*.3,-r*.5+j*r*.11,r*.4,-r*.9+j*r*.13,r,-r*.3+j*r*.1);ink.stroke()}if(seed===1&&(n>.1||found[2])){const alpha=n*.58+(found[2]?.35:0);ink.strokeStyle=`rgba(156,200,166,${alpha})`;ink.shadowColor='#89c9b5';ink.shadowBlur=(found[2]?12:7)*n;ink.lineWidth=1.1*u;ink.beginPath();ink.moveTo(-r*.4,-r*.66);ink.bezierCurveTo(-r*.1,-r*.5,-r*.5,-r*.3,-r*.08,-r*.22);ink.bezierCurveTo(r*.1,-r*.18,r*.27,-r*.2,r*.36,r*.1);ink.stroke()}ink.restore();ink.restore()}
rock(W*.92,H*.82,68*u,0);rock(W*.84,H*.80,55*u,1);rock(W*.96,H*.85,38*u,2);rock(W*.055,H*.82,31*u,3);
// Three flowers: curved stalks, cupped petals, and a concealed pink bloom.
for(let i=0;i<3;i++){const x=W*(.15+i*.025),y=H*(.77+i*.014),r=(14-i*2)*u,bend=(i-1)*10*u;ink.strokeStyle=tint([103,127,83],[49,73,65],n);ink.lineWidth=1.4*u;ink.beginPath();ink.moveTo(x+bend,y+62*u);ink.bezierCurveTo(x-12*u,y+39*u,x+9*u,y+18*u,x,y);ink.stroke();leaf(x+bend*.5,y+43*u,22*u,6*u,-.7,tint([85,115,76],[36,65,61],n));leaf(x,y+33*u,19*u,5*u,.8,tint([112,135,88],[45,78,65],n));const open=1-n*.82;
for(let k=0;k<5;k++){ink.save();ink.translate(x,y);ink.rotate((k-2)*.52*open);const g=ink.createLinearGradient(0,0,0,-r*1.6);g.addColorStop(0,tint([163,149,111],[75,82,79],n));g.addColorStop(.6,tint([235,220,179],[136,145,140],n));g.addColorStop(1,tint([255,245,215],[176,184,172],n));ink.fillStyle=g;ink.beginPath();ink.moveTo(0,3*u);ink.bezierCurveTo(-r*.5*open,-r*.4,-r*.55*open,-r*1.7,0,-r*1.8);ink.bezierCurveTo(r*.6*open,-r*1.5,r*.5*open,-r*.2,0,3*u);ink.fill();ink.restore()}
if(n>.05||found[0]){const o=clamp(smooth((n-.15)/.7)+(found[0]?.25:0)),yy=y+24*u;ink.save();ink.globalAlpha=o;ink.shadowColor='#d6a7c4';ink.shadowBlur=(19+2*Math.sin(reduced.matches?0:t*.8))*u;for(let k=0;k<5;k++)leaf(x,yy,10*u*o,4*u,k*Math.PI*.4,tint([209,146,163],[255,193,224],n));ellipse(x,yy,1.5*u,1.5*u,'#e6d6b6');ink.restore()}}
// Small living lights belong to the banks and the water, never to the camera.
if(n>.15){const dusk=smooth((n-.15)/.85),clock=reduced.matches?0:t;
 for(let i=0;i<15;i++){
  const phase=i*2.399,side=i%2?-1:1;
  const x=W*(.5+side*(.13+.18*((Math.sin(i*7.7)+1)/2)))+Math.sin(clock*.18+phase)*9*u;
  const y=H*(.64+.16*((Math.cos(i*4.8)+1)/2))+Math.sin(clock*.24+phase*1.3)*6*u;
  const pulse=dusk*(.12+.88*Math.pow(.5+.5*Math.sin(clock*.75+phase),3));
  const r=(i%3===0?7:5)*u;
  const glow=ink.createRadialGradient(x,y,0,x,y,r);
  glow.addColorStop(0,`rgba(230,240,165,${pulse*.65})`);glow.addColorStop(.22,`rgba(177,208,111,${pulse*.24})`);glow.addColorStop(1,'#bbd88100');
  ellipse(x,y,r,r,glow);ellipse(x,y,.85*u,.85*u,`rgba(251,247,189,${pulse*.85})`);
  if(i%3===0){const ry=y+10*u;const reflection=ink.createRadialGradient(x,ry,0,x,ry,5*u);reflection.addColorStop(0,`rgba(166,192,114,${pulse*.13})`);reflection.addColorStop(1,'#a6c07200');ellipse(x,ry,5*u,1.3*u,reflection)}
 }
 // A quiet, larger glow cradles the three nocturnal blossoms.
 for(let i=0;i<3;i++){const x=W*(.15+i*.025),y=H*(.77+i*.014)+24*u,r=(28-i*3)*u;
  const halo=ink.createRadialGradient(x,y,0,x,y,r);halo.addColorStop(0,`rgba(237,160,205,${dusk*.34})`);halo.addColorStop(.4,`rgba(210,128,189,${dusk*.15})`);halo.addColorStop(1,'#df9fc500');ellipse(x,y,r,r,halo);
 }
}
drawContrasts(n,u);
for(const r of ripples){const age=t-r.born;if(age<5){ink.save();ink.globalAlpha=(1-age/5)*.18;ink.strokeStyle='#bac7d0';for(let i=0;i<3;i++){ink.beginPath();ink.ellipse(r.x,r.y,(age*24+i*9)*u,(age*4+i*1.5)*u,0,0,Math.PI*2);ink.stroke()}ink.restore()}}
}
let meaningPhase=-1;
function updateMeaning(){
  ['flower','reflection','stone'].forEach(id=>{$(id).disabled=false;$(id).tabIndex=0});
  const phase=coverage>.985?1:coverage<.15?(hasNight?2:0):-1;
  if(phase<0||phase===meaningPhase)return;
  meaningPhase=phase;entered=false;queued=null;
  say(['Algo dorado llamaba desde el agua.\nUna sombra esperaba entre las flores.','La luz escondía un peligro.\nLa oscuridad guardaba algo bueno.','La luz no siempre cuidaba.\nLa sombra no siempre hacía daño.'][phase],true);
}
function drawContrasts(n,u){
  ink.save();
  drawMagic(n,u);
  // The beautiful daytime flowers retain real thorns in both lighting states.
  for(let i=0;i<3;i++){const x=W*(.15+i*.025),y=H*(.77+i*.014);ink.fillStyle=tint([104,64,44],[102,130,124],n);for(let j=0;j<3;j++){const yy=y+(20+j*12)*u,side=j%2?1:-1;ink.beginPath();ink.moveTo(x,yy);ink.lineTo(x+side*9*u,yy-7*u);ink.lineTo(x+side*2*u,yy+5*u);ink.closePath();ink.fill()}}
  // A gold reflection masks a dark current; the eclipse reveals stepping stones.
  const x=W*.53,y=H*.715,clock=reduced.matches?0:t;
  ink.globalAlpha=(1-n)*.7;ink.lineWidth=1.3*u;
  for(let j=0;j<6;j++){ink.strokeStyle=j%2?'#b89957':'#243e42';ink.beginPath();for(let k=0;k<=38;k++){const a=k/38*Math.PI*2+clock*.14+j*.7,r=(8+j*5+k*.13)*u;const px=x+Math.cos(a)*r*1.8,py=y+Math.sin(a)*r*.28;k?ink.lineTo(px,py):ink.moveTo(px,py)}ink.stroke()}
  ink.globalAlpha=n*.85+(hasNight?(1-n)*.22:0);
  for(let j=0;j<7;j++){const xx=W*(.43+j*.019)+Math.sin(j*.8)*9*u,yy=H*(.84-j*.019),r=(13-j*.7)*u;ellipse(xx,yy,r*1.5,r*.42,'#83b4ae');ink.strokeStyle='#d5f2cc';ink.lineWidth=1*u;ink.beginPath();ink.ellipse(xx,yy,r*1.5,r*.42,0,Math.PI,Math.PI*2);ink.stroke()}
  ink.globalAlpha=n;
  for(let j=0;j<4;j++){const xx=W*(.23+j*.17)+Math.sin(clock*.3+j)*8*u,yy=H*(.65+(j%2)*.045)+Math.cos(clock*.4+j)*5*u,wing=(reduced.matches?.8:.6+Math.sin(clock*3+j)*.25);leaf(xx,yy,9*u,5*u*wing,-.8,'#d6b5d9');leaf(xx,yy,9*u,5*u*wing,.8,'#a6ded0');ellipse(xx,yy,1*u,3*u,'#fff1c6')}
  ink.restore();
}
function drawMagic(n,u){
  ink.save();
  const clock=reduced.matches?0:t,age=t-lureHit,burst=age<4?Math.exp(-age*.8):0;
  const lx=W*.53,ly=H*.715;
  ink.globalAlpha=(1-n)*(1-burst);
  ink.shadowColor='#ffd684';ink.shadowBlur=15*u;
  const bob=Math.sin(clock*1.4)*4*u;
  ink.fillStyle='#ffe7a5';ink.beginPath();ink.moveTo(lx,ly-19*u+bob);ink.quadraticCurveTo(lx+13*u,ly-4*u+bob,lx,ly+2*u+bob);ink.quadraticCurveTo(lx-13*u,ly-4*u+bob,lx,ly-19*u+bob);ink.fill();
  ink.shadowBlur=0;
  if(burst>0){ink.globalAlpha=(1-n)*burst;ellipse(lx,ly,28*u,7*u,'#071b25');for(let j=0;j<10;j++){const a=j*Math.PI*.2+age*2,r=(12+age*16)*u;ellipse(lx+Math.cos(a)*r,ly+Math.sin(a)*r*.3,1.7*u,1*u,'#efd398')}}
  // A damped recoil gives the shelter wings weight after a touch.
  const pa=t-petalHit,recoil=reduced.matches?0:Math.exp(-pa*2.2)*Math.sin(pa*8)*.18;
  const bx=W*.18,by=H*.76;
  ink.globalAlpha=.65+n*.3;
  for(const side of [-1,1]){ink.save();ink.translate(bx,by);ink.scale(side,1);ink.rotate(-.12-n*.32-recoil-Math.sin(clock*.65)*.025);const g=ink.createLinearGradient(0,0,55*u,-45*u);g.addColorStop(0,n>.5?'#8bbfbd':'#1d3034');g.addColorStop(1,n>.5?'#bbc8e6':'#14282c');ink.fillStyle=g;ink.beginPath();ink.moveTo(0,14*u);ink.bezierCurveTo(8*u,-32*u,52*u,-51*u,65*u,-35*u);ink.bezierCurveTo(58*u,-9*u,24*u,7*u,0,14*u);ink.fill();if(n>.3){ink.strokeStyle=`rgba(227,242,226,${n*.55})`;ink.lineWidth=.8*u;for(let j=0;j<5;j++){ink.beginPath();ink.moveTo(2*u,9*u);ink.quadraticCurveTo((20+j*6)*u,-13*u,(31+j*7)*u,(-12-j*5)*u);ink.stroke()}}ink.restore()}
  ellipse(bx,by+6*u,2*u,11*u,n>.5?'#d5e8dc':'#17292c');
  for(const bloom of touchBlooms){const a=t-bloom.born,open=reduced.matches?1:clamp(1-Math.exp(-a*2.8)*Math.cos(a*5)),fade=n*clamp((14-a)/3);if(fade<=0)continue;ink.globalAlpha=fade;const x=bloom.x*W,y=bloom.y*H;ink.strokeStyle='#8fb9a9';ink.lineWidth=u;ink.beginPath();ink.moveTo(x,y+15*u);ink.quadraticCurveTo(x+5*u,y+4*u,x,y);ink.stroke();for(let j=0;j<5;j++)leaf(x,y,10*u*open,4*u*open,j*Math.PI*.4+Math.sin(clock*.5)*.04,j%2?'#d5bce2':'#a5ddd0');ellipse(x,y,2*u,2*u,'#fff0b4')}
  ink.restore();
}
function render(){if(gl&&!fallback&&!lost){gl.useProgram(program);gl.uniform2f(loc.res,canvas.width,canvas.height);gl.uniform2f(loc.sol,(sun.x-W/2)/H,.5-sun.y/H);gl.uniform2f(loc.luna,(moon.x-W/2)/H,.5-moon.y/H);gl.uniform1f(loc.radius,sun.r/H);gl.uniform1f(loc.time,reduced.matches?0:t);gl.uniform1f(loc.dark,smooth(coverage));gl.uniform1f(loc.total,total);gl.uniform1f(loc.memory,revealed);gl.uniform1f(loc.quality,quality);gl.uniform1f(loc.stone,found[2]?1:0);gl.uniform1f(loc.ripple,ripples.length?Math.max(0,1-(t-ripples[ripples.length-1].born)/5):0);gl.drawArrays(gl.TRIANGLES,0,6)}drawDetails()}
function tick(now){raf=0;if(paused||disposed)return;const fps=Math.min(profile.fps|| (quality?45:30),60);if(last&&now-last<1000/fps-1){raf=requestAnimationFrame(tick);return}const delta=last?(now-last)/1000:1/fps,dt=Math.min(delta,.06);last=now;t+=dt;if(!touched){intro+=dt;moon.x=mix(moon.x,sun.x-sun.r*2.25,1-Math.exp(-dt*.15));moon.y=sun.y+sun.r*.32+(reduced.matches?0:Math.sin(t*.38)*sun.r*.035)}else if(!grab){moon.vx*=Math.exp(-dt*7);moon.vy*=Math.exp(-dt*7);moon.x+=moon.vx*dt;moon.y+=moon.vy*dt;const d=Math.hypot(moon.x-sun.x,moon.y-sun.y);if(d<sun.r*.25&&Math.hypot(moon.vx,moon.vy)<20){moon.x=mix(moon.x,sun.x,1-Math.exp(-dt*1.5));moon.y=mix(moon.y,sun.y,1-Math.exp(-dt*1.5))}}
moon.x=clamp(moon.x,sun.r*.65,W-sun.r*.65);moon.y=clamp(moon.y,sun.r*.65,H*.46);coverage=overlap();total=smooth((coverage-.967)/.032);if(coverage>.985){if(!hasNight){hasNight=true;entered=t;sound(147)}revealed=Math.min(1,revealed+dt*.13);if(entered!==false&&t-entered>3.5){say('Se hizo oscuro.\nY aparecieron cosas que la luz no dejaba ver.');entered=false}}if(hasNight&&coverage<.15&&!returned){returned=true;say('Era el mismo lugar.\nAhora lo veías de otra manera.')}if(queued&&t-lastMessage>10)say(queued);if(audio&&gain){const silence=hasNight&&entered!==false&&t-entered<.6;gain.gain.setTargetAtTime(profile.muted===false&&!silence?.026*(1-coverage*.96):0,audio.currentTime,.3)}ripples=ripples.filter(r=>t-r.born<5);place();const before=performance.now();render();if(++frames%45===0&&performance.now()-before>24&&dpr>.65){dpr=Math.max(.65,dpr*.85);canvas.width=Math.floor(W*dpr);canvas.height=Math.floor(H*dpr);if(gl&&!fallback)gl.viewport(0,0,canvas.width,canvas.height)}raf=requestAnimationFrame(tick)}
function visibility(){paused=document.hidden||profile.visible===false;if(paused){cancelAnimationFrame(raf);raf=0;last=0;grab=null;audio?.suspend()}else{if(audioAllowed&&profile.muted===false)audio?.resume();if(!raf&&!disposed)raf=requestAnimationFrame(tick)}}
function hostState(e){profile={...profile,...e.detail};if(profile.muted!==false)audio?.suspend();else if(audioAllowed)sound();resize();visibility()}
function contextLost(e){e.preventDefault();lost=true;fallback=true;canvas.style.display='none'}function contextRestored(){lost=false;initGL();resize()}
function dispose(){if(disposed)return;disposed=true;cancelAnimationFrame(raf);clearTimeout(fadeTimer);audio?.close();if(gl){gl.deleteBuffer(buffer);gl.deleteProgram(program)}removeEventListener('resize',resize);removeEventListener('blanca:state',hostState);document.removeEventListener('visibilitychange',visibility)}
canvas.addEventListener('webglcontextlost',contextLost);canvas.addEventListener('webglcontextrestored',contextRestored);addEventListener('resize',resize,{passive:true});addEventListener('blanca:state',hostState);document.addEventListener('visibilitychange',visibility);addEventListener('pagehide',e=>{if(e.persisted){paused=true;cancelAnimationFrame(raf);raf=0;audio?.suspend()}else dispose()});addEventListener('pageshow',()=>{if(!disposed)visibility()});reduced.addEventListener?.('change',()=>{last=0});initGL();resize();visibility();
})();
