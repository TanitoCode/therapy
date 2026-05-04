import {
  format,
  formatDistance,
  isWeekend,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addDays,
  isSameDay,
  parseISO,
} from 'date-fns'
import { es } from 'date-fns/locale'

const LOCALE = { locale: es }
export const TIMEZONE = 'America/Argentina/Buenos_Aires'

export function formatDate(date: Date | string, pattern = 'PPP'): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, pattern, LOCALE)
}

export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'HH:mm', LOCALE)
}

export function formatDateShort(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'dd MMM', LOCALE)
}

export function formatDateFull(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, "EEEE d 'de' MMMM 'de' yyyy", LOCALE)
}

export function formatRelative(date: Date | string): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return formatDistance(d, new Date(), { addSuffix: true, locale: es })
}

export function getWeekDays(date: Date): Date[] {
  const start = startOfWeek(date, { weekStartsOn: 1 }) // lunes
  const end = endOfWeek(date, { weekStartsOn: 1 })
  return eachDayOfInterval({ start, end })
}

export { isWeekend, isSameDay, addDays, parseISO }
