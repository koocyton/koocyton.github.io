import type { TaxonomyNode } from "./types";

/** 左侧疾病分类树（扩展版：常见病 + 权威指南高频病种） */
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
        { id: "cv-arrhythmia", label: "室性 / 室上性心律失常", labelEn: "VA / SVT" },
        { id: "cv-pacing", label: "起搏 / CRT", labelEn: "Pacing / CRT" },
        { id: "cv-syncope", label: "晕厥", labelEn: "Syncope" },
        { id: "cv-stroke", label: "卒中", labelEn: "Stroke" },
        { id: "cv-lipid", label: "血脂异常", labelEn: "Dyslipidaemia" },
        { id: "cv-pad", label: "外周动脉疾病", labelEn: "PAD" },
        { id: "cv-aortic", label: "主动脉疾病", labelEn: "Aortic disease" },
        { id: "cv-pe", label: "肺栓塞 / VTE", labelEn: "PE / VTE" },
        { id: "cv-vhd", label: "心脏瓣膜病", labelEn: "Valvular disease" },
        { id: "cv-ie", label: "感染性心内膜炎", labelEn: "Infective endocarditis" },
        { id: "cv-cm", label: "心肌病", labelEn: "Cardiomyopathy" },
        { id: "cv-myo", label: "心肌炎 / 心包炎", labelEn: "Myocarditis / Pericarditis" },
        { id: "cv-revasc", label: "血运重建", labelEn: "Revascularization" },
        { id: "cv-cardioonc", label: "心脏肿瘤学", labelEn: "Cardio-oncology" },
        { id: "cv-achd", label: "成人先心病", labelEn: "Adult CHD" },
        { id: "cv-prev", label: "心血管预防", labelEn: "CVD prevention" },
        { id: "cv-preg", label: "妊娠合并心脏病", labelEn: "CVD in pregnancy" },
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
        { id: "resp-ph", label: "肺动脉高压", labelEn: "Pulmonary hypertension" },
        { id: "resp-bronch", label: "支气管扩张", labelEn: "Bronchiectasis" },
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
        { id: "endo-pcos", label: "多囊卵巢综合征", labelEn: "PCOS" },
        { id: "endo-adrenal", label: "肾上腺疾病", labelEn: "Adrenal" },
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
        { id: "onco-eso", label: "食管癌", labelEn: "Esophageal" },
        { id: "onco-ovary", label: "卵巢癌", labelEn: "Ovarian" },
        { id: "onco-bladder", label: "膀胱癌", labelEn: "Bladder" },
        { id: "onco-melanoma", label: "黑色素瘤", labelEn: "Melanoma" },
        { id: "onco-lymphoma", label: "淋巴瘤", labelEn: "Lymphoma" },
        { id: "onco-thyroid", label: "甲状腺癌", labelEn: "Thyroid cancer" },
        { id: "onco-pain", label: "癌痛 / 支持治疗", labelEn: "Supportive care" },
      ],
    },
    {
      id: "gi",
      label: "消化",
      labelEn: "Gastroenterology",
      children: [
        { id: "gi-ibd", label: "炎症性肠病", labelEn: "IBD" },
        { id: "gi-hp", label: "幽门螺杆菌 / 消化性溃疡", labelEn: "H. pylori / PUD" },
        { id: "gi-cirrhosis", label: "肝硬化 / 失代偿", labelEn: "Cirrhosis" },
        { id: "gi-aclf", label: "慢加急性肝衰竭", labelEn: "ACLF" },
        { id: "gi-portal", label: "门脉高压 / TIPS / 腹水", labelEn: "Portal hypertension" },
        { id: "gi-nafld", label: "脂肪肝 / MASLD", labelEn: "MASLD" },
        { id: "gi-alcohol", label: "酒精相关肝病", labelEn: "Alcohol-related liver disease" },
        { id: "gi-aih", label: "自身免疫性肝炎", labelEn: "Autoimmune hepatitis" },
        { id: "gi-vascular", label: "肝脏血管病", labelEn: "Vascular liver disease" },
        { id: "gi-pancreatitis", label: "胰腺炎", labelEn: "Pancreatitis" },
        { id: "gi-gerd", label: "胃食管反流", labelEn: "GERD" },
        { id: "gi-ibs", label: "肠易激综合征", labelEn: "IBS" },
        { id: "gi-gall", label: "胆石症", labelEn: "Gallstones" },
        { id: "gi-crc-screen", label: "结直肠癌筛查", labelEn: "CRC screening" },
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
        { id: "renal-gn", label: "肾小球疾病通则", labelEn: "Glomerular disease" },
        { id: "renal-igan", label: "IgA 肾病", labelEn: "IgA nephropathy" },
        { id: "renal-ln", label: "狼疮性肾炎", labelEn: "Lupus nephritis" },
        { id: "renal-anca", label: "ANCA 相关血管炎肾损害", labelEn: "ANCA vasculitis" },
        { id: "renal-adpkd", label: "常染色体显性多囊肾", labelEn: "ADPKD" },
        { id: "renal-mbd", label: "CKD-MBD", labelEn: "CKD-MBD" },
        { id: "renal-dialysis", label: "透析", labelEn: "Dialysis" },
        { id: "renal-transplant", label: "肾移植", labelEn: "Kidney transplant" },
        { id: "renal-htn", label: "肾性高血压", labelEn: "Kidney hypertension" },
        { id: "renal-hcv", label: "CKD 合并丙肝", labelEn: "HCV in CKD" },
        { id: "renal-hf", label: "CKD 合并心衰", labelEn: "HF in CKD" },
      ],
    },
    {
      id: "infect",
      label: "感染",
      labelEn: "Infectious",
      children: [
        { id: "infect-hbv", label: "乙型肝炎", labelEn: "HBV" },
        { id: "infect-hdv", label: "丁型肝炎", labelEn: "HDV" },
        { id: "infect-hcv", label: "丙型肝炎", labelEn: "HCV" },
        { id: "infect-hev", label: "戊型肝炎", labelEn: "HEV" },
        { id: "infect-hav", label: "甲型肝炎", labelEn: "HAV" },
        { id: "infect-hiv", label: "HIV / AIDS", labelEn: "HIV" },
        { id: "infect-sepsis", label: "脓毒症", labelEn: "Sepsis" },
        { id: "infect-covid", label: "COVID-19", labelEn: "COVID-19" },
        { id: "infect-uti", label: "尿路感染", labelEn: "UTI" },
        { id: "infect-amr", label: "抗菌药物耐药", labelEn: "AMR" },
        { id: "infect-flu", label: "流感", labelEn: "Influenza" },
        { id: "infect-cdiff", label: "艰难梭菌感染", labelEn: "C. difficile" },
        { id: "infect-meningitis", label: "脑膜炎", labelEn: "Meningitis" },
        { id: "infect-malaria", label: "疟疾", labelEn: "Malaria" },
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
        { id: "neuro-als", label: "运动神经元病", labelEn: "MND / ALS" },
        { id: "neuro-mg", label: "重症肌无力", labelEn: "Myasthenia gravis" },
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
        { id: "psych-ptsd", label: "创伤后应激障碍", labelEn: "PTSD" },
        { id: "psych-adhd", label: "ADHD", labelEn: "ADHD" },
        { id: "psych-ocd", label: "强迫症", labelEn: "OCD" },
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
        { id: "rheum-oa", label: "骨关节炎", labelEn: "Osteoarthritis" },
        { id: "rheum-vasculitis", label: "血管炎", labelEn: "Vasculitis" },
        { id: "rheum-pmr", label: "风湿性多肌痛", labelEn: "PMR" },
      ],
    },
    {
      id: "obgyn",
      label: "妇产",
      labelEn: "Obstetrics",
      children: [
        { id: "obgyn-preec", label: "子痫前期", labelEn: "Preeclampsia" },
        { id: "obgyn-maternal", label: "孕产期保健", labelEn: "Maternal care" },
        { id: "obgyn-endo", label: "子宫内膜异位症", labelEn: "Endometriosis" },
        { id: "obgyn-meno", label: "围绝经期", labelEn: "Menopause" },
        { id: "obgyn-contraception", label: "避孕", labelEn: "Contraception" },
      ],
    },
    {
      id: "derm",
      label: "皮肤",
      labelEn: "Dermatology",
      children: [
        { id: "derm-ad", label: "特应性皮炎", labelEn: "Atopic dermatitis" },
        { id: "derm-pso", label: "银屑病", labelEn: "Psoriasis" },
        { id: "derm-acne", label: "痤疮", labelEn: "Acne" },
        { id: "derm-urticaria", label: "荨麻疹", labelEn: "Urticaria" },
      ],
    },
    {
      id: "heme",
      label: "血液",
      labelEn: "Hematology",
      children: [
        { id: "heme-vte", label: "静脉血栓栓塞", labelEn: "VTE" },
        { id: "heme-anemia", label: "贫血", labelEn: "Anemia" },
        { id: "heme-itp", label: "免疫性血小板减少", labelEn: "ITP" },
        { id: "heme-scd", label: "镰状细胞病", labelEn: "Sickle cell" },
      ],
    },
    {
      id: "crit",
      label: "急危重症",
      labelEn: "Critical care",
      children: [
        { id: "crit-sepsis", label: "脓毒症 / 休克", labelEn: "Sepsis / Shock" },
        { id: "crit-ards", label: "ARDS", labelEn: "ARDS" },
        { id: "crit-trauma", label: "创伤", labelEn: "Trauma" },
        { id: "crit-cardiac-arrest", label: "心脏骤停 / 复苏", labelEn: "Cardiac arrest" },
      ],
    },
    {
      id: "allergy",
      label: "过敏免疫",
      labelEn: "Allergy",
      children: [
        { id: "allergy-anaphylaxis", label: "过敏性休克", labelEn: "Anaphylaxis" },
        { id: "allergy-food", label: "食物过敏", labelEn: "Food allergy" },
        { id: "allergy-rhinitis", label: "变应性鼻炎", labelEn: "Allergic rhinitis" },
      ],
    },
    {
      id: "uro",
      label: "泌尿",
      labelEn: "Urology",
      children: [
        { id: "uro-bph", label: "前列腺增生", labelEn: "BPH" },
        { id: "uro-stone", label: "尿路结石", labelEn: "Urolithiasis" },
        { id: "uro-incontinence", label: "尿失禁", labelEn: "Incontinence" },
      ],
    },
    {
      id: "ortho",
      label: "骨科",
      labelEn: "Orthopedics",
      children: [
        { id: "ortho-lbp", label: "腰痛", labelEn: "Low back pain" },
        { id: "ortho-fracture", label: "骨折 / 骨质疏松相关", labelEn: "Fracture" },
        { id: "ortho-oa-knee", label: "膝骨关节炎", labelEn: "Knee OA" },
      ],
    },
    {
      id: "ped",
      label: "儿科",
      labelEn: "Pediatrics",
      children: [
        { id: "ped-asthma", label: "儿童哮喘", labelEn: "Pediatric asthma" },
        { id: "ped-fever", label: "发热待查", labelEn: "Fever" },
        { id: "ped-uti", label: "儿童尿路感染", labelEn: "Pediatric UTI" },
      ],
    },
    {
      id: "pall",
      label: "缓和医疗",
      labelEn: "Palliative care",
      children: [
        { id: "pall-care", label: "缓和医疗通则", labelEn: "Palliative care" },
        { id: "pall-pain", label: "慢性疼痛", labelEn: "Chronic pain" },
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
