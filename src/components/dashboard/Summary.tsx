import { useSummary } from '@/hooks/useSummary';
import { formatCurrency } from '@/lib/utils';
import { useParams } from '@tanstack/react-router';
import {
  BanknoteArrowDownIcon,
  BanknoteArrowUpIcon,
  BanknoteXIcon,
} from 'lucide-react';
import { useMemo, type FC, type JSX } from 'react';
import { Skeleton } from '../ui/skeleton';

interface SummaryCardProps {
  title: string;
  amount: number;
  footNote?: string | JSX.Element;
  amountColor?: string;
  currency: 'MYR' | 'INR';
  isLoading?: boolean;
  percent?: number;
  icon?: JSX.Element;
}
const SummaryCard = ({
  title,
  amount,
  footNote,
  amountColor = 'text-slate-700',
  currency = 'MYR',
  isLoading = false,
  percent,
  icon,
}: SummaryCardProps) => {
  return (
    <div className='p-4 bg-white rounded-lg shadow flex flex-col gap-1'>
      {isLoading ? (
        <>
          <Skeleton className='h-4 w-2/4' />
          <Skeleton className='h-8' />
          <Skeleton className='h-3 w-2/4' />
        </>
      ) : (
        <>
          <h3 className='text-sm text-slate-500'>{title}</h3>
          <p
            className={`text-md md:text-xl font-medium p-0 ${amountColor} flex gap-1 items-center`}
          >
            {icon}
            {formatCurrency(amount, currency)}
            {percent && (
              <small className='text-xs'>({percent?.toFixed(2)}%)</small>
            )}
          </p>
          <p className='text-xs text-slate-400 p-0'>{footNote}</p>
        </>
      )}
    </div>
  );
};

interface SummaryProps {
  selectedMonth: string;
}
export const Summary: FC<SummaryProps> = ({ selectedMonth }) => {
  const { lang } = useParams({ from: '/$lang/dashboard' });
  const currency = lang === 'my' ? 'MYR' : 'INR';

  const { data, isLoading } = useSummary({
    params: { month: selectedMonth, currency },
  });

  const netPositionRatio = useMemo(
    () => ((data?.netPosition ?? 0) / (data?.income ?? 0)) * 100,
    [data]
  );

  const netPositionMessage = useMemo(() => {
    if (netPositionRatio >= 20) {
      return <span className='font-bold text-green-700'>Excellent</span>;
    } else if (netPositionRatio >= 0) {
      return (
        <span className='font-bold text-amber-600'>Needs Improvement</span>
      );
    } else {
      return <span className='font-bold text-destructive'>Critical</span>;
    }
  }, [netPositionRatio]);

  const netPositionAmountIcon = useMemo(() => {
    if (netPositionRatio >= 20) {
      return (
        <span className='font-bold text-green-700'>
          <BanknoteArrowUpIcon />
        </span>
      );
    } else if (netPositionRatio >= 0) {
      return (
        <span className='font-bold text-amber-600'>
          <BanknoteXIcon />
        </span>
      );
    } else {
      return (
        <span className='font-bold text-destructive'>
          <BanknoteArrowDownIcon />
        </span>
      );
    }
  }, [netPositionRatio]);

  return (
    <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
      <SummaryCard
        title='Income (Malaysia)'
        amount={data?.income ?? 0}
        footNote='incl. remittances'
        currency={currency}
        isLoading={isLoading}
      />
      <SummaryCard
        title='Outflows'
        amount={data?.expense ?? 0}
        footNote='Expenses + Bills, excl CC'
        currency={currency}
        isLoading={isLoading}
      />
      <SummaryCard
        title='Savings (Est.)'
        amount={data?.savings ?? 0}
        footNote='Income - Outflows'
        isLoading={isLoading}
        currency={currency}
        {...(data?.savings &&
          data?.savings > 0 &&
          data?.income &&
          data?.income > 0 && {
            percent: ((data?.savings ?? 0) / (data?.income ?? 0)) * 100,
          })}
      />
      <SummaryCard
        title='Net Position'
        amount={data?.netPosition ?? 0}
        icon={netPositionAmountIcon}
        footNote={netPositionMessage}
        isLoading={isLoading}
        currency={currency}
      />
    </div>
  );
};
