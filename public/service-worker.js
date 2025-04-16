// 定义缓存版本和名称
const CACHE_VERSION = 'v1';
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
  console.log('Service Worker 正在安装...');
  
  // 预缓存指定的资源
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('缓存已打开');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        // 跳过等待，立即激活
        return self.skipWaiting();
      })
  );
});

// 激活Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker 已激活');
  
  // 清理旧版本缓存
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('清理旧缓存:', cacheName);
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

// 处理网络请求
self.addEventListener('fetch', (event) => {
  // 获取请求URL
  const requestUrl = new URL(event.request.url);
  
  // 检查是否需要强制更新（URL包含forceUpdate参数或timestamp参数）
  const forceUpdate = requestUrl.searchParams.has('forceUpdate') || 
                    requestUrl.searchParams.has('timestamp');
  
  // 如果是强制更新，则直接从网络获取
  if (forceUpdate) {
    event.respondWith(
      fetch(event.request).catch((error) => {
        console.error('强制更新获取失败:', error);
        // 如果网络请求失败，尝试从缓存获取
        return caches.match(event.request);
      })
    );
    return;
  }
  
  // 标准的缓存优先策略
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // 如果找到缓存的响应，则返回缓存
        if (response) {
          return response;
        }
        
        // 如果没有找到缓存，则从网络获取
        return fetch(event.request).then((networkResponse) => {
          // 检查是否获取成功
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }
          
          // 缓存新的响应
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });
          
          return networkResponse;
        });
      })
  );
});

// 监听消息
self.addEventListener('message', (event) => {
  if (event.data && event.data.action === 'clearCache') {
    clearCache(event);
  }
});

// 清除缓存函数
const clearCache = (event) => {
  console.log('开始清除缓存...');
  
  // 获取消息通道
  const port = event.ports && event.ports[0];
  
  // 删除并重新创建缓存
  caches.delete(CACHE_NAME)
    .then((success) => {
      if (success) {
        console.log('缓存已成功清除');
        // 重新缓存基本资源
        return caches.open(CACHE_NAME)
          .then((cache) => {
            return cache.addAll(urlsToCache);
          })
          .then(() => {
            // 如果有消息通道，发送成功消息
            if (port) {
              port.postMessage({
                action: 'cacheCleared',
                status: true
              });
            }
            return true;
          });
      } else {
        console.warn('缓存清除失败');
        if (port) {
          port.postMessage({
            action: 'cacheCleared',
            status: false,
            error: '缓存清除失败'
          });
        }
        return false;
      }
    })
    .catch((error) => {
      console.error('缓存操作错误:', error);
      if (port) {
        port.postMessage({
          action: 'cacheCleared',
          status: false,
          error: error.message
        });
      }
    });
}; 