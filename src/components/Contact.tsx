import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { FaLinkedin, FaPhone, FaEnvelope, FaExternalLinkAlt, FaCopy } from 'react-icons/fa';

export default function Contact() {
  const [isLoaded, setIsLoaded] = useState(false);
  const { t } = useLanguage();
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    // 模拟加载
    setTimeout(() => {
      setIsLoaded(true);
    }, 300);
  }, []);

  // 复制文本到剪贴板
  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(type);
      setTimeout(() => {
        setCopied(null);
      }, 2000);
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className={`transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{t('nav.contact')}</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {t('contact.description') || '随时通过以下方式与我联系'}
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 border-b border-gray-200 dark:border-gray-700 pb-2">
                {t('contact.info') || '联系信息'}
              </h3>
              
              <div className="space-y-6">
                {/* LinkedIn */}
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <FaLinkedin className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                  </div>
                  <div className="ml-4 flex-1">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                      {t('contact.your_profile') || '您的个人资料'}
                    </h4>
                    <div className="mt-1 flex items-center">
                      <a 
                        href="https://linkedin.com/in/xindi-wang19990526" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline flex items-center"
                      >
                        linkedin.com/in/xindi-wang19990526
                        <FaExternalLinkAlt className="ml-2 h-3 w-3" />
                      </a>
                      <button 
                        onClick={() => copyToClipboard('linkedin.com/in/xindi-wang19990526', 'linkedin')}
                        className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        title={t('contact.copy') || '复制'}
                      >
                        <FaCopy className="h-4 w-4" />
                      </button>
                      {copied === 'linkedin' && (
                        <span className="ml-2 text-green-500 text-sm">{t('contact.copied') || '已复制'}</span>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Phone */}
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-green-100 dark:bg-green-900 rounded-lg">
                    <FaPhone className="h-5 w-5 text-green-600 dark:text-green-300" />
                  </div>
                  <div className="ml-4 flex-1">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                      {t('contact.phone') || '电话'}
                    </h4>
                    <div className="mt-1 flex items-center">
                      <a 
                        href="tel:+447733765734" 
                        className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        +44 7733765734
                      </a>
                      <span className="ml-2 text-gray-500 dark:text-gray-400">(Mobile)</span>
                      <button 
                        onClick={() => copyToClipboard('+44 7733765734', 'phone')}
                        className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        title={t('contact.copy') || '复制'}
                      >
                        <FaCopy className="h-4 w-4" />
                      </button>
                      {copied === 'phone' && (
                        <span className="ml-2 text-green-500 text-sm">{t('contact.copied') || '已复制'}</span>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Email */}
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-red-100 dark:bg-red-900 rounded-lg">
                    <FaEnvelope className="h-5 w-5 text-red-600 dark:text-red-300" />
                  </div>
                  <div className="ml-4 flex-1">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                      {t('contact.email') || '电子邮件'}
                    </h4>
                    <div className="mt-1 flex items-center">
                      <a 
                        href="mailto:cinsoul9@gmail.com" 
                        className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        cinsoul9@gmail.com
                      </a>
                      <button 
                        onClick={() => copyToClipboard('cinsoul9@gmail.com', 'email')}
                        className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        title={t('contact.copy') || '复制'}
                      >
                        <FaCopy className="h-4 w-4" />
                      </button>
                      {copied === 'email' && (
                        <span className="ml-2 text-green-500 text-sm">{t('contact.copied') || '已复制'}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {t('contact.response_time') || '我通常会在48小时内回复邮件和消息。如有紧急事项，请直接拨打电话联系。'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 