"use client";

import { prepareWithSegments, layoutWithLines } from "@chenglou/pretext";
import { useEffect, useRef, useState } from "react";
import { isTipHitting, useLightsaber } from "./Lightsaber";

type Glyph = {
  ch: string;
  x: number;
  y: number;
  w: number;
  homeX: number;
  homeY: number;
  vx: number;
  vy: number;
  burned: boolean;
  burnT: number;
  alpha: number;
  rot: number;
  vr: number;
  alive: boolean;
};

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  hue: number;
  size: number;
};

const FONT =
  '400 15px "Noto Sans SC", "PingFang SC", "Hiragino Sans GB", sans-serif';
const LINE_HEIGHT = 26;

function graphemes(text: string): string[] {
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const seg = new Intl.Segmenter("zh", { granularity: "grapheme" });
    return Array.from(seg.segment(text), (s) => s.segment);
  }
  return Array.from(text);
}

function buildGlyphs(text: string, maxWidth: number): { glyphs: Glyph[]; height: number } {
  const prepared = prepareWithSegments(text, FONT, { wordBreak: "keep-all" });
  const { lines, height } = layoutWithLines(prepared, maxWidth, LINE_HEIGHT);

  const measure = document.createElement("canvas").getContext("2d");
  if (!measure) return { glyphs: [], height: LINE_HEIGHT };
  measure.font = FONT;

  const glyphs: Glyph[] = [];
  for (let li = 0; li < lines.length; li++) {
    let x = 0;
    const y = li * LINE_HEIGHT;
    for (const ch of graphemes(lines[li].text)) {
      const w = Math.max(measure.measureText(ch).width, 0.5);
      glyphs.push({
        ch,
        x,
        y,
        w,
        homeX: x,
        homeY: y,
        vx: 0,
        vy: 0,
        burned: false,
        burnT: 0,
        alpha: 1,
        rot: 0,
        vr: 0,
        alive: true,
      });
      x += w;
    }
  }
  return { glyphs, height: Math.max(height, LINE_HEIGHT) };
}

/** 仅剑尖靠近段落时才激活 */
function tipNearRect(blade: { x: number; y: number; tipR: number }, rect: DOMRect, pad: number) {
  return (
    blade.x > rect.left - pad - blade.tipR &&
    blade.x < rect.right + pad + blade.tipR &&
    blade.y > rect.top - pad - blade.tipR &&
    blade.y < rect.bottom + pad + blade.tipR
  );
}

