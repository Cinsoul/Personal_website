import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { AdminProvider } from './contexts/AdminContext';
import Home from './components/Home';
import Education from './components/Education';
import WorkExperience from './components/WorkExperience';
import ProjectsAndAwards from './components/ProjectsAndAwards';
import Contact from './components/Contact';

// 简单的测试组件用于验证路由
function TestPage() {
  const { t, language, setLanguage } = useLanguage();
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      height: '100vh',
      padding: '20px',
      textAlign: 'center'
    }}>
      <h1 style={{ marginBottom: '20px' }}>测试页面 - Test Page</h1>
      <p style={{ marginBottom: '20px' }}>
        {language === 'zh' ? '当前语言: 中文' : 'Current language: English'}
      </p>
      <button 
        onClick={() => setLanguage(language === 'zh' ? 'en' : 'zh')}
        style={{
          padding: '8px 16px',
          backgroundColor: '#0071e3',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginBottom: '20px'
        }}
      >
        {language === 'zh' ? 'Switch to English' : '切换到中文'}
      </button>
      <p>
        {t('home.title')} - {t('home.student')}
      </p>
    </div>
  );
}

// 主要应用容器
function AppContent() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <Router>
      <div className="min-h-screen bg-white dark:bg-black">
        {/* 简化的导航栏 */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-black shadow-md">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <Link to="/" className="text-2xl font-bold">Xindi Wang</Link>
              
              <div className="flex items-center space-x-6">
                <Link to="/" className="text-gray-700 dark:text-gray-300 hover:text-blue-600">{t('nav.home')}</Link>
                <Link to="/education" className="text-gray-700 dark:text-gray-300 hover:text-blue-600">{t('nav.education')}</Link>
                <Link to="/work" className="text-gray-700 dark:text-gray-300 hover:text-blue-600">{t('nav.work')}</Link>
                <Link to="/projects" className="text-gray-700 dark:text-gray-300 hover:text-blue-600">{t('nav.projects')}</Link>
                <Link to="/contact" className="text-gray-700 dark:text-gray-300 hover:text-blue-600">{t('nav.contact')}</Link>
                <button
                  onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')}
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  {language === 'zh' ? 'EN' : '中文'}
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* 主内容区域 */}
        <main className="pt-20 pb-10 px-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/education" element={<Education />} />
            <Route path="/work" element={<WorkExperience />} />
            <Route path="/projects" element={<ProjectsAndAwards />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/test" element={<TestPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AdminProvider>
        <AppContent />
      </AdminProvider>
    </LanguageProvider>
  );
}

export default App;
