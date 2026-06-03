'use client';

import { useEffect } from 'react';
import { KIND } from '@/constants/saju';
import type { Tag } from '@/store/useMapStore';
import TwinSpark from '@/components/ui/TwinSpark';

interface Props {
  tag: Tag | null;
  worry: string;
  onDone: () => void;
}

const COPY: Record<Tag, { title: string; body: string }> = {
  진로: {
    title: '진로 흐름을 계산하는 중',
    body: '선택지와 예상 시나리오를 연결하고 있어요.',
  },
  관계: {
    title: '관계의 온도를 읽는 중',
    body: '상대와의 패턴을 맵에 맞춰 정리하고 있어요.',
  },
  상담: {
    title: '고민의 핵심을 찾는 중',
    body: '감정과 상황을 분리해 상담 노드로 준비하고 있어요.',
  },
};

export default function MapLoadingScreen({ tag, worry, onDone }: Props) {
  const safeTag = tag || '상담';
  const tone = KIND[safeTag];
  const copy = COPY[safeTag];

  useEffect(() => {
    const timer = window.setTimeout(onDone, 2000);
    return () => window.clearTimeout(timer);
  }, [onDone]);

  return (
    <div style={{ flex: 1, position: 'relative', overflow: 'hidden', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 28 }}>
      <div className="cosmic-bg" />
      <div className="cosmic-stars cosmic-twinkle" />
      <div className="animate-float-up" style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <div style={{ width: 68, height: 68, borderRadius: 22, border: `1px solid ${tone.color}66`, background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 22, boxShadow: `0 18px 44px ${tone.color}33` }}>
          <TwinSpark size={30} />
        </div>
        <div className="kicker" style={{ color: tone.color, marginBottom: 10 }}>{safeTag} 분석</div>
        <h1 className="kr" style={{ margin: 0, fontSize: 22, lineHeight: 1.35, color: 'rgba(255,255,255,0.94)', fontWeight: 700 }}>{copy.title}</h1>
        <p className="kr" style={{ margin: '12px 0 0', fontSize: 13, lineHeight: 1.6, color: 'rgba(255,255,255,0.56)' }}>{copy.body}</p>
        {worry && (
          <div className="kr" style={{ marginTop: 22, maxWidth: 260, padding: '11px 13px', borderRadius: 12, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.72)', fontSize: 12.5, lineHeight: 1.45 }}>
            {worry}
          </div>
        )}
        <div style={{ marginTop: 24, width: 132, height: 3, borderRadius: 3, background: 'rgba(255,255,255,0.12)', overflow: 'hidden' }}>
          <div style={{ width: '100%', height: '100%', borderRadius: 3, background: tone.color, transformOrigin: 'left center', animation: 'loading-fill 2s linear both' }} />
        </div>
      </div>
      <style jsx>{`
        @keyframes loading-fill {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
      `}</style>
    </div>
  );
}
