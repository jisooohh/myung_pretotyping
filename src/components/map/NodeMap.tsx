'use client';

import { useState } from 'react';
import { KIND } from '@/constants/saju';
import type { WorryNode } from '@/store/useMapStore';

interface Props {
  nodes: WorryNode[];
  onOpen: (id: string) => void;
}

const W = 340;
const cx = W / 2;
const TOP = 26;
const STEP = 86;

interface Placed extends WorryNode { x: number; y: number; w: number; h: number; current: boolean; }

function boundary(x: number, y: number, w: number, h: number, tx: number, ty: number): [number, number] {
  const ang = Math.atan2(ty - y, tx - x);
  const rx = w / 2 + 4, ry = h / 2 + 4;
  const t = 1 / Math.hypot(Math.cos(ang) / rx, Math.sin(ang) / ry);
  return [x + t * Math.cos(ang), y + t * Math.sin(ang)];
}

export default function NodeMap({ nodes, onOpen }: Props) {
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const mainNodes = nodes.filter((n) => !n.parentId);
  const latestMainId = mainNodes.at(-1)?.id;
  const placed: Placed[] = [];

  mainNodes.forEach((n, i) => {
    const current = n.id === latestMainId;
    const parent: Placed = {
      ...n,
      x: cx,
      y: TOP + (i + 1) * STEP,
      w: current ? 116 : Math.max(58, Math.min(96, n.label.length * 9 + 20)),
      h: current ? 42 : 28,
      current,
    };
    placed.push(parent);

    const children = nodes.filter((c) => c.parentId === n.id);
    children.forEach((child, childIndex) => {
      const side = childIndex % 2 === 0 ? -1 : 1;
      const row = Math.floor(childIndex / 2);
      placed.push({
        ...child,
        x: cx + side * 92,
        y: parent.y + 26 + row * 34,
        w: Math.max(54, Math.min(86, child.label.length * 8 + 18)),
        h: 24,
        current: false,
      });
    });
  });

  const placedById = new Map(placed.map((p) => [p.id, p]));
  const root = { x: cx, y: TOP, w: 30, h: 30 };
  const lastY = placed.reduce((max, p) => Math.max(max, p.y), TOP);
  const H = lastY + 90;

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
        const branch = p.nodeType === 'scenario-branch' || !!p.parentId;
        const currentMain = p.current && !branch;
        const focused = focusedId === p.id;
        return (
          <div key={p.id} style={{ position: 'absolute', left: `${(p.x / W) * 100}%`, top: p.y, transform: 'translate(-50%,-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            <button
              onClick={() => {
                setFocusedId(p.id);
                window.setTimeout(() => onOpen(p.id), branch ? 120 : 0);
              }}
              style={{
                width: p.w,
                minHeight: p.h,
                padding: branch ? '4px 8px' : currentMain ? '11px 18px' : '6px 11px',
                borderRadius: branch ? 8 : currentMain ? 15 : 9,
                fontSize: branch ? 10 : currentMain ? 15.5 : 11.5,
                fontWeight: currentMain ? 700 : 600,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                cursor: 'pointer',
                background: sel ? (currentMain ? k.color : k.color + '2e') : branch ? 'rgba(255,255,255,0.045)' : 'rgba(255,255,255,0.06)',
                color: sel ? '#fff' : branch ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.62)',
                border: focused ? `1.5px solid ${k.color}` : sel ? `1.5px solid ${k.color}${currentMain ? 'ff' : '99'}` : '1.5px dashed rgba(255,255,255,0.3)',
                boxShadow: focused ? `0 0 0 4px ${k.color}22` : sel && currentMain ? `0 8px 22px ${k.color}66` : 'none',
                transition: 'border-color .12s, box-shadow .12s, background .12s',
              }}
              title={p.decision || p.label}
            >
              {p.label}
            </button>
            {currentMain && <div className="kicker" style={{ fontSize: 8.5, color: sel ? 'var(--brand)' : 'rgba(255,255,255,0.5)', letterSpacing: '0.14em', marginTop: 1 }}>NOW</div>}
            {!sel && <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)', marginTop: 1 }}>미선택</div>}
          </div>
        );
      })}
    </div>
  );
}
