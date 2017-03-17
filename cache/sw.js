// 缓存版本号，用于更新缓存
const cacheKay = 'v4';

// install事件，初次安装或者更新时会触发
self.addEventListener('install', event =>
  event.waitUntil(
    // 在安装事件完成前，添加需要缓存的资源
    caches.open(cacheKay).then(cache =>
      cache.addAll([
        '/app.js',
        '/style.css',
        '/icon.jpg'
      ])
      // 跳过waiting阶段，直接触发activate事件，否则要等到页面关闭才会触发(这样会使得在重新打开页面前，安装的sw无法生效)
    ).then(() => self.skipWaiting())
  )
);

// fetch事件，除初次安装激活之前，所有请求都会触发
self.addEventListener('fetch', event => {
  event.respondWith(
    // 截获请求，匹配缓存资源
    caches.match(event.request).then(response => {
      // 匹配成功，返回缓存资源
      if (response) {
        return response;
      }
      // 匹配失败，通过网络请求获取
      return fetch(event.request.url).then(response => {
        if (!/^chrome-extension/.test(event.request.url)) {
          // 非chrome-extension资源时，讲请求获取的资源也缓存起来
          return caches.open(cacheKay).then(cache => {
            // 因为请求和响应流只能被读取一次，所以要克隆一份缓存起来，原始的会继续返回给浏览器
            cache.put(event.request, response.clone());
            return response;
          });
        } else {
          return response;
        }
      });
      // 当没有匹配到缓存，网络请求也出错(如网络不可用)时，展示回退图片
    }).catch(() => caches.match('/icon.png'))
  )
});

// activate事件，初次安装之后或关闭页面之前会触发
self.addEventListener('activate', event =>
  event.waitUntil(
    // 更新缓存，删除老的缓存
    caches.keys().then(function(keyList) {
      return Promise.all(keyList.map(function(key) {
        if (key !== cacheKay) {
          return caches.delete(key);
        }
        // 初次安装激活后，sw并没有立刻获得页面的控制权，需刷新来获得控制权，调用claim以立刻获得控制权(后续更新会立即获得控制权而无需刷新)
      })).then(() => self.clients.claim())
    })
  )
);
