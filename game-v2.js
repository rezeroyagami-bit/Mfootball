const canvas = document.getElementById('pitch');
const ctx = canvas.getContext('2d');
let W=0,H=0,last=0,running=false,timeLeft=180,score=[0,0];
const keys={};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const formations=[{x:.08,y:.5},{x:.18,y:.25},{x:.18,y:.5},{x:.18,y:.75},{x:.34,y:.18},{x:.34,y:.4},{x:.34,y:.6},{x:.34,y:.82},{x:.47,y:.36},{x:.47,y:.64},{x:.57,y:.5}];
const enemyFormation=[{x:.92,y:.5},{x:.82,y:.25},{x:.82,y:.5},{x:.82,y:.75},{x:.66,y:.18},{x:.66,y:.4},{x:.66,y:.6},{x:.66,y:.82},{x:.53,y:.36},{x:.53,y:.64},{x:.43,y:.5}];
const names=['حارس','ظهير أيمن','قلب دفاع','ظهير أيسر','وسط أيمن','وسط','وسط أيسر','جناح أيسر','مهاجم ثانٍ','جناح أيمن','مهاجم'];
let home=[],away=[],selected=10;
const ball={x:.5,y:.5,vx:0,vy:0,r:.018,owner:null};
function makeTeam(side){const f=side===0?formations:enemyFormation;return f.map((q,i)=>({x:q.x,y:q.y,homeX:q.x,homeY:q.y,n:i+1,name:names[i],side,r:.025,speed:.00038+Math.random()*.00006}))}
function resetBall(){ball.x=.5;ball.y=.5;ball.vx=ball.vy=0;ball.owner=null}
function resetTeams(){home=makeTeam(0);away=makeTeam(1);selected=10;resetBall()}
function resize(){W=canvas.clientWidth;H=canvas.clientHeight;const d=devicePixelRatio||1;canvas.width=W*d;canvas.height=H*d;ctx.setTransform(d,0,0,d,0,0)}
addEventListener('resize',resize);resize();resetTeams();
function P(o){return{x:o.x*W,y:o.y*H}}
function drawPitch(){ctx.clearRect(0,0,W,H);ctx.fillStyle='#178746';ctx.fillRect(0,0,W,H);for(let i=0;i<10;i++){ctx.fillStyle=i%2?'#198d49':'#178746';ctx.fillRect(i*W/10,0,W/10,H)}ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.strokeRect(2,2,W-4,H-4);ctx.beginPath();ctx.moveTo(W/2,0);ctx.lineTo(W/2,H);ctx.stroke();ctx.beginPath();ctx.arc(W/2,H/2,Math.min(W,H)*.115,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(W/2,H/2,3,0,7);ctx.fill();ctx.strokeRect(2,H*.31,W*.115,H*.38);ctx.strokeRect(W-W*.115-2,H*.31,W*.115,H*.38);ctx.strokeRect(2,H*.41,W*.055,H*.18);ctx.strokeRect(W-W*.055-2,H*.41,W*.055,H*.18)}
function drawPlayer(p){const q=P(p),r=Math.max(10,p.r*Math.min(W,H));if(p.side===0&&home.indexOf(p)===selected){ctx.beginPath();ctx.arc(q.x,q.y,r+7,0,7);ctx.strokeStyle='#ffd21c';ctx.lineWidth=3;ctx.stroke()}ctx.fillStyle=p.side===0?'#0877d1':'#d92d3d';ctx.beginPath();ctx.arc(q.x,q.y,r,0,7);ctx.fill();ctx.fillStyle='#fff';ctx.font=`bold ${Math.max(9,r*.75)}px Arial`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(p.n,q.x,q.y);ctx.font='11px Arial';ctx.textBaseline='top';ctx.fillText(p.name,q.x,q.y+r+4)}
function draw(){drawPitch();home.forEach(drawPlayer);away.forEach(drawPlayer);const b=P(ball);ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(b.x,b.y,Math.max(5,ball.r*Math.min(W,H)),0,7);ctx.fill()}
function moveControlled(dt){const p=home[selected];let dx=(keys.right?1:0)-(keys.left?1:0),dy=(keys.down?1:0)-(keys.up?1:0),l=Math.hypot(dx,dy)||1;p.x=clamp(p.x+dx/l*p.speed*dt,.025,.975);p.y=clamp(p.y+dy/l*p.speed*dt,.035,.965);if(dist(p,ball)<.055)ball.owner=p}
function moveAI(team,dt){for(const p of team){if(team===home&&p===home[selected])continue;let tx=p.homeX,ty=p.homeY,d=dist(p,ball);if(d<.25||(team===away&&d<.42)){tx=ball.x;ty=ball.y}else if(team===home&&ball.x>.55)tx=clamp(p.homeX+.06,.03,.96);else if(team===away&&ball.x<.45)tx=clamp(p.homeX-.06,.03,.96);let dx=tx-p.x,dy=ty-p.y,l=Math.hypot(dx,dy)||1;p.x=clamp(p.x+dx/l*p.speed*dt,.025,.975);p.y=clamp(p.y+dy/l*p.speed*dt,.035,.965);if(d<.047)ball.owner=p}}
function updateBall(dt){if(ball.owner){const o=ball.owner;ball.x=o.x+(o.side===0?.035:-.035);ball.y=o.y;ball.vx=ball.vy=0}else{ball.x+=ball.vx*dt;ball.y+=ball.vy*dt;ball.vx*=Math.pow(.985,dt);ball.vy*=Math.pow(.985,dt);if(ball.y<.025||ball.y>.975){ball.y=clamp(ball.y,.025,.975);ball.vy*=-.75}if(ball.x<.012||ball.x>.988){if(ball.y>.37&&ball.y<.63){if(ball.x>.98){score[0]++;goal()}else{score[1]++;goal()}return}ball.x=clamp(ball.x,.012,.988);ball.vx*=-.75}}for(const p of [...home,...away])if(ball.owner!==p&&dist(p,ball)<.043){ball.owner=p;break}}
function kick(power,dx,dy){const p=home[selected];if(ball.owner===p||dist(p,ball)<.075){ball.owner=null;ball.x=p.x+dx*.04;ball.y=p.y+dy*.04;ball.vx=dx*power;ball.vy=dy*power}}
function pass(){const p=home[selected];let best=null,bd=99;for(const q of home)if(q!==p&&dist(p,q)<bd){best=q;bd=dist(p,q)}if(best)kick(.008,(best.x-p.x)/bd,(best.y-p.y)/bd)}
function shoot(){const p=home[selected];if(ball.owner===p||dist(p,ball)<.075)kick(.014,1,(.5-p.y)*1.8)}
function goal(){ball.owner=null;setTimeout(resetBall,700)}
function switchPlayer(){let n=0,b=99;for(let i=0;i<11;i++){let d=dist(home[i],ball);if(d<b){b=d;n=i}}selected=n}
function formatTime(){return`${String(Math.floor(timeLeft/60)).padStart(2,'0')}:${String(Math.floor(timeLeft%60)).padStart(2,'0')}`}
function tick(now){const dt=Math.min(35,now-(last||now-16));last=now;if(running){timeLeft-=dt/1000;if(timeLeft<=0){timeLeft=0;running=false;const s=document.getElementById('start');s.classList.remove('hidden');s.textContent='إعادة المباراة'}moveControlled(dt);moveAI(home,dt);moveAI(away,dt);updateBall(dt);document.getElementById('score').textContent=`${score[0]} - ${score[1]}`;document.getElementById('time').textContent=formatTime()}draw();requestAnimationFrame(tick)}requestAnimationFrame(tick)}
document.getElementById('start').onclick=()=>{score=[0,0];timeLeft=180;resetTeams();running=true;document.getElementById('start').classList.add('hidden')};
const bind=(id,fn)=>document.getElementById(id).addEventListener('click',fn);bind('pass',pass);bind('shoot',shoot);bind('switch',switchPlayer);
document.querySelectorAll('[data-key]').forEach(b=>{const k=b.dataset.key;['touchstart','mousedown'].forEach(e=>b.addEventListener(e,z=>{z.preventDefault();keys[k]=1}));['touchend','mouseup','mouseleave','touchcancel'].forEach(e=>b.addEventListener(e,z=>{z.preventDefault();keys[k]=0}))});
addEventListener('keydown',e=>{if(e.key.startsWith('Arrow')){e.preventDefault();keys[{ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right'}[e.key]]=1}if(e.key===' '){e.preventDefault();shoot()}if(e.key==='p')pass();if(e.key==='Tab'){e.preventDefault();switchPlayer()}});addEventListener('keyup',e=>{if(e.key.startsWith('Arrow'))keys[{ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right'}[e.key]]=0});