import type { Metadata } from "next";
import { Orbitron, Noto_Sans_SC } from "next/font/google";
import { loadStarWarHistory } from "@/lib/star-war-history";
import StarWarHistoryApp from "@/components/star-war-history/StarWarHistoryApp";
import "@/components/star-war-history/star-war-history.css";

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
  display: "swap",
});

const notoSansSc = Noto_Sans_SC({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-noto-sans-sc",
  display: "swap",
});

export const metadata: Metadata = {
  title: "星球大战编年史 - 一洼绿地",
  description: "结构化时间轴重排的星球大战大事件，含光剑灼烧文字特效。",
};

export default function StarWarHistoryPage() {
  const doc = loadStarWarHistory();

  return (
    <div className={`${orbitron.variable} ${notoSansSc.variable}`}>
      <style>{`
        .sw-page {
          font-family: var(--font-noto-sans-sc), "PingFang SC", "Hiragino Sans GB", sans-serif;
        }
        .sw-title,
        .sw-eyebrow,
        .sw-era-kicker,
        .sw-rail-title,
        .sw-rail-idx,
        .sw-event-head h3,
        .sw-crawl-lead,
        .sw-markers h2 {
          font-family: var(--font-orbitron), var(--font-noto-sans-sc), sans-serif;
        }
      `}</style>
      <StarWarHistoryApp doc={doc} />
    </div>
  );
}
