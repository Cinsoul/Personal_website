import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { processFile, getFileIcon } from '../utils/fileUtils';

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

export default function CertificationsManager() {
  // 获取语言上下文
  const { t } = useLanguage();
  
  // 状态管理
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCertification, setCurrentCertification] = useState<Certification>({
    title: '',
    organization: '',
    date: '',
    credentialId: '',
    logo: '',
    link: ''
  });
  // Removed unused state variable logoFile
  const [logoPreview, setLogoPreview] = useState<string>('');

  // 从本地存储加载数据
  useEffect(() => {
    const savedCertifications = localStorage.getItem('certifications');
    
    if (savedCertifications) {
      setCertifications(JSON.parse(savedCertifications));
    } else {
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
    }
  }, []);

  // 保存数据到本地存储
  useEffect(() => {
    if (certifications.length > 0) {
      localStorage.setItem('certifications', JSON.stringify(certifications));
    }
  }, [certifications]);

  // 处理表单输入变化
  const handleCertificationChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCurrentCertification({
      ...currentCertification,
      [name]: value
    });
  };

  // 图片压缩函数已移除，使用utils/fileUtils.ts中的processFile函数代替

  // 处理Logo上传
  const handleLogoChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // 使用通用文件处理函数处理不同类型的文件
      processFile(
        file,
        // 图片处理回调
        (compressedDataUrl) => {
          if (compressedDataUrl && compressedDataUrl.startsWith('data:')) {
            setLogoPreview(compressedDataUrl);
            // 清除之前可能存在的文档数据
            setCurrentCertification(prev => ({
              ...prev,
              document: undefined
            }));
            console.log('证书Logo预览已设置，数据长度:', compressedDataUrl.length);
          } else {
            console.error('证书Logo压缩后数据无效');
            setLogoPreview('');
          }
        },
        // 文档处理回调
        (dataUrl, fileName, fileType) => {
          // 清除图片预览
          setLogoPreview('');
          // 保存文档信息到当前证书
          setCurrentCertification(prev => ({
            ...prev,
            document: {
              dataUrl,
              fileName,
              fileType
            }
          }));
          console.log('证书文档已处理:', fileName, '类型:', fileType);
        }
      );
    }
  };

  // 保存证书
  const saveCertification = (e: FormEvent) => {
    e.preventDefault();
    
    // 准备要保存的证书数据
    let certificationToSave = { ...currentCertification };
    
    // 如果有上传新的Logo，使用预览图片的数据URL
    if (logoPreview) {
      certificationToSave.logo = logoPreview;
    }
    
    if (isEditing && currentCertification.id) {
      // 更新现有证书
      const updatedCertifications = certifications.map(cert => 
        cert.id === currentCertification.id ? certificationToSave : cert
      );
      setCertifications(updatedCertifications);
    } else {
      // 添加新证书
      const newCertification = {
        ...certificationToSave,
        id: Date.now().toString()
      };
      setCertifications([...certifications, newCertification]);
    }
    
    resetCertificationForm();
  };

  // 编辑证书
  const editCertification = (certification: Certification) => {
    setCurrentCertification(certification);
    setLogoPreview(certification.logo);
    setIsEditing(true);
  };

  // 删除证书
  const deleteCertification = (id: string) => {
    if (window.confirm(t('manager.delete.confirm'))) {
      setCertifications(certifications.filter(cert => cert.id !== id));
    }
  };

  // 重置表单
  const resetCertificationForm = () => {
    setCurrentCertification({
      title: '',
      organization: '',
      date: '',
      credentialId: '',
      logo: '',
      link: ''
    });
    // 重置预览图片
    setLogoPreview('');
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('manager.certifications.title')}</h1>
          <Link to="/" className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
            {t('manager.back')}
          </Link>
        </div>
        
        {/* 证书管理部分 */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('certifications.manager.add_edit')}</h2>
          
          {/* 证书表单 */}
          <form onSubmit={saveCertification} className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="title">
                  {t('certifications.manager.title')}
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={currentCertification.title}
                  onChange={handleCertificationChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="organization">
                  {t('certifications.manager.organization')}
                </label>
                <input
                  type="text"
                  id="organization"
                  name="organization"
                  value={currentCertification.organization}
                  onChange={handleCertificationChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="date">
                  {t('certifications.manager.date')}
                </label>
                <input
                  type="text"
                  id="date"
                  name="date"
                  value={currentCertification.date}
                  onChange={handleCertificationChange}
                  placeholder={t('certifications.manager.date_placeholder')}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="credentialId">
                  {t('certifications.manager.credential_id')}
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">({t('optional')})</span>
                </label>
                <input
                  type="text"
                  id="credentialId"
                  name="credentialId"
                  value={currentCertification.credentialId}
                  onChange={handleCertificationChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="link">
                  {t('certifications.manager.link')}
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">({t('optional')})</span>
                </label>
                <input
                  type="url"
                  id="link"
                  name="link"
                  value={currentCertification.link || ''}
                  onChange={handleCertificationChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2" htmlFor="logo">
                  {t('certifications.manager.logo')}
                </label>
                <input
                  type="file"
                  id="logo"
                  name="logo"
                  onChange={handleLogoChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                />
                {(logoPreview || currentCertification.logo) && (
                  <div className="mt-2 w-24 h-24 border rounded-lg overflow-hidden">
                    <img 
                      src={logoPreview || currentCertification.logo} 
                      alt="Logo Preview" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
                {currentCertification.document && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                      <i className={`${getFileIcon(currentCertification.document.fileType)} mr-2`}></i>
                      {currentCertification.document.fileName}
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-end mt-6 space-x-4">
              <button
                type="button"
                onClick={resetCertificationForm}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                {t('certifications.manager.cancel')}
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 rounded-lg text-white hover:bg-blue-600 transition-colors"
              >
                {isEditing ? t('certifications.manager.update') : t('certifications.manager.add')}
              </button>
            </div>
          </form>
          
          {/* 现有证书列表 */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t('certifications.manager.existing')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certifications.map((cert) => (
                <div key={cert.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 shadow">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 mr-4 flex-shrink-0">
                      <img src={cert.logo} alt={cert.organization} className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{cert.title}</h4>
                      <p className="text-gray-600 dark:text-gray-300">{cert.organization}</p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    <p>{t('certifications.manager.issued')} {cert.date}</p>
                    {cert.credentialId && (
                      <p className="mt-1">{t('certifications.manager.credential_id')}: {cert.credentialId}</p>
                    )}
                    {cert.link && (
                      <p className="mt-1">
                        <a href={cert.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                          {t('certifications.manager.link')}                        
                        </a>
                      </p>
                    )}
                    {cert.document && cert.document.dataUrl && (
                      <p className="mt-1">
                        <a 
                          href={cert.document.dataUrl} 
                          download={cert.document.fileName}
                          className="text-blue-500 hover:underline flex items-center"
                        >
                          <i className={`${getFileIcon(cert.document.fileType)} mr-2`}></i>
                          {cert.document.fileName}
                        </a>
                      </p>
                    )}
                  </div>
                  <div className="flex justify-end mt-4 space-x-2">
                    <button
                      onClick={() => editCertification(cert)}
                      className="px-3 py-1 bg-blue-500 rounded text-white hover:bg-blue-600 transition-colors text-sm"
                    >
                      {t('certifications.manager.edit')}
                    </button>
                    <button
                      onClick={() => deleteCertification(cert.id!)}
                      className="px-3 py-1 bg-red-500 rounded text-white hover:bg-red-600 transition-colors text-sm"
                    >
                      {t('certifications.manager.delete')}
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