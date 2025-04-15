/**
 * 文件处理工具函数
 * 用于处理不同类型的文件上传，包括图片、文档等
 */

/**
 * 检查文件类型
 * @param file 要检查的文件
 * @returns 文件类型分类
 */
export const getFileType = (file: File): 'image' | 'document' | 'unknown' => {
  const fileType = file.type.toLowerCase();
  
  // 图片类型
  if (fileType.includes('image/')) {
    return 'image';
  }
  
  // 文档类型 (PDF, Word, Excel等)
  if (
    fileType.includes('application/pdf') ||
    fileType.includes('application/msword') ||
    fileType.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document') ||
    fileType.includes('application/vnd.ms-excel') ||
    fileType.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') ||
    fileType.includes('text/plain')
  ) {
    return 'document';
  }
  
  return 'unknown';
};

/**
 * 获取文件类型图标
 * @param fileType 文件MIME类型
 * @returns 表示文件类型的图标或emoji
 */
export function getFileIcon(fileType: string): string {
  if (!fileType) return '📄';
  
  const type = fileType.toLowerCase();
  if (type.includes('pdf')) return '📕';
  if (type.includes('doc')) return '📘';
  if (type.includes('xls')) return '📗';
  if (type.includes('ppt')) return '📙';
  if (type.includes('zip') || type.includes('rar')) return '🗄️';
  if (type.includes('image') || type.includes('png') || type.includes('jpg') || type.includes('jpeg')) return '🖼️';
  return '📄';
}

/**
 * 压缩图片
 * @param file 要压缩的图片文件
 * @param callback 回调函数，返回压缩后的DataURL
 * @param maxWidth 最大宽度
 * @param maxHeight 最大高度
 * @param quality 压缩质量
 */
export const compressImage = (
  file: File, 
  callback: (dataUrl: string) => void, 
  maxWidth = 800, 
  maxHeight = 800, 
  quality = 0.7
) => {
  console.log('开始处理图片:', file.name, '类型:', file.type);
  
  // 检查文件类型是否为图片
  if (!file.type.toLowerCase().startsWith('image/')) {
    console.error('文件不是图片类型:', file.type);
    callback('');
    return;
  }
  
  // 对于大图片，增加超时保护
  const timeoutId = setTimeout(() => {
    console.warn('图片处理超时，可能是图片过大，尝试降低质量');
    // 如果处理超时，尝试直接读取为DataURL并降低质量
    const simpleReader = new FileReader();
    simpleReader.onload = (e) => {
      const rawDataUrl = e.target?.result as string;
      callback(rawDataUrl); // 直接返回原始DataURL
    };
    simpleReader.onerror = () => {
      console.error('备用读取方法也失败');
      callback('');
    };
    simpleReader.readAsDataURL(file);
  }, 5000); // 5秒超时
  
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      // 清除超时保护
      clearTimeout(timeoutId);
      
      console.log('图片加载成功，原始尺寸:', img.width, 'x', img.height);
      // 创建canvas用于压缩
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      
      // 计算缩放比例
      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }
      
      console.log('调整后尺寸:', width, 'x', height);
      
      // 设置canvas尺寸并绘制图像
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // 设置图像平滑处理
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // 绘制图像
        ctx.drawImage(img, 0, 0, width, height);
        
        // 根据文件类型选择合适的格式
        const fileType = file.type.toLowerCase();
        let mimeType = 'image/jpeg';
        
        // 支持各种图片格式，保留原始格式以支持透明度和特殊效果
        if (fileType.includes('png')) {
          mimeType = 'image/png';
          console.log('使用PNG格式处理图片');
        } else if (fileType.includes('webp')) {
          mimeType = 'image/webp';
          console.log('使用WebP格式处理图片');
        } else if (fileType.includes('gif')) {
          mimeType = 'image/png'; // GIF转为PNG以保留透明度
          console.log('GIF图片转换为PNG格式');
        } else if (fileType.includes('svg')) {
          mimeType = 'image/png'; // SVG转为PNG
          console.log('SVG图片转换为PNG格式');
        } else if (fileType.includes('bmp')) {
          mimeType = 'image/jpeg'; // BMP转为JPEG
          console.log('BMP图片转换为JPEG格式');
        } else if (fileType.includes('tiff') || fileType.includes('tif')) {
          mimeType = 'image/jpeg'; // TIFF转为JPEG
          console.log('TIFF图片转换为JPEG格式');
        } else {
          console.log('使用JPEG格式处理图片');
        }
        
        // 转换为压缩后的DataURL
        try {
          const dataUrl = canvas.toDataURL(mimeType, quality);
          console.log('图片压缩完成，大小约:', Math.round(dataUrl.length / 1024), 'KB');
          
          // 确保dataUrl有效
          if (dataUrl && dataUrl.startsWith('data:')) {
            // 验证dataURL是否包含有效数据
            if (dataUrl.length > 100) { // 简单检查dataURL长度是否合理
              callback(dataUrl);
            } else {
              console.error('生成的dataUrl太短，可能无效');
              // 尝试使用原始数据
              callback(e.target?.result as string);
            }
          } else {
            console.error('生成的dataUrl无效，尝试使用备用格式');
            // 尝试使用备用格式
            const backupDataUrl = canvas.toDataURL('image/jpeg', quality);
            if (backupDataUrl && backupDataUrl.startsWith('data:')) {
              console.log('使用备用JPEG格式成功');
              callback(backupDataUrl);
            } else {
              console.error('备用格式也失败，使用原始数据');
              callback(e.target?.result as string);
            }
          }
        } catch (error) {
          console.error('转换图片格式时出错:', error);
          // 尝试使用JPEG格式作为备用
          try {
            const jpegDataUrl = canvas.toDataURL('image/jpeg', quality);
            console.log('使用备用JPEG格式成功');
            callback(jpegDataUrl);
          } catch (backupError) {
            console.error('备用格式也失败，使用原始数据');
            callback(e.target?.result as string);
          }
        }
      } else {
        console.error('无法获取canvas上下文，使用原始数据');
        callback(e.target?.result as string);
      }
    };
    img.onerror = (error) => {
      // 清除超时保护
      clearTimeout(timeoutId);
      
      console.error('图片加载失败:', error);
      // 图片加载失败时，尝试直接使用原始数据
      callback(e.target?.result as string);
    };
    img.src = e.target?.result as string;
  };
  reader.onerror = (error) => {
    // 清除超时保护
    clearTimeout(timeoutId);
    
    console.error('文件读取失败:', error);
    callback('');
  };
  reader.readAsDataURL(file);
};

