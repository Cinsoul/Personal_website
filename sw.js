/**
 * 网站服务工作线程(Service Worker)
 * 用于管理缓存和离线功能
 */

// 缓存名称 - 更改此值将清除旧缓存
const CACHE_NAME = 'portfolio-cache-v2.2.0';

// 需要缓存的资源路径
const CACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/index.css',
  '/assets/index.js',
  '/vite.svg',
  '/images/abstract_avatar.webp',
  '/images/personal_photo.webp',
];

// 需要匹配的资源路径模式
const CACHE_PATTERNS = [
  /^\/assets\/.*\.(js|css)$/,  // 匹配所有assets目录下的JS和CSS文件
  /^\/images\/.*\.(jpg|jpeg|png|gif|webp|svg)$/  // 匹配所有images目录下的图片
];

// 安装事件：预缓存资源
self.addEventListener('install', (event) => {
  console.log('[Service Worker] 安装中...');

  // 立即激活不等待其他SW终止
  self.skipWaiting();

  // 缓存指定的静态资源
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] 预缓存资源中...');
        return cache.addAll(CACHE_URLS)
          .catch((err) => {
            console.error('[Service Worker] 预缓存资源失败:', err);
            // 即使预缓存失败，也继续安装过程
            return Promise.resolve();
          });
      })
      .catch((err) => {
        console.error('[Service Worker] 打开缓存失败:', err);
      })
  );
});

// 激活事件：清理旧缓存
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] 激活中...');

  // 清理旧版本缓存
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('[Service Worker] 删除旧缓存:', cacheName);
              return caches.delete(cacheName);
            }
            return Promise.resolve();
          })
        );
      })
      .then(() => {
        console.log('[Service Worker] 现在控制客户端');
        // 立即控制所有客户端页面
        return self.clients.claim();
      })
      .catch((err) => {
        console.error('[Service Worker] 激活过程中出错:', err);
      })
  );
});

// 检查URL是否应该被缓存
const shouldCache = (url) => {
  const urlObj = new URL(url, self.location.origin);
  const path = urlObj.pathname;
  
  // 检查是否在CACHE_URLS列表中
  if (CACHE_URLS.includes(path)) {
    return true;
  }
  
  // 检查是否匹配模式
  return CACHE_PATTERNS.some(pattern => pattern.test(path));
};

// 处理静态资源请求
const handleStaticResourceRequest = (request) => {
  return caches.match(request)
    .then((cacheResponse) => {
      // 如果缓存中存在响应，返回缓存
      if (cacheResponse) {
        return cacheResponse;
      }

      // 没有缓存，进行网络请求
      return fetch(request.clone())
        .then((response) => {
          // 检查响应是否有效且为GET请求
          if (!response || response.status !== 200 || request.method !== 'GET') {
            return response;
          }

          // 将响应添加到缓存
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(request, responseToCache);
            })
            .catch((err) => {
              console.error('[Service Worker] 缓存响应失败:', err);
            });

          return response;
        })
        .catch((err) => {
          console.error('[Service Worker] 网络请求失败:', err.message);
          
          // 如果是导航请求，返回离线页面
          if (request.mode === 'navigate') {
            return caches.match('/index.html')
              .catch(() => {
                return new Response('网络连接不可用，无法加载内容。', {
                  status: 503,
                  statusText: 'Service Unavailable',
                  headers: new Headers({
                    'Content-Type': 'text/plain'
                  })
                });
              });
          }
          
          // 其他请求，失败处理
          return new Response('资源加载失败，请检查网络连接。', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
              'Content-Type': 'text/plain'
            })
          });
        });
    });
};

// 处理图片请求
const handleImageRequest = (request) => {
  // 尝试从缓存中获取
  return caches.match(request)
    .then((cacheResponse) => {
      // 如果缓存中存在响应，返回缓存
      if (cacheResponse) {
        return cacheResponse;
      }
      
      // 没有缓存，进行网络请求
      return fetch(request.clone())
        .then((response) => {
          // 检查响应是否有效
          if (!response || response.status !== 200 || request.method !== 'GET') {
            return response;
          }
          
          // 将响应添加到缓存
          try {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(request, responseToCache);
              })
              .catch((err) => {
                console.error('[Service Worker] 缓存图片失败:', err);
              });
          } catch (err) {
            console.error('[Service Worker] 处理图片缓存时出错:', err);
          }
          
          return response;
        })
        .catch((err) => {
          console.error('[Service Worker] 图片加载失败:', err.message);
          // 失败时返回默认图片或错误响应
          return caches.match('/vite.svg')
            .then((fallbackResponse) => {
              if (fallbackResponse) {
                return fallbackResponse;
              }
              
              // 如果连默认图片也无法获取，返回错误响应
              return new Response('图片加载失败', {
                status: 404,
                headers: new Headers({
                  'Content-Type': 'text/plain'
                })
              });
            });
        });
    });
};

// 处理所有请求
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // 忽略Chrome扩展请求和非标准请求
  if (
    !url.protocol.startsWith('http') || 
    url.href.includes('chrome-extension')
  ) {
    return;
  }
  
  // 根据请求类型采用不同策略
  if (event.request.url.match(/\.(jpg|jpeg|png|gif|webp|svg|ico)$/i)) {
    // 图片资源：缓存优先，同时更新缓存
    event.respondWith(handleImageRequest(event.request));
  } else if (shouldCache(url.pathname)) {
    // 需要缓存的资源：使用缓存优先策略
    event.respondWith(handleStaticResourceRequest(event.request));
  } else {
    // 其他资源：网络优先
    event.respondWith(
      fetch(event.request)
        .catch((err) => {
          console.warn('[Service Worker] 网络请求失败，尝试从缓存获取:', url.pathname);
          return caches.match(event.request);
        })
    );
  }
});

// 消息处理
self.addEventListener('message', (event) => {
  console.log('[Service Worker] 收到消息:', event.data);

  if (event.data && event.data.action === 'clearCache') {
    // 创建一个用于回复的端口
    const port = event.ports[0];
    
    // 清除所有缓存
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            console.log('[Service Worker] 删除缓存:', cacheName);
            return caches.delete(cacheName);
          })
        );
      })
      .then(() => {
        console.log('[Service Worker] 所有缓存已清除');
        
        // 重新添加基本缓存
        return caches.open(CACHE_NAME)
          .then((cache) => {
            // 只缓存最基本的文件
            return cache.addAll([
              '/',
              '/index.html',
              '/vite.svg'
            ]);
          });
      })
      .then(() => {
        // 发送成功消息
        if (port) {
          port.postMessage({
            action: 'cacheCleared',
            status: true
          });
        }
      })
      .catch((err) => {
        console.error('[Service Worker] 清除缓存失败:', err);
        
        // 发送失败消息
        if (port) {
          port.postMessage({
            action: 'cacheCleared',
            status: false,
            error: err.message
          });
        }
      });
  } else if (event.data && event.data.action === 'skipWaiting') {
    // 立即激活Service Worker
    self.skipWaiting();
  }
});

// 定期自检
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'cache-update') {
    console.log('[Service Worker] 执行定期缓存更新');
    event.waitUntil(
      caches.open(CACHE_NAME)
        .then((cache) => {
          // 更新关键资源
          return cache.addAll([
            '/',
            '/index.html'
          ]);
        })
        .catch((err) => {
          console.error('[Service Worker] 定期缓存更新失败:', err);
        })
    );
  }
});

console.log('[Service Worker] 脚本已加载'); 