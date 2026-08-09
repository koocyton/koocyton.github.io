# Clinical Guideline Navigator

临床指南导航系统 — 静态目录与官方链接导航（不镜像指南正文）。

## 数据

| 文件 | 说明 |
|------|------|
| [`data/guidelines.json`](./data/guidelines.json) | 指南目录元数据（约 200 条，持续扩充） |
| [`data/organizations.json`](./data/organizations.json) | 内置机构列表 |

字段：`id` `title` `organization` `country` `disease` `category` `year` `url` `type` `language` `tags` `summary`

优先收录：ESC / AHA·ACC / NICE / WHO / NCCN / ESMO / ASCO / KDIGO / IDSA / USPSTF / ADA / GOLD / GINA / EULAR / ACR / AASLD 及国内学会公开入口。

扩充脚本：`scripts/merge-medical-guides.mjs`

## 使用

站点内路径：`/medical-guides/`

## 扩展预留

- AI 摘要模块
- 指南版本比较
- 推荐意见结构化数据库

## 免责

本工具仅提供导航索引，不构成医疗建议。请以官方原文为准。不可能覆盖全球全部病种与全部版本；以高等级、可公开访问的权威指南为主持续补充。
