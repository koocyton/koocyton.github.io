import type { TaxonomyNode } from "./types";

/** 左侧疾病分类树（扩展版） */
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
        { id: "cv-cad", label: "冠心病 / ACS", labelEn: "CAD / ACS" },
        { id: "cv-hf", label: "心力衰竭", labelEn: "Heart failure" },
        { id: "cv-af", label: "心房颤动", labelEn: "Atrial fibrillation" },
        { id: "cv-stroke", label: "卒中", labelEn: "Stroke" },
        { id: "cv-lipid", label: "血脂异常", labelEn: "Dyslipidaemia" },
        { id: "cv-pad", label: "外周动脉疾病", labelEn: "PAD" },
        { id: "cv-pe", label: "肺栓塞", labelEn: "Pulmonary embolism" },
        { id: "cv-vhd", label: "心脏瓣膜病", labelEn: "Valvular disease" },
        { id: "cv-ie", label: "感染性心内膜炎", labelEn: "Infective endocarditis" },
      ],
    },
    {
      id: "resp",
      label: "呼吸",
      labelEn: "Respiratory",
      children: [
        { id: "resp-asthma", label: "哮喘", labelEn: "Asthma" },
        { id: "resp-copd", label: "COPD", labelEn: "COPD" },
        { id: "resp-cap", label: "社区获得性肺炎", labelEn: "CAP" },
        { id: "resp-tb", label: "结核病", labelEn: "Tuberculosis" },
        { id: "resp-osa", label: "睡眠呼吸暂停", labelEn: "OSA" },
        { id: "resp-ild", label: "间质性肺病", labelEn: "ILD" },
      ],
    },
    {
      id: "endo",
      label: "内分泌代谢",
      labelEn: "Endocrine",
      children: [
        { id: "endo-t2dm", label: "2 型糖尿病", labelEn: "T2DM" },
        { id: "endo-t1dm", label: "1 型糖尿病", labelEn: "T1DM" },
        { id: "endo-gdm", label: "妊娠期糖尿病", labelEn: "GDM" },
        { id: "endo-obesity", label: "肥胖", labelEn: "Obesity" },
        { id: "endo-thyroid", label: "甲状腺疾病", labelEn: "Thyroid" },
        { id: "endo-osteo", label: "骨质疏松", labelEn: "Osteoporosis" },
        { id: "endo-gout", label: "痛风 / 高尿酸", labelEn: "Gout" },
      ],
    },
    {
      id: "onco",
      label: "肿瘤",
      labelEn: "Oncology",
      children: [
        { id: "onco-breast", label: "乳腺癌", labelEn: "Breast" },
        { id: "onco-lung", label: "肺癌", labelEn: "Lung" },
        { id: "onco-crc", label: "结直肠癌", labelEn: "Colorectal" },
        { id: "onco-gastric", label: "胃癌", labelEn: "Gastric" },
        { id: "onco-liver", label: "肝癌", labelEn: "Liver" },
        { id: "onco-prostate", label: "前列腺癌", labelEn: "Prostate" },
        { id: "onco-cervix", label: "宫颈癌", labelEn: "Cervical" },
        { id: "onco-pancreas", label: "胰腺癌", labelEn: "Pancreas" },
        { id: "onco-pain", label: "癌痛", labelEn: "Cancer pain" },
      ],
    },
    {
      id: "gi",
      label: "消化",
      labelEn: "Gastroenterology",
      children: [
        { id: "gi-ibd", label: "炎症性肠病", labelEn: "IBD" },
        { id: "gi-hp", label: "幽门螺杆菌", labelEn: "H. pylori" },
        { id: "gi-cirrhosis", label: "肝硬化", labelEn: "Cirrhosis" },
        { id: "gi-nafld", label: "脂肪肝 / MASLD", labelEn: "MASLD" },
        { id: "gi-pancreatitis", label: "胰腺炎", labelEn: "Pancreatitis" },
        { id: "gi-gerd", label: "胃食管反流", labelEn: "GERD" },
      ],
    },
    {
      id: "renal",
      label: "肾脏",
      labelEn: "Renal",
      children: [
        { id: "renal-ckd", label: "慢性肾脏病", labelEn: "CKD" },
        { id: "renal-aki", label: "急性肾损伤", labelEn: "AKI" },
        { id: "renal-dn", label: "糖尿病肾病", labelEn: "Diabetic kidney disease" },
        { id: "renal-gn", label: "肾小球疾病", labelEn: "Glomerular disease" },
      ],
    },
    {
      id: "infect",
      label: "感染",
      labelEn: "Infectious",
      children: [
        { id: "infect-hbv", label: "乙型肝炎", labelEn: "HBV" },
        { id: "infect-hcv", label: "丙型肝炎", labelEn: "HCV" },
        { id: "infect-hiv", label: "HIV / AIDS", labelEn: "HIV" },
        { id: "infect-sepsis", label: "脓毒症", labelEn: "Sepsis" },
        { id: "infect-covid", label: "COVID-19", labelEn: "COVID-19" },
        { id: "infect-uti", label: "尿路感染", labelEn: "UTI" },
        { id: "infect-amr", label: "抗菌药物耐药", labelEn: "AMR" },
      ],
    },
    {
      id: "neuro",
      label: "神经",
      labelEn: "Neurology",
      children: [
        { id: "neuro-epilepsy", label: "癫痫", labelEn: "Epilepsy" },
        { id: "neuro-parkinson", label: "帕金森病", labelEn: "Parkinson" },
        { id: "neuro-migraine", label: "偏头痛", labelEn: "Migraine" },
        { id: "neuro-ms", label: "多发性硬化", labelEn: "MS" },
        { id: "neuro-dementia", label: "痴呆 / 阿尔茨海默", labelEn: "Dementia" },
      ],
    },
    {
      id: "psych",
      label: "精神心理",
      labelEn: "Mental health",
      children: [
        { id: "psych-dep", label: "抑郁障碍", labelEn: "Depression" },
        { id: "psych-bipolar", label: "双相情感障碍", labelEn: "Bipolar" },
        { id: "psych-anxiety", label: "焦虑障碍", labelEn: "Anxiety" },
        { id: "psych-schiz", label: "精神分裂症", labelEn: "Schizophrenia" },
      ],
    },
    {
      id: "rheum",
      label: "风湿免疫",
      labelEn: "Rheumatology",
      children: [
        { id: "rheum-ra", label: "类风湿关节炎", labelEn: "RA" },
        { id: "rheum-sle", label: "系统性红斑狼疮", labelEn: "SLE" },
        { id: "rheum-as", label: "强直性脊柱炎", labelEn: "AxSpA" },
      ],
    },
    {
      id: "obgyn",
      label: "妇产",
      labelEn: "Obstetrics",
      children: [
        { id: "obgyn-preec", label: "子痫前期", labelEn: "Preeclampsia" },
        { id: "obgyn-maternal", label: "孕产期保健", labelEn: "Maternal care" },
      ],
    },
    {
      id: "derm",
      label: "皮肤",
      labelEn: "Dermatology",
      children: [
        { id: "derm-ad", label: "特应性皮炎", labelEn: "Atopic dermatitis" },
        { id: "derm-pso", label: "银屑病", labelEn: "Psoriasis" },
      ],
    },
    {
      id: "heme",
      label: "血液",
      labelEn: "Hematology",
      children: [
        { id: "heme-vte", label: "静脉血栓栓塞", labelEn: "VTE" },
        { id: "heme-anemia", label: "贫血", labelEn: "Anemia" },
      ],
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
