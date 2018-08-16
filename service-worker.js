self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.open('db_designer').then((cache) => {
      return cache.match(event.request).then((response) => {
        return response || fetch(event.request).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
      });
    })
  );
});

self.addEventListener('install', (event) => {
  console.log('install callback');
});

self.addEventListener('beforeinstallprompt', (event) => {
  console.log('beforeinstallprompt');
});

self.addEventListener('appinstalled', (event) => {
  console.log('appinstalled');
});

self.addEventListener('activate', (event) => {
  console.log('activate');
});
