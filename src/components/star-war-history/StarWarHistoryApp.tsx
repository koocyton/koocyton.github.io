"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import Link from "next/link";
import type { TimelineDoc, TimelineEvent } from "@/lib/star-war-history";
import { LightsaberProvider } from "./Lightsaber";
import BurnableText from "./BurnableText";
import Starfield from "./Starfield";
import { DeathStarArt, EraIcon, JediCrest, XWingArt } from "./Illustrations";

const ERA_ACCENTS = ["#ffe81f", "#4da3ff", "#ff5a36", "#3dff8a", "#c9a227", "#e8d5a3"];

export default function StarWarHistoryApp({ doc }: { doc: TimelineDoc }) {
  return (
    <LightsaberProvider>
      <StarWarHistoryInner doc={doc} />
    </LightsaberProvider>
  );
}

function StarWarHistoryInner({ doc }: { doc: TimelineDoc }) {
  const [activeEra, setActiveEra] = useState(doc.eras[0]?.id ?? "");
  const [showCrawl, setShowCrawl] = useState(true);

  useEffect(() => {
    const nodes = doc.eras
      .map((e) => document.getElementById(e.id))
      .filter(Boolean) as HTMLElement[];
    if (!nodes.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target?.id) setActiveEra(visible.target.id);
      },
      { rootMargin: "-20% 0px -55% 0px", threshold: [0.05, 0.2, 0.4] }
    );
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [doc.eras]);

  const episodeCount = useMemo(
    () => doc.eras.reduce((n, e) => n + e.events.filter((x) => x.kind === "episode").length, 0),
    [doc.eras]
  );

  return (
    <div className="sw-page">
      <Starfield />
      <div className="sw-atmosphere" aria-hidden />

      <header className="sw-hero">
        <div className="sw-hero-brand">
          <JediCrest className="sw-hero-crest" />
          <p className="sw-eyebrow">GALACTIC TIMELINE</p>
          <h1 className="sw-title">星球大战编年史</h1>
          <p className="sw-subtitle">
            从原力初现到传奇扩展宇宙 · {doc.eras.length} 个时代 · {episodeCount} 部电影主线
          </p>
          <div className="sw-hero-actions">
            <a href={`#${doc.eras[0]?.id ?? ""}`} className="sw-cta">
              进入时间轴
            </a>
            <button type="button" className="sw-cta-ghost" onClick={() => setShowCrawl((v) => !v)}>
              {showCrawl ? "收起开场" : "重播开场"}
            </button>
          </div>
        </div>
        <div className="sw-hero-visual">
          <img
            src="/posts/6.star-war-history/star-war.jpg"
            alt="星球大战"
            className="sw-hero-img"
          />
          <DeathStarArt className="sw-float-ds" />
          <XWingArt className="sw-float-xw" />
        </div>
      </header>

      {showCrawl && (
        <section className="sw-crawl-wrap" aria-label="开场字幕">
          <div className="sw-crawl">
            <p className="sw-crawl-lead">A long time ago in a galaxy far, far away…</p>
            {(doc.guide ?? []).slice(0, 2).map((g) => (
              <p key={g.slice(0, 24)}>{g}</p>
            ))}
          </div>
        </section>
      )}

      {(doc.markers?.length || 0) > 0 && (
        <section className="sw-markers">
          <h2>时间标记</h2>
          <ul>
            {doc.markers!.map((m) => (
              <li key={m.slice(0, 32)}>{m}</li>
            ))}
          </ul>
        </section>
      )}

      <div className="sw-layout">
        <nav className="sw-rail" aria-label="时代导航">
          <p className="sw-rail-title">时代</p>
          {doc.eras.map((era, i) => (
            <a
              key={era.id}
              href={`#${era.id}`}
              className={`sw-rail-item ${activeEra === era.id ? "is-active" : ""}`}
              style={{ "--accent": ERA_ACCENTS[i % ERA_ACCENTS.length] } as CSSProperties}
              onClick={() => setActiveEra(era.id)}
            >
              <span className="sw-rail-idx">{String(i + 1).padStart(2, "0")}</span>
              <span>{era.shortTitle}</span>
            </a>
          ))}
          <Link href="/" className="sw-rail-home">
            ← 返回博客
          </Link>
        </nav>

        <div className="sw-main">
          {doc.eras.map((era, eraIndex) => (
            <section
              key={era.id}
              id={era.id}
              className="sw-era"
              style={{ "--accent": ERA_ACCENTS[eraIndex % ERA_ACCENTS.length] } as CSSProperties}
            >
              <header className="sw-era-head">
                <div className="sw-era-copy">
                  <p className="sw-era-kicker">ERA {String(eraIndex + 1).padStart(2, "0")}</p>
                  <h2>{era.title}</h2>
                  {era.intro && <p className="sw-era-intro">{era.intro}</p>}
                </div>
                <EraIcon index={eraIndex} />
              </header>

              <div className="sw-timeline">
                {era.events.map((ev) => (
                  <EventCard key={ev.id} event={ev} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      <footer className="sw-footer">
        <p>愿原力与你同在 · 右下角抽出光剑，可灼烧文字</p>
        <p className="sw-footer-meta">文字布局引擎：@chenglou/pretext</p>
      </footer>
    </div>
  );
}

function EventCard({ event }: { event: TimelineEvent }) {
  const isEpisode = event.kind === "episode";
  return (
    <article className={`sw-event ${isEpisode ? "is-episode" : ""} ${event.kind}`}>
      <div className="sw-event-rail" aria-hidden>
        <span className="sw-event-dot" />
      </div>
      <div className="sw-event-body">
        <header className="sw-event-head">
          <h3 className={isEpisode ? "sw-episode-title" : undefined}>{event.label}</h3>
          {event.subtitle && <span className="sw-event-sub">{event.subtitle}</span>}
          {isEpisode && <span className="sw-episode-badge">电影主线</span>}
        </header>
        {event.paragraphs.map((p, i) => (
          <BurnableText key={`${event.id}-${i}`} text={p} />
        ))}
      </div>
    </article>
  );
}
