'use strict';
const CACHE='advent-aula-static-pages-v5.3';
const assets=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./reptes.css','./reptes-data.js','./gifts-data.js','./reptes.js','./review.js','./review.css','./perfil-manlleu.json',...['bakery','tio','sky','origami','snow','card','chalet','door','doors','envelope','gift-brick','gift-red','gifts','orb-gold','orb-red','pocket-green','pocket-red','postal','quilt','sock-green','sock-red','socks','tree','village'].map(n=>'./assets/'+n+'.webp')];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(assets)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('advent-aula-static-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
async function cached(request){
 const c=await caches.open(CACHE),hit=await c.match(request.url),range=request.headers.get('Range');
 if(!hit)return fetch(request);
 if(!range)return hit;
 const m=/^bytes=(\d*)-(\d*)$/.exec(range);if(!m||(!m[1]&&!m[2]))return fetch(request);
 const body=await hit.arrayBuffer(),size=body.byteLength;
 const start=m[1]?Number(m[1]):Math.max(0,size-Number(m[2]));
 const end=m[1]&&m[2]?Math.min(Number(m[2]),size-1):size-1;
 if(start>=size||end<start)return new Response(null,{status:416,headers:{'Content-Range':'bytes */'+size}});
 return new Response(body.slice(start,end+1),{status:206,headers:{'Content-Range':'bytes '+start+'-'+end+'/'+size,'Content-Length':String(end-start+1),'Content-Type':hit.headers.get('Content-Type')||'audio/mpeg','Accept-Ranges':'bytes'}});
}
self.addEventListener('fetch',event=>{
 const req=event.request;if(req.method!=='GET'||!req.url.startsWith(self.registration.scope))return;
 event.respondWith(req.mode==='navigate'?fetch(req).catch(()=>caches.open(CACHE).then(c=>c.match('./index.html'))):cached(req));
});
