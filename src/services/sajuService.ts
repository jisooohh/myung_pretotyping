import { calculateSaju } from '@/lib/saju';
import type { SajuData } from '@/types';

export interface SajuRequest {
  nickname?: string;
  birthDate: string;
  birthTime: string | null;
  timezone?: string;
  calendarInputType?: 'SOLAR' | 'LUNAR';
}

export async function fetchSaju(request: SajuRequest): Promise<SajuData> {
  const fallback = calculateSaju(request.birthDate, request.birthTime);

  try {
    const response = await fetch('/api/saju', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!response.ok) return fallback;

    return (await response.json()) as SajuData;
  } catch {
    return fallback;
  }
}
