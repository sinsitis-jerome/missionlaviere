import { useState, type FormEvent } from 'react';

export function CommentBox({ onSubmit }: { onSubmit: (text: string) => Promise<void> }) {
  const [text, setText] = useState('');
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setPending(true);
    try {
      await onSubmit(text);
      setText('');
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="commentaire-form" onSubmit={handleSubmit}>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Ajouter un commentaire…"
        aria-label="Ajouter un commentaire"
      />
      <button type="submit" className="bouton bouton--plein" disabled={pending || !text.trim()}>
        Envoyer
      </button>
    </form>
  );
}
