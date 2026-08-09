import type { Metadata } from "next";
import InquiryChatApp from "@/components/InquiryChatApp";

export const metadata: Metadata = {
  title: "AI 问诊对话 (个人测试) - 一洼绿地",
  description: "个人 AI 问诊对话演示：就医前症状梳理与知识储备。不提供临床参考，不构成诊疗建议。",
};

export default function InquiryChatPage() {
  return <InquiryChatApp />;
}
