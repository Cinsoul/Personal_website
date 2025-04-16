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
  // 先初始化状态为false
  const [isAdminMode, setAdminMode] = useState(false);
  const [isAuthenticated, setAuthenticated] = useState(false);
  
  // 从localStorage加载认证状态 - 在组件挂载时
  useEffect(() => {
    console.log('AdminContext：初始化');
    try {
      const savedAuthState = localStorage.getItem('adminAuthenticated');
      console.log('AdminContext：localStorage中的认证状态:', savedAuthState);
      
      if (savedAuthState === 'true') {
        console.log('AdminContext：检测到已保存的认证状态，恢复状态');
        setAuthenticated(true);
        setAdminMode(true);
      }
    } catch (error) {
      console.error('AdminContext：访问localStorage出错', error);
    }
  }, []);

  // 监听认证状态变化，保存到localStorage
  useEffect(() => {
    console.log('AdminContext：认证状态变化:', isAuthenticated);
    try {
      if (isAuthenticated) {
        localStorage.setItem('adminAuthenticated', 'true');
        setAdminMode(true);
      } else {
        localStorage.removeItem('adminAuthenticated');
      }
    } catch (error) {
      console.error('AdminContext：更新localStorage出错', error);
    }
  }, [isAuthenticated]);

  // 登出功能
  const logout = () => {
    console.log('AdminContext：执行登出');
    setAuthenticated(false);
    setAdminMode(false);
    try {
      localStorage.removeItem('adminAuthenticated');
    } catch (error) {
      console.error('AdminContext：登出时清除localStorage出错', error);
    }
  };

  const contextValue = {
    isAdminMode,
    setAdminMode,
    isAuthenticated,
    setAuthenticated,
    logout
  };

  return (
    <AdminContext.Provider value={contextValue}>
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
