'use strict';
window.ADVENT_COURSES=(()=>{
const AREA=['Català','Castellà','Anglès','Matemàtiques','Medi natural','Medi social','Música','Visual i plàstica','Educació física','Valors i convivència'];
const MARK=['✎','❝','Aa','＋','◉','⌂','♫','✦','↗','♡'];
const GROUP=['Cicle inicial','Cicle mitjà','Cicle superior'];
const GRADES=['1r','2n','3r','4t','5è','6è'];
const BADGE={misteri:'Misteri visual',targetes:'Targetes',graella:'Tauler interactiu',sacs:'Fitxes digitals',sim:'Simulació',triar:'Tria i comprova',so:'Àudio integrat',taller:'Taller digital',pas:'Repte de grup',ordre:'Ordena les peces',total:'Fitxes digitals',suport:'Repartiment'};
const make=(tag,txt,cls)=>{const n=document.createElement(tag);if(txt!=null)n.textContent=txt;if(cls)n.className=cls;return n};
const el=id=>document.getElementById(id), cut=s=>s.split('|');
const add=(host,node)=>{host.append(node);return node};
const b=(host,text,fn,cls='course-btn')=>{const n=make('button',text,cls);n.type='button';n.onclick=fn;return add(host,n)};
const live=h=>{const p=add(h,make('p','','course-live'));p.setAttribute('role','status');return p};
const panel=h=>add(h,make('div',null,'course-panel'));
const buttons=h=>add(h,make('div',null,'course-buttons'));
function disclosure(h,label,text){const d=add(h,make('details',null,'course-note'));d.append(make('summary',label),make('p',text))}
const say=(node,message,kind)=>{node.textContent=message;node.dataset.kind=kind||''};
function toggle(n,on){n.setAttribute('aria-pressed',String(on))}
let audio, voices=[], tick=0;
function stop(){
 voices.splice(0).forEach(q=>{try{q.stop()}catch{}});
 tick++;
}
async function sound(notes,upbeat,status){
 const seq=++tick;
 voices.splice(0).forEach(q=>{try{q.stop()}catch{}});
 try{
  audio??=new (window.AudioContext||window.webkitAudioContext)();
  if(audio.state!=='running')await audio.resume();
  if(seq!==tick)return false;
  const start=audio.currentTime+.04, unit=upbeat?.28:.48;
  notes.forEach((note,i)=>{
   const o=audio.createOscillator(),g=audio.createGain(),t=start+i*unit;
   o.type=upbeat?'triangle':'sine';o.frequency.value=440*2**((note-69)/12);
   g.gain.setValueAtTime(.001,t);g.gain.exponentialRampToValueAtTime(upbeat?.16:.085,t+.035);
   g.gain.exponentialRampToValueAtTime(.001,t+unit*.82);
   o.connect(g).connect(audio.destination);voices.push(o);o.start(t);o.stop(t+unit*.9);
   o.onended=()=>{voices=voices.filter(v=>v!==o);o.disconnect();g.disconnect()};
  });
  say(status,'Sona la pista.','');
  setTimeout(()=>{if(seq===tick)say(status,'Pista acabada.','')},notes.length*unit*1000+100);
  return true;
 }catch{say(status,'L’àudio no ha pogut iniciar-se. Pots provar els sons amb la veu o un gest.','')}
}
const symLabel={'🟥':'quadrat vermell','🟦':'quadrat blau','🟨':'quadrat groc','⭐':'estrella','🪑':'cadira','📦':'capsa','🟩':'quadrat verd','🟪':'quadrat lila','🔴':'cercle vermell','🚪':'porta','🪟':'finestra','📚':'llibres o biblioteca','🧤':'guant','🎁':'regal','🧣':'bufanda','🛷':'trineu','🌲':'avet','🏫':'escola','🏠':'casa','🌳':'arbre o parc','🚦':'semàfor','🚧':'obres','🏪':'botiga','🚌':'autobús','🚸':'pas de vianants','🎄':'arbre de Nadal','☕':'cafeteria','🗺️':'mapa','🚏':'parada d’autobús','🏥':'centre de salut'};
const mechanics={
 triar(h,[context,items,correct,why]){
  add(h,make('div',context,'course-context'));const box=buttons(h), chosen=new Set();
  cut(items).forEach((value,i)=>{const n=b(box,value,()=>{if(chosen.has(i))chosen.delete(i);else{if(correct.length===1){chosen.clear();[...box.children].forEach(x=>toggle(x,false))}chosen.add(i)}toggle(n,chosen.has(i));say(out,'')});toggle(n,false)});
  const row=buttons(h);const out=live(h);
  b(row,'Comprova',()=>{
   if(!chosen.size)return say(out,'Marca una resposta abans de comprovar-la.');
   const ok=chosen.size===correct.length&&correct.every(v=>chosen.has(v));
   say(out,ok?'Ben vist!':'Encara no. Torna a mirar les dades i prova una altra resposta.',ok?'ok':'retry');
   if(ok)reason.open=true;
  },'course-btn strong');
  b(row,'Neteja la tria',()=>{chosen.clear();[...box.children].forEach(x=>toggle(x,false));say(out,'')});
  const reason=add(h,make('details',null,'course-note'));reason.append(make('summary','Raonament i pas següent'),make('p',why));
 },
 misteri(h,[options,clues,solution,finish]){
  const top=panel(h);add(top,make('p',cut(options).join(' '),'course-context'));const list=add(top,make('ol'));
  let i=0;const row=buttons(h);
  const reveal=b(row,'Obre la primera pista',()=>{add(list,make('li',cut(clues)[i++]));reveal.textContent='Obre la pista següent';if(i===cut(clues).length){reveal.disabled=true;reveal.textContent='No queden més pistes';answer.disabled=false}}); 
  const status=live(h);
  const answer=b(row,'Destapa la resposta',()=>{say(status,solution,'ok');next.hidden=false});answer.disabled=true;
  const next=add(h,make('p',finish,'course-context'));next.hidden=true;
 },
 targetes(h,[left,right,example,ending]){
  const piles=panel(h);piles.classList.add('course-piles');
  const makePile=(name,arr)=>{
   const p=add(piles,make('div',null,'course-tile'));
   add(p,make('span',name,'course-kicker'));let i=0;
   const value=add(p,make('p',arr[i]));value.setAttribute('aria-live','polite');
   b(p,'Canvia la targeta',()=>{i=(i+1)%arr.length;value.textContent=arr[i]});
  };
  makePile('Targeta A',cut(left));makePile('Targeta B',cut(right));
  disclosure(h,'Model de resposta',example);add(h,make('p',ending,'course-context'));
 },
 graella(h,[cells,questions]){
  let i=0,done=false;
  const question=add(h,make('h3','','course-question'));question.setAttribute('aria-live','polite');
  const grid=add(h,make('div',null,'course-board'));const row=buttons(h);
  const out=live(h);
  const next=b(row,'Pregunta següent',()=>{if(++i>=questions.length){done=true;question.textContent='Heu acabat el tauler!';square.forEach(n=>n.disabled=true);say(out,'Torneu a explicar un recorregut amb les vostres paraules.','ok');next.disabled=true;help.disabled=true}else resetQ()});next.disabled=true;
  const help=b(row,'Mostra una pista',()=>{if(!done)say(out,questions[i][2])});
  const square=cut(cells).map((x,k)=>{
   const c=b(grid,x,()=>{if(!next.disabled||done)return;if(k!==questions[i][1]){say(out,'Encara no. Mira la posició al tauler.','retry');return}toggle(c,true);say(out,'Correcte!','ok');next.disabled=false});
   c.setAttribute('aria-label',(symLabel[x]||x)+', fila '+(Math.floor(k/3)+1)+', columna '+(k%3+1));toggle(c,false);return c;
  });
  const resetQ=()=>{question.textContent=questions[i][0];square.forEach(n=>{toggle(n,false);n.disabled=false});next.disabled=true;help.disabled=false;say(out,'')};
  b(row,'Torna al principi',()=>{i=0;done=false;resetQ()});resetQ();
 },
 ordre(h,[items,key,ending]){
  const src=cut(items), picked=[];const row=buttons(h), seq=add(h,make('ol',null,'course-order')), ctr=buttons(h), out=live(h);
  const cards=src.map((x,i)=>b(row,x,()=>{picked.push(i);refresh()}));
  function refresh(){seq.replaceChildren(...picked.map(i=>make('li',src[i])));cards.forEach((n,i)=>n.disabled=picked.includes(i));say(out,'');check.disabled=picked.length!==src.length;undo.disabled=!picked.length}
  const undo=b(ctr,'Desfés l’últim',()=>{picked.pop();refresh()});
  b(ctr,'Reinicia',()=>{picked.length=0;refresh()});
  const check=b(ctr,'Comprova l’ordre',()=>{const ok=picked.length===key.length&&key.every((x,i)=>x===picked[i]);say(out,ok?'Ordre correcte.':'Hi ha un pas fora de lloc. Què havia de passar primer?',ok?'ok':'retry');if(ok)close.open=true},'course-btn strong');
  const close=add(h,make('details',null,'course-note'));close.append(make('summary','Repte de continuació'),make('p',ending));refresh();
 },
 sacs(h,[total,target,hint]){
  let n=0;const seen=new Set();const row=buttons(h);
  const visual=panel(h);visual.classList.add('course-piles');
  const a=add(visual,make('p')),z=add(visual,make('p'));
  const left=b(row,'Mou una fitxa cap a A',()=>{n++;refresh()});
  const right=b(row,'Mou una fitxa cap a B',()=>{n--;refresh()});
  b(row,'Valida aquest repartiment',()=>{
   if(n===0||n===total)return say(out,'Poseu com a mínim una fitxa en cada sac.','retry');
   const key=Math.min(n,total-n);if(seen.has(key))return say(out,'Aquest repartiment ja compta, encara que gireu els sacs.','retry');
   seen.add(key);add(list,make('li',key+' i '+(total-key)));say(out,seen.size>=target?'Repte completat!':seen.size+' de '+target+' repartiments.','ok');
  },'course-btn strong');
  const out=live(h);const list=add(h,make('ol'));disclosure(h,'Mostra una pista',hint);
  function refresh(){a.textContent='Sac A · '+n+'\n'+'● '.repeat(n);z.textContent='Sac B · '+(total-n)+'\n'+'● '.repeat(total-n);left.disabled=n===total;right.disabled=n===0}
  refresh();
 },
 total(h,[spec,target,exact,wanted,max,hint]){
  const values=cut(spec).map(x=>{const j=x.lastIndexOf(' ·');return [x.slice(0,j),Number(x.slice(j+2))]});
  const selected=values.map(()=>0), recorded=new Set();const host=panel(h);
  const stat=add(h,make('p','','course-context'));stat.setAttribute('aria-live','polite');const row=buttons(h),out=live(h),log=add(h,make('ol'));
  const controls=values.map(([name,number],i)=>{
   const line=add(host,make('div',null,'course-counter'));add(line,make('span',name+' · '+number));
   const less=b(line,'−',()=>{selected[i]--;refresh()});less.setAttribute('aria-label','Treu: '+name);
   const qty=add(line,make('output'));
   const more=b(line,'+',()=>{selected[i]++;refresh()});more.setAttribute('aria-label','Afegeix: '+name);
   return [less,qty,more];
  });
  const sum=()=>selected.reduce((s,k,i)=>s+k*values[i][1],0),len=()=>selected.reduce((s,n)=>s+n,0);
  function refresh(){stat.textContent='Total: '+sum()+' de '+target+' · '+len()+' peces'+(exact?' (se’n demanen '+exact+')':'');
   controls.forEach(([less,qty,more],i)=>{less.disabled=selected[i]===0;qty.value=String(selected[i]);more.disabled=selected[i]===max||!!(exact&&len()>=exact)});
  }
  b(row,'Comprova la combinació',()=>{
   if(sum()!==target||(exact&&len()!==exact))return say(out,'Encara no coincideix amb el repte. Canvieu una tria i torneu-hi.','retry');
   const parts=selected.flatMap((n,i)=>Array(n).fill(values[i][1])).sort((a,z)=>a-z),key=parts.join('+');
   if(recorded.has(key))return say(out,'Aquesta combinació d’imports ja està comptada.','retry');
   recorded.add(key);add(log,make('li',parts.join(' + ')));say(out,recorded.size>=wanted?'Repte completat!':'Correcte: '+recorded.size+' de '+wanted+' combinacions.','ok');
  },'course-btn strong');
  b(row,'Neteja el taulell',()=>{selected.fill(0);refresh();say(out,'')});disclosure(h,'Pista o solució',hint);refresh();
 },
 sim(h,[labels,results,why,limit]){
  add(h,make('p','Model virtual · '+limit,'course-context'));
  const names=cut(labels), row=buttons(h), host=panel(h), out=live(h),tested=new Set();
  const lines=names.map(name=>{const item=add(host,make('div',null,'course-labrow'));add(item,make('span',name));const show=add(item,make('div',null,'course-bar'));const bar=add(show,make('div'));const result=add(item,make('output','Pendent'));return {bar,result}});
  const controls=names.map((name,i)=>b(row,'Prova: '+name,()=>{
   tested.add(i);lines[i].bar.style.width=results[i]+'%';lines[i].result.textContent=results[i]+' / 100';
   say(out,names[i]+': '+results[i]+' de 100.','ok');if(tested.size===names.length)extra.open=true;
  }));
  const extra=add(h,make('details',null,'course-note'));extra.append(make('summary','Què explica el model?'),make('p',why));
  b(row,'Reinicia el model',()=>{tested.clear();lines.forEach(x=>{x.bar.style.width='0';x.result.textContent='Pendent'});extra.open=false;say(out,'Torneu a fer una predicció abans de provar-ho.')});
 },
 so(h,[titles,tracks,message,extra],id){
  const row=buttons(h),out=live(h);
  cut(titles).forEach((x,i)=>b(row,'▶ '+x,()=>sound(tracks[i],(id==='5-6'&&i===1)||(id==='3-6'&&i===1),out)));
  b(row,'■ Atura',()=>{stop();say(out,'Pista aturada.')});
  disclosure(h,'Guia i resposta',message);add(h,make('p',extra,'course-context'));
 },
 pas(h,[cards,ending]){
  const stages=cut(cards),top=panel(h);let i=0,interval=null;
  const stage=add(top,make('p','','course-kicker'));stage.setAttribute('aria-live','polite');
  const line=add(top,make('p','','course-context'));line.setAttribute('aria-live','polite');
  const row=buttons(h);const out=live(h);
  const prev=b(row,'Anterior',()=>{i--;show()});
  const next=b(row,'Següent',()=>{if(i<stages.length-1){i++;show()}else{say(out,ending,'ok');next.disabled=true}});
  const seconds=add(row,make('select'));seconds.setAttribute('aria-label','Temporitzador en segons');
  [20,30,45,60].forEach(t=>{const opt=make('option',t+' s');opt.value=t;seconds.append(opt)});
  const timer=b(row,'Inicia el temps',()=>{
   if(interval!==null){cancel();show();return}
   let left=Number(seconds.value);timer.textContent='Atura · '+left+' s';
   interval=setInterval(()=>{left--;if(left>0)timer.textContent='Atura · '+left+' s';else{cancel();say(out,'Temps acabat.','ok')}},1000);
  });
  function cancel(){clearInterval(interval);interval=null;timer.textContent='Inicia el temps'}
  function show(){cancel();prev.disabled=i===0;next.disabled=false;next.textContent=i===stages.length-1?'Tanca la ronda':'Següent';stage.textContent='Targeta '+(i+1)+' de '+stages.length;line.textContent=stages[i];say(out,'')}
  show();return cancel;
 },
 suport(h,[names,total,why]){
  const groups=cut(names), picked=groups.map(()=>0),host=panel(h),out=live(h);
  const controls=groups.map((item,i)=>{
   const line=add(host,make('div',null,'course-counter'));add(line,make('span',item));const down=b(line,'−',()=>{picked[i]--;refresh()});down.setAttribute('aria-label','Treu una fitxa de '+item);
   const val=add(line,make('output'));const up=b(line,'+',()=>{picked[i]++;refresh()});up.setAttribute('aria-label','Dona una fitxa a '+item);return [down,val,up];
  });
  const totalLeft=()=>total-picked.reduce((s,n)=>s+n,0);
  const row=buttons(h);b(row,'Reinicia el repartiment',()=>{picked.fill(0);refresh()});
  function refresh(){controls.forEach(([down,val,up],i)=>{down.disabled=picked[i]<1;val.value=picked[i];up.disabled=totalLeft()<1});say(out,totalLeft()?'Queden '+totalLeft()+' fitxes per repartir.':'Repartiment complet. Ara compareu-lo amb una altra opció.',totalLeft()?'':'ok')}
  disclosure(h,'Preguntes per al grup',why);refresh();
 }
};
function galleryScene(theme,sceneClass=''){
 const p=make('div',null,'course-town '+theme+' '+sceneClass);
 const scene=add(p,make('div',null,'course-panorama'));scene.setAttribute('aria-hidden','true');
 for(const [cls,txt] of [['sky','✦'],['house','⌂'],['tree','🌲'],['kid','🧒'],['adult','🧓'],['gift','🎁']]){
  scene.append(make('span',txt,'course-scene-'+cls));
 }
 p.setAttribute('role','img');p.setAttribute('aria-label','Una criatura es troba amb una àvia al costat d’un avet i d’una casa. Entre totes dues hi ha un regal.');
 return p;
}
mechanics.taller=(h,[mode,labelSpec,hint])=>{
 const labels=cut(labelSpec), out=live(h), row=buttons(h);
 if(['bola','mirall','triangles'].includes(mode)){
  const content=panel(h), size=mode==='mirall'?8:4, squares=[];let chosen=1,rotation=0;
  const grid=add(content,make('div',null,'course-pixel '+mode));grid.style.setProperty('--cols',size);
  const palette=labels.map((l,i)=>b(row,l,()=>{chosen=i+1;palette.forEach((p,j)=>toggle(p,j===i))}));
  toggle(palette[0],true);
  if(mode==='triangles')b(row,'Gira la peça nova',()=>{rotation=(rotation+90)%360;say(out,'Orientació de la peça: '+rotation+'°.')});
  const fill=(x,y,style,angle)=>{const p=squares[y*size+x];p.dataset.pattern=String(style);p.style.setProperty('--angle',angle+'deg')};
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
   const can=mode!=='mirall'||(x<4&&y<4), p=b(grid,'',()=>{
    if(!can)return;const v=p.dataset.pattern===String(chosen)&&p.style.getPropertyValue('--angle')===rotation+'deg'?0:chosen;
    fill(x,y,v,rotation);
    if(mode==='mirall'){fill(size-1-x,y,v,rotation);fill(x,size-1-y,v,rotation);fill(size-1-x,size-1-y,v,rotation)}
    say(out,v?'Peça marcada.':'Peça retirada.');
   },'course-paint');p.disabled=!can;p.setAttribute('aria-label','Fila '+(y+1)+', columna '+(x+1));p.dataset.pattern='0';squares.push(p);
  }
  b(row,'Esborra el dibuix',()=>{squares.forEach(p=>p.dataset.pattern='0');say(out,'Dibuix esborrat.')});
 }else if(mode==='dues'){
  const list=panel(h);list.classList.add('course-piles');
  for(const [i,part] of ['Escena 1','Escena 2'].entries()){
   const wrapper=add(list,make('div',null,'course-tile'));
   add(wrapper,make('p',part,'course-kicker'));const art=add(wrapper,galleryScene('theme-day','simple'));
   const choices=buttons(wrapper);
   const picks=labels.map((l,k)=>b(choices,l,()=>{art.className='course-town simple '+['theme-day','theme-evening','theme-night'][k];picks.forEach((p,j)=>toggle(p,j===k));say(out,part+': '+l.toLowerCase()+'.')}));
   toggle(picks[0],true);
  }
 }else if(mode==='cartell'){
  const fields=panel(h), title=add(fields,make('input')), date=add(fields,make('input'));
  title.placeholder='Títol del cartell';title.setAttribute('aria-label','Títol del cartell');title.maxLength=45;title.value=labels[0];
  date.placeholder='Data o lloc';date.setAttribute('aria-label','Data o lloc');date.maxLength=34;date.value='18 de desembre';
  let pic=0,far=false;const icons=['🎶','🌲','✦'];const poster=add(h,make('div',null,'course-poster'));
  const text=add(poster,make('strong')), icon=add(poster,make('span')), when=add(poster,make('small'));
  function show(){text.textContent=title.value;icon.textContent=icons[pic];when.textContent=date.value;poster.classList.toggle('far',far)}
  title.oninput=show;date.oninput=show;
  b(row,'Canvia la imatge',()=>{pic=(pic+1)%icons.length;show()});
  const size=b(row,'Mira de lluny',()=>{far=!far;size.textContent=far?'Mira de prop':'Mira de lluny';show()});show();
 }else{
  const host=panel(h), frame=add(host,galleryScene('theme-evening','wide'));
  const instructions=add(host,make('p','Pla general: on passa la trobada?','course-context'));
  const options=labels.map((l,i)=>b(row,l,()=>{frame.className='course-town theme-evening '+['wide','closer','closest'][i];
   frame.setAttribute('aria-label',[
    'Pla general: la casa, l’avet i dues persones que es troben.',
    'Pla mitjà: una criatura i una àvia es miren mentre sostenen una capsa.',
    'Pla detall: una capsa amb un llaç daurat que comparteixen.'][i]);options.forEach((n,j)=>toggle(n,j===i));instructions.textContent=['Pla general: on passa la trobada?','Pla mitjà: com es miren els personatges?','Pla detall: quin objecte explica el que està passant?'][i];
  }));
  toggle(options[0],true);
 }
 disclosure(h,'En què ens fixem?',hint);
};
let selected=0, finished=null, artMap, source;
const backup=new Map();
const done=()=>{try{return JSON.parse(localStorage.getItem('advent-course-done-v1')||'{}')||{}}catch{return {}}};
function mark(id,on){
 const record=done();on?record[id]=true:delete record[id];
 try{localStorage.setItem('advent-course-done-v1',JSON.stringify(record))}catch{}
 backup.set(id,on);
}
function has(id){return backup.has(id)?backup.get(id):done()[id]===true}
function gradeList(){
 const host=el('courseList');host.replaceChildren();el('courseGradeTitle').textContent=GRADES[selected]+' de primària';
 el('courseGradeTitle').setAttribute('tabindex','-1');
 const grid=el('courseCycles');for(const hit of grid.querySelectorAll('[data-grade]'))toggle(hit,Number(hit.dataset.grade)===selected);
 source[selected].forEach(([title,type,task],i)=>{
  const id=(selected+1)+'-'+i, card=add(host,make('article',null,'course-index-card'));
  card.append(make('div',MARK[i]+' '+AREA[i],'course-kicker'),make('h4',title),make('p',BADGE[type]+(has(id)?' · ✓ Feta':''),'course-type'));
  const btn=b(card,'Obre la prova',()=>openLesson(selected,i));btn.setAttribute('aria-label','Obre la prova: '+title);
 });
}
function openLesson(grade,i){
 const [title,key,task,...resource]=source[grade][i], id=(grade+1)+'-'+i;
 stop();finished?.();finished=null;
 el('courseLessonTitle').textContent=title;el('courseLessonLabel').textContent=GRADES[grade]+' · '+AREA[i]+' · '+BADGE[key];
 const body=el('courseLessonBody');body.replaceChildren(make('p',task,'course-intro'));
 finished=mechanics[key](body,resource,id)||null;
 const status=el('courseDone');
 const update=()=>{let on=has(id);status.textContent=on?'✓ Feta · desmarca':'Marca com a feta';toggle(status,on)};
 status.onclick=()=>{mark(id,!has(id));update();gradeList()};
 update();el('courseLesson').showModal();el('courseLesson').scrollTop=0;
}
function init(data,art){
 source=data;artMap=art;
 const modal=el('courseHub');if(!modal)return;
 el('courseCover').src=artMap.sky;
 const cycleBox=el('courseCycles');
 GROUP.forEach((group,g)=>{
  const wrap=add(cycleBox,make('div',null,'course-cycle'));
  add(wrap,make('h3',group));
  const row=buttons(wrap);
  for(let i=0;i<2;i++){const j=g*2+i, p=b(row,GRADES[j],()=>{selected=j;gradeList();if(matchMedia('(max-width:620px)').matches)el('courseGradeTitle').scrollIntoView({block:'nearest'})});p.dataset.grade=j;p.setAttribute('aria-label',GRADES[j]+' de primària')}
 });
 const launch=()=>{if(!modal.open){gradeList();modal.showModal();modal.scrollTop=0}};
 const follow=()=>{if(location.hash==='#cicles')launch()};
 el('openCourses').onclick=launch;el('settingsCourses').onclick=launch;
 el('closeCourses').onclick=()=>modal.close();el('closeCourseLesson').onclick=()=>el('courseLesson').close();
 el('courseLesson').addEventListener('close',()=>{stop();finished?.();finished=null;const host=el('courseLessonBody');host.querySelectorAll('audio,video').forEach(v=>v.pause())});
 modal.addEventListener('close',()=>{if(location.hash==='#cicles'){const url=new URL(location.href);url.hash='';try{history.replaceState(null,'',url.href)}catch{}}});
 addEventListener('hashchange',follow);follow();
}
return {init};
})();
