/**
 * 内容更新工具函数
 * 用于强制刷新页面内容、清理缓存等操作
 */

/**
 * 浏览器环境检查
 * @returns 是否在浏览器环境中运行
 */
const isBrowser = () => {
  return typeof window !== 'undefined' && typeof navigator !== 'undefined';
};

/**
 * 检查环境是否支持浏览器API
 * @returns 是否在浏览器环境中运行
 */
export const isBrowserEnvironment = (): boolean => {
  return typeof window !== 'undefined' 
    && typeof navigator !== 'undefined'
    && typeof document !== 'undefined';
};

/**
 * 检查浏览器是否支持Service Worker
 * @returns 是否支持Service Worker
 */
export const isServiceWorkerSupported = (): boolean => {
  if (!isBrowserEnvironment()) return false;
  return 'serviceWorker' in navigator;
};

/**
 * 检查浏览器是否支持Cache API
 * @returns 是否支持Cache API
 */
export const isCacheApiSupported = (): boolean => {
  if (!isBrowserEnvironment()) return false;
  return 'caches' in window;
};

/**
 * 清除本地存储
 */
export const clearLocalStorage = (): void => {
  if (!isBrowserEnvironment()) return;
  
  try {
    localStorage.clear();
    console.log('本地存储已清除');
  } catch (error) {
    console.error('清除本地存储失败:', error);
  }
};

/**
 * 清除会话存储
 */
export const clearSessionStorage = (): void => {
  if (!isBrowserEnvironment()) return;
  
  try {
    sessionStorage.clear();
    console.log('会话存储已清除');
  } catch (error) {
    console.error('清除会话存储失败:', error);
  }
};

/**
 * 清除所有Cookie
 */
export const clearCookies = (): void => {
  if (!isBrowserEnvironment()) return;
  
  try {
    const cookies = document.cookie.split(';');
    
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i];
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    }
    console.log('Cookies已清除');
  } catch (error) {
    console.error('清除Cookies失败:', error);
  }
};

/**
 * 直接使用Cache API清除缓存
 * 注意：这只能清除同源的缓存
 */
export const clearCacheAPI = async (): Promise<boolean> => {
  if (!isCacheApiSupported()) {
    console.warn('此浏览器不支持Cache API，无法直接清除缓存');
    return false;
  }

  try {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map(cacheName => caches.delete(cacheName))
    );
    console.log('Cache API缓存已清除');
    return true;
  } catch (error) {
    console.error('清除Cache API缓存失败:', error);
    return false;
  }
};

/**
 * 清除Service Worker缓存
 * 通过与Service Worker通信实现
 */
export const clearCache = async (): Promise<boolean> => {
  console.log('开始清除缓存...');
  
  // 清除浏览器存储
  clearLocalStorage();
  clearSessionStorage();
  clearCookies();
  
  // 尝试使用Cache API直接清除缓存
  try {
    await clearCacheAPI();
  } catch (error) {
    console.error('使用Cache API清除缓存失败:', error);
  }
  
  // 检查Service Worker是否可用
  if (!isServiceWorkerSupported()) {
    console.warn('此浏览器不支持Service Worker，无法通过SW清除缓存');
    return false;
  }
  
  try {
    // 获取Service Worker注册信息
    const registration = await navigator.serviceWorker.getRegistration();
    
    if (!registration) {
      console.warn('未找到已注册的Service Worker');
      return false;
    }
    
    // 检查Service Worker控制器是否激活
    if (!navigator.serviceWorker.controller) {
      console.warn('Service Worker未控制当前页面，尝试刷新后再试');
      return false;
    }
    
    // 创建一个消息通道用于接收Service Worker的响应
    const messageChannel = new MessageChannel();
    
    // 创建一个Promise，等待SW响应或超时
    return new Promise((resolve) => {
      // 设置10秒超时
      const timeout = setTimeout(() => {
        console.warn('Service Worker响应超时，假设缓存已清除');
        resolve(true);
      }, 10000);
      
      // 设置消息通道的响应处理函数
      messageChannel.port1.onmessage = (event) => {
        clearTimeout(timeout);
        
        if (event.data && event.data.action === 'cacheCleared') {
          console.log('Service Worker确认缓存已清除:', event.data.status);
          resolve(event.data.status);
        } else {
          console.warn('Service Worker返回了未知响应:', event.data);
          resolve(false);
        }
      };
      
      // 发送清除缓存消息到Service Worker
      try {
        // 检查controller是否存在（TypeScript安全检查）
        const controller = navigator.serviceWorker.controller;
        if (!controller) {
          console.warn('Service Worker控制器不存在，无法发送消息');
          clearTimeout(timeout);
          resolve(false);
          return;
        }
        
        controller.postMessage(
          { action: 'clearCache' },
          [messageChannel.port2]
        );
        console.log('已向Service Worker发送清除缓存请求');
      } catch (error) {
        console.error('无法向Service Worker发送消息:', error);
        clearTimeout(timeout);
        resolve(false);
      }
    });
  } catch (error) {
    console.error('与Service Worker通信过程中出错:', error);
    return false;
  }
};

