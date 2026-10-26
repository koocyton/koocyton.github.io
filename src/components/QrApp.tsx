"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { create, toCanvas, toString as qrToSvg, type QRCodeErrorCorrectionLevel } from "qrcode";

const LEVELS: { id: QRCodeErrorCorrectionLevel; label: string; hint: string }[] = [
  { id: "L", label: "L", hint: "约 7% 纠错，容量最大" },
  { id: "M", label: "M", hint: "约 15% 纠错，常用" },
  { id: "Q", label: "Q", hint: "约 25% 纠错" },
  { id: "H", label: "H", hint: "约 30% 纠错，容量最小" },
];

const SIZES = [256, 512, 1024] as const;
const MARGINS = [
  { value: 2, label: "窄" },
  { value: 4, label: "标准" },
] as const;

const EXAMPLES = [
  { label: "网址", value: "https://5163.xyz" },
  { label: "文本", value: "你好，一洼绿地" },
  { label: "Wi-Fi", value: "WIFI:T:WPA;S:MyWiFi;P:password;;" },
];

function describeError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  if (/too big/i.test(message)) {
    return "内容太长，放不进一个二维码。缩短文字，或把纠错调到 L。";
  }
  return "无法生成二维码，请检查内容。";
}

function luma(hex: string): number {
  const value = Number.parseInt(hex.slice(1), 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("empty"));
    }, "image/png");
  });
}

