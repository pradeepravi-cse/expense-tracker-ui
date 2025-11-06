import { useApiClient } from '@/hooks/useApiClient';
import {
  categoryTypes,
  channelTypes,
  currencyTypes,
  expenseTypes,
} from '@/lib/constants';
import { formatDate } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { DatePicker } from '../datepicker/datepicker';
import { Button } from '../ui/button';
import { Field, FieldLabel } from '../ui/field';
import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { SheetFooter } from '../ui/sheet';
import { Textarea } from '../ui/textarea';

const formSchema = z
  .object({
    title: z.string('Title is required').min(1),
    amount: z
      .number('Amount is required')
      .min(0.01, 'Amount must be greater than 0'),
    date: z.date('Date is required'),
    type: z.string('Type is required').min(1, 'Type is required'),
    currency: z.enum(['MYR', 'INR'], 'Currency is required'),
    channel: z.string('Channel is required'),
    category: z.string('Category is required').min(1, 'Category is required'),
    notes: z.string().optional(),
    billingMonth: z.date().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.channel === 'creditCard' && !data.billingMonth) {
      ctx.addIssue({
        code: 'custom',
        path: ['billingMonth'],
        message: 'Billing Month is required',
      });
    }
  });

type FormValues = z.infer<typeof formSchema>;

export const ExpenseForm = ({ handleClose }: { handleClose: () => void }) => {
  const {
    handleSubmit,
    control,
    formState: { errors },
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: 'onSubmit',
  });
  console.log(errors);
  const apiClient = useApiClient();
  const queryClient = useQueryClient();
  const onSubmit = (data: FormValues) => {
    try {
      apiClient
        .post('/regular-expenses', {
          ...data,
          date: formatDate(data.date),

          ...(data.channel === 'creditCard' &&
            data.billingMonth && {
              billingMonth: formatDate(data.billingMonth),
            }),
        })
        .then((res) => {
          if (res) {
            queryClient.invalidateQueries({
              predicate: (q) =>
                q.queryKey[0] === 'expenses' || q.queryKey[0] === 'summary',
            });
          }
        });
    } catch (err) {
      console.log(err);
    } finally {
      handleClose();
    }
  };

  const isCCSpending = watch('channel') === 'creditCard';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
      <Controller
        name='title'
        control={control}
        render={({ field }) => (
          <Field>
            <FieldLabel htmlFor='expense-title'>Title</FieldLabel>
            <Input
              id='expense-title'
              placeholder='Enter expense title'
              {...field}
            />
            {errors.title && (
              <p className='text-sm text-red-600 mt-1'>
                {errors.title.message}
              </p>
            )}
          </Field>
        )}
      />
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <Controller
          name='type'
          control={control}
          render={({ field }) => (
            <Field>
              <FieldLabel htmlFor='expense-type-select'>Type</FieldLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className='w-full' id='expense-type-select'>
                  <SelectValue placeholder='Select Type' />
                </SelectTrigger>
                <SelectContent>
                  {expenseTypes &&
                    Object.entries(expenseTypes).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {errors.type && (
                <p className='text-sm text-red-600 mt-1'>
                  {errors.type.message}
                </p>
              )}
            </Field>
          )}
        />
        <Controller
          name='date'
          control={control}
          render={({ field }) => (
            <Field>
              <FieldLabel htmlFor='expense-date'>Date</FieldLabel>
              <DatePicker
                value={field.value}
                onChange={field.onChange}
                id='expense-date'
              />
              {errors.date && (
                <p className='text-sm text-red-600 mt-1'>
                  {errors.date.message}
                </p>
              )}
            </Field>
          )}
        />
        <Controller
          name='amount'
          control={control}
          render={({ field }) => (
            <Field>
              <FieldLabel htmlFor='expense-amount'>Amount</FieldLabel>
              <Input
                id='expense-amount'
                type='number'
                step='0.01'
                placeholder='Enter amount'
                {...field}
                value={field.value || ''}
                onChange={(e) => field.onChange(parseFloat(e.target.value))}
              />
              {errors.amount && (
                <p className='text-sm text-red-600 mt-1'>
                  {errors.amount.message}
                </p>
              )}
            </Field>
          )}
        />
        <Controller
          name='currency'
          control={control}
          render={({ field }) => (
            <Field>
              <FieldLabel htmlFor='expense-currency-type-select'>
                Currency
              </FieldLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  className='w-full'
                  id='expense-currency-type-select'
                >
                  <SelectValue placeholder='Select Currency Type' />
                </SelectTrigger>
                <SelectContent>
                  {currencyTypes &&
                    Object.entries(currencyTypes).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {errors.currency && (
                <p className='text-sm text-red-600 mt-1'>
                  {errors.currency.message}
                </p>
              )}
            </Field>
          )}
        />
        <Controller
          name='channel'
          control={control}
          render={({ field }) => (
            <Field>
              <FieldLabel htmlFor='expense-channel-select'>Channel</FieldLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className='w-full' id='expense-channel-select'>
                  <SelectValue placeholder='Select Channel' />
                </SelectTrigger>
                <SelectContent>
                  {channelTypes &&
                    Object.entries(channelTypes).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {errors.channel && (
                <p className='text-sm text-red-600 mt-1'>
                  {errors.channel.message}
                </p>
              )}
            </Field>
          )}
        />

        {isCCSpending && (
          <Controller
            name='billingMonth'
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel htmlFor='billing-date'>Billing Date</FieldLabel>
                <DatePicker
                  value={field.value}
                  onChange={field.onChange}
                  id='billing-date'
                />
                {errors.date && (
                  <p className='text-sm text-red-600 mt-1'>
                    {errors.billingMonth?.message}
                  </p>
                )}
              </Field>
            )}
          />
        )}
        <Controller
          name='category'
          control={control}
          render={({ field }) => (
            <Field>
              <FieldLabel htmlFor='expense-category-select'>
                Category
              </FieldLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className='w-full' id='expense-category-select'>
                  <SelectValue placeholder='Select Category' />
                </SelectTrigger>
                <SelectContent>
                  {categoryTypes &&
                    Object.entries(categoryTypes).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className='text-sm text-red-600 mt-1'>
                  {errors.category.message}
                </p>
              )}
            </Field>
          )}
        />
      </div>

      <Controller
        name='notes'
        control={control}
        render={({ field }) => (
          <Field>
            <FieldLabel htmlFor='expense-notes'>Notes</FieldLabel>
            <Textarea
              id='expense-notes'
              placeholder='Additional notes...'
              {...field}
            />
            {errors.notes && (
              <p className='text-sm text-red-600 mt-1'>
                {errors.notes.message}
              </p>
            )}
          </Field>
        )}
      />
      <SheetFooter>
        <Button type='submit'>Add Expense</Button>
      </SheetFooter>
    </form>
  );
};
