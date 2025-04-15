import { HashRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';
import ProjectsAndAwards from './components/ProjectsAndAwards';
import ProjectsManager from './components/ProjectsManager';
import WorkExperienceManager from './components/WorkExperienceManager';
import CertificationsManager from './components/CertificationsManager';
import EducationManager from './components/EducationManager';
import ViewerDemo from './pages/ViewerDemo';
import AdminLogin from './pages/AdminLogin';

import Home from './components/Home';
import Education from './components/Education';
import WorkExperience from './components/WorkExperience';
import SchoolExperience from './components/SchoolExperience';
import Certifications from './components/Certifications';
import Contact from './components/Contact';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { AdminProvider, useAdmin } from './contexts/AdminContext';

// 受保护路由高阶组件
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAdminMode, isAuthenticated } = useAdmin();
  const location = useLocation();
  
  // 如果既不是管理员模式也没有认证，重定向到登录页面
  if (!isAdminMode && !isAuthenticated) {
    console.log('未授权访问管理页面，重定向到登录页面');
    // 保存当前页面路径，以便登录后返回
    return <Navigate to="/admin-login" replace state={{ from: location.pathname }} />;
  }
  
  return <>{children}</>;
};

// 如果已认证，重定向到首页
const UnauthenticatedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAdmin();
  
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

function AppContent() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const { isAdminMode, logout } = useAdmin();

  return (
    <Router>
        <div className="min-h-screen bg-white dark:bg-black">
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Link to="/" className="text-xl font-medium text-gray-900 dark:text-white" style={{ letterSpacing: '-0.01em' }}>Xindi (Arthur) Wang</Link>
              </div>
              
              {/* Mobile menu button */}
              <div className="flex items-center md:hidden">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  {isMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
                </button>
              </div>

              {/* Desktop menu */}
              <div className="hidden md:flex md:items-center md:space-x-8">
                <Link to="/" className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">{t('nav.home')}</Link>
                <Link to="/education" className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">{t('nav.education')}</Link>
                <Link to="/work" className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">{t('nav.work')}</Link>
                <Link to="/school" className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">{t('nav.school')}</Link>
                <Link to="/certifications" className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">{t('nav.certifications')}</Link>
                <Link to="/contact" className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">{t('nav.contact')}</Link>
                <Link to="/projects" className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">{t('nav.projects')}</Link>
                {isAdminMode && (
                  <button
                    onClick={logout}
                    className="text-sm font-medium text-red-500 hover:text-red-700 transition-colors"
                  >
                    {t('nav.logout') || '登出'}
                  </button>
                )}
                <button
                  onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')}
                  className="text-sm font-medium text-[var(--apple-blue)] hover:text-[var(--apple-blue-hover)] transition-colors"
                >
                  {t('language.switch')}
                </button>
              </div>
            </div>

            {/* Mobile menu */}
            <div className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'} transition-all duration-300 ease-in-out`}>
              <div className="px-2 pt-2 pb-3 space-y-1">
                <Link to="/" className="block px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">{t('nav.home')}</Link>
                <Link to="/education" className="block px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">{t('nav.education')}</Link>
                <Link to="/work" className="block px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">{t('nav.work')}</Link>
                <Link to="/school" className="block px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">{t('nav.school')}</Link>
                <Link to="/certifications" className="block px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">{t('nav.certifications')}</Link>
                <Link to="/contact" className="block px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">{t('nav.contact')}</Link>
                <Link to="/projects" className="block px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">{t('nav.projects')}</Link>
                {isAdminMode && (
                  <button
                    onClick={logout}
                    className="block w-full text-left px-3 py-2 text-sm font-medium text-red-500 hover:text-red-700 transition-colors"
                  >
                    {t('nav.logout') || '登出'}
                  </button>
                )}
                <button
                  onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')}
                  className="block w-full text-left px-3 py-2 text-sm font-medium text-[var(--apple-blue)] hover:text-[var(--apple-blue-hover)] transition-colors"
                >
                  {t('language.switch')}
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Main content */}
        <main className="pt-16 min-h-screen transition-all duration-500 ease-out">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/education" element={<Education />} />
            <Route path="/work" element={<WorkExperience />} />
            <Route path="/school" element={<SchoolExperience />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/certifications" element={<Certifications />} />
            <Route path="/projects" element={<ProjectsAndAwards />} />
            <Route path="/viewer-demo" element={<ViewerDemo />} />
            
            {/* 登录页面路由 */}
            <Route path="/admin-login" element={
              <UnauthenticatedRoute>
                <AdminLogin />
              </UnauthenticatedRoute>
            } />
            
            {/* 受保护的管理页面路由 */}
            <Route path="/projects-manager" element={
              <ProtectedRoute>
                <ProjectsManager />
              </ProtectedRoute>
            } />
            <Route path="/work-experience-manager" element={
              <ProtectedRoute>
                <WorkExperienceManager />
              </ProtectedRoute>
            } />
            <Route path="/education-manager" element={
              <ProtectedRoute>
                <EducationManager />
              </ProtectedRoute>
            } />
            <Route path="/certifications-manager" element={
              <ProtectedRoute>
                <CertificationsManager />
              </ProtectedRoute>
            } />
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

export default App
