import { NextResponse } from 'next/server';
import {
  BRANCHES,
  BRANCHES_KO,
  HIDDEN_STEMS,
  STEMS,
  STEMS_KO,
} from '@/constants/saju';
import { calculateSaju, tenGod, twelveSpirit, twelveStage } from '@/lib/saju';
import type { OhaengKey, SajuData, SajuPillar } from '@/types';

export const runtime = 'nodejs';

type CalendarInputType = 'SOLAR' | 'LUNAR';

interface SajuApiRequest {
  nickname?: string;
  birthDate?: string;
  birthTime?: string | null;
  timezone?: string;
  calendarInputType?: CalendarInputType;
}

interface BackendPillar {
  type?: 'year' | 'month' | 'day' | 'hour';
  stem?: string;
  branch?: string;
  element?: { stem?: string; branch?: string };
}

interface BackendHomeAggregate {
  chartId?: string;
  pillars?: BackendPillar[];
  coreSummary?: {
    dayMaster?: string;
    strength?: { label?: string; score?: number };
    usefulGods?: string[];
    currentLuckCycle?: { label?: string; ageRange?: string };
  };
}

const ELEMENT_BY_BACKEND_VALUE: Record<string, OhaengKey> = {
  WOOD: 'wood',
  FIRE: 'fire',
  EARTH: 'earth',
  METAL: 'metal',
  WATER: 'water',
  wood: 'wood',
  fire: 'fire',
  earth: 'earth',
  metal: 'metal',
  water: 'water',
  목: 'wood',
  화: 'fire',
  토: 'earth',
  금: 'metal',
  수: 'water',
  木: 'wood',
  火: 'fire',
  土: 'earth',
  金: 'metal',
  水: 'water',
};

const ELEMENT_BY_KO: Record<string, OhaengKey> = {
  목: 'wood',
  화: 'fire',
  토: 'earth',
  금: 'metal',
  수: 'water',
};

function normalizeStem(value: string | undefined, fallback: string): string {
  if (!value) return fallback;
  const hanjaIndex = STEMS.indexOf(value);
  if (hanjaIndex >= 0) return STEMS[hanjaIndex];
  const koIndex = STEMS_KO.indexOf(value);
  return koIndex >= 0 ? STEMS[koIndex] : fallback;
}

function normalizeBranch(value: string | undefined, fallback: string): string {
  if (!value) return fallback;
  const hanjaIndex = BRANCHES.indexOf(value);
  if (hanjaIndex >= 0) return BRANCHES[hanjaIndex];
  const koIndex = BRANCHES_KO.indexOf(value);
  return koIndex >= 0 ? BRANCHES[koIndex] : fallback;
}

function normalizeElement(value: string | undefined, fallback: OhaengKey): OhaengKey {
  if (!value) return fallback;
  return ELEMENT_BY_BACKEND_VALUE[value] ?? fallback;
}

function toStrengthLabel(label: string | undefined, fallback: SajuData['strength']['label']) {
  if (label === 'STRONG' || label === '신강') return '신강';
  if (label === 'WEAK' || label === '신약') return '신약';
  if (label === 'BALANCED' || label === '중화') return '중화';
  return fallback;
}

function toUsefulGodElement(value: string | undefined, fallback: OhaengKey): OhaengKey {
  if (!value) return fallback;
  const first = value.replace(/\(.+\)/, '').trim();
  return ELEMENT_BY_BACKEND_VALUE[first] ?? ELEMENT_BY_KO[first] ?? fallback;
}

function mainHidden(branch: string): string {
  const hidden = HIDDEN_STEMS[branch];
  return hidden ? hidden[hidden.length - 1] : branch;
}

function enrichPillar(pillar: SajuPillar, dayStem: string, yearBranch: string, isDay: boolean) {
  return {
    ...pillar,
    hiddenStems: HIDDEN_STEMS[pillar.branch] ? [...HIDDEN_STEMS[pillar.branch]] : [],
    tenGodStem: isDay ? { ko: '일간', hanja: '我' } : tenGod(dayStem, pillar.stem),
    tenGodBranch: tenGod(dayStem, mainHidden(pillar.branch)),
    stage: twelveStage(dayStem, pillar.branch),
    spirit: twelveSpirit(yearBranch, pillar.branch),
  };
}

function mergePillar(
  backend: BackendPillar | undefined,
  fallback: SajuPillar | null,
): SajuPillar | null {
  if (!fallback) return null;
  if (!backend) return fallback;

  const stem = normalizeStem(backend.stem, fallback.stem);
  const branch = normalizeBranch(backend.branch, fallback.branch);
  const stemIndex = STEMS.indexOf(stem);
  const branchIndex = BRANCHES.indexOf(branch);

  return {
    ...fallback,
    stem,
    branch,
    stemKo: stemIndex >= 0 ? STEMS_KO[stemIndex] : fallback.stemKo,
    branchKo: branchIndex >= 0 ? BRANCHES_KO[branchIndex] : fallback.branchKo,
    element: normalizeElement(backend.element?.stem, fallback.element as OhaengKey),
  };
}

