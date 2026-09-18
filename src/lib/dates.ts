import { format, isThisYear, isToday, isTomorrow, isYesterday } from 'date-fns';
import { fr } from 'date-fns/locale';

export function formatDueDate(timestamp: number): string {
  const date = new Date(timestamp);
  if (isToday(date)) return "Aujourd'hui";
  if (isTomorrow(date)) return 'Demain';
  if (isYesterday(date)) return 'Hier';
  return format(date, isThisYear(date) ? 'd MMMM' : 'd MMMM yyyy', { locale: fr });
}

export function formatDateTime(timestamp: number): string {
  return format(new Date(timestamp), "d MMMM yyyy 'à' HH:mm", { locale: fr });
}

export function formatRelativeShort(timestamp: number): string {
  const date = new Date(timestamp);
  if (isToday(date)) return format(date, 'HH:mm');
  if (isYesterday(date)) return 'Hier';
  return format(date, 'd MMM', { locale: fr });
}
