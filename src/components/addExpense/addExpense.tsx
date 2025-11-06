import { Plus } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '../ui/sheet';
import { ExpenseForm } from './expenseForm';

export const AddExpense = () => {
  const [open, setOpen] = useState<boolean>(false);

  const handleClose = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Button onClick={() => setOpen(true)}>
        <Plus /> Add
      </Button>
      <SheetContent className='w-full sm:max-w-full md:w-[600px] md:max-w-[600px] overflow-auto'>
        <SheetHeader>
          <SheetTitle>Add New Expense</SheetTitle>
          <SheetDescription>
            Add your expenses quickly and easily.
          </SheetDescription>
          <div className='py-4 flex flex-col gap-4'>
            <Separator className='mb-2' />
            <ExpenseForm handleClose={handleClose} />
          </div>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
};
