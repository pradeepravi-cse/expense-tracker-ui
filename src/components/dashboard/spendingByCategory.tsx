import { useApiClient } from '@/hooks';
import { categoryTypes } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils';
import { useParams } from '@tanstack/react-router';
import { FolderOpen } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import {
  type TooltipProps,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '../ui/empty';
import { Spinner } from '../ui/spinner';
import type { ChartProps } from './charts';

type BreakdownItem = {
  category: string;
  total: number;
};

type ChartDatum = {
  category: string;
  total: number;
  breakdown?: BreakdownItem[];
};

interface CustomToolTipProps extends TooltipProps<number, string> {
  currency?: 'MYR' | 'INR';
}
const SpendingTooltip = ({
  active,
  payload,
  label,
  currency = 'MYR',
}: CustomToolTipProps) => {
  if (!active || !payload || payload.length === 0) return null;
  const datum = payload[0].payload as ChartDatum;

  return (
    <div
      className='rounded-md border bg-background p-3 text-sm shadow-md'
      style={{
        minWidth: 180,
      }}
    >
      <div className='mb-1 font-medium'>
        {categoryTypes[label as keyof typeof categoryTypes]}
      </div>
      <div className='font-semibold'>
        {formatCurrency(datum.total, currency)}
      </div>

      {datum.breakdown && datum.breakdown.length > 0 && (
        <div className='mt-2 space-y-1'>
          <div className='text-xs font-medium text-muted-foreground'>
            Breakdown:
          </div>
          {datum.breakdown.map((b) => (
            <div
              key={b.category}
              className='flex justify-between text-xs text-muted-foreground'
            >
              <span>
                {' '}
                {categoryTypes[b.category as keyof typeof categoryTypes]}
              </span>
              <span>{formatCurrency(b.total, currency)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const SpendingByCategory = ({ start, end }: ChartProps) => {
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const apiClient = useApiClient();
  const { lang } = useParams({ from: '/$lang/dashboard' });
  const currency = lang === 'my' ? 'MYR' : 'INR';
  const getData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get('/expenses-chart/category', {
        params: { start, end, currency },
      });

      if (res.data.data) {
        setChartData(res.data?.data);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setIsLoading(false);
    }
  }, []);
  useEffect(() => {
    getData();
  }, [getData]);
  return (
    <div className='rounded-lg border bg-card p-4 shadow-sm'>
      <div className='mb-4 flex items-baseline justify-between'>
        <h2 className='text-base font-semibold leading-none tracking-tight'>
          Spending by Category
        </h2>
        <span className='text-xs text-muted-foreground'>
          Top 4 + Other Categories
        </span>
      </div>

      <div className='h-[280px] w-full'>
        {isLoading && (
          <div className='flex h-full w-full items-center justify-center'>
            <Spinner />
          </div>
        )}
        {!isLoading && chartData && chartData.length > 0 ? (
          <ResponsiveContainer
            width='100%'
            height='100%'
            key={JSON.stringify(chartData)}
          >
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 20, left: 40, bottom: 0 }}
              barCategoryGap='5%'
            >
              <CartesianGrid
                strokeDasharray='3 3'
                vertical={false}
                strokeOpacity={0.2}
              />
              <XAxis
                dataKey='category'
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12 }}
                tickFormatter={(value: string) =>
                  categoryTypes[value as keyof typeof categoryTypes]
                }
                allowDataOverflow
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={60}
                tick={{ fontSize: 12 }}
                tickFormatter={(v: number) => formatCurrency(v, currency)}
              />
              <Tooltip
                cursor={{ fillOpacity: 0.08 }}
                content={<SpendingTooltip currency={currency} />}
              />
              <Bar dataKey='total' radius={[4, 4, 0, 0]}>
                {chartData.map((entry, idx) => (
                  <Cell
                    key={`cell-${entry}`}
                    fill={`oklch(var(--chart-${(idx % 5) + 1}))`}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <Empty className='border-none'>
            <EmptyHeader>
              <EmptyMedia variant='icon'>
                <FolderOpen />
              </EmptyMedia>
              <EmptyTitle>No Data</EmptyTitle>
              <EmptyDescription>No records found to display.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </div>
    </div>
  );
};
