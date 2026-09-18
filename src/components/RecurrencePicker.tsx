import type { Recurrence, RecurrenceFrequency } from '../types';

const WEEKDAYS = [
  { value: 1, label: 'L' },
  { value: 2, label: 'M' },
  { value: 3, label: 'M' },
  { value: 4, label: 'J' },
  { value: 5, label: 'V' },
  { value: 6, label: 'S' },
  { value: 0, label: 'D' },
];

export function RecurrencePicker({
  value,
  onChange,
}: {
  value: Recurrence | null;
  onChange: (value: Recurrence | null) => void;
}) {
  const enabled = value !== null;

  function setEnabled(next: boolean) {
    onChange(next ? { frequence: 'hebdomadaire', intervalle: 1, joursSemaine: [1] } : null);
  }

  function setFrequence(frequence: RecurrenceFrequency) {
    if (!value) return;
    onChange({
      frequence,
      intervalle: value.intervalle,
      joursSemaine: frequence === 'hebdomadaire' ? value.joursSemaine ?? [1] : undefined,
    });
  }

  function toggleDay(day: number) {
    if (!value) return;
    const current = value.joursSemaine ?? [];
    const next = current.includes(day) ? current.filter((d) => d !== day) : [...current, day];
    onChange({ ...value, joursSemaine: next.length > 0 ? next : [day] });
  }

  return (
    <div className="recurrence">
      <label className="case">
        <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
        Tâche récurrente
      </label>

      {value && (
        <div className="recurrence__details">
          <div className="recurrence__ligne">
            <span>Tous les</span>
            <input
              type="number"
              min={1}
              max={30}
              value={value.intervalle}
              onChange={(e) => onChange({ ...value, intervalle: Math.max(1, Number(e.target.value)) })}
            />
            <select value={value.frequence} onChange={(e) => setFrequence(e.target.value as RecurrenceFrequency)}>
              <option value="quotidienne">jour(s)</option>
              <option value="hebdomadaire">semaine(s)</option>
              <option value="mensuelle">mois</option>
            </select>
          </div>

          {value.frequence === 'hebdomadaire' && (
            <div className="recurrence__jours">
              {WEEKDAYS.map((d) => (
                <button
                  type="button"
                  key={d.value}
                  className={`jour${value.joursSemaine?.includes(d.value) ? ' jour--actif' : ''}`}
                  onClick={() => toggleDay(d.value)}
                >
                  {d.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
