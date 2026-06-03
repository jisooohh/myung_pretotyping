'use client';

import { useEffect, useState } from 'react';

// Returns true only after the component has mounted on the client.
// Use to gate rendering that depends on persisted (localStorage) state so the
// server-rendered markup and the first client render stay identical.
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setHydrated(true));
    return () => cancelAnimationFrame(frame);
  }, []);
  return hydrated;
}
