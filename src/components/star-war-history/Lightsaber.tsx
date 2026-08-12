"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

export type BladeSeg = {
  /** tip */
  x: number;
  y: number;
  /** handle / base */
  bx: number;
  by: number;
  /** half thickness for hit test */
  halfW: number;
};

type LightsaberCtx = {
  active: boolean;
  color: "blue" | "green" | "red";
  blade: BladeSeg | null;
  toggle: () => void;
  setColor: (c: "blue" | "green" | "red") => void;
  /** 供 BurnableText 订阅：刃移动时递增 */
  tick: number;
};

const Ctx = createContext<LightsaberCtx | null>(null);

export function useLightsaber() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useLightsaber must be used within LightsaberProvider");
  return v;
}

const COLORS = {
  blue: { core: "#c8e7ff", glow: "#4da3ff", mid: "#1a6dff" },
  green: { core: "#d4ffe0", glow: "#3dff8a", mid: "#12b85a" },
  red: { core: "#ffd0d0", glow: "#ff3b3b", mid: "#c01010" },
} as const;

function distToSegment(px: number, py: number, x1: number, y1: number, x2: number, y2: number) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len2 = dx * dx + dy * dy || 1;
  let t = ((px - x1) * dx + (py - y1) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  const cx = x1 + t * dx;
  const cy = y1 + t * dy;
  return Math.hypot(px - cx, py - cy);
}

/** 点到光剑刃的距离（屏幕坐标） */
export function distanceToBlade(px: number, py: number, blade: BladeSeg) {
  return distToSegment(px, py, blade.bx, blade.by, blade.x, blade.y);
}

export function LightsaberProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState(false);
  const [color, setColor] = useState<"blue" | "green" | "red">("blue");
  const [blade, setBlade] = useState<BladeSeg | null>(null);
  const [tick, setTick] = useState(0);
  const tipRef = useRef({ x: 0, y: 0 });
  const angleRef = useRef(-0.55);
  const velRef = useRef({ x: 0, y: 0 });

  const toggle = useCallback(() => setActive((v) => !v), []);

  useEffect(() => {
    if (!active) {
      setBlade(null);
      document.body.style.cursor = "";
      return;
    }
    document.body.style.cursor = "none";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(false);
    };
    window.addEventListener("keydown", onKey);

    const BLADE_LEN = 168;
    const onMove = (e: PointerEvent) => {
      const prev = tipRef.current;
      const vx = e.clientX - prev.x;
      const vy = e.clientY - prev.y;
      velRef.current = { x: vx, y: vy };
      tipRef.current = { x: e.clientX, y: e.clientY };

      const speed = Math.hypot(vx, vy);
      if (speed > 0.8) {
        const target = Math.atan2(vy, vx);
        // 刃朝运动方向略偏，保留挥舞感
        let diff = target - angleRef.current;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        angleRef.current += diff * 0.18;
      }

      const ang = angleRef.current;
      const tipX = e.clientX + Math.cos(ang) * 8;
      const tipY = e.clientY + Math.sin(ang) * 8;
      const bx = tipX - Math.cos(ang) * BLADE_LEN;
      const by = tipY - Math.sin(ang) * BLADE_LEN;

      setBlade({ x: tipX, y: tipY, bx, by, halfW: 14 });
      setTick((t) => t + 1);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("keydown", onKey);
      document.body.style.cursor = "";
    };
  }, [active]);

  const value = useMemo(
    () => ({ active, color, blade, toggle, setColor, tick }),
    [active, color, blade, toggle, tick]
  );

  return (
    <Ctx.Provider value={value}>
      {children}
      {active && blade && <LightsaberCursor blade={blade} color={color} />}
      <LightsaberDock
        active={active}
        color={color}
        onToggle={toggle}
        onColor={setColor}
      />
    </Ctx.Provider>
  );
}

function LightsaberCursor({
  blade,
  color,
}: {
  blade: BladeSeg;
  color: keyof typeof COLORS;
}) {
  const c = COLORS[color];
  const ang = (Math.atan2(blade.y - blade.by, blade.x - blade.bx) * 180) / Math.PI;
  const len = Math.hypot(blade.x - blade.bx, blade.y - blade.by);
  const left = Math.min(blade.x, blade.bx);
  const top = Math.min(blade.y, blade.by);

  return (
    <div
      aria-hidden
      className="sw-saber-cursor"
      style={{
        position: "fixed",
        left,
        top,
        width: len,
        height: 0,
        pointerEvents: "none",
        zIndex: 10000,
        transform: `rotate(${ang}deg)`,
        transformOrigin: "0 0",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: -5,
          width: len * 0.18,
          height: 10,
          borderRadius: 2,
          background:
            "linear-gradient(90deg, #2a2a2a 0%, #6a6a6a 35%, #c9a227 55%, #6a6a6a 75%, #222 100%)",
          boxShadow: "0 0 6px rgba(0,0,0,0.5)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: len * 0.16,
          top: -7,
          width: len * 0.84,
          height: 14,
          borderRadius: 7,
          background: `linear-gradient(180deg, ${c.glow}, ${c.core} 40%, ${c.mid} 70%, ${c.glow})`,
          boxShadow: `0 0 10px ${c.glow}, 0 0 28px ${c.glow}, 0 0 48px ${c.mid}`,
          filter: "saturate(1.2)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: len * 0.18,
          top: -2,
          width: len * 0.8,
          height: 4,
          borderRadius: 2,
          background: c.core,
          opacity: 0.95,
        }}
      />
    </div>
  );
}

function LightsaberDock({
  active,
  color,
  onToggle,
  onColor,
}: {
  active: boolean;
  color: keyof typeof COLORS;
  onToggle: () => void;
  onColor: (c: "blue" | "green" | "red") => void;
}) {
  const c = COLORS[color];
  return (
    <div className="sw-saber-dock">
      {active && (
        <div className="sw-saber-colors" role="group" aria-label="光剑颜色">
          {(["blue", "green", "red"] as const).map((key) => (
            <button
              key={key}
              type="button"
              className={`sw-saber-chip ${color === key ? "is-on" : ""}`}
              style={{ "--chip": COLORS[key].glow } as CSSProperties}
              onClick={() => onColor(key)}
              aria-label={key}
            />
          ))}
        </div>
      )}
      <button
        type="button"
        className={`sw-saber-btn ${active ? "is-on" : ""}`}
        onClick={onToggle}
        aria-pressed={active}
        title={active ? "收回光剑" : "抽出光剑"}
      >
        <span className="sw-saber-btn-glow" style={{ background: c.glow }} />
        <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden>
          <rect x="12.2" y="14" width="3.6" height="10" rx="1" fill="#8a8a8a" />
          <rect x="11" y="13" width="6" height="2.2" rx="0.6" fill="#c9a227" />
          <rect
            x="12.5"
            y="2"
            width="3"
            height="12"
            rx="1.5"
            fill={active ? c.core : "#555"}
            style={{
              filter: active ? `drop-shadow(0 0 4px ${c.glow})` : undefined,
            }}
          />
        </svg>
        <span className="sw-saber-btn-label">{active ? "熄灭" : "光剑"}</span>
      </button>
      {active && <p className="sw-saber-hint">挥动光剑灼烧文字 · Esc 退出</p>}
    </div>
  );
}
