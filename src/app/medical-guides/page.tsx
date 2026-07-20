import type { Metadata } from "next";
import MedicalGuidesApp from "@/components/MedicalGuidesApp";

export const metadata: Metadata = {
  title: "临床指南导航系统 / Clinical Guideline Navigator - 一洼绿地",
  description:
    "全球医疗指南检索与导航：疾病分类、机构筛选、官方原文链接。不镜像指南正文。",
};

export default function MedicalGuidesPage() {
  return <MedicalGuidesApp />;
}
