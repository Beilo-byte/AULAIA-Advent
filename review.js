'use strict';
window.ADVENT_REVIEW=(()=>{
 const $=id=>document.getElementById(id),key='advent-aula-observacions-v1',format='advent-aula-observacions',cap=200,limit=4000;
 let notes=[],target=null,editing=null,pending=null,back=null,transient=false;
 const ele=(tag,text,cls)=>{const x=document.createElement(tag); if(text!=null)x.textContent=text;if(cls)x.className=cls;return x};
 const msg=t=>{$('reviewStatus').textContent=t;$('reviewSettingsStatus').textContent=t};
 const clip=(v,max)=>typeof v==='string'?v.trim().slice(0,max):'';
 const id=()=>crypto.randomUUID?.()||Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);
 const label=n=>[n.date?n.date.split('-').reverse().join('/'):(n.activity?'Repertori':'Aplicació'),n.activityTitle||n.activity].filter(Boolean).join(' · ');
 function sanitized(x){
  if(!x||typeof x!=='object'||typeof x.note!=='string'||!x.note.trim()||x.note.length>limit||typeof x.id!=='string'||!/^[a-z0-9_-]{1,90}$/i.test(x.id))throw Error('Hi ha una observació buida o no vàlida.');
  return {id:x.id,date:typeof x.date==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(x.date)?x.date:null,
    prompt:clip(x.prompt,500),activity:clip(x.activity,70),activityTitle:clip(x.activityTitle,160),scene:clip(x.scene,80),
    note:x.note.trim(),createdAt:clip(x.createdAt,40),updatedAt:clip(x.updatedAt,40)};
 }
 function save(){try{localStorage.setItem(key,JSON.stringify(notes));transient=false;return true}catch{transient=true;return false}}
 function persist(message){msg(message+(save()?'':' El navegador no pot desar les notes. No tanquis el fitxer sense descarregar-ne el JSON.'))}
 function counters(){
  $('reviewCount').textContent=notes.length===1?'1 observació':notes.length+' observacions';
  for(const i of ['reviewJSON','reviewPDF'])$(i).disabled=!notes.length;
 }
 function paint(){
  const list=$('reviewList');list.replaceChildren();const n=notes.slice().reverse();
  if(!n.length)list.append(ele('p','Encara no hi ha cap observació.','review-muted'));
  for(const x of n){
   const item=ele('article',null,'review-entry'),h=ele('h3',label(x)),t=ele('p',x.note,'review-note');
   item.append(h);if(x.prompt)item.append(ele('p',x.prompt,'review-muted'));
   const row=ele('div',null,'review-row'),a=ele('button','Edita'),b=ele('button','Suprimeix');a.type=b.type='button';
   a.setAttribute('aria-label','Edita: '+label(x));b.setAttribute('aria-label','Suprimeix: '+label(x));
   a.onclick=()=>{if(!discard())return;start(x,x);$('reviewText').focus()};
   b.onclick=()=>{if(!confirm('Vols suprimir aquesta observació del dispositiu?'))return;notes=notes.filter(n=>n.id!==x.id);if(editing?.id===x.id)start(pending);paint();persist('Observació suprimida.')};
   row.append(a,b);item.append(t,row);list.append(item);
  }
  counters();
 }
 function track(d,a,s,t=''){target={date:d.date,prompt:d.text,activity:a,activityTitle:t,scene:s}}
 function start(ctx,record=null){
  pending=ctx||null;editing=record;$('reviewContext').textContent=label(pending||{});
  $('reviewPrompt').textContent=pending?.prompt||'Nota general sobre l’aplicació; no va lligada a cap dia.';
  $('reviewText').value=record?.note||'';$('reviewSave').textContent=record?'Desa els canvis':'Desa l’observació';
 }
 const dirty=()=>$('reviewText').value.trim()!==(editing?.note||'');
 const discard=()=>!dirty()||confirm('Hi ha text sense desar. El vols descartar?');
 function open(where){
  back=document.activeElement;
  let ctx=where==='day'&&target?{...target}:null;
  if(ctx&&$('challenge')?.open)ctx.activityTitle=$('challengeTitle').textContent;
  else if(ctx&&!ctx.activityTitle)ctx.activityTitle=$('doChallenge')?.textContent||'';
  start(ctx);paint();$('reviewStatus').textContent=transient?'Descarrega un JSON per conservar les notes.':'';
  $('reviewDialog').showModal();$('reviewText').focus();
 }
 function formatDate(){const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')}
 function download(content,mime,ext){
  const u=URL.createObjectURL(new Blob([content],{type:mime})),a=ele('a');a.href=u;a.download='advent-observacions-'+formatDate()+'.'+ext;
  document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),2000);
 }
 function toJSON(){
  download(JSON.stringify({format,version:1,app:'Advent a l’aula',exportedAt:new Date().toISOString(),observations:notes},null,2),'application/json','json');
  msg('JSON preparat. Pots adjuntar-lo al xat per demanar-hi totes les millores de cop.');
 }
 // A real standalone PDF. Helvetica/WinAnsi covers Catalan. All user strings
 // are emitted as bounded hexadecimal text operands, never as PDF syntax.
 function makePDF(){
  const W=595,H=842,left=48,right=48,top=55,bottom=55,lang=new TextEncoder();
  const can=document.createElement('canvas').getContext('2d');
  const ansi='€\u0081‚ƒ„…†‡ˆ‰Š‹Œ\u008dŽ\u008f\u0090‘’“”•–—˜™š›œ\u009džŸ';
  function bytes(str){const clean=str.normalize('NFC').replace(/\r/g,'').replace(/\t/g,'  ');
   return Array.from(clean).map(ch=>{const c=ch.codePointAt(0),idx=ansi.indexOf(ch);
    return idx>=0?idx+128:c>=32&&c<=255?c:ch==='↔'?45:63;});
  }
  const hex=s=>bytes(s).map(b=>b.toString(16).padStart(2,'0')).join('');
  const pages=[];let lines=[],y;
  function op(line){lines.push(line)}
  function text(str,x,y,size,bold=false,color='.17 .22 .17'){
   op(color+' rg BT /'+(bold?'F2':'F1')+' '+size+' Tf '+x+' '+y+' Td <'+hex(str)+'> Tj ET');
  }
  function makePage(){
   if(lines.length)pages.push(lines);
   lines=[];
   text('Advent a l’aula',left,H-top,24,true,'.11 .27 .20');
   text('OBSERVACIONS DE REVISIÓ · '+formatDate(),left,H-top-24,10,true,'.39 .31 .18');
   op('.75 .68 .52 RG 1 w '+left+' '+(H-top-36)+' m '+(W-right)+' '+(H-top-36)+' l S');
   text('Pàgina '+(pages.length+1),left,31,9);
   y=H-top-58;
  }
  function wrap(s,font,bold){
   can.font=(bold?'bold ':'')+font+'px Helvetica, Arial, sans-serif';
   const max=W-left-right-8,measure=x=>can.measureText(x).width,out=[];
   for(const paragraph of s.replace(/\r/g,'').split('\n')){
    if(!paragraph.trim()){out.push('');continue}
    let line='';
    for(let word of paragraph.trim().split(/\s+/)){
     if(line&&measure(line+' '+word)>max){out.push(line);line=''}
     while(measure(word)>max){
      let chunk='',tail=Array.from(word);
      while(tail.length&&measure(chunk+tail[0])<=max)chunk+=tail.shift();
      if(!chunk){chunk=tail.shift()||''}
      out.push(chunk);word=tail.join('');
     }
     line+=(line?' ':'')+word;
    }
    if(line)out.push(line);
   }
   return out;
  }
  function paragraph(str,size,lead,bold,color){
   for(const line of wrap(str,size,bold)){
    if(y<bottom+lead)makePage();
    if(line)text(line,left,y,size,bold,color);y-=lead;
   }
  }
  makePage();paragraph(notes.length+(notes.length===1?' anotació al dossier.':' anotacions al dossier.'),10,16,false);y-=9;
  notes.forEach((n,i)=>{
   if(y<bottom+75)makePage();
   paragraph(String(i+1)+'. '+label(n),13,18,true,'.11 .27 .20');
   if(n.prompt)paragraph('Consigna: '+n.prompt,10,14,false,'.36 .31 .25');
   if(n.scene)paragraph('Escena: '+n.scene,10,14,false,'.36 .31 .25');
   y-=3;paragraph(n.note,11,15,false);y-=12;
  });
  if(lines.length)pages.push(lines);
  const objs=['<< /Type /Catalog /Pages 2 0 R >>','<< /Type /Pages /Kids ['+pages.map((_,i)=>(5+i*2)+' 0 R').join(' ')+'] /Count '+pages.length+' >>','<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>','<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>'];
  pages.forEach((pg,i)=>{const stream=pg.join('\n')+'\n';objs.push('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 '+W+' '+H+'] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents '+(6+i*2)+' 0 R >>','<< /Length '+stream.length+' >>\nstream\n'+stream+'endstream')});
  let pdf='%PDF-1.4\n',offsets=[0];
  objs.forEach((o,i)=>{offsets.push(pdf.length);pdf+=(i+1)+' 0 obj\n'+o+'\nendobj\n'});
  const cross=pdf.length;pdf+='xref\n0 '+offsets.length+'\n0000000000 65535 f \n'+offsets.slice(1).map(n=>String(n).padStart(10,'0')+' 00000 n \n').join('')+'trailer\n<< /Size '+offsets.length+' /Root 1 0 R >>\nstartxref\n'+cross+'\n%%EOF\n';
  return lang.encode(pdf);
 }
 async function load(ev){
  const f=ev.target.files?.[0];if(!f)return;
  try{
   if(!/\.json$/i.test(f.name))throw Error('Només es poden carregar observacions en JSON (.json). El PDF és només per llegir o imprimir.');
   if(f.size>2000000)throw Error('El fitxer supera els 2 MB.');
   const x=JSON.parse((await f.text()).replace(/^\uFEFF/,''));
   if(x?.format!==format||x.version!==1||!Array.isArray(x.observations)||x.observations.length>cap)throw Error('Tria un JSON exportat a «Descarregar observacions». El JSON del calendari no serveix aquí.');
   const incoming=x.observations.map(sanitized);
   if(!discard()){msg('Importació cancel·lada.');return}
   const merged=new Map(notes.map(m=>[m.id,m]));let count=0;
   for(const note of incoming){const old=merged.get(note.id);if(!old){merged.set(note.id,note);count++}else if((note.updatedAt||note.createdAt)>(old.updatedAt||old.createdAt)){merged.set(note.id,note);count++}}
   if(merged.size>cap)throw Error('Hi ha massa notes. Descarrega un JSON de còpia abans d’esborrar observacions antigues.');
   notes=[...merged.values()];start(pending);paint();persist(count?('Observacions incorporades o actualitzades: '+count+'. Les altres s’han conservat.'):'No hi ha observacions noves. Les existents s’han conservat.');
  }catch(e){msg(e instanceof SyntaxError?'El fitxer no conté un JSON vàlid.':e.message)}
  finally{ev.target.value=''}
 }
 function init(){
  try{const old=JSON.parse(localStorage.getItem(key));if(Array.isArray(old))notes=old.slice(0,cap).map(sanitized)}catch{}
  $('reviewCorner').onclick=()=>open('global');$('reviewDay').onclick=$('reviewGame').onclick=()=>open('day');
  $('reviewManage').onclick=()=>open('global');
  $('reviewClose').onclick=()=>{if(discard())$('reviewDialog').close()};
  $('reviewDialog').addEventListener('cancel',e=>{if(!discard())e.preventDefault()});
  $('reviewDialog').addEventListener('close',()=>back?.focus({preventScroll:true}));
  $('reviewReset').onclick=()=>{if(discard()){start(pending);$('reviewText').focus()}};
  $('reviewForm').addEventListener('submit',e=>{
   e.preventDefault();const note=$('reviewText').value.trim();if(!note)return msg('Escriu una observació abans de desar-la.');
   if(!editing&&notes.length>=cap)return msg('Has arribat a 200 notes. Exporta un JSON i deixa espai per a les noves.');
   const at=new Date().toISOString(),c=pending||{},record={id:editing?.id||id(),date:c.date||null,prompt:c.prompt||'',activity:c.activity||'',activityTitle:c.activityTitle||'',scene:c.scene||'',note,createdAt:editing?.createdAt||at,updatedAt:at};
   if(editing)notes=notes.map(n=>n.id===editing.id?record:n);else notes.push(record);
   start(pending);paint();persist('Observació desada.');
  });
  $('reviewJSON').onclick=toJSON;$('reviewPDF').onclick=()=>{download(makePDF(),'application/pdf','pdf');msg('PDF preparat. Per tornar a carregar les notes, descarrega el JSON.')};
  $('reviewLoad').onclick=()=>$('reviewFile').click();$('reviewFile').onchange=load;
  counters();
 }
 return {init,track};
})();
