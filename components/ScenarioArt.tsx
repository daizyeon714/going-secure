import { ScenarioCategory } from "@/lib/types";

// 시나리오 썸네일을 SVG 에디토리얼 일러스트로 표현한다.
// - 실사 재난 사진·공포 이미지·부상/피 없음.
// - "사건이 시작되기 직전 / 이상 징후가 나타난 순간"을 muted color + soft shape로 담는다.
// 팔레트는 카테고리에서, 구도는 thumbnail(모티프)에서 가져온다.

interface Palette {
  bg: string;
  a: string;
  b: string;
  c: string;
}

const CATEGORY_PALETTE: Record<ScenarioCategory, Palette> = {
  emergency: { bg: "#e7ece6", a: "#4f6d5a", b: "#3f5468", c: "#b9483f" },
  urban: { bg: "#e9e6e0", a: "#3f5468", b: "#8b8880", c: "#c98a5e" },
  disaster: { bg: "#e2e6ea", a: "#3f5468", b: "#7a9a86", c: "#55534d" },
  pet: { bg: "#efe7dc", a: "#7a9a86", b: "#c98a5e", c: "#3f5468" },
  unexpected: { bg: "#e6e8e6", a: "#55534d", b: "#3f5468", c: "#7a9a86" },
};

type Motif = (p: Palette) => React.ReactNode;

// ── 공통 헬퍼: 바닥/지평선 ──
const ground = (p: Palette, y = 190) => (
  <rect x="0" y={y} width="400" height={260 - y} fill={p.a} opacity="0.1" />
);

