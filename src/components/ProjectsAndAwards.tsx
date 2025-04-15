import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { getFileIcon } from '../utils/fileUtils';
import ImageViewer from './ImageViewer';
import DocumentViewer from './DocumentViewer';

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

export default function ProjectsAndAwards() {
  const { t } = useLanguage();
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
      setViewingImage(imageUrl);
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
      setViewingDocument(document);
    } else {
      console.error('文档数据URL为空或无效');
      alert(t('awards.download_error') || '查看失败: 无效的文档数据');
    }
  };
  
  // 处理关闭文档预览
  const handleCloseDocumentViewer = () => {
    setViewingDocument(null);
  };

  // 处理编辑项目
  const handleEditProject = (project: Project, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('编辑项目:', project.title);
    navigate('/projects-manager', { state: { editProject: project } });
  };
  
  // 处理编辑奖项
  const handleEditAward = (award: Award, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('编辑奖项:', award.title);
    navigate('/projects-manager', { state: { editAward: award } });
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

  // 提取加载数据逻辑到独立函数，以便重用
  const loadLatestData = () => {
    console.log('从localStorage加载最新数据...');
    setIsLoaded(false); // 重置加载状态
    
    // 标记用于跟踪数据加载状态
    let projectsLoaded = false;
    let awardsLoaded = false;
    
    // 创建一个延迟任务，确保在数据加载完成后设置isLoaded状态
    setTimeout(() => {
      // 加载项目数据
      try {
        const savedProjects = localStorage.getItem('projects');
        console.log('从localStorage获取projects键的原始值:', savedProjects ? `有数据，长度: ${savedProjects.length}` : '无数据');
        
        if (savedProjects) {
          try {
            const parsedProjects = JSON.parse(savedProjects);
            
            if (Array.isArray(parsedProjects)) {
              console.log('解析后的项目数组长度:', parsedProjects.length);
              
              // 确认数组内容是否符合预期
              const validProjects = parsedProjects.filter(project => 
                project && typeof project === 'object' && project.title
              );
              
              console.log('有效项目数量:', validProjects.length);
              
              if (validProjects.length > 0) {
                // 验证图片路径，确保显示正常
                const validatedProjects = validProjects.map((project: any) => ({
                  ...project,
                  id: project.id || crypto.randomUUID(),
                  image: project.image || '/vite.svg', // 确保有默认图片
                  technologies: Array.isArray(project.technologies) ? project.technologies : []
                }));
                
                console.log('设置项目状态，数量:', validatedProjects.length);
                setProjects(validatedProjects);
                console.log('项目数据已设置到组件状态');
                
                projectsLoaded = true;
              } else {
                console.warn('从localStorage加载的项目数据无效或为空');
              }
            } else {
              console.error('从localStorage加载的projects不是数组:', typeof parsedProjects);
            }
          } catch (error) {
            console.error('解析项目数据JSON失败:', error);
          }
        } else {
          console.warn('localStorage中不存在projects键');
        }
      } catch (storageError) {
        console.error('访问localStorage时出错:', storageError);
      }
      
      // 加载奖项数据
      try {
        const savedAwards = localStorage.getItem('awards');
        console.log('从localStorage获取awards键的原始值:', savedAwards ? `有数据，长度: ${savedAwards.length}` : '无数据');
        
        if (savedAwards) {
          try {
            const parsedAwards = JSON.parse(savedAwards);
            
            if (Array.isArray(parsedAwards)) {
              console.log('解析后的奖项数组长度:', parsedAwards.length);
              
              // 确认数组内容是否符合预期
              const validAwards = parsedAwards.filter(award => 
                award && typeof award === 'object' && award.title
              );
              
              console.log('有效奖项数量:', validAwards.length);
              
              if (validAwards.length > 0) {
                // 验证图片路径，确保显示正常
                const validatedAwards = validAwards.map((award: any) => ({
                  ...award,
                  id: award.id || crypto.randomUUID(),
                  image: award.image || '/vite.svg', // 确保有默认图片
                  organization: award.organization || ''
                }));
                
                console.log('设置奖项状态，数量:', validatedAwards.length);
                setAwards(validatedAwards);
                console.log('奖项数据已设置到组件状态');
                
                awardsLoaded = true;
              } else {
                console.warn('从localStorage加载的奖项数据无效或为空');
              }
            } else {
              console.error('从localStorage加载的awards不是数组:', typeof parsedAwards);
            }
          } catch (error) {
            console.error('解析奖项数据JSON失败:', error);
          }
        } else {
          console.warn('localStorage中不存在awards键');
        }
      } catch (storageError) {
        console.error('访问localStorage时出错:', storageError);
      }
      
      // 如果localStorage没有项目数据或数据无效，则加载默认项目数据
      if (!projectsLoaded) {
        console.log('使用默认项目数据');
        // 默认项目数据
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
        setProjects(defaultProjects);
        // 保存默认项目到localStorage
        localStorage.setItem('projects', JSON.stringify(defaultProjects));
        console.log('已保存默认项目到localStorage');
      }
      
      // 如果localStorage没有奖项数据或数据无效，则加载默认奖项数据
      if (!awardsLoaded) {
        console.log('使用默认奖项数据');
        // 默认奖项数据
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
        setAwards(defaultAwards);
        // 保存默认奖项到localStorage
        localStorage.setItem('awards', JSON.stringify(defaultAwards));
        console.log('已保存默认奖项到localStorage');
      }
      
      // 加载完成，设置状态
      setIsLoaded(true);
      console.log('数据加载完成，已设置isLoaded = true');
    }, 100); // 短暂延迟，确保localStorage数据同步
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-semibold text-gray-900 dark:text-white mb-6" style={{ letterSpacing: '-0.025em' }}>{t('projects.title')}</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto" style={{ fontWeight: 300 }}>{t('projects.subtitle')}</p>
          <div className="mt-6">
            <Link 
              to="/projects-manager" 
              className="inline-flex items-center px-4 py-2 bg-[var(--apple-blue)] text-white rounded-md hover:bg-[var(--apple-blue-hover)] transition-colors duration-300"
            >
              {t('projects.manage')}
            </Link>
          </div>
        </div>
        <div className={`transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
          {/* Projects Section */}
          <div className="mb-24">
            <h2 className="text-3xl font-semibold text-gray-900 dark:text-white mb-10" style={{ letterSpacing: '-0.025em' }}>{t('projects.projects')}</h2>
            {projects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {projects.map((project, index) => (
                  <div key={index} className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden transition-all duration-500 ease-out hover:shadow-2xl hover:scale-105 border border-gray-100 dark:border-gray-700 relative">
                    <EditButton onClick={(e) => handleEditProject(project, e)} />
                    {project.image && (
                      <div className="h-56 overflow-hidden cursor-pointer" onClick={(e) => handleImageClick(project.image || '', project.title, e)}>
                        <img 
                          src={project.image} 
                          alt={project.title} 
                          className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                          loading="lazy"
                          onError={(e) => {
                            console.error('项目图片加载失败:', project.title);
                            
                            // 检查图片路径是否为dataURL
                            if (project.image && project.image.startsWith('data:')) {
                              console.warn('数据URL图片加载失败，可能数据损坏');
                              // 对于dataURL，直接使用备用图片
                              e.currentTarget.src = '/vite.svg';
                            } else {
                              // 对于普通URL，尝试加载备用图片
                              e.currentTarget.src = '/vite.svg';
                              console.log('已切换到备用图片');
                            }
                            
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
                    )}
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
                    <EditButton onClick={(e) => handleEditAward(award, e)} />
                    <div className="flex items-center p-8 border-b border-gray-100 dark:border-gray-700">
                      {award.image && (
                        <div className="w-16 h-16 mr-5 flex-shrink-0 cursor-pointer" onClick={(e) => handleImageClick(award.image || '', award.title, e)}>
                          <img 
                            src={award.image} 
                            alt={award.organization} 
                            className="w-full h-full object-contain transition-transform duration-500 hover:scale-110"
                            loading="lazy"
                            onError={(e) => {
                              console.error('奖项图片加载失败:', award.title);
                              // 设置一个默认图片
                              e.currentTarget.src = '/vite.svg';
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
                      )}
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
                          {t('awards.view_or_download')} {award.document.fileName}
                        </button>
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
      
      {/* 图片查看器 */}
      {viewingImage && (
        <ImageViewer 
          imageUrl={viewingImage} 
          title={viewingImageTitle} 
          onClose={handleCloseImageViewer}
        />
      )}
      
      {/* 文档查看器 */}
      {viewingDocument && (
        <DocumentViewer
          dataUrl={viewingDocument.dataUrl}
          fileName={viewingDocument.fileName}
          fileType={viewingDocument.fileType}
          onClose={handleCloseDocumentViewer}
        />
      )}
    </div>
  );
}