import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAdmin } from '../contexts/AdminContext';
import { triggerGitHubActionsSync, getDefaultGitHubConfig, hasGitHubPAT, GitHubSyncResponse } from '../utils/githubSync';

// 防抖函数，避免频繁触发同步
const debounce = (func: Function, wait: number) => {
  let timeout: ReturnType<typeof setTimeout>;
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// 生成唯一ID的函数，替代uuid库
const generateId = () => {
  return Date.now().toString() + '-' + Math.random().toString(36).substring(2, 9);
};

interface WorkExperience {
  id: string;
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
  const months: { [key: string]: number } = {
    'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
    'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
  };
  
  const parts = dateStr.split(' ');
  if (parts.length !== 2) return 0;
  
  const month = months[parts[0]] || 0;
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
  const { t } = useLanguage();
  const { isAdminMode } = useAdmin();
  const navigate = useNavigate();
  
  // 状态管理
  const [experiences, setExperiences] = useState<WorkExperience[]>([]);
  const [editingExperience, setEditingExperience] = useState<WorkExperience | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');
  const [hasPAT, setHasPAT] = useState(false);
  
  // 表单状态
  const [newResponsibility, setNewResponsibility] = useState('');

  // 从localStorage加载工作经验
  useEffect(() => {
    const loadExperiences = () => {
      const savedExperiences = localStorage.getItem('workExperiences');
      if (savedExperiences) {
        try {
          const parsed = JSON.parse(savedExperiences);
          if (Array.isArray(parsed)) {
            setExperiences(parsed.sort(sortByDate));
          }
        } catch (error) {
          console.error('解析工作经验数据出错:', error);
          setExperiences([]);
        }
      }
    };
    
    loadExperiences();
    setHasPAT(hasGitHubPAT());
  }, []);

  // 自动同步到GitHub
  const syncToGitHub = useCallback(async (data: WorkExperience[]) => {
    try {
      setIsSyncing(true);
      setSyncMessage('正在同步到GitHub...');
      
      const exportDate = new Date().toISOString();
      const workExperienceData = {
        exportDate,
        version: '1.0',
        workExperiences: data
      };
      
      const defaultConfig = getDefaultGitHubConfig();
      const result = await triggerGitHubActionsSync({
        data: workExperienceData,
        filename: 'work-experience-data.json',
        options: {
          ...defaultConfig,
          message: `更新工作经验数据 [${exportDate}]`
        }
      });
      
      if (result.success) {
        setSyncMessage('同步成功！');
        setTimeout(() => setSyncMessage(''), 3000);
      } else {
        setSyncMessage(`同步失败: ${result.error}`);
      }
    } catch (error) {
      console.error('GitHub同步错误:', error);
      setSyncMessage(`同步错误: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsSyncing(false);
    }
  }, []);
  
  // 使用防抖处理同步，避免频繁触发
  const debouncedSync = useCallback(debounce(syncToGitHub, 2000), [syncToGitHub]);

  // 保存到localStorage并触发同步
  const saveExperiences = useCallback((updatedExperiences: WorkExperience[]) => {
    const sorted = [...updatedExperiences].sort(sortByDate);
    localStorage.setItem('workExperiences', JSON.stringify(sorted));
    setExperiences(sorted);
    
    if (hasPAT) {
      debouncedSync(sorted);
    }
  }, [debouncedSync, hasPAT]);

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (editingExperience) {
      setEditingExperience({
        ...editingExperience,
        [name]: value
      });
    }
  };

  // 添加责任条目
  const addResponsibility = () => {
    if (newResponsibility.trim() && editingExperience) {
      setEditingExperience({
        ...editingExperience,
        responsibilities: [...editingExperience.responsibilities, newResponsibility.trim()]
      });
      setNewResponsibility('');
    }
  };

  // 删除责任条目
  const removeResponsibility = (index: number) => {
    if (editingExperience) {
      const updatedResponsibilities = [...editingExperience.responsibilities];
      updatedResponsibilities.splice(index, 1);
      setEditingExperience({
        ...editingExperience,
        responsibilities: updatedResponsibilities
      });
    }
  };

  // 创建新的工作经验
  const createExperience = () => {
    const newExperience: WorkExperience = {
      id: generateId(), // 使用自定义函数生成ID
      company: '',
      position: '',
      location: '',
      startDate: '',
      endDate: '',
      responsibilities: []
    };
    setEditingExperience(newExperience);
    setIsEditing(true);
  };

  // 编辑已有工作经验
  const editExperience = (experience: WorkExperience) => {
    setEditingExperience({ ...experience });
    setIsEditing(true);
  };

  // 删除工作经验
  const deleteExperience = (id: string) => {
    if (window.confirm('确定要删除这条工作经验吗？')) {
      const updatedExperiences = experiences.filter(exp => exp.id !== id);
      saveExperiences(updatedExperiences);
    }
  };

  // 保存编辑的工作经验
  const saveExperience = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingExperience) {
      // 验证必填字段
      if (!editingExperience.company || !editingExperience.position || 
          !editingExperience.location || !editingExperience.startDate || 
          !editingExperience.endDate || editingExperience.responsibilities.length === 0) {
        alert('请填写所有必填字段，并至少添加一项职责描述。');
        return;
      }
      
      const existingIndex = experiences.findIndex(exp => exp.id === editingExperience.id);
      let updatedExperiences: WorkExperience[];
      
      if (existingIndex >= 0) {
        // 更新现有经验
        updatedExperiences = [...experiences];
        updatedExperiences[existingIndex] = editingExperience;
      } else {
        // 添加新经验
        updatedExperiences = [...experiences, editingExperience];
      }
      
      saveExperiences(updatedExperiences);
      setIsEditing(false);
      setEditingExperience(null);
    }
  };

  // 取消编辑
  const cancelEdit = () => {
    if (window.confirm('确定要取消编辑吗？所有未保存的更改将丢失。')) {
      setIsEditing(false);
      setEditingExperience(null);
    }
  };

  // 重置为初始数据
  const resetToDefault = async () => {
    if (window.confirm('确定要重置所有工作经验数据吗？这将加载JSON文件中的默认数据。')) {
      try {
        const response = await fetch('/data/work-experience-data.json');
        if (response.ok) {
          const data = await response.json();
          if (data.workExperiences && Array.isArray(data.workExperiences)) {
            saveExperiences(data.workExperiences);
          }
        } else {
          alert('无法加载默认数据，请稍后再试。');
        }
      } catch (error) {
        console.error('重置数据出错:', error);
        alert('重置数据出错，请稍后再试。');
      }
    }
  };

  // 如果没有管理员权限，重定向到工作经验页面
  useEffect(() => {
    if (!isAdminMode) {
      navigate('/work');
    }
  }, [isAdminMode, navigate]);

  // 如果正在编辑，显示编辑表单
  if (isEditing && editingExperience) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {editingExperience.id ? '编辑工作经验' : '添加工作经验'}
            </h2>
            <button
              onClick={cancelEdit}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              取消
            </button>
          </div>
          
          <form onSubmit={saveExperience} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  公司名称 *
                </label>
                <input
                  type="text"
                  name="company"
                  value={editingExperience.company}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  职位 *
                </label>
                <input
                  type="text"
                  name="position"
                  value={editingExperience.position}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  地点 *
                </label>
                <input
                  type="text"
                  name="location"
                  value={editingExperience.location}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    开始日期 * (如 Jul 2024)
                  </label>
                  <input
                    type="text"
                    name="startDate"
                    value={editingExperience.startDate}
                    onChange={handleInputChange}
                    placeholder="如 Jul 2024"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    结束日期 * (如 Present)
                  </label>
                  <input
                    type="text"
                    name="endDate"
                    value={editingExperience.endDate}
                    onChange={handleInputChange}
                    placeholder="如 Present"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  职责描述 *
                </label>
                <div className="space-y-4">
                  {editingExperience.responsibilities.map((responsibility, index) => (
                    <div key={index} className="flex items-center">
                      <input
                        type="text"
                        value={responsibility}
                        onChange={(e) => {
                          const updatedResponsibilities = [...editingExperience.responsibilities];
                          updatedResponsibilities[index] = e.target.value;
                          setEditingExperience({
                            ...editingExperience,
                            responsibilities: updatedResponsibilities
                          });
                        }}
                        className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => removeResponsibility(index)}
                        className="ml-2 p-2 text-red-500 hover:text-red-700"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  ))}
                  
                  <div className="flex items-center">
                    <input
                      type="text"
                      value={newResponsibility}
                      onChange={(e) => setNewResponsibility(e.target.value)}
                      placeholder="输入新的职责描述..."
                      className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={addResponsibility}
                      className="ml-2 p-2 text-blue-500 hover:text-blue-700"
                      disabled={!newResponsibility.trim()}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
                {editingExperience.responsibilities.length === 0 && (
                  <p className="text-red-500 text-sm mt-2">请至少添加一项职责描述</p>
                )}
              </div>
              
              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  保存
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // 显示工作经验列表
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">工作经验管理</h2>
            {syncMessage && (
              <p className={`mt-2 ${syncMessage.includes('成功') ? 'text-green-500' : 'text-amber-500'}`}>
                {syncMessage}
              </p>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={createExperience}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              添加工作经验
            </button>
            
            <button
              onClick={resetToDefault}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
            >
              重置为默认
            </button>
            
            <Link
              to="/work"
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              返回
            </Link>
          </div>
        </div>
        
        {experiences.length > 0 ? (
          <div className="space-y-6">
            {experiences.map((experience) => (
              <div key={experience.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
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
                
                <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 mb-4">
                  {experience.responsibilities.map((responsibility, index) => (
                    <li key={index}>{responsibility}</li>
                  ))}
                </ul>
                
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => editExperience(experience)}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  >
                    编辑
                  </button>
                  <button
                    onClick={() => deleteExperience(experience.id)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                  >
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400 mb-4">暂无工作经验数据。</p>
            <button
              onClick={createExperience}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              添加第一条工作经验
            </button>
          </div>
        )}
      </div>
    </div>
  );
}