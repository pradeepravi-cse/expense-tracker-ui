import { clsx, type ClassValue } from 'clsx';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export type SupportedCurrency = 'MYR' | 'INR';

export const currencyLocale: Record<SupportedCurrency, string> = {
  MYR: 'ms-MY',
  INR: 'en-IN',
};

export function formatCurrency(
  amount: number,
  currency: SupportedCurrency,
  decimals = 2
): string {
  if (typeof amount !== 'number' || isNaN(amount)) return '';

  const options: Intl.NumberFormatOptions = {
    style: 'currency',
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  };

  return new Intl.NumberFormat(currencyLocale[currency], options).format(
    amount
  );
}

export const formatDate = (date: string | Date) =>
  dayjs(date).format('YYYY-MM-DD');

export function formatToLocalDateTime(
  date: string | Date,
  options: Intl.DateTimeFormatOptions = {}
): string {
  if (!date) return '';

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  return dateObj.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    ...options,
  });
}

dayjs.extend(utc);

export const getLast12Months = () => {
  const month: { month: string; start: string; end: string; label: string }[] =
    [];

  const today = dayjs();

  for (let i = 0; i < 12; i++) {
    const date = today.endOf('month').subtract(i, 'month');
    month.push({
      month: date.format('YYYY-MM'),
      label: date.format('MMM YYYY'),
      start: date.startOf('month').format('YYYY-MM-DD'),
      end: date.endOf('month').format('YYYY-MM-DD'),
    });
  }

  return month;
};
