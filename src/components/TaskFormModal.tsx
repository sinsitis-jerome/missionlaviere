import { useState, type FormEvent } from 'react';
import type { Household, NewTaskInput, Priority, Recurrence } from '../types';
import { PRIORITY_LABELS, PRIORITY_ORDER } from '../types';
import { Modal } from './Modal';
import { RecurrencePicker } from './RecurrencePicker';

export function TaskFormModal({
  household,
  onClose,
  onCreate,
}: {
  household: Household;
  onClose: () => void;
  onCreate: (input: NewTaskInput) => Promise<void>;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(household.categories[0] ?? '');
  const [priority, setPriority] = useState<Priority>('normale');
  const [assigneeId, setAssigneeId] = useState<string>('');
  const [dueDate, setDueDate] = useState('');
  const [recurrence, setRecurrence] = useState<Recurrence | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const members = Object.values(household.members);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setPending(true);
    setError(null);
    try {
      await onCreate({
        title,
        description,
        category,
        priority,
        assigneeId: assigneeId || null,
        dueDate: dueDate ? new Date(dueDate).getTime() : null,
        recurrence,
      });
      onClose();
    } catch {
      setError("Impossible d'enregistrer la tâche. Réessayez.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Modal title="Nouvelle tâche" onClose={onClose}>
      <form className="formulaire" onSubmit={handleSubmit}>
        <label htmlFor="titre">Titre</label>
        <input
          id="titre"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="ex. Sortir les poubelles"
          autoFocus
          required
        />

        <label htmlFor="description">Description (facultatif)</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Précisions utiles pour la personne qui s'en charge…"
        />

        <div className="formulaire__grille">
          <div>
            <label htmlFor="categorie">Catégorie</label>
            <select id="categorie" value={category} onChange={(e) => setCategory(e.target.value)}>
              {household.categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="priorite">Priorité</label>
            <select id="priorite" value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
              {PRIORITY_ORDER.map((p) => (
                <option key={p} value={p}>
                  {PRIORITY_LABELS[p]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="assigne">Affectée à</label>
            <select id="assigne" value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)}>
              <option value="">Personne pour l'instant</option>
              {members.map((m) => (
                <option key={m.uid} value={m.uid}>
                  {m.displayName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="echeance">Échéance</label>
            <input
              id="echeance"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>

        <RecurrencePicker value={recurrence} onChange={setRecurrence} />

        {error && <p className="connexion__erreur">{error}</p>}

        <div className="formulaire__actions">
          <button type="button" className="bouton bouton--texte" onClick={onClose}>
            Annuler
          </button>
          <button type="submit" className="bouton bouton--plein" disabled={pending}>
            {pending ? 'Création…' : 'Créer la tâche'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
