export function RecurrenceIcon({ title = 'Tâche récurrente' }: { title?: string }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" aria-label={title} role="img" className="icone-recurrence">
      <title>{title}</title>
      <path
        d="M4 12a8 8 0 0 1 13.66-5.66M20 12a8 8 0 0 1-13.66 5.66"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path d="M17 3v4h-4M7 21v-4h4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
