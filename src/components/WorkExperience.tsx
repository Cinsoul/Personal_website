import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAdmin } from '../contexts/AdminContext';
import { getBasePath } from '../utils/imageUtils';

interface WorkExperience {
  id?: string;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  responsibilities: string[];
}

// 解析日期字符串为时间戳，用于排序
const parseDate = (dateStr: string): number => {
  // 格式如 "Mar 2023" 或 "Dec 2022"
  const months = {
    'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
    'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
  };
  
  const parts = dateStr.split(' ');
  if (parts.length !== 2) return 0;
  
  const month = months[parts[0] as keyof typeof months] || 0;
  const year = parseInt(parts[1]);
  
  return new Date(year, month).getTime();
};

// 按开始日期降序排序（最新的在前）
const sortByDate = (a: WorkExperience, b: WorkExperience): number => {
  const dateA = parseDate(a.startDate);
  const dateB = parseDate(b.startDate);
  return dateB - dateA;
};

export default function WorkExperience() {
  const { t } = useLanguage();
  const { isAdminMode } = useAdmin();
  const [workExperiences, setWorkExperiences] = useState<WorkExperience[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 从JSON文件加载工作经验数据
  const loadWorkExperienceData = async () => {
    try {
      // 首先尝试从localStorage加载数据
      const savedExperiences = localStorage.getItem('workExperiences');
      if (savedExperiences) {
        const parsed = JSON.parse(savedExperiences);
        if (Array.isArray(parsed) && parsed.length > 0) {
          console.log('从localStorage加载工作经验数据:', parsed.length, '条记录');
          setWorkExperiences(parsed.sort(sortByDate));
          setIsLoaded(true);
          setIsLoading(false);
          return;
        }
      }
      
      // 如果localStorage中没有数据，则从文件加载
      console.log('尝试从JSON文件加载工作经验数据');
      const basePath = getBasePath();
      const response = await fetch(`${basePath}/data/work-experience-data.json`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.workExperiences && Array.isArray(data.workExperiences)) {
          const sortedExperiences = data.workExperiences.sort(sortByDate);
          setWorkExperiences(sortedExperiences);
          
          // 也保存到localStorage便于后续使用
          localStorage.setItem('workExperiences', JSON.stringify(sortedExperiences));
          console.log('从文件加载了工作经验数据:', sortedExperiences.length, '条记录');
        }
      } else {
        // 如果文件不存在或加载失败，使用空数组
        console.warn('无法加载工作经验数据文件，使用空数组');
        setWorkExperiences([]);
      }
    } catch (error) {
      console.error('加载工作经验数据出错:', error);
      setWorkExperiences([]);
    } finally {
      setIsLoaded(true);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWorkExperienceData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className={`transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t('work.title')}</h2>
            {/* 使用全局isAdminMode来显示管理按钮 */}
            {isAdminMode && (
              <Link to="/work-experience-manager" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                {t('work.manage')}
              </Link>
            )}
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : workExperiences.length > 0 ? (
            workExperiences.map((experience) => (
              <div key={experience.id} className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{experience.company}</h3>
                    <p className="text-gray-600 dark:text-gray-300">{experience.position}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-600 dark:text-gray-300">{experience.location}</p>
                    <p className="text-gray-600 dark:text-gray-300">{experience.startDate} – {experience.endDate}</p>
                  </div>
                </div>
                <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                  {experience.responsibilities.map((responsibility, index) => (
                    <li key={index}>{responsibility}</li>
                  ))}
                </ul>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-gray-500 dark:text-gray-400">
              {t('work.empty')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}