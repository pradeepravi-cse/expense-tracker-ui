import { useParams } from '@tanstack/react-router';
import { SpendingByCategory } from './spendingByCategory';
import { SpendingByChannel } from './spendingByChannel';

export interface ChartProps {
  start: string;
  end: string;
}
export const Charts = (props: ChartProps) => {
  const { lang } = useParams({ from: '/$lang/dashboard' });
  return (
    <div
      className='grid grid-cols-1 md:grid-cols-2 gap-4'
      key={`${lang}-${props.start}-${props.end}`}
    >
      <SpendingByCategory {...props} />
      <SpendingByChannel {...props} />
    </div>
  );
};
