import { useEffect } from 'react';
import { useAdmin } from '../contexts/AdminContext';
import { useNavigate } from 'react-router-dom';

export default function AdminTest() {
  const { isAuthenticated, isAdminMode } = useAdmin();
  const navigate = useNavigate();
  
  useEffect(() => {
    console.log('AdminTest 页面加载');
    console.log('认证状态:', { isAuthenticated, isAdminMode });
    
    // 测试localStorage
    try {
      localStorage.setItem('test-write', 'ok');
      const readTest = localStorage.getItem('test-write');
      console.log('localStorage 测试:', readTest === 'ok' ? '正常' : '异常');
      localStorage.removeItem('test-write');
      
      // 显示认证状态
      const authState = localStorage.getItem('adminAuthenticated');
      console.log('adminAuthenticated 值:', authState);
    } catch (e) {
      console.error('localStorage 错误:', e);
    }
  }, [isAuthenticated, isAdminMode]);
  
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <h1 className="text-2xl font-bold mb-4">管理员功能测试页面</h1>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <p>认证状态: {isAuthenticated ? '已认证' : '未认证'}</p>
        <p>管理模式: {isAdminMode ? '已激活' : '未激活'}</p>
        
        <div className="mt-4 space-y-2">
          <button 
            onClick={() => localStorage.setItem('adminAuthenticated', 'true')}
            className="px-4 py-2 bg-green-500 text-white rounded"
          >
            直接设置认证状态
          </button>
          
          <button 
            onClick={() => navigate('/projects-manager')}
            className="px-4 py-2 bg-blue-500 text-white rounded ml-2"
          >
            导航到项目管理
          </button>
        </div>
      </div>
    </div>
  );
}
