/**
 * 图片工具函数
 */

/**
 * 获取基础路径
 * 在GitHub Pages环境会返回项目路径，其他环境返回空字符串
 * @returns 基础路径字符串
 */
export const getBasePath = (): string => {
  if (typeof window === 'undefined') return '';
  
  // 检查是否在GitHub Pages环境
  const isGitHubPages = window.location.hostname.includes('github.io');
  // 从URL路径中提取项目名称
  let projectPath = '';
  
  if (isGitHubPages) {
    const pathSegments = window.location.pathname.split('/');
    if (pathSegments.length > 1) {
      projectPath = `/${pathSegments[1]}`;
    }
  }
  
  return isGitHubPages ? projectPath : '';
};

/**
 * 检查图片是否可访问
 * @param url 图片URL
 * @returns 布尔值 Promise，表示图片是否可访问
 */
export const isImageAccessible = async (url: string): Promise<boolean> => {
  if (typeof window === 'undefined') return false;
  
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error('检查图片可访问性失败:', error);
    return false;
  }
};

/**
 * 生成头像占位符
 * @param text 显示在占位符上的文本（通常用首字母）
 * @param width 占位符宽度
 * @param height 占位符高度
 * @returns 数据 URL
 */
export const generateAvatarPlaceholder = (text: string, width = 200, height = 200): string => {
  // 检查是否在服务器端环境
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    // 返回一个SVG数据URL (可在服务端生成)
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}' viewBox='0 0 ${width} ${height}'%3E%3Crect width='${width}' height='${height}' fill='%23cccccc'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='${Math.floor(width / 3)}px' fill='%23666666'%3E${text.charAt(0).toUpperCase()}%3C/text%3E%3C/svg%3E`;
  }
  
  try {
    // 创建一个画布元素
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('无法获取canvas上下文');
    }
    
    // 设置随机背景色
    const hue = Math.floor(Math.random() * 360);
    ctx.fillStyle = `hsl(${hue}, 70%, 80%)`;
    ctx.fillRect(0, 0, width, height);
    
    // 添加文本（取首字母或前两个字符）
    const displayText = text.length > 0 ? text.charAt(0).toUpperCase() : '?';
    
    ctx.fillStyle = `hsl(${hue}, 90%, 30%)`;
    ctx.font = `bold ${Math.floor(width / 2)}px Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(displayText, width / 2, height / 2);
    
    // 转换为数据URL
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('生成头像占位符失败:', error);
    // 失败时返回一个简单的颜色数据URL
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}' viewBox='0 0 ${width} ${height}'%3E%3Crect width='${width}' height='${height}' fill='%23cccccc'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial' font-size='${Math.floor(width / 3)}px' fill='%23666666'%3E${text.charAt(0).toUpperCase()}%3C/text%3E%3C/svg%3E`;
  }
};

/**
 * 获取备用头像URL
 * @returns 备用头像URL
 */
export const getFallbackAvatarUrl = (): string => {
  // 返回默认头像URL
  const basePath = getBasePath();
  return `${basePath}/vite.svg`;
};

/**
 * 获取备用个人照片URL
 * @returns 备用个人照片URL
 */
export const getFallbackPersonalPhotoUrl = (): string => {
  // 返回默认照片URL
  const basePath = getBasePath();
  return `${basePath}/vite.svg`;
}; 