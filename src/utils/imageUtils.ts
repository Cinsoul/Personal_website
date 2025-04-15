/**
 * 图片工具函数
 */

/**
 * 检查图片是否可访问
 * @param url 图片URL
 * @returns Promise<boolean> 图片是否可访问
 */
export const isImageAccessible = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error('检查图片可访问性出错:', error);
    return false;
  }
};

/**
 * 获取一个随机色彩的头像数据URL（作为备用）
 * @param text 文本（通常是用户名首字母）
 * @param size 头像大小
 * @returns 生成的头像数据URL
 */
export const generateAvatarPlaceholder = (text: string = 'A', size: number = 200): string => {
  // 创建canvas元素
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    return '';
  }
  
  // 随机背景色
  const hue = Math.floor(Math.random() * 360);
  ctx.fillStyle = `hsl(${hue}, 70%, 80%)`;
  ctx.fillRect(0, 0, size, size);
  
  // 绘制文本
  ctx.fillStyle = `hsl(${hue}, 70%, 30%)`;
  ctx.font = `${Math.floor(size/2)}px Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text.charAt(0).toUpperCase(), size/2, size/2);
  
  // 返回数据URL
  return canvas.toDataURL('image/png');
};

/**
 * 获取备用头像URL
 * @returns 备用头像URL
 */
export const getFallbackAvatarUrl = (): string => {
  return '/vite.svg';
};

/**
 * 获取备用个人照片URL
 * @returns 备用个人照片URL
 */
export const getFallbackPersonalPhotoUrl = (): string => {
  return '/vite.svg';
}; 