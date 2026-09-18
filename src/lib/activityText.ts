import type { ActivityType, Priority, Status } from '../types';
import { PRIORITY_LABELS, STATUS_LABELS } from '../types';

interface BuildActivityTextArgs {
  type: ActivityType;
  authorName: string;
  from?: string | null;
  to?: string | null;
}

/**
 * Construit le message affiché dans le fil d'activité d'une tâche pour les
 * évènements générés automatiquement (tout sauf les commentaires libres).
 */
export function buildActivityText({ type, authorName, from, to }: BuildActivityTextArgs): string {
  switch (type) {
    case 'creation':
      return `${authorName} a créé la tâche`;
    case 'statut':
      return `${authorName} a changé le statut : ${labelStatus(from)} → ${labelStatus(to)}`;
    case 'affectation':
      return to
        ? `${authorName} a affecté la tâche à ${to}`
        : `${authorName} a retiré l'affectation`;
    case 'priorite':
      return `${authorName} a changé la priorité : ${labelPriority(from)} → ${labelPriority(to)}`;
    case 'echeance':
      return to ? `${authorName} a fixé l'échéance au ${to}` : `${authorName} a retiré l'échéance`;
    case 'recurrence':
      return to
        ? `${authorName} a rendu la tâche récurrente (${to})`
        : `${authorName} a retiré la récurrence`;
    case 'commentaire':
    default:
      return '';
  }
}

function labelStatus(value?: string | null): string {
  if (!value) return '—';
  return STATUS_LABELS[value as Status] ?? value;
}

function labelPriority(value?: string | null): string {
  if (!value) return '—';
  return PRIORITY_LABELS[value as Priority] ?? value;
}
