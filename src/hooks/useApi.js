import { useState, useCallback } from 'react';
import { useToast } from '../context/ToastContext';

export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const { error: toastError } = useToast();

  const execute = useCallback(async (apiCall, { silent = false } = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiCall();
      return res.data?.data ?? res.data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Something went wrong';
      setError(msg);
      if (!silent) toastError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [toastError]);

  return { loading, error, execute };
}
