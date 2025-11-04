'use client';

import { ChevronDownIcon } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface CalendarProps {
  id?: string;
  value: Date | undefined;
  onChange: (data: Date | undefined) => void;
  startYear?: number;
  endYear?: number;
}

export function DatePicker({
  value,
  onChange,
  id,
  startYear = 2000,
  endYear = 2100,
}: CalendarProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className='flex flex-col gap-3' id={id}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            id='date'
            className='w-full justify-between font-normal'
          >
            {value ? (
              value.toLocaleDateString()
            ) : (
              <span className='text-muted-foreground'>Select date</span>
            )}
            <ChevronDownIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-auto overflow-hidden p-0' align='start'>
          <Calendar
            mode='single'
            selected={value}
            captionLayout='dropdown'
            onSelect={(e) => {
              onChange(e);
              setOpen(false);
            }}
            startMonth={new Date(startYear, 0)}
            endMonth={new Date(endYear, 0)}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
