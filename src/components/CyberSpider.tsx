"use client";

import { useEffect, useRef, useState } from "react";

type Point = { x: number; y: number };
type Mode = "idle" | "track" | "aim" | "shoot" | "wrap" | "observe" | "snap" | "home" | "rest";

const AIM_TIME = 0.22;
const SHOOT_TIME = 0.32;
const WRAP_TIME = 0.9;
const SNAP_TIME = 0.36;
const STILL_TIME = 0.4;
const CATCH_RANGE = 180;
const ESCAPE_DISTANCE = 28;

const L1 = 14;
const L2 = 16;
const BODY = { x: -11, y: -4, w: 22, h: 8 };

type Leg = {
  hip: Point;
  rest: Point;
  group: number;
  bend: number;
  arc: number;
  swing: number;
  foot: Point;
  swingFrom: Point;
  swingTo: Point;
};

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function dist(a: Point, b: Point) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function angDiff(from: number, to: number) {
  let d = to - from;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

function easeOut(t: number) {
  return 1 - (1 - t) * (1 - t);
}

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - ((-2 * t + 2) * (-2 * t + 2)) / 2;
}

function toLocal(origin: Point, heading: number, p: Point): Point {
  const a = heading + Math.PI / 2;
  const c = Math.cos(a);
  const s = Math.sin(a);
  const dx = p.x - origin.x;
  const dy = p.y - origin.y;
  return { x: dx * c + dy * s, y: -dx * s + dy * c };
}

function polar(angle: number, radius: number): Point {
  return { x: Math.sin(angle) * radius, y: -Math.cos(angle) * radius };
}

const LEGS: Array<{ hip: Point; rest: Point; group: number }> = [-2.55, -1.9, -1.2, -0.45, 0.45, 1.2, 1.9, 2.55].map(
  (angle, index) => ({
    hip: polar(angle, 8),
    rest: polar(angle, 20),
    group: index % 2,
  }),
);

function makeLegs(origin: Point, heading: number): Leg[] {
  return LEGS.map((spec) => {
    const foot = toWorld(origin, heading, spec.rest);
    return { ...spec, bend: spec.rest.x >= 0 ? 1 : -1, arc: 1, swing: -1, foot, swingFrom: foot, swingTo: foot };
  });
}

function mix(a: Point, b: Point, t: number): Point {
  return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) };
}

function toWorld(origin: Point, heading: number, p: Point): Point {
  const a = heading + Math.PI / 2;
  const c = Math.cos(a);
  const s = Math.sin(a);
  return {
    x: origin.x + p.x * c - p.y * s,
    y: origin.y + p.x * s + p.y * c,
  };
}

function drawSpider(ctx: CanvasRenderingContext2D, origin: Point, heading: number, legs: Leg[]) {
  ctx.save();
  ctx.translate(origin.x, origin.y);
  ctx.rotate(heading + Math.PI / 2);
  ctx.strokeStyle = "#161616";
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = 1.25;

  for (const leg of legs) {
    const footRaw = toLocal(origin, heading, leg.foot);
    const reach = Math.hypot(footRaw.x - leg.hip.x, footRaw.y - leg.hip.y) || 0.001;
    const limit = L1 + L2;
    const foot = reach > limit ? mix(leg.hip, footRaw, limit / reach) : footRaw;
    const dx = foot.x - leg.hip.x;
    const dy = foot.y - leg.hip.y;
    const len = Math.hypot(dx, dy) || 1;
    const px = -dy / len;
    const py = dx / len;
    const mid = { x: (leg.hip.x + foot.x) / 2, y: (leg.hip.y + foot.y) / 2 };
    const left = { x: mid.x + px * 6, y: mid.y + py * 6 };
    const right = { x: mid.x - px * 6, y: mid.y - py * 6 };
    const prefer = leg.bend >= 0 ? left : right;
    const other = leg.bend >= 0 ? right : left;
    const spread = (p: Point) => p.x * p.x + p.y * p.y;
    const knee = spread(other) > spread(prefer) + 70 ? other : prefer;
    leg.bend = knee === left ? 1 : -1;
    ctx.beginPath();
    ctx.moveTo(leg.hip.x, leg.hip.y);
    ctx.lineTo(knee.x, knee.y);
    ctx.lineTo(foot.x, foot.y);
    ctx.stroke();
  }

  ctx.lineWidth = 1.35;
  ctx.strokeRect(BODY.x, BODY.y, BODY.w, BODY.h);
  ctx.restore();
}

