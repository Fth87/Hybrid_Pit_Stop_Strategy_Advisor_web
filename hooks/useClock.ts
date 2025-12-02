'use client';

import { useState, useEffect, useCallback } from 'react';

export function useClock(hasCircuit: boolean) {
  const [currentTime, setCurrentTime] = useState<string>('--:--');

  const updateClock = useCallback(() => {
    if (!hasCircuit) {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      setCurrentTime(`${h}:${m}`);
    }
  }, [hasCircuit]);

  useEffect(() => {
    updateClock();
    const interval = setInterval(updateClock, 60000);
    return () => clearInterval(interval);
  }, [updateClock]);

  return { currentTime, setCurrentTime };
}
