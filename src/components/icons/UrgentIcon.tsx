export function UrgentIcon({ title = 'Contient une tâche urgente' }: { title?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-label={title} role="img" className="icone-urgente">
      <title>{title}</title>
      <path
        d="M12 2 1 21h22L12 2Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <line x1="12" y1="9" x2="12" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="17.5" r="1.1" fill="currentColor" />
    </svg>
  );
}
