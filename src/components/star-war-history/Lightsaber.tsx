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
  /** 剑尖（灼烧点） */
  x: number;
  y: number;
  /** 剑柄 */
  bx: number;
  by: number;
  /** 剑尖命中半径 */
  tipR: number;
  /** 挥动速度（px/frame 量级），供音效用 */
  speed: number;
};

type LightsaberCtx = {
  active: boolean;
  color: "blue" | "green" | "red";
  blade: BladeSeg | null;
  toggle: () => void;
  setColor: (c: "blue" | "green" | "red") => void;
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

const HANDLE_LEN = 34;
const BLADE_LEN = 148;
const TIP_HIT_R = 16;

/** 仅剑尖（头部）命中检测 */
export function distanceToBladeTip(px: number, py: number, blade: BladeSeg) {
  return Math.hypot(px - blade.x, py - blade.y);
}

export function isTipHitting(
  px: number,
  py: number,
  blade: BladeSeg,
  pad = 0
) {
  return distanceToBladeTip(px, py, blade) <= blade.tipR + pad;
}

/** Web Audio 合成光剑嗡嗡 / 挥舞声 */
class SaberAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private humGain: GainNode | null = null;
  private humOscA: OscillatorNode | null = null;
  private humOscB: OscillatorNode | null = null;
  private noiseGain: GainNode | null = null;
  private swingGain: GainNode | null = null;
  private swingFilter: BiquadFilterNode | null = null;
  private started = false;
  private lastWhoosh = 0;

  private ensure() {
    if (this.ctx) return this.ctx;
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.22;
    this.master.connect(this.ctx.destination);
    return this.ctx;
  }

  async start() {
    const ctx = this.ensure();
    if (ctx.state === "suspended") await ctx.resume();
    if (this.started) return;
    this.started = true;

    const master = this.master!;
    const t = ctx.currentTime;

    // 持续低鸣
    this.humGain = ctx.createGain();
    this.humGain.gain.setValueAtTime(0.0001, t);
    this.humGain.gain.exponentialRampToValueAtTime(0.35, t + 0.18);
    this.humGain.connect(master);

    this.humOscA = ctx.createOscillator();
    this.humOscA.type = "sawtooth";
    this.humOscA.frequency.value = 62;
    const humFilter = ctx.createBiquadFilter();
    humFilter.type = "lowpass";
    humFilter.frequency.value = 280;
    humFilter.Q.value = 0.7;
    this.humOscA.connect(humFilter);
    humFilter.connect(this.humGain);
    this.humOscA.start();

    this.humOscB = ctx.createOscillator();
    this.humOscB.type = "square";
    this.humOscB.frequency.value = 93;
    const humBGain = ctx.createGain();
    humBGain.gain.value = 0.12;
    this.humOscB.connect(humBGain);
    humBGain.connect(this.humGain);
    this.humOscB.start();

    // 细噪沙沙
    const noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const data = noiseBuf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuf;
    noise.loop = true;
    const nFilter = ctx.createBiquadFilter();
    nFilter.type = "bandpass";
    nFilter.frequency.value = 900;
    nFilter.Q.value = 0.6;
    this.noiseGain = ctx.createGain();
    this.noiseGain.gain.value = 0.045;
    noise.connect(nFilter);
    nFilter.connect(this.noiseGain);
    this.noiseGain.connect(master);
    noise.start();

    // 挥舞 whoosh 通道
    this.swingFilter = ctx.createBiquadFilter();
    this.swingFilter.type = "bandpass";
    this.swingFilter.frequency.value = 700;
    this.swingFilter.Q.value = 1.2;
    this.swingGain = ctx.createGain();
    this.swingGain.gain.value = 0.0001;
    const swingNoise = ctx.createBufferSource();
    swingNoise.buffer = noiseBuf;
    swingNoise.loop = true;
    swingNoise.connect(this.swingFilter);
    this.swingFilter.connect(this.swingGain);
    this.swingGain.connect(master);
    swingNoise.start();
  }

  /** 随挥动速度调制音高与音量 */
  updateSwing(speed: number) {
    if (!this.ctx || !this.started || !this.humOscA || !this.humGain) return;
    const t = this.ctx.currentTime;
    const n = Math.min(1, speed / 42);
    const humVol = 0.28 + n * 0.45;
    this.humGain.gain.setTargetAtTime(humVol, t, 0.05);
    this.humOscA.frequency.setTargetAtTime(58 + n * 70, t, 0.04);
    if (this.humOscB) this.humOscB.frequency.setTargetAtTime(88 + n * 95, t, 0.04);
    if (this.noiseGain) {
      this.noiseGain.gain.setTargetAtTime(0.04 + n * 0.08, t, 0.05);
    }
    if (this.swingGain && this.swingFilter) {
      this.swingFilter.frequency.setTargetAtTime(500 + n * 1600, t, 0.03);
      this.swingGain.gain.setTargetAtTime(0.0001 + n * 0.55, t, 0.03);
    }

    // 快速挥砍时叠一声短促 whoosh
    if (speed > 28 && t - this.lastWhoosh > 0.16) {
      this.lastWhoosh = t;
      this.playWhoosh(n);
    }
  }

  private playWhoosh(intensity: number) {
    if (!this.ctx || !this.master) return;
    const ctx = this.ctx;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(180 + intensity * 220, t);
    osc.frequency.exponentialRampToValueAtTime(70, t + 0.22);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.2 * intensity, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.24);
    const f = ctx.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.setValueAtTime(1400, t);
    f.frequency.exponentialRampToValueAtTime(280, t + 0.22);
    osc.connect(f);
    f.connect(g);
    g.connect(this.master);
    osc.start(t);
    osc.stop(t + 0.26);
  }

  stop() {
    if (!this.ctx || !this.started) return;
    const t = this.ctx.currentTime;
    try {
      this.humGain?.gain.cancelScheduledValues(t);
      this.humGain?.gain.setTargetAtTime(0.0001, t, 0.04);
      this.swingGain?.gain.setTargetAtTime(0.0001, t, 0.04);
      this.noiseGain?.gain.setTargetAtTime(0.0001, t, 0.04);
    } catch {
      /* ignore */
    }
    window.setTimeout(() => {
      try {
        this.humOscA?.stop();
        this.humOscB?.stop();
      } catch {
        /* ignore */
      }
      this.humOscA = null;
      this.humOscB = null;
      this.humGain = null;
      this.noiseGain = null;
      this.swingGain = null;
      this.swingFilter = null;
      this.started = false;
      void this.ctx?.close();
      this.ctx = null;
      this.master = null;
    }, 120);
  }
}

