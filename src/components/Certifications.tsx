import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { getFileIcon } from '../utils/fileUtils';
import ImageViewer from './viewers/ImageViewer';
import DocumentViewer from './viewers/DocumentViewer';
import { getBasePath } from '../utils/imageUtils';

interface Certification {
  id?: string;
  title: string;
  organization: string;
  date: string;
  credentialId: string;
  logo: string;
  link?: string;
  document?: {
    dataUrl: string;
    fileName: string;
    fileType: string;
  };
}

export default function Certifications() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  
  // 从本地存储获取自定义证书数据
  const [certifications, setCertifications] = useState<Certification[]>([]);
  
  // 添加管理按钮显示状态
  const [showAdmin, setShowAdmin] = useState(false);
  
  // 图片预览状态
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const [viewingImageTitle, setViewingImageTitle] = useState<string>('');
  
  // 文档预览状态
  const [viewingDocument, setViewingDocument] = useState<{
    dataUrl: string;
    fileName: string;
    fileType: string;
  } | null>(null);

  // 添加特殊按键组合监听，用于显示管理按钮
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        console.log('证书管理员模式已激活');
        setShowAdmin(true);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 获取完整的图片URL
  const getFullImageUrl = (url: string): string => {
    if (!url) return '';
    // 如果已经是完整URL或数据URL，直接返回
    if (url.startsWith('http') || url.startsWith('data:')) {
      return url;
    }
    
    // 修正：确保basePath和url之间不会重复或缺少斜杠
    const basePath = getBasePath();
    const normalizedUrl = url.startsWith('/') ? url : `/${url}`;
    const fullUrl = `${basePath}${normalizedUrl}`;
    
    console.log('处理证书图片URL:', {
      原始url: url,
      basePath: basePath,
      处理后: fullUrl
    });
    
    return fullUrl;
  };

  // 处理图片点击
  const handleImageClick = (imageUrl: string, title: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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
    
    console.log('打开证书页面');
    
    // 直接打开证书展示页面，避免使用DocumentViewer组件
    const basePath = getBasePath();
    const certificatesUrl = `${basePath}/certificates/view-certificates.html`;
    console.log('打开证书页面URL:', certificatesUrl);
    
    window.open(certificatesUrl, '_blank');
  };
  
  // 处理关闭文档预览
  const handleCloseDocumentViewer = () => {
    setViewingDocument(null);
  };

  // 检测location.state中的refresh标志，用于强制重新加载数据
  useEffect(() => {
    if (location.state && location.state.refresh) {
      console.log('检测到刷新标志，重新加载证书数据...');
      loadCertificationsData();
      
      // 清除refresh状态，防止重复刷新
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  // 从本地存储加载数据
  useEffect(() => {
    try {
      loadCertificationsData();
    } catch (error) {
      console.error('加载证书数据出错:', error);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 提取加载数据逻辑到独立函数
  const loadCertificationsData = () => {
    console.log('从localStorage加载证书数据...');
    
    setTimeout(() => {
      try {
        const savedCertifications = localStorage.getItem('certifications');
        
        if (savedCertifications) {
          try {
            const parsedData = JSON.parse(savedCertifications);
            if (Array.isArray(parsedData) && parsedData.length > 0) {
              const validatedCertifications = parsedData.map((cert: any) => ({
                ...cert,
                id: cert.id || crypto.randomUUID(),
                logo: cert.logo || '/vite.svg'
              }));
              
              console.log('设置证书状态，数量:', validatedCertifications.length);
              setCertifications(validatedCertifications);
            } else {
              console.warn('从localStorage加载的证书数据无效或为空，使用默认数据');
              setDefaultCertifications();
            }
          } catch (parseError) {
            console.error('解析证书数据JSON失败:', parseError);
            setDefaultCertifications();
          }
        } else {
          console.log('localStorage中不存在certifications键，使用默认数据');
          setDefaultCertifications();
        }
      } catch (error) {
        console.error('访问localStorage时出错:', error);
        setDefaultCertifications();
      }
      
      console.log('证书数据加载完成');
    }, 100);
  };
  
  // 设置默认证书数据
  const setDefaultCertifications = () => {
    // 默认证书数据
    const defaultCertifications = [
      {
        id: '1',
        title: 'LVMH Inside',
        organization: 'LVMH',
        date: 'Nov 2024',
        credentialId: '1d6c06f1be',
        logo: '/logos/lvmh.svg'
      },
      {
        id: '2',
        title: 'Bloomberg Finance Fundamentals',
        organization: 'Bloomberg',
        date: 'Sep 2021',
        credentialId: 'YHrd8p8UahNuwGS6WU9LZfVM',
        logo: '/logos/bloomberg.svg'
      },
      {
        id: '3',
        title: 'JPMorgan Chase - Investment Banking Job Simulation',
        organization: 'Forage',
        date: 'Apr 2021',
        credentialId: 'NEm3qnDfHC6fJi6fn',
        logo: '/logos/jpmorgan.svg'
      },
      {
        id: '4',
        title: 'PwC - Career Plus',
        organization: 'PwC Mainland China and Hong Kong',
        date: 'Apr 2021',
        credentialId: '',
        logo: '/logos/pwc.svg'
      },
      {
        id: '5',
        title: 'PwC US - Management Consulting Job Simulation',
        organization: 'Forage',
        date: 'Apr 2021',
        credentialId: 'SapWK5qhqAwbi2mCa',
        logo: '/logos/pwc.svg'
      },
      {
        id: '6',
        title: 'The National Implementation of the Paris Agreement',
        organization: 'United Nations',
        date: 'Apr 2021',
        credentialId: 'r6T98YkY6Y',
        logo: '/logos/un.svg'
      },
      {
        id: '7',
        title: '气候变化：从学习到行动',
        organization: 'United Nations',
        date: 'Apr 2021',
        credentialId: 'fTu5VttnpY',
        logo: '/logos/un.svg'
      }
    ];
    setCertifications(defaultCertifications);
    localStorage.setItem('certifications', JSON.stringify(defaultCertifications));
    console.log('已设置并保存默认证书数据，数量:', defaultCertifications.length);
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('certifications.title') || '证书与资质'}</h1>
          
          {showAdmin && (
            <Link 
              to="/certifications/manage" 
              className="px-4 py-2 bg-blue-500 rounded-lg text-white hover:bg-blue-600 transition-colors"
            >
              {t('certifications.manage') || '管理证书'}
            </Link>
          )}
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certifications.length > 0 ? (
              certifications.map((cert) => (
                <div key={cert.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <div 
                        className="w-12 h-12 mr-4 flex-shrink-0 cursor-pointer rounded-full overflow-hidden"
                        onClick={(e) => handleImageClick(getFullImageUrl(cert.logo), cert.title, e)}
                      >
                        <img 
                          src={getFullImageUrl(cert.logo)} 
                          alt={cert.organization} 
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            console.error('证书图标加载失败:', cert.logo);
                            const fallbackUrl = `${getBasePath()}/vite.svg`;
                            console.log('使用备用图片:', fallbackUrl);
                            e.currentTarget.src = fallbackUrl;
                          }}
                        />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{cert.title}</h3>
                        <p className="text-gray-600 dark:text-gray-300">{cert.organization}</p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      <p>{t('certifications.manager.issued') || '颁发日期'}: {cert.date}</p>
                      {cert.credentialId && (
                        <p className="mt-1">{t('certifications.manager.credential_id') || '证书编号'}: {cert.credentialId}</p>
                      )}
                      {cert.link && (
                        <a href={cert.link} target="_blank" rel="noopener noreferrer" className="mt-1 text-blue-500 hover:underline">
                          {t('certifications.manager.link') || '查看链接'}
                        </a>
                      )}
                      
                      {/* 显示文档下载链接 */}
                      {cert.document && cert.document.dataUrl && (
                        <div className="mt-2">
                          <button 
                            onClick={(e) => handleDocumentClick(cert.document!, e)}
                            className="inline-flex items-center text-blue-500 hover:underline bg-transparent border-0 p-0 cursor-pointer"
                          >
                            <i className={`${getFileIcon(cert.document.fileType)} mr-2`}></i>
                            {t('certifications.view_document') || '查看文档'} {cert.document.fileName}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
                <p className="text-gray-600 dark:text-gray-300">{t('certifications.no_certifications') || '暂无证书数据'}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* 图片查看器 */}
      {viewingImage && (
        <ImageViewer 
          imageUrl={viewingImage} 
          altText={viewingImageTitle} 
          onClose={handleCloseImageViewer}
        />
      )}
      
      {/* 文档查看器 */}
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