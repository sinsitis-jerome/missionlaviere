import type { Household } from '../types';
import { PRIORITY_LABELS, PRIORITY_ORDER } from '../types';
import type { TaskFilters as TaskFiltersState } from '../lib/sort';

export function TaskFilters({
  household,
  filters,
  onChange,
}: {
  household: Household;
  filters: TaskFiltersState;
  onChange: (filters: TaskFiltersState) => void;
}) {
  const members = Object.values(household.members);

  return (
    <div className="filtres">
      <input
        className="filtres__recherche"
        type="search"
        placeholder="Rechercher une tâche…"
        value={filters.search ?? ''}
        onChange={(e) => onChange({ ...filters, search: e.target.value })}
        aria-label="Rechercher une tâche"
      />

      <select
        value={filters.assigneeId ?? 'tous'}
        onChange={(e) => onChange({ ...filters, assigneeId: e.target.value as TaskFiltersState['assigneeId'] })}
        aria-label="Filtrer par membre"
      >
        <option value="tous">Tout le monde</option>
        <option value="non_affectee">Non affectées</option>
        {members.map((m) => (
          <option key={m.uid} value={m.uid}>
            {m.displayName}
          </option>
        ))}
      </select>

      <select
        value={filters.category ?? 'toutes'}
        onChange={(e) => onChange({ ...filters, category: e.target.value })}
        aria-label="Filtrer par catégorie"
      >
        <option value="toutes">Toutes catégories</option>
        {household.categories.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <select
        value={filters.priority ?? 'toutes'}
        onChange={(e) => onChange({ ...filters, priority: e.target.value as TaskFiltersState['priority'] })}
        aria-label="Filtrer par priorité"
      >
        <option value="toutes">Toutes priorités</option>
        {PRIORITY_ORDER.map((p) => (
          <option key={p} value={p}>
            {PRIORITY_LABELS[p]}
          </option>
        ))}
      </select>
    </div>
  );
}
