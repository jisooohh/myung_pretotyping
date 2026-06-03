'use client';

import { useQuery } from '@tanstack/react-query';
import { useUserStore } from '@/store/useUserStore';
import { fetchSaju } from '@/services/sajuService';

export function useSaju() {
  const { user } = useUserStore();
  return useQuery({
    queryKey: ['saju', user.name, user.birthDate, user.birthTime],
    queryFn: () => fetchSaju({
      nickname: user.name || 'MYUNG',
      birthDate: user.birthDate,
      birthTime: user.birthTime,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Seoul',
      calendarInputType: 'SOLAR',
    }),
    enabled: !!user.birthDate,
    staleTime: Infinity,
  });
}
