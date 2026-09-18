import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useHousehold } from '../context/HouseholdContext';
import {
  leaveHousehold,
  renameHousehold,
  rotateInviteCode,
  updateCategories,
} from '../firebase/households';
import { MemberAvatar } from '../components/MemberAvatar';

export function SettingsPage() {
  const { user } = useAuth();
  const { currentHousehold, selectHousehold } = useHousehold();
  const navigate = useNavigate();
  const [name, setName] = useState(currentHousehold?.name ?? '');
  const [newCategory, setNewCategory] = useState('');
  const [copied, setCopied] = useState(false);
  const [rotating, setRotating] = useState(false);

  if (!currentHousehold || !user) return null;

  async function handleRename() {
    if (!name.trim() || name === currentHousehold!.name) return;
    await renameHousehold(currentHousehold!.id, name);
  }

  async function handleCopyCode() {
    await navigator.clipboard.writeText(currentHousehold!.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleRotateCode() {
    setRotating(true);
    try {
      await rotateInviteCode(currentHousehold!.id, user!.uid);
    } finally {
      setRotating(false);
    }
  }

  async function handleAddCategory() {
    const value = newCategory.trim();
    if (!value || currentHousehold!.categories.includes(value)) return;
    await updateCategories(currentHousehold!.id, [...currentHousehold!.categories, value]);
    setNewCategory('');
  }

  async function handleRemoveCategory(category: string) {
    await updateCategories(
      currentHousehold!.id,
      currentHousehold!.categories.filter((c) => c !== category),
    );
  }

  async function handleLeave() {
    if (!confirm('Quitter ce foyer ? Vous pourrez le rejoindre à nouveau avec un code.')) return;
    await leaveHousehold(currentHousehold!.id, user!.uid);
    selectHousehold(null);
    navigate('/');
  }

  return (
    <div className="reglages">
      <section className="reglages__section">
        <h2>Nom du foyer</h2>
        <div className="ligne-formulaire">
          <input value={name} onChange={(e) => setName(e.target.value)} />
          <button className="bouton bouton--contour" onClick={handleRename}>
            Enregistrer
          </button>
        </div>
      </section>

      <section className="reglages__section">
        <h2>Membres</h2>
        <ul className="liste-membres">
          {Object.values(currentHousehold.members).map((m) => (
            <li key={m.uid}>
              <MemberAvatar member={m} size={34} />
              <span>{m.displayName}</span>
              {m.uid === currentHousehold.ownerId && <span className="etiquette-role">Créateur·rice</span>}
            </li>
          ))}
        </ul>
      </section>

      <section className="reglages__section">
        <h2>Inviter quelqu'un</h2>
        <p className="texte-attenue">
          Partagez ce code : la personne le saisit après s'être connectée avec son compte Google.
        </p>
        <div className="code-invitation">
          <span className="code-invitation__valeur">{currentHousehold.inviteCode}</span>
          <button className="bouton bouton--contour" onClick={handleCopyCode}>
            {copied ? 'Copié !' : 'Copier'}
          </button>
          <button className="bouton bouton--texte" onClick={handleRotateCode} disabled={rotating}>
            {rotating ? '…' : 'Générer un nouveau code'}
          </button>
        </div>
      </section>

      <section className="reglages__section">
        <h2>Catégories</h2>
        <ul className="liste-categories">
          {currentHousehold.categories.map((c) => (
            <li key={c}>
              {c}
              <button
                className="liste-categories__retirer"
                onClick={() => handleRemoveCategory(c)}
                aria-label={`Retirer la catégorie ${c}`}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
        <div className="ligne-formulaire">
          <input
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Nouvelle catégorie"
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCategory())}
          />
          <button className="bouton bouton--contour" onClick={handleAddCategory}>
            Ajouter
          </button>
        </div>
      </section>

      <section className="reglages__section">
        <button className="lien lien--danger" onClick={handleLeave}>
          Quitter ce foyer
        </button>
      </section>
    </div>
  );
}
