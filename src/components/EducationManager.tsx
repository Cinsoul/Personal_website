import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
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

export default function EducationManager() {
  // 获取语言上下文
  const { t } = useLanguage();
  
  // 状态管理
  const [educations, setEducations] = useState<Education[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEducation, setCurrentEducation] = useState<Education>({
    institution: '',
    degree: '',
    location: '',
    startDate: '',
    endDate: '',
    gpa: '',
    courses: ''
  });

  // 从本地存储加载数据
  useEffect(() => {
    const savedEducations = localStorage.getItem('educations');
    
    if (savedEducations) {
      // 加载后自动排序
      const parsed = JSON.parse(savedEducations);
      setEducations(parsed.sort(sortByDate));
    } else {
      // 默认教育经历数据
      const defaultEducations = [
        {
          id: '1',
          institution: 'ESSEC',
          degree: 'Exchange Program, Global BBA',
          location: 'Paris, France',
          startDate: 'Aug 2024',
          endDate: 'Aug 2025',
          courses: 'Luxury Brand Management, Finance 1, Beginner French, Doing Business in China, European Economics'
        },
        {
          id: '2',
          institution: 'Bayes Business School, City, University of London',
          degree: 'BSc Business with Finance',
          location: 'London, UK',
          startDate: 'Sep 2022',
          endDate: 'Jun 2026',
          gpa: '3.3/4',
          courses: 'Marketing, Management, Critical Analysis, Operation & Supply Chain Management, Economics, Financial & Management Accounting, Financial Market, Business Law'
        }
      ];
      setEducations(defaultEducations.sort(sortByDate));
      localStorage.setItem('educations', JSON.stringify(defaultEducations));
    }
  }, []);

  // 保存数据到本地存储
  useEffect(() => {
    if (educations.length > 0) {
      localStorage.setItem('educations', JSON.stringify(educations));
    }
  }, [educations]);

  // 处理表单输入变化
  const handleEducationChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentEducation({
      ...currentEducation,
      [name]: value
    });
  };

  // 保存教育经历
  const saveEducation = (e: FormEvent) => {
    e.preventDefault();
    
    if (isEditing && currentEducation.id) {
      // 更新现有经历
      const updatedEducations = educations.map(edu => 
        edu.id === currentEducation.id ? currentEducation : edu
      );
      // 保存时自动排序
      setEducations(updatedEducations.sort(sortByDate));
    } else {
      // 添加新经历
      const newEducation = {
        ...currentEducation,
        id: Date.now().toString()
      };
      // 保存时自动排序
      setEducations([...educations, newEducation].sort(sortByDate));
    }
    
    resetEducationForm();
  };

  // 编辑教育经历
  const editEducation = (education: Education) => {
    setCurrentEducation(education);
    setIsEditing(true);
  };

  // 删除教育经历
  const deleteEducation = (id: string) => {
    if (window.confirm(t('manager.delete.confirm'))) {
      setEducations(educations.filter(edu => edu.id !== id));
    }
  };

  // 重置表单
  const resetEducationForm = () => {
    setCurrentEducation({
      institution: '',
      degree: '',
      location: '',
      startDate: '',
      endDate: '',
      gpa: '',
      courses: ''
    });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('manager.education.title') || '教育经历管理'}</h1>
          <Link to="/" className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
            {t('manager.back') || '返回'}
          </Link>
        </div>
        
        {/* 教育经历管理部分 */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('education.manager.add_edit') || '添加/编辑教育经历'}</h2>
          
          {/* 教育经历表单 */}
          <form onSubmit={saveEducation} className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="institution">
                  {t('education.manager.institution') || '学校/机构名称'}
                </label>
                <input
                  type="text"
                  id="institution"
                  name="institution"
                  value={currentEducation.institution}
                  onChange={handleEducationChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="degree">
                  {t('education.manager.degree') || '学位/项目'}
                </label>
                <input
                  type="text"
                  id="degree"
                  name="degree"
                  value={currentEducation.degree}
                  onChange={handleEducationChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="location">
                  {t('education.manager.location') || '地点'}
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={currentEducation.location}
                  onChange={handleEducationChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="gpa">
                  {t('education.manager.gpa') || 'GPA (可选)'}
                </label>
                <input
                  type="text"
                  id="gpa"
                  name="gpa"
                  value={currentEducation.gpa}
                  onChange={handleEducationChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="startDate">
                  {t('education.manager.startDate') || '开始日期 (如: Sep 2022)'}
                </label>
                <input
                  type="text"
                  id="startDate"
                  name="startDate"
                  value={currentEducation.startDate}
                  onChange={handleEducationChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                  placeholder="例如: Sep 2022"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="endDate">
                  {t('education.manager.endDate') || '结束日期 (如: Jun 2026)'}
                </label>
                <input
                  type="text"
                  id="endDate"
                  name="endDate"
                  value={currentEducation.endDate}
                  onChange={handleEducationChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                  placeholder="例如: Jun 2026"
                />
              </div>
            </div>
            
            <div className="mt-6">
              <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="courses">
                {t('education.manager.courses') || '核心课程'}
              </label>
              <textarea
                id="courses"
                name="courses"
                value={currentEducation.courses}
                onChange={handleEducationChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                rows={3}
                required
              ></textarea>
            </div>
            
            <div className="mt-6 flex justify-end space-x-2">
              <button
                type="button"
                onClick={resetEducationForm}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                {t('manager.cancel') || '取消'}
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 rounded-lg text-white hover:bg-blue-700 transition-colors"
              >
                {isEditing ? (t('manager.update') || '更新') : (t('manager.add') || '添加')}
              </button>
            </div>
          </form>
          
          {/* 现有教育经历列表 */}
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{t('education.manager.existing') || '现有教育经历'}</h3>
            <div className="space-y-4">
              {educations.map((education) => (
                <div key={education.id} className="border dark:border-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white">{education.institution}</h4>
                      <p className="text-gray-600 dark:text-gray-400">{education.degree}</p>
                      {education.gpa && <p className="text-gray-600 dark:text-gray-400">GPA: {education.gpa}</p>}
                    </div>
                    <div className="text-right">
                      <p className="text-gray-600 dark:text-gray-400">{education.location}</p>
                      <p className="text-gray-600 dark:text-gray-400">{education.startDate} – {education.endDate}</p>
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('education.manager.courses') || '核心课程'}:</h5>
                    <p className="text-gray-700 dark:text-gray-300">{education.courses}</p>
                  </div>
                  
                  <div className="mt-4 flex justify-end space-x-2">
                    <button
                      onClick={() => editEducation(education)}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      {t('manager.edit') || '编辑'}
                    </button>
                    <button
                      onClick={() => deleteEducation(education.id!)}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                      {t('manager.delete') || '删除'}
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