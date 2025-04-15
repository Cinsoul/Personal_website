import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAdmin } from '../contexts/AdminContext';

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

  useEffect(() => {
    setIsLoaded(true);
    
    // 从localStorage加载工作经历数据
    const savedExperiences = localStorage.getItem('workExperiences');
    if (savedExperiences) {
      // 加载后自动排序
      const parsed = JSON.parse(savedExperiences);
      setWorkExperiences(parsed.sort(sortByDate));
    }
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
          
          {workExperiences.length > 0 ? (
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
            <>
              {/* Starbucks */}
              <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Starbucks {t('work.parttime')}</h3>
                    <p className="text-gray-600 dark:text-gray-300">Barista</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-600 dark:text-gray-300">London, UK</p>
                    <p className="text-gray-600 dark:text-gray-300">Mar 2023 – Aug 2024</p>
                  </div>
                </div>
                <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                  <li>Sales & Operations Support: Promote seasonal new products in the store according to customer needs, improve new product sales, and promote the store's overall revenue growth</li>
                  <li>Marketing Skills: Successful promotion of seasonal beverage sales, with sales growth of 15%</li>
                </ul>
              </div>

              {/* UKpathway Consultancy Group */}
              <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">UKpathway Consultancy Group {t('work.parttime')}</h3>
                    <p className="text-gray-600 dark:text-gray-300">Marketing Department</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-600 dark:text-gray-300">Remote</p>
                    <p className="text-gray-600 dark:text-gray-300">Dec 2022 – Feb 2023</p>
                  </div>
                </div>
                <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                  <li>Promote Products: Introduce company services on social media</li>
                  <li>Analyse Services: Analyse and highlight the advantages of services and compare them with other companies services</li>
                </ul>
              </div>

              {/* MUJI */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">MUJI {t('work.parttime')}</h3>
                    <p className="text-gray-600 dark:text-gray-300">Sales Consultant</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-600 dark:text-gray-300">Fuzhou, China</p>
                    <p className="text-gray-600 dark:text-gray-300">Oct 2021 – Jun 2022</p>
                  </div>
                </div>
                <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                  <li>Teamwork: Collaborate with the team on promotional activities to increase sales by 10% through effective communication and execution</li>
                  <li>Personal Achievement: Assist in optimising inventory management processes and increase product turnover efficiency by 15%</li>
                  <li>Insight: Learn how brands operate globally and understand how they differentiate themselves in their local markets</li>
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}