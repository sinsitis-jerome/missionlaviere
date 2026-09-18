export function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="etat-vide">
      <svg width="72" height="72" viewBox="0 0 120 120" aria-hidden="true">
        <path d="M60 18 22 52h14v42h48V52h14L60 18Z" fill="var(--sarcelle-clair)" />
        <rect x="52" y="72" width="16" height="22" fill="var(--papier)" />
      </svg>
      <h2>Aucune tâche pour l'instant</h2>
      <p>Ajoutez la première tâche du foyer : ménage, courses, administratif…</p>
      <button className="bouton bouton--plein" onClick={onCreate}>
        Créer une tâche
      </button>
    </div>
  );
}
