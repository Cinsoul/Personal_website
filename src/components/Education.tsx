import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

interface Education {
  id?: string;
  institution: string;
  degree: string;
  location: string;
  startDate: string;
  endDate: string;
  gpa?: string;
  courses: string;
}

// 解析日期字符串为时间戳，用于排序
const parseDate = (dateStr: string): number => {
  // 格式如 "Aug 2024" 或 "Sep 2022"
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
const sortByDate = (a: Education, b: Education): number => {
  const dateA = parseDate(a.startDate);
  const dateB = parseDate(b.startDate);
  return dateB - dateA;
};

export default function Education() {
  const [isLoaded, setIsLoaded] = useState(false);
  const { t } = useLanguage();
  const [educations, setEducations] = useState<Education[]>([]);
  // 添加管理按钮显示状态
  const [showAdmin, setShowAdmin] = useState(false);

  // 添加特殊按键组合监听，用于显示管理按钮
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        console.log('教育管理员模式已激活');
        setShowAdmin(true);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    setIsLoaded(true);
    
    // 从localStorage中加载教育经历
    const savedEducations = localStorage.getItem('educations');
    if (savedEducations) {
      // 加载后自动排序
      const parsed = JSON.parse(savedEducations);
      setEducations(parsed.sort(sortByDate));
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className={`transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Education</h2>
            {/* 只在管理员模式激活时显示管理按钮 */}
            {showAdmin && (
              <Link 
                to="/education-manager" 
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t('education.manage') || '管理教育经历'}
              </Link>
            )}
          </div>
          
          {educations.length > 0 ? (
            educations.map((education) => (
              <div key={education.id} className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{education.institution}</h3>
                    <p className="text-gray-600 dark:text-gray-300">{education.degree}</p>
                    {education.gpa && <p className="text-gray-600 dark:text-gray-300">GPA: {education.gpa}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-gray-600 dark:text-gray-300">{education.location}</p>
                    <p className="text-gray-600 dark:text-gray-300">{education.startDate} – {education.endDate}</p>
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300">
                  <span className="font-semibold">Core Courses:</span> {education.courses}
                </p>
              </div>
            ))
          ) : (
            <>
              {/* ESSEC */}
              <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">ESSEC</h3>
                    <p className="text-gray-600 dark:text-gray-300">Exchange Program, Global BBA</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-600 dark:text-gray-300">Paris, France</p>
                    <p className="text-gray-600 dark:text-gray-300">Aug 2024 – Aug 2025</p>
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300">
                  <span className="font-semibold">Core Course:</span> Luxury Brand Management, Finance 1, Beginner French, Doing Business in China, European Economics
                </p>
              </div>

              {/* Bayes Business School */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Bayes Business School, City, University of London</h3>
                    <p className="text-gray-600 dark:text-gray-300">BSc Business with Finance</p>
                    <p className="text-gray-600 dark:text-gray-300">GPA: 3.3/4</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-600 dark:text-gray-300">London, UK</p>
                    <p className="text-gray-600 dark:text-gray-300">Sep 2022 - Jun 2026</p>
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300">
                  <span className="font-semibold">Core Courses:</span> Marketing, Management, Critical Analysis, Operation & Supply Chain Management, Economics, Financial & Management Accounting, Financial Market, Business Law
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}