function countElements(pillars: Array<SajuPillar | null>, backendPillars: BackendPillar[]) {
  const counts: SajuData['counts'] = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };

  for (const pillar of pillars) {
    if (pillar) counts[pillar.element as OhaengKey] += 1;
  }

  for (const backendPillar of backendPillars) {
    const branchElement = normalizeElement(backendPillar.element?.branch, 'earth');
    counts[branchElement] += 1;
  }

  return counts;
}

function normalizeBackendResponse(
  backend: BackendHomeAggregate,
  request: Required<Pick<SajuApiRequest, 'birthDate'>> & SajuApiRequest,
): SajuData {
  const fallback = calculateSaju(request.birthDate, request.birthTime ?? null);
  const byType = new Map((backend.pillars ?? []).map((pillar) => [pillar.type, pillar]));

  const year = mergePillar(byType.get('year'), fallback.year) ?? fallback.year;
  const month = mergePillar(byType.get('month'), fallback.month) ?? fallback.month;
  const day = mergePillar(byType.get('day'), fallback.day) ?? fallback.day;
  const hour = mergePillar(byType.get('hour'), fallback.hour);

  const dayStem = day.stem;
  const yearBranch = year.branch;
  const enrichedYear = enrichPillar(year, dayStem, yearBranch, false);
  const enrichedMonth = enrichPillar(month, dayStem, yearBranch, false);
  const enrichedDay = enrichPillar(day, dayStem, yearBranch, true);
  const enrichedHour = hour ? enrichPillar(hour, dayStem, yearBranch, false) : null;
  const activePillars = [enrichedYear, enrichedMonth, enrichedDay, enrichedHour].filter(Boolean);
  const counts = countElements(activePillars, backend.pillars ?? []);

  const usefulGod = backend.coreSummary?.usefulGods?.[0];
  const luckLabel = backend.coreSummary?.currentLuckCycle?.label ?? '';
  const currentLuck = fallback.daewoon[0];

  return {
    ...fallback,
    year: enrichedYear,
    month: enrichedMonth,
    day: enrichedDay,
    hour: enrichedHour,
    ohaeng: counts,
    counts,
    strength: {
      score: backend.coreSummary?.strength?.score ?? fallback.strength.score,
      label: toStrengthLabel(backend.coreSummary?.strength?.label, fallback.strength.label),
      desc: fallback.strength.desc,
    },
    yongshin: {
      element: toUsefulGodElement(usefulGod, fallback.yongshin.element),
      reason: usefulGod
        ? `백엔드 계산 결과에서 ${usefulGod}이(가) 용신으로 제안됐어요.`
        : fallback.yongshin.reason,
    },
    daewoon: luckLabel && currentLuck
      ? [{ ...currentLuck, stem: luckLabel[0] ?? currentLuck.stem, branch: luckLabel[1] ?? currentLuck.branch }, ...fallback.daewoon.slice(1)]
      : fallback.daewoon,
    dayMaster: {
      stem: dayStem,
      ko: backend.coreSummary?.dayMaster ?? day.stemKo,
      element: day.element,
    },
  };
}

function getBackendBaseUrl() {
  return process.env.MYUNG_BACKEND_API_BASE_URL?.replace(/\/+$/, '');
}

export async function POST(request: Request) {
  const body = (await request.json()) as SajuApiRequest;

  if (!body.birthDate) {
    return NextResponse.json({ error: 'birthDate is required.' }, { status: 400 });
  }

  const baseUrl = getBackendBaseUrl();
  const fallback = calculateSaju(body.birthDate, body.birthTime ?? null);

  if (!baseUrl) {
    return NextResponse.json(fallback, { headers: { 'x-myung-saju-source': 'local' } });
  }

  try {
    const response = await fetch(`${baseUrl}/api/v1/home/bootstrap`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nickname: body.nickname || 'MYUNG',
        birthDate: body.birthDate,
        birthTime: body.birthTime ?? null,
        timezone: body.timezone || 'Asia/Seoul',
        calendarInputType: body.calendarInputType || 'SOLAR',
      }),
      cache: 'no-store',
    });

    if (!response.ok) {
      return NextResponse.json(fallback, { headers: { 'x-myung-saju-source': 'local' } });
    }

    const backend = (await response.json()) as BackendHomeAggregate;
    return NextResponse.json(normalizeBackendResponse(backend, body as Required<Pick<SajuApiRequest, 'birthDate'>> & SajuApiRequest), {
      headers: { 'x-myung-saju-source': 'backend' },
    });
  } catch {
    return NextResponse.json(fallback, { headers: { 'x-myung-saju-source': 'local' } });
  }
}
