/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-ignore
import React, { useState, useEffect, FormEvent, ChangeEvent, DragEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { processFile } from '../utils/fileUtils';
// 导入用于拖拽排序的库
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { getBasePath } from '../utils/imageUtils';  // 导入getBasePath函数

// 图片压缩函数
// 使用从fileUtils.ts导入的compressImage函数，确保代码一致性
import { compressImage as compressImageUtil } from '../utils/fileUtils';

// 包装函数，使用导入的工具函数
const compressImage = (file: File, callback: (dataUrl: string) => void, maxWidth = 800, maxHeight = 800, quality = 0.7) => {
  console.log('ProjectsManager: 开始处理图片:', file.name);
  compressImageUtil(file, callback, maxWidth, maxHeight, quality);
};

interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  link?: string;
  image?: string;
}

interface Award {
  id: string;
  title: string;
  organization: string;
  date: string;
  description: string;
  image?: string;
  document?: {
    dataUrl: string;
    fileName: string;
    fileType: string;
  };
}

// 可排序项组件 - 项目
interface SortableProjectItemProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
}

const SortableProjectItem = ({ project, onEdit, onDelete }: SortableProjectItemProps) => {
  const { t } = useLanguage();
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: project.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  
  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      className="bg-white dark:bg-gray-800 p-4 rounded-lg mb-3 shadow-md border border-gray-200 dark:border-gray-700 relative group">
      <div {...listeners} className="absolute left-0 top-0 bottom-0 w-8 flex items-center justify-center cursor-move text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
        </svg>
      </div>
      <div className="ml-8 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">{project.title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{project.description}</p>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={() => onEdit(project)}
            className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            title={t('projects.manager.edit')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <button 
            onClick={() => onDelete(project.id)}
            className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
            title={t('projects.manager.delete')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

// 可排序项组件 - 奖项
interface SortableAwardItemProps {
  award: Award;
  onEdit: (award: Award) => void;
  onDelete: (id: string) => void;
}

const SortableAwardItem = ({ award, onEdit, onDelete }: SortableAwardItemProps) => {
  const { t } = useLanguage();
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: award.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  
  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      className="bg-white dark:bg-gray-800 p-4 rounded-lg mb-3 shadow-md border border-gray-200 dark:border-gray-700 relative group">
      <div {...listeners} className="absolute left-0 top-0 bottom-0 w-8 flex items-center justify-center cursor-move text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
        </svg>
      </div>
      <div className="ml-8 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">{award.title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{award.organization} - {award.date}</p>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={() => onEdit(award)}
            className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            title={t('projects.manager.edit')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <button 
            onClick={() => onDelete(award.id)}
            className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
            title={t('projects.manager.delete')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

// 定义常量
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const VALID_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp'];
const VALID_DOC_TYPES = [
  'application/pdf', 
  'application/msword', 
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain'
];

// 从localStorage加载项目数据的辅助函数
const loadProjectsFromLocalStorage = (): Project[] => {
  try {
    const savedProjects = localStorage.getItem('projects');
    if (savedProjects) {
      const parsedProjects = JSON.parse(savedProjects);
      if (Array.isArray(parsedProjects) && parsedProjects.length > 0) {
        console.log('loadProjectsFromLocalStorage: 成功加载项目列表，数量:', parsedProjects.length);
        return parsedProjects;
      }
    }
    console.warn('loadProjectsFromLocalStorage: localStorage中没有有效的项目数据');
    return [];
  } catch (error) {
    console.error('loadProjectsFromLocalStorage: 加载项目数据出错:', error);
    return [];
  }
};

// 从localStorage加载奖项数据的辅助函数
const loadAwardsFromLocalStorage = (): Award[] => {
  try {
    const savedAwards = localStorage.getItem('awards');
    if (savedAwards) {
      const parsedAwards = JSON.parse(savedAwards);
      if (Array.isArray(parsedAwards) && parsedAwards.length > 0) {
        console.log('loadAwardsFromLocalStorage: 成功加载奖项列表，数量:', parsedAwards.length);
        return parsedAwards;
      }
    }
    console.warn('loadAwardsFromLocalStorage: localStorage中没有有效的奖项数据');
    return [];
  } catch (error) {
    console.error('loadAwardsFromLocalStorage: 加载奖项数据出错:', error);
    return [];
  }
};

import { useAdmin } from '../contexts/AdminContext'; // 确保导入useAdmin

// 导入数据同步工具
import { saveDataToFile, syncDataToGitHubRepo } from '../utils/fileUtils';

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

// 添加以下函数，用于从默认文件加载数据

// 从默认文件加载项目和奖项数据
const loadDefaultData = async (): Promise<{ projects: Project[], awards: Award[] }> => {
  try {
    const basePath = getBasePath();
    const response = await fetch(`${basePath}/data/default-portfolio-data.json`);
    
    if (!response.ok) {
      console.error('无法加载默认数据文件:', response.status);
      return { projects: [], awards: [] };
    }
    
    const data = await response.json();
    console.log('从默认文件加载数据:', data);
    
    if (data.projects && Array.isArray(data.projects) && data.awards && Array.isArray(data.awards)) {
      return {
        projects: data.projects,
        awards: data.awards
      };
    } else {
      console.error('默认数据格式不正确');
      return { projects: [], awards: [] };
    }
  } catch (error) {
    console.error('加载默认数据出错:', error);
    return { projects: [], awards: [] };
  }
};

export default function ProjectsManager() {
  // 获取语言上下文
  const { t } = useLanguage();
  // 获取路由位置信息，用于接收编辑状态
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, isAdminMode } = useAdmin(); // 获取认证状态
  
  // 添加路由守卫，防止数据丢失
  const handleNavigation = (path: string) => {
    // 检查是否有未保存的更改
    const hasUnsavedChanges = 
      (currentProject.title !== '' || 
       currentProject.description !== '' || 
       currentProject.technologies.length > 0 ||
       projectImagePreview !== '') ||
      (currentAward.title !== '' || 
       currentAward.organization !== '' || 
       currentAward.description !== '' || 
       awardImagePreview !== '');
    
    if (hasUnsavedChanges) {
      const confirmNavigation = window.confirm('您有未保存的更改，确定要离开吗？如果确定，系统将自动保存当前编辑的内容。');
      if (confirmNavigation) {
        // 自动保存当前编辑内容
        if (currentProject.title !== '') {
          const tempEvent = { preventDefault: () => {} } as FormEvent;
          saveProject(tempEvent);
        }
        if (currentAward.title !== '') {
          const tempEvent = { preventDefault: () => {} } as FormEvent;
          saveAward(tempEvent);
        }
        
        // 确保数据同步后再导航
        syncDataBeforeNavigation();
        
        // 增加一点延迟确保数据已完全同步
        setTimeout(() => {
          console.log('导航到:', path);
          navigate(path, { state: { refresh: true } });
        }, 200);
      }
    } else {
      // 即使没有未保存的更改，也确保数据同步
      syncDataBeforeNavigation();
    
      // 增加一点延迟确保数据已完全同步
      setTimeout(() => {
        console.log('导航到:', path);
        navigate(path, { state: { refresh: true } });
      }, 200);
    }
  };
  
  // 状态管理
  const [projects, setProjects] = useState<Project[]>([]);
  const [awards, setAwards] = useState<Award[]>([]);
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [isEditingAward, setIsEditingAward] = useState(false);
  const [currentProject, setCurrentProject] = useState<Project>({
    id: crypto.randomUUID(),
    title: '',
    description: '',
    technologies: [],
    link: '',
    image: ''
  });
  const [currentAward, setCurrentAward] = useState<Award>({
    id: crypto.randomUUID(),
    title: '',
    organization: '',
    date: '',
    description: '',
    image: ''
  });
  const [techInput, setTechInput] = useState('');
  const [projectImageFile, setProjectImageFile] = useState<File | null>(null);
  const [awardImageFile, setAwardImageFile] = useState<File | null>(null);
  const [projectImagePreview, setProjectImagePreview] = useState<string>('');
  const [awardImagePreview, setAwardImagePreview] = useState<string>('');

  // 添加批量导入/导出状态
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importData, setImportData] = useState('');
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [selectMode, setSelectMode] = useState(false);
  
  // 设置拖拽排序所需的传感器
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 添加新的状态变量
  const [projectUploadProgress, setProjectUploadProgress] = useState(0);
  const [awardUploadProgress, setAwardUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // 在组件顶部添加状态
  const [exportOption, setExportOption] = useState<'file' | 'github'>('file');
  const [exportError, setExportError] = useState('');

  // 添加同步状态
  const [isSyncing, setIsSyncing] = useState(false);
  const [_lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncMessage, setSyncMessage] = useState('');

  // 检查是否有从其他页面传递过来的编辑状态
  useEffect(() => {
    console.log('ProjectsManager加载，location.state:', location.state);
    
    // 检查认证状态
    const authState = localStorage.getItem('adminAuthenticated');
    console.log('ProjectsManager认证状态 (localStorage):', authState);
    console.log('ProjectsManager权限状态 (useAdmin):', { isAuthenticated, isAdminMode });
    
    if (location.state) {
      if (location.state.editProject) {
        console.log('接收到编辑项目请求:', location.state.editProject.title);
        editProject(location.state.editProject);
      } else if (location.state.editAward) {
        console.log('接收到编辑奖项请求:', location.state.editAward.title);
        editAward(location.state.editAward);
      }
    }
    // 将isAdminMode和isAuthenticated添加到依赖项数组中，以便在它们变化时重新运行此效果
  }, [location.state, isAdminMode, isAuthenticated]);

  // 从本地存储加载数据
  useEffect(() => {
    // 加载项目和奖项数据
    const loadData = async () => {
      await loadProjectsFromStorage();
      await loadAwardsFromStorage();
    };
    
    loadData();
    
    // 定义beforeunload事件处理函数
    const handleBeforeUnload = () => {
      saveProjectsToStorage(projects);
      saveAwardsToStorage(awards);
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      
      // 保存数据到localStorage
      try {
        localStorage.setItem('projects', JSON.stringify(projects));
        localStorage.setItem('awards', JSON.stringify(awards));
      } catch (error) {
        console.error('在beforeunload事件中保存数据失败:', error);
      }
    };
  }, [projects, awards]);
  
  // 从localStorage加载项目数据的函数
  const loadProjectsFromStorage = async () => {
    const localProjects = loadProjectsFromLocalStorage();
    
    // 如果本地没有数据，尝试加载默认数据
    if (localProjects.length === 0) {
      const defaultData = await loadDefaultData();
      if (defaultData.projects.length > 0) {
        setProjects(defaultData.projects);
        // 保存到localStorage以便下次使用
        localStorage.setItem('projects', JSON.stringify(defaultData.projects));
        return;
      }
    }
    
    setProjects(localProjects);
  };
  
  // 从localStorage加载奖项数据的函数
  const loadAwardsFromStorage = async () => {
    const localAwards = loadAwardsFromLocalStorage();
    
    // 如果本地没有数据，尝试加载默认数据
    if (localAwards.length === 0) {
      const defaultData = await loadDefaultData();
      if (defaultData.awards.length > 0) {
        setAwards(defaultData.awards);
        // 保存到localStorage以便下次使用
        localStorage.setItem('awards', JSON.stringify(defaultData.awards));
        return;
      }
    }
    
    setAwards(localAwards);
  };

  // 保存数据到本地存储
  useEffect(() => {
    // A即使数组为空也保存，以便清除旧数据
    localStorage.setItem('projects', JSON.stringify(projects));
    console.log('已更新projects到localStorage，项目数量:', projects.length);
    
    // 检查图片数据是否正确保存
    const projectsWithImages = projects.filter(p => p.image && p.image.startsWith('data:'));
    if (projectsWithImages.length > 0) {
      console.log('已保存包含图片数据的项目数量:', projectsWithImages.length);
    }
  }, [projects]);
  
  // 单独监听awards变化，避免不必要的projects更新
  useEffect(() => {
    // 即使数组为空也保存，以便清除旧数据
    localStorage.setItem('awards', JSON.stringify(awards));
    console.log('已更新awards到localStorage，奖项数量:', awards.length);
    
    // 检查图片数据是否正确保存
    const awardsWithImages = awards.filter(a => a.image && a.image.startsWith('data:'));
    if (awardsWithImages.length > 0) {
      console.log('已保存包含图片数据的奖项数量:', awardsWithImages.length);
    }
  }, [awards]);

  // 处理项目拖拽结束
  const handleProjectDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (active && over && active.id !== over.id) {
      setProjects((projects) => {
        const oldIndex = projects.findIndex((p) => p.id === active.id);
        const newIndex = projects.findIndex((p) => p.id === over.id);
        
        return arrayMove(projects, oldIndex, newIndex);
      });
    }
    
    // 现有代码末尾添加自动同步调用
    debouncedAutoSync();
  };
  
  // 处理奖项拖拽结束
  const handleAwardDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (active && over && active.id !== over.id) {
      setAwards((awards) => {
        const oldIndex = awards.findIndex((a) => a.id === active.id);
        const newIndex = awards.findIndex((a) => a.id === over.id);
        
        return arrayMove(awards, oldIndex, newIndex);
      });
    }
    
    // 现有代码末尾添加自动同步调用
    debouncedAutoSync();
  };
  
  // 导出数据为JSON文件
  const exportData = () => {
    const exportObject = {
      projects: projects,
      awards: awards,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    
    if (exportOption === 'file') {
      // 导出到本地文件
      saveDataToFile(exportObject, `portfolio-data-${new Date().toISOString().slice(0, 10)}.json`);
    } else if (exportOption === 'github') {
      // 尝试同步到GitHub仓库
      syncDataToGitHubRepo(exportObject, { 
        targetFile: 'public/data/portfolio-data.json',
        commitMessage: '更新项目和奖项数据 [自动提交]'
      }).then(success => {
        if (success) {
          showSuccessMessage(t('projects.manager.export.githubSuccess') || '已成功同步到GitHub仓库');
        } else {
          setExportError(t('projects.manager.export.githubError') || '同步到GitHub仓库失败');
        }
      });
    }
    
    setShowExportModal(false);
  };
  
  // 导入数据
  const importDataFromJson = () => {
    try {
      const parsedData = JSON.parse(importData);
      
      if (!parsedData.projects || !Array.isArray(parsedData.projects) || 
          !parsedData.awards || !Array.isArray(parsedData.awards)) {
        setImportError(t('projects.manager.import.invalid'));
        return;
      }
      
      // 确保所有项目都有唯一ID
      const projectsWithIds = parsedData.projects.map((project: Project) => ({
        ...project,
        id: project.id || crypto.randomUUID()
      }));
      
      // 确保所有奖项都有唯一ID
      const awardsWithIds = parsedData.awards.map((award: Award) => ({
        ...award,
        id: award.id || crypto.randomUUID()
      }));
      
      setProjects(projectsWithIds);
      setAwards(awardsWithIds);
      
      setImportSuccess(t('projects.manager.import.success'));
      setTimeout(() => {
        setShowImportModal(false);
        setImportSuccess('');
        setImportData('');
      }, 1500);
      
    } catch (error) {
      console.error('导入数据出错:', error);
      setImportError(t('projects.manager.import.error'));
    }
  };
  
  // 处理导入文件选择
  const handleImportFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    setImportError('');
    setImportSuccess('');
    
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target) {
          setImportData(event.target.result as string);
        }
      };
      
      reader.onerror = () => {
        setImportError(t('projects.manager.import.fileError'));
      };
      
      reader.readAsText(file);
    }
  };
  
  // 切换项目选择
  const toggleProjectSelection = (id: string) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(item => item !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };
  
  // 切换奖项选择
  const toggleAwardSelection = (id: string) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(item => item !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };
  
  // 全选项目
  const selectAllProjects = () => {
    setSelectedItems(projects.map(project => project.id || '').filter(Boolean));
  };
  
  // 全选奖项
  const selectAllAwards = () => {
    setSelectedItems(awards.map(award => award.id || '').filter(Boolean));
  };
  
  // 取消全选
  const deselectAll = () => {
    setSelectedItems([]);
  };
  
  // 删除选中项目
  const deleteSelectedProjects = () => {
    if (window.confirm(t('projects.manager.confirmDeleteSelected'))) {
      const updatedProjects = projects.filter(project => !selectedItems.includes(project.id || ''));
      setProjects(updatedProjects);
      setSelectedItems([]);
      setSelectMode(false);
    }
  };
  
  // 删除选中奖项
  const deleteSelectedAwards = () => {
    if (window.confirm(t('projects.manager.confirmDeleteSelected'))) {
      const updatedAwards = awards.filter(award => !selectedItems.includes(award.id || ''));
      setAwards(updatedAwards);
      setSelectedItems([]);
      setSelectMode(false);
    }
  };

  // 模拟服务器上传函数
  const uploadFileToServer = async (file: File, progressCallback: (progress: number) => void): Promise<string> => {
    // 在实际应用中，这里应该是真实的服务器上传代码
    // 这里我们模拟上传过程
    setUploading(true);
    
    return new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 5;
        progressCallback(progress);
        
        if (progress >= 100) {
          clearInterval(interval);
          setUploading(false);
          
          // 模拟获取URL，实际上我们仍然使用DataURL
          const reader = new FileReader();
          reader.onload = (e) => {
            if (e.target) {
              resolve(e.target.result as string);
            }
          };
          reader.readAsDataURL(file);
        }
      }, 100);
    });
  };

  // 处理项目图片拖放
  const handleProjectDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleProjectDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleProjectDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleProjectImageUpload(e.dataTransfer.files[0]);
    }
  };

  // 处理奖项文件拖放
  const handleAwardDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleAwardDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleAwardDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleAwardFileUpload(e.dataTransfer.files[0]);
    }
  };
  
  // 更新项目图片上传处理函数
  const handleProjectImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleProjectImageUpload(e.target.files[0]);
    }
  };
  
  // 项目图片上传处理核心函数
  const handleProjectImageUpload = async (file: File) => {
    // 文件类型验证
    if (!VALID_IMAGE_TYPES.includes(file.type)) {
      alert(t('projects.manager.invalidImageType'));
      return;
    }
    
    // 文件大小验证
    if (file.size > MAX_FILE_SIZE) {
      alert(t('projects.manager.fileTooLarge'));
      return;
    }
    
      setProjectImageFile(file);
    setProjectUploadProgress(0);
    
    try {
      // SVG文件直接读取，不压缩
      if (file.type === 'image/svg+xml') {
        const dataUrl = await uploadFileToServer(file, setProjectUploadProgress);
        setProjectImagePreview(dataUrl);
        setCurrentProject({...currentProject, image: dataUrl});
        return;
      }
      
      // 其他图片类型压缩处理
      setUploading(true);
      compressImage(
        file,
        async (dataUrl) => {
          // 模拟上传过程
          let progress = 0;
          const interval = setInterval(() => {
            progress += 10;
            setProjectUploadProgress(Math.min(progress, 100));
            if (progress >= 100) {
              clearInterval(interval);
              setUploading(false);
              setProjectImagePreview(dataUrl);
              setCurrentProject({...currentProject, image: dataUrl});
            }
          }, 100);
        }
      );
    } catch (error) {
      console.error('项目图片上传错误:', error);
      alert(t('projects.manager.uploadError'));
      setUploading(false);
    }
  };

  // 更新奖项文件上传处理函数
  const handleAwardImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleAwardFileUpload(e.target.files[0]);
    }
  };
  
  // 奖项文件上传处理核心函数
  const handleAwardFileUpload = async (file: File) => {
    // 文件大小验证
    if (file.size > MAX_FILE_SIZE) {
      alert(t('projects.manager.fileTooLarge'));
      return;
    }
    
      setAwardImageFile(file);
    setAwardUploadProgress(0);
    
    try {
      // 根据文件类型确定处理方式
      const isImage = VALID_IMAGE_TYPES.includes(file.type);
      const isDocument = VALID_DOC_TYPES.includes(file.type);
      
      if (!isImage && !isDocument) {
        alert(t('projects.manager.invalidFileType'));
        return;
      }
      
      setUploading(true);
      
      // 使用通用文件处理函数处理不同类型的文件
      processFile(
        file,
        // 图片处理回调 - 增加图片质量和尺寸参数
        (compressedDataUrl) => {
          // 模拟上传过程
          let progress = 0;
          const interval = setInterval(() => {
            progress += 10;
            setAwardUploadProgress(Math.min(progress, 100));
            if (progress >= 100) {
              clearInterval(interval);
              setUploading(false);
              
          if (compressedDataUrl && compressedDataUrl.startsWith('data:')) {
            setAwardImagePreview(compressedDataUrl);
            // 清除之前可能存在的文档数据并更新当前奖项的图片字段
            setCurrentAward(prev => ({
              ...prev,
              document: undefined,
              image: compressedDataUrl
            }));
            console.log('奖项图片预览已设置，数据长度:', compressedDataUrl.length);
          } else {
            console.error('奖项图片压缩后数据无效');
            setAwardImagePreview('');
          }
            }
          }, 100);
        },
        // 文档处理回调
        (dataUrl, fileName, fileType) => {
          // 模拟上传过程
          let progress = 0;
          const interval = setInterval(() => {
            progress += 10;
            setAwardUploadProgress(Math.min(progress, 100));
            if (progress >= 100) {
              clearInterval(interval);
              setUploading(false);
              
          // 清除图片预览
          setAwardImagePreview('');
          // 保存文档信息到当前奖项
          setCurrentAward(prev => ({
            ...prev,
            document: {
              dataUrl,
              fileName,
              fileType
            }
          }));
          console.log('奖项文档已处理:', fileName, '类型:', fileType);
            }
          }, 100);
        }
      );
    } catch (error) {
      console.error('奖项文件上传错误:', error);
      alert(t('projects.manager.uploadError'));
      setUploading(false);
    }
  };

  // 处理技术栈输入
  const handleTechInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTechInput(e.target.value);
  };

  // 添加技术栈
  const addTechnology = () => {
    if (techInput.trim() !== '') {
      setCurrentProject({
        ...currentProject,
        technologies: [...currentProject.technologies, techInput.trim()]
      });
      setTechInput('');
    }
  };

  // 移除技术栈
  const removeTechnology = (index: number) => {
    const updatedTechnologies = [...currentProject.technologies];
    updatedTechnologies.splice(index, 1);
    setCurrentProject({
      ...currentProject,
      technologies: updatedTechnologies
    });
  };

  // 处理项目表单输入变化
  const handleProjectChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentProject({
      ...currentProject,
      [name]: value
    });
  };

  // 处理奖项表单输入变化
  const handleAwardChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentAward({
      ...currentAward,
      [name]: value
    });
  };

  // 状态管理 - 添加成功消息提示状态
  const [successMessage, setSuccessMessage] = useState<string>('');

  // 显示成功消息的函数
  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    // 3秒后自动清除消息
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };

  // 保存项目
  const saveProject = (e: FormEvent) => {
    e.preventDefault();
    
    console.log('保存项目，当前状态:', { 
      isEditing: isEditingProject, 
      hasImageFile: !!projectImageFile, 
      hasImagePreview: !!projectImagePreview,
      currentImage: currentProject.image ? '存在' : '不存在'
    });
    
    // 处理图片上传
    let imagePath = currentProject.image;
    if (projectImageFile && projectImagePreview) {
      // 在实际应用中，这里应该上传到服务器并获取URL
      // 由于这是前端演示，我们直接使用DataURL
      imagePath = projectImagePreview;
      console.log('保存项目图片数据:', imagePath.substring(0, 50) + '...');
      
      // 验证WebP格式图片
      if (projectImageFile.type.includes('webp')) {
        console.log('正在保存WebP格式图片，确保数据URL格式正确');
        // 确保WebP图片的MIME类型正确
        if (!imagePath.startsWith('data:image/webp')) {
          console.warn('WebP图片的数据URL前缀不正确，尝试修正');
          // 如果数据URL前缀不正确，尝试修正
          if (imagePath.startsWith('data:image/')) {
            const dataContent = imagePath.substring(imagePath.indexOf(',') + 1);
            imagePath = 'data:image/webp;base64,' + dataContent;
            console.log('已修正WebP图片数据URL前缀');
          }
        }
      }
      
      // 验证图片数据是否有效
      if (!imagePath || !imagePath.startsWith('data:')) {
        console.error('项目图片数据无效，可能导致显示问题');
      }
    } else if (isEditingProject && currentProject.image) {
      // 如果是编辑模式且没有上传新图片，保留原图片
      console.log('编辑模式：保留原项目图片');
      imagePath = currentProject.image;
    }
    
    // 确保图片路径有效
    if (imagePath && !imagePath.startsWith('data:') && !imagePath.startsWith('/')) {
      console.warn('项目图片路径无效，重置为空');
      imagePath = '';
    }
    
    const updatedProject: Project = {
      ...currentProject,
      image: imagePath,
      id: currentProject.id || crypto.randomUUID()
    };
    
    console.log('保存项目状态:', { 
      isEditing: isEditingProject, 
      projectId: updatedProject.id, 
      title: updatedProject.title 
    });
    
    // 从localStorage获取最新的项目列表
    let currentProjects: Project[] = [];
    try {
      const savedProjects = localStorage.getItem('projects');
      if (savedProjects) {
        const parsedProjects = JSON.parse(savedProjects);
        if (Array.isArray(parsedProjects)) {
          currentProjects = parsedProjects;
          console.log('从localStorage加载到项目列表，数量:', currentProjects.length);
          } else {
          console.error('localStorage中的项目数据不是数组格式');
        }
      }
    } catch (error) {
      console.error('从localStorage读取项目数据出错:', error);
    }
    
    // 确保至少有一个空数组
    if (!Array.isArray(currentProjects)) {
      currentProjects = [];
    }
    
    let updatedProjects: Project[] = [];
    
    if (isEditingProject) {
      // 查找要更新的项目索引
      const projectIndex = currentProjects.findIndex(p => p.id === updatedProject.id);
      console.log('要更新的项目索引:', projectIndex);
      
      if (projectIndex !== -1) {
        // 创建新数组并更新特定项目
        updatedProjects = [...currentProjects];
        updatedProjects[projectIndex] = updatedProject;
        
        console.log('更新后的项目列表长度:', updatedProjects.length);
      } else {
        console.warn('未找到要更新的项目，将添加为新项目');
        updatedProjects = [...currentProjects, updatedProject];
      }
    } else {
      // 添加新项目
      updatedProjects = [...currentProjects, updatedProject];
      console.log('添加新项目到列表，更新后长度:', updatedProjects.length);
    }
    
    // 更新React状态
      setProjects(updatedProjects);
    
      // 立即保存到localStorage
      localStorage.setItem('projects', JSON.stringify(updatedProjects));
    console.log('已更新projects到localStorage，项目数量:', updatedProjects.length);
      
      // 显示成功消息
    showSuccessMessage(isEditingProject ? '项目已成功更新！' : '新项目已成功添加！');
    
    // 询问用户是否继续编辑其他项目
    if (window.confirm('项目已保存成功！是否继续编辑其他项目？')) {
      // 如果用户选择继续编辑，只清空当前表单但不重置编辑状态
      setCurrentProject({
        id: crypto.randomUUID(),
        title: '',
        description: '',
        technologies: [],
        link: '',
        image: ''
      });
      setProjectImageFile(null);
      setProjectImagePreview('');
      setTechInput('');
      // 不重置编辑状态，允许继续添加
      setIsEditingProject(false);
    } else {
      // 用户选择不继续编辑，完全重置表单
      resetProjectForm();
    }
    
    // 触发自动同步
    debouncedAutoSync();
  };

  // 保存奖项
  const saveAward = (e: FormEvent) => {
    e.preventDefault();
    
    // 处理图片上传
    let imagePath = currentAward.image;
    if (awardImageFile && awardImagePreview) {
      // 在实际应用中，这里应该上传到服务器并获取URL
      // 由于这是前端演示，我们直接使用DataURL
      imagePath = awardImagePreview;
      console.log('保存奖项图片数据:', imagePath.substring(0, 50) + '...');
      
      // 验证图片数据是否有效
      if (!imagePath || !imagePath.startsWith('data:')) {
        console.error('奖项图片数据无效，可能导致显示问题');
      }
    } else if (isEditingAward && currentAward.image) {
      // 如果是编辑模式且没有上传新图片，保留原图片
      console.log('编辑模式：保留原奖项图片');
      imagePath = currentAward.image;
    }
    
    // 确保图片路径有效
    if (imagePath && !imagePath.startsWith('data:') && !imagePath.startsWith('/')) {
      console.warn('奖项图片路径无效，重置为空');
      imagePath = '';
    }
    
    // 创建更新后的奖项对象，包含文档信息
    const updatedAward: Award = {
      ...currentAward,
      image: imagePath,
      id: currentAward.id || crypto.randomUUID()
    };
    
    console.log('保存奖项状态:', { 
      isEditing: isEditingAward, 
      awardId: updatedAward.id, 
      title: updatedAward.title 
    });
    
    // 从localStorage获取最新的奖项列表
    let currentAwards: Award[] = [];
    try {
      const savedAwards = localStorage.getItem('awards');
      if (savedAwards) {
        const parsedAwards = JSON.parse(savedAwards);
        if (Array.isArray(parsedAwards)) {
          currentAwards = parsedAwards;
          console.log('从localStorage加载到奖项列表，数量:', currentAwards.length);
        } else {
          console.error('localStorage中的奖项数据不是数组格式');
        }
      }
    } catch (error) {
      console.error('从localStorage读取奖项数据出错:', error);
    }
    
    // 确保至少有一个空数组
    if (!Array.isArray(currentAwards)) {
      currentAwards = [];
    }
    
    let updatedAwards: Award[] = [];
    
    if (isEditingAward) {
      // 查找要更新的奖项索引
      const awardIndex = currentAwards.findIndex(a => a.id === updatedAward.id);
      console.log('要更新的奖项索引:', awardIndex);
      
      if (awardIndex !== -1) {
        // 创建新数组并更新特定奖项
        updatedAwards = [...currentAwards];
        updatedAwards[awardIndex] = updatedAward;
        
        console.log('更新后的奖项列表长度:', updatedAwards.length);
      } else {
        console.warn('未找到要更新的奖项，将添加为新奖项');
        updatedAwards = [...currentAwards, updatedAward];
      }
    } else {
      // 添加新奖项
      updatedAwards = [...currentAwards, updatedAward];
      console.log('添加新奖项到列表，更新后长度:', updatedAwards.length);
    }
    
    // 更新React状态
      setAwards(updatedAwards);
    
      // 立即保存到localStorage
      localStorage.setItem('awards', JSON.stringify(updatedAwards));
    console.log('已更新awards到localStorage，奖项数量:', updatedAwards.length);
      
      // 显示成功消息
    showSuccessMessage(isEditingAward ? '奖项已成功更新！' : '新奖项已成功添加！');
    
    // 询问用户是否继续编辑其他奖项
    if (window.confirm('奖项已保存成功！是否继续编辑其他奖项？')) {
      // 如果用户选择继续编辑，只清空当前表单但不重置编辑状态
      setCurrentAward({
        id: crypto.randomUUID(),
        title: '',
        organization: '',
        date: '',
        description: '',
        image: ''
      });
      setAwardImageFile(null);
      setAwardImagePreview('');
      // 不重置编辑状态，允许继续添加
      setIsEditingAward(false);
    } else {
      // 用户选择不继续编辑，完全重置表单
      resetAwardForm();
    }
    
    // 触发自动同步
    debouncedAutoSync();
  };

  // 编辑项目
  const editProject = (project: Project) => {
    console.log('开始编辑项目，原始数据:', project);
    
    // Create a deep copy of the project to avoid reference issues
    const projectCopy = JSON.parse(JSON.stringify(project));
    
    // 确保技术栈是数组
    if (!Array.isArray(projectCopy.technologies)) {
      console.warn('项目技术栈不是数组，重置为空数组');
      projectCopy.technologies = [];
    }
    
    // 确保所有字段都被正确设置，即使是空值
    setCurrentProject({
      id: projectCopy.id,
      title: projectCopy.title || '',
      description: projectCopy.description || '',
      technologies: projectCopy.technologies || [],
      link: projectCopy.link || '',
      image: projectCopy.image || ''
    });
    
    // 设置编辑模式
    setIsEditingProject(true);
    
    // 处理图片预览
    if (projectCopy.image) {
      // 无论是data:URL还是普通路径，都设置预览图片
      setProjectImagePreview(projectCopy.image);
      console.log('设置项目图片预览:', projectCopy.image.substring(0, 30) + '...');
      
      // 重要：清空图片文件状态，因为我们正在编辑现有项目
      // 这样可以确保如果用户不上传新图片，原图片会被保留
      setProjectImageFile(null);
    } else {
      setProjectImagePreview('');
      setProjectImageFile(null);
      console.log('项目没有图片，清空预览');
    }
    
    console.log('正在编辑项目:', projectCopy.title, '，ID:', projectCopy.id);
    console.log('项目数据:', {
      title: projectCopy.title,
      description: projectCopy.description ? projectCopy.description.substring(0, 30) + '...' : '',
      technologies: projectCopy.technologies,
      link: projectCopy.link,
      hasImage: !!projectCopy.image
    });
    
    // 如果有技术栈，确保它们被正确加载
    if (projectCopy.technologies && projectCopy.technologies.length > 0) {
      console.log('加载项目技术栈:', projectCopy.technologies.join(', '));
    }
    
    // 滚动到表单位置
    document.getElementById('projectForm')?.scrollIntoView({ behavior: 'smooth' });
  };

  // 编辑奖项
  const editAward = (award: Award) => {
    console.log('开始编辑奖项，原始数据:', award);
    
    // Create a deep copy of the award to avoid reference issues
    const awardCopy = JSON.parse(JSON.stringify(award));
    
    // 确保所有字段都被正确设置，即使是空值
    setCurrentAward({
      id: awardCopy.id,
      title: awardCopy.title || '',
      organization: awardCopy.organization || '',
      date: awardCopy.date || '',
      description: awardCopy.description || '',
      image: awardCopy.image || '',
      document: awardCopy.document || undefined
    });
    
    // 设置编辑模式
    setIsEditingAward(true);
    
    // 处理图片预览
    if (awardCopy.image) {
      // 无论是data:URL还是普通路径，都设置预览图片
      setAwardImagePreview(awardCopy.image);
      console.log('设置奖项图片预览:', awardCopy.image.substring(0, 30) + '...');
      
      // 重要：清空图片文件状态，因为我们正在编辑现有奖项
      // 这样可以确保如果用户不上传新图片，原图片会被保留
      setAwardImageFile(null);
    } else {
      setAwardImagePreview('');
      setAwardImageFile(null);
      console.log('奖项没有图片，清空预览');
    }
    
    console.log('正在编辑奖项:', awardCopy.title, '，ID:', awardCopy.id);
    console.log('奖项数据:', {
      title: awardCopy.title,
      organization: awardCopy.organization,
      date: awardCopy.date,
      description: awardCopy.description ? awardCopy.description.substring(0, 30) + '...' : '',
      hasImage: !!awardCopy.image,
      hasDocument: !!awardCopy.document
    });
    
    // 如果有文档，确保它被正确加载
    if (awardCopy.document) {
      console.log('加载奖项文档:', awardCopy.document.fileName);
    }
    
    // 滚动到表单位置
    document.getElementById('awardForm')?.scrollIntoView({ behavior: 'smooth' });
  };

  // 删除项目
  const deleteProject = (id: string) => {
    if (window.confirm(t('manager.delete.confirm'))) {
      // 首先从localStorage获取最新的项目数据，以避免覆盖其他地方的更改
      let currentStoredProjects: Project[] = [];
      try {
        const savedProjects = localStorage.getItem('projects');
        if (savedProjects) {
          currentStoredProjects = JSON.parse(savedProjects);
          if (!Array.isArray(currentStoredProjects)) {
            console.error('localStorage中的项目数据不是数组格式，重置为空数组');
            currentStoredProjects = [];
          }
        }
      } catch (error) {
        console.error('从localStorage读取项目数据出错:', error);
        currentStoredProjects = [];
      }
      
      // 使用最新的项目列表（优先使用localStorage中的最新数据）
      const latestProjects = currentStoredProjects.length > 0 ? currentStoredProjects : projects;
      
      const updatedProjects = latestProjects.filter((project: Project) => project.id !== id);
      setProjects(updatedProjects);
      // 立即保存到localStorage
      localStorage.setItem('projects', JSON.stringify(updatedProjects));
      console.log('已删除项目并更新localStorage');
    }
    
    // 现有代码末尾添加自动同步调用
    debouncedAutoSync();
  };

  // 删除奖项
  const deleteAward = (id: string) => {
    if (window.confirm(t('manager.delete.confirm'))) {
      // 首先从localStorage获取最新的奖项数据，以避免覆盖其他地方的更改
      let currentStoredAwards: Award[] = [];
      try {
        const savedAwards = localStorage.getItem('awards');
        if (savedAwards) {
          currentStoredAwards = JSON.parse(savedAwards);
          if (!Array.isArray(currentStoredAwards)) {
            console.error('localStorage中的奖项数据不是数组格式，重置为空数组');
            currentStoredAwards = [];
          }
        }
      } catch (error) {
        console.error('从localStorage读取奖项数据出错:', error);
        currentStoredAwards = [];
      }
      
      // 使用最新的奖项列表（优先使用localStorage中的最新数据）
      const latestAwards = currentStoredAwards.length > 0 ? currentStoredAwards : awards;
      
      const updatedAwards = latestAwards.filter((award: Award) => award.id !== id);
      setAwards(updatedAwards);
      // 立即保存到localStorage
      localStorage.setItem('awards', JSON.stringify(updatedAwards));
      console.log('已删除奖项并更新localStorage');
    }
    
    // 现有代码末尾添加自动同步调用
    debouncedAutoSync();
  };

  // 重置项目表单
  const resetProjectForm = () => {
    setIsEditingProject(false);
    setCurrentProject({
      id: crypto.randomUUID(),
      title: '',
      description: '',
      technologies: [],
      link: '',
      image: ''
    });
    setProjectImagePreview('');
    setProjectImageFile(null);
    
    // 如果表单是通过编辑按钮打开的，平滑滚动到表单顶部
    if (isEditingProject) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  // 重置奖项表单
  const resetAwardForm = () => {
    setIsEditingAward(false);
    setCurrentAward({
      id: crypto.randomUUID(),
      title: '',
      organization: '',
      date: '',
      description: '',
      image: ''
    });
    setAwardImagePreview('');
    setAwardImageFile(null);
    
    // 如果表单是通过编辑按钮打开的，平滑滚动到表单顶部
    if (isEditingAward) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  // 更新renderProjectsList函数以支持拖拽排序和批量选择
  const renderProjectsList = () => {
  return (
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{t('projects.manager.projectsList')}</h3>
          <div className="flex gap-2">
              <button 
              type="button"
              onClick={() => setSelectMode(!selectMode)}
              className="px-3 py-1.5 text-sm bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
              {selectMode ? t('projects.manager.cancelSelect') : t('projects.manager.selectItems')}
              </button>
            {selectMode && (
              <>
                <button
                  type="button"
                  onClick={selectAllProjects}
                  className="px-3 py-1.5 text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                >
                  {t('projects.manager.selectAll')}
                </button>
                <button
                  type="button"
                  onClick={deselectAll}
                  className="px-3 py-1.5 text-sm bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  {t('projects.manager.deselectAll')}
                </button>
                <button
                  type="button"
                  onClick={deleteSelectedProjects}
                  className="px-3 py-1.5 text-sm bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-md hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                  disabled={selectedItems.length === 0}
                >
                  {t('projects.manager.deleteSelected')}
                </button>
              </>
            )}
            </div>
        </div>
        
        {selectMode ? (
          <div className="space-y-2">
            {projects.map((project) => (
              <div key={project.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 flex items-center">
                <input
                  type="checkbox"
                  className="h-5 w-5 text-blue-600 mr-3"
                  checked={selectedItems.includes(project.id)}
                  onChange={() => toggleProjectSelection(project.id)}
                />
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">{project.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{project.description}</p>
            </div>
              </div>
            ))}
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleProjectDragEnd}>
            <SortableContext items={projects.map(p => p.id)} strategy={verticalListSortingStrategy}>
              {projects.map((project) => (
                <SortableProjectItem 
                  key={project.id} 
                  project={project} 
                  onEdit={editProject} 
                  onDelete={deleteProject} 
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>
    );
  };

  const renderAwardsList = () => {
    return (
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{t('projects.manager.awardsList')}</h3>
          <div className="flex gap-2">
              <button 
              type="button"
              onClick={() => setSelectMode(!selectMode)}
              className="px-3 py-1.5 text-sm bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
              {selectMode ? t('projects.manager.cancelSelect') : t('projects.manager.selectItems')}
              </button>
            {selectMode && (
              <>
                <button
                  type="button"
                  onClick={selectAllAwards}
                  className="px-3 py-1.5 text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                >
                  {t('projects.manager.selectAll')}
                </button>
                <button
                  type="button"
                  onClick={deselectAll}
                  className="px-3 py-1.5 text-sm bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  {t('projects.manager.deselectAll')}
                </button>
                <button
                  type="button"
                  onClick={deleteSelectedAwards}
                  className="px-3 py-1.5 text-sm bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-md hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                  disabled={selectedItems.length === 0}
                >
                  {t('projects.manager.deleteSelected')}
                </button>
              </>
            )}
            </div>
          </div>
        
        {selectMode ? (
          <div className="space-y-2">
            {awards.map((award) => (
              <div key={award.id} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 flex items-center">
                <input
                  type="checkbox"
                  className="h-5 w-5 text-blue-600 mr-3"
                  checked={selectedItems.includes(award.id)}
                  onChange={() => toggleAwardSelection(award.id)}
                />
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">{award.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{award.organization} - {award.date}</p>
              </div>
            </div>
            ))}
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleAwardDragEnd}>
            <SortableContext items={awards.map(a => a.id)} strategy={verticalListSortingStrategy}>
              {awards.map((award) => (
                <SortableAwardItem 
                  key={award.id} 
                  award={award} 
                  onEdit={editAward} 
                  onDelete={deleteAward} 
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
            </div>
    );
  };

  // 添加导入/导出模态框
  const renderExportModal = () => {
    if (!showExportModal) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t('projects.manager.export.title') || '导出数据'}
          </h3>
          
          <div className="mb-6 space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              {t('projects.manager.export.description') || '选择导出方式：'}
            </p>
            
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="exportOption"
                  checked={exportOption === 'file'}
                  onChange={() => setExportOption('file')}
                  className="h-4 w-4 text-blue-600"
                />
                <span className="text-gray-700 dark:text-gray-300">
                  {t('projects.manager.export.toFile') || '导出到本地文件'}
                </span>
                </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="exportOption"
                  checked={exportOption === 'github'}
                  onChange={() => setExportOption('github')}
                  className="h-4 w-4 text-blue-600"
                />
                <span className="text-gray-700 dark:text-gray-300">
                  {t('projects.manager.export.toGithub') || '同步到GitHub仓库'}
                </span>
              </label>
              </div>
            
            {exportOption === 'github' && (
              <div className="bg-yellow-50 dark:bg-yellow-900 p-3 rounded-md">
                <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                  {t('projects.manager.export.githubNote') || '注意：同步到GitHub仓库需要适当的权限和配置。此功能在未来版本中完善。'}
                </p>
            </div>
            )}
            
            {exportError && (
              <div className="bg-red-50 dark:bg-red-900 p-3 rounded-md">
                <p className="text-red-700 dark:text-red-200 text-sm">{exportError}</p>
              </div>
            )}
            </div>
            
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowExportModal(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none"
            >
              {t('projects.manager.cancel')}
            </button>
            <button
              onClick={exportData}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none"
            >
              {t('projects.manager.export.button')}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // 取消导入操作
  const cancelImport = () => {
    setShowImportModal(false);
    setImportData('');
    setImportError('');
    setImportSuccess('');
  };

  const renderImportModal = () => {
    if (!showImportModal) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{t('projects.manager.import.title')}</h3>
          <p className="mb-4 text-gray-600 dark:text-gray-300">{t('projects.manager.import.description')}</p>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('projects.manager.import.selectFile')}
            </label>
            <input
              type="file"
              accept=".json"
              onChange={handleImportFileSelect}
              className="w-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md p-2 border border-gray-300 dark:border-gray-600"
            />
            {importError && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{importError}</p>}
            {importSuccess && <p className="mt-2 text-sm text-green-600 dark:text-green-400">{importSuccess}</p>}
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={cancelImport}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              {t('projects.manager.cancel')}
            </button>
            <button
              type="button"
              onClick={importDataFromJson}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              disabled={!importData}
            >
              {t('projects.manager.import.confirm')}
            </button>
          </div>
        </div>
      </div>
    );
  };
            
  // 更新项目图片上传区域
  const renderProjectImageUploader = () => {
    return (
      <div className="mb-6">
              <label className="block text-gray-700 dark:text-gray-300 mb-2">
          {t('projects.manager.projectImage')}
              </label>
        
        <div 
          className={`border-2 border-dashed rounded-lg p-6 text-center mb-4 ${
            dragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-700'
          } transition-colors`}
          onDragOver={handleProjectDragOver}
          onDragLeave={handleProjectDragLeave}
          onDrop={handleProjectDrop}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <p className="mt-2 text-gray-600 dark:text-gray-400">{t('projects.manager.dragOrClick')}</p>
              <input
                type="file"
            id="projectImage"
            accept={VALID_IMAGE_TYPES.join(',')}
                onChange={handleProjectImageChange}
            className="hidden"
          />
          <label
            htmlFor="projectImage"
            className="mt-2 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors cursor-pointer"
          >
            {t('projects.manager.selectImage')}
          </label>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            {t('projects.manager.supportedFormats')}: JPEG, PNG, GIF, WebP, SVG (最大 5MB)
          </p>
        </div>
        
        {uploading && (
          <div className="mb-4">
            <div className="flex justify-between text-xs mb-1">
              <span>{t('projects.manager.uploading')}</span>
              <span>{projectUploadProgress}</span>
                </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-in-out" 
                style={{ width: `${projectUploadProgress}` }}
              ></div>
            </div>
          </div>
        )}
        
        {projectImagePreview && (
          <div className="relative inline-block">
            <img
              src={projectImagePreview}
              alt={t('projects.manager.preview')}
              className="h-24 w-24 object-cover rounded-md border border-gray-300 dark:border-gray-700"
            />
              <button
                type="button"
              onClick={() => {
                setProjectImagePreview('');
                setCurrentProject({...currentProject, image: ''});
              }}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              title={t('projects.manager.remove')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              </button>
          </div>
        )}
      </div>
    );
  };

  // 更新奖项表单中的文件上传区域
  const renderAwardFileUploader = () => {
    return (
      <div className="mb-6">
        <label className="block text-gray-700 dark:text-gray-300 mb-2">
          {t('projects.manager.awardFile')}
        </label>
        
        <div 
          className={`border-2 border-dashed rounded-lg p-6 text-center mb-4 ${
            dragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-700'
          } transition-colors`}
          onDragOver={handleAwardDragOver}
          onDragLeave={handleAwardDragLeave}
          onDrop={handleAwardDrop}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
          <p className="mt-2 text-gray-600 dark:text-gray-400">{t('projects.manager.dragOrClick')}</p>
          <input
            type="file"
            id="awardFile"
            accept={[...VALID_IMAGE_TYPES, ...VALID_DOC_TYPES].join(',')}
            onChange={handleAwardImageChange}
            className="hidden"
          />
          <label
            htmlFor="awardFile"
            className="mt-2 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors cursor-pointer"
          >
            {t('projects.manager.selectFile')}
          </label>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            {t('projects.manager.supportedFiles')}: 图片或文档 (最大 5MB)
          </p>
            </div>
        
        {uploading && (
          <div className="mb-4">
            <div className="flex justify-between text-xs mb-1">
              <span>{t('projects.manager.uploading')}</span>
              <span>{awardUploadProgress}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-in-out" 
                style={{ width: `${awardUploadProgress}` }}
              ></div>
            </div>
          </div>
        )}
        
        {awardImagePreview && (
          <div className="relative inline-block">
            <img
              src={awardImagePreview}
              alt={t('projects.manager.preview')}
              className="h-24 w-24 object-cover rounded-md border border-gray-300 dark:border-gray-700"
            />
                      <button
              type="button"
              onClick={() => {
                setAwardImagePreview('');
                setCurrentAward({...currentAward, image: ''});
              }}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              title={t('projects.manager.remove')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
                      </button>
          </div>
        )}
        
        {currentAward.document && (
          <div className="flex items-center bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">
              {currentAward.document.fileName}
            </span>
                      <button
              type="button"
              onClick={() => {
                setCurrentAward({...currentAward, document: undefined});
              }}
              className="text-red-500 hover:text-red-700 ml-2"
              title={t('projects.manager.remove')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
                      </button>
                    </div>
        )}
                  </div>
    );
  };

  // 在项目表单中替换原有的图片上传部分
  const renderProjectForm = () => {
    return (
      <form onSubmit={saveProject} id="projectForm">
        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="title">
            {t('projects.manager.title')}
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={currentProject.title}
            onChange={handleProjectChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            required
                      />
                    </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="description">
            {t('projects.manager.description')}
          </label>
          <textarea
            id="description"
            name="description"
            value={currentProject.description}
            onChange={handleProjectChange}
            rows={4}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            required
          ></textarea>
                  </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="link">
            {t('projects.manager.link')}
          </label>
          <input
            type="url"
            id="link"
            name="link"
            value={currentProject.link || ''}
            onChange={handleProjectChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="https://github.com/yourusername/project"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-300 mb-2">
            {t('projects.manager.technologies')}
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {currentProject.technologies.map((tech, index) => (
              <div key={index} className="bg-blue-100 dark:bg-blue-900 px-3 py-1 rounded-full flex items-center">
                <span className="text-blue-800 dark:text-blue-200 text-sm">{tech}</span>
                <button
                  type="button"
                  onClick={() => removeTechnology(index)}
                  className="ml-2 text-blue-800 dark:text-blue-200 hover:text-blue-600 dark:hover:text-blue-300"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                </div>
              ))}
            </div>
          <div className="flex">
            <input
              type="text"
              id="techInput"
              value={techInput}
              onChange={handleTechInputChange}
              placeholder={t('projects.manager.addTechnology')}
              className="flex-1 px-4 py-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTechnology();
                }
              }}
            />
            <button
              type="button"
              onClick={addTechnology}
              className="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition-colors"
            >
              {t('projects.manager.add')}
            </button>
          </div>
        </div>
        
        {/* 使用新的图片上传区域组件 */}
        {renderProjectImageUploader()}
        
        <div className="flex justify-between">
          <button
            type="button"
            onClick={resetProjectForm}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            {t('projects.manager.cancel')}
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            disabled={uploading}
          >
            {isEditingProject ? t('projects.manager.saveChanges') : t('projects.manager.addProject')}
          </button>
        </div>
      </form>
    );
  };

  // 在奖项表单中替换原有的文件上传部分
  const renderAwardForm = () => {
    return (
      <form onSubmit={saveAward} id="awardForm">
        <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="awardTitle">
            {t('projects.manager.awardTitle')}
                </label>
                <input
                  type="text"
                  id="awardTitle"
                  name="title"
                  value={currentAward.title}
                  onChange={handleAwardChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
              
        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="organization">
                  {t('projects.manager.organization')}
                </label>
                <input
                  type="text"
            id="organization"
                  name="organization"
                  value={currentAward.organization}
                  onChange={handleAwardChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
            </div>
            
        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="date">
                {t('projects.manager.date')}
              </label>
              <input
                type="text"
            id="date"
                name="date"
                value={currentAward.date}
                onChange={handleAwardChange}
            placeholder="YYYY/MM"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
            
        <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="awardDescription">
                {t('projects.manager.description')}
              </label>
              <textarea
                id="awardDescription"
                name="description"
                value={currentAward.description}
                onChange={handleAwardChange}
                rows={4}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
          ></textarea>
            </div>
            
        {/* 使用新的文件上传区域组件 */}
        {renderAwardFileUploader()}
        
        <div className="flex justify-between">
              <button
                type="button"
                onClick={resetAwardForm}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
            {t('projects.manager.cancel')}
              </button>
              <button
                type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            disabled={uploading}
              >
            {isEditingAward ? t('projects.manager.saveChanges') : t('projects.manager.addAward')}
              </button>
            </div>
          </form>
    );
  };

  // 在页面关闭或刷新前自动保存
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveProjectsToStorage(projects);
      saveAwardsToStorage(awards);
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [projects, awards]);
  
  // 检查是否有草稿需要恢复
  useEffect(() => {
    try {
      const draftProject = sessionStorage.getItem('draft_project');
      const draftProjectImage = sessionStorage.getItem('draft_project_image');
      const draftAward = sessionStorage.getItem('draft_award');
      const draftAwardImage = sessionStorage.getItem('draft_award_image');
      
      if (draftProject) {
        const parsedProject = JSON.parse(draftProject);
        setCurrentProject(parsedProject);
        if (draftProjectImage) {
          setProjectImagePreview(draftProjectImage);
        }
        setIsEditingProject(true);
        
        // 恢复后清除草稿
        sessionStorage.removeItem('draft_project');
        sessionStorage.removeItem('draft_project_image');
        
        // 显示恢复消息
        showSuccessMessage('已恢复未保存的项目编辑');
      }
      
      if (draftAward) {
        const parsedAward = JSON.parse(draftAward);
        setCurrentAward(parsedAward);
        if (draftAwardImage) {
          setAwardImagePreview(draftAwardImage);
        }
        setIsEditingAward(true);
        
        // 恢复后清除草稿
        sessionStorage.removeItem('draft_award');
        sessionStorage.removeItem('draft_award_image');
        
        // 显示恢复消息
        showSuccessMessage('已恢复未保存的奖项编辑');
      }
    } catch (error) {
      console.error('恢复草稿失败:', error);
    }
  }, []);

  // 添加导航到ProjectsAndAwards页面前的数据同步函数
  const syncDataBeforeNavigation = () => {
    console.log('执行导航前数据同步...');
    
    // 确保从localStorage加载最新数据到状态
    try {
      // 从localStorage读取最新的项目数据
      const savedProjectsJson = localStorage.getItem('projects');
      if (savedProjectsJson) {
        try {
          const savedProjects = JSON.parse(savedProjectsJson);
          if (Array.isArray(savedProjects) && savedProjects.length > 0) {
            // 更新React状态
            setProjects(savedProjects);
            // 强制更新localStorage，确保数据一致性
            localStorage.setItem('projects', JSON.stringify(savedProjects));
            console.log('syncDataBeforeNavigation: 已同步项目数据，数量:', savedProjects.length);
          } else {
            console.warn('syncDataBeforeNavigation: localStorage中的项目数据无效或为空');
          }
        } catch (parseError) {
          console.error('syncDataBeforeNavigation: 解析项目JSON数据出错:', parseError);
        }
      }
      
      // 从localStorage读取最新的奖项数据
      const savedAwardsJson = localStorage.getItem('awards');
      if (savedAwardsJson) {
        try {
          const savedAwards = JSON.parse(savedAwardsJson);
          if (Array.isArray(savedAwards) && savedAwards.length > 0) {
            // 更新React状态
            setAwards(savedAwards);
            // 强制更新localStorage，确保数据一致性
            localStorage.setItem('awards', JSON.stringify(savedAwards));
            console.log('syncDataBeforeNavigation: 已同步奖项数据，数量:', savedAwards.length);
          } else {
            console.warn('syncDataBeforeNavigation: localStorage中的奖项数据无效或为空');
          }
        } catch (parseError) {
          console.error('syncDataBeforeNavigation: 解析奖项JSON数据出错:', parseError);
        }
      }
      
      console.log('syncDataBeforeNavigation: 数据同步完成');
    } catch (error) {
      console.error('syncDataBeforeNavigation: 同步数据出错:', error);
    }
  };

  // 添加自动同步到GitHub功能
  const autoSyncToGitHub = async () => {
    try {
      // 如果已经在同步中，则跳过
      if (isSyncing) {
        console.log('已有同步任务在进行中，跳过此次同步');
        return;
      }
      
      setIsSyncing(true);
      setSyncMessage('正在同步数据到GitHub...');
      
      const exportObject = {
        projects: projects,
        awards: awards,
        exportDate: new Date().toISOString(),
        version: '1.0'
      };
      
      const success = await syncDataToGitHubRepo(exportObject, { 
        targetFile: 'public/data/portfolio-data.json',
        commitMessage: '自动同步项目和奖项数据 [自动提交]'
      });
      
      if (success) {
        const now = new Date();
        setLastSyncTime(now);
        setSyncMessage(`上次同步: ${now.toLocaleTimeString()}`);
        console.log('数据已自动同步到GitHub', now.toLocaleTimeString());
      } else {
        setSyncMessage('同步失败，请检查GitHub配置');
        console.error('自动同步到GitHub失败');
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

  // 组件初始化时加载数据
  useEffect(() => {
    // 加载项目和奖项数据
    const loadData = async () => {
      await loadProjectsFromStorage();
      await loadAwardsFromStorage();
    };
    
    loadData();
    
    // 不再需要beforeunload事件，我们已经在其他地方处理了数据保存
    return () => {
      // 清理函数可以保持为空
    };
  }, []);

  // 添加一个用于保存到GitHub的函数
  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const saveToGitHub = async () => {
    try {
      // 准备导出的数据
      const exportObject = {
        projects,
        awards,
        exportDate: new Date().toISOString(),
        version: '1.0'
      };
      
      // 同步到GitHub
      const success = await syncDataToGitHubRepo(exportObject, {
        targetFile: 'public/data/portfolio-data.json',
        commitMessage: '更新项目和奖项数据 [自动提交]'
      });
      
      if (success) {
        console.log('数据已成功同步到GitHub');
        showSuccessMessage(t('projects.manager.export.githubSuccess') || '已成功同步到GitHub仓库');
      } else {
        console.error('同步到GitHub失败');
      }
      
      return success;
    } catch (error) {
      console.error('保存到GitHub出错:', error);
      return false;
    }
  };
  
  // 保存项目到本地存储
  const saveProjectsToStorage = (projectsToSave: Project[]) => {
    try {
      localStorage.setItem('projects', JSON.stringify(projectsToSave));
    } catch (error) {
      console.error('保存项目到本地存储失败:', error);
    }
  };

  // 保存奖项到本地存储
  const saveAwardsToStorage = (awardsToSave: Award[]) => {
    try {
      localStorage.setItem('awards', JSON.stringify(awardsToSave));
    } catch (error) {
      console.error('保存奖项到本地存储失败:', error);
    }
  };

  // 渲染组件
  return (
    <div className="min-h-screen bg-white dark:bg-black py-24">
      {/* 成功消息提示 */}
      {successMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-opacity duration-300 ease-in-out">
          {successMessage}
        </div>
      )}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900 dark:text-white mb-2">{t('projects.manager.title')}</h1>
            <p className="text-gray-600 dark:text-gray-300">{t('projects.manager.subtitle')}</p>
          </div>
          <div className="flex space-x-3 items-center">
            {/* 添加同步状态指示器 */}
            {isSyncing && (
              <span className="text-sm text-blue-600 dark:text-blue-400 flex items-center mr-3">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                正在同步...
              </span>
            )}
            
            {!isSyncing && syncMessage && (
              <span className="text-sm text-gray-600 dark:text-gray-400 mr-3">
                {syncMessage}
              </span>
            )}
            
            <button
              type="button"
              onClick={() => handleNavigation('/projects')}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              {t('projects.manager.backToProjects')}
            </button>
            <button
              type="button"
              onClick={() => setShowImportModal(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              {t('projects.manager.import.button')}
            </button>
            <button
              type="button"
              onClick={() => setShowExportModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              {t('projects.manager.export.button')}
            </button>
          </div>
        </div>
        
        {/* 主要内容容器 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">{isEditingProject ? t('projects.manager.editProject') : t('projects.manager.addProject')}</h2>
              
              {/* 项目表单 - 使用新的渲染函数 */}
              {renderProjectForm()}
            </div>
            
            {/* 项目列表 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
              {renderProjectsList()}
            </div>
          </div>
          
          <div className="space-y-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">{isEditingAward ? t('projects.manager.editAward') : t('projects.manager.addAward')}</h2>
              
              {/* 奖项表单 - 使用新的渲染函数 */}
              {renderAwardForm()}
            </div>
              
            {/* 奖项列表 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
              {renderAwardsList()}
            </div>
          </div>
        </div>
      </div>
      {renderExportModal()}
      {renderImportModal()}
    </div>
  );
}
