import { type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useHousehold } from '../context/HouseholdContext';
import { signOut } from '../firebase/auth';
import { MemberAvatar } from './MemberAvatar';

export function AppShell({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { currentHousehold, households, selectHousehold } = useHousehold();
  const location = useLocation();

  if (!currentHousehold || !user) return null;

  const members = Object.values(currentHousehold.members);

  return (
    <div className="coquille">
      <header className="entete">
        <div className="entete__gauche">
          <h1 className="entete__nom">{currentHousehold.name}</h1>
          {households.length > 1 && (
            <button className="lien lien--craie" onClick={() => selectHousehold(null)}>
              Changer de foyer
            </button>
          )}
        </div>

        <nav className="entete__nav">
          <Link to="/" className={location.pathname === '/' ? 'actif' : ''}>
            Tableau
          </Link>
          <Link to="/reglages" className={location.pathname === '/reglages' ? 'actif' : ''}>
            Réglages
          </Link>
        </nav>

        <div className="entete__droite">
          <div className="entete__membres">
            {members.slice(0, 6).map((m) => (
              <MemberAvatar key={m.uid} member={m} size={30} />
            ))}
          </div>
          <button className="lien lien--craie" onClick={() => signOut()}>
            Déconnexion
          </button>
        </div>
      </header>

      <main className="contenu">{children}</main>
    </div>
  );
}
