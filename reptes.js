'use strict';
window.ADVENT=(()=>{
const D=window.ADVENT_DATA, $=id=>document.getElementById(id), trs=D.tracks;
const alreadyPublished='https://beilo-byte.github.io/NADALES-ROCK-27/';
const publicAudio={'01':'assets/game/01-floquet.mp3','02':'02_Els_regals_cauen_del_cel_2n.mp3','03':'assets/game/03-colors.mp3','04':'04_Amor_al_meu_rebost_4t.mp3','05':'05_Hivern_Ginger.mp3','06':'06_Com_un_pet_6e.mp3'};
const activeTracks=trs.filter(t=>publicAudio[t.id]);
const audioURL=id=>publicAudio[id]?alreadyPublished+publicAudio[id]:'';
const names={
 guide:['Guia exprés','Obre la guia'],sing:['Cantem amb Ginger','Lletra i música'],guess:['Quina nadala sona?','Juga amb les primeres notes'],compare:['Escolta i compara','Obre l’escolta'],beat:['Cadena de ritmes','Obre el ritme'],echo:['L’eco','Obre el ritme'],director:['Marca l’entrada','Obre el ritme'],
 code:['El codi del fanalet','Desxifra el codi'],pattern:['La garlanda','Completa el patró'],galets:['Els tres plats','Reparteix els galets'],bridge:['El pont de paper','Fes l’experiment'],ice:['El glaçó que dura més','Fes una predicció'],shadow:['El laboratori d’ombres','Obre l’experiment'],roll:['Una rampa, tres moviments','Fes l’experiment'],fold:['El floc desplegat','Obre el taller'],
 traffic:['Semàfor d’hivern','Activa el semàfor'],move:['Travessa el riu','Obre els moviments'],maze:['El camí del fanalet','Juga al laberint'],words:['La ruleta de paraules','Treu tres paraules'],riddle:['El misteri d’hivern','Demana la primera pista'],story:['Una lectura d’hivern','Obre el conte'],
 mirror:['El mosaic mirall','Completa el mosaic'],draw:['Taller d’imatges','Obre el taller'],kind:['Un gest que es nota','Tria un gest'],include:['Una classe més acollidora','Obre les idees'],quiet:['Un minut d’hivern','Obre la pausa'],puzzle:['Postal feta miques','Munta la postal'],memory:['Llums de memòria','Obre el joc'],hunt:['A la recerca de l’estrella','Obre les pistes'],mime:['Teatre sense veu','Treu una paraula']
};
const e=(tag,text,cls)=>{const n=document.createElement(tag);if(text!=null)n.textContent=text;if(cls)n.className=cls;return n};
const add=(h,t,cls)=>h.appendChild(e('p',t,cls));
const button=(h,t,fn,cls)=>{const b=e('button',t,cls);b.type='button';b.onclick=fn;h.append(b);return b};
const row=h=>h.appendChild(e('div',null,'rbar'));
const status=h=>{const s=add(h,'','reply');s.setAttribute('role','status');return s};
const select=(h,items)=>{const s=e('select');for(const [k,t] of items){const o=e('option',t);o.value=k;s.append(o)}h.append(s);return s};
const pick=a=>a[Math.floor(Math.random()*a.length)];
const mix=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const board=h=>h.appendChild(e('div',null,'playboard'));
const grid=(h,c)=>{const g=h.appendChild(e('div',null,'grid'));g.style.setProperty('--cols',c);return g};
const link=(h,url,t)=>{const a=e('a',t);a.href=url;a.target='_blank';a.rel='noopener noreferrer';h.append(a)};
const bg=new Audio(), clue=new Audio();bg.loop=true;bg.crossOrigin='anonymous';bg.preload=clue.preload='none';
let context,bus,background=false,musicVolume=.10,musicId='01',token=0,handle=null,tick=null,focus,flag=false,previewUntil=0;
function audioCtx(){context??=new (window.AudioContext||window.webkitAudioContext)();context.resume().catch(()=>{});return context}
function tone(f,d=.19,offset=0){try{const c=audioCtx(),t=c.currentTime+offset,o=c.createOscillator(),g=c.createGain();o.frequency.value=f;g.gain.setValueAtTime(.001,t);g.gain.exponentialRampToValueAtTime(.15,t+.015);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g).connect(c.destination);o.start(t);o.stop(t+d+.025)}catch{}}
function awaitVolume(){if(bus){try{bg.volume=1}catch{}bus.gain.value=musicVolume}else bg.volume=musicVolume;$('volumeValue').textContent=Math.round(musicVolume*100)+'%'}
function playBg(){
 if(!background||$('challenge').open||document.hidden)return;
 if(bg.dataset.id!==musicId){bg.dataset.id=musicId;bg.src=audioURL(musicId)}
 try{if(!bus){const c=audioCtx();bus=c.createGain();c.createMediaElementSource(bg).connect(bus).connect(c.destination)}audioCtx()}catch{}
 awaitVolume(); bg.play().then(()=>{if(!background||$('challenge').open||document.hidden)bg.pause()}).catch(()=>{if(!bg.paused||$('challenge').open||document.hidden||!background)return;background=false;syncMusic()})
}
function syncMusic(){$('musicToggle').setAttribute('aria-pressed',background);$('musicPlay').textContent=background?'Atura la música de fons':'Activa música de fons';$('musicToggle').title=background?'Atura la música de fons':'Activa la música de fons'}
function toggleMusic(){background=!background;if(background)playBg();else bg.pause();syncMusic()}
function stopClue(){clue.pause();previewUntil=0}
clue.ontimeupdate=()=>{if(previewUntil&&clue.currentTime>=previewUntil)stopClue()};
function sayPlay(a,s){a.play().catch(()=>{s.textContent='No s’ha pogut iniciar l’àudio. Torna-ho a provar amb el botó de reproducció.'})}
function cleanup(){token++;clearTimeout(handle);clearInterval(tick);stopClue();$('challengeBody').querySelectorAll('audio').forEach(a=>a.pause());$('challengeBody').replaceChildren();flag=false}
function steps(h,lines){const ol=h.appendChild(e('ol',null,'steps'));lines.forEach(t=>ol.append(e('li',t)));return ol}
function song(h,type){
 add(h,type==='compare'?'Compareu dos fragments. Podeu triar dues cançons o la mateixa tornada amb la pista i després cantada a cappella. Fixeu-vos en la veu, el ritme o els instruments.':'Trieu la cançó. La lletra queda a la pantalla mentre escolteu o canteu.', 'instruction');
 const picker=select(row(h),trs.map(t=>[t.id,t.course+' · '+t.title]));picker.setAttribute('aria-label','Tria la nadala');picker.value='01';
 const play=e('audio');play.controls=true;play.preload='none';h.append(play);const playRow=row(h),live=status(h);const lyrics=h.appendChild(e('div',null,'lyrics'));
 const draw=()=>{const t=trs.find(t=>t.id===picker.value);play.pause();if(publicAudio[t.id])play.src=audioURL(t.id);else {play.removeAttribute('src');play.load()}lyrics.replaceChildren();
 for(const st of t.stanzas){const p=e('p');st.forEach((line,i)=>{if(i)p.append(e('br'));p.append(document.createTextNode(line))});lyrics.append(p)}
 play.hidden=go.hidden=!publicAudio[t.id];live.textContent=publicAudio[t.id]?'':'Aquí tens la lletra. Per veure les versions, obre el disc de Ginger.';};picker.onchange=draw;
 const go=button(playRow,'▶ Canta amb la pista',()=>play.paused?sayPlay(play,live):play.pause(),'primary');play.onplay=()=>go.textContent='Pausa';play.onpause=play.onended=()=>go.textContent='▶ Canta amb la pista';draw();link(h,'https://beilo-byte.github.io/GINGER-NADALES-EDICIO-2027/','Obre el disc de Ginger');if(type==='compare')add(h,'Què es manté igual? Què canvia? Doneu-ne una prova audible.');
}
function guess(h){
 add(h,'Escolteu dos segons de l’inici d’una pista. Parleu en equip i trieu un títol. Si costa, podeu demanar una segona pista de cinc segons.');
 const area=board(h),controls=row(area),answers=row(area),feedback=status(area);let t=null,idx=0,done=false,q=[],key=0,playId=0;
 function next(){stopClue();if(!q.length)q=mix(activeTracks.filter(x=>x.id!==(t?.id||'')));t=q.pop();idx++;done=false;key++;feedback.textContent='Ronda '+idx;clue.src=audioURL(t.id);answers.replaceChildren();
 for(const k of mix([t,...mix(trs.filter(x=>x!==t)).slice(0,2)])){button(answers,k.title,()=>{if(done)return;stopClue();if(k===t){done=true;feedback.textContent='Exacte! Era «'+t.title+'».'}else feedback.textContent='Encara no. Escolteu una vegada més o proveu una altra opció.'})}}
 function play(sec){stopClue();clue.currentTime=0;previewUntil=sec;const cur=key,version=token,serial=++playId;clue.play().then(()=>{if(cur!==key||version!==token||serial!==playId)return;setTimeout(()=>{if(cur===key&&version===token&&serial===playId&&clue.currentTime>=sec-.15)stopClue()},sec*1000+120)}).catch(()=>{feedback.textContent='Ara no s’ha pogut reproduir l’àudio.'})}
 button(controls,'▶ Dos segons',()=>play(2),'primary');button(controls,'▶ Cinc segons',()=>play(5));button(controls,'Ronda nova',next);next()
}
function quiz(h,question,answers,correct,why){
 const a=board(h);add(a,question,'big');const r=row(a),s=status(a);
 answers.forEach((v,i)=>button(r,v,()=>s.textContent=i===correct?'Sí. '+why:'Torneu a mirar les pistes i expliqueu què us ha fet triar aquesta resposta.'));
}
function timer(h,seconds,text){
 const a=board(h),n=add(a,text,'big'),r=row(a);n.setAttribute('role','timer');let left=seconds;
 function show(){n.textContent=left?left+' s':'Temps!'}function pause(){clearInterval(tick);tick=null}
 button(r,'Inicia',()=>{pause();if(!left)left=seconds;show();tick=setInterval(()=>{left--;show();if(!left)pause()},1000)},'primary');
 button(r,'Pausa',pause);button(r,'Reinicia',()=>{pause();left=seconds;show()})
}
function beat(h,type){
 steps(h,type==='director'?['Trieu qui farà de director o directora.','Feu quatre pulsacions preparatòries; entreu tots amb el senyal.','Canvieu de director i proveu un final clar.']:type==='echo'?['Una persona proposa un compàs o un vers.','La resta fa d’eco.','Canvieu qui inicia, sense aturar la pulsació.']:['Escolteu quatre pulsacions. Podeu picar a la taula, a les cuixes o amb les mans.','Cada grup inventa un compàs de quatre pulsacions.','Encadeneu-los; si voleu, acabeu amb la tornada de «L’estel pacient».']);
 const a=board(h),slots=row(a),cells=[1,2,3,4].map(x=>slots.appendChild(e('span',String(x),'big')));let n=0;
 button(row(a),'▶ Marca 4 pulsacions',()=>{clearInterval(tick);n=0;const go=()=>{cells.forEach((x,i)=>x.classList.toggle('pulse',i===n));if(n===4){clearInterval(tick);return}tone(n++===0?784:523)};go();tick=setInterval(go,620)},'primary');
 button(row(a),'Lletra i música de Ginger',()=>reopen('sing','Trieu la vostra tornada.'));
}
function traffic(h){
 add(h,'Verd: mou-te o marca el ritme assegut. Groc: ves a poc a poc. Vermell: queda’t quiet. Canvieu de qui dirigeix.');
 const a=board(h),s=a.appendChild(e('div','A punt?','stagecue')),r=row(a);s.setAttribute('role','status');const t=['Verd · mou-te','Groc · a poc a poc','Vermell · atura’t'];
 const show=i=>{s.textContent=t[i];s.className='stagecue cue'+i};t.forEach((v,i)=>button(r,v.split(' · ')[0],()=>show(i)));button(r,'Següent senyal a l’atzar',()=>show(Math.floor(Math.random()*3)),'primary');
}
function words(h,mime=false){
 const lists=[['un fanalet','un llop amb bufanda','una estrella despistada','un mitjó sol'],['un camí gelat','un tren buit','una teulada','un bosc blau'],['un secret','una capsa que canta','un pont de paper','una pluja de llum']];
 const prompts=['fanalet','bufanda','esquirol','ninot de neu','patins','tió','mussol','rellotge'];
 add(h,mime?'Feu mirar la pantalla només a qui farà la mímica. La resta endevina, sense crits.':'Feu servir els tres ingredients per inventar una història. Podeu explicar-la oralment o escriure només la primera frase.');
 const a=board(h),s=add(a,'','big');s.setAttribute('role','status');button(row(a),mime?'Treu una paraula':'Barreja els ingredients',()=>{s.textContent=mime?pick(prompts):lists.map(pick).join(' · ')},'primary');
}
function riddle(h){
 const riddles=[['Em pots veure a terra al matí.','No sempre soc neu.','Desapareixo quan puja la temperatura.','Gebre'],['No tinc boca però puc ballar al vespre.','Una persona o un objecte em pot fer néixer.','Sense llum no em veuràs.','Ombra'],['No soc un estel però faig llum.','Puc tenir un mànec.','Em pots dur per un camí fosc.','Fanalet']];
 let q=pick(riddles),at=0;const a=board(h),s=add(a,'Parleu entre vosaltres abans de demanar una altra pista.','big');s.setAttribute('role','status');const r=row(a);
 button(r,'Pista següent',()=>{s.textContent=q[Math.min(at++,2)]},'primary');button(r,'Mostra la solució',()=>s.textContent=q[3]);button(r,'Un altre misteri',()=>{q=pick(riddles.filter(x=>x!==q));at=0;s.textContent='Preparats per a un altre misteri?'})
}
function maze(h){
 add(h,'Porta el fanalet fins a l’estel. Tria una casella veïna o usa les fletxes. No es pot trepitjar el bosc.');
 const a=board(h),g=grid(a,5),s=status(a),blocked=new Set([1,7,8,10,13,16,18,21]);let at=0;const goal=24,tiles=[];
 function paint(){tiles.forEach((b,i)=>{b.textContent=i===at?'🏮':i===goal?'★':blocked.has(i)?'♣':'·';b.classList.toggle('on',i===at);b.setAttribute('aria-label',((i===at?'Fanalet, ':i===goal?'Estel, ':blocked.has(i)?'Bosc, ':'Neu, '))+'fila '+(Math.floor(i/5)+1)+', columna '+(i%5+1))})}
 function go(i){if(i<0||i>24||blocked.has(i)||Math.abs(i%5-at%5)+Math.abs(Math.floor(i/5)-Math.floor(at/5))!==1){s.textContent='Aquest pas no es pot fer.';return}at=i;paint();s.textContent=i===goal?'L’estel ja està encès!':''}
 for(let i=0;i<25;i++)tiles.push(button(g,'',()=>go(i)));g.addEventListener('keydown',ev=>{const off={ArrowRight:1,ArrowLeft:-1,ArrowUp:-5,ArrowDown:5}[ev.key];if(off){ev.preventDefault();go(at+off)}});button(row(a),'Reinicia',()=>{at=0;s.textContent='';paint()});paint()
}
function mirror(h){
 add(h,'Encén a la dreta les caselles que farien el reflex de les de l’esquerra. La ratlla central és el mirall.');
 const a=board(h),g=grid(a,5),s=status(a),left=new Set([0,6,10,16,20]),right=new Set(),goal=new Set([...left].map(x=>Math.floor(x/5)*5+4-x%5));const cells=[];
 function display(){cells.forEach((b,i)=>{b.classList.toggle('on',left.has(i)||right.has(i));b.textContent=i%5===2?'│':left.has(i)||right.has(i)?'◆':'·';if(i%5>2)b.setAttribute('aria-pressed',String(right.has(i)))})}
 for(let i=0;i<25;i++){const b=button(g,'',()=>{right.has(i)?right.delete(i):right.add(i);s.textContent='';display()});b.disabled=i%5<=2;b.setAttribute('aria-label','Casella '+(Math.floor(i/5)+1)+', '+(i%5+1));cells.push(b)}
 button(row(a),'Comprova el mosaic',()=>s.textContent=right.size===goal.size&&[...goal].every(i=>right.has(i))?'Perfecte: el mosaic és simètric.':'Mireu fila per fila, a la mateixa distància del mirall.','primary');display()
}
function puzzle(h){
 add(h,'Toca dues peces per intercanviar-les. Quan la postal quedi sencera, explica quin detall t’ha ajudat més.');
 const a=board(h),g=grid(a,3),s=status(a);let order=[],held=-1;
 function seed(){held=-1;do{order=mix([...Array(9).keys()])}while(order.every((v,i)=>v===i));render()}
 function render(){g.replaceChildren();order.forEach((v,i)=>{const b=button(g,'',()=>{if(held<0)held=i;else{[order[held],order[i]]=[order[i],order[held]];held=-1}render();g.children[i]?.focus();s.textContent=order.every((v,i)=>v===i)?'Postal completa!':''},'tile');b.style.backgroundImage='url("'+(window.ADVENT_POSTAL||'./assets/postal.webp')+'")';b.style.backgroundPosition=(v%3)*50+'% '+Math.floor(v/3)*50+'%';b.setAttribute('aria-label','Peça '+(v+1)+' a la casella '+(i+1));b.setAttribute('aria-pressed',String(held===i));if(held===i)b.style.outline='3px solid #20553e'})}
 button(row(a),'Barreja les peces',()=>{s.textContent='';seed()});seed()
}
function memory(h){
 add(h,'Mireu la seqüència i repetiu-la quan s’acabi. Comença amb tres llums i n’afegeix una cada vegada.');
 const a=board(h),r=row(a),s=status(a),buttons=[],labels=['A · lluna','B · estrella','C · floc','D · sol'],fre=[523,659,784,880];let seq=[],at=0,busy=false;
 for(let j=0;j<4;j++)buttons.push(button(r,labels[j],()=>{if(busy||!seq.length)return;tone(fre[j]);if(seq[at++]!==j){s.textContent='Torneu a veure la seqüència.';at=0;return}if(at===seq.length){s.textContent='Molt bé! Afegeix una llum o torna a practicar.';at=0;ready=true}}));
 let ready=false;const play=()=>{if(busy||!seq.length)return;at=0;busy=true;let i=0;const flash=()=>{buttons.forEach(b=>b.classList.remove('on'));if(i>=seq.length){busy=false;s.textContent='Ara repetiu-la.';return}const j=seq[i++];buttons[j].classList.add('on');tone(fre[j]);s.textContent=labels[j];handle=setTimeout(()=>{buttons[j].classList.remove('on');handle=setTimeout(flash,210)},390)};flash()};
 const controls=row(a);button(controls,'Comença',()=>{if(busy)return;seq=Array.from({length:3},()=>Math.floor(Math.random()*4));ready=false;play()},'primary');button(controls,'Torna-la a veure',play);button(controls,'Afegeix una llum',()=>{if(busy||!ready)return;seq.push(Math.floor(Math.random()*4));ready=false;play()})
}
function draw(h){
 add(h,'Dibuixeu una finestra que sembli càlida. Trieu tres colors i penseu què hi haurà a dins. Si preferiu paper, feu-la a mà i compareu les propostes.');
 const c=e('canvas');c.width=720;c.height=360;c.setAttribute('aria-label','Espai de dibuix amb ratolí o dit. Alternativa: paper.');const a=c.getContext('2d'),r=row(h);
 let ink='#284e77',pressed=false;
 for(const [color,name] of [['#284e77','Blau'],['#a23e38','Vermell'],['#a46a16','Daurat'],['#325f43','Verd']])button(r,name,()=>ink=color);
 button(r,'Esborra el dibuix',()=>a.clearRect(0,0,c.width,c.height));h.append(c);
 c.onpointerdown=ev=>{pressed=true;c.setPointerCapture(ev.pointerId);a.beginPath();a.lineWidth=7;a.lineCap='round';a.strokeStyle=ink;stroke(ev)};
 function stroke(ev){const b=c.getBoundingClientRect(),x=(ev.clientX-b.left)*c.width/b.width,y=(ev.clientY-b.top)*c.height/b.height;a.lineTo(x,y);a.stroke()}
 c.onpointermove=ev=>{if(pressed)stroke(ev)};c.onpointerup=c.onpointercancel=()=>pressed=false;
}
const guide=(h,consigna)=>steps(h,['Llegiu la proposta: «'+consigna+'»','Trieu com fer-la: en parella, en equip o tota la classe. Acordeu què necessiteu abans de començar.','Al final, compartiu una observació o una cosa que canviaríeu.']);
function gestures(h,type){
 const list=type==='include'?['Si algú acaba d’arribar, oferiu-li un torn que no depengui de saber les regles.','Proposeu una manera de jugar sense haver de córrer.','Trieu una salutació voluntària que no necessiti contacte físic.']:['Penseu en una tasca de l’escola que es fa en silenci. Digueu gràcies i expliqueu què canvia gràcies a aquella feina.','Convideu algú a escollir el pròxim joc, sense obligar-lo a participar.','Pregunteu a algú què li faria servei avui abans d’oferir ajuda.','Feu una nota col·lectiva d’agraïment i llegiu-la només si la persona hi està d’acord.'];
 const a=board(h),p=add(a,list[0],'big');p.setAttribute('role','status');let i=0;button(row(a),'Una altra proposta',()=>p.textContent=list[(++i)%list.length],'primary');add(h,'No cal comprar res ni penjar cap missatge. El gest passa a l’escola, no a la pantalla.');
}
const exercises={
 code:h=>quiz(h,'Pistes: són tres xifres. La primera és el doble de 2. La segona és l’únic 0. La tercera és 4 menys 1.',['340','403','430'],1,'La primera és 4, la del mig 0 i la darrera 3.'),
 pattern:h=>quiz(h,'● ◆ ◆   ● ◆ ◆   ● ◆ ◆   ● …',['◆','●','■'],0,'La unitat es repeteix: cercle, rombe, rombe.'),
 galets:h=>quiz(h,'Hi ha 12 galets. Al plat petit n’hi ha 2. Al mitjà n’hi ha el doble. Quants en queden al plat gran?',['4','5','6'],2,'12 menys 2 menys 4 són 6.'),
 bridge:h=>{steps(h,['Poseu dos llibres a un pam de distància. Prepareu dos fulls iguals i unes quantes fitxes.','Poseu un full pla sobre el buit; l’altre, plegat en acordió. Feu servir la mateixa distància i la mateixa mena de fitxa.','Feu una predicció i afegiu les fitxes d’una en una al centre. Anoteu el màxim de cada pont.']);quiz(h,'Què deixarem igual perquè la comparació sigui justa?',['La distància i les fitxes','El resultat final'],0,'Canviem la forma del paper, no la resta de variables.');},
 ice:h=>{steps(h,['Poseu dos glaçons semblants en dos plats iguals. Deixeu-ne un a l’ombra i l’altre en un lloc més càlid.','Predigueu què passarà. Comproveu els dos plats alhora.','Quan hi hagi un canvi, compareu-lo amb la vostra predicció.']);timer(h,60,'Primera observació: en un minut');},
 shadow:h=>{steps(h,['Poseu una figura de paper sobre la taula. Feu servir una llanterna, sense apuntar als ulls.','Moveu només la llanterna més a prop de la figura. Deixeu la figura i la pantalla quietes.','Dibuixeu o expliqueu què ha canviat.']);quiz(h,'Què estem canviant deliberadament?',['La distància entre la llum i la figura','La mida de la figura'],0,'La figura no canvia.');},
 roll:h=>{steps(h,['Feu una rampa petita amb un llibre. Trieu un llapis rodó, una goma i una pilota.','Predigueu per a cada objecte si rodolarà, lliscarà o quedarà quiet. Deixeu-lo anar sense empènyer.','Canvieu la posició del llapis i repetiu.']);quiz(h,'Amb el mateix llapis, què podeu canviar?',['La posició de sortida','La forma del llapis'],0,'Proveu-lo de costat i després apuntant cap avall.');},
 fold:h=>steps(h,['Doblegueu un full reutilitzat per la meitat. Predigueu on sortirà un tall fet al plec.','Amb tisores escolars i supervisió, retalleu una osca petita al plec. Desplegueu el full.','Compareu les dues meitats. Mostreu on és l’eix.']),
 move:h=>{steps(h,['Imagineu tres pedres al riu. En cadascuna feu un moviment: una palmada, un toc de genolls i un gest cap amunt.','Es pot fer assegut. Proposeu una seqüència nova sense córrer ni tocar ningú.']);timer(h,30,'30 segons per acordar els moviments');},
 quiet:h=>{add(h,'Trieu un punt per mirar. No cal tancar els ulls. Pareu atenció a un so de prop i un de lluny; compartiu-los només si voleu.');timer(h,60,'Un minut d’escolta');},
 hunt:h=>{steps(h,['Dibuixeu una estrella en un paper i trieu un lloc visible i segur. No cal sortir de l’aula ni enfilar-se.','Doneu tres pistes: una de general, una de mitjana i una de concreta.']);const a=board(h),s=status(a);let i=0;button(row(a),'Pista de mostra',()=>s.textContent=['És dins de la classe.','És a prop d’un lloc on llegim.','És al costat del cistell de contes.'][i++%3]);},
 story:h=>{add(h,'En Trot vol ajudar en Zip abans que arribi el fred. Comproveu si necessita allò que en Trot imagina.');link(h,'https://agora.xtec.cat/ceip-escola-montsant-reus/wp-content/uploads/usu1887/2020/04/Una-caseta-per-passar-lhivern.-N%C3%BAria-Vives.pdf','Obre «Una caseta per passar l’hivern» (PDF de l’escola)');steps(h,['Quan en Trot comenci a buscar: què creieu que li cal de debò a en Zip?','Al final, trieu el moment més sorprenent i expliqueu per què.','Sense internet? Inventeu oralment un final per als dos personatges i compareu propostes.']);}
};
const renderers={...exercises,guide,sing:song,compare:song,guess,beat,echo:beat,director:beat,traffic,words,mime:h=>words(h,true),riddle,maze,mirror,draw,kind:gestures,include:gestures,puzzle,memory};
const giftRows=window.ADVENT_GIFTS;
const giftMap=new Map(giftRows.map(g=>[g[1],g]));
const giftSources={
 poesia:['Exemples de poesia nadalenca a XTEC · Escola La Cabana','https://agora.xtec.cat/esc-la-cabana/general/no-perdem-la-il%C2%B7lusio-i-la-magia-del-nadal/'],
 trot:['«Una caseta per passar l’hivern» · Escola Montsant (PDF)','https://agora.xtec.cat/ceip-escola-montsant-reus/wp-content/uploads/usu1887/2020/04/Una-caseta-per-passar-lhivern.-N%C3%BAria-Vives.pdf'],
 origami:['Guia del plegat amb fotos · Red Ted Art','https://www.redtedart.com/origami-bookmark/'],
 ink:['Cromatografia en paper · Birmingham Museums','https://www.birminghammuseums.org.uk/resources/paper-rainbows'],
 freeze:['Inspiració: format ball i estàtua · vídeo del creador (YouTube)','https://www.youtube.com/watch?v=cn5CuIohvIY'],
 minute:['Inspiració: jocs d’hivern d’aula · Chaylor & Mads','https://chaylorandmads.com/winter-themed-games-for-classroom/'],
 nrich:['Inspiració: enigmes de regals · NRICH, Universitat de Cambridge','https://nrich.maths.org/problems/presents']
};
const clipData=window.ADVENT_CHORUS;
function chorus(h, preferred='01'){
 const picker=select(row(h),trs.map(t=>[t.id,t.course+' · '+t.title]));picker.setAttribute('aria-label','Tria la nadala');picker.value=preferred;
 const a=board(h);
 const lyrics=a.appendChild(e('div',null,'lyrics chorusLyrics'));const ctl=row(a),live=status(a);
 const play=e('audio');play.preload='none';a.append(play);
 let clip=null,lines=[],soundKey=0;
 const progress=e('progress');progress.max=1;progress.value=0;progress.setAttribute('aria-label','Progrés de la tornada');a.append(progress);
 function paint(){if(!clip?.cues)return;progress.value=Math.max(0,Math.min(1,(play.currentTime-clip.in)/(clip.out-clip.in)));
 lines.forEach((l,i)=>l.classList.toggle('sing-active',!play.paused&&play.currentTime>=clip.cues[i][0]&&play.currentTime<clip.cues[i][1]));
 if(play.currentTime>=clip.out){play.pause();live.textContent='Tornada acabada.'}}
 const go=button(ctl,'▶ Escolta només la tornada',async()=>{
  if(!clip?.cues)return;
  if(!play.paused){play.pause();return}
  const k=++soundKey;
  try{if(play.currentTime<clip.in||play.currentTime>=clip.out-.08)play.currentTime=clip.in;await play.play();if(k===soundKey&&$("challenge").open)live.textContent='Tornada en reproducció.';}
  catch{if(k===soundKey)live.textContent='No s’ha pogut iniciar l’àudio. Podeu cantar llegint la lletra.';}
 },'primary gift-big');
 const reset=button(ctl,'Torna al principi',()=>{if(clip?.cues){play.pause();play.currentTime=clip.in;live.textContent='A punt per tornar a cantar.';paint()}});
 play.ontimeupdate=paint;play.onplay=()=>{go.textContent='❚❚ Pausa';paint();clearInterval(tick);tick=setInterval(paint,45)};
 play.onpause=()=>{go.textContent='▶ Escolta només la tornada';clearInterval(tick);paint()};
 const draw=()=>{++soundKey;play.pause();clip=clipData[picker.value];lyrics.replaceChildren();lines=[];
 add(lyrics,'TORNADA','gift-meta');
 clip.lines.forEach(s=>lines.push(add(lyrics,s,'chorusLine')));
 go.hidden=reset.hidden=progress.hidden=!clip.cues;progress.value=0;
 if(clip.cues){play.src=audioURL(picker.value);live.textContent='Només sonarà aquest fragment.'}
 else{play.removeAttribute('src');play.load();live.textContent='Lletra sola: podeu fer la tornada a cappella.'}
 };
 picker.onchange=draw;draw();
 button(row(h),'Obre el cançoner complet',()=>reopen('sing','Trieu una cançó sencera per escoltar-la o cantar-la.'));
}
function echoGift(h){
 const a=board(h),line=add(a,'','big'), verses=clipData['07'].lines;let i=0;
 const r=row(a);const s=status(a);
 function show(){line.textContent=verses[i];s.textContent='Vers '+(i+1)+' de '+verses.length}
 button(r,'Vers anterior',()=>{i=(i+verses.length-1)%verses.length;show()});
 button(r,'Vers següent, després de l’eco',()=>{i=(i+1)%verses.length;show()},'primary gift-big');show();
 metro(h);
}
function metro(h){
 const a=board(h),slots=row(a),cells=[1,2,3,4].map(x=>slots.appendChild(e('span',String(x),'big'))),r=row(a);
 const speed=select(r,[['72','72 pulsacions/min · tranquil'],['96','96 pulsacions/min · viu'],['120','120 pulsacions/min · ràpid']]);speed.value='96';speed.setAttribute('aria-label','Velocitat del metrònom');
 let n=0,run=false;const click=()=>{cells.forEach((x,i)=>x.classList.toggle('pulse',i===n));tone(n===0?784:523,.09);n=(n+1)%4};
 const start=()=>{clearInterval(tick);n=0;click();tick=setInterval(click,60000/Number(speed.value))};
 const b=button(r,'▶ Engega el metrònom',()=>{run=!run;b.setAttribute('aria-pressed',String(run));b.textContent=run?'■ Atura el metrònom':'▶ Engega el metrònom';if(run)start();else{clearInterval(tick);cells.forEach(x=>x.classList.remove('pulse'))}},'primary gift-big');
 b.setAttribute('aria-pressed','false');speed.onchange=()=>{if(run)start()};
}
function freezeGift(h){
 const a=board(h),cue=add(a,'A punt?','stagecue'),clock=add(a,'60 s','big'),r=row(a),live=status(a);
 cue.setAttribute('role','status');clock.setAttribute('role','timer');
 const sound=e('audio');sound.preload='none';sound.src=audioURL('01');sound.volume=.30;a.append(sound);
 let began=0,last=-1,active=false;const marks=[0,8,12,21,25,35,39,50,54,60];
 function update(){const elapsed=Math.min(60,(Date.now()-began)/1000);let j=marks.findIndex(v=>v>elapsed)-1;
  clock.textContent=Math.ceil(60-elapsed)+' s';
  if(elapsed>=60){stop('S’ha acabat!');return}
  if(j===last)return;last=j;const moving=j%2===0;cue.textContent=moving?'MOU-TE!':'GEL!';cue.className='stagecue '+(moving?'cue0':'cue2');
  if(moving){if(!sound.muted)sayPlay(sound,live)}else sound.pause();
 }
 function stop(message='A punt?'){active=false;clearInterval(tick);sound.pause();cue.textContent=message;cue.className='stagecue';clock.textContent=message==='A punt?'?'60 s':'0 s'}
 button(r,'▶ Comença el minut',()=>{stop();sound.currentTime=0;began=Date.now();last=-1;active=true;update();tick=setInterval(update,100)},'primary gift-big');
 button(r,'Atura i reinicia',()=>stop());
 const m=button(r,'Silencia la pista',()=>{sound.muted=!sound.muted;m.textContent=sound.muted?'Activa la pista':'Silencia la pista';if(sound.muted)sound.pause();else if(active&&last%2===0)sayPlay(sound,live)});
}
function renderGift(h,id){
 const [cat,,title,hook,mins,materials,procedure,finish,source]=giftMap.get(id);
 const helper={chorus,break:el=>chorus(el,'07'),intro:guess,echolead:echoGift,conductor:metro,chain:metro,freeze:freezeGift,window:draw,lanternpath:maze,lights:memory,puzzlewinter:puzzle};
 const active=['chorus','break','freeze','intro'].includes(id);
 if(active)helper[id](h);
 const info=board(h);add(info,cat+' · '+mins,'gift-meta');add(info,'Què necessitem: '+materials);
 const instructions=steps(h,procedure);const answer=['codegift','tracks','postroute','witness','ribbon','squares','sleigh','treegrid'].includes(id);
 const area=answer?h.appendChild(e('details',null,'gift-solution')):h;
 if(answer)area.append(e('summary','Pista final i solució'));
 const note=add(area,finish,'gift-note');
 if(id==='poem')note.classList.add('gift-poem');
 if(id==='origami'||id==='snow'){const img=e('img');img.className='gift-diagram';img.src=window.ADVENT_DIAGRAMS?.[id]||'./assets/'+id+'.webp';img.alt=id==='origami'?'Quatre passos dibuixats del punt de llibre: triangle, plec lateral, butxaca i puntes a dins.':'Quatre passos dibuixats: doblegar, marcar una osca triangular, retallar i desplegar.';h.insertBefore(img,instructions);
 button(row(h),'Descarrega la guia visual',()=>{const a=e('a');a.href=img.src;a.download=id==='origami'?'punt-de-llibre-dadvent.webp':'floc-de-paper.webp';a.click()});}
 if(!active)helper[id]?.(h);
 if(source){const [label,url]=giftSources[source];const more=e('details');more.append(e('summary','Referència per al docent'));link(more,url,label);h.append(more)}
}

function reopen(type,text){cleanup();const body=$('challengeBody');if(giftMap.has(type)){$('challengeTitle').textContent=giftMap.get(type)[2];$('challengeType').textContent='Regal d’activitat';add(body,text,'instruction');renderGift(body,type);$('challenge').scrollTop=0;return}$('challengeTitle').textContent=names[type][0];$('challengeType').textContent='Activitat d’aula';if(type!=='guide')add(body,text,'instruction');(renderers[type]||guide)(body,type==='guide'?text:type);$('challenge').scrollTop=0}
function open(type,text){focus=document.activeElement;bg.pause();$('challenge').showModal();reopen(type,text)}
function detect(t){
 t=t.toLocaleLowerCase('ca');
 if(/endevin.*(nadala|cançó)|primeres notes/.test(t))return 'guess';
 if(/cant\w*|tornada|nadala/.test(t))return 'sing';
 if(/ritm|pulsaci/.test(t))return 'beat';
 if(/conte.*hivern/.test(t))return 'story';
 if(/simetr/.test(t))return 'mirror';
 if(/glaçó/.test(t))return 'ice';
 if(/ombra/.test(t))return 'shadow';
 if(/endevinalla/.test(t))return 'riddle';
 return '';
}
function init(){
 $('closeChallenge').onclick=()=>$('challenge').close();
 $('challenge').addEventListener('close',()=>{if($('challenge').open)return;cleanup();playBg();focus?.focus({preventScroll:true})});
 $('musicToggle').onclick=$('musicPlay').onclick=toggleMusic;
 const p=$('musicTrack');activeTracks.forEach(t=>{const x=e('option',t.course+' · '+t.title);x.value=t.id;p.append(x)});p.value=musicId;
 p.onchange=()=>{musicId=p.value;if(background){bg.pause();playBg()}};
 $('musicVolume').oninput=ev=>{musicVolume=Number(ev.target.value)/100;awaitVolume()};
 document.addEventListener('visibilitychange',()=>{if(document.hidden){bg.pause();stopClue();$('challengeBody').querySelectorAll('audio').forEach(a=>a.pause())}else playBg()});
}
return {school:D.school,init,open,detect,label:t=>giftMap.has(t)?'Obre el repte':(names[t]||names.guide)[1],title:t=>giftMap.get(t)?.[2]||names[t]?.[0]||'',has:t=>giftMap.has(t)||Object.hasOwn(names,t),options:[...giftMap.values()].map(x=>[x[1],x[2]])};
})();
