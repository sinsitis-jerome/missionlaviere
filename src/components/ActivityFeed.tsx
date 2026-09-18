import type { ActivityEntry } from '../types';
import { formatDateTime } from '../lib/dates';

export function ActivityFeed({ entries }: { entries: ActivityEntry[] }) {
  if (entries.length === 0) {
    return <p className="texte-attenue">Aucune activité pour le moment.</p>;
  }

  return (
    <ul className="activite">
      {entries.map((entry) => (
        <li key={entry.id} className={`activite__entree activite__entree--${entry.type}`}>
          {entry.type === 'commentaire' ? (
            <div className="activite__commentaire">
              <span className="activite__auteur">{entry.authorName}</span>
              <p>{entry.text}</p>
            </div>
          ) : (
            <p className="activite__texte">{entry.text}</p>
          )}
          <time dateTime={new Date(entry.createdAt).toISOString()}>
            {formatDateTime(entry.createdAt)}
          </time>
        </li>
      ))}
    </ul>
  );
}