export function LightsaberProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState(false);
  const [color, setColor] = useState<"blue" | "green" | "red">("blue");
  const [blade, setBlade] = useState<BladeSeg | null>(null);
  const [tick, setTick] = useState(0);
  const mouseRef = useRef({ x: 0, y: 0 });
  const angleRef = useRef(-0.7);
  const audioRef = useRef<SaberAudio | null>(null);

  if (!audioRef.current) audioRef.current = new SaberAudio();

  const toggle = useCallback(() => {
    setActive((v) => {
      const next = !v;
      if (next) void audioRef.current?.start();
      else audioRef.current?.stop();
      return next;
    });
  }, []);

  useEffect(() => {
    if (!active) {
      setBlade(null);
      document.body.style.cursor = "";
      audioRef.current?.stop();
      return;
    }
    document.body.style.cursor = "none";
    void audioRef.current?.start();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActive(false);
        audioRef.current?.stop();
      }
    };
    window.addEventListener("keydown", onKey);

    const onMove = (e: PointerEvent) => {
      const prev = mouseRef.current;
      const vx = e.clientX - prev.x;
      const vy = e.clientY - prev.y;
      const speed = Math.hypot(vx, vy);
      mouseRef.current = { x: e.clientX, y: e.clientY };

      // 鼠标在剑柄；剑尖沿挥动/朝向伸出
      if (speed > 0.6) {
        const target = Math.atan2(vy, vx);
        let diff = target - angleRef.current;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        angleRef.current += diff * 0.22;
      }

      const ang = angleRef.current;
      const bx = e.clientX;
      const by = e.clientY;
      // 剑柄略朝后，剑尖在前方
      const gripX = bx - Math.cos(ang) * (HANDLE_LEN * 0.35);
      const gripY = by - Math.sin(ang) * (HANDLE_LEN * 0.35);
      const tipX = gripX + Math.cos(ang) * (HANDLE_LEN + BLADE_LEN);
      const tipY = gripY + Math.sin(ang) * (HANDLE_LEN + BLADE_LEN);

      setBlade({
        x: tipX,
        y: tipY,
        bx: gripX,
        by: gripY,
        tipR: TIP_HIT_R,
        speed,
      });
      setTick((t) => t + 1);
      audioRef.current?.updateSwing(speed);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("keydown", onKey);
      document.body.style.cursor = "";
    };
  }, [active]);

  useEffect(() => () => audioRef.current?.stop(), []);

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
  const ang = Math.atan2(blade.y - blade.by, blade.x - blade.bx);
  const totalLen = Math.hypot(blade.x - blade.bx, blade.y - blade.by);
  const handleRatio = HANDLE_LEN / Math.max(totalLen, 1);

  return (
    <div
      aria-hidden
      className="sw-saber-cursor"
      style={{
        position: "fixed",
        left: blade.bx,
        top: blade.by,
        width: totalLen,
        height: 0,
        pointerEvents: "none",
        zIndex: 10000,
        transform: `rotate(${(ang * 180) / Math.PI}deg)`,
        transformOrigin: "0 0",
      }}
    >
      {/* 剑柄在起点（鼠标侧） */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: -5,
          width: totalLen * handleRatio,
          height: 10,
          borderRadius: 2,
          background:
            "linear-gradient(90deg, #2a2a2a 0%, #6a6a6a 35%, #c9a227 55%, #6a6a6a 75%, #222 100%)",
          boxShadow: "0 0 6px rgba(0,0,0,0.5)",
        }}
      />
      {/* 刃身 */}
      <div
        style={{
          position: "absolute",
          left: totalLen * handleRatio * 0.85,
          top: -7,
          width: totalLen * (1 - handleRatio * 0.85),
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
          left: totalLen * handleRatio,
          top: -2,
          width: totalLen * (1 - handleRatio) * 0.96,
          height: 4,
          borderRadius: 2,
          background: c.core,
          opacity: 0.95,
        }}
      />
      {/* 剑尖光点：灼烧区域可视化 */}
      <div
        style={{
          position: "absolute",
          left: totalLen - 10,
          top: -10,
          width: 20,
          height: 20,
          borderRadius: "50%",
          background: c.core,
          boxShadow: `0 0 12px ${c.glow}, 0 0 28px ${c.glow}`,
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
      {active && (
        <p className="sw-saber-hint">用剑尖灼烧文字 · Esc 退出</p>
      )}
    </div>
  );
}
