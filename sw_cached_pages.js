const cacheName='v1';
const urlsToCache=[
    '/',
    'index.html',
    'css/styles.css',
    'images/logo.jpeg'
    
    
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
})
)
});


// self.addEventListener('fetch', e=>{
//     console.log('Service Worker: Fetching');
//     // respond with pauses the fetch and respond with our custom event
//     e.respondWith(
//         fetch(e.request).catch(()=>
//         // looks in cache if there is something in e.request i.e all those above assets
//         caches.match(e.request))
//         // now your app is ready for offline capability
//     )
// });
 
