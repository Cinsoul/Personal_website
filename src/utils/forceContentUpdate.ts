/**
 * 内容强制更新工具
 * 用于解决内容不同步和缓存问题
 */

/**
 * 清除所有本地缓存
 */
export const clearAllCaches = (): void => {
  if (typeof window === 'undefined') return;
  
  try {
    // 清除localStorage
    localStorage.clear();
    
    // 清除sessionStorage
    sessionStorage.clear();
    
    // 删除所有cookie
    document.cookie.split(';').forEach(cookie => {
      document.cookie = cookie
        .replace(/^ +/, '')
        .replace(/=.*/, `=;expires=${new Date(0).toUTCString()};path=/`);
    });
    
    // 如果浏览器支持缓存API，清除缓存
    if (window.caches) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
        });
      });
    }
    
    console.log('所有本地缓存已清除');
  } catch (error) {
    console.error('清除缓存失败:', error);
  }
};

/**
 * 强制刷新页面内容
 * @param hardReload 是否硬刷新页面
 */
export const forceContentRefresh = (hardReload = false): void => {
  if (typeof window === 'undefined') return;

  try {
    // 添加时间戳参数到所有图片URL，强制重新加载
    const images = document.querySelectorAll('img');
    const timestamp = Date.now();
    
    images.forEach(img => {
      const currentSrc = img.src;
      if (currentSrc) {
        if (currentSrc.includes('?')) {
          img.src = `${currentSrc.split('?')[0]}?t=${timestamp}`;
        } else {
          img.src = `${currentSrc}?t=${timestamp}`;
        }
      }
    });

    // 更新localStorage中的版本标记
    localStorage.setItem('content_version', timestamp.toString());

    if (hardReload) {
      // 强制重新加载页面（绕过缓存）
      // 使用新 API，避免使用已弃用的带参数的 reload()
      if (typeof window.location.reload === 'function') {
        window.location.reload();
      }
    }
    
    console.log('内容已强制刷新');
  } catch (error) {
    console.error('刷新内容失败:', error);
  }
};

/**
 * 获取当前内容版本
 * @returns 当前内容版本号或null
 */
export const getCurrentContentVersion = (): number | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const version = localStorage.getItem('content_version');
    return version ? parseInt(version, 10) : null;
  } catch (error) {
    console.error('获取内容版本失败:', error);
    return null;
  }
};

/**
 * 检查并更新内容（如果需要）
 * @param forceUpdate 是否强制更新
 */
export const checkAndUpdateContent = (forceUpdate = false): void => {
  if (typeof window === 'undefined') return;
  
  try {
    // 获取上次更新时间
    const lastUpdate = parseInt(localStorage.getItem('last_content_update') || '0', 10);
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    
    // 如果强制更新或者上次更新超过1小时，则更新内容
    if (forceUpdate || now - lastUpdate > oneHour) {
      forceContentRefresh(false);
      localStorage.setItem('last_content_update', now.toString());
    }
  } catch (error) {
    console.error('检查内容更新失败:', error);
  }
};

// 内容更新工具函数

/**
 * 清除Service Worker缓存并触发内容刷新
 * @returns Promise<boolean> 是否成功清除缓存
 */
export const clearCache = (): Promise<boolean> => {
  if (!('serviceWorker' in navigator)) {
    console.warn('当前浏览器不支持Service Worker');
    return Promise.resolve(false);
  }

  return new Promise((resolve, reject) => {
    const controller = navigator.serviceWorker.controller;
    if (!controller) {
      console.warn('没有活动的Service Worker');
      return reject(new Error('没有活动的Service Worker'));
    }

    // 创建一个消息通道
    const messageChannel = new MessageChannel();
    
    // 设置消息响应处理
    messageChannel.port1.onmessage = (event) => {
      if (event.data.error) {
        reject(new Error(event.data.error));
      } else if (event.data.action === 'cacheCleared') {
        resolve(true);
      } else {
        resolve(false);
      }
    };

    // 向Service Worker发送清除缓存请求
    controller.postMessage(
      { action: 'clearCache' },
      [messageChannel.port2]
    );
  });
};

/**
 * 刷新应用内容，包括重新加载数据和更新视图
 * @param forceReload 是否强制重新加载页面
 */
export const refreshContent = (forceReload = false): void => {
  // 发布一个全局事件通知各组件更新内容
  window.dispatchEvent(new CustomEvent('forceContentUpdate', { 
    detail: { timestamp: Date.now() } 
  }));
  
  // 如果指定强制重新加载页面
  if (forceReload) {
    // 添加时间戳参数以跳过缓存
    const timestamp = Date.now();
    const currentUrl = window.location.href;
    const separator = currentUrl.includes('?') ? '&' : '?';
    
    // 重定向到带时间戳的URL以跳过缓存
    window.location.href = `${currentUrl}${separator}timestamp=${timestamp}`;
  }
};

/**
 * 完整的内容更新流程：清除缓存并刷新内容
 * @param forceReload 是否强制重新加载页面
 */
export const forceContentUpdate = async (forceReload = false): Promise<void> => {
  try {
    // 尝试清除缓存
    const cleared = await clearCache().catch(() => false);
    console.log('缓存清除状态:', cleared ? '成功' : '失败');
    
    // 刷新内容
    refreshContent(forceReload);
  } catch (error) {
    console.error('内容更新失败:', error);
    // 即使缓存清除失败，也尝试刷新内容
    refreshContent(forceReload);
  }
};

/**
 * 添加内容更新事件监听器
 * @param callback 当内容更新时的回调函数
 */
export const addContentUpdateListener = (
  callback: (timestamp: number) => void
): () => void => {
  const handler = (event: Event) => {
    const customEvent = event as CustomEvent;
    callback(customEvent.detail?.timestamp || Date.now());
  };
  
  window.addEventListener('forceContentUpdate', handler);
  
  // 返回一个移除监听器的函数
  return () => {
    window.removeEventListener('forceContentUpdate', handler);
  };
}; 