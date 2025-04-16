// 缓存版本号 - 修改此值将触发更新
const CACHE_VERSION = 'v1.3';
const CACHE_NAME = `personal-website-cache-${CACHE_VERSION}`;

// 需要缓存的资源列表
const urlsToCache = [
  '/',
  '/index.html',
  '/vite.svg',
  '/images/abstract-avatar.png', 
  '/images/personal-photo.png'
];

// 安装Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('打开缓存');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        // 强制激活新的Service Worker
        return self.skipWaiting();
      })
  );
});

// 激活Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // 删除旧版本缓存
          if (cacheName !== CACHE_NAME) {
            console.log('删除旧缓存:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // 立即接管所有页面
      return self.clients.claim();
    })
  );
});

// 处理资源请求
self.addEventListener('fetch', (event) => {
  // 忽略非GET请求
  if (event.request.method !== 'GET') return;
  
  const requestUrl = new URL(event.request.url);
  
  // 忽略chrome-extension请求
  if (requestUrl.protocol === 'chrome-extension:') return;
  
  // 检查是否需要强制刷新
  const forceRefresh = requestUrl.searchParams.has('force_refresh');
  
  // 如果URL包含禁止缓存的参数，直接从网络获取
  if (requestUrl.searchParams.has('no_cache') || forceRefresh) {
    event.respondWith(
      fetch(event.request).catch(error => {
        console.error('获取资源失败:', error);
        return caches.match(event.request);
      })
    );
    return;
  }
  
  // 对于图片资源，优先从网络获取，失败时从缓存获取
  if (event.request.url.match(/\.(jpg|jpeg|png|gif|svg)(\?.*)?$/)) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // 克隆响应并缓存
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          // 网络获取失败时从缓存获取
          return caches.match(event.request);
        })
    );
    return;
  }
  
  // 标准的缓存优先策略
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // 如果找到缓存响应，则返回
        if (response) {
          return response;
        }
        
        // 否则从网络获取
        return fetch(event.request).then(
          (response) => {
            // 检查响应是否有效
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // 克隆响应
            const responseToCache = response.clone();
            
            // 打开缓存并存储响应
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          }
        );
      })
  );
});

// 监听消息
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          return caches.delete(cacheName);
        })
      ).then(() => {
        // 通知客户端缓存已清除
        event.ports[0].postMessage({ result: 'SUCCESS' });
      });
    });
  }
}); 