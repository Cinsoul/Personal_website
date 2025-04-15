import { useState, FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAdmin } from '../contexts/AdminContext';
import { useLanguage } from '../contexts/LanguageContext';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setAuthenticated } = useAdmin();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  
  // 处理登录提交
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // 模拟验证过程
    setTimeout(() => {
      // 这里应该替换为您的实际密码
      const correctPassword = 'admin123';
      
      if (password === correctPassword) {
        // 设置认证状态而不是管理模式
        setAuthenticated(true);
        
        // 确定从哪里跳转来的，如果有state.from则返回那里，否则去首页
        const from = location.state?.from || '/';
        
        navigate(from, { replace: true });
      } else {
        setError(t('admin.login.error') || '密码不正确');
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-10 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            {t('admin.login.title') || '管理员登录'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            {t('admin.login.subtitle') || '请输入管理员密码以继续'}
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="password" className="sr-only">{t('admin.login.password') || '密码'}</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder={t('admin.login.password') || '密码'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors`}
            >
              {loading ? (
                <>
                  <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                    <svg className="animate-spin h-5 w-5 text-blue-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </span>
                  {t('admin.login.processing') || '正在处理...'}
                </>
              ) : (
                t('admin.login.submit') || '登录'
              )}
            </button>
          </div>
          
          <div className="text-center">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            >
              {t('admin.login.back_to_home') || '返回首页'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 