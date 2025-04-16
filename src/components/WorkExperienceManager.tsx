import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { syncDataToGitHubRepo } from '../utils/fileUtils';

// 添加防抖工具函数
const debounce = (func: Function, wait: number) => {
  let timeout: number;
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

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

export default function WorkExperienceManager() {
  // 获取语言上下文
  const { t } = useLanguage();
  
  // 状态管理
  const [experiences, setExperiences] = useState<WorkExperience[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentExperience, setCurrentExperience] = useState<WorkExperience>({
    company: '',
    position: '',
    location: '',
    startDate: '',
    endDate: '',
    responsibilities: []
  });
  const [responsibilityInput, setResponsibilityInput] = useState('');
  
  // 添加同步状态
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncMessage, setSyncMessage] = useState('');

  // 从本地存储加载数据
  useEffect(() => {
    const savedExperiences = localStorage.getItem('workExperiences');
    
    if (savedExperiences) {
      // 加载后自动排序
      const parsed = JSON.parse(savedExperiences);
      setExperiences(parsed.sort(sortByDate));
    } else {
      // 默认工作经历数据
      const defaultExperiences = [
        {
          id: '1',
          company: 'Starbucks',
          position: 'Barista',
          location: 'London, UK',
          startDate: 'Mar 2023',
          endDate: 'Aug 2024',
          responsibilities: [
            'Sales & Operations Support: Promote seasonal new products in the store according to customer needs, improve new product sales, and promote the store\'s overall revenue growth',
            'Marketing Skills: Successful promotion of seasonal beverage sales, with sales growth of 15%'
          ]
        },
        {
          id: '2',
          company: 'UKpathway Consultancy Group',
          position: 'Marketing Department',
          location: 'Remote',
          startDate: 'Dec 2022',
          endDate: 'Feb 2023',
          responsibilities: [
            'Promote Products: Introduce company services on social media',
            'Analyse Services: Analyse and highlight the advantages of services and compare them with other companies services'
          ]
        },
        {
          id: '3',
          company: 'MUJI',
          position: 'Sales Consultant',
          location: 'Fuzhou, China',
          startDate: 'Oct 2021',
          endDate: 'Jun 2022',
          responsibilities: [
            'Teamwork: Collaborate with the team on promotional activities to increase sales by 10% through effective communication and execution',
            'Personal Achievement: Assist in optimising inventory management processes and increase product turnover efficiency by 15%',
            'Insight: Learn how brands operate globally and understand how they differentiate themselves in their local markets'
          ]
        }
      ];
      // 初始化数据时排序
      setExperiences(defaultExperiences.sort(sortByDate));
      localStorage.setItem('workExperiences', JSON.stringify(defaultExperiences));
    }
  }, []);

  // 添加自动同步到GitHub功能
  const autoSyncToGitHub = async () => {
    try {
      // 如果已经在同步中，则跳过
      if (isSyncing) {
        console.log('已有同步任务在进行中，跳过此次同步');
        return;
      }
      
      setIsSyncing(true);
      setSyncMessage('正在同步工作经验数据到GitHub...');
      
      const exportObject = {
        workExperiences: experiences,
        exportDate: new Date().toISOString(),
        version: '1.0'
      };
      
      const success = await syncDataToGitHubRepo(exportObject, { 
        targetFile: 'public/data/work-experience-data.json',
        commitMessage: '自动同步工作经验数据 [自动提交]'
      });
      
      if (success) {
        const now = new Date();
        setLastSyncTime(now);
        setSyncMessage(`上次同步: ${now.toLocaleTimeString()}`);
        console.log('工作经验数据已自动同步到GitHub', now.toLocaleTimeString());
      } else {
        setSyncMessage('同步失败，请检查GitHub配置');
        console.error('自动同步工作经验到GitHub失败');
      }
    } catch (error) {
      console.error('自动同步出错:', error);
      setSyncMessage('同步出错，请手动同步');
    } finally {
      setIsSyncing(false);
    }
  };
  
  // 创建防抖版本的同步函数 (5秒防抖)
  const debouncedAutoSync = debounce(autoSyncToGitHub, 5000);

  // 保存数据到本地存储
  useEffect(() => {
    if (experiences.length > 0) {
      localStorage.setItem('workExperiences', JSON.stringify(experiences));
      
      // 数据变更时触发自动同步
      debouncedAutoSync();
    }
  }, [experiences]);

  // 处理表单输入变化
  const handleExperienceChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentExperience({
      ...currentExperience,
      [name]: value
    });
  };

  // 处理职责输入
  const handleResponsibilityInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setResponsibilityInput(e.target.value);
  };

  // 添加职责
  const addResponsibility = () => {
    if (responsibilityInput.trim() !== '') {
      setCurrentExperience({
        ...currentExperience,
        responsibilities: [...currentExperience.responsibilities, responsibilityInput.trim()]
      });
      setResponsibilityInput('');
    }
  };

  // 移除职责
  const removeResponsibility = (index: number) => {
    const updatedResponsibilities = [...currentExperience.responsibilities];
    updatedResponsibilities.splice(index, 1);
    setCurrentExperience({
      ...currentExperience,
      responsibilities: updatedResponsibilities
    });
  };

  // 修改保存工作经历函数，添加自动同步
  const saveExperience = (e: FormEvent) => {
    e.preventDefault();
    
    if (isEditing && currentExperience.id) {
      // 更新现有经历
      const updatedExperiences = experiences.map(exp => 
        exp.id === currentExperience.id ? currentExperience : exp
      );
      // 保存时自动排序
      setExperiences(updatedExperiences.sort(sortByDate));
    } else {
      // 添加新经历
      const newExperience = {
        ...currentExperience,
        id: Date.now().toString()
      };
      // 保存时自动排序
      setExperiences([...experiences, newExperience].sort(sortByDate));
    }
    
    resetExperienceForm();
  };

  // 编辑工作经历
  const editExperience = (experience: WorkExperience) => {
    setCurrentExperience(experience);
    setIsEditing(true);
  };

  // 修改删除工作经历函数，添加自动同步
  const deleteExperience = (id: string) => {
    if (window.confirm(t('manager.delete.confirm'))) {
      setExperiences(experiences.filter(exp => exp.id !== id));
    }
  };

  // 重置表单
  const resetExperienceForm = () => {
    setCurrentExperience({
      company: '',
      position: '',
      location: '',
      startDate: '',
      endDate: '',
      responsibilities: []
    });
    setResponsibilityInput('');
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('manager.work.title')}</h1>
          <div className="flex items-center space-x-4">
            {/* 添加同步状态指示器 */}
            {isSyncing && (
              <span className="text-sm text-blue-600 dark:text-blue-400 flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                正在同步...
              </span>
            )}
            
            {!isSyncing && syncMessage && (
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {syncMessage}
              </span>
            )}
            
            <Link to="/" className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
              {t('manager.back')}
            </Link>
          </div>
        </div>
        
        {/* 工作经历管理部分 */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('work.manager.add_edit')}</h2>
          
          {/* 工作经历表单 */}
          <form onSubmit={saveExperience} className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="company">
                  {t('work.manager.company')}
                </label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={currentExperience.company}
                  onChange={handleExperienceChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="position">
                  {t('work.manager.position')}
                </label>
                <input
                  type="text"
                  id="position"
                  name="position"
                  value={currentExperience.position}
                  onChange={handleExperienceChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="location">
                {t('work.manager.location')}
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={currentExperience.location}
                onChange={handleExperienceChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="startDate">
                  {t('work.manager.start_date')}
                </label>
                <input
                  type="text"
                  id="startDate"
                  name="startDate"
                  value={currentExperience.startDate}
                  onChange={handleExperienceChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder={t('work.manager.start_date_placeholder')}
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="endDate">
                  {t('work.manager.end_date')}
                </label>
                <input
                  type="text"
                  id="endDate"
                  name="endDate"
                  value={currentExperience.endDate}
                  onChange={handleExperienceChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder={t('work.manager.end_date_placeholder')}
                  required
                />
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-gray-700 dark:text-gray-300 mb-2">
                {t('work.manager.responsibilities')}
              </label>
              <div className="flex items-center">
                <input
                  type="text"
                  value={responsibilityInput}
                  onChange={handleResponsibilityInputChange}
                  className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder={t('work.manager.input_responsibility')}
                />
                <button
                  type="button"
                  onClick={addResponsibility}
                  className="ml-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {t('work.manager.add')}
                </button>
              </div>
              
              <div className="mt-2 space-y-2">
                {currentExperience.responsibilities.map((responsibility, index) => (
                  <div key={index} className="flex items-start bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    <span className="flex-1 text-gray-800 dark:text-gray-200">{responsibility}</span>
                    <button
                      type="button"
                      onClick={() => removeResponsibility(index)}
                      className="ml-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                      {t('work.manager.delete')}
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-4">
              <button
                type="button"
                onClick={resetExperienceForm}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 dark:text-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {t('work.manager.cancel')}
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {isEditing ? t('work.manager.update') : t('work.manager.add_experience')}
              </button>
            </div>
          </form>
          
          {/* 工作经历列表 */}
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{t('work.manager.existing')}</h3>
            <div className="space-y-4">
              {experiences.map((experience) => (
                <div key={experience.id} className="border dark:border-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white">{experience.company}</h4>
                      <p className="text-gray-600 dark:text-gray-400">{experience.position}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-600 dark:text-gray-400">{experience.location}</p>
                      <p className="text-gray-600 dark:text-gray-400">{experience.startDate} – {experience.endDate}</p>
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('work.manager.responsibilities')}:</h5>
                    <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                      {experience.responsibilities.map((responsibility, index) => (
                        <li key={index}>{responsibility}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="mt-4 flex justify-end space-x-2">
                    <button
                      onClick={() => editExperience(experience)}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      {t('work.manager.edit')}
                    </button>
                    <button
                      onClick={() => deleteExperience(experience.id!)}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                      {t('work.manager.delete')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}