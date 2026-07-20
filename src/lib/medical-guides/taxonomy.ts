import type { TaxonomyNode } from "./types";

/** 左侧分类树：疾病编码体系 + 国内/国际指南机构 */
export const taxonomyTree: TaxonomyNode = {
  id: "root",
  label: "疾病与指南",
  children: [
    {
      id: "disease",
      label: "疾病",
      children: [
        {
          id: "icd10",
          label: "ICD-10",
          children: [
            { id: "icd10-i", label: "I 传染病和寄生虫病" },
            { id: "icd10-ii", label: "II 肿瘤" },
            { id: "icd10-iii", label: "III 血液及免疫疾病" },
            { id: "icd10-iv", label: "IV 内分泌、营养和代谢" },
            { id: "icd10-v", label: "V 精神和行为障碍" },
            { id: "icd10-vi", label: "VI 神经系统疾病" },
            { id: "icd10-ix", label: "IX 循环系统疾病" },
            { id: "icd10-x", label: "X 呼吸系统疾病" },
            { id: "icd10-xi", label: "XI 消化系统疾病" },
            { id: "icd10-xiv", label: "XIV 泌尿生殖系统" },
            { id: "icd10-xv", label: "XV 妊娠、分娩和产褥期" },
          ],
        },
        {
          id: "icd11",
          label: "ICD-11",
          children: [
            { id: "icd11-01", label: "01 某些传染病或寄生虫病" },
            { id: "icd11-02", label: "02 肿瘤" },
            { id: "icd11-05", label: "05 内分泌、营养或代谢疾病" },
            { id: "icd11-06", label: "06 精神、行为或神经发育障碍" },
            { id: "icd11-08", label: "08 神经系统疾病" },
            { id: "icd11-11", label: "11 循环系统疾病" },
            { id: "icd11-12", label: "12 呼吸系统疾病" },
            { id: "icd11-13", label: "13 消化系统疾病" },
            { id: "icd11-16", label: "16 泌尿生殖系统疾病" },
          ],
        },
        {
          id: "mesh",
          label: "MeSH",
          children: [
            { id: "mesh-c14", label: "C14 心血管系统疾病" },
            { id: "mesh-c08", label: "C08 呼吸系统疾病" },
            { id: "mesh-c04", label: "C04 肿瘤" },
            { id: "mesh-c18", label: "C18 营养与代谢疾病" },
            { id: "mesh-c19", label: "C19 内分泌系统疾病" },
            { id: "mesh-c10", label: "C10 神经系统疾病" },
            { id: "mesh-f03", label: "F03 精神障碍" },
            { id: "mesh-c12", label: "C12 泌尿生殖系统疾病" },
          ],
        },
        {
          id: "snomed",
          label: "SNOMED CT（可选）",
          children: [
            { id: "snomed-cv", label: "心血管疾病概念" },
            { id: "snomed-endo", label: "内分泌与代谢概念" },
            { id: "snomed-onco", label: "肿瘤学概念" },
            { id: "snomed-resp", label: "呼吸系统概念" },
            { id: "snomed-neuro", label: "神经系统概念" },
          ],
        },
      ],
    },
    {
      id: "domestic",
      label: "国内指南",
      children: [
        { id: "cma", label: "中华医学会" },
        { id: "nhc", label: "国家卫健委" },
        { id: "cmda", label: "中国医师协会" },
        { id: "caca", label: "CACA" },
      ],
    },
    {
      id: "international",
      label: "国际指南",
      children: [
        { id: "who", label: "WHO" },
        { id: "nice", label: "NICE" },
        { id: "aha", label: "AHA" },
        { id: "esc", label: "ESC" },
        { id: "ada", label: "ADA" },
        { id: "nccn", label: "NCCN" },
        { id: "kdigo", label: "KDIGO" },
        { id: "ats", label: "ATS / ERS" },
        { id: "acog", label: "ACOG" },
        { id: "uspstf", label: "USPSTF" },
      ],
    },
  ],
};

/** 收集某节点及其全部子孙 id */
export function collectNodeIds(node: TaxonomyNode): string[] {
  const ids = [node.id];
  node.children?.forEach((child) => ids.push(...collectNodeIds(child)));
  return ids;
}

/** 在树中查找节点 */
export function findNode(node: TaxonomyNode, id: string): TaxonomyNode | null {
  if (node.id === id) return node;
  for (const child of node.children || []) {
    const found = findNode(child, id);
    if (found) return found;
  }
  return null;
}

/** 获取从根到目标的路径标签 */
export function getNodePath(node: TaxonomyNode, id: string, trail: string[] = []): string[] | null {
  const next = [...trail, node.label];
  if (node.id === id) return next;
  for (const child of node.children || []) {
    const found = getNodePath(child, id, next);
    if (found) return found;
  }
  return null;
}
