import { useState } from 'react';
import { signInWithGoogle } from '../firebase/auth';

export function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSignIn() {
    setError(null);
    setPending(true);
    try {
      await signInWithGoogle();
    } catch {
      setError("La connexion a échoué. Réessayez dans un instant.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="connexion">
      <div className="connexion__carte">
        <svg
          className="connexion__pictogramme"
          viewBox="0 0 120 120"
          aria-hidden="true"
        >
          <path d="M60 18 22 52h14v42h48V52h14L60 18Z" fill="var(--craie)" />
          <rect x="52" y="72" width="16" height="22" fill="var(--ardoise)" />
          <circle cx="86" cy="86" r="19" fill="var(--ocre)" />
          <path
            d="M77 87l6 6 12-14"
            fill="none"
            stroke="var(--ardoise)"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        <h1 className="connexion__titre">Le tableau des tâches du foyer</h1>
        <p className="connexion__texte">
          Créez les tâches à faire à la maison, priorisez-les et répartissez-les entre vous — visible
          par tout le monde, à jour en temps réel.
        </p>

        <button className="bouton bouton--craie" onClick={handleSignIn} disabled={pending}>
          <GoogleIcon />
          {pending ? 'Connexion…' : 'Continuer avec Google'}
        </button>

        {error && <p className="connexion__erreur">{error}</p>}
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.95v2.33A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.95 10.7a5.4 5.4 0 0 1 0-3.4V4.97H.95a9 9 0 0 0 0 8.06l3-2.33Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.9 11.42 0 9 0A9 9 0 0 0 .95 4.97l3 2.33C4.66 5.17 6.65 3.58 9 3.58Z"
      />
    </svg>
  );
}
