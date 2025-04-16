import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import FlippableAvatar from './FlippableAvatar';

// 使用绝对路径确保在任何环境下都能找到图片
// 根据部署情况智能选择路径
const getBasePath = () => {
  // 检测当前环境以确定正确的图片路径
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return '';
  } else if (hostname.includes('github.io')) {
    return '/Personal_website';
  } else {
    return '';
  }
};

// 使用版本号破坏缓存
const versionSuffix = `?v=${Date.now()}`;
const basePath = getBasePath();
const abstractAvatarPath = `${basePath}/images/abstract-avatar.png${versionSuffix}`; 
const personalPhotoPath = `${basePath}/images/personal-photo.png${versionSuffix}`;

console.log('使用图片路径:', abstractAvatarPath, personalPhotoPath);

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const { t } = useLanguage();
  
  // 强制更新计数器
  const [refreshCounter, setRefreshCounter] = useState(0);

  useEffect(() => {
    setIsLoaded(true);
    
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    
    // 添加定期强制更新机制以确保内容同步
    const forceUpdateInterval = setInterval(() => {
      setRefreshCounter(prev => prev + 1);
    }, 60000); // 每分钟更新一次
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(forceUpdateInterval);
    }
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Hero Section - Apple Style */}
      <div className="relative h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 z-0" 
          style={{
            transform: `translateY(${scrollPosition * 0.5}px)`,
            transition: 'transform 0.1s linear'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white dark:to-black z-10"></div>
          <div className="h-full w-full bg-gradient-to-r from-gray-100 to-white dark:from-gray-900 dark:to-black"></div>
        </div>
        
        <div className={`relative z-10 text-center max-w-5xl mx-auto px-4 transition-all duration-1000 ease-out transform ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <h1 className="text-6xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6" style={{ letterSpacing: '-0.025em' }}>{t('home.title')}</h1>
          <p className="text-2xl md:text-3xl text-gray-500 dark:text-gray-300 mb-8" style={{ fontWeight: 300 }}>{t('home.student')}</p>
          
          <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-6 mb-12">
            <Link to="/education" className="apple-button w-full md:w-auto">
              {t('nav.education')}
              <span className="ml-2">→</span>
            </Link>
            <Link to="/work" className="apple-button-secondary w-full md:w-auto">
              {t('nav.work')}
              <span className="ml-2">→</span>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Profile Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className={`flex flex-col md:flex-row items-center justify-between gap-12 transition-all duration-1000 ease-out`}>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-4xl font-semibold text-gray-900 dark:text-white mb-6" style={{ letterSpacing: '-0.025em' }}>About Me</h2>
            <div className="text-xl text-gray-600 dark:text-gray-300 mb-8 space-y-4" style={{ fontWeight: 300, lineHeight: 1.6 }}>
              <p>{t('home.tel')}</p>
              <p>{t('home.email')} <a href="mailto:cinsoul9@gmail.com" className="text-[var(--apple-blue)] hover:text-[var(--apple-blue-hover)]">cinsoul9@gmail.com</a></p>
              <p>{t('home.linkedin')} <a href="https://linkedin.com/in/xindi-wang-18b10b24b" target="_blank" rel="noopener noreferrer" className="text-[var(--apple-blue)] hover:text-[var(--apple-blue-hover)]">linkedin.com/in/xindi-wang-18b10b24b</a></p>
            </div>
          </div>
          <div className="flex-1 flex justify-center md:justify-end">
            <div className="relative w-72 h-72 md:w-96 md:h-96 rounded-full overflow-hidden shadow-2xl transform hover:scale-105 transition-all duration-500 ease-out">
              {/* 使用可翻转头像组件并传入refreshCounter触发更新 */}
              <FlippableAvatar 
                key={`avatar-${refreshCounter}`} 
                frontImagePath={`${abstractAvatarPath}&refresh=${refreshCounter}`} 
                backImagePath={`${personalPhotoPath}&refresh=${refreshCounter}`}
                altText="Xindi Wang"
                size={400}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}