export default function BurnableText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const { active, blade, tick, color } = useLightsaber();
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glyphsRef = useRef<Glyph[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef(0);
  const preparedWidthRef = useRef(0);
  const [engaged, setEngaged] = useState(false);
  const [box, setBox] = useState({ w: 0, h: 0 });

  // 光剑靠近段落时，才用 pretext 拆成可灼烧字形（按需，避免全页卡顿）
  useEffect(() => {
    if (!active) {
      const anyBurned = glyphsRef.current.some((g) => g.burned || !g.alive);
      if (!anyBurned) {
        setEngaged(false);
        glyphsRef.current = [];
        particlesRef.current = [];
        preparedWidthRef.current = 0;
      }
      return;
    }
    if (!blade || !wrapRef.current) return;
    const rect = wrapRef.current.getBoundingClientRect();
    if (!tipNearRect(blade, rect, 28)) return;

    const width = wrapRef.current.clientWidth;
    if (width < 40) return;

    if (!engaged || Math.abs(preparedWidthRef.current - width) > 12) {
      const { glyphs, height } = buildGlyphs(text, width);
      const prev = glyphsRef.current;
      if (prev.length === glyphs.length) {
        for (let i = 0; i < glyphs.length; i++) {
          if (prev[i].burned || !prev[i].alive) {
            glyphs[i] = {
              ...prev[i],
              homeX: glyphs[i].homeX,
              homeY: glyphs[i].homeY,
              w: glyphs[i].w,
            };
          }
        }
      }
      glyphsRef.current = glyphs;
      preparedWidthRef.current = width;
      setBox({ w: width, h: height });
      setEngaged(true);
    }

    // 刚拆字后立刻检测灼烧，避免多等一帧
    const hue = color === "red" ? 15 : color === "green" ? 90 : 35;
    for (const g of glyphsRef.current) {
      if (g.burned || !g.alive) continue;
      const cx = rect.left + g.x + g.w / 2;
      const cy = rect.top + g.y + LINE_HEIGHT * 0.55;
      if (isTipHitting(cx, cy, blade, 4)) {
        g.burned = true;
        g.burnT = 0;
        g.vx = (Math.random() - 0.5) * 3.5;
        g.vy = -1.2 - Math.random() * 2.4;
        g.vr = (Math.random() - 0.5) * 0.25;
        for (let i = 0; i < 4; i++) {
          particlesRef.current.push({
            x: g.x + g.w / 2,
            y: g.y + LINE_HEIGHT * 0.5,
            vx: (Math.random() - 0.5) * 2.8,
            vy: -Math.random() * 3.2 - 0.5,
            life: 0.6 + Math.random() * 0.5,
            hue,
            size: 1.2 + Math.random() * 2.4,
          });
        }
      }
    }
  }, [active, blade, tick, text, engaged, color]);

  // 已拆字后持续灼烧（仅剑尖）
  useEffect(() => {
    if (!active || !blade || !engaged || !wrapRef.current) return;
    const rect = wrapRef.current.getBoundingClientRect();
    if (!tipNearRect(blade, rect, 32)) return;

    const hue = color === "red" ? 15 : color === "green" ? 90 : 35;
    for (const g of glyphsRef.current) {
      if (g.burned || !g.alive) continue;
      const cx = rect.left + g.x + g.w / 2;
      const cy = rect.top + g.y + LINE_HEIGHT * 0.55;
      if (isTipHitting(cx, cy, blade, 4)) {
        g.burned = true;
        g.burnT = 0;
        g.vx = (Math.random() - 0.5) * 3.5;
        g.vy = -1.2 - Math.random() * 2.4;
        g.vr = (Math.random() - 0.5) * 0.25;
        for (let i = 0; i < 5; i++) {
          particlesRef.current.push({
            x: g.x + g.w / 2,
            y: g.y + LINE_HEIGHT * 0.5,
            vx: (Math.random() - 0.5) * 2.8,
            vy: -Math.random() * 3.2 - 0.5,
            life: 0.6 + Math.random() * 0.5,
            hue,
            size: 1.2 + Math.random() * 2.4,
          });
        }
      }
    }
  }, [active, blade, tick, engaged, color]);

  // 渲染循环
  useEffect(() => {
    if (!engaged) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const { w, h } = box;
    canvas.width = Math.max(1, Math.floor(w * dpr));
    canvas.height = Math.max(1, Math.floor(h * dpr));
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const step = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.font = FONT;
      ctx.textBaseline = "top";

      for (const g of glyphsRef.current) {
        if (!g.alive && g.alpha <= 0.02) continue;

        if (g.burned) {
          g.burnT += 0.035;
          g.x += g.vx;
          g.y += g.vy;
          g.vy += 0.12;
          g.rot += g.vr;
          g.alpha = Math.max(0, 1 - g.burnT);
          if (g.alpha <= 0.02) g.alive = false;

          ctx.save();
          ctx.translate(g.x + g.w / 2, g.y + LINE_HEIGHT / 2);
          ctx.rotate(g.rot);
          ctx.globalAlpha = g.alpha;
          const heat = Math.min(1, g.burnT * 2);
          ctx.fillStyle = heat < 0.45 ? "#ffe9a8" : heat < 0.75 ? "#ff7a18" : "#3a1a08";
          ctx.shadowColor = "#ff6a00";
          ctx.shadowBlur = 8 * (1 - heat);
          ctx.fillText(g.ch, -g.w / 2, -LINE_HEIGHT / 2 + 2);
          ctx.restore();
        } else {
          ctx.globalAlpha = 1;
          ctx.shadowBlur = 0;
          ctx.fillStyle = "rgba(236, 228, 210, 0.92)";
          ctx.fillText(g.ch, g.x, g.y + 2);
        }
      }

      const next: Particle[] = [];
      for (const p of particlesRef.current) {
        p.life -= 0.028;
        if (p.life <= 0) continue;
        p.x += p.vx;
        p.y += p.vy;
        p.vy -= 0.04;
        ctx.beginPath();
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = `hsl(${p.hue} 100% ${55 + p.life * 25}%)`;
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        next.push(p);
      }
      particlesRef.current = next;
      ctx.globalAlpha = 1;

      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [engaged, box]);

  if (!engaged) {
    return (
      <div ref={wrapRef} className={className}>
        <p className="sw-para">{text}</p>
      </div>
    );
  }

  return (
    <div
      ref={wrapRef}
      className={className}
      style={{ position: "relative", height: box.h || undefined }}
    >
      <canvas
        ref={canvasRef}
        className="sw-burn-canvas"
        aria-hidden
        style={{ display: "block", width: "100%", height: box.h }}
      />
      <p className="sr-only">{text}</p>
    </div>
  );
}
