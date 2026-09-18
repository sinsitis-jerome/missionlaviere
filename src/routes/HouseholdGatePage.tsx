import { useState, type FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { useHousehold } from '../context/HouseholdContext';
import { createHousehold, joinHouseholdByCode } from '../firebase/households';
import { signOut } from '../firebase/auth';
import { MemberAvatar } from '../components/MemberAvatar';

type Mode = 'choix' | 'creer' | 'rejoindre';

export function HouseholdGatePage() {
  const { user } = useAuth();
  const { households, householdsLoading, selectHousehold } = useHousehold();
  const [mode, setMode] = useState<Mode>('choix');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (!user) return null;

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setError(null);
    setPending(true);
    try {
      const id = await createHousehold(user!, name);
      selectHousehold(id);
    } catch {
      setError("Impossible de créer le foyer. Réessayez.");
    } finally {
      setPending(false);
    }
  }

  async function handleJoin(e: FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setError(null);
    setPending(true);
    try {
      const id = await joinHouseholdByCode(user!, code);
      selectHousehold(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de rejoindre ce foyer.');
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="passerelle">
      <header className="passerelle__entete">
        <span>Connecté en tant que {user.displayName ?? user.email}</span>
        <button className="lien" onClick={() => signOut()}>
          Se déconnecter
        </button>
      </header>

      <div className="passerelle__contenu">
        <h1>Vos foyers</h1>

        {householdsLoading ? (
          <p className="texte-attenue">Chargement…</p>
        ) : households.length > 0 ? (
          <ul className="liste-foyers">
            {households.map((h) => (
              <li key={h.id}>
                <button className="carte-foyer" onClick={() => selectHousehold(h.id)}>
                  <span className="carte-foyer__nom">{h.name}</span>
                  <span className="carte-foyer__membres">
                    {Object.values(h.members)
                      .slice(0, 5)
                      .map((m) => (
                        <MemberAvatar key={m.uid} member={m} size={26} />
                      ))}
                    <span className="texte-attenue">
                      {h.memberIds.length} membre{h.memberIds.length > 1 ? 's' : ''}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="texte-attenue">
            Vous ne faites encore partie d'aucun foyer. Créez-en un, ou rejoignez celui de vos proches
            avec un code d'invitation.
          </p>
        )}

        {mode === 'choix' && (
          <div className="passerelle__actions">
            <button className="bouton bouton--plein" onClick={() => setMode('creer')}>
              Créer un foyer
            </button>
            <button className="bouton bouton--contour" onClick={() => setMode('rejoindre')}>
              Rejoindre avec un code
            </button>
          </div>
        )}

        {mode === 'creer' && (
          <form className="formulaire" onSubmit={handleCreate}>
            <label htmlFor="nom-foyer">Nom du foyer</label>
            <input
              id="nom-foyer"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ex. Maison de la rue des Lilas"
              autoFocus
              required
            />
            <div className="formulaire__actions">
              <button type="button" className="bouton bouton--texte" onClick={() => setMode('choix')}>
                Annuler
              </button>
              <button type="submit" className="bouton bouton--plein" disabled={pending}>
                {pending ? 'Création…' : 'Créer'}
              </button>
            </div>
          </form>
        )}

        {mode === 'rejoindre' && (
          <form className="formulaire" onSubmit={handleJoin}>
            <label htmlFor="code-invitation">Code d'invitation</label>
            <input
              id="code-invitation"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="ex. K7P2QX"
              autoFocus
              required
            />
            <div className="formulaire__actions">
              <button type="button" className="bouton bouton--texte" onClick={() => setMode('choix')}>
                Annuler
              </button>
              <button type="submit" className="bouton bouton--plein" disabled={pending}>
                {pending ? 'Connexion…' : 'Rejoindre'}
              </button>
            </div>
          </form>
        )}

        {error && <p className="connexion__erreur">{error}</p>}
      </div>
    </div>
  );
}
