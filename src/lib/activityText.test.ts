import { describe, expect, it } from 'vitest';
import { buildActivityText } from './activityText';

describe('buildActivityText', () => {
  it('décrit la création', () => {
    expect(buildActivityText({ type: 'creation', authorName: 'Léa' })).toBe('Léa a créé la tâche');
  });

  it('décrit un changement de statut', () => {
    expect(
      buildActivityText({ type: 'statut', authorName: 'Léa', from: 'a_faire', to: 'en_cours' }),
    ).toBe('Léa a changé le statut : À faire → En cours');
  });

  it('décrit une affectation', () => {
    expect(buildActivityText({ type: 'affectation', authorName: 'Léa', to: 'Sam' })).toBe(
      'Léa a affecté la tâche à Sam',
    );
  });

  it('décrit un retrait d\'affectation', () => {
    expect(buildActivityText({ type: 'affectation', authorName: 'Léa', to: null })).toBe(
      "Léa a retiré l'affectation",
    );
  });

  it('décrit un changement de priorité', () => {
    expect(
      buildActivityText({ type: 'priorite', authorName: 'Léa', from: 'basse', to: 'urgente' }),
    ).toBe('Léa a changé la priorité : Basse → Urgente');
  });

  it('renvoie une chaîne vide pour un commentaire (géré séparément)', () => {
    expect(buildActivityText({ type: 'commentaire', authorName: 'Léa' })).toBe('');
  });
});
