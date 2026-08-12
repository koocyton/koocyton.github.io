"use client";

import { useEffect, useRef } from "react";

/** 缓慢漂移的星空背景 */
export default function Starfield() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let w = 0;
    let h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    type Star = { x: number; y: number; z: number; s: number; tw: number };
    let stars: Star[] = [];

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(220, Math.floor((w * h) / 9000));
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        z: 0.2 + Math.random() * 0.8,
        s: 0.4 + Math.random() * 1.6,
        tw: Math.random() * Math.PI * 2,
      }));
    };

    resize();
    window.addEventListener("resize", resize);

    const tick = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      for (const star of stars) {
        star.y += 0.015 + star.z * 0.04;
        if (star.y > h + 2) {
          star.y = -2;
          star.x = Math.random() * w;
        }
        const twinkle = 0.45 + 0.55 * Math.sin(t * 0.002 + star.tw);
        ctx.beginPath();
        ctx.fillStyle = `rgba(255,245,220,${0.25 + twinkle * 0.55 * star.z})`;
        ctx.arc(star.x, star.y, star.s * star.z, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={ref} className="sw-starfield" aria-hidden />;
}