function webPerch(width: number): Point {
  return { x: Math.max(64, width - 92), y: 74 };
}

function drawWeb(ctx: CanvasRenderingContext2D, width: number) {
  const ox = width - 2;
  const oy = 0;
  const maxR = 158;
  ctx.save();
  ctx.translate(ox, oy);
  ctx.lineCap = "round";
  ctx.strokeStyle = "rgba(96, 86, 74, 0.38)";
  ctx.lineWidth = 1;

  const spokes = 8;
  for (let i = 0; i < spokes; i++) {
    if (i === 2 || i === 6) continue;
    const ang = Math.PI / 2 + (i / (spokes - 1)) * (Math.PI / 2) + Math.sin(i * 1.7) * 0.03;
    const len = maxR * (0.78 + ((i * 5) % 3) * 0.07);
    ctx.beginPath();
    ctx.moveTo(4, 2);
    ctx.lineTo(Math.cos(ang) * len, Math.sin(ang) * len);
    ctx.stroke();
  }

  for (let ring = 1; ring <= 5; ring++) {
    const rad = (ring / 5) * maxR * 0.9 + Math.sin(ring * 2.1) * 2;
    const gap = ring === 3 ? 0.42 : ring === 5 ? 0.28 : 0.05;
    ctx.beginPath();
    ctx.arc(0, 0, rad, Math.PI / 2 + ring * 0.04, Math.PI - gap);
    ctx.stroke();
  }

  ctx.strokeStyle = "rgba(96, 86, 74, 0.28)";
  ctx.beginPath();
  ctx.moveTo(-48, 78);
  ctx.quadraticCurveTo(-36, 118, -58, 132);
  ctx.stroke();
  ctx.restore();
}

function drawSilk(ctx: CanvasRenderingContext2D, from: Point, target: Point, reach: number, time: number, wrapped: boolean) {
  const tip = {
    x: lerp(from.x, target.x, reach),
    y: lerp(from.y, target.y, reach),
  };
  ctx.strokeStyle = "#2f6fed";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(tip.x, tip.y);
  ctx.stroke();

  if (!wrapped) return;
  const radius = 14 + Math.sin(time * 3) * 2;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = time * 1.4 + (i / 6) * Math.PI * 2;
    const b = a + 0.7;
    ctx.moveTo(target.x + Math.cos(a) * radius, target.y + Math.sin(a) * radius);
    ctx.lineTo(target.x + Math.cos(b) * (radius - 6), target.y + Math.sin(b) * (radius - 6));
  }
  ctx.stroke();
}

