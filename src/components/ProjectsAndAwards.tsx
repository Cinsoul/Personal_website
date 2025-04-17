import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { useAdmin } from '../contexts/AdminContext';
import { getFileIcon } from '../utils/fileUtils';
import ImageViewer from './viewers/ImageViewer';
import DocumentViewer from './viewers/DocumentViewer';
import { getBasePath } from '../utils/imageUtils';

// 编辑按钮组件
const EditButton = ({ onClick }: { onClick: (e: React.MouseEvent) => void }) => {
  const { t } = useLanguage();
  return (
    <button
      onClick={onClick}
      className="absolute top-3 right-3 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 p-2 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-300 z-10"
      aria-label={t('projects.manager.edit')}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>
    </button>
  );
};

interface Project {
  id?: string;
  title: string;
  description: string;
  technologies: string[];
  link?: string;
  image?: string;
}

interface Award {
  id?: string;
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

// 从预定义文件加载数据
const loadPortfolioData = async (): Promise<{ projects: Project[], awards: Award[] }> => {
  try {
    // 首先尝试从data目录加载数据
    const basePath = getBasePath();
    const dataUrl = `${basePath}/data/portfolio-data.json`;
    
    const response = await fetch(dataUrl);
    
    if (response.ok) {
      const data = await response.json();
      console.log('从portfolio-data.json加载数据成功');
      return {
        projects: data.projects || [],
        awards: data.awards || []
      };
    }
    
    // 如果第一个文件不存在，尝试加载默认数据
    console.log('尝试加载默认数据文件');
    const defaultResponse = await fetch(`${basePath}/data/default-portfolio-data.json`);
    
    if (defaultResponse.ok) {
      const defaultData = await defaultResponse.json();
      console.log('从default-portfolio-data.json加载数据成功');
      return {
        projects: defaultData.projects || [],
        awards: defaultData.awards || []
      };
    }
    
    console.warn('无法从文件加载数据，尝试从localStorage加载');
    return {
      projects: loadProjectsFromLocalStorage(),
      awards: loadAwardsFromLocalStorage()
    };
  } catch (error) {
    console.error('加载项目和奖项数据失败:', error);
    return {
      projects: loadProjectsFromLocalStorage(),
      awards: loadAwardsFromLocalStorage()
    };
  }
};

// 从localStorage加载项目数据
const loadProjectsFromLocalStorage = (): Project[] => {
  try {
    const savedProjects = localStorage.getItem('projects');
    if (savedProjects) {
      return JSON.parse(savedProjects);
    }
  } catch (error) {
    console.error('从localStorage加载项目数据失败:', error);
  }
  return [];
};

// 从localStorage加载奖项数据
const loadAwardsFromLocalStorage = (): Award[] => {
  try {
    const savedAwards = localStorage.getItem('awards');
    if (savedAwards) {
      return JSON.parse(savedAwards);
    }
  } catch (error) {
    console.error('从localStorage加载奖项数据失败:', error);
  }
  return [];
};

export default function ProjectsAndAwards() {
  const { t } = useLanguage();
  const { isAuthenticated } = useAdmin();
  const [projects, setProjects] = useState<Project[]>([]);
  const [awards, setAwards] = useState<Award[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoaded, setIsLoaded] = useState(false);  // 保留此状态用于控制加载动画
  
  // 图片预览状态
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const [viewingImageTitle, setViewingImageTitle] = useState<string>('');
  
  // 文档预览状态
  const [viewingDocument, setViewingDocument] = useState<{
    dataUrl: string;
    fileName: string;
    fileType: string;
  } | null>(null);

  // 处理图片点击
  const handleImageClick = (imageUrl: string, title: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // 只有当图片URL存在且不是编辑模式时才显示预览
    if (imageUrl) {
      // 处理图片路径，确保在GitHub Pages环境正确处理路径
      const processedImageUrl = imageUrl.startsWith('http') || imageUrl.startsWith('data:')
        ? imageUrl
        : `${getBasePath()}${imageUrl}`;
      
      console.log('处理后的图片URL:', processedImageUrl);
      setViewingImage(processedImageUrl);
      setViewingImageTitle(title);
    }
  };
  
  // 处理关闭图片预览
  const handleCloseImageViewer = () => {
    setViewingImage(null);
    setViewingImageTitle('');
  };
  
  // 处理文档点击
  const handleDocumentClick = (document: { dataUrl: string; fileName: string; fileType: string }, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // 验证文档数据URL是否有效
    if (document && document.dataUrl && document.dataUrl.trim() !== '') {
      // 判断是相对路径还是完整URL
      const isRelativePath = !document.dataUrl.startsWith('http') && !document.dataUrl.startsWith('data:');
      
      // 针对本地文件，添加特殊处理
      if (isRelativePath && document.dataUrl.startsWith('/certificates/')) {
        console.log('正在处理证书文件路径:', document.dataUrl);
      }
      
      // 添加路径处理逻辑，确保在GitHub Pages环境正确处理路径
      const processedDocument = {
        ...document,
        dataUrl: isRelativePath ? `${getBasePath()}${document.dataUrl}` : document.dataUrl,
        fileType: document.fileType || (document.dataUrl.endsWith('.jpg') || document.dataUrl.endsWith('.jpeg') ? 'image/jpeg' : 
                 document.dataUrl.endsWith('.png') ? 'image/png' : 'application/octet-stream')
      };
      
      // 如果文件名不存在，创建默认文件名
      if (!processedDocument.fileName || processedDocument.fileName.trim() === '') {
        const parts = processedDocument.dataUrl.split('/');
        processedDocument.fileName = parts[parts.length - 1] || '未知文件';
      }
      
      console.log('处理后的文档信息:', {
        url: processedDocument.dataUrl,
        filename: processedDocument.fileName,
        type: processedDocument.fileType
      });
      
      setViewingDocument(processedDocument);
    } else {
      console.error('文档数据URL为空或无效:', document);
      alert('查看失败: 文档链接无效。请确保证书文件已上传到正确位置。');
    }
  };
  
  // 处理关闭文档预览
  const handleCloseDocumentViewer = () => {
    setViewingDocument(null);
  };

  // 处理编辑项目
  const handleEditProject = (project: Project, e: React.MouseEvent) => {
    console.log('编辑项目请求:', project.title);
    e.preventDefault();
    e.stopPropagation();
    
    // 检查认证状态
    const authState = localStorage.getItem('adminAuthenticated');
    console.log('编辑前认证状态:', authState);
    
    // 设置更详细的状态传递
    navigate('/projects-manager', { 
      state: { 
        editProject: project,
        timestamp: new Date().getTime() // 添加时间戳避免缓存问题
      },
      replace: false // 确保不替换历史记录
    });
  };
  
  // 处理编辑奖项
  const handleEditAward = (award: Award, e: React.MouseEvent) => {
    console.log('编辑奖项请求:', award.title);
    e.preventDefault();
    e.stopPropagation();
    
    // 检查认证状态
    const authState = localStorage.getItem('adminAuthenticated');
    console.log('编辑前认证状态:', authState);
    
    // 设置更详细的状态传递
    navigate('/projects-manager', { 
      state: { 
        editAward: award,
        timestamp: new Date().getTime()
      },
      replace: false
    });
  };

  // 检测location.state中的refresh标志，用于强制重新加载数据
  useEffect(() => {
    if (location.state && location.state.refresh) {
      console.log('检测到刷新标志，重新加载数据...');
      loadLatestData();
      
      // 清除refresh状态，防止重复刷新
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  // 加载数据
  useEffect(() => {
    console.log('ProjectsAndAwards组件挂载，加载数据...');
    
    // 尝试从localStorage加载数据
    try {
      loadLatestData();
    } catch (error) {
      console.error('加载数据出错:', error);
      setIsLoaded(true); // 即使出错也设置加载状态为完成
    }
    
    return () => {
      console.log('ProjectsAndAwards组件卸载');
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 修改loadLatestData函数
  const loadLatestData = () => {
    console.log('从localStorage加载最新数据...');
    setIsLoaded(false); // 重置加载状态
    
    // 标记用于跟踪数据加载状态
    let projectsLoaded = false;
    let awardsLoaded = false;
    
    // 立即设置默认数据，确保即使localStorage加载失败也有内容显示
    const defaultProjects: Project[] = [
      {
        id: 'project-1',
        title: 'Personal Website',
        description: 'A responsive personal portfolio website built with React and Tailwind CSS, featuring dark mode support, responsive design, and smooth animations',
        technologies: ['React', 'TypeScript', 'Tailwind CSS', 'Vite'],
        link: 'https://github.com/yourusername/personal-website',
        image: '/project-images/personal-website.png'
      },
      {
        id: 'project-2',
        title: 'LVMH Digital Innovation',
        description: 'Developed innovative digital solutions for luxury retail, focusing on enhancing customer experience through AR/VR technology',
        technologies: ['React Native', 'AR Kit', 'Node.js', 'AWS'],
        image: '/project-images/lvmh-project.svg'
      },
      {
        id: 'project-3',
        title: 'Bloomberg Market Analysis',
        description: 'Created a comprehensive market analysis tool using Bloomberg API, enabling real-time financial data visualization and analysis',
        technologies: ['Python', 'Bloomberg API', 'Pandas', 'Plotly'],
        image: '/project-images/bloomberg-project.svg'
      },
      {
        id: 'project-4',
        title: 'Investment Banking Analytics',
        description: 'Developed financial models and analytics tools for investment banking operations, focusing on M&A analysis',
        technologies: ['Excel', 'VBA', 'Python', 'Financial Modeling'],
        image: '/project-images/jpmorgan-project.svg'
      }
    ];
    
    const defaultAwards: Award[] = [
      {
        id: 'award-1',
        title: 'Dean\'s List',
        organization: 'Bayes Business School',
        date: '2023',
        description: 'Awarded for outstanding academic achievement and maintaining a high GPA throughout the academic year',
        image: '/project-images/bayes-award.svg'
      },
      {
        id: 'award-2',
        title: 'LVMH Inside Program Completion',
        organization: 'LVMH',
        date: 'Nov 2024',
        description: 'Successfully completed the exclusive LVMH Inside program, gaining comprehensive insights into luxury retail and digital innovation',
        image: '/logos/lvmh.svg'
      },
      {
        id: 'award-3',
        title: 'Bloomberg Market Concepts',
        organization: 'Bloomberg',
        date: 'Sep 2021',
        description: 'Completed advanced financial market analysis certification, covering economics, currencies, fixed income, and equities',
        image: '/logos/bloomberg.svg'
      },
      {
        id: 'award-4',
        title: 'Investment Banking Excellence',
        organization: 'JPMorgan Chase',
        date: 'Apr 2021',
        description: 'Recognized for outstanding performance in investment banking simulation program, focusing on M&A analysis and financial modeling',
        image: '/logos/jpmorgan.svg'
      }
    ];
    
    // 先设置默认数据，确保页面有内容显示
    setProjects(defaultProjects);
    setAwards(defaultAwards);
    
    // 首先尝试从仓库加载数据
    loadPortfolioData().then(repoData => {
      if (repoData) {
        console.log('使用从仓库加载的数据');
        setProjects(repoData.projects);
        setAwards(repoData.awards);
        projectsLoaded = true;
        awardsLoaded = true;
        setIsLoaded(true);
        return;
      }
      
      // 如果仓库数据加载失败，尝试从localStorage加载
      try {
        // 尝试加载项目数据
        const savedProjects = localStorage.getItem('projects');
        if (savedProjects) {
          const parsedProjects = JSON.parse(savedProjects);
          if (Array.isArray(parsedProjects) && parsedProjects.length > 0) {
            setProjects(parsedProjects);
            projectsLoaded = true;
            console.log('从localStorage加载了项目数据');
          }
        }
        
        // 尝试加载奖项数据
        const savedAwards = localStorage.getItem('awards');
        if (savedAwards) {
          const parsedAwards = JSON.parse(savedAwards);
          if (Array.isArray(parsedAwards) && parsedAwards.length > 0) {
            setAwards(parsedAwards);
            awardsLoaded = true;
            console.log('从localStorage加载了奖项数据');
          }
        }
      } catch (error) {
        console.error('从localStorage加载数据时出错:', error);
      } finally {
        setIsLoaded(true);
        
        if (!projectsLoaded) {
          console.log('未能加载项目数据，使用默认项目');
        }
        
        if (!awardsLoaded) {
          console.log('未能加载奖项数据，使用默认奖项');
        }
      }
    });
  };

  return (
    <div className="min-h-screen bg-black dark:bg-black py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-white dark:text-white">{t('projects.title')}</h2>
            {isAuthenticated && (
              <Link 
                to="/projects-manager" 
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t('projects.manage')}
              </Link>
            )}
          </div>
          <p className="text-xl text-gray-300 dark:text-gray-300 max-w-3xl mx-auto" style={{ fontWeight: 300 }}>{t('projects.subtitle')}</p>
        </div>
        <div className={`transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
          {/* Projects Section */}
          <div className="mb-24">
            <h2 className="text-3xl font-semibold text-gray-900 dark:text-white mb-10" style={{ letterSpacing: '-0.025em' }}>{t('projects.projects')}</h2>
            {projects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {projects.map((project, index) => (
                  <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden transition-all duration-500 ease-out hover:shadow-2xl hover:scale-105 border border-gray-100 dark:border-gray-700 relative">
                    {/* 只在管理员模式激活时显示编辑按钮 */}
                    {isAuthenticated && <EditButton onClick={(e) => handleEditProject(project, e)} />}
                    <div className="h-56 overflow-hidden cursor-pointer" onClick={(e) => handleImageClick(project.image || '/vite.svg', project.title, e)}>
                      <img 
                        src={project.image ? 
                          (project.image.startsWith('data:') || project.image.startsWith('http') 
                            ? project.image 
                            : `${getBasePath()}${project.image}`) 
                          : `${getBasePath()}/vite.svg`} 
                        alt={project.title} 
                        className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                        loading="lazy"
                        onError={(e) => {
                          console.error('项目图片加载失败:', project.title);
                          
                          // 检查图片路径是否为dataURL
                          if (project.image && project.image.startsWith('data:')) {
                            console.warn('数据URL图片加载失败，可能数据损坏');
                          }
                          
                          // 尝试加载备用图片
                          e.currentTarget.src = `${getBasePath()}/vite.svg`;
                          console.log('已切换到备用图片');
                          
                          // 如果默认图也加载失败，则使用内联SVG作为最终备用
                          e.currentTarget.onerror = () => {
                            console.error('备用图片也加载失败，使用内联SVG');
                            const parent = e.currentTarget.parentElement;
                            if (parent) {
                              // 创建简单的占位SVG
                              parent.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
                                <rect width="100%" height="100%" fill="#f0f0f0" />
                                <text x="50%" y="50%" font-family="Arial" font-size="14" fill="#888" text-anchor="middle" dominant-baseline="middle">${project.title}</text>
                              </svg>`;
                            }
                          };
                        }}
                      />
                    </div>
                    <div className="p-8">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3" style={{ letterSpacing: '-0.01em' }}>{project.title}</h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-6" style={{ fontWeight: 300, lineHeight: 1.6 }}>{project.description}</p>
                      <div className="flex flex-wrap gap-2 mb-6">
                        {project.technologies.map((tech, techIndex) => (
                          <span
                            key={techIndex}
                            className="px-3 py-1 bg-[var(--apple-gray)] dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                      {project.link && (
                        <a 
                          href={project.link} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-[var(--apple-blue)] hover:text-[var(--apple-blue-hover)] font-medium inline-flex items-center transition-all duration-300 ease-out hover:translate-x-1"
                        >
                          {t('projects.view')} <span className="ml-1">→</span>
                        </a>
                      )}
                      {isAuthenticated && (
                        <div className="mt-2">
                          <Link 
                            to="/projects-manager" 
                            state={{ editProject: project, timestamp: new Date().getTime() }}
                            className="text-sm text-blue-500 hover:underline"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              navigate('/projects-manager', { 
                                state: { 
                                  editProject: project,
                                  timestamp: new Date().getTime() 
                                },
                                replace: false 
                              });
                            }}
                          >
                            直接编辑
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
                <p className="text-gray-600 dark:text-gray-300">{t('projects.no_projects')}</p>
              </div>
            )}
          </div>

          {/* Awards Section */}
          <div>
            <h2 className="text-3xl font-semibold text-gray-900 dark:text-white mb-10" style={{ letterSpacing: '-0.025em' }}>{t('projects.awards')}</h2>
            {awards.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {awards.map((award, index) => (
                  <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden transition-all duration-500 ease-out hover:shadow-2xl hover:scale-105 border border-gray-100 dark:border-gray-700 relative">
                    {/* 只在管理员模式激活时显示编辑按钮 */}
                    {isAuthenticated && <EditButton onClick={(e) => handleEditAward(award, e)} />}
                    <div className="flex items-center p-8 border-b border-gray-100 dark:border-gray-700">
                      <div className="w-16 h-16 mr-5 flex-shrink-0 cursor-pointer" onClick={(e) => handleImageClick(award.image || '/vite.svg', award.title, e)}>
                        <img 
                          src={award.image ? 
                            (award.image.startsWith('data:') || award.image.startsWith('http') 
                              ? award.image 
                              : `${getBasePath()}${award.image}`) 
                            : `${getBasePath()}/vite.svg`}
                          alt={award.organization} 
                          className="w-full h-full object-contain transition-transform duration-500 hover:scale-110"
                          loading="lazy"
                          onError={(e) => {
                            console.error('奖项图片加载失败:', award.title);
                            
                            // 检查图片路径是否为dataURL
                            if (award.image && award.image.startsWith('data:')) {
                              console.warn('数据URL图片加载失败，可能数据损坏');
                            }
                            
                            // 尝试加载备用图片
                            e.currentTarget.src = `${getBasePath()}/vite.svg`;
                            console.log('已切换到备用图片');
                            
                            // 如果默认图也加载失败，则使用内联SVG作为最终备用
                            e.currentTarget.onerror = () => {
                              console.error('备用图片也加载失败，使用内联SVG');
                              const parent = e.currentTarget.parentElement;
                              if (parent) {
                                // 创建简单的占位SVG，显示组织名称
                                parent.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
                                  <rect width="100%" height="100%" fill="#f0f0f0" />
                                  <text x="50%" y="50%" font-family="Arial" font-size="12" fill="#888" text-anchor="middle" dominant-baseline="middle">${award.organization}</text>
                                </svg>`;
                              }
                            };
                          }}
                        />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white" style={{ letterSpacing: '-0.01em' }}>{award.title}</h3>
                        <p className="text-gray-600 dark:text-gray-300" style={{ fontWeight: 300 }}>{award.organization}</p>
                      </div>
                    </div>
                    <div className="p-8">
                      <p className="text-[var(--apple-light-text)] dark:text-gray-400 mb-4 text-sm font-medium">{award.date}</p>
                      <p className="text-gray-600 dark:text-gray-300 mb-6" style={{ fontWeight: 300, lineHeight: 1.6 }}>{award.description}</p>
                      
                      {/* 显示文档下载链接 */}
                      {award.document && award.document.dataUrl && (
                        <button 
                          onClick={(e) => handleDocumentClick(award.document!, e)}
                          className="flex items-center text-[var(--apple-blue)] hover:text-[var(--apple-blue-hover)] font-medium transition-all duration-300 ease-out hover:translate-x-1 bg-transparent border-0 p-0 cursor-pointer"
                        >
                          <span className="mr-2">{getFileIcon(award.document.fileType)}</span>
                          查看或下载证书 {award.document.fileName || award.title}
                        </button>
                      )}

                      {isAuthenticated && (
                        <div className="mt-2">
                          <Link 
                            to="/projects-manager" 
                            state={{ editAward: award, timestamp: new Date().getTime() }}
                            className="text-sm text-blue-500 hover:underline"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              navigate('/projects-manager', { 
                                state: { 
                                  editAward: award,
                                  timestamp: new Date().getTime() 
                                },
                                replace: false 
                              });
                            }}
                          >
                            直接编辑
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
                <p className="text-gray-600 dark:text-gray-300">{t('awards.no_awards')}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* 图片预览 */}
      {viewingImage && (
        <ImageViewer
          imageUrl={viewingImage}
          altText={viewingImageTitle}
          onClose={handleCloseImageViewer}
        />
      )}
      
      {/* 文档预览 */}
      {viewingDocument && (
        <DocumentViewer
          documentUrl={viewingDocument.dataUrl}
          filename={viewingDocument.fileName}
          mimeType={viewingDocument.fileType}
          onClose={handleCloseDocumentViewer}
        />
      )}
    </div>
  );
}