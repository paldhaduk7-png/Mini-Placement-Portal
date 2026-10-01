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

export function formatInterviewTime(timeStr?: string | null): string {
  if (!timeStr || !timeStr.trim()) return 'N/A'
  const trimmed = timeStr.trim()
  
  // Check if it already has AM or PM
  const match12 = trimmed.match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/i)
  if (match12) {
    let h = parseInt(match12[1], 10)
    if (h === 0) h = 12
    if (h > 12) h = h % 12 || 12
    return `${String(h).padStart(2, '0')}:${match12[2]} ${match12[3].toUpperCase()}`
  }

  // Check 24-hr format like "17:00", "05:00", "14:30"
  const match24 = trimmed.match(/^(\d{1,2}):(\d{2})/)
  if (match24) {
    const rawH = parseInt(match24[1], 10)
    const m = match24[2]
    const period = rawH >= 12 ? 'PM' : 'AM'
    const h = rawH % 12 === 0 ? 12 : rawH % 12
    return `${String(h).padStart(2, '0')}:${m} ${period}`
  }

  return trimmed
}

