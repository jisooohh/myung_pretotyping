'use client';

import { useSaju } from '@/hooks/useSaju';
import { useUserStore } from '@/store/useUserStore';
import ManseryeokPanel from './ManseryeokPanel';
import OhaengBalance from './saju/OhaengBalance';
import StrengthGauge from './saju/StrengthGauge';
import YongshinPanel from './saju/YongshinPanel';
import DaewoonTimeline from './saju/DaewoonTimeline';

function getAge(birthDate: string): number | null {
  if (!birthDate) return null;
  const [y, m, d] = birthDate.split('-').map(Number);
  if (!y || !m || !d) return null;
  const today = new Date();
  let age = today.getFullYear() - y;
  const beforeBirthday = today.getMonth() + 1 < m || (today.getMonth() + 1 === m && today.getDate() < d);
  if (beforeBirthday) age -= 1;
  return age;
}

export default function ManseryeokView() {
  const { user } = useUserStore();
  const { data: saju } = useSaju();
  const currentAge = user.birthDate ? getAge(user.birthDate) : null;

  return (
    <div className="pad-x" style={{ paddingTop: 18, paddingBottom: 24 }}>
      <div className="ed-head">
        <div className="kicker">만세력 · 命</div>
        <div className="line" />
      </div>
      <div className="card ed" style={{ padding: 20, marginBottom: 26 }}>
        <ManseryeokPanel />
      </div>

      {user.birthDate && saju && (
        <>
          <div className="ed-head"><div className="kicker">오행 분포 · ELEMENTS</div><div className="line" /></div>
          <OhaengBalance counts={saju.counts} />

          <div className="ed-head" style={{ marginTop: 22 }}><div className="kicker">신강·신약 · STRENGTH</div><div className="line" /></div>
          <StrengthGauge score={saju.strength.score} label={saju.strength.label} desc={saju.strength.desc} />

          <div className="ed-head" style={{ marginTop: 22 }}><div className="kicker">용신 · USEFUL GOD</div><div className="line" /></div>
          <YongshinPanel element={saju.yongshin.element} reason={saju.yongshin.reason} />

          <div className="ed-head" style={{ marginTop: 22 }}><div className="kicker">대운 · LUCK CYCLES</div><div className="line" /></div>
          <DaewoonTimeline steps={saju.daewoon} currentAge={currentAge} />
        </>
      )}
    </div>
  );
}
