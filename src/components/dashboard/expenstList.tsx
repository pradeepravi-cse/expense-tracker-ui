import { useExpenses, type ExpenseItem } from '@/hooks/useExpenses';
import { categoryTypes, channelTypes, expenseTypes } from '@/lib/constants';
import { formatCurrency, formatToLocalDateTime } from '@/lib/utils';
import { useParams } from '@tanstack/react-router';
import { createColumnHelper } from '@tanstack/react-table';
import { DataTable } from '../datatable/datatable';
import { Card, CardContent } from '../ui/card';

const expenstListColumnHelper = createColumnHelper<ExpenseItem>();

export const ExpenseList = ({
  height = 300,
  startDate,
  endDate,
}: {
  height?: number;
  startDate: string;
  endDate: string;
}) => {
  const { lang } = useParams({ from: '/$lang/dashboard' });
  const { items, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useExpenses({
      params: {
        limit: 20,
        order: 'DESC',
        start: startDate,
        end: endDate,
        currency: lang === 'my' ? 'MYR' : 'INR',
      },
    });
  const columns = [
    expenstListColumnHelper.accessor('title', {
      header: 'Title',
      cell: (info) => info?.getValue(),
    }),
    expenstListColumnHelper.accessor('type', {
      header: 'Type',
      cell: (info) => (
        <div className='flex items-center gap-1'>
          {expenseTypes[info.getValue() as keyof typeof expenseTypes] ||
            info?.getValue()}
        </div>
      ),
    }),
    expenstListColumnHelper.accessor('date', {
      header: 'Date',
      cell: (info) => formatToLocalDateTime(info?.getValue()),
    }),

    expenstListColumnHelper.accessor('amount', {
      header: 'Amount',
      cell: (info) =>
        formatCurrency(
          Number(info.getValue()),
          info?.row.original?.currency as 'MYR' | 'INR'
        ),
    }),

    expenstListColumnHelper.accessor('channel', {
      header: 'Channel',
      cell: (info) =>
        channelTypes[info?.getValue() as keyof typeof channelTypes] ||
        info.getValue(),
    }),
    expenstListColumnHelper.accessor('category', {
      header: 'Category',
      cell: (info) =>
        categoryTypes[info?.getValue() as keyof typeof categoryTypes] ||
        info.getValue(),
    }),
  ];

  const handleIntersectEnd = () => {
    if (hasNextPage && !isFetchingNextPage) {
      // Let your existing hook paginate; if you instead want serverParams.page++,
      // you can do this:
      // setServerParams((prev) => ({ ...prev, page: (prev.page ?? 1) + 1 }));
      fetchNextPage();
    }
  };

  return (
    <Card className='p-0' style={{ height: height > 300 ? height : 300 }}>
      <CardContent className='p-1 h-full'>
        <DataTable<ExpenseItem>
          columns={columns}
          data={items}
          isLoading={isLoading}
          isFetchingMore={isFetchingNextPage}
          onIntersectEnd={handleIntersectEnd}
          canLoadMore={hasNextPage}
          className='h-full border-0'
          tableBodyClassName='h-full'
        />
      </CardContent>
    </Card>
  );
};
