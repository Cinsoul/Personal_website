# 翻转头像功能使用指南

## 功能介绍

这个功能允许您在个人网站主页上展示一个可翻转的头像。当访问者将鼠标悬停在头像上时，头像会翻转，显示另一张图片。

## 使用步骤

1. 准备两张图片：
   - 抽象风格头像（作为正面显示）
   - 个人照片（作为背面显示，鼠标悬停时显示）

2. 处理图片（有两种方法）：

   **方法一：使用在线工具**
   - 访问 `/process-avatar.html`（例如：`http://localhost:3000/process-avatar.html`）
   - 按照页面提示上传并处理图片
   - 下载处理后的两张图片

   **方法二：手动处理**
   - 确保两张图片尺寸相同，最好为正方形（推荐 512x512 像素）
   - 命名为 `abstract-avatar.png` 和 `personal-photo.png`

3. 保存图片：
   - 将处理好的图片保存到 `/public/images/` 目录
   - 确保文件名分别为 `abstract-avatar.png` 和 `personal-photo.png`

4. 刷新网站，查看效果：
   - 访问网站首页，将鼠标悬停在头像上，查看翻转效果

## 自定义设置

如果需要修改默认设置，可以编辑以下文件：

- **图片路径**：在 `src/components/Home.tsx` 文件中修改图片路径
  ```typescript
  const abstractAvatarPath = '/images/abstract-avatar.png'; 
  const personalPhotoPath = '/images/personal-photo.png';
  ```

- **翻转动画**：在 `src/styles/flippable-avatar.css` 文件中修改动画参数
  ```css
  .flipper {
    transition: transform 0.8s; /* 修改动画持续时间 */
  }
  ```

## 故障排除

如果头像不显示或翻转效果有问题：

1. 检查图片是否存在于正确的路径
2. 确保图片格式正确（PNG, JPEG等）
3. 查看浏览器控制台是否有错误信息
4. 尝试清除浏览器缓存并刷新页面 