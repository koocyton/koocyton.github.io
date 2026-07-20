import type { Metadata } from "next";
import MedicalGuidesApp from "@/components/MedicalGuidesApp";

export const metadata: Metadata = {
  title: "个人 AI 工具测试，不提供参考 - 一洼绿地",
  description: "Clinical Guideline Navigator 演示：疾病分类与官方指南文章链接索引。不提供临床参考，不镜像正文。",
};

export default function MedicalGuidesPage() {
  return <MedicalGuidesApp />;
}
