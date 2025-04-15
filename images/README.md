# 头像图片说明

为了让翻转头像功能正常工作，请将以下两张图片添加到此目录：

1. `abstract-avatar.png` - 抽象风格头像图片（主要显示的第一张图）
2. `personal-photo.png` - 个人照片（鼠标悬停时显示的第二张图）

请确保图片尺寸相同，建议使用正方形图片，最佳尺寸为 512x512 像素或更大。

## 替代方案

如果您无法直接添加图片到此目录，您也可以修改 `src/components/Home.tsx` 文件中的以下两行，指向您的图片路径：

```typescript
const abstractAvatarPath = '/images/abstract-avatar.png'; 
const personalPhotoPath = '/images/personal-photo.png';
```

请将路径更改为您的实际图片路径。 