export default function QrApp() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [text, setText] = useState("");
  const [level, setLevel] = useState<QRCodeErrorCorrectionLevel>("M");
  const [size, setSize] = useState<(typeof SIZES)[number]>(512);
  const [margin, setMargin] = useState<(typeof MARGINS)[number]["value"]>(4);
  const [dark, setDark] = useState("#000000");
  const [light, setLight] = useState("#ffffff");
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [meta, setMeta] = useState<{ version: number; modules: number } | null>(null);

  const bytes = useMemo(() => new TextEncoder().encode(text).length, [text]);
  const contrast = Math.abs(luma(dark) - luma(light));
  const lightOnDark = luma(light) + 24 < luma(dark);

  useEffect(() => {
    if (!notice) return;
    const id = window.setTimeout(() => setNotice(null), 2500);
    return () => window.clearTimeout(id);
  }, [notice]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (!text) {
      setReady(false);
      setError(null);
      setMeta(null);
      return;
    }

    let cancelled = false;
    const options = {
      errorCorrectionLevel: level,
      margin,
      width: size,
      color: { dark, light },
    };

    try {
      const symbol = create(text, { errorCorrectionLevel: level });
      void toCanvas(canvas, text, options)
        .then(() => {
          if (cancelled) return;
          canvas.style.width = "100%";
          canvas.style.height = "auto";
          setMeta({ version: symbol.version, modules: symbol.modules.size });
          setError(null);
          setReady(true);
        })
        .catch((err: unknown) => {
          if (cancelled) return;
          setReady(false);
          setMeta(null);
          setError(describeError(err));
        });
    } catch (err) {
      setReady(false);
      setMeta(null);
      setError(describeError(err));
    }

    return () => {
      cancelled = true;
    };
  }, [text, level, margin, size, dark, light]);

  const savePng = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !ready) return;
    try {
      const blob = await canvasToBlob(canvas);
      setNotice("PNG 已下载");
      window.setTimeout(() => downloadBlob(blob, "二维码.png"), 0);
    } catch {
      setNotice("保存失败，请再试一次");
    }
  };

  const saveSvg = async () => {
    if (!text || !ready) return;
    try {
      const svg = await qrToSvg(text, {
        type: "svg",
        errorCorrectionLevel: level,
        margin,
        width: size,
        color: { dark, light },
      });
      setNotice("SVG 已下载");
      const blob = new Blob([svg], { type: "image/svg+xml" });
      window.setTimeout(() => downloadBlob(blob, "二维码.svg"), 0);
    } catch (err) {
      setNotice(describeError(err));
    }
  };

  const copyImage = () => {
    const canvas = canvasRef.current;
    if (!canvas || !ready) return;
    if (!navigator.clipboard?.write || typeof ClipboardItem === "undefined") {
      setNotice("当前浏览器不能复制图片，请改用保存");
      return;
    }
    const item = new ClipboardItem({
      "image/png": canvasToBlob(canvas),
    });
    void navigator.clipboard.write([item]).then(
      () => setNotice("图片已复制，可直接粘贴"),
      () => setNotice("复制失败，请改用保存图片"),
    );
  };

  return (
    <div className="max-w-3xl mx-auto px-5 py-8">
      <header className="mb-6 flex flex-wrap items-start gap-3 justify-between">
        <div className="min-w-0">
          <h1 className="font-mono text-xl font-semibold text-[var(--color-text)] leading-tight">
            二维码生成器
          </h1>
          <p className="mt-1 text-xs font-mono text-[var(--color-text-tertiary)]">
            输入即生成 · 本地编码 · 可保存图片
          </p>
        </div>
        <Link
          href="/"
          className="text-xs font-mono text-[var(--color-text-tertiary)] hover:text-[var(--color-link)] transition-colors shrink-0"
        >
          ← 返回
        </Link>
      </header>

      <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_300px] md:items-start">
        <section>
          <label htmlFor="qr-text" className="font-mono text-sm font-semibold text-[var(--color-text)]">
            内容
          </label>
          <textarea
            id="qr-text"
            value={text}
            autoFocus
            spellCheck={false}
            onChange={(e) => setText(e.target.value)}
            placeholder="网址、文本，或任意字符串"
            className="mt-2 w-full min-h-24 md:min-h-40 text-sm px-3 py-2 rounded border border-[var(--color-border)] bg-white outline-none focus:border-[var(--color-link)] font-mono resize-y"
          />
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-mono text-[var(--color-text-tertiary)] mr-1">示例</span>
            {EXAMPLES.map((item) => {
              const active = text === item.value;
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setText(item.value)}
                  className={`text-xs font-mono px-2 py-0.5 rounded border transition-colors ${
                    active
                      ? "border-[var(--color-text)] bg-[var(--color-text)] text-[var(--color-bg)]"
                      : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:border-[var(--color-text)]"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setText("")}
              disabled={!text}
              className="ml-auto text-xs font-mono px-2 py-0.5 rounded border border-[var(--color-border)] text-[var(--color-text-tertiary)] hover:text-[var(--color-text)] disabled:opacity-40"
            >
              清空
            </button>
          </div>
        </section>

        <aside className="mx-auto w-full max-w-[280px] md:max-w-none md:mx-0 md:col-start-2 md:row-start-1 md:row-span-2">
          <div
            className="rounded border border-[var(--color-border)] p-3"
            style={{ backgroundColor: ready ? light : "#ffffff" }}
          >
            <canvas ref={canvasRef} className={ready ? "block w-full h-auto" : "hidden"} />
            {!ready && (
              <div className="aspect-square flex items-center justify-center px-4 text-center text-xs leading-relaxed text-[var(--color-text-tertiary)]">
                {error ? <span className="text-red-600">{error}</span> : "输入内容后，二维码会出现在这里"}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => void savePng()}
            disabled={!ready}
            className="mt-3 w-full text-xs font-mono px-4 py-2 rounded bg-[var(--color-text)] text-[var(--color-bg)] hover:opacity-90 disabled:opacity-40"
          >
            保存图片
          </button>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={copyImage}
              disabled={!ready}
              className="text-xs font-mono px-3 py-2 rounded border border-[var(--color-border)] bg-white text-[var(--color-text)] hover:border-[var(--color-text)] disabled:opacity-40"
            >
              复制图片
            </button>
            <button
              type="button"
              onClick={() => void saveSvg()}
              disabled={!ready}
              className="text-xs font-mono px-3 py-2 rounded border border-[var(--color-border)] bg-white text-[var(--color-text)] hover:border-[var(--color-text)] disabled:opacity-40"
            >
              保存 SVG
            </button>
          </div>

          <p className="mt-2 min-h-4 text-[11px] font-mono text-[var(--color-link)]">{notice}</p>
          <p className="text-[11px] font-mono text-[var(--color-text-tertiary)] leading-relaxed">
            {text
              ? `${bytes} 字节${meta ? ` · 版本 ${meta.version} · ${meta.modules}×${meta.modules}` : ""}`
              : "内容只在这台设备上编码，不会上传，也不会被记住"}
          </p>
        </aside>

        <section className="rounded border border-[var(--color-border)] bg-white divide-y divide-[var(--color-border)]">
          <OptionRow label="纠错">
            <Segment
              value={level}
              options={LEVELS.map((item) => ({
                value: item.id,
                label: item.label,
                title: item.hint,
              }))}
              onChange={setLevel}
            />
          </OptionRow>
          <OptionRow label="保存尺寸">
            <Segment
              value={String(size)}
              options={SIZES.map((item) => ({ value: String(item), label: String(item) }))}
              onChange={(value) => setSize(Number(value) as (typeof SIZES)[number])}
            />
          </OptionRow>
          <OptionRow label="边距">
            <Segment
              value={String(margin)}
              options={MARGINS.map((item) => ({ value: String(item.value), label: item.label }))}
              onChange={(value) => setMargin(Number(value) as (typeof MARGINS)[number]["value"])}
            />
          </OptionRow>
          <OptionRow label="颜色">
            <div className="flex items-center gap-3">
              <ColorField label="前景" value={dark} onChange={setDark} />
              <ColorField label="背景" value={light} onChange={setLight} />
            </div>
          </OptionRow>
          {(contrast < 90 || lightOnDark) && (
            <p className="px-3 py-2 text-[11px] font-mono text-red-600">
              {lightOnDark ? "前景应深于背景，否则可能扫不出来。" : "前景和背景对比太低，扫码可能失败。"}
            </p>
          )}
        </section>
      </div>
    </div>
  );
}

function OptionRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 px-3 py-2.5">
      <span className="text-xs font-mono text-[var(--color-text-secondary)] shrink-0">{label}</span>
      {children}
    </div>
  );
}

function Segment<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string; title?: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <div className="inline-flex rounded border border-[var(--color-border)] overflow-hidden">
      {options.map((item) => {
        const active = item.value === value;
        return (
          <button
            key={item.value}
            type="button"
            title={item.title}
            onClick={() => onChange(item.value)}
            className={`px-2.5 py-1 text-xs font-mono ${
              active
                ? "bg-[var(--color-text)] text-[var(--color-bg)]"
                : "bg-white text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
            }`}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex items-center gap-1.5 text-[11px] font-mono text-[var(--color-text-tertiary)]">
      {label}
      <input
        type="color"
        value={value}
        aria-label={label}
        onChange={(e) => onChange(e.target.value)}
        className="h-7 w-9 cursor-pointer rounded border border-[var(--color-border)] bg-white p-0.5"
      />
    </label>
  );
}
