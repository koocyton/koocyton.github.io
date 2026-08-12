import type { Metadata } from "next";
import VideoJsApp from "@/components/VideoJsApp";

export const metadata: Metadata = {
  title: "Video 播放器 - 一洼绿地",
  description: "支持 MP4、WebM、OGG 及 HLS (m3u8) 流媒体播放，含本地历史记录。",
};

export default function VideoJsPage() {
  return <VideoJsApp />;
}
