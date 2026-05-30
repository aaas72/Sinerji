import useSWR, { SWRConfiguration } from 'swr';
import api from '@/services/api';

const fetcher = (url: string) => api.get(url).then(res => res.data.data);

export function useFetch<T = any>(url: string | null, config?: SWRConfiguration) {
  const { data, error, isLoading, mutate } = useSWR<T>(url, fetcher, {
    revalidateOnFocus: false, // Prevent excessive refetching on window focus
    dedupingInterval: 10000,   // Dedupe identical requests within 10 seconds
    ...config,
  });

  return {
    data,
    error,
    loading: isLoading,
    mutate,
  };
}
