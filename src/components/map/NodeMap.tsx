'use client';

import { KIND } from '@/constants/saju';
import type { WorryNode } from '@/store/useMapStore';

interface Props {
  nodes: WorryNode[];
  onOpen: (id: string) => void;
}

const W = 340;
const cx = W / 2;
const TOP = 26;
const STEP = 64;

interface Placed extends WorryNode { x: number; y: number; w: number; h: number; current: boolean; }

function boundary(x: number, y: number, w: number, h: number, tx: number, ty: number): [number, number] {
  const ang = Math.atan2(ty - y, tx - x);
  const rx = w / 2 + 4, ry = h / 2 + 4;
  const t = 1 / Math.hypot(Math.cos(ang) / rx, Math.sin(ang) / ry);
  return [x + t * Math.cos(ang), y + t * Math.sin(ang)];
}

export default function NodeMap({ nodes, onOpen }: Props) {
  const unselectedIndexByParent = new Map<string, number>();
  const placed: Placed[] = nodes.map((n, i) => {
    const current = i === nodes.length - 1;
    let offset = 0;
    if (!n.selected) {
      const parentKey = n.parentId || 'root';
      const branchIndex = unselectedIndexByParent.get(parentKey) || 0;
      unselectedIndexByParent.set(parentKey, branchIndex + 1);
      offset = (branchIndex % 2 === 0 ? -1 : 1) * (52 + Math.floor(branchIndex / 2) * 24);
    }
    return {
      ...n,
      x: cx + offset,
      y: TOP + (i + 1) * STEP,
      w: current ? 116 : Math.max(60, n.label.length * 12 + 24),
      h: current ? 42 : 28,
      current,
    };
  });

  const placedById = new Map(placed.map((p) => [p.id, p]));
  const root = { x: cx, y: TOP, w: 30, h: 30 };
  const last = placed[placed.length - 1];
  const H = (last ? last.y : TOP) + 90;

  const edges: Array<{ a: { x: number; y: number; w: number; h: number }; b: Placed }> = [];
  let prev: { x: number; y: number; w: number; h: number } = root;
  for (const p of placed) {
    const parent = p.parentId ? placedById.get(p.parentId) : undefined;
    edges.push({ a: parent || prev, b: p });
    if (!p.parentId) prev = p;
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: H, margin: '0 auto', maxWidth: W }}>
      <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: 'absolute', inset: 0 }}>
        {edges.map(({ a, b }, i) => {
          const [sx, sy] = boundary(a.x, a.y, a.w, a.h, b.x, b.y);
          const [ex, ey] = boundary(b.x, b.y, b.w, b.h, a.x, a.y);
          const my = (sy + ey) / 2;
          const sel = b.selected;
          return (
            <path
              key={i}
              d={`M ${sx} ${sy} C ${sx} ${my}, ${ex} ${my}, ${ex} ${ey}`}
              fill="none"
              stroke={sel ? 'var(--brand)' : 'rgba(255,255,255,0.32)'}
              strokeWidth={sel ? 2 : 1.4}
              strokeDasharray={sel ? '0' : '4 4'}
              strokeLinecap="round"
              opacity={sel ? 0.9 : 0.8}
            />
          );
        })}
      </svg>

      {/* root */}
      <div style={{ position: 'absolute', left: '50%', top: root.y, transform: 'translate(-50%,-50%)' }}>
        <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg, var(--clone-coral-200), var(--brand))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 11, boxShadow: 'var(--shadow-brand)', border: '2px solid #000' }}>나</div>
      </div>

      {placed.map((p) => {
        const k = KIND[p.kind];
        const sel = p.selected;
        return (
          <div key={p.id} style={{ position: 'absolute', left: `${(p.x / W) * 100}%`, top: p.y, transform: 'translate(-50%,-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            <button
              onClick={() => onOpen(p.id)}
              style={{
                padding: p.current ? '11px 18px' : '6px 12px',
                borderRadius: p.current ? 15 : 9,
                fontSize: p.current ? 15.5 : 11.5,
                fontWeight: p.current ? 700 : 600,
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                background: sel ? (p.current ? k.color : k.color + '2e') : 'rgba(255,255,255,0.06)',
                color: sel ? '#fff' : 'rgba(255,255,255,0.62)',
                border: sel ? `1.5px solid ${k.color}${p.current ? 'ff' : '99'}` : '1.5px dashed rgba(255,255,255,0.32)',
                boxShadow: sel && p.current ? `0 8px 22px ${k.color}66` : 'none',
              }}
            >
              {p.label}
            </button>
            {p.current && <div className="kicker" style={{ fontSize: 8.5, color: sel ? 'var(--brand)' : 'rgba(255,255,255,0.5)', letterSpacing: '0.14em', marginTop: 1 }}>NOW</div>}
            {!sel && <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)', marginTop: 1 }}>미선택</div>}
          </div>
        );
      })}
    </div>
  );
}