/**
 * 获取带有时间戳的URL，用于绕过缓存
 * @param url 原始URL
 * @returns 带有时间戳参数的URL
 */
export const getNoCacheUrl = (url: string): string => {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}_t=${new Date().getTime()}`;
};

/**
 * 强制重新加载页面并获取最新内容
 * 先清除缓存，然后重新加载页面
 */
export const forceContentUpdate = async (): Promise<void> => {
  try {
    console.log('开始强制更新内容...');
    
    // 尝试清除缓存
    const cacheCleared = await clearCache();
    
    console.log(`缓存清除${cacheCleared ? '成功' : '可能不完全'}`);
    
    // 尝试使用标准方法重新加载页面
    try {
      window.location.reload();
      console.log('页面将重新加载');
    } catch (reloadError) {
      console.error('标准刷新方法失败，尝试备用方法:', reloadError);
      
      // 备用方法：使用带时间戳的URL重定向
      try {
        window.location.href = getNoCacheUrl(window.location.href);
        console.log('正在使用备用方法重新加载页面');
      } catch (redirectError) {
        console.error('所有刷新方法均失败:', redirectError);
        
        // 通知用户手动刷新
        if (typeof alert === 'function') {
          alert('无法自动刷新页面，请手动刷新获取最新内容');
        }
      }
    }
  } catch (error) {
    console.error('强制更新内容过程中发生错误:', error);
    
    // 尝试进行简单刷新作为最后尝试
    try {
      window.location.reload();
    } catch {
      console.error('所有刷新方法均失败');
    }
  }
};

/**
 * 强制刷新内容，但提供更多控制选项
 * @param options 刷新选项
 */
export const forceContentRefresh = (options: { 
  hardReload?: boolean; 
  clearCacheFirst?: boolean;
  clearImageCache?: boolean;
} = {}): void => {
  const { hardReload = false, clearCacheFirst = true, clearImageCache = true } = options;
  
  console.log(`强制刷新内容 [硬重载=${hardReload}, 先清缓存=${clearCacheFirst}, 清除图片缓存=${clearImageCache}]`);
  
  // 如果设置了图片缓存清除
  if (clearImageCache && isBrowserEnvironment()) {
    // 尝试重新加载所有图片，绕过缓存
    document.querySelectorAll('img').forEach(img => {
      if (img.src && !img.src.startsWith('data:')) {
        const originalSrc = img.src;
        img.src = '';
        setTimeout(() => {
          img.src = getNoCacheUrl(originalSrc);
          console.log(`图片已重新加载: ${originalSrc}`);
        }, 50);
      }
    });
  }
  
  if (hardReload) {
    // 使用强制更新，包括缓存清除
    forceContentUpdate().catch(error => {
      console.error('强制内容更新失败:', error);
    });
    return;
  }
  
  // 执行普通刷新
  if (clearCacheFirst) {
    clearCache().then(() => {
      // 清除图片预加载缓存
      if (clearImageCache && isCacheApiSupported()) {
        caches.open('image-cache').then(cache => {
          cache.keys().then(requests => {
            requests.forEach(request => {
              cache.delete(request);
            });
          });
        }).catch(err => console.warn('清除图片缓存失败:', err));
      }
      
      // 为当前页面所有图片URL添加时间戳参数
      if (clearImageCache && isBrowserEnvironment()) {
        const noCacheTimestamp = new Date().getTime();
        const imageElements = document.querySelectorAll('img');
        
        imageElements.forEach(img => {
          if (img.src && !img.src.startsWith('data:')) {
            const srcWithoutCache = img.src.split('?')[0]; // 移除可能存在的查询参数
            img.src = `${srcWithoutCache}?_noCache=${noCacheTimestamp}`;
          }
        });
        
        console.log(`已为${imageElements.length}张图片添加缓存控制参数`);
      }
      
      // 不强制重载页面
      console.log('资源已刷新，无需重载页面');
    });
  } else {
    // 不清除缓存，直接刷新页面状态
    console.log('刷新页面状态，不清除缓存');
  }
}

/**
 * 获取当前内容版本
 * @returns 当前内容版本号或null
 */
export const getCurrentContentVersion = (): string | null => {
  if (!isBrowser()) return null;
  
  try {
    return localStorage.getItem('contentVersion');
  } catch (err) {
    console.warn('获取当前内容版本失败:', err);
    return null;
  }
};

/**
 * 检查并更新内容（如果需要）
 * @param minUpdateInterval 最小更新间隔（毫秒），默认为1小时
 */
export const checkAndUpdateContent = (
  minUpdateInterval: number = 3600000 // 默认1小时
): boolean => {
  if (!isBrowser()) return false;
  
  try {
    const lastUpdate = localStorage.getItem('lastContentUpdate');
    const now = new Date().getTime();
    
    // 如果没有上次更新记录，或者解析出的时间戳不是数字，则记录当前时间并返回false
    if (!lastUpdate) {
      localStorage.setItem('lastContentUpdate', now.toString());
      return false;
    }
    
    const lastUpdateTime = parseInt(lastUpdate, 10);
    
    // 处理解析错误
    if (isNaN(lastUpdateTime)) {
      localStorage.setItem('lastContentUpdate', now.toString());
      return false;
    }
    
    // 检查是否超过最小更新间隔
    if (now - lastUpdateTime > minUpdateInterval) {
      // 更新时间戳并返回true表示需要更新
      localStorage.setItem('lastContentUpdate', now.toString());
      return true;
    }
    
    return false;
  } catch (err) {
    console.warn('检查内容更新时间失败:', err);
    return false;
  }
};

/**
 * 刷新应用内容，包括重新加载数据和更新视图
 * @param forceReload 是否强制重新加载页面
 */
export const refreshContent = async (options: { 
  forceReload?: boolean;
  clearCaches?: boolean;
} = {}): Promise<void> => {
  if (!isBrowser()) return;
  
  try {
    if (options.clearCaches) {
      // 尝试清除缓存
      await clearCache();
    }
    
    // 添加时间戳参数以避免缓存
    const timestamp = new Date().getTime();
    
    // 更新localStorage中的时间戳
    try {
      localStorage.setItem('lastContentUpdate', timestamp.toString());
    } catch (err) {
      console.warn('更新内容时间戳失败:', err);
    }
    
    // 根据选项决定是否强制重新加载
    if (options.forceReload) {
      try {
        window.location.reload();
      } catch (err) {
        console.warn('强制刷新失败，尝试备用方法:', err);
        
        // 备用方法：添加时间戳并重定向
        try {
          const currentUrl = new URL(window.location.href);
          currentUrl.searchParams.set('timestamp', timestamp.toString());
          window.location.href = currentUrl.toString();
        } catch (urlError) {
          console.warn('URL操作失败，尝试直接刷新:', urlError);
          window.location.reload();
        }
      }
    } else {
      // 软刷新
      window.location.reload();
    }
  } catch (err) {
    console.error('刷新内容失败:', err);
    
    // 最后尝试最基本的刷新
    try {
      window.location.href = window.location.href;
    } catch {
      console.error('所有刷新方法都失败，无法刷新页面');
    }
  }
};

/**
 * 添加内容更新事件监听器
 * @param callback 当内容更新时的回调函数
 */
export const addContentUpdateListener = (
  callback: () => void, 
  checkInterval: number = 300000 // 默认5分钟
): () => void => {
  if (!isBrowser()) return () => {};
  
  // 设置定期检查
  const intervalId = setInterval(() => {
    // 检查是否需要更新内容
    if (checkAndUpdateContent(checkInterval)) {
      // 执行回调
      callback();
    }
  }, checkInterval);
  
  // 返回一个取消监听的函数
  return () => {
    clearInterval(intervalId);
  };
}; 