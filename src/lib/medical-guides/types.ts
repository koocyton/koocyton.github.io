export interface TaxonomyNode {
  id: string;
  label: string;
  children?: TaxonomyNode[];
}

export interface Guideline {
  id: string;
  title: string;
  org: string;
  year: number;
  /** 关联左侧树节点 id（含祖先可匹配） */
  nodeIds: string[];
  disease: string;
  codes?: string[];
  summary: string;
  tags: string[];
  sourceUrl?: string;
  /** public 下相对路径，供 iframe 加载 */
  contentPath: string;
}
