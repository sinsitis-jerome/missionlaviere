import { addDays, addMonths, addWeeks, startOfDay } from 'date-fns';
import type { Recurrence } from '../types';

/**
 * Calcule la prochaine échéance à partir d'une échéance de référence (en
 * général la date d'échéance qui vient d'être atteinte/complétée).
 * Retourne un timestamp (ms) minuit, dans le fuseau local.
 */
export function computeNextDueDate(fromDate: number, recurrence: Recurrence): number {
  const base = startOfDay(new Date(fromDate));
  const n = Math.max(1, recurrence.intervalle);

  if (recurrence.frequence === 'quotidienne') {
    return addDays(base, n).getTime();
  }

  if (recurrence.frequence === 'mensuelle') {
    return addMonths(base, n).getTime();
  }

  // hebdomadaire
  if (recurrence.joursSemaine && recurrence.joursSemaine.length > 0) {
    const days = [...recurrence.joursSemaine].sort((a, b) => a - b);
    const currentDow = base.getDay();

    // Cherche le prochain jour de la semaine courante après la date de base.
    const nextInSameWeek = days.find((d) => d > currentDow);
    if (nextInSameWeek !== undefined) {
      return addDays(base, nextInSameWeek - currentDow).getTime();
    }

    // Sinon, saute à la semaine suivante (en tenant compte de l'intervalle)
    // et prend le premier jour choisi.
    const weeksAhead = n;
    const daysUntilNextWeekStart = 7 - currentDow + days[0];
    const totalDays = daysUntilNextWeekStart + (weeksAhead - 1) * 7;
    return addDays(base, totalDays).getTime();
  }

  return addWeeks(base, n).getTime();
}

export function describeRecurrence(recurrence: Recurrence | null): string {
  if (!recurrence) return 'Ponctuelle';

  const plural = recurrence.intervalle > 1;

  switch (recurrence.frequence) {
    case 'quotidienne':
      return plural ? `Tous les ${recurrence.intervalle} jours` : 'Tous les jours';
    case 'mensuelle':
      return plural ? `Tous les ${recurrence.intervalle} mois` : 'Tous les mois';
    case 'hebdomadaire': {
      const base = plural ? `Toutes les ${recurrence.intervalle} semaines` : 'Toutes les semaines';
      if (recurrence.joursSemaine && recurrence.joursSemaine.length > 0) {
        const names = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'];
        const jours = recurrence.joursSemaine
          .slice()
          .sort((a, b) => a - b)
          .map((d) => names[d])
          .join(', ');
        return `${base} (${jours})`;
      }
      return base;
    }
    default:
      return 'Ponctuelle';
  }
}
