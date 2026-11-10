const CACHE = "financas-alif-v6";
const ASSETS = ["./", "./index.html", "./manifest.json", "./icons/icon-192.png", "./icons/icon-512.png"];

self.addEventListener("install", function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(ASSETS); }));
  self.skipWaiting();
});

self.addEventListener("activate", function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); }));
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", function(e){
  e.respondWith(
    fetch(e.request).then(function(res){
      var resClone = res.clone();
      caches.open(CACHE).then(function(c){ c.put(e.request, resClone); });
      return res;
    }).catch(function(){ return caches.match(e.request); })
  );
});

/* tocar na notificação de vencimento abre (ou traz para frente) o app */
self.addEventListener("notificationclick", function(e){
  e.notification.close();
  e.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(function(lista){
      for (var i = 0; i < lista.length; i++) {
        if ("focus" in lista[i]) return lista[i].focus();
      }
      return self.clients.openWindow("./");
    })
  );
});
