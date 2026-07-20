import type { Metadata } from "next";
import MedicalGuidesApp from "@/components/MedicalGuidesApp";

export const metadata: Metadata = {
  title: "医疗指南检索（AI 整理版） - 一洼绿地",
  description: "按疾病编码体系与国内外指南机构检索临床指南摘要，左侧分类、中间目录、右侧内容。",
};

export default function MedicalGuidesPage() {
  return <MedicalGuidesApp />;
}
