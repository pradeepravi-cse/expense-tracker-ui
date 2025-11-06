import { useInfiniteQuery, type QueryKey } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useApiClient } from './useApiClient';

// What the backend REALLY returns for /expenses (one page)
export interface ExpenseItem {
  id: string;
  title: string;
  amount: number;
  date: string;
  type: string;
  currency: string;
  channel: string;
  category: string;
  notes: string;
  billingMonth: string;
}

// Raw shape coming from API before we normalize it
type ExpensesApiPageRaw = {
  success: boolean;
  data: {
    items: ExpenseItem[];
    total: number;
    page: string; // comes as string ("1")
    limit: string; // comes as string ("20")
  };
};

// Clean shape we will *use inside the hook and return to the caller*
export type ExpensesPage = {
  items: ExpenseItem[];
  total: number;
  page: number;
  limit: number;
};

export type ExpenseQueryParams = {
  q?: string;
  order?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
  start?: string;
  end?: string;
  currency?: 'MYR' | 'INR';
};

interface UseExpensesProps {
  params?: ExpenseQueryParams;
  enabled?: boolean;
  queryKey?: QueryKey;
  pageParamKey?: string; // defaults to 'page'
  limitParamKey?: string; // defaults to 'limit'
}

export function useExpenses({
  params,
  enabled = true,
  pageParamKey = 'page',
  limitParamKey = 'limit',
}: UseExpensesProps) {
  const apiClient = useApiClient();

  // stable query key so React Query cache doesn't thrash
  const key = ['expenses', JSON.stringify(params)];

  const query = useInfiniteQuery<ExpensesPage>({
    queryKey: key,
    enabled,
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      // build query params for this request
      const qp: Record<string, unknown> = { ...(params ?? {}) };

      // always send the page we're currently loading
      if (pageParam != null) {
        qp[pageParamKey] = pageParam;
      }

      // preserve caller's limit if provided
      if (params?.[limitParamKey as 'limit']) {
        qp[limitParamKey] = params[limitParamKey as 'limit'];
      }

      // call API
      const res = await apiClient.get('/expenses', { params: qp });

      // res.data matches ExpensesApiPageRaw
      const raw = res.data as ExpensesApiPageRaw;

      // normalize into ExpensesPage
      const normalized: ExpensesPage = {
        items: raw.data.items ?? [],
        total: Number(raw.data.total ?? 0),
        page: Number(raw.data.page ?? 1),
        limit: Number(raw.data.limit ?? 20),
      };

      return normalized;
    },
    getNextPageParam: (lastPage) => {
      // lastPage is already normalized
      const { page, limit, total } = lastPage;
      const reachedEnd = page * limit >= total;
      return reachedEnd ? undefined : page + 1;
    },
    refetchOnWindowFocus: false,
    staleTime: 0,
  });

  // DEBUG if you want:
  // console.log('react-query data:', query.data);

  // flatten all loaded pages' items
  const items = useMemo(
    () =>
      (query.data?.pages ?? []).flatMap((p) =>
        Array.isArray(p.items) ? p.items : []
      ),
    [query.data]
  );

  // pick meta info from the latest page (or fallback defaults)
  const meta = useMemo<ExpensesPage>(() => {
    const pages = query.data?.pages ?? [];
    const last = pages[pages.length - 1];
    const first = pages[0];

    return (
      last ??
      first ?? {
        items: [],
        total: 0,
        page: 1,
        limit: (params?.[limitParamKey as 'limit'] as number | undefined) ?? 20,
      }
    );
  }, [query.data, params, limitParamKey]);

  const total = meta.total;
  const page = meta.page;
  const limit = meta.limit;
  const pageCount = limit > 0 ? Math.ceil(total / limit) : 0;

  return {
    ...query,
    items,
    total,
    page,
    limit,
    pageCount,
  };
}
