import { useState, useEffect } from 'react';
import { adminApi } from '../services/api';

export function usePlanLimits() {
  const [limits,  setLimits]  = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.planUsage()
      .then(r => setLimits(r.data?.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const isAtLimit = (resource) => {
    if (!limits || !limits[resource]) return false;
    const { used, limit } = limits[resource];
    return limit < 9999 && used >= limit;
  };

  return { limits, loading, isAtLimit };
}
