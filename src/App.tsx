import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import './App.css';
import Home from './components/Home';
import Education from './components/Education';
import WorkExperience from './components/WorkExperience';
import ProjectsAndAwards from './components/ProjectsAndAwards';
import Contact from './components/Contact';
import Certifications from './components/Certifications';

// 导入项目管理器和语言和管理员上下文
import ProjectsManager from './components/ProjectsManager';
import WorkExperienceManager from './components/WorkExperienceManager';
import CertificationsManager from './components/CertificationsManager';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { AdminProvider, useAdmin } from './contexts/AdminContext';
import { checkAndUpdateContent, forceContentRefresh } from './utils/forceContentUpdate';

// 监听路由变化并更新内容
const ContentSyncWrapper = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  
  // 当路由变化时，检查并更新内容
  useEffect(() => {
    checkAndUpdateContent(3600000); // 使用默认的1小时间隔
  }, [location.pathname]);
  
  return <>{children}</>;
};

// 简单的测试页面组件
const TestPage = () => (
  <div style={{ padding: '2rem', textAlign: 'center' }}>
    <h1>测试页面</h1>
    <p>这是一个简单的测试页面，用于验证路由和样式。</p>
  </div>
);

// 头部导航组件
const Header = () => {
  const { language, setLanguage, t } = useLanguage();
  const { /* isAdminMode */ } = useAdmin(); // 注释掉未使用的变量
  const [menuOpen, setMenuOpen] = useState(false);
  
  // 强制刷新内容
  const handleRefreshContent = () => {
    forceContentRefresh({ 
      hardReload: false, 
      clearCacheFirst: true,
      clearImageCache: true 
    });
    alert('内容已刷新，缓存已清除，请等待图片重新加载');
  };
  
  return (
    <header className="app-header">
      <div className="header-container">
        <Link to="/" className="logo">Xindi Wang</Link>
        
        <nav className={`main-nav ${menuOpen ? 'mobile-menu-open' : ''}`}>
          <Link to="/" onClick={() => setMenuOpen(false)}>{t('nav.home')}</Link>
          <Link to="/education" onClick={() => setMenuOpen(false)}>{t('nav.education')}</Link>
          <Link to="/work" onClick={() => setMenuOpen(false)}>{t('nav.work')}</Link>
          <Link to="/projects" onClick={() => setMenuOpen(false)}>{t('nav.projects')}</Link>
          <Link to="/certifications" onClick={() => setMenuOpen(false)}>{t('nav.certifications')}</Link>
          <Link to="/contact" onClick={() => setMenuOpen(false)}>{t('nav.contact')}</Link>
          
          {/* 语言切换按钮 */}
          <button
            className="language-switcher"
            onClick={() => {
              setLanguage(language === 'en' ? 'zh' : 'en');
              setMenuOpen(false);
            }}
          >
            {language === 'zh' ? 'EN' : '中文'}
          </button>
          
          {/* 内容刷新按钮 */}
          <button
            className="refresh-button"
            onClick={() => {
              handleRefreshContent();
              setMenuOpen(false);
            }}
            title="刷新内容"
          >
            🔄
          </button>
        </nav>
        
        {/* 移动端菜单按钮 */}
        <button 
          className="mobile-menu-button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? '关闭菜单' : '打开菜单'}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </header>
  );
};

// 页脚组件
const Footer = () => {
  const { t } = useLanguage();
  
  return (
    <footer className="app-footer">
      <div className="footer-container">
        <p>© {new Date().getFullYear()} Xindi Wang</p>
        <p>{t('footer.rights')}</p>
      </div>
    </footer>
  );
};

function App() {
  // 监听屏幕尺寸变化，添加设备类型标记
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
      const isDesktop = window.innerWidth >= 1024;
      
      // 在HTML元素上添加设备类型标记，用于CSS媒体查询
      document.documentElement.classList.toggle('mobile-device', isMobile);
      document.documentElement.classList.toggle('tablet-device', isTablet);
      document.documentElement.classList.toggle('desktop-device', isDesktop);
      
      // 设置viewport meta标签，确保移动设备正确缩放
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport && isMobile) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
      } else if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0');
      }
    };
    
    // 初始化和监听
    handleResize();
    window.addEventListener('resize', handleResize);
    
    // 在组件挂载时检查并更新内容
    const timer = setTimeout(() => {
      checkAndUpdateContent(3600000); // 使用默认的1小时间隔
    }, 500);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, []);

  return (
    <AdminProvider>
      <LanguageProvider>
        <BrowserRouter>
          <ContentSyncWrapper>
            <div className="app-container">
              <Header />
              <main className="main-content">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/education" element={<Education />} />
                  <Route path="/work" element={<WorkExperience />} />
                  <Route path="/work/manage" element={<WorkExperienceManager />} />
                  <Route path="/projects" element={<ProjectsAndAwards />} />
                  <Route path="/certifications" element={<Certifications />} />
                  <Route path="/certifications/manage" element={<CertificationsManager />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/projects-manager" element={<ProjectsManager />} />
                  <Route path="/test" element={<TestPage />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </ContentSyncWrapper>
        </BrowserRouter>
      </LanguageProvider>
    </AdminProvider>
  );
}

export default App;
