# Clinical Guideline Navigator

临床指南导航系统 — 静态目录与官方链接导航（不镜像指南正文）。

## 数据

| 文件 | 说明 |
|------|------|
| [`data/guidelines.json`](./data/guidelines.json) | 指南目录元数据 |
| [`data/organizations.json`](./data/organizations.json) | 内置机构列表 |

字段：`id` `title` `organization` `country` `disease` `category` `year` `url` `type` `language` `tags` `summary`

## 使用

站点内路径：`/medical-guides/`

## 扩展预留

- AI 摘要模块
- 指南版本比较
- 推荐意见结构化数据库

## 免责

本工具仅提供导航索引，不构成医疗建议。请以官方原文为准。
