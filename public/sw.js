importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');

if (workbox) {
    console.log(`Yay! Workbox is loaded 🎉`);

    workbox.precaching.precacheAndRoute([{"revision":"4fe04d61d303d69b143acf9fcc4c6b7b","url":"build/public/build/bundle.css"},{"revision":"801bee6e1be36d1a22736ef4c685713f","url":"global.css"},{"revision":"e04050ddbbb7902fc7e12268800a2e88","url":"leaflet/leaflet-geoman.css"},{"revision":"5c761a156eea82263d8bacf1718fe04d","url":"leaflet/leaflet.css"},{"revision":"0ec09264102a06a74dde1737dee6664f","url":"assets/favicon.png"},{"revision":"0ec09264102a06a74dde1737dee6664f","url":"assets/icon-128x128.png"},{"revision":"da9efeb89ceaecb9e36bf91818181d0d","url":"assets/icon-144x144.png"},{"revision":"3f7788816a76b9dbb25805e23d782c55","url":"assets/icon-152x152.png"},{"revision":"e1f69937617cb7cbc7f30626d0481312","url":"assets/icon-192x192.png"},{"revision":"eb7b59776b690854d5da4bc7f2db76ff","url":"assets/icon-384x384.png"},{"revision":"b1355c816a6844aaffc58c4a29abb520","url":"assets/icon-512x512.png"},{"revision":"8d66c2cfa5be159edac7248826c5cd76","url":"assets/icon-72x72.png"},{"revision":"c1866814c1512b65b495afae4096b20f","url":"assets/icon-96x96.png"},{"revision":"c64beab291de80970aa4887a5a1c9135","url":"favicon.png"},{"revision":"4f0283c6ce28e888000e978e537a6a56","url":"leaflet/images/layers-2x.png"},{"revision":"a6137456ed160d7606981aa57c559898","url":"leaflet/images/layers.png"},{"revision":"401d815dc206b8dc1b17cd0e37695975","url":"leaflet/images/marker-icon-2x.png"},{"revision":"2273e3d8ad9264b7daa5bdbf8e6b47f8","url":"leaflet/images/marker-icon.png"},{"revision":"44a526eed258222515aa21eaffd14a96","url":"leaflet/images/marker-shadow.png"},{"revision":"1caa51bc5e22f16101a47f561b6f0f5b","url":"index.html"},{"revision":"8cca81513d144791cdf39ea6fd01cf00","url":"build/bundle.js"},{"revision":"b8d115f24bbdd0150fdbb9a36415a97c","url":"leaflet/leaflet-geoman.min.js"},{"revision":"bdc41cce3cdf67606b6f461f71f80105","url":"leaflet/leaflet-src.esm.js"},{"revision":"fe75e9beac23dcbd8ed7d32ec910810e","url":"leaflet/leaflet-src.js"},{"revision":"4eaa81e6e27a89ed2410a7c39048a397","url":"leaflet/leaflet.js"},{"revision":"37e4245ccd3eb869ce2ccef2ab17dcd2","url":"manifest.json"}]);
    workbox.routing.registerRoute(
        new RegExp('https://fonts.(?:googleapis|gstatic).com/(.*)'),
        new workbox.strategies.CacheFirst({
            cacheName: 'google-fonts',
            plugins: [
                new workbox.expiration.ExpirationPlugin({
                    maxEntries: 30,
                }),
                new workbox.cacheableResponse.CacheableResponsePlugin({
                    statuses: [0, 200]
                }),
            ],
        }),
    );

} else {
    console.log(`Boo! Workbox didn't load 😬`);
}