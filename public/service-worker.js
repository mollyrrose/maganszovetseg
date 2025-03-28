//public/service-worker.js

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Intercept Nominatim API requests
  if (url.hostname === 'nominatim.openstreetmap.org') {
    event.respondWith(
      fetch(event.request, {
        headers: {
          ...event.request.headers,
          'X-Forwarded-For': event.clientId, // Pass the user's IP address
        },
      })
    );
  } else {
    event.respondWith(fetch(event.request));
  }
});