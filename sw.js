/* Offline support: network first, falls back to the saved copy, then to offline.html */
var V="ng-v3",SHELL=["./","index.html","offline.html","404.html","manifest.webmanifest","css/styles.css","css/account.css","js/config.js","js/data.js","js/app.js","js/backend.mock.js","js/backend.js","js/account.js"];
self.addEventListener("install",function(e){e.waitUntil(caches.open(V).then(function(c){return Promise.all(SHELL.map(function(u){return c.add(u).catch(function(){})}))}).then(function(){return self.skipWaiting()}))});
self.addEventListener("activate",function(e){e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return k!==V}).map(function(k){return caches.delete(k)}))}).then(function(){return self.clients.claim()}))});
self.addEventListener("fetch",function(e){
  var r=e.request;if(r.method!=="GET"||new URL(r.url).origin!==location.origin)return;
  e.respondWith(fetch(r).then(function(res){if(res.ok){var cp=res.clone();caches.open(V).then(function(c){c.put(r,cp)})}return res})
    .catch(function(){return caches.match(r).then(function(m){return m||(r.mode==="navigate"?caches.match("index.html").then(function(i){return i||caches.match("offline.html")}):Response.error())})}));
});
