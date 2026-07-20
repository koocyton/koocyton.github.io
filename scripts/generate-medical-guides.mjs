/**
 * 生成医疗指南 iframe 内容页（AI 整理摘要版）
 * 运行: node scripts/generate-medical-guides.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "../public/medical-guides/content");

const css = `
:root {
  --color-bg: #fafafa;
  --color-text: #1a1a1a;
  --color-text-secondary: #666;
  --color-text-tertiary: #999;
  --color-border: #eaeaea;
  --color-link: #0070f3;
  --color-code-bg: #f0f0f0;
}
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body {
  background: var(--color-bg);
  color: var(--color-text);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif;
  font-size: 14px;
  line-height: 1.65;
  padding: 1.25rem 1.5rem 2.5rem;
}
h1 {
  font-family: "SFMono-Regular", Consolas, Menlo, monospace;
  font-size: 1.15rem;
  font-weight: 600;
  margin: 0 0 0.35rem;
  letter-spacing: -0.01em;
}
.meta {
  font-family: "SFMono-Regular", Consolas, Menlo, monospace;
  font-size: 0.72rem;
  color: var(--color-text-tertiary);
  margin-bottom: 1rem;
}
.disclaimer {
  border-left: 3px solid var(--color-border);
  padding: 0.5rem 0.85rem;
  margin: 0 0 1.25rem;
  color: var(--color-text-secondary);
  font-size: 0.82rem;
  background: #fff;
}
h2 {
  font-family: "SFMono-Regular", Consolas, Menlo, monospace;
  font-size: 0.95rem;
  font-weight: 600;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 0.2rem;
  margin: 1.4rem 0 0.55rem;
}
h3 {
  font-family: "SFMono-Regular", Consolas, Menlo, monospace;
  font-size: 0.88rem;
  font-weight: 600;
  margin: 1rem 0 0.4rem;
}
p { margin: 0 0 0.75rem; }
ul, ol { margin: 0 0 0.85rem; padding-left: 1.35rem; }
li { margin-bottom: 0.25rem; }
table {
  width: 100%;
  border-collapse: collapse;
  margin: 0.75rem 0 1rem;
  font-size: 0.85rem;
}
th, td {
  border: 1px solid var(--color-border);
  padding: 0.35rem 0.6rem;
  text-align: left;
}
th { background: var(--color-code-bg); font-weight: 600; }
code {
  font-family: "SFMono-Regular", Consolas, Menlo, monospace;
  background: var(--color-code-bg);
  border-radius: 3px;
  padding: 0.1em 0.3em;
  font-size: 0.85em;
}
a { color: var(--color-link); text-decoration: none; }
a:hover { text-decoration: underline; }
.tag {
  display: inline-block;
  font-family: "SFMono-Regular", Consolas, Menlo, monospace;
  font-size: 0.68rem;
  color: var(--color-text-tertiary);
  margin-right: 0.5rem;
}
.footer-note {
  margin-top: 2rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--color-border);
  font-size: 0.75rem;
  color: var(--color-text-tertiary);
}
`;

function page({ title, org, year, disease, codes, tags, sourceUrl, body }) {
  const codeStr = (codes || []).length ? codes.join(" · ") : "—";
  const tagStr = (tags || []).map((t) => `<span class="tag">#${t}</span>`).join("");
  const source = sourceUrl
    ? `<p>原始来源（请以正式发布版为准）：<a href="${sourceUrl}" target="_blank" rel="noopener noreferrer">${sourceUrl}</a></p>`
    : "";
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${title}</title>
<style>${css}</style>
</head>
<body>
<h1>${title}</h1>
<div class="meta">${org} · ${year} · ${disease} · 编码 ${codeStr}</div>
<div>${tagStr}</div>
<div class="disclaimer">
  <strong>说明：</strong>本页为 AI 整理的教学/检索摘要，非官方全文，不能替代临床判断与正式指南文本。关键决策请核对最新原版指南与当地规范。
</div>
${body}
${source}
<div class="footer-note">医疗指南检索（AI 整理版）· 5163.xyz</div>
</body>
</html>`;
}

const docs = {
  "cma-hypertension-2018": {
    title: "中国高血压防治指南（2018 修订版）",
    org: "中华医学会 / 中国高血压联盟",
    year: 2018,
    disease: "原发性高血压",
    codes: ["I10", "BA00"],
    tags: ["高血压", "心血管", "降压药"],
    sourceUrl: "https://www.chinahbp.org/",
    body: `
<h2>1. 诊断与分级</h2>
<p>诊室血压 ≥140/90 mmHg（非同日 3 次）可诊断高血压。分级：1 级 140–159/90–99；2 级 160–179/100–109；3 级 ≥180/110。正常高值 120–139/80–89 需生活方式干预并随访。</p>
<table>
  <tr><th>分类</th><th>收缩压</th><th>舒张压</th></tr>
  <tr><td>正常</td><td>&lt;120</td><td>&lt;80</td></tr>
  <tr><td>正常高值</td><td>120–139</td><td>80–89</td></tr>
  <tr><td>1 级</td><td>140–159</td><td>90–99</td></tr>
  <tr><td>2 级</td><td>160–179</td><td>100–109</td></tr>
  <tr><td>3 级</td><td>≥180</td><td>≥110</td></tr>
</table>
<h2>2. 危险分层</h2>
<ul>
  <li>结合血压水平、心血管危险因素、靶器官损害与临床疾患分层：低危 / 中危 / 高危 / 很高危。</li>
  <li>高危及以上应尽早启动药物治疗，并更严格随访。</li>
</ul>
<h2>3. 治疗目标</h2>
<ul>
  <li>一般患者 &lt;140/90 mmHg；能耐受可进一步至 &lt;130/80。</li>
  <li>糖尿病、慢性肾脏病等合并症人群个体化，常强调更积极控制。</li>
  <li>高龄患者可适度放宽，优先避免低血压与跌倒风险。</li>
</ul>
<h2>4. 生活方式</h2>
<ol>
  <li>限盐（每日食盐 &lt;5–6 g）、增加蔬果与钾摄入。</li>
  <li>控制体重、规律有氧运动、限酒、戒烟。</li>
  <li>减轻精神压力，保证睡眠。</li>
</ol>
<h2>5. 药物治疗要点</h2>
<ul>
  <li>常用五类：ACEI、ARB、β 阻滞剂、CCB、利尿剂。</li>
  <li>优先长效制剂；血压显著升高或高危者可起始小剂量联合。</li>
  <li>固定复方制剂有助于依从性；注意监测血钾、肌酐、心率等。</li>
</ul>
<h2>6. 特殊人群速览</h2>
<p>老年、妊娠、卒中后、冠心病、心衰、肾脏病、糖尿病等均有特定药物偏好与禁忌，临床需对照原版章节。</p>
`,
  },

  "aha-hypertension-2025": {
    title: "AHA/ACC 高血压指南要点（整理版）",
    org: "AHA / ACC",
    year: 2025,
    disease: "高血压",
    codes: ["I10"],
    tags: ["高血压", "AHA", "风险评估"],
    sourceUrl: "https://www.ahajournals.org/",
    body: `
<h2>血压分类（美国体系）</h2>
<table>
  <tr><th>类别</th><th>SBP</th><th>DBP</th></tr>
  <tr><td>Normal</td><td>&lt;120</td><td>&lt;80</td></tr>
  <tr><td>Elevated</td><td>120–129</td><td>&lt;80</td></tr>
  <tr><td>Stage 1</td><td>130–139</td><td>80–89</td></tr>
  <tr><td>Stage 2</td><td>≥140</td><td>≥90</td></tr>
</table>
<h2>启动治疗逻辑</h2>
<ul>
  <li>强调准确测压（含动态/家庭血压）与 ASCVD 风险评估。</li>
  <li>Stage 1：若 10 年 ASCVD 风险升高或已有临床 CVD，启动药物；否则强化生活方式并复查。</li>
  <li>Stage 2：通常启动药物，常考虑双药联合。</li>
</ul>
<h2>一线药物</h2>
<p>噻嗪类利尿剂、CCB、ACEI/ARB。合并心衰、冠心病、糖尿病、CKD、卒中史时按共病选择。</p>
<h2>目标</h2>
<p>多数成人目标 &lt;130/80 mmHg（个体化权衡获益与耐受）。</p>
`,
  },

  "esc-hypertension-2024": {
    title: "ESC 高血压管理指南要点",
    org: "ESC",
    year: 2024,
    disease: "高血压",
    codes: ["I10"],
    tags: ["高血压", "ESC", "联合治疗"],
    sourceUrl: "https://www.escardio.org/",
    body: `
<h2>诊断</h2>
<p>诊室血压升高需经重复测量或动态/家庭血压确认。重视继发性高血压筛查指征（年轻起病、难治、低钾等）。</p>
<h2>治疗策略</h2>
<ul>
  <li>多数患者推荐起始双药联合（常为 ACEI/ARB + CCB 或利尿剂）。</li>
  <li>单片复方（SPC）提高依从性。</li>
  <li>难治性高血压需核实依从性、测压方法，并评估盐皮质激素受体拮抗剂等。</li>
</ul>
<h2>靶目标</h2>
<p>多数 &lt;140/90，若耐受可进一步降低；高龄与衰弱者个体化，避免过度降压。</p>
`,
  },

  "cma-diabetes-2024": {
    title: "中国 2 型糖尿病防治指南（2020/更新要点）",
    org: "中华医学会糖尿病学分会",
    year: 2024,
    disease: "2 型糖尿病",
    codes: ["E11", "5A11"],
    tags: ["糖尿病", "血糖", "代谢"],
    body: `
<h2>诊断</h2>
<ul>
  <li>典型症状 + 随机血糖 ≥11.1 mmol/L；或空腹 ≥7.0；或 OGTT 2h ≥11.1；或 HbA1c ≥6.5%（需规范检测）。</li>
  <li>无症状者需改日复查确认。</li>
</ul>
<h2>控制目标（个体化）</h2>
<table>
  <tr><th>指标</th><th>一般成人</th><th>备注</th></tr>
  <tr><td>HbA1c</td><td>&lt;7%</td><td>年轻病程短可更严；老年/并发症多可放宽</td></tr>
  <tr><td>空腹血糖</td><td>4.4–7.0</td><td>mmol/L</td></tr>
  <tr><td>血压</td><td>&lt;130/80</td><td>能耐受时</td></tr>
  <tr><td>LDL-C</td><td>按 ASCVD 风险分层</td><td>他汀为基础</td></tr>
</table>
<h2>高血糖治疗路径</h2>
<ol>
  <li>生活方式为基础；超重肥胖强调减重。</li>
  <li>二甲双胍仍为常用起始（无禁忌时）。</li>
  <li>合并 ASCVD/心衰/CKD：优先具心肾获益的 GLP-1 RA 或 SGLT2i。</li>
  <li>血糖显著升高或口服药失效：及时启动胰岛素，避免临床惰性。</li>
</ol>
<h2>并发症筛查</h2>
<p>视网膜病变、肾病（UACR + eGFR）、神经病变、足病、心血管风险评估应定期进行。</p>
`,
  },

  "ada-diabetes-2025": {
    title: "ADA Standards of Care in Diabetes — 要点整理",
    org: "ADA",
    year: 2025,
    disease: "糖尿病",
    codes: ["E10", "E11"],
    tags: ["糖尿病", "ADA", "GLP-1", "SGLT2"],
    sourceUrl: "https://diabetesjournals.org/care",
    body: `
<h2>核心框架</h2>
<p>以患者为中心的综合管理：血糖、体重、心血管与肾脏保护、低血糖风险、社会决定因素。</p>
<h2>药物选择原则</h2>
<ul>
  <li>ASCVD / 高危：GLP-1 RA 与/或 SGLT2i（证据级别高）。</li>
  <li>心衰或 CKD：SGLT2i 优先；部分情形联合 GLP-1 RA。</li>
  <li>减重需求强：双激动剂/GLP-1 RA 权重上升。</li>
  <li>费用与可及性仍是现实约束，需共同决策。</li>
</ul>
<h2>技术</h2>
<p>CGM 适应证扩大；胰岛素泵/AID 在 T1D 与部分 T2D 中的应用增加。</p>
<h2>筛查与共病</h2>
<p>年度肾病与眼底评估；血压血脂按分层强化；脂肪肝/肥胖共病纳入管理。</p>
`,
  },

  "who-diabetes-2023": {
    title: "WHO 糖尿病诊断与管理建议（整理）",
    org: "WHO",
    year: 2023,
    disease: "糖尿病",
    codes: ["E11"],
    tags: ["糖尿病", "WHO", "初级保健"],
    sourceUrl: "https://www.who.int/",
    body: `
<h2>定位</h2>
<p>面向全球初级卫生保健与资源有限地区，强调可及、简化与可执行的路径。</p>
<h2>要点</h2>
<ul>
  <li>推广标准化诊断与基本药物可及（含二甲双胍、胰岛素等）。</li>
  <li>心血管风险综合管理（血压、他汀、阿司匹林个体化）。</li>
  <li>健康教育、自我血糖监测策略需与当地资源匹配。</li>
</ul>
`,
  },

  "esc-hf-2021": {
    title: "ESC 急慢性心力衰竭指南要点",
    org: "ESC",
    year: 2021,
    disease: "心力衰竭",
    codes: ["I50", "BD10"],
    tags: ["心衰", "HFrEF", "ARNI"],
    sourceUrl: "https://www.escardio.org/",
    body: `
<h2>分型</h2>
<ul>
  <li>HFrEF：LVEF ≤40%</li>
  <li>HFmrEF：41–49%</li>
  <li>HFpEF：≥50% 且有结构/功能异常与生物标志物等支持</li>
</ul>
<h2>HFrEF 基础治疗（四联）</h2>
<ol>
  <li>ARNI（或 ACEI/ARB）</li>
  <li>β 阻滞剂（证据类药物）</li>
  <li>MRA</li>
  <li>SGLT2 抑制剂</li>
</ol>
<p>尽快滴定至目标/最大耐受剂量；利尿剂用于淤血控制。</p>
<h2>急性心衰</h2>
<p>识别休克/呼吸衰竭，氧疗与通气，血管活性药物，尽快病因处理并过渡到慢性优化治疗。</p>
`,
  },

  "aha-hf-2022": {
    title: "AHA/ACC/HFSA 心力衰竭指南要点",
    org: "AHA / ACC / HFSA",
    year: 2022,
    disease: "心力衰竭",
    codes: ["I50"],
    tags: ["心衰", "GDMT", "分期"],
    body: `
<h2>分期 A–D</h2>
<p>从危险因素（A）到临床心衰（C）再到进展期（D），强调早期预防与 GDMT。</p>
<h2>GDMT</h2>
<p>HFrEF：ARNI/ACEI/ARB + 证据性 β 阻滞剂 + MRA + SGLT2i。装置治疗（ICD/CRT）按指征评估。</p>
<h2>HFpEF</h2>
<p>共病管理为核心；SGLT2i 获益证据增强；严格控容、控压。</p>
`,
  },

  "cma-acs-2019": {
    title: "急性冠脉综合征急诊快速诊疗指南要点",
    org: "中华医学会急诊医学分会",
    year: 2019,
    disease: "急性冠脉综合征",
    codes: ["I21", "I20.0"],
    tags: ["ACS", "STEMI", "抗栓"],
    body: `
<h2>急诊路径</h2>
<ol>
  <li>胸痛分诊与心电图（10 分钟内）。</li>
  <li>STEMI：尽早再灌注（首选 PCI，时间窗内可溶栓）。</li>
  <li>NSTE-ACS：风险分层决定早期侵入策略。</li>
</ol>
<h2>抗栓</h2>
<p>双联抗血小板 + 抗凝；注意出血风险与围术期管理。</p>
<h2>支持治疗</h2>
<p>止痛、氧疗指征、血压心率管理、并发症（心律失常、休克、机械并发症）识别。</p>
`,
  },

  "esc-acs-2023": {
    title: "ESC 急性冠脉综合征指南要点",
    org: "ESC",
    year: 2023,
    disease: "急性冠脉综合征",
    codes: ["I21"],
    tags: ["ACS", "DAPT", "PCI"],
    body: `
<h2>统一 ACS 理念</h2>
<p>STEMI 与 NSTE-ACS 共享抗栓与二级预防框架，再灌注时机仍按表型区分。</p>
<h2>侵入策略</h2>
<ul>
  <li>STEMI：直接 PCI 为首选。</li>
  <li>高危 NSTE-ACS：早期侵入。</li>
</ul>
<h2>DAPT</h2>
<p>默认 12 个月，高出血风险可缩短；延长需权衡缺血风险。优选强效 P2Y12 抑制剂（无高出血风险时）。</p>
`,
  },

  "nccn-breast-2025": {
    title: "NCCN 乳腺癌指南要点（整理版）",
    org: "NCCN",
    year: 2025,
    disease: "乳腺癌",
    codes: ["C50"],
    tags: ["乳腺癌", "HER2", "激素受体"],
    sourceUrl: "https://www.nccn.org/",
    body: `
<h2>初始评估</h2>
<p>影像、活检、ER/PR/HER2、分期；高危可考虑多基因检测与遗传咨询。</p>
<h2>早中期</h2>
<ul>
  <li>手术 ± 放疗；保乳与乳房切除个体化。</li>
  <li>新辅助：肿瘤降期、保乳、评估体内反应（尤其 HER2+/三阴）。</li>
  <li>辅助系统治疗按分子分型：内分泌、抗 HER2、化疗、免疫（特定三阴）。</li>
</ul>
<h2>晚期</h2>
<p>按 HR/HER2 选择 CDK4/6i、ADC、酪氨酸激酶抑制剂、免疫等；骨改良药物用于骨转移。</p>
`,
  },

  "caca-breast-2024": {
    title: "CACA 乳腺癌诊治指南要点",
    org: "CACA",
    year: 2024,
    disease: "乳腺癌",
    codes: ["C50"],
    tags: ["乳腺癌", "CACA", "筛查"],
    body: `
<h2>中国实践强调</h2>
<ul>
  <li>适龄女性筛查策略与乳腺钼靶/超声选择。</li>
  <li>诊疗路径与多学科（MDT）决策。</li>
  <li>药物可及性与国产创新药证据融入临床路径。</li>
</ul>
<h2>随访</h2>
<p>按分期与治疗制定随访频率；关注内分泌治疗依从性与副作用（骨密度、子宫内膜等）。</p>
`,
  },

  "nccn-nsclc-2025": {
    title: "NCCN 非小细胞肺癌指南要点",
    org: "NCCN",
    year: 2025,
    disease: "非小细胞肺癌",
    codes: ["C34"],
    tags: ["肺癌", "EGFR", "PD-1"],
    body: `
<h2>分子检测</h2>
<p>腺癌等非鳞癌应广泛检测驱动基因（EGFR、ALK、ROS1、BRAF、MET、RET、KRAS、NTRK、HER2 等）与 PD-L1。</p>
<h2>治疗原则</h2>
<ul>
  <li>可手术早期：手术 ± 辅助/新辅助（含靶向/免疫特定情形）。</li>
  <li>局部晚期：同步放化疗 ± 巩固免疫。</li>
  <li>转移性：有驱动基因优先靶向；无驱动按 PD-L1 与组织学选择免疫 ± 化疗。</li>
</ul>
`,
  },

  "caca-lung-2024": {
    title: "CACA 肺癌诊治指南要点",
    org: "CACA",
    year: 2024,
    disease: "肺癌",
    codes: ["C34"],
    tags: ["肺癌", "LDCT", "分子分型"],
    body: `
<h2>筛查</h2>
<p>高危人群低剂量螺旋 CT（LDCT）筛查，强调质量管理与假阳性处理。</p>
<h2>诊疗</h2>
<p>病理分型 + 分子分型驱动精准治疗；中西医结合与支持治疗可按机构路径纳入。</p>
`,
  },

  "nccn-crc-2025": {
    title: "NCCN 结直肠癌指南要点",
    org: "NCCN",
    year: 2025,
    disease: "结直肠癌",
    codes: ["C18", "C20"],
    tags: ["结直肠癌", "MSI", "筛查"],
    body: `
<h2>关键检测</h2>
<p>RAS/BRAF、MMR/MSI、HER2 等；指导靶向与免疫。</p>
<h2>治疗概要</h2>
<ul>
  <li>结肠癌：手术为基础，辅助化疗按分期。</li>
  <li>直肠癌：常需新辅助放化疗/全程新辅助（TNT）策略。</li>
  <li>转移性：化疗骨架 + 抗 EGFR/VEGF；MSI-H 优先免疫。</li>
</ul>
`,
  },

  "nice-depression-2022": {
    title: "NICE 抑郁识别与管理指南要点",
    org: "NICE",
    year: 2022,
    disease: "抑郁障碍",
    codes: ["F32", "6A70"],
    tags: ["抑郁", "心理治疗", "抗抑郁药"],
    sourceUrl: "https://www.nice.org.uk/",
    body: `
<h2>评估</h2>
<p>严重度、自杀风险、共病、社会支持；共享决策。</p>
<h2>阶梯治疗</h2>
<ol>
  <li>轻度：引导性自助、心理教育、运动等。</li>
  <li>中重度：CBT/人际治疗等 +/或抗抑郁药。</li>
  <li>难治：换药、增效、转诊专科，评估物理治疗。</li>
</ol>
<h2>药物注意</h2>
<p>起效时间、撤药综合征、青年自杀意念监测、妊娠期特殊考量。</p>
`,
  },

  "cma-depression-2015": {
    title: "中国抑郁障碍防治指南要点",
    org: "中华医学会精神医学分会",
    year: 2015,
    disease: "抑郁障碍",
    codes: ["F32"],
    tags: ["抑郁", "精神科"],
    body: `
<h2>诊断与鉴别</h2>
<p>与双相、焦虑、躯体疾病及物质相关障碍鉴别；使用规范量表辅助。</p>
<h2>治疗阶段</h2>
<ul>
  <li>急性期：控制症状、防自杀。</li>
  <li>巩固期：防复发。</li>
  <li>维持期：高复发风险者延长治疗。</li>
</ul>
<h2>手段</h2>
<p>SSRI/SNRI 等一线药物、心理治疗、MECT/rTMS 等物理治疗指征。</p>
`,
  },

  "gold-copd-2025": {
    title: "GOLD 慢性阻塞性肺疾病指南要点",
    org: "GOLD / ATS 相关",
    year: 2025,
    disease: "慢性阻塞性肺疾病",
    codes: ["J44"],
    tags: ["COPD", "GOLD", "吸入治疗"],
    body: `
<h2>诊断</h2>
<p>慢性呼吸道症状 + 支气管舒张后 FEV1/FVC &lt; 0.7。</p>
<h2>初始治疗分组逻辑</h2>
<p>基于症状负担与急性加重史选择支气管扩张剂（LAMA/LABA）± ICS（有指征时，如高嗜酸/哮喘重叠）。</p>
<h2>非药物</h2>
<p>戒烟、疫苗接种、肺康复、氧疗与通气指征、共病管理。</p>
<h2>急性加重</h2>
<p>支气管扩张剂、激素疗程、抗菌药物指征、呼吸支持与出院后优化维持治疗。</p>
`,
  },

  "gina-asthma-2024": {
    title: "GINA 哮喘管理与预防策略要点",
    org: "GINA / ATS·ERS 相关",
    year: 2024,
    disease: "支气管哮喘",
    codes: ["J45"],
    tags: ["哮喘", "GINA", "ICS"],
    body: `
<h2>基本原则</h2>
<p>吸入糖皮质激素（ICS）是控制治疗基石；避免单用短效 β 激动剂作为唯一长期方案。</p>
<h2>轨道治疗</h2>
<ul>
  <li>Track 1：症状缓解使用 ICS-福莫特罗（MART 理念）。</li>
  <li>Track 2：日常维持 ICS ± 其他，缓解用 SABA（次选）。</li>
</ul>
<h2>重症哮喘</h2>
<p>表型评估后考虑生物制剂（抗 IgE/IL-5/IL-4R 等）。</p>
`,
  },

  "cma-copd-2021": {
    title: "慢性阻塞性肺疾病诊治指南（中国）要点",
    org: "中华医学会呼吸病学分会",
    year: 2021,
    disease: "慢性阻塞性肺疾病",
    codes: ["J44"],
    tags: ["COPD", "呼吸"],
    body: `
<h2>中国实践</h2>
<ul>
  <li>强调肺功能检查可及性与基层筛查。</li>
  <li>稳定期吸入治疗个体化；中医药可作为辅助（按证据与规范）。</li>
  <li>急性加重分层诊治与预防再住院。</li>
</ul>
`,
  },

  "kdigo-ckd-2024": {
    title: "KDIGO CKD 评估与管理指南要点",
    org: "KDIGO",
    year: 2024,
    disease: "慢性肾脏病",
    codes: ["N18"],
    tags: ["CKD", "KDIGO", "肾病"],
    sourceUrl: "https://kdigo.org/",
    body: `
<h2>定义与分期</h2>
<p>eGFR 与白蛋白尿（A1–A3）热图分期，指导风险与监测频率。</p>
<h2>综合管理</h2>
<ul>
  <li>血压：多数目标偏严格（个体化），常用 ACEI/ARB（尤其蛋白尿）。</li>
  <li>SGLT2i：糖尿病与部分非糖尿病 CKD 的肾/心获益。</li>
  <li>他汀、血糖、生活方式、避免肾毒性药物。</li>
  <li>nsMRA 等用于特定蛋白尿糖尿病肾病。</li>
</ul>
`,
  },

  "nhc-ckd-2022": {
    title: "慢性肾脏病筛查与防治相关规范要点",
    org: "国家卫健委 / 相关专委会",
    year: 2022,
    disease: "慢性肾脏病",
    codes: ["N18"],
    tags: ["CKD", "基层", "筛查"],
    body: `
<h2>基层重点</h2>
<ul>
  <li>高危人群（糖尿病、高血压、老年等）定期查 eGFR 与尿常规/白蛋白尿。</li>
  <li>明确转诊指征：eGFR 显著下降、蛋白尿进展、血尿、难治高血压等。</li>
  <li>一体化管理：慢病共管、用药审查、患者教育。</li>
</ul>
`,
  },

  "aha-stroke-2021": {
    title: "AHA/ASA 急性缺血性卒中早期管理要点",
    org: "AHA / ASA",
    year: 2021,
    disease: "急性缺血性卒中",
    codes: ["I63"],
    tags: ["卒中", "溶栓", "取栓"],
    body: `
<h2>时间就是大脑</h2>
<ul>
  <li>静脉溶栓：标准时间窗内（并评估扩展窗/影像筛选策略）。</li>
  <li>大血管闭塞：机械取栓时间窗与影像选择。</li>
</ul>
<h2>卒中单元</h2>
<p>多学科路径、吞咽评估、血糖血压管理、早期抗栓时机、并发症预防。</p>
`,
  },

  "cma-stroke-2023": {
    title: "中国急性缺血性卒中诊治指南要点",
    org: "中华医学会神经病学分会",
    year: 2023,
    disease: "急性缺血性卒中",
    codes: ["I63"],
    tags: ["卒中", "二级预防"],
    body: `
<h2>再灌注</h2>
<p>溶栓与取栓适应证、禁忌与院内流程优化（DNT、门球时间）。</p>
<h2>二级预防</h2>
<ul>
  <li>抗栓：按病因（动脉粥样硬化、心源性等）选择抗血小板或抗凝。</li>
  <li>强化降压、调脂、降糖、生活方式。</li>
</ul>
`,
  },

  "who-hypertension-2021": {
    title: "WHO 成人高血压药物治疗指南要点",
    org: "WHO",
    year: 2021,
    disease: "高血压",
    codes: ["I10"],
    tags: ["高血压", "WHO", "初级保健"],
    body: `
<h2>简化方案</h2>
<ul>
  <li>推荐起始联合治疗（多数成人）。</li>
  <li>优先单片复方以提高依从性。</li>
  <li>与心血管疾病综合干预包协同。</li>
</ul>
`,
  },

  "nice-hypertension-2023": {
    title: "NICE 高血压诊断与管理要点",
    org: "NICE",
    year: 2023,
    disease: "高血压",
    codes: ["I10"],
    tags: ["高血压", "NICE", "ABPM"],
    body: `
<h2>诊断</h2>
<p>诊室血压升高后，推荐动态血压（ABPM）或家庭血压确认。</p>
<h2>阶梯用药</h2>
<p>按年龄与种族选择 ACEI/ARB 或 CCB 起始，逐步联合利尿剂等；强调依从性与监测。</p>
`,
  },

  "uspstf-lung-2021": {
    title: "USPSTF 肺癌筛查推荐要点",
    org: "USPSTF",
    year: 2021,
    disease: "肺癌（筛查）",
    codes: ["Z12.2"],
    tags: ["筛查", "LDCT", "预防"],
    body: `
<h2>推荐人群</h2>
<p>年龄 50–80 岁，吸烟史 ≥20 包年，目前吸烟或戒烟 15 年内：年度低剂量 CT 筛查。</p>
<h2>停止筛查</h2>
<p>超过 15 年戒烟、健康状况限制治愈性治疗意愿/能力、或超年龄上限时停止。</p>
`,
  },

  "uspstf-crc-2021": {
    title: "USPSTF 结直肠癌筛查推荐要点",
    org: "USPSTF",
    year: 2021,
    disease: "结直肠癌（筛查）",
    codes: ["Z12.1"],
    tags: ["筛查", "肠镜", "FIT"],
    body: `
<h2>年龄</h2>
<p>45–75 岁人群筛查（A/B 级框架）；76–85 岁个体化。</p>
<h2>方式</h2>
<ul>
  <li>高敏粪便潜血/FIT、DNA-FIT</li>
  <li>结肠镜、乙状结肠镜 ± FIT</li>
  <li>CT 结肠成像等</li>
</ul>
<p>选择应基于可及性、依从性与患者偏好，阳性需结肠镜跟进。</p>
`,
  },

  "acog-gdm-2018": {
    title: "ACOG 妊娠期糖尿病指南要点",
    org: "ACOG",
    year: 2018,
    disease: "妊娠期糖尿病",
    codes: ["O24.4"],
    tags: ["妊娠", "GDM", "产科"],
    body: `
<h2>筛查</h2>
<p>多数孕妇 24–28 周筛查；高危可更早。一步法/两步法按机构策略。</p>
<h2>管理</h2>
<ul>
  <li>医学营养治疗与运动为一线。</li>
  <li>未达标启动胰岛素（部分地区口服药使用需慎重评估）。</li>
  <li>产程中血糖监测与新生儿低血糖防范；产后转归与 2 型糖尿病随访。</li>
</ul>
`,
  },

  "nhc-maternal-2022": {
    title: "孕产妇健康管理相关规范要点",
    org: "国家卫健委",
    year: 2022,
    disease: "孕产期保健",
    codes: ["Z34"],
    tags: ["孕产", "保健", "基层"],
    body: `
<h2>服务内容</h2>
<ul>
  <li>建册与产前检查频次、关键检查项目。</li>
  <li>高危妊娠分级管理与及时转诊。</li>
  <li>产后访视与母乳喂养指导。</li>
</ul>
`,
  },

  "cmda-pain-2020": {
    title: "癌症疼痛诊疗规范要点",
    org: "中国医师协会 / 相关专委会",
    year: 2020,
    disease: "癌痛",
    codes: ["R52"],
    tags: ["癌痛", "镇痛", "姑息"],
    body: `
<h2>评估</h2>
<p>疼痛强度、性质、爆发痛、病因与功能影响；规律再评估。</p>
<h2>三阶梯</h2>
<ol>
  <li>非阿片 ± 辅助镇痛</li>
  <li>弱阿片或不强效阿片方案</li>
  <li>强阿片滴定与维持</li>
</ol>
<p>强调口服优先、按时给药、个体滴定；处理便秘、恶心、镇静等不良反应。</p>
`,
  },

  "cma-hbv-2022": {
    title: "慢性乙型肝炎防治指南要点",
    org: "中华医学会肝病学分会",
    year: 2022,
    disease: "慢性乙型肝炎",
    codes: ["B18.1"],
    tags: ["乙肝", "抗病毒", "肝病"],
    body: `
<h2>治疗目标</h2>
<p>长期抑制 HBV DNA，改善肝脏炎症与纤维化，预防肝硬化与肝癌。</p>
<h2>适应证概要</h2>
<ul>
  <li>病毒复制活跃 + 炎症/纤维化证据；肝硬化通常建议抗病毒。</li>
  <li>一线：恩替卡韦、替诺福韦（TDF/TAF）等强效高耐药屏障药物；特定患者可考虑干扰素。</li>
</ul>
<h2>监测</h2>
<p>病毒学、生化学、影像与甲胎蛋白；肝癌高危人群定期筛查。</p>
`,
  },

  "who-hbv-2024": {
    title: "WHO 慢性乙肝预防、诊断与治疗指南要点",
    org: "WHO",
    year: 2024,
    disease: "慢性乙型肝炎",
    codes: ["B18.1"],
    tags: ["乙肝", "WHO", "母婴阻断"],
    body: `
<h2>公共卫生导向</h2>
<ul>
  <li>扩大治疗可及，简化谁该治的评估路径。</li>
  <li>出生剂量疫苗与母婴阻断。</li>
  <li>与消除病毒性肝炎目标对齐的监测指标。</li>
</ul>
`,
  },

  "nice-ckd-2021": {
    title: "NICE 慢性肾脏病评估与管理要点",
    org: "NICE",
    year: 2021,
    disease: "慢性肾脏病",
    codes: ["N18"],
    tags: ["CKD", "NICE"],
    body: `
<h2>识别与分类</h2>
<p>基于 eGFR 与 ACR；注意急性肾损伤与进展风险。</p>
<h2>管理</h2>
<p>血压、心血管风险、药物审查（NSAID 等）、何时转诊肾脏专科。</p>
`,
  },

  "esc-af-2024": {
    title: "ESC 心房颤动管理指南要点",
    org: "ESC",
    year: 2024,
    disease: "心房颤动",
    codes: ["I48"],
    tags: ["房颤", "抗凝", "ABC"],
    body: `
<h2>AF-CARE / 整合管理</h2>
<ul>
  <li>C：合并症与危险因素管理</li>
  <li>A：抗凝防卒中（CHA2DS2-VA 等评估）</li>
  <li>R：减轻症状（室率/节律控制，含消融）</li>
  <li>E：评估疗效与随访</li>
</ul>
<h2>抗凝</h2>
<p>多数适应证优先 DOAC；关注出血风险、肾功能与依从性。</p>
`,
  },

  "cma-af-2023": {
    title: "心房颤动诊断和治疗中国指南要点",
    org: "中华医学会心电生理和起搏分会等",
    year: 2023,
    disease: "心房颤动",
    codes: ["I48"],
    tags: ["房颤", "消融", "抗凝"],
    body: `
<h2>中国要点</h2>
<ul>
  <li>筛查与可穿戴/机会性心电图发现。</li>
  <li>抗凝率提升与不规范停药问题。</li>
  <li>导管消融适应证前移（症状性、特定心衰合并房颤等）。</li>
</ul>
`,
  },

  "ada-ckd-2025": {
    title: "ADA 糖尿病肾病管理要点（Standards 摘录）",
    org: "ADA",
    year: 2025,
    disease: "糖尿病肾脏病",
    codes: ["E11.2", "N18"],
    tags: ["糖尿病肾病", "SGLT2", "蛋白尿"],
    body: `
<h2>筛查</h2>
<p>T2D 诊断时与此后至少每年：eGFR + UACR。</p>
<h2>治疗</h2>
<ul>
  <li>优化血糖血压；ACEI/ARB 用于蛋白尿。</li>
  <li>SGLT2i 用于符合 eGFR 门槛的患者。</li>
  <li>在最大耐受 RAS 阻滞与 SGLT2i 后，特定患者加用 nsMRA 等。</li>
</ul>
`,
  },

  "nhc-infection-control-2023": {
    title: "医疗机构感染预防与控制相关规范要点",
    org: "国家卫健委",
    year: 2023,
    disease: "医院感染防控",
    codes: [],
    tags: ["感控", "HAI", "抗菌药物"],
    body: `
<h2>核心措施</h2>
<ul>
  <li>标准预防与基于传播途径的隔离。</li>
  <li>手卫生依从性与器械消毒灭菌。</li>
  <li>抗菌药物管理（AMS）与监测反馈。</li>
  <li>暴发识别、报告与处置。</li>
</ul>
`,
  },

  "who-amr-2023": {
    title: "WHO 抗菌药物耐药（AMR）应对要点",
    org: "WHO",
    year: 2023,
    disease: "抗菌药物耐药",
    codes: [],
    tags: ["AMR", "AWaRe", "抗生素"],
    body: `
<h2>AWaRe</h2>
<p>Access / Watch / Reserve 分类指导抗菌药物优先选择与储备药物审慎使用。</p>
<h2>多部门行动</h2>
<p>监测、感染防控、疫苗、研发与合理使用宣教并重。</p>
`,
  },

  "caca-gastric-2024": {
    title: "CACA 胃癌诊治指南要点",
    org: "CACA",
    year: 2024,
    disease: "胃癌",
    codes: ["C16"],
    tags: ["胃癌", "CACA", "幽门螺杆菌"],
    body: `
<h2>预防与早诊</h2>
<p>幽门螺杆菌防治、高危地区内镜筛查与早癌识辨。</p>
<h2>治疗</h2>
<ul>
  <li>内镜治疗适应证（早期）。</li>
  <li>标准 D2 手术与围术期化疗/免疫探索。</li>
  <li>晚期：化疗 ± 靶向/免疫，按 HER2、PD-L1、MSI 等生物标志物选择。</li>
</ul>
`,
  },
};

fs.mkdirSync(outDir, { recursive: true });
let n = 0;
for (const [id, doc] of Object.entries(docs)) {
  const html = page(doc);
  fs.writeFileSync(path.join(outDir, `${id}.html`), html, "utf8");
  n++;
}
console.log(`Generated ${n} guideline HTML files -> ${outDir}`);
