import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAdmin } from '../contexts/AdminContext';

export default function Projects() {
  const { t } = useLanguage();
  const { isAdminMode } = useAdmin();

  return (
    <div className="flex justify-between items-center mb-8">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t('projects.title')}</h2>
      {isAdminMode && (
        <Link to="/projects-manager" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          {t('projects.manage')}
        </Link>
      )}
    </div>
  );
} 