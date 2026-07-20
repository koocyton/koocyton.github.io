export interface TaxonomyNode {
  id: string;
  label: string;
  labelEn?: string;
  children?: TaxonomyNode[];
}

/** 指南目录条目：仅元数据与官方链接，不含指南正文 */
export interface Guideline {
  id: string;
  title: string;
  organization: string;
  country: string;
  disease: string;
  category: string;
  /** 对应左侧树节点 id */
  nodeIds: string[];
  year: number;
  url: string;
  type: string;
  language: string;
  tags: string[];
  /** 条目说明（非指南正文摘录） */
  summary: string;
  /** 是否尝试 iframe 嵌入官方页（多数官网会禁止） */
  embeddable?: boolean;
}

export type SortKey = "year-desc" | "year-asc" | "title";

/** 预留扩展模块标识 */
export type ExtensionModuleId = "ai-summary" | "version-compare" | "structured-recs";