export default function CyberSpider() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setActive(fine.matches && !reduce.matches);
    update();
    fine.addEventListener("change", update);
    reduce.addEventListener("change", update);
    return () => {
      fine.removeEventListener("change", update);
      reduce.removeEventListener("change", update);
    };
  }, []);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const spider = { x: 120, y: 120, heading: 0, vx: 0, vy: 0 };
    const mouse = { x: 120, y: 120 };
    const capture = { x: 120, y: 120 };
    let wander = { x: 180, y: 160 };
    let untilHome = 10;
    let wanderAge = 0;

    const pickWander = () => {
      const margin = 72;
      wander = {
        x: margin + Math.random() * Math.max(48, width - margin * 2),
        y: margin + Math.random() * Math.max(48, height - margin * 2),
      };
      wanderAge = 0;
    };
    let legs = makeLegs(spider, spider.heading);
    let gait = 0;
    let stepGroup = -1;

    let mode: Mode = "idle";
    let seen = false;
    let outside = false;
    let lastMove = 0;
    let modeTime = 0;
    let observeTime = 0;
    let perch = 0;
    let time = 0;
    let last = performance.now();
    let raf = 0;
    let width = 1;
    let height = 1;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!seen) {
        spider.x = width - 110;
        spider.y = height - 90;
        legs = makeLegs(spider, spider.heading);
      }
    };

    const enter = (next: Mode) => {
      mode = next;
      modeTime = 0;
      if (next === "observe") {
        observeTime = 0;
        perch = Math.atan2(spider.y - capture.y, spider.x - capture.x);
      }
    };

    const onPointer = (event: PointerEvent) => {
      if (event.pointerType && event.pointerType !== "mouse") return;
      const moved = Math.hypot(event.clientX - mouse.x, event.clientY - mouse.y);
      mouse.x = event.clientX;
      mouse.y = event.clientY;
      outside = false;
      if (!seen) {
        seen = true;
        mode = "track";
        lastMove = performance.now();
        return;
      }
      if (moved > 1.6) {
        lastMove = performance.now();
        if (mode === "home" || mode === "rest") {
          untilHome = 14;
          enter("track");
        } else if (mode !== "track" && mode !== "snap" && mode !== "idle" && dist(mouse, capture) > ESCAPE_DISTANCE) {
          if (mode === "aim") enter("track");
          else enter("snap");
        }
      }
    };

    const onLeave = (event: Event) => {
      const next = (event as PointerEvent).relatedTarget;
      if (next) return;
      outside = true;
      if (mode !== "idle" && mode !== "track" && mode !== "home" && mode !== "rest") enter("track");
      pickWander();
    };

    resize();
    pickWander();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointer);
    document.documentElement.addEventListener("pointerleave", onLeave);
    document.addEventListener("mouseleave", onLeave);

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (document.hidden) return;
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;
      time += dt;
      modeTime += dt;

      const mouseStill = seen && !outside && now - lastMove > STILL_TIME * 1000;
      const range = dist(spider, mouse);

      if (mode === "track" && mouseStill && range < CATCH_RANGE) {
        capture.x = mouse.x;
        capture.y = mouse.y;
        enter("aim");
      } else if (mode === "aim" && modeTime >= AIM_TIME) {
        enter("shoot");
      } else if (mode === "shoot" && modeTime >= SHOOT_TIME) {
        enter("wrap");
      } else if (mode === "wrap" && modeTime >= WRAP_TIME) {
        enter("observe");
      } else if (mode === "snap" && modeTime >= SNAP_TIME) {
        enter("track");
      }

      const roaming = !seen || outside;
      if (roaming && mode !== "idle" && mode !== "track" && mode !== "home" && mode !== "rest") enter("track");
      if ((mode === "track" || mode === "idle" || mode === "snap") && untilHome > 0) untilHome -= dt;
      if (untilHome <= 0 && (mode === "track" || mode === "idle" || mode === "snap")) enter("home");
      if (mode === "home" && dist(spider, webPerch(width)) < 16) enter("rest");
      if (mode === "rest" && modeTime > 7) {
        untilHome = 16 + Math.random() * 8;
        enter(roaming ? "idle" : "track");
      }

      let goalX = spider.x;
      let goalY = spider.y;
      let face = spider.heading;
      let maxSpeed = 110;

      if (mode === "home" || mode === "rest") {
        const perch = webPerch(width);
        goalX = perch.x;
        goalY = perch.y;
        face = mode === "rest" ? Math.atan2(0.45, -1) : Math.atan2(perch.y - spider.y, perch.x - spider.x);
        maxSpeed = mode === "rest" ? 24 : 130;
      } else if (roaming) {
        wanderAge += dt;
        if (dist(spider, wander) < 28 || wanderAge > 5) pickWander();
        goalX = wander.x;
        goalY = wander.y;
        face = Math.atan2(wander.y - spider.y, wander.x - spider.x);
        maxSpeed = 70;
      } else if (mode === "track" || mode === "snap") {
        const d = Math.max(1, range);
        const ux = (mouse.x - spider.x) / d;
        const uy = (mouse.y - spider.y) / d;
        const hold = mouseStill ? 62 : 48;
        goalX = mouse.x - ux * hold;
        goalY = mouse.y - uy * hold;
        face = Math.atan2(mouse.y - spider.y, mouse.x - spider.x);
        maxSpeed = mouseStill ? 170 : 260;
      } else if (mode === "aim" || mode === "shoot" || mode === "wrap") {
        const d = Math.max(1, dist(spider, capture));
        const ux = (capture.x - spider.x) / d;
        const uy = (capture.y - spider.y) / d;
        goalX = capture.x - ux * 74;
        goalY = capture.y - uy * 74;
        face = Math.atan2(capture.y - spider.y, capture.x - spider.x);
        maxSpeed = 180;
      } else if (mode === "observe") {
        observeTime += dt;
        const sway = observeTime * 0.7;
        const lean = 78;
        goalX = capture.x + Math.cos(perch + sway) * lean;
        goalY = capture.y + Math.sin(perch + sway) * lean;
        face = Math.atan2(capture.y - spider.y, capture.x - spider.x);
        maxSpeed = 80;
      }

      const chasing = !roaming && (mode === "track" || mode === "snap");
      const toGoal = Math.hypot(goalX - spider.x, goalY - spider.y);
      if (toGoal > 0.8) {
        const sp = Math.min(maxSpeed, toGoal * (chasing ? 8 : 4));
        const blend = 1 - Math.exp(-dt * (chasing ? 10 : 6));
        spider.vx = lerp(spider.vx, ((goalX - spider.x) / toGoal) * sp, blend);
        spider.vy = lerp(spider.vy, ((goalY - spider.y) / toGoal) * sp, blend);
      } else {
        const damp = Math.exp(-dt * 8);
        spider.vx *= damp;
        spider.vy *= damp;
      }
      spider.x = clamp(spider.x + spider.vx * dt, 36, width - 36);
      spider.y = clamp(spider.y + spider.vy * dt, 36, height - 36);
      spider.heading += angDiff(spider.heading, face) * Math.min(1, dt * (chasing ? 9 : 4.5));

      const speed = Math.hypot(spider.vx, spider.vy);
      const stepSpan = clamp(10 / Math.max(speed, 55), 0.09, 0.2);
      if (speed > 14) gait += dt / stepSpan;
      const group = Math.floor(gait) % 2;
      if (speed > 14 && group !== stepGroup) {
        stepGroup = group;
        for (const leg of legs) {
          if (leg.group !== group || leg.swing >= 0) continue;
          const goal = toWorld(spider, spider.heading, { x: leg.rest.x, y: leg.rest.y - 5 });
          if (dist(leg.foot, goal) < 3) continue;
          leg.swingFrom = { ...leg.foot };
          leg.swingTo = goal;
          const sx = goal.x - leg.foot.x;
          const sy = goal.y - leg.foot.y;
          const sl = Math.hypot(sx, sy) || 1;
          const px = -sy / sl;
          const py = sx / sl;
          const mid = mix(leg.foot, goal, 0.5);
          const left = { x: mid.x + px, y: mid.y + py };
          const right = { x: mid.x - px, y: mid.y - py };
          leg.arc = dist(left, spider) >= dist(right, spider) ? 1 : -1;
          leg.swing = 0;
        }
      }
      for (const leg of legs) {
        if (leg.swing < 0) {
          const local = toLocal(spider, spider.heading, leg.foot);
          if (dist(local, leg.rest) > 20) {
            leg.swingFrom = { ...leg.foot };
            leg.swingTo = toWorld(spider, spider.heading, { x: leg.rest.x, y: leg.rest.y - 5 });
            leg.arc = leg.rest.x >= 0 ? 1 : -1;
            leg.swing = 0;
          }
          continue;
        }
        leg.swing = Math.min(1, leg.swing + dt / Math.max(0.08, stepSpan * 0.92));
        const t = easeInOut(leg.swing);
        const base = mix(leg.swingFrom, leg.swingTo, t);
        const sx = leg.swingTo.x - leg.swingFrom.x;
        const sy = leg.swingTo.y - leg.swingFrom.y;
        const sl = Math.hypot(sx, sy) || 1;
        const arc = Math.sin(Math.PI * t) * 4.5;
        leg.foot = {
          x: base.x + (-sy / sl) * leg.arc * arc,
          y: base.y + (sx / sl) * leg.arc * arc,
        };
        if (leg.swing >= 1) {
          leg.foot = { ...leg.swingTo };
          leg.swing = -1;
        }
      }

      const silk =
        mode === "aim"
          ? 0.2
          : mode === "shoot"
            ? easeOut(clamp(modeTime / SHOOT_TIME, 0, 1))
            : mode === "wrap" || mode === "observe"
              ? 1
              : mode === "snap"
                ? Math.max(0, 1 - modeTime / SNAP_TIME)
                : 0;

      ctx.clearRect(0, 0, width, height);
      drawWeb(ctx, width);
      if (silk > 0) {
        const from = toWorld(spider, spider.heading, { x: 0, y: -4 });
        drawSilk(ctx, from, capture, silk, time, mode === "wrap" || mode === "observe");
      }
      drawSpider(ctx, spider, spider.heading, legs);
    };

    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointer);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, [active]);

  if (!active) return null;

  return <canvas ref={canvasRef} aria-hidden className="pointer-events-none fixed inset-0 z-[70]" />;
}
