import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAdmin } from '../contexts/AdminContext';
import { useState, useEffect } from 'react';
import { Project } from '../types/Project';

export default function Projects() {
  const { t } = useLanguage();
  const { isAdminMode } = useAdmin();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // 移除局部管理员状态
  // const [showAdmin, setShowAdmin] = useState(false);
  
  // 移除局部按键监听逻辑
  // useEffect(() => {
  //   const handleKeyDown = (e: KeyboardEvent) => {
  //     if (e.ctrlKey && e.shiftKey && e.key === 'A') {
  //       console.log('项目管理员模式已激活');
  //       setShowAdmin(true);
  //     }
  //   };
    
  //   window.addEventListener('keydown', handleKeyDown);
  //   return () => window.removeEventListener('keydown', handleKeyDown);
  // }, []);

  return (
    <div className="flex justify-between items-center mb-8">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t('projects.title')}</h2>
      {/* 使用全局isAdminMode来显示管理按钮 */}
      {isAdminMode && (
        <Link to="/projects-manager" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          {t('projects.manage')}
        </Link>
      )}
    </div>
  );
} 