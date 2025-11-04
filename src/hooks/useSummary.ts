import { useQuery, type QueryKey } from '@tanstack/react-query';
import { useApiClient } from './useApiClient';

// What the backend REALLY returns for /expenses (one page)
export interface RegularExpense {
  id: string;
  title: string;
  amount: number;
  date: string;
  type: string;
  currency: 'MYR' | 'INR';
  channel: string;
  category: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  isRecurring: boolean;
}
export interface SummaryData {
  income: number;
  expense: number;
  savings: number;
  netPosition: number;
  potentialNextMonthCCBill: number;
}

export type ExpenseQueryParams = {
  order?: 'ASC' | 'DESC';
  month?: string;
  currency?: 'MYR' | 'INR';
};

interface UseSummaryProps {
  params?: ExpenseQueryParams;
  enabled?: boolean;
  queryKey?: QueryKey;
  paramKey?: string;
}

export function useSummary({ params, enabled = true }: UseSummaryProps) {
  const apiClient = useApiClient();
  const query = useQuery<SummaryData>({
    queryKey: ['summary', JSON.stringify(params)],
    enabled,
    queryFn: async () => {
      try {
        const res = await apiClient.get('/summary', { params });

        if (res) {
          return res.data?.data;
        }
      } catch (err) {
        return {
          income: 0,
          expense: 0,
          savings: 0,
          netPosition: 0,
        };
        console.error(err);
      }
    },
  });

  return { ...query };
}
