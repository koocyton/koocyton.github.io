/** 装饰性矢量插图（避免外链依赖） */

export function DeathStarArt({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 200 200" aria-hidden>
      <defs>
        <radialGradient id="ds-body" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#9aa3ad" />
          <stop offset="55%" stopColor="#5c6570" />
          <stop offset="100%" stopColor="#2a3038" />
        </radialGradient>
        <radialGradient id="ds-dish" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1a1e24" />
          <stop offset="60%" stopColor="#3d4652" />
          <stop offset="100%" stopColor="#6b7582" />
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="88" fill="url(#ds-body)" />
      <ellipse cx="100" cy="100" rx="88" ry="10" fill="none" stroke="#2f3640" strokeWidth="2" opacity="0.7" />
      <ellipse cx="100" cy="70" rx="88" ry="8" fill="none" stroke="#2f3640" strokeWidth="1.5" opacity="0.5" />
      <ellipse cx="100" cy="130" rx="88" ry="8" fill="none" stroke="#2f3640" strokeWidth="1.5" opacity="0.5" />
      <circle cx="128" cy="62" r="28" fill="url(#ds-dish)" />
      <circle cx="128" cy="62" r="10" fill="#0d1014" />
      <circle cx="128" cy="62" r="4" fill="#7ec8ff" opacity="0.85">
        <animate attributeName="opacity" values="0.4;0.95;0.4" dur="3.2s" repeatCount="indefinite" />
      </circle>
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2;
        const x = 100 + Math.cos(a) * 62;
        const y = 100 + Math.sin(a) * 62;
        return <rect key={i} x={x - 3} y={y - 2} width="6" height="4" rx="1" fill="#3a424c" opacity="0.55" />;
      })}
    </svg>
  );
}

export function XWingArt({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 240 120" aria-hidden>
      <g fill="none" stroke="#d7c49a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M40 60 L110 55 L170 58 L200 60 L170 62 L110 65 Z" fill="#8a7a5c" fillOpacity="0.35" />
        <path d="M95 56 L55 28 L48 30 L90 58" />
        <path d="M95 64 L55 92 L48 90 L90 62" />
        <path d="M145 54 L185 22 L192 24 L155 56" />
        <path d="M145 66 L185 98 L192 96 L155 64" />
        <circle cx="118" cy="60" r="5" fill="#5ad0ff" stroke="none" opacity="0.8">
          <animate attributeName="opacity" values="0.35;0.9;0.35" dur="2s" repeatCount="indefinite" />
        </circle>
      </g>
    </svg>
  );
}

export function JediCrest({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" aria-hidden>
      <circle cx="32" cy="32" r="28" fill="none" stroke="#ffe81f" strokeWidth="2" opacity="0.7" />
      <path
        d="M32 10 L36 28 L54 32 L36 36 L32 54 L28 36 L10 32 L28 28 Z"
        fill="#ffe81f"
        opacity="0.85"
      />
    </svg>
  );
}

export function EraIcon({ index }: { index: number }) {
  const icons = [DeathStarArt, XWingArt, JediCrest, DeathStarArt, XWingArt, JediCrest];
  const Icon = icons[index % icons.length];
  return <Icon className="sw-era-art" />;
}