const MOTIFS: Record<string, Motif> = {
  // 화재 — 방문 아래로 새어드는 빛과 작은 불씨
  "studio-fire": (p) => (
    <>
      {ground(p, 200)}
      <rect x="60" y="40" width="120" height="160" rx="4" fill={p.a} opacity="0.12" />
      <rect x="150" y="70" width="10" height="130" fill={p.a} opacity="0.32" />
      <circle cx="232" cy="122" r="34" fill={p.c} opacity="0.22" />
      <path d="M217 152 Q232 92 252 152 Q247 172 232 174 Q217 172 217 152Z" fill={p.c} opacity="0.45" />
    </>
  ),

  // 연기가 스며드는 실내
  "subway-smoke": (p) => (
    <>
      <rect x="24" y="58" width="352" height="120" rx="18" fill={p.a} opacity="0.12" />
      <circle cx="322" cy="112" r="42" fill={p.b} opacity="0.2" />
      <circle cx="288" cy="132" r="26" fill={p.b} opacity="0.16" />
      <rect x="44" y="150" width="300" height="6" fill={p.a} opacity="0.28" />
    </>
  ),
  gas: (p) => (
    <>
      {ground(p, 196)}
      <rect x="150" y="120" width="70" height="70" rx="6" fill={p.a} opacity="0.14" />
      <circle cx="235" cy="110" r="24" fill={p.b} opacity="0.2" />
      <circle cx="262" cy="128" r="16" fill={p.b} opacity="0.16" />
    </>
  ),

  // 사람이 쓰러진 순간
  "collapsed-person": (p) => (
    <>
      {ground(p, 190)}
      <ellipse cx="180" cy="205" rx="70" ry="10" fill={p.a} opacity="0.14" />
      <rect x="140" y="162" width="90" height="22" rx="11" fill={p.b} opacity="0.4" />
      <circle cx="150" cy="152" r="13" fill={p.b} opacity="0.5" />
      <circle cx="300" cy="92" r="17" fill={p.c} opacity="0.28" />
      <rect x="286" y="108" width="30" height="58" rx="10" fill={p.c} opacity="0.22" />
    </>
  ),
  choking: (p) => (
    <>
      {ground(p, 196)}
      <circle cx="200" cy="104" r="30" fill={p.a} opacity="0.18" />
      <circle cx="200" cy="98" r="9" fill={p.c} opacity="0.4" />
      <rect x="176" y="132" width="48" height="60" rx="16" fill={p.b} opacity="0.28" />
    </>
  ),
  burn: (p) => (
    <>
      {ground(p, 198)}
      <rect x="188" y="40" width="18" height="70" rx="6" fill={p.a} opacity="0.28" />
      <path d="M197 110 q-4 30 0 46" stroke={p.b} strokeWidth="4" fill="none" opacity="0.4" />
      <circle cx="197" cy="172" r="20" fill={p.c} opacity="0.22" />
    </>
  ),
  nosebleed: (p) => (
    <>
      {ground(p, 198)}
      <circle cx="200" cy="108" r="34" fill={p.a} opacity="0.18" />
      <path d="M200 118 q0 20 0 30" stroke={p.c} strokeWidth="4" fill="none" opacity="0.4" />
    </>
  ),

  // 엘리베이터 멈춤 — 좁은 상자, 층 표시등
  elevator: (p) => (
    <>
      <rect x="140" y="40" width="120" height="180" rx="6" fill={p.a} opacity="0.14" />
      <rect x="198" y="40" width="4" height="180" fill={p.a} opacity="0.3" />
      <circle cx="200" cy="66" r="7" fill={p.c} opacity="0.45" />
    </>
  ),
  // 군중이 한쪽으로 — 기울어진 작은 인영들
  crowd: (p) => (
    <>
      {ground(p, 200)}
      {[70, 120, 170, 220, 270, 320].map((x, i) => (
        <g key={i} transform={`translate(${x} ${150 + (i % 2) * 8}) rotate(12)`}>
          <circle cx="0" cy="0" r="9" fill={p.b} opacity="0.32" />
          <rect x="-7" y="12" width="14" height="34" rx="7" fill={p.b} opacity="0.26" />
        </g>
      ))}
    </>
  ),
  // 교통사고 — 두 사각형이 맞닿은 순간
  "car-crash": (p) => (
    <>
      {ground(p, 196)}
      <rect x="70" y="130" width="120" height="50" rx="12" fill={p.a} opacity="0.22" />
      <rect x="205" y="128" width="120" height="52" rx="12" fill={p.b} opacity="0.26" />
      <path d="M192 120 l10 -14 M200 128 l14 -8 M196 138 l-14 -6" stroke={p.c} strokeWidth="3" opacity="0.4" strokeLinecap="round" />
    </>
  ),

  // 지진 — 흔들리는 건물과 균열선
  earthquake: (p) => (
    <>
      <path d="M0 202 L60 182 L100 212 L150 172 L200 206 L260 176 L320 206 L400 186" stroke={p.a} strokeWidth="4" fill="none" opacity="0.3" />
      <rect x="118" y="58" width="80" height="104" fill={p.b} opacity="0.16" transform="rotate(-2 158 110)" />
      <rect x="222" y="88" width="60" height="74" fill={p.c} opacity="0.16" transform="rotate(2 252 125)" />
    </>
  ),
  // 침수 — 차오르는 물
  "flooded-basement": (p) => (
    <>
      <rect x="60" y="70" width="100" height="110" fill={p.c} opacity="0.14" />
      <rect x="220" y="56" width="80" height="124" fill={p.c} opacity="0.12" />
      <rect x="0" y="168" width="400" height="92" fill={p.a} opacity="0.2" />
      <rect x="0" y="182" width="400" height="6" fill={p.b} opacity="0.34" />
    </>
  ),
  "car-water": (p) => (
    <>
      <rect x="120" y="118" width="160" height="56" rx="16" fill={p.a} opacity="0.24" />
      <rect x="0" y="160" width="400" height="100" fill={p.b} opacity="0.2" />
      <rect x="0" y="172" width="400" height="6" fill={p.a} opacity="0.34" />
    </>
  ),
  // 폭발 — 먼 섬광 원
  blast: (p) => (
    <>
      {ground(p, 200)}
      <circle cx="300" cy="80" r="46" fill={p.c} opacity="0.16" />
      <circle cx="300" cy="80" r="26" fill={p.c} opacity="0.22" />
      <rect x="60" y="120" width="70" height="80" fill={p.a} opacity="0.14" />
      <rect x="150" y="150" width="50" height="50" fill={p.a} opacity="0.12" />
    </>
  ),
  // 경보 — 잔잔한 동심원 (빨강 남용 없이)
  alert: (p) => (
    <>
      {ground(p, 200)}
      <circle cx="200" cy="110" r="60" fill="none" stroke={p.b} strokeWidth="2" opacity="0.28" />
      <circle cx="200" cy="110" r="40" fill="none" stroke={p.b} strokeWidth="2" opacity="0.34" />
      <circle cx="200" cy="110" r="18" fill={p.a} opacity="0.3" />
    </>
  ),

  // 반려동물 — 누운 네 발 실루엣 + 놀란 보호자
  pet: (p) => (
    <>
      {ground(p, 198)}
      <ellipse cx="170" cy="188" rx="60" ry="9" fill={p.a} opacity="0.14" />
      <rect x="130" y="164" width="86" height="20" rx="10" fill={p.b} opacity="0.4" />
      <circle cx="126" cy="160" r="11" fill={p.b} opacity="0.5" />
      <path d="M148 184 v10 M172 184 v10 M196 184 v10" stroke={p.b} strokeWidth="3" opacity="0.35" strokeLinecap="round" />
      <circle cx="300" cy="96" r="15" fill={p.c} opacity="0.28" />
      <rect x="287" y="110" width="28" height="54" rx="10" fill={p.c} opacity="0.22" />
    </>
  ),

  // 산에서 길 잃음 — 삼각 능선 + 작은 인영
  mountain: (p) => (
    <>
      <path d="M0 210 L110 90 L190 180 L260 110 L400 210 Z" fill={p.a} opacity="0.16" />
      <path d="M150 210 L250 120 L360 210 Z" fill={p.b} opacity="0.14" />
      <circle cx="120" cy="184" r="7" fill={p.c} opacity="0.4" />
      <rect x="114" y="190" width="12" height="22" rx="6" fill={p.c} opacity="0.32" />
    </>
  ),
  // 바다 — 물결과 멀어지는 머리
  sea: (p) => (
    <>
      <rect x="0" y="120" width="400" height="140" fill={p.a} opacity="0.16" />
      <path d="M0 150 q40 -12 80 0 t80 0 t80 0 t80 0 t80 0" stroke={p.b} strokeWidth="3" fill="none" opacity="0.3" />
      <path d="M0 180 q40 -12 80 0 t80 0 t80 0 t80 0 t80 0" stroke={p.b} strokeWidth="3" fill="none" opacity="0.24" />
      <circle cx="300" cy="140" r="8" fill={p.c} opacity="0.45" />
    </>
  ),
  // 기내 — 좌석 열
  plane: (p) => (
    <>
      <rect x="40" y="50" width="320" height="160" rx="60" fill={p.a} opacity="0.1" />
      {[110, 175, 240].map((y, i) => (
        <g key={i}>
          <rect x="120" y={y} width="70" height="26" rx="6" fill={p.b} opacity="0.22" />
          <rect x="210" y={y} width="70" height="26" rx="6" fill={p.b} opacity="0.22" />
        </g>
      ))}
    </>
  ),
  // 암전 — 어두운 오버레이 + 희미한 문틈 빛
  dark: (p) => (
    <>
      <rect x="0" y="0" width="400" height="260" fill={p.a} opacity="0.22" />
      <rect x="170" y="70" width="60" height="130" rx="4" fill={p.c} opacity="0.14" />
      <rect x="196" y="70" width="8" height="130" fill={p.c} opacity="0.3" />
    </>
  ),

  // 기본값 — 잔잔한 지평선
  horizon: (p) => (
    <>
      {ground(p, 176)}
      <circle cx="300" cy="86" r="30" fill={p.b} opacity="0.16" />
      <rect x="60" y="120" width="80" height="56" fill={p.a} opacity="0.1" />
    </>
  ),
};

function hashSeed(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export default function ScenarioArt({
  artKey,
  category,
  seed,
  className,
  alt,
}: {
  artKey: string;
  category: ScenarioCategory;
  seed?: string;
  className?: string;
  alt: string;
}) {
  const palette = CATEGORY_PALETTE[category] ?? CATEGORY_PALETTE.emergency;
  const motif = MOTIFS[artKey] ?? MOTIFS.horizon;

  // 같은 모티프를 쓰는 카드끼리도 살짝 달라 보이도록 결정론적 변주를 준다.
  const h = seed ? hashSeed(seed) : 0;
  const dx = seed ? (h % 5) - 2 : 0; // -2 ~ +2
  const scale = seed ? 1 + ((h >> 3) % 4) / 100 : 1; // 1.00 ~ 1.03

  return (
    <svg
      viewBox="0 0 400 260"
      className={className}
      role="img"
      aria-label={alt}
      preserveAspectRatio="xMidYMid slice"
    >
      <rect width="400" height="260" fill={palette.bg} />
      <g transform={`translate(${dx} 0) scale(${scale})`}>{motif(palette)}</g>
    </svg>
  );
}
