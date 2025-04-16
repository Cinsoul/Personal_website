import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './styles/responsive-mobile.css'
import { LanguageProvider } from './contexts/LanguageContext'
import { AdminProvider } from './contexts/AdminContext'

// 注册 Service Worker
if ('serviceWorker' in navigator) {
  // 添加时间戳确保获取最新的Service Worker
  const swUrl = `/service-worker.js?t=${Date.now()}`;
  
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(swUrl)
      .then(registration => {
        console.log('Service Worker 注册成功:', registration.scope);
        
        // 检查更新
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('新版本可用，准备更新...');
                // 通知用户有新版本，可以通过刷新页面应用新版本
                if (confirm('网站有新版本可用，是否立即更新？')) {
                  newWorker.postMessage({ action: 'skipWaiting' });
                }
              }
            });
          }
        });
      })
      .catch(error => {
        console.error('Service Worker 注册失败:', error);
      });
      
    // 当Service Worker控制权变更时刷新页面
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('Service Worker已更新，刷新页面...');
      window.location.reload();
    });
  });
  
  // 提供API用于清除缓存
  window.clearCache = function() {
    if (navigator.serviceWorker.controller) {
      return new Promise((resolve, reject) => {
        const messageChannel = new MessageChannel();
        
        messageChannel.port1.onmessage = (event) => {
          if (event.data.action === 'cacheCleared') {
            console.log('缓存已清除，时间戳:', Date.now());
            resolve(true);
          } else {
            reject(new Error('清除缓存失败'));
          }
        };
        
        const controller = navigator.serviceWorker.controller;
        if (controller) {
          controller.postMessage(
            { action: 'clearCache' },
            [messageChannel.port2]
          );
        } else {
          reject(new Error('Service Worker控制器不存在'));
        }
      });
    } else {
      console.warn('没有活动的Service Worker');
      return Promise.resolve(false);
    }
  };
}

// 声明全局类型
declare global {
  interface Window {
    clearCache: () => Promise<boolean>;
  }
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <LanguageProvider>
      <AdminProvider>
        <App />
      </AdminProvider>
    </LanguageProvider>
  </React.StrictMode>,
)
