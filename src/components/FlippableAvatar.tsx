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
  const [frontImgSrc, setFrontImgSrc] = useState<string>(frontImagePath);
  const [backImgSrc, setBackImgSrc] = useState<string>(backImagePath);
  const [forceRefresh, setForceRefresh] = useState<number>(Date.now());

  // 使用useCallback缓存函数，防止不必要的重新渲染
  const checkImageAvailability = useCallback(() => {
    // 添加时间戳参数防止缓存
    const frontImgWithTimestamp = `${frontImagePath}?t=${forceRefresh}`;
    const backImgWithTimestamp = `${backImagePath}?t=${forceRefresh}`;
    
    // 检查前面图片
    const frontImg = new Image();
    frontImg.onload = () => {
      setFrontImgSrc(frontImgWithTimestamp);
      setFrontLoading(false);
    };
    frontImg.onerror = () => {
      console.warn(`前面图片加载失败: ${frontImagePath}`);
      // 使用占位符
      setFrontImgSrc(generateAvatarPlaceholder(altText, size, size));
      setFrontLoading(false);
    };
    frontImg.src = frontImgWithTimestamp;
    
    // 检查背面图片
    const backImg = new Image();
    backImg.onload = () => {
      setBackImgSrc(backImgWithTimestamp);
      setBackLoading(false);
    };
    backImg.onerror = () => {
      console.warn(`背面图片加载失败: ${backImagePath}`);
      // 使用占位符
      setBackImgSrc(generateAvatarPlaceholder(altText, size, size));
      setBackLoading(false);
    };
    backImg.src = backImgWithTimestamp;
  }, [frontImagePath, backImagePath, altText, size, forceRefresh]);

  // 组件挂载或图片路径变化时检查图片可用性
  useEffect(() => {
    setFrontLoading(true);
    setBackLoading(true);
    checkImageAvailability();
  }, [frontImagePath, backImagePath, checkImageAvailability]);

  // 添加强制刷新功能
  const forceImageRefresh = () => {
    setForceRefresh(Date.now());
  };

  // 双击时强制刷新图片
  const handleDoubleClick = () => {
    forceImageRefresh();
  };

  return (
    <div 
      className={`flip-container ${isFlipped ? 'flipped' : ''}`} 
      onClick={() => setIsFlipped(!isFlipped)}
      onDoubleClick={handleDoubleClick}
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      <div className="flipper">
        <div className="front">
          {frontLoading && (
            <div className="loading-placeholder">
              <div className="spinner"></div>
            </div>
          )}
          <img 
            src={frontImgSrc}
            alt={`${altText} - 正面`}
            className="avatar-image"
            onLoad={() => setFrontLoading(false)}
            onError={() => {
              console.warn(`前面图片加载失败(内联处理): ${frontImagePath}`);
              setFrontImgSrc(generateAvatarPlaceholder(altText, size, size));
              setFrontLoading(false);
            }}
          />
        </div>
        <div className="back">
          {backLoading && (
            <div className="loading-placeholder">
              <div className="spinner"></div>
            </div>
          )}
          <img 
            src={backImgSrc}
            alt={`${altText} - 背面`}
            className="avatar-image"
            onLoad={() => setBackLoading(false)}
            onError={() => {
              console.warn(`背面图片加载失败(内联处理): ${backImagePath}`);
              setBackImgSrc(generateAvatarPlaceholder(altText, size, size));
              setBackLoading(false);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default FlippableAvatar; 