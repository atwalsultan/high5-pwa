const cacheName='v3';
const urlsToCache=[
    '/',
   '/fallback.html',
   'css/styles.css',
   'videos/animation-offline.mp4'
   
    
];

self.addEventListener('install', (e)=>{
    console.log('install done');
    e.waitUntil(
        caches.open(cacheName)
        .then(cache =>{
         console.log('caching', cache)
          return  cache.addAll(urlsToCache);
        }).then(()=>{ self.skipWaiting()})
        );
});



self.addEventListener('activate', (e)=>{
console.log("event fired: ", e.type);
e.waitUntil(
    caches.keys().then(keyList =>{
        return Promise.all(
            keyList.map(cache=>{
           if(cache !== cacheName){
               return caches.delete(cache)
           }
        })
        );
    })
    );
  });
  

// cache first strategy
self.addEventListener('fetch', ( event ) => {
    console.log(event.type)
    console.log(`SW: Fetch handler`, event.request.url );
event.respondWith(caches.match( event.request ).then( ( response ) => { 
    return response ||  fetch( event.request ); 
}).catch(()=> caches.match('fallback.html'))
)
});


