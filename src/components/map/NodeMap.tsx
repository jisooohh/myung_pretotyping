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
const MAIN_GAP = 64;
const CHILD_X = 90;
const CHILD_Y = 20;
const CHILD_ROW = 28;

interface Placed extends WorryNode { x: number; y: number; w: number; h: number; current: boolean; }

function boundary(x: number, y: number, w: number, h: number, tx: number, ty: number): [number, number] {
  const ang = Math.atan2(ty - y, tx - x);
  const rx = w / 2 + 8, ry = h / 2 + 8;
  const t = 1 / Math.hypot(Math.cos(ang) / rx, Math.sin(ang) / ry);
  return [x + t * Math.cos(ang), y + t * Math.sin(ang)];
}

export default function NodeMap({ nodes, onOpen }: Props) {
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const mainNodes = nodes.filter((n) => !n.parentId);
  const latestMainId = mainNodes.at(-1)?.id;
  const placed: Placed[] = [];
  let y = TOP + 42;

  mainNodes.forEach((n) => {
    const current = n.id === latestMainId;
    const parent: Placed = {
      ...n,
      x: cx,
      y,
      w: current ? 102 : Math.max(50, Math.min(78, n.label.length * 7 + 18)),
      h: current ? 36 : 24,
      current,
    };
    placed.push(parent);

    const children = nodes.filter((c) => c.parentId === n.id);
    children.forEach((child, childIndex) => {
      const side = childIndex % 2 === 0 ? -1 : 1;
      const row = Math.floor(childIndex / 2);
      placed.push({
        ...child,
        x: cx + side * CHILD_X,
        y: parent.y + CHILD_Y + row * CHILD_ROW,
        w: 76,
        h: 32,
        current: false,
      });
    });
    const childRows = Math.ceil(children.length / 2);
    y += Math.max(MAIN_GAP, CHILD_Y + Math.max(0, childRows - 1) * CHILD_ROW + 44);
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
          const branch = b.nodeType === 'scenario-branch' || !!b.parentId;
          return (
            <path
              key={i}
              d={branch ? `M ${sx} ${sy} Q ${(sx + ex) / 2} ${my}, ${ex} ${ey}` : `M ${sx} ${sy} C ${sx} ${my}, ${ex} ${my}, ${ex} ${ey}`}
              fill="none"
              stroke={sel ? 'var(--brand)' : 'rgba(255,255,255,0.32)'}
              strokeWidth={sel ? 1.7 : 1.15}
              strokeDasharray={sel ? '0' : '4 4'}
              strokeLinecap="round"
              opacity={sel ? 0.86 : 0.72}
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
                padding: branch ? '3px 7px' : currentMain ? '9px 14px' : '5px 9px',
                borderRadius: branch ? 7 : currentMain ? 13 : 8,
                fontSize: branch ? 8.6 : currentMain ? 14 : 10.5,
                fontWeight: currentMain ? 700 : 600,
                whiteSpace: branch ? 'normal' : 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                lineHeight: branch ? 1.25 : undefined,
                display: branch ? '-webkit-box' : undefined,
                WebkitLineClamp: branch ? 2 : undefined,
                WebkitBoxOrient: branch ? 'vertical' : undefined,
                cursor: 'pointer',
                background: sel ? (currentMain ? k.color : k.color + '2e') : branch ? 'rgba(12,12,14,0.96)' : 'rgba(18,18,22,0.94)',
                color: sel ? '#fff' : branch ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.62)',
                border: focused ? `1.5px solid ${k.color}` : sel ? `1.5px solid ${k.color}${currentMain ? 'ff' : '99'}` : '1.5px dashed rgba(255,255,255,0.3)',
                boxShadow: focused ? `0 0 0 4px ${k.color}22` : sel && currentMain ? `0 8px 22px ${k.color}66` : 'none',
                transition: 'border-color .12s, box-shadow .12s, background .12s',
              }}
              title={p.scenarioText || p.decision || p.label}
            >
              {p.label}
            </button>
            {currentMain && <div className="kicker" style={{ fontSize: 8, color: sel ? 'var(--brand)' : 'rgba(255,255,255,0.5)', letterSpacing: '0.14em', marginTop: 1 }}>NOW</div>}
            {!sel && <div style={{ fontSize: 7.5, color: 'rgba(255,255,255,0.4)', marginTop: 1 }}>미선택</div>}
          </div>
        );
      })}
    </div>
  );
}
