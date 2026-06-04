'use client';

import { useState } from 'react';
import Icon from '@/components/ui/Icon';
import ReportHeader from './ReportHeader';

interface Props {
  onNext: (picks: Record<number, number>, choices: Array<{ id: number; opts: ScenarioOption[] }>) => void;
  onBack: () => void;
  onClose?: () => void;
  initialPicks?: Record<number, number>;
}

interface ScenarioOption {
  label: string;
  scenarioLabel: string;
  scenario: string;
}

type Item =
  | { type: 'scene'; n: number; text: string }
  | { type: 'choice'; id: number; q: string; opts: ScenarioOption[] };

const TIMELINE: Item[] = [
  { type: 'scene', n: 1, text: '6개월 더 준비하기로 마음먹고, 퇴근 후 토이프로젝트를 시작해요. 처음엔 \'이게 의미가 있나\' 싶지만, 庚金의 압박 속에서 만든 결과물이 오히려 단단해요. 木이 칼에 다듬어지는 시기거든요.' },
  {
    type: 'choice',
    id: 0,
    q: '가장 먼저 무엇을 할까요?',
    opts: [
      { label: '포트폴리오 사이트부터 만든다', scenarioLabel: '6개월 준비', scenario: '작은 포트폴리오를 빠르게 공개하고, 지원서와 외주 문의가 동시에 열리는 흐름' },
      { label: '지인에게 첫 프로젝트를 부탁한다', scenarioLabel: '첫 외주', scenario: '지인 외주 1건으로 시장 감각과 첫 매출을 확인하는 흐름' },
      { label: '코딩테스트 스터디에 다시 들어간다', scenarioLabel: '정규직 재도전', scenario: '스터디 루틴을 회복해 정규직 지원력을 다시 끌어올리는 흐름' },
    ],
  },
  { type: 'scene', n: 2, text: '망설이다 지인에게 연락했더니, 마침 작은 외주 건이 있었어요. 첫 계약. 큰 돈은 아니지만 \'시장에서 내 코드가 돈이 된다\'는 걸 확인했어요. 취준 탈락으로 깎였던 자존감이 이 한 건으로 회복되기 시작해요.' },
  { type: 'scene', n: 3, text: '그 사이 정규직 면접 제안도 하나 들어와요. 이제 선택지가 생겼어요 — 안정적인 취업이냐, 프리랜서 확장이냐. 6개월 전 \'도망치듯\' 전향하려던 것과는 완전히 다른 위치예요.' },
  {
    type: 'choice',
    id: 1,
    q: '어디로 마음이 기울어요?',
    opts: [
      { label: '안정적인 정규직을 잡는다', scenarioLabel: '정규직 전환', scenario: '정규직 제안을 받아 안정성을 확보하고 사이드 프로젝트를 천천히 남기는 흐름' },
      { label: '프리랜서를 본격화한다', scenarioLabel: '프리랜서', scenario: '외주 경험을 발판으로 프리랜서 확장에 집중하는 흐름' },
      { label: '둘 다 협상 카드로 쓴다', scenarioLabel: '조건 협상', scenario: '정규직과 프리랜서 가능성을 모두 들고 더 나은 조건을 협상하는 흐름' },
    ],
  },
  { type: 'scene', n: 4, text: '선택을 내린 당신은 한결 차분해졌어요. 도망치는 게 아니라, 협상할 자리를 만들고 서 있으니까요. 지금의 결정이 다음 노드를 만들어요.' },
];

const CHOICES = TIMELINE.filter((item): item is Extract<Item, { type: 'choice' }> => item.type === 'choice')
  .map(({ id, opts }) => ({ id, opts }));

export default function ScenarioSim({ onNext, onBack, onClose, initialPicks }: Props) {
  const [picks, setPicks] = useState<Record<number, number>>(() => ({ 0: 1, 1: 2, ...initialPicks }));
  const [step, setStep] = useState(1);

  const revealed = TIMELINE.slice(0, step);
  const done = step >= TIMELINE.length;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <ReportHeader title="시나리오 시뮬레이션" onBack={onBack} onClose={onClose || onBack} />
      <div className="scroll pad-x" style={{ flex: 1, paddingTop: 16, paddingBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <div className="kicker">전개 {Math.min(step, TIMELINE.length)} / {TIMELINE.length}</div>
          <div style={{ flex: 1, height: 3, background: 'var(--bg-muted)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ width: `${(step / TIMELINE.length) * 100}%`, height: '100%', background: 'var(--brand)', borderRadius: 2, transition: 'width .35s var(--ease-out-soft)' }} />
          </div>
        </div>

        <div style={{ position: 'relative', paddingLeft: 28 }}>
          <div style={{ position: 'absolute', left: 7, top: 6, bottom: 6, width: 2, background: 'var(--divider)' }} />
          {revealed.map((item, i) => (
            <div key={i} className={i === step - 1 ? 'animate-float-up' : undefined} style={{ position: 'relative', marginBottom: 18 }}>
              <div style={{ position: 'absolute', left: -28, top: 2, width: 16, height: 16, borderRadius: 8, background: item.type === 'choice' ? 'var(--brand)' : 'var(--surface)', border: item.type === 'choice' ? 'none' : '2px solid var(--border-strong)' }} />
              {item.type === 'scene' ? (
                <>
                  <div className="eyebrow" style={{ marginBottom: 6 }}>시나리오 전개 {item.n}</div>
                  <div className="card" style={{ padding: 14 }}>
                    <p className="kr" style={{ margin: 0, fontSize: 13.5, color: 'var(--fg-2)', lineHeight: 1.55 }}>{item.text}</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="kr" style={{ fontSize: 14, fontWeight: 700, color: 'var(--brand)', marginBottom: 8 }}>{item.q}</div>
                  <div className="stack" style={{ gap: 6 }}>
                    {item.opts.map((o, oi) => {
                      const on = picks[item.id] === oi;
                      return (
                        <button key={oi} onClick={() => setPicks((p) => ({ ...p, [item.id]: oi }))} style={{ textAlign: 'left', padding: '11px 14px', borderRadius: 11, fontSize: 13.5, background: on ? 'var(--brand-soft)' : 'var(--bg-muted)', color: on ? 'var(--brand)' : 'var(--fg-1)', fontWeight: on ? 600 : 500, border: `1.5px solid ${on ? 'var(--brand)' : 'transparent'}`, display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ width: 18, height: 18, borderRadius: 9, flexShrink: 0, border: `1.5px solid ${on ? 'var(--brand)' : 'var(--border-strong)'}`, background: on ? 'var(--brand)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                            {on && <Icon name="check" size={11} strokeWidth={3} />}
                          </span>
                          {o.label}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: '12px 20px calc(22px + env(safe-area-inset-bottom, 0px))', borderTop: '1px solid var(--divider)', background: 'var(--bg)', display: 'flex', gap: 10 }}>
        {step > 1 && (
          <button className="btn btn-secondary btn-sm" style={{ height: 48, paddingInline: 18 } as React.CSSProperties} onClick={() => setStep((s) => Math.max(1, s - 1))}>
            <Icon name="chevron-left" size={16} /> 이전
          </button>
        )}
        {done ? (
          <button className="btn btn-primary" style={{ flex: 1, height: 48 }} onClick={() => onNext(picks, CHOICES)}>결과 보기 <Icon name="arrow-right" size={18} /></button>
        ) : (
          <button className="btn btn-primary" style={{ flex: 1, height: 48 }} onClick={() => setStep((s) => Math.min(TIMELINE.length, s + 1))}>다음 <Icon name="arrow-right" size={18} /></button>
        )}
      </div>
    </div>
  );
}
