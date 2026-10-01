import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString?: string | Date | null): string {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return 'N/A'
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export function formatDateTime(dateString?: string | Date | null): string {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return 'N/A'
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function formatCurrencyLPA(ctc?: number | null): string {
  if (ctc == null) return 'N/A'
  return `₹ ${ctc} LPA`
}

export function isDeadlinePassed(deadlineString?: string | Date | null): boolean {
  if (!deadlineString) return false
  const d = new Date(deadlineString)
  if (isNaN(d.getTime())) return false
  // If stored at midnight UTC (00:00:00), treat deadline as evening 6:00 PM IST (18:00 IST / 12:30 UTC)
  if (d.getUTCHours() === 0 && d.getUTCMinutes() === 0 && d.getUTCSeconds() === 0) {
    const cutoff = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 12, 30, 0, 0))
    return Date.now() > cutoff.getTime()
  }
  return Date.now() > d.getTime()
}

