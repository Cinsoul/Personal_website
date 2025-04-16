# 网站数据目录

此目录存储个人网站的数据文件，包括项目、奖项等信息。这些文件是网站内容的持久化存储，确保您的数据不仅存在于浏览器的localStorage中，而且作为实体文件存在于仓库中。

## 文件说明

- `portfolio-data.json`: 主要数据文件，包含所有项目和奖项信息
- 其他JSON文件: 可能包含按日期命名的数据备份

## 数据同步

您可以通过以下两种方式管理这些数据：

1. **通过网站管理界面**：
   - 登录管理员账户
   - 访问"项目与奖项管理"页面
   - 使用"导出数据"功能，选择"同步到GitHub仓库"选项

2. **手动编辑**：
   - 直接编辑`portfolio-data.json`文件
   - 保持正确的JSON格式
   - 提交更改到GitHub仓库

## 数据格式

数据文件使用以下格式：

```json
{
  "projects": [
    {
      "id": "唯一ID",
      "title": "项目标题",
      "description": "项目描述",
      "technologies": ["技术1", "技术2"],
      "link": "项目链接URL",
      "image": "图片URL或Base64数据"
    }
  ],
  "awards": [
    {
      "id": "唯一ID",
      "title": "奖项标题",
      "organization": "颁发机构",
      "date": "获奖日期",
      "description": "奖项描述",
      "image": "图片URL或Base64数据",
      "document": {
        "dataUrl": "文档数据URL",
        "fileName": "文件名",
        "fileType": "文件类型"
      }
    }
  ],
  "exportDate": "导出日期ISO字符串",
  "version": "数据版本"
}
```

## 注意事项

- 保持数据文件的正确格式，避免手动编辑导致JSON格式错误
- 图片和文档通常以Base64格式存储，文件可能较大
- 如果您使用管理界面的同步功能，系统会自动处理格式问题 