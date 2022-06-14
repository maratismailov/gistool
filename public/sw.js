importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');

if (workbox) {
    console.log(`Yay! Workbox is loaded 🎉`);

    workbox.precaching.precacheAndRoute([{"revision":"f51a4273e541f5bfdb77be37fd4fed69","url":"build/bundle.css"},{"revision":"e79f7a24e68b9543b951912763fe0a38","url":"global.css"},{"revision":"9fdb6918414643761e1b50a30fd6a5cd","url":"assets/android-chrome-192x192.png"},{"revision":"7dcd9d278bcee48a613d8d213f240761","url":"assets/android-chrome-512x512.png"},{"revision":"d8f3429546afd43dbf436d405148ab52","url":"assets/apple-touch-icon.png"},{"revision":"26b8da8b9e2c686d95b01469f6e9354e","url":"assets/favicon-16x16.png"},{"revision":"b5606d43f3177bf1a13e8192ea684178","url":"assets/favicon-32x32.png"},{"revision":"1876e54b8b83609263df486db3ffd9b3","url":"assets/mstile-150x150.png"},{"revision":"c64beab291de80970aa4887a5a1c9135","url":"favicon.png"},{"revision":"0a9dec80a0209f208c87b018b9034a3b","url":"assets/safari-pinned-tab.svg"},{"revision":"493aabe8d6e99aa7d0f1a44bca9ec831","url":"index.html"},{"revision":"1b6313cba771a40512a1993260f45667","url":"build/bundle.js"}]);
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