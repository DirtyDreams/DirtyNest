import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatTime(date: Date | string) {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
  });
}

export function formatDateTime(date: Date | string) {
  return `${formatDate(date)} ${formatTime(date)}`;
}

export function truncate(text: string, length: number) {
  return text.length > length ? `${text.slice(0, length)}...` : text;
}

export function isNullOrEmpty(value: string | null | undefined) {
  return value === null || value === undefined || value.trim() === '';
}