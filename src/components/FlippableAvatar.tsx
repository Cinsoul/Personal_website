import React, { useState, useEffect, useCallback } from 'react';
import '../styles/flippable-avatar.css';
import { generateAvatarPlaceholder } from '../utils/imageUtils';

interface FlippableAvatarProps {
  frontImagePath: string;
  backImagePath: string;
  altText: string;
  size?: number;
}

const FlippableAvatar: React.FC<FlippableAvatarProps> = ({ 
  frontImagePath, 
  backImagePath, 
  altText,
  size = 300
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [frontLoading, setFrontLoading] = useState(true);
  const [backLoading, setBackLoading] = useState(true);
  const [frontImgSrc, setFrontImgSrc] = useState<string>('');
  const [backImgSrc, setBackImgSrc] = useState<string>('');
  const [forceRefresh, setForceRefresh] = useState<number>(Date.now());
  
  // 添加本地存储ID以强制刷新
  const storageKey = 'avatar_cache_version';
  const [cacheVersion, setCacheVersion] = useState<number>(() => {
    const storedVersion = localStorage.getItem(storageKey);
    return storedVersion ? parseInt(storedVersion, 10) : Date.now();
  });
  
  // 更强力的图片加载机制
  const loadImage = useCallback((url: string, setLoading: React.Dispatch<React.SetStateAction<boolean>>, setImgSrc: React.Dispatch<React.SetStateAction<string>>, fallbackText: string) => {
    // 强制破坏缓存
    const timestamp = `t=${forceRefresh}_${cacheVersion}`;
    const fullURL = url.includes('?') ? `${url}&${timestamp}` : `${url}?${timestamp}`;
    
    // 创建新图片实例
    const img = new Image();
    
    // 成功加载时
    img.onload = () => {
      console.log(`图片加载成功: ${url}`);
      setImgSrc(fullURL);
      setLoading(false);
    };
    
    // 加载失败时
    img.onerror = () => {
      console.warn(`图片加载失败: ${url}`);
      setImgSrc(generateAvatarPlaceholder(fallbackText || altText, size, size));
      setLoading(false);
      
      // 尝试直接获取图片（作为备选方案）
      fetch(url, { cache: 'no-store' })
        .then(response => {
          if (response.ok) {
            return response.blob();
          }
          throw new Error('图片获取失败');
        })
        .then(blob => {
          const objectURL = URL.createObjectURL(blob);
          setImgSrc(objectURL);
        })
        .catch(err => {
          console.error('备选获取图片失败:', err);
        });
    };
    
    // 设置crossOrigin以避免CORS问题
    img.crossOrigin = 'anonymous';
    img.src = fullURL;
    
  }, [forceRefresh, cacheVersion, size, altText]);
  
  // 加载两个图片
  useEffect(() => {
    setFrontLoading(true);
    setBackLoading(true);
    
    loadImage(frontImagePath, setFrontLoading, setFrontImgSrc, `${altText}-F`);
    loadImage(backImagePath, setBackLoading, setBackImgSrc, `${altText}-B`);
    
    // 每次组件挂载时更新缓存版本
    const newVersion = Date.now();
    setCacheVersion(newVersion);
    localStorage.setItem(storageKey, newVersion.toString());
    
  }, [frontImagePath, backImagePath, loadImage, altText]);
  
  // 强制刷新函数
  const forceImageRefresh = () => {
    setFrontLoading(true);
    setBackLoading(true);
    setForceRefresh(Date.now());
    
    // 更新缓存版本号
    const newVersion = Date.now();
    setCacheVersion(newVersion);
    localStorage.setItem(storageKey, newVersion.toString());
    
    // 强制重新加载图片
    setTimeout(() => {
      loadImage(frontImagePath, setFrontLoading, setFrontImgSrc, `${altText}-F`);
      loadImage(backImagePath, setBackLoading, setBackImgSrc, `${altText}-B`);
    }, 50);
  };

  return (
    <div 
      className={`flip-container ${isFlipped ? 'flipped' : ''}`} 
      onClick={() => setIsFlipped(!isFlipped)}
      onDoubleClick={forceImageRefresh}
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      <div className="flipper">
        <div className="front">
          {frontLoading ? (
            <div className="loading-placeholder">
              <div className="spinner"></div>
            </div>
          ) : (
            <div className="avatar-image-container">
              <img 
                src={frontImgSrc}
                alt={`${altText} - 正面`}
                className="avatar-image"
                onError={() => {
                  console.warn(`前面图片加载失败(内联处理): ${frontImagePath}`);
                  setFrontImgSrc(generateAvatarPlaceholder(`${altText}-F`, size, size));
                }}
              />
            </div>
          )}
        </div>
        
        <div className="back">
          {backLoading ? (
            <div className="loading-placeholder">
              <div className="spinner"></div>
            </div>
          ) : (
            <div className="avatar-image-container">
              <img 
                src={backImgSrc}
                alt={`${altText} - 背面`}
                className="avatar-image"
                onError={() => {
                  console.warn(`背面图片加载失败(内联处理): ${backImagePath}`);
                  setBackImgSrc(generateAvatarPlaceholder(`${altText}-B`, size, size));
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FlippableAvatar; 