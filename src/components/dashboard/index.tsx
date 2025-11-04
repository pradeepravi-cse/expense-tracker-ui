import { getLast12Months } from '@/lib/utils';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Charts } from './charts';
import { ExpenseList } from './expenstList';
import { Summary } from './Summary';

export const Dashboard = () => {
  const monthOptions = getLast12Months();

  const [selectedMonth, setSelectedMonth] = useState<string>(
    monthOptions[0].month
  );

  const { start, end } = useMemo(() => {
    const { start, end } = monthOptions.find(
      (m) => m.month === selectedMonth
    ) ?? { start: '', end: '' };

    return { start, end };
  }, [monthOptions, selectedMonth]);

  const summaryRef = useRef<HTMLDivElement>(null);
  const chartsRef = useRef<HTMLDivElement>(null);
  const [remainingHeight, setRemainingHeight] = useState<number>(300);

  useEffect(() => {
    const summaryHeight =
      summaryRef.current?.getBoundingClientRect().height || 0;
    const chartsHeight = chartsRef.current?.getBoundingClientRect().height || 0;
    const totalUsedHeight = summaryHeight + chartsHeight;
    const viewportHeight = window.innerHeight;
    setRemainingHeight(viewportHeight - totalUsedHeight - 140);
  }, [summaryRef, chartsRef]);

  return (
    <div className='flex flex-col gap-4 h-full'>
      <div ref={summaryRef} className='flex flex-col gap-4'>
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className='w-[300px]' id='expense-type-select'>
            <SelectValue placeholder='Select Type' />
          </SelectTrigger>
          <SelectContent>
            {monthOptions.map(({ month, label }) => (
              <SelectItem key={month} value={month}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Summary selectedMonth={selectedMonth} />
      </div>
      <div ref={chartsRef}>
        <Charts start={start} end={end} />
      </div>
      <ExpenseList height={remainingHeight} startDate={start} endDate={end} />
    </div>
  );
};
