/**
 * 简单图片处理工具
 * 提供基础的图片压缩和处理功能的Promise版本
 */

/**
 * 图片压缩和处理工具函数
 */

/**
 * 压缩图片 (Promise版本)
 * 与fileUtils.ts中的回调版本不同，这个函数返回Promise
 * 被SimpleImageUploader和ImageUploader组件使用
 * 
 * @param file 图片文件
 * @param maxDimension 最大尺寸（宽或高）
 * @param quality 压缩质量 (0-1)
 * @returns Promise<string> 返回压缩后的图片数据 URL
 */
export const compressImage = (
  file: File,
  maxDimension: number = 1024,
  quality: number = 0.8
): Promise<string> => {
  return new Promise((resolve, reject) => {
    // 检查是否是 SVG 文件
    if (file.type === 'image/svg+xml') {
      // SVG 文件直接读取，不需要压缩
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (reader.result) {
          resolve(reader.result as string);
        } else {
          reject(new Error('读取 SVG 文件失败'));
        }
      };
      reader.onerror = () => {
        reject(new Error('读取 SVG 文件失败'));
      };
      return;
    }

    // 为其他图片类型创建图片对象
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      if (!e.target?.result) {
        reject(new Error('读取文件失败'));
        return;
      }

      img.src = e.target.result as string;
      img.onload = () => {
        // 计算调整后的尺寸
        let width = img.width;
        let height = img.height;
        
        if (width > height && width > maxDimension) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else if (height > maxDimension) {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }

        // 创建 canvas 并绘制压缩后的图片
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('无法创建 canvas 上下文'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // 转换为 DataURL
        const dataUrl = canvas.toDataURL(
          file.type || 'image/jpeg',
          quality
        );
        
        resolve(dataUrl);
      };
      
      img.onerror = () => {
        reject(new Error('加载图片失败'));
      };
    };
    
    reader.onerror = () => {
      reject(new Error('读取文件失败'));
    };
    
    reader.readAsDataURL(file);
  });
};

/**
 * 获取图片文件的类型
 * @param file 图片文件
 * @returns 图片类型，如 'image/jpeg', 'image/png'
 */
export const getImageType = (file: File): string => {
  return file.type;
};

/**
 * 验证文件是否为图片
 * @param file 要验证的文件
 * @returns boolean 是否为图片文件
 */
export const isImageFile = (file: File): boolean => {
  const validImageTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml'
  ];
  return validImageTypes.includes(file.type);
};

/**
 * 计算文件大小和单位
 * @param sizeInBytes 字节大小
 * @returns 格式化后的大小和单位
 */
export const formatFileSize = (sizeInBytes: number): string => {
  if (sizeInBytes < 1024) {
    return `${sizeInBytes} B`;
  } else if (sizeInBytes < 1024 * 1024) {
    return `${(sizeInBytes / 1024).toFixed(2)} KB`;
  } else if (sizeInBytes < 1024 * 1024 * 1024) {
    return `${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB`;
  } else {
    return `${(sizeInBytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  }
};

/**
 * 将base64数据URL转换为Blob对象
 * @param dataUrl 图片的base64 dataURL
 * @returns Blob对象
 */
export const dataURLtoBlob = (dataUrl: string): Blob => {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new Blob([u8arr], { type: mime });
};

/**
 * 从图片DataURL中获取文件类型
 * @param dataUrl 图片的base64 dataURL
 * @returns 图片的MIME类型
 */
export const getMimeTypeFromDataURL = (dataUrl: string): string => {
  return dataUrl.split(',')[0].split(':')[1].split(';')[0];
}; 