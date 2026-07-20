import type { TaxonomyNode } from "./types";

/**
 * 左侧医学分类树（疾病导向）
 * 机构筛选在中栏工具条完成，不占用树结构。
 */
export const taxonomyTree: TaxonomyNode = {
  id: "root",
  label: "疾病",
  labelEn: "Diseases",
  children: [
    {
      id: "cv",
      label: "心血管",
      labelEn: "Cardiovascular",
      children: [
        { id: "cv-htn", label: "高血压", labelEn: "Hypertension" },
        { id: "cv-cad", label: "冠心病", labelEn: "Coronary artery disease" },
        { id: "cv-hf", label: "心力衰竭", labelEn: "Heart failure" },
        { id: "cv-af", label: "心房颤动", labelEn: "Atrial fibrillation" },
        { id: "cv-stroke", label: "卒中", labelEn: "Stroke" },
      ],
    },
    {
      id: "resp",
      label: "呼吸",
      labelEn: "Respiratory",
      children: [
        { id: "resp-asthma", label: "哮喘", labelEn: "Asthma" },
        { id: "resp-copd", label: "COPD", labelEn: "COPD" },
      ],
    },
    {
      id: "endo",
      label: "内分泌",
      labelEn: "Endocrine",
      children: [
        { id: "endo-dm", label: "糖尿病", labelEn: "Diabetes" },
        { id: "endo-gdm", label: "妊娠期糖尿病", labelEn: "GDM" },
      ],
    },
    {
      id: "onco",
      label: "肿瘤",
      labelEn: "Oncology",
      children: [
        { id: "onco-breast", label: "乳腺癌", labelEn: "Breast cancer" },
        { id: "onco-lung", label: "肺癌", labelEn: "Lung cancer" },
        { id: "onco-crc", label: "结直肠癌", labelEn: "Colorectal cancer" },
        { id: "onco-gastric", label: "胃癌", labelEn: "Gastric cancer" },
      ],
    },
    {
      id: "renal",
      label: "肾脏",
      labelEn: "Renal",
      children: [{ id: "renal-ckd", label: "慢性肾脏病", labelEn: "CKD" }],
    },
    {
      id: "infect",
      label: "感染",
      labelEn: "Infectious",
      children: [
        { id: "infect-hbv", label: "乙型肝炎", labelEn: "Hepatitis B" },
        { id: "infect-amr", label: "抗菌药物耐药", labelEn: "AMR" },
      ],
    },
    {
      id: "psych",
      label: "精神",
      labelEn: "Mental health",
      children: [{ id: "psych-dep", label: "抑郁障碍", labelEn: "Depression" }],
    },
    {
      id: "obgyn",
      label: "妇产",
      labelEn: "Obstetrics",
      children: [{ id: "obgyn-maternal", label: "孕产期保健", labelEn: "Maternal care" }],
    },
  ],
};

export function findNode(node: TaxonomyNode, id: string): TaxonomyNode | null {
  if (node.id === id) return node;
  for (const child of node.children || []) {
    const found = findNode(child, id);
    if (found) return found;
  }
  return null;
}

export function getNodePath(node: TaxonomyNode, id: string, trail: string[] = []): string[] | null {
  const next = [...trail, node.label];
  if (node.id === id) return next;
  for (const child of node.children || []) {
    const found = getNodePath(child, id, next);
    if (found) return found;
  }
  return null;
}

export function collectDescendantIds(node: TaxonomyNode): string[] {
  const ids = [node.id];
  for (const child of node.children || []) {
    ids.push(...collectDescendantIds(child));
  }
  return ids;
}
