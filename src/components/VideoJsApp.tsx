"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Hls from "hls.js";

const STORAGE_KEY = "video-js-history-v1";

type SavedVideo = {
  id: string;
  url: string;
  title: string;
  savedAt: number;
};

const DEMO_VIDEOS: { title: string; url: string }[] = [
  {
    title: "oceans.mp4",
    url: "https://vjs.zencdn.net/v/oceans.mp4",
  },
  {
    title: "Apple HLS 示例",
    url: "https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8",
  },
];

function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function loadHistory(): SavedVideo[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedVideo[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveHistory(list: SavedVideo[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function isHlsUrl(url: string): boolean {
  try {
    const path = new URL(url).pathname.toLowerCase();
    if (path.endsWith(".m3u8")) return true;
  } catch {
    /* ignore */
  }
  return /\.m3u8($|\?|#)/i.test(url) || /[?&](format|type)=m3u8\b/i.test(url);
}

function detectMime(url: string): string {
  try {
    const path = new URL(url).pathname.toLowerCase();
    if (path.endsWith(".mp4")) return "video/mp4";
    if (path.endsWith(".webm")) return "video/webm";
    if (path.endsWith(".ogv") || path.endsWith(".ogg")) return "video/ogg";
    if (path.endsWith(".m3u8")) return "application/vnd.apple.mpegurl";
  } catch {
    /* ignore */
  }
  if (/\.mp4($|\?|#)/i.test(url)) return "video/mp4";
  if (/\.webm($|\?|#)/i.test(url)) return "video/webm";
  if (/\.og[gv]($|\?|#)/i.test(url)) return "video/ogg";
  if (isHlsUrl(url)) return "application/vnd.apple.mpegurl";
  return "application/vnd.apple.mpegurl";
}

function percentToBytes(encoded: string): Uint8Array {
  const bytes: number[] = [];
  for (let i = 0; i < encoded.length; ) {
    if (encoded[i] === "%" && /%[0-9A-Fa-f]{2}/.test(encoded.slice(i, i + 3))) {
      bytes.push(parseInt(encoded.slice(i + 1, i + 3), 16));
      i += 3;
    } else {
      bytes.push(encoded.charCodeAt(i) & 0xff);
      i += 1;
    }
  }
  return new Uint8Array(bytes);
}

function decodeTitleBytes(bytes: Uint8Array): string {
  for (const encoding of ["utf-8", "gbk", "gb18030"] as const) {
    try {
      const text = new TextDecoder(encoding, { fatal: encoding === "utf-8" }).decode(bytes).trim();
      if (text && !/\uFFFD/.test(text)) return text.slice(0, 80);
    } catch {
      /* try next */
    }
  }
  return "";
}

/** Prefer query title=…; UTF-8 first, then GBK for legacy Chinese query titles. */
function titleFromUrl(url: string): string {
  try {
    const match = url.match(/[?&]title=([^&]*)/i);
    if (match?.[1]) {
      const decoded = decodeTitleBytes(percentToBytes(match[1].replace(/\+/g, " ")));
      if (decoded) return decoded;
    }
    const u = new URL(url);
    const base = u.pathname.split("/").filter(Boolean).pop() || u.hostname;
    return decodeURIComponent(base).slice(0, 80);
  } catch {
    return url.slice(0, 80);
  }
}

function hlsErrorMessage(data: { type?: string; details?: string; fatal?: boolean }): string {
  const details = data.details || data.type || "unknown";
  if (/key|decrypt|aes/i.test(details)) {
    return `HLS 解密失败（${details}）。密钥地址需相对 m3u8 域名解析；若源站限制 IP/Referer，浏览器直连可播但页面内可能失败。`;
  }
  if (/manifest|network/i.test(details)) {
    return `HLS 加载失败（${details}）。请检查链接是否过期，以及源站是否允许跨域（CORS）。`;
  }
  return `播放失败：${details}`;
}

export default function VideoJsApp() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [urlInput, setUrlInput] = useState("");
  const [history, setHistory] = useState<SavedVideo[]>([]);
  const [activeUrl, setActiveUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  useEffect(() => {
    return () => {
      hlsRef.current?.destroy();
      hlsRef.current = null;
    };
  }, []);

  const persist = (list: SavedVideo[]) => {
    setHistory(list);
    saveHistory(list);
  };

  const rememberUrl = (url: string) => {
    const title = titleFromUrl(url);
    const existing = loadHistory();
    const without = existing.filter((item) => item.url !== url);
    const next: SavedVideo[] = [
      { id: uid(), url, title, savedAt: Date.now() },
      ...without,
    ].slice(0, 50);
    persist(next);
  };

  const removeUrl = (id: string) => {
    persist(history.filter((item) => item.id !== id));
  };

  const playUrl = async (rawUrl: string, options?: { remember?: boolean }) => {
    const video_url = rawUrl.trim();
    if (!/^https?:\/\/.+/i.test(video_url)) {
      setError("请输入以 http:// 或 https:// 开头的有效地址");
      return;
    }

    const video = videoRef.current;
    if (!video) return;

    setUrlInput(video_url);
    setError(null);
    setStatus("加载中…");
    setActiveUrl(video_url);

    hlsRef.current?.destroy();
    hlsRef.current = null;
    video.removeAttribute("src");
    video.load();

    const mime = detectMime(video_url);
    const useHls = isHlsUrl(video_url) || mime.includes("mpegurl");

    try {
      if (useHls) {
        if (Hls.isSupported()) {
          const hls = new Hls({
            enableWorker: true,
            // Resolve relative #EXT-X-KEY URI against playlist URL (fixes old video.js bug)
            xhrSetup(xhr) {
              xhr.withCredentials = false;
            },
          });
          hlsRef.current = hls;
          hls.loadSource(video_url);
          hls.attachMedia(video);
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            setStatus(null);
            void video.play().catch(() => {
              setStatus("已就绪，点击播放按钮开始");
            });
          });
          hls.on(Hls.Events.ERROR, (_event, data) => {
            if (!data.fatal) return;
            setStatus(null);
            setError(hlsErrorMessage(data));
            if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
              try {
                hls.recoverMediaError();
                return;
              } catch {
                /* fall through */
              }
            }
            hls.destroy();
            hlsRef.current = null;
          });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = video_url;
          await video.play().catch(() => {
            setStatus("已就绪，点击播放按钮开始");
          });
          setStatus(null);
        } else {
          setError("当前浏览器不支持 HLS 播放");
          setStatus(null);
          return;
        }
      } else {
        video.src = video_url;
        await video.play().catch(() => {
          setStatus("已就绪，点击播放按钮开始");
        });
        setStatus(null);
      }

      if (options?.remember !== false) {
        rememberUrl(video_url);
      }
    } catch (e) {
      setStatus(null);
      setError(e instanceof Error ? e.message : "播放失败");
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void playUrl(urlInput, { remember: true });
  };

  return (
    <div className="max-w-3xl mx-auto px-5 py-8">
      <header className="mb-6 flex flex-wrap items-start gap-3 justify-between">
        <div className="min-w-0">
          <h1 className="font-mono text-xl font-semibold text-[var(--color-text)] leading-tight">
            Video 播放器
          </h1>
          <p className="mt-1 text-xs font-mono text-[var(--color-text-tertiary)]">
            MP4 / WebM / OGG · HLS (m3u8，含 AES-128)
          </p>
        </div>
        <Link
          href="/"
          className="text-xs font-mono text-[var(--color-text-tertiary)] hover:text-[var(--color-link)] transition-colors shrink-0"
        >
          ← 返回
        </Link>
      </header>

      <div className="rounded border border-[var(--color-border)] bg-black overflow-hidden aspect-video">
        <video
          ref={videoRef}
          className="w-full h-full"
          controls
          playsInline
          preload="metadata"
          poster="/video-js/video-poster.jpg"
        />
      </div>

      {(status || error) && (
        <p
          className={`mt-2 text-xs font-mono ${
            error ? "text-red-600" : "text-[var(--color-text-tertiary)]"
          }`}
        >
          {error || status}
        </p>
      )}

      <form onSubmit={onSubmit} className="mt-5 flex flex-col sm:flex-row gap-2">
        <input
          type="url"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          placeholder="粘贴视频地址，例如 https://example.com/index.m3u8"
          className="flex-1 min-w-0 text-sm px-3 py-2 rounded border border-[var(--color-border)] bg-white outline-none focus:border-[var(--color-link)] font-mono"
          spellCheck={false}
        />
        <button
          type="submit"
          className="shrink-0 text-xs font-mono px-4 py-2 rounded bg-[var(--color-text)] text-[var(--color-bg)] hover:opacity-90"
        >
          播放并保存
        </button>
      </form>

      <section className="mt-8">
        <h2 className="font-mono text-sm font-semibold text-[var(--color-text)] mb-2">示例</h2>
        <ul className="space-y-1.5">
          {DEMO_VIDEOS.map((item) => (
            <li key={item.url}>
              <button
                type="button"
                onClick={() => void playUrl(item.url, { remember: false })}
                className="text-left text-sm text-[var(--color-link)] hover:underline font-mono break-all"
              >
                {item.title}
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <div className="flex items-baseline justify-between gap-2 mb-2">
          <h2 className="font-mono text-sm font-semibold text-[var(--color-text)]">本地历史</h2>
          <span className="text-[11px] font-mono text-[var(--color-text-tertiary)]">
            保存在本机 localStorage
          </span>
        </div>
        {history.length === 0 ? (
          <p className="text-sm text-[var(--color-text-secondary)]">暂无记录。输入链接并播放后会出现在这里。</p>
        ) : (
          <ul className="divide-y divide-[var(--color-border)] border border-[var(--color-border)] rounded">
            {history.map((item) => {
              const active = activeUrl === item.url;
              return (
                <li
                  key={item.id}
                  className={`flex items-start gap-2 px-3 py-2.5 ${
                    active ? "bg-[var(--color-code-bg)]" : "bg-white"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => void playUrl(item.url, { remember: true })}
                    className="flex-1 min-w-0 text-left"
                  >
                    <div className="text-sm text-[var(--color-text)] truncate font-medium">
                      {item.title}
                    </div>
                    <div className="text-[11px] font-mono text-[var(--color-text-tertiary)] truncate mt-0.5">
                      {item.url}
                    </div>
                  </button>
                  <button
                    type="button"
                    aria-label="删除"
                    onClick={() => removeUrl(item.id)}
                    className="shrink-0 text-[11px] font-mono px-2 py-1 rounded border border-[var(--color-border)] text-[var(--color-text-tertiary)] hover:text-[var(--color-text)] hover:border-[var(--color-text)] transition-colors"
                  >
                    删除
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <p className="mt-8 text-[11px] font-mono text-[var(--color-text-tertiary)] leading-relaxed">
        说明：带查询参数的 m3u8（如 index.m3u8?title=…）以及 AES-128 加密流需用现代 HLS 解析；相对路径密钥会按
        playlist 域名解析。若源站对分片做了 Referer / IP 限制，直接在地址栏打开可能可播，而页面内播放仍会失败。
      </p>
    </div>
  );
}
