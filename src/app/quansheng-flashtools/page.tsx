import type { Metadata } from "next";
import Comments from "@/components/Comments";
import QuanshengFlashToolsApp from "@/components/QuanshengFlashToolsApp";

export const metadata: Metadata = {
  title: "泉盛刷机工具 - 一洼绿地",
  description:
    "泉盛 UV-K5 / K1 Web Serial 刷机工具：备份校准、刷固件、恢复校准、备份配置、恢复配置、写频、刷字库。",
};

export default function QuanshengFlashToolsPage() {
  return (
    <>
      <QuanshengFlashToolsApp />
      <div className="max-w-5xl mx-auto px-5 pb-10">
        <Comments />
      </div>
    </>
  );
}