/**
 * 处理文档文件
 * 将文档文件转换为DataURL以便存储或下载
 * @param file 要处理的文档文件
 * @param callback 回调函数，返回文件的DataURL
 */
export const processDocumentFile = (file: File, callback: (dataUrl: string, fileName: string, fileType: string) => void) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    if (e.target?.result) {
      const dataUrl = e.target.result as string;
      console.log('文档处理完成，文件名:', file.name, '，大小约:', Math.round(dataUrl.length / 1024), 'KB');
      
      // 检查文件类型并进行特定处理
      const fileType = file.type.toLowerCase();
      if (fileType.includes('application/pdf')) {
        console.log('PDF文件已处理');
      } else if (fileType.includes('application/msword') || 
                fileType.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
        console.log('Word文档已处理');
      }
      
      callback(dataUrl, file.name, file.type);
    } else {
      console.error('文档处理失败');
      callback('', file.name, file.type);
    }
  };
  reader.onerror = () => {
    console.error('文件读取失败');
    callback('', file.name, file.type);
  };
  reader.readAsDataURL(file);
};

/**
 * 通用文件处理函数
 * 根据文件类型选择合适的处理方法
 * @param file 要处理的文件
 * @param imageCallback 图片处理回调
 * @param documentCallback 文档处理回调
 */
export const processFile = (
  file: File,
  imageCallback: (dataUrl: string) => void,
  documentCallback: (dataUrl: string, fileName: string, fileType: string) => void
) => {
  const fileType = getFileType(file);
  
  if (fileType === 'image') {
    compressImage(file, imageCallback);
  } else if (fileType === 'document') {
    processDocumentFile(file, documentCallback);
  } else {
    console.error('不支持的文件类型:', file.type);
  }
};

/**
 * 简化版处理文件函数（适用于演示页面）
 * 直接返回处理后的数据URL，无需回调函数
 * @param file 要处理的文件
 * @returns Promise，解析为数据URL
 */
export const processFileSingle = async (file: File): Promise<string> => {
  const fileType = getFileType(file);
  
  return new Promise((resolve) => {
    if (fileType === 'image') {
      // 处理图片
      compressImage(file, (dataUrl) => {
        resolve(dataUrl);
      });
    } else {
      // 处理文档或其他文件
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          resolve(e.target.result as string);
        } else {
          resolve('');
        }
      };
      reader.onerror = () => {
        console.error('文件读取失败');
        resolve('');
      };
      reader.readAsDataURL(file);
    }
  });
};