import React, { createContext, useState, useContext, ReactNode } from 'react';

// 定义支持的语言类型
export type Language = 'zh' | 'en';

// 定义翻译内容的接口
export interface Translations {
  [key: string]: {
    zh: string;
    en: string;
  };
}

// 定义语言上下文的接口
interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

// 创建语言上下文
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// 所有文本的翻译
export const translations: Translations = {
  // 导航菜单
  'nav.home': {
    zh: '首页',
    en: 'Home',
  },
  'nav.education': {
    zh: '教育经历',
    en: 'Education',
  },
  'nav.work': {
    zh: '工作经历',
    en: 'Work Experience',
  },
  'nav.school': {
    zh: '校园经历',
    en: 'School Experience',
  },
  'nav.certifications': {
    zh: '证书',
    en: 'Certifications',
  },
  'nav.contact': {
    zh: '联系方式',
    en: 'Contact',
  },
  'nav.projects': {
    zh: '项目与奖项',
    en: 'Projects & Awards',
  },
  
  // 首页
  'home.title': {
    zh: '王心迪 (Arthur)',
    en: 'Xindi (Arthur) Wang',
  },
  'home.student': {
    zh: '商业与金融学士学生',
    en: 'BSc Business with Finance Student',
  },
  'home.tel': {
    zh: '电话: +33 744839586',
    en: 'Tel: +33 744839586',
  },
  'home.email': {
    zh: '邮箱:',
    en: 'Email:',
  },
  'home.linkedin': {
    zh: '领英:',
    en: 'LinkedIn:',
  },
  
  // 教育经历
  'education.title': {
    zh: '教育经历',
    en: 'Education',
  },
  'education.exchange': {
    zh: '交换项目, 全球工商管理学士',
    en: 'Exchange Program, Global BBA',
  },
  'education.bsc': {
    zh: '商业与金融学士',
    en: 'BSc Business with Finance',
  },
  'education.gpa': {
    zh: 'GPA: 3.3/4',
    en: 'GPA: 3.3/4',
  },
  'education.core': {
    zh: '核心课程:',
    en: 'Core Courses:',
  },
  'education.essec.courses': {
    zh: '奢侈品牌管理, 金融1, 初级法语, 在中国做生意, 欧洲经济学',
    en: 'Luxury Brand Management, Finance 1, Beginner French, Doing Business in China, European Economics',
  },
  'education.bayes.courses': {
    zh: '市场营销, 管理学, 批判性分析, 运营与供应链管理, 经济学, 财务与管理会计, 金融市场, 商业法',
    en: 'Marketing, Management, Critical Analysis, Operation & Supply Chain Management, Economics, Financial & Management Accounting, Financial Market, Business Law',
  },
  
  // 工作经历
  'work.title': {
    zh: '工作经历',
    en: 'Work Experience',
  },
  'work.edit': {
    zh: '编辑工作经历',
    en: 'Edit Work Experience',
  },
  'work.parttime': {
    zh: '(兼职)',
    en: '(Part-time)',
  },
  
  // 项目与奖项
  'projects.title': {
    zh: '项目与奖项',
    en: 'Projects & Awards',
  },
  'projects.manage': {
    zh: '管理项目与奖项',
    en: 'Manage Projects & Awards',
  },
  'projects.view': {
    zh: '查看项目 →',
    en: 'View Project →',
  },
  'projects.section': {
    zh: '项目',
    en: 'Projects',
  },
  'awards.section': {
    zh: '奖项',
    en: 'Awards',
  },
  'awards.download': {
    zh: '下载文档:',
    en: 'Download Document:',
  },
  'awards.download_error': {
    zh: '文档下载失败，文件可能已损坏或不存在',
    en: 'Document download failed, file may be corrupted or missing',
  },
  'certifications.view': {
    zh: '查看证书 →',
    en: 'View Certificate →',
  },
  'certifications.download': {
    zh: '下载证书:',
    en: 'Download Certificate:',
  },
  
  // 管理页面
  'manager.back': {
    zh: '返回首页',
    en: 'Back to Home',
  },
  'manager.work.title': {
    zh: '工作经历管理',
    en: 'Work Experience Management',
  },
  'manager.projects.title': {
    zh: '项目与奖项管理',
    en: 'Projects & Awards Management',
  },
  'manager.add': {
    zh: '添加/编辑',
    en: 'Add/Edit',
  },
  'manager.delete.confirm': {
    zh: '确定要删除这条记录吗？',
    en: 'Are you sure you want to delete this record?',
  },
  
  // 工作经历管理页面
  'work.manager.add_edit': {
    zh: '添加/编辑工作经历',
    en: 'Add/Edit Work Experience',
  },
  'work.manager.company': {
    zh: '公司名称',
    en: 'Company Name',
  },
  'work.manager.position': {
    zh: '职位',
    en: 'Position',
  },
  'work.manager.location': {
    zh: '地点',
    en: 'Location',
  },
  'work.manager.start_date': {
    zh: '开始日期',
    en: 'Start Date',
  },
  'work.manager.end_date': {
    zh: '结束日期',
    en: 'End Date',
  },
  'work.manager.responsibilities': {
    zh: '工作职责',
    en: 'Responsibilities',
  },
  'work.manager.input_responsibility': {
    zh: '输入工作职责',
    en: 'Enter responsibility',
  },
  'work.manager.add': {
    zh: '添加',
    en: 'Add',
  },
  'work.manager.delete': {
    zh: '删除',
    en: 'Delete',
  },
  'work.manager.cancel': {
    zh: '取消',
    en: 'Cancel',
  },
  'work.manager.update': {
    zh: '更新经历',
    en: 'Update Experience',
  },
  'work.manager.add_experience': {
    zh: '添加经历',
    en: 'Add Experience',
  },
  'work.manager.existing': {
    zh: '现有工作经历',
    en: 'Existing Work Experience',
  },
  'work.manager.edit': {
    zh: '编辑',
    en: 'Edit',
  },
  'work.manager.start_date_placeholder': {
    zh: '例如: Mar 2023',
    en: 'e.g. Mar 2023',
  },
  'work.manager.end_date_placeholder': {
    zh: '例如: Aug 2024 或 Present',
    en: 'e.g. Aug 2024 or Present',
  },
  
  // 项目与奖项管理页面
  'projects.manager.add_edit_project': {
    zh: '添加/编辑项目',
    en: 'Add/Edit Project',
  },
  'projects.manager.add_edit_award': {
    zh: '添加/编辑奖项',
    en: 'Add/Edit Award',
  },
  'projects.manager.title': {
    zh: '标题',
    en: 'Title',
  },
  'projects.manager.link': {
    zh: '链接',
    en: 'Link',
  },
  'projects.manager.description': {
    zh: '描述',
    en: 'Description',
  },
  'projects.manager.technologies': {
    zh: '技术栈',
    en: 'Technologies',
  },
  'projects.manager.input_tech': {
    zh: '输入技术名称',
    en: 'Enter technology name',
  },
  'projects.manager.image': {
    zh: '图片',
    en: 'Image',
  },
  'awards.manager.image': {
    zh: '奖项图片',
    en: 'Award Image',
  },
  'awards.manager.image_or_document': {
    zh: '奖项图片或证书文档',
    en: 'Award Image or Certificate Document',
  },
  'awards.manager.file_help': {
    zh: '支持图片格式(JPG, PNG, SVG)或文档格式(PDF, DOC, DOCX, XLS, XLSX, TXT)',
    en: 'Supports image formats (JPG, PNG, SVG) or document formats (PDF, DOC, DOCX, XLS, XLSX, TXT)',
  },
  'projects.manager.cancel': {
    zh: '取消',
    en: 'Cancel',
  },
  'projects.manager.update_project': {
    zh: '更新项目',
    en: 'Update Project',
  },
  'projects.manager.add_project': {
    zh: '添加项目',
    en: 'Add Project',
  },
  'projects.manager.existing_projects': {
    zh: '现有项目',
    en: 'Existing Projects',
  },
  'projects.manager.organization': {
    zh: '组织/机构',
    en: 'Organization',
  },
  'projects.manager.date': {
    zh: '日期',
    en: 'Date',
  },
  'projects.manager.update_award': {
    zh: '更新奖项',
    en: 'Update Award',
  },
  'projects.manager.add_award': {
    zh: '添加奖项',
    en: 'Add Award',
  },
  'projects.manager.existing_awards': {
    zh: '现有奖项',
    en: 'Existing Awards',
  },
  'projects.manager.date_placeholder': {
    zh: '例如: 2021年4月',
    en: 'Example: Apr 2021',
  },
  'projects.manager.add_tech': {
    zh: '添加技术',
    en: 'Add Technology',
  },
  
  // 语言切换
  'language.switch': {
    zh: 'English',
    en: '中文',
  },
  'optional': {
    zh: '可选',
    en: 'optional',
  },
  
  // 证书管理页面
  'manager.certifications.title': {
    zh: '证书管理',
    en: 'Certifications Management',
  },
  'certifications.manager.add_edit': {
    zh: '添加/编辑证书',
    en: 'Add/Edit Certification',
  },
  'certifications.manager.title': {
    zh: '证书名称',
    en: 'Certification Title',
  },
  'certifications.manager.organization': {
    zh: '颁发机构',
    en: 'Issuing Organization',
  },
  'certifications.manager.date': {
    zh: '颁发日期',
    en: 'Issue Date',
  },
  'certifications.manager.date_placeholder': {
    zh: '例如: 2021年4月',
    en: 'Example: Apr 2021',
  },
  'certifications.manager.credential_id': {
    zh: '证书ID',
    en: 'Credential ID',
  },
  'certifications.manager.link': {
    zh: '证书链接',
    en: 'Certification Link',
  },
  'certifications.manager.logo': {
    zh: '证书Logo',
    en: 'Certification Logo',
  },
  'certifications.manager.cancel': {
    zh: '取消',
    en: 'Cancel',
  },
  'certifications.manager.update': {
    zh: '更新证书',
    en: 'Update Certification',
  },
  'certifications.manager.add': {
    zh: '添加证书',
    en: 'Add Certification',
  },
  'certifications.manager.existing': {
    zh: '现有证书',
    en: 'Existing Certifications',
  },
  'certifications.manager.edit': {
    zh: '编辑',
    en: 'Edit',
  },
  'certifications.manager.delete': {
    zh: '删除',
    en: 'Delete',
  },
  'certifications.manager.issued': {
    zh: '颁发于',
    en: 'Issued',
  },
  
  // 联系页面
  'contact.description': {
    zh: '随时通过以下方式与我联系',
    en: 'Feel free to contact me through any of the following channels',
  },
  'contact.info': {
    zh: '联系信息',
    en: 'Contact Information',
  },
  'contact.your_profile': {
    zh: '您的个人资料',
    en: 'Your Profile',
  },
  'contact.phone': {
    zh: '电话',
    en: 'Phone',
  },
  'contact.email': {
    zh: '电子邮件',
    en: 'Email',
  },
  'contact.copy': {
    zh: '复制',
    en: 'Copy',
  },
  'contact.copied': {
    zh: '已复制',
    en: 'Copied',
  },
  'contact.response_time': {
    zh: '我通常会在48小时内回复邮件和消息。如有紧急事项，请直接拨打电话联系。',
    en: 'I typically respond to emails and messages within 48 hours. For urgent matters, please call directly.',
  },
};

// 语言提供者组件
export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 从本地存储获取语言设置，默认为中文
  const savedLanguage = localStorage.getItem('language') as Language;
  const [language, setLanguage] = useState<Language>(savedLanguage || 'zh');

  // 更新语言并保存到本地存储
  const handleSetLanguage = (newLanguage: Language) => {
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  // 翻译函数
  const t = (key: string): string => {
    if (!translations[key]) {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }
    return translations[key][language];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// 自定义钩子，用于在组件中使用语言上下文
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};