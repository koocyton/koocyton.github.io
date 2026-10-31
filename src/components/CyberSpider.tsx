"use client";

import { useEffect, useRef, useState } from "react";

type Point = { x: number; y: number };
type Mode = "idle" | "track" | "home" | "rest";

const STILL_TIME = 0.4;
const LASER_RANGE = 150;

const BODY = { x: -11, y: -4, w: 22, h: 8 };
const EYES = [
  { x: -3.8, y: -6.6 },
  { x: 3.8, y: -6.6 },
];

type Leg = {
  hip: Point;
  rest: Point;
  side: number;
  group: number;
  foot: Point;
  swing: number;
  from: Point;
  to: Point;
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

const PAIRS = [
  { hipY: -3.05, footX: 22, footY: -15 },
  { hipY: 1.05, footX: 27, footY: 5.5 },
  { hipY: 3.05, footX: 22, footY: 15 },
];

const LEGS: Array<Pick<Leg, "hip" | "rest" | "side" | "group">> = [-1, 1].flatMap((side) =>
  PAIRS.map((pair, index) => ({
    hip: { x: side * 11, y: pair.hipY },
    rest: { x: side * pair.footX, y: pair.footY },
    side,
    group: (index + (side < 0 ? 0 : 1)) % 2,
  })),
);

function makeLegs(origin: Point, heading: number): Leg[] {
  return LEGS.map((spec) => {
    const foot = toWorld(origin, heading, spec.rest);
    return { ...spec, foot, swing: -1, from: spec.rest, to: spec.rest };
  });
}

function mix(a: Point, b: Point, t: number): Point {
  return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) };
}

