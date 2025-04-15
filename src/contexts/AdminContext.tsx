import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

// 定义上下文类型
interface AdminContextType {
  isAdminMode: boolean;
  setAdminMode: (value: boolean) => void;
  isAuthenticated: boolean;
  setAuthenticated: (value: boolean) => void;
  logout: () => void;
}

// 创建上下文
const AdminContext = createContext<AdminContextType | undefined>(undefined);

// 创建Provider组件
export const AdminProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAdminMode, setAdminMode] = useState(false);
  const [isAuthenticated, setAuthenticated] = useState(false);

  // 从localStorage加载认证状态
  useEffect(() => {
    const savedAuthState = localStorage.getItem('adminAuthenticated');
    if (savedAuthState === 'true') {
      setAuthenticated(true);
      setAdminMode(true);
    }
  }, []);

  // 监听认证状态变化，保存到localStorage
  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem('adminAuthenticated', 'true');
      setAdminMode(true);
    } else {
      localStorage.removeItem('adminAuthenticated');
    }
  }, [isAuthenticated]);

  // 监听特殊按键组合（保留现有功能，但仅作为备用）
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        console.log('全局管理员模式已激活');
        setAdminMode(true);
        // 不设置isAuthenticated，因为这只是临时访问
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 登出功能
  const logout = () => {
    setAuthenticated(false);
    setAdminMode(false);
    localStorage.removeItem('adminAuthenticated');
    console.log('管理员已登出');
  };

  return (
    <AdminContext.Provider value={{ 
      isAdminMode, 
      setAdminMode, 
      isAuthenticated, 
      setAuthenticated,
      logout
    }}>
      {children}
    </AdminContext.Provider>
  );
};

// 创建自定义Hook
export const useAdmin = (): AdminContextType => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin必须在AdminProvider内使用');
  }
  return context;
}; 