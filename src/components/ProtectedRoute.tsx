import { Navigate } from 'react-router-dom';
import { useAdmin } from '../contexts/AdminContext';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isAdminMode } = useAdmin();
  
  // 关键变更：同时接受isAuthenticated和isAdminMode任一状态
  if (!isAuthenticated && !isAdminMode) {
    console.log('未授权访问，重定向到主页');
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

export const UnauthenticatedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isAdminMode } = useAdmin();
  
  // 同样地，同时检查两个状态
  if (isAuthenticated || isAdminMode) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};
