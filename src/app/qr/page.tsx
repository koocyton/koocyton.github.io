import type { Metadata } from "next";
import Comments from "@/components/Comments";
import QrApp from "@/components/QrApp";

export const metadata: Metadata = {
  title: "二维码生成器 - 一洼绿地",
  description: "在浏览器本地把字符串生成二维码，并可保存为 PNG 或 SVG。内容不会上传。",
};

export default function QrPage() {
  return (
    <>
      <QrApp />
      <div className="max-w-3xl mx-auto px-5 pb-10">
        <Comments />
      </div>
    </>
  );
}
