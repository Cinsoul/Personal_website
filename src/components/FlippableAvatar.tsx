import React, { useState, useEffect } from 'react';
import '../styles/flippable-avatar.css';

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
  // 初始状态设置为未翻转，显示第一面(抽象头像)
  const [isFlipped, setIsFlipped] = useState(false);
  const [frontLoaded, setFrontLoaded] = useState(false);
  const [backLoaded, setBackLoaded] = useState(false);
  const [frontLoadError, setFrontLoadError] = useState(false);
  const [backLoadError, setBackLoadError] = useState(false);
  const [frontErrorDetails, setFrontErrorDetails] = useState('');
  const [backErrorDetails, setBackErrorDetails] = useState('');
  
  // 处理翻转
  const handleFlip = () => {
    console.log('翻转状态变更:', !isFlipped ? '翻转到个人照片' : '翻转到抽象头像');
    setIsFlipped(!isFlipped);
  };
  
  // 尝试多种路径直到图片加载成功
  useEffect(() => {
    // 简化日志信息
    console.log('开始加载图片:', { frontImagePath, backImagePath });
    
    const preloadFront = new Image();
    const preloadBack = new Image();
    
    preloadFront.onload = () => {
      console.log('前面图片加载成功');
      setFrontLoaded(true);
      setFrontLoadError(false);
    };
    
    preloadFront.onerror = () => {
      console.error('前面图片加载失败:', frontImagePath);
      setFrontErrorDetails(`无法加载图片: ${frontImagePath}`);
      setFrontLoadError(true);
    };
    
    preloadBack.onload = () => {
      console.log('背面图片加载成功');
      setBackLoaded(true);
      setBackLoadError(false);
    };
    
    preloadBack.onerror = () => {
      console.error('背面图片加载失败:', backImagePath);
      setBackErrorDetails(`无法加载图片: ${backImagePath}`);
      setBackLoadError(true);
    };

    // 直接设置src会触发加载过程
    preloadFront.src = frontImagePath;
    preloadBack.src = backImagePath;
    
    // 如果图片已经缓存，onload可能不会触发，所以检查complete属性
    if (preloadFront.complete) {
      setFrontLoaded(true);
    }
    
    if (preloadBack.complete) {
      setBackLoaded(true);
    }
  }, [frontImagePath, backImagePath]);

  // 记录当前翻转状态
  useEffect(() => {
    console.log('当前翻转状态:', isFlipped ? '显示个人照片' : '显示抽象头像');
  }, [isFlipped]);

  return (
    <div 
      className={`flip-container ${isFlipped ? 'flipped' : ''}`} 
      onClick={handleFlip}
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      <div className="flipper">
        <div className="front">
          <div className="avatar-image-container">
            {frontLoaded ? (
              <img
                src={frontImagePath}
                alt={altText + " (前面)"}
                className="avatar-image abstract-avatar"
              />
            ) : (
              frontLoadError ? (
                <div className="avatar-placeholder">
                  图片加载失败
                  <div className="error-details">{frontErrorDetails}</div>
                </div>
              ) : (
                <div className="loading-placeholder">
                  <div className="loading-spinner"></div>
                </div>
              )
            )}
          </div>
        </div>
        
        <div className="back">
          <div className="avatar-image-container">
            {backLoaded ? (
              <img
                src={backImagePath}
                alt={altText + " (背面)"}
                className="avatar-image personal-photo"
              />
            ) : (
              backLoadError ? (
                <div className="avatar-placeholder">
                  图片加载失败
                  <div className="error-details">{backErrorDetails}</div>
                </div>
              ) : (
                <div className="loading-placeholder">
                  <div className="loading-spinner"></div>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlippableAvatar; 