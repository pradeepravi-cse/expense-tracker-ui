import { AddExpense } from '@/components/addExpense/addExpense';
import { Link, Outlet, createRootRoute } from '@tanstack/react-router';
import { BadgeDollarSign } from 'lucide-react';

const RootComponent = () => {
  return (
    <>
      <div className='h-15 w-auto flex px-4 md:px-30 border-b border-gray-100 items-center justify-between gap-2'>
        <h1 className='text-sm md:text-xl font-bold text-slate-700 whitespace-nowrap overflow-hidden text-ellipsis flex items-center gap-1'>
          <BadgeDollarSign /> Expense Tracker
        </h1>
        <nav className='flex items-center gap-4 '>
          <div className='list-none p-0 border border-slate-900 rounded-full flex overflow-hidden'>
            <Link
              to='/$lang/dashboard'
              params={{ lang: 'my' }}
              className='text-sm md:text-md font-medium text-slate-600 hover:text-white hover:bg-slate-900 px-4 py-2 transition-all ease-in duration-100'
              activeProps={{
                className: 'bg-slate-900 !text-white',
              }}
            >
              🇲🇾 Malaysia
            </Link>
            <Link
              to='/$lang/dashboard'
              params={{ lang: 'in' }}
              className='text-sm md:text-md font-medium text-slate-600 hover:text-white hover:bg-slate-900 px-4 py-2'
              activeProps={{
                className: 'bg-slate-900 !text-white',
              }}
            >
              🇮🇳 India
            </Link>
          </div>
          <AddExpense />
        </nav>
      </div>
      <div className='py-4 px-4 md:px-30'>
        <Outlet />
      </div>
    </>
  );
};

export const Route = createRootRoute({
  component: RootComponent,
});
