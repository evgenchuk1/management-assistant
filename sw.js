const CACHE='mgmt-v16';
const ASSETS=['./','./index.html','./manifest.json','./data-snapshot.js','./et-mark.png','./et-logo.jpg','./icon-192.png','./apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))));self.clients.claim();});
// קודם רשת (נתונים טריים), ואם אין אינטרנט — מהמטמון
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=='GET'||u.origin!==location.origin)return;
  if(u.pathname.endsWith('.mp4'))return; // סרטון: ישירות מהרשת (בקשות טווח, לא נשמר במטמון)
  e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(CACHE).then(x=>x.put(e.request,c));return r;}).catch(()=>caches.match(e.request)));
});
// התראת בוקר 07:00 (נשלחת מ-expiry-notify/send_ma_daily.py)
self.addEventListener('push',e=>{
  let d={};try{d=e.data?e.data.json():{}}catch{d={body:e.data&&e.data.text()}}
  e.waitUntil(self.registration.showNotification(d.title||'ניהול +',{body:d.body||'ניהול+ מזמין אותך לעבור על הסקירה היומית.',
    icon:'icon-192.png',badge:'icon-192.png',tag:d.tag||'ma-daily',data:{url:d.url||'./?screen=rikuz'},lang:'he',dir:'rtl'}));
});
self.addEventListener('notificationclick',e=>{
  e.notification.close();const url=new URL(e.notification.data&&e.notification.data.url||'./?screen=rikuz',self.registration.scope).href;
  e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(ws=>{
    for(const w of ws){if('focus' in w){w.navigate(url);return w.focus()}}return clients.openWindow(url)}));
});
