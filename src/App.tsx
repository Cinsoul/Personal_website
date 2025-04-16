import { LanguageProvider, useLanguage } from './contexts/LanguageContext';
import { AdminProvider } from './contexts/AdminContext';

// 简单的Home组件作为临时测试用途
function SimpleHome() {
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

function App() {
  return (
    <LanguageProvider>
      <AdminProvider>
        <SimpleHome />
      </AdminProvider>
    </LanguageProvider>
  );
}

export default App;
