import React, { useState, useEffect } from 'react';
import { 
  getGitHubPAT, 
  saveGitHubPAT, 
  clearGitHubPAT, 
  getDefaultGitHubConfig, 
  GitHubSyncOptions,
  hasGitHubPAT
} from '../utils/githubSync';
import { useLanguage } from '../contexts/LanguageContext';

interface GitHubSyncProps {
  onClose: () => void;
  onSuccess: () => void;
}

const GitHubSync: React.FC<GitHubSyncProps> = ({ onClose, onSuccess }) => {
  const { t } = useLanguage();
  const [token, setToken] = useState('');
  const [owner, setOwner] = useState('');
  const [repo, setRepo] = useState('');
  const [branch, setBranch] = useState('main');
  const [rememberToken, setRememberToken] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  // 初始化GitHubSync配置
  useEffect(() => {
    // 检查是否已保存token
    const hasTokenSaved = hasGitHubPAT();
    setHasToken(hasTokenSaved);
    
    // 加载默认配置
    const defaultConfig = getDefaultGitHubConfig();
    setOwner(defaultConfig.owner);
    setRepo(defaultConfig.repo);
    setBranch(defaultConfig.branch || 'main');
    
    // 如果已保存token，尝试获取它（虽然我们不会显示它，但会用星号表示）
    if (hasTokenSaved) {
      setToken('••••••••••••••••••••••••••'); // 用于UI显示
    }
  }, []);

  // 保存GitHub配置
  const saveConfiguration = () => {
    setError('');
    setSuccess('');
    setIsLoading(true);
    
    try {
      // 保存token（如果提供了新token）
      if (token && !token.includes('•')) {
        saveGitHubPAT(token, rememberToken);
      }
      
      // 保存仓库所有者信息
      localStorage.setItem('github_owner', owner);
      
      // 更新成功状态
      setSuccess('GitHub配置已保存！');
      setHasToken(true);
      
      // 通知父组件保存成功
      onSuccess();
      
      // 3秒后关闭
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (error) {
      console.error('保存GitHub配置出错:', error);
      setError('保存配置时出错，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  // 清除GitHub配置
  const clearConfiguration = () => {
    if (window.confirm('确定要清除所有GitHub配置吗？这将移除保存的访问令牌。')) {
      clearGitHubPAT();
      setToken('');
      setHasToken(false);
      setSuccess('GitHub配置已清除');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          GitHub同步设置
        </h3>
        
        <div className="mb-6 space-y-4">
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            要将项目数据自动同步到GitHub仓库，您需要提供GitHub个人访问令牌(PAT)和仓库信息。
          </p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                GitHub个人访问令牌 (PAT)
              </label>
              <input 
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="例如: ghp_abcdefghijklmnopqrstuvwxyz"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                需要repo权限。请访问 
                <a 
                  href="https://github.com/settings/tokens/new" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  GitHub Token设置
                </a> 
                创建。
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                仓库所有者
              </label>
              <input 
                type="text"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                placeholder="例如: Cinsoul"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                仓库名称
              </label>
              <input 
                type="text"
                value={repo}
                onChange={(e) => setRepo(e.target.value)}
                placeholder="例如: Personal_website"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                默认分支
              </label>
              <input 
                type="text"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                placeholder="例如: main"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
              />
            </div>
            
            <div className="flex items-center">
              <input 
                id="remember-token"
                type="checkbox"
                checked={rememberToken}
                onChange={(e) => setRememberToken(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-token" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                保存访问令牌（在此设备上）
              </label>
            </div>
          </div>
          
          {error && (
            <div className="bg-red-50 dark:bg-red-900 p-3 rounded-md">
              <p className="text-red-700 dark:text-red-200 text-sm">{error}</p>
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 dark:bg-green-900 p-3 rounded-md">
              <p className="text-green-700 dark:text-green-200 text-sm">{success}</p>
            </div>
          )}
          
          {hasToken && (
            <div className="bg-blue-50 dark:bg-blue-900 p-3 rounded-md">
              <p className="text-blue-700 dark:text-blue-200 text-sm">✓ 已配置GitHub同步</p>
            </div>
          )}
        </div>
        
        <div className="flex justify-between">
          <div>
            {hasToken && (
              <button
                onClick={clearConfiguration}
                className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 focus:outline-none"
                disabled={isLoading}
              >
                清除配置
              </button>
            )}
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none"
              disabled={isLoading}
            >
              取消
            </button>
            <button
              onClick={saveConfiguration}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none disabled:bg-blue-400"
              disabled={isLoading || (!token && !hasToken) || !owner || !repo}
            >
              {isLoading ? '保存中...' : '保存配置'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GitHubSync; 