function outwardKnee(hip: Point, foot: Point, side: number): Point {
  const mx = lerp(hip.x, foot.x, 0.46);
  const my = lerp(hip.y, foot.y, 0.46);
  const dx = foot.x - hip.x;
  const dy = foot.y - hip.y;
  const len = Math.hypot(dx, dy) || 1;
  let px = -dy / len;
  let py = dx / len;
  if (px * side < 0) {
    px = -px;
    py = -py;
  }
  return { x: mx + px * 5.5, y: my + py * 5.5 };
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

function drawSpider(ctx: CanvasRenderingContext2D, origin: Point, heading: number, legs: Leg[], eyeColor: string) {
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
    const foot = reach > 32 ? mix(leg.hip, footRaw, 32 / reach) : footRaw;
    const knee = outwardKnee(leg.hip, foot, leg.side);
    ctx.beginPath();
    ctx.moveTo(leg.hip.x, leg.hip.y);
    ctx.lineTo(knee.x, knee.y);
    ctx.lineTo(foot.x, foot.y);
    ctx.stroke();
  }

  ctx.lineWidth = 1.35;
  ctx.strokeRect(BODY.x, BODY.y, BODY.w, BODY.h);
  ctx.fillStyle = eyeColor;
  for (const eye of EYES) {
    ctx.beginPath();
    ctx.arc(eye.x, eye.y, 1.45, 0, Math.PI * 2);
    ctx.fill();
  }
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

type Scorch = { x: number; y: number; seed: number; size: number };

function drawScorches(ctx: CanvasRenderingContext2D, marks: Scorch[]) {
  for (const mark of marks) {
    ctx.save();
    ctx.translate(mark.x, mark.y);
    const glow = ctx.createRadialGradient(0, 0, 1, 0, 0, mark.size);
    glow.addColorStop(0, "rgba(32, 18, 12, 0.78)");
    glow.addColorStop(0.38, "rgba(110, 48, 18, 0.42)");
    glow.addColorStop(0.72, "rgba(170, 96, 42, 0.16)");
    glow.addColorStop(1, "rgba(170, 96, 42, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, mark.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(24, 14, 8, 0.62)";
    ctx.lineWidth = 1;
    ctx.lineCap = "round";
    for (let i = 0; i < 4; i++) {
      const angle = mark.seed + i * 1.7;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * 1.4, Math.sin(angle) * 1.4);
      ctx.lineTo(Math.cos(angle + 0.45) * mark.size * 0.72, Math.sin(angle + 0.15) * mark.size * 0.68);
      ctx.stroke();
    }
    ctx.restore();
  }
}

function drawLaser(ctx: CanvasRenderingContext2D, from: Point, to: Point, time: number) {
  const flick = 0.72 + Math.sin(time * 46) * 0.28;
  ctx.save();
  ctx.lineCap = "round";
  ctx.strokeStyle = `rgba(255, 64, 24, ${0.38 * flick})`;
  ctx.lineWidth = 3.4;
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();
  ctx.strokeStyle = `rgba(255, 236, 214, ${0.92 * flick})`;
  ctx.lineWidth = 1.15;
  ctx.stroke();
  const burst = ctx.createRadialGradient(to.x, to.y, 0, to.x, to.y, 11);
  burst.addColorStop(0, "rgba(255, 248, 230, 0.95)");
  burst.addColorStop(0.45, "rgba(255, 110, 36, 0.55)");
  burst.addColorStop(1, "rgba(255, 80, 20, 0)");
  ctx.fillStyle = burst;
  ctx.beginPath();
  ctx.arc(to.x, to.y, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
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
    const scorches: Scorch[] = [];
    let scorchCool = 0;

    let mode: Mode = "idle";
    let seen = false;
    let outside = false;
    let lastMove = 0;
    let modeTime = 0;
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
      if (moved > 1.6) lastMove = performance.now();
      if (mode !== "track") enter("track");
    };

    const onLeave = (event: Event) => {
      const next = (event as PointerEvent).relatedTarget;
      if (next) return;
      outside = true;
      if (mode !== "idle" && mode !== "home" && mode !== "rest") enter("idle");
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

      const roaming = !seen || outside;
      if (!roaming && mode !== "track") enter("track");
      if (roaming && mode !== "home" && mode !== "rest") {
        if (untilHome > 0) untilHome -= dt;
        if (untilHome <= 0) enter("home");
      }
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
      } else if (mode === "track") {
        const d = Math.max(1, range);
        const ux = (mouse.x - spider.x) / d;
        const uy = (mouse.y - spider.y) / d;
        const hold = mouseStill ? 62 : 48;
        goalX = mouse.x - ux * hold;
        goalY = mouse.y - uy * hold;
        face = Math.atan2(mouse.y - spider.y, mouse.x - spider.x);
        maxSpeed = mouseStill ? 170 : 260;
      }

      const chasing = !roaming && mode === "track";
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
          leg.from = toLocal(spider, spider.heading, leg.foot);
          leg.to = { x: leg.rest.x, y: leg.rest.y - 5 };
          leg.swing = 0;
        }
      }
      for (const leg of legs) {
        if (leg.swing < 0) {
          if (speed < 10) {
            const rest = toWorld(spider, spider.heading, leg.rest);
            leg.foot = mix(leg.foot, rest, 1 - Math.exp(-dt * 10));
          }
          continue;
        }
        leg.swing = Math.min(1, leg.swing + dt / Math.max(0.08, stepSpan * 0.92));
        const t = easeInOut(leg.swing);
        const lift = Math.sin(Math.PI * t) * 4.5 * leg.side;
        leg.foot = toWorld(spider, spider.heading, {
          x: lerp(leg.from.x, leg.to.x, t) + lift,
          y: lerp(leg.from.y, leg.to.y, t),
        });
        if (leg.swing >= 1) {
          leg.foot = toWorld(spider, spider.heading, leg.to);
          leg.swing = -1;
        }
      }

      const found = seen && !outside;
      const close = found && range < LASER_RANGE;
      const aimError = Math.abs(angDiff(spider.heading, Math.atan2(mouse.y - spider.y, mouse.x - spider.x)));
      const laserHit = close && aimError < 0.4;
      const eyeColor = close ? "#e0232a" : found ? "#2f6fed" : "#161616";
      scorchCool -= dt;
      if (laserHit && scorchCool <= 0) {
        const lastMark = scorches[scorches.length - 1];
        if (!lastMark || dist(lastMark, mouse) > 14) {
          scorches.push({
            x: mouse.x,
            y: mouse.y,
            seed: Math.random() * Math.PI * 2,
            size: 12 + Math.random() * 8,
          });
          if (scorches.length > 40) scorches.shift();
          scorchCool = 0.08;
        }
      }

      ctx.clearRect(0, 0, width, height);
      drawWeb(ctx, width);
      drawScorches(ctx, scorches);
      if (laserHit) {
        for (const eye of EYES) {
          drawLaser(ctx, toWorld(spider, spider.heading, eye), mouse, time);
        }
      }
      drawSpider(ctx, spider, spider.heading, legs, eyeColor);
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
