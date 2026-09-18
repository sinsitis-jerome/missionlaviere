import { describe, expect, it } from 'vitest';
import { computeNextDueDate, describeRecurrence } from './recurrence';

describe('computeNextDueDate', () => {
  it('avance d\'un jour pour une récurrence quotidienne simple', () => {
    const from = new Date(2026, 0, 1).getTime(); // jeudi 1er janvier 2026
    const next = computeNextDueDate(from, { frequence: 'quotidienne', intervalle: 1 });
    expect(new Date(next)).toEqual(new Date(2026, 0, 2));
  });

  it('avance de N jours pour un intervalle quotidien', () => {
    const from = new Date(2026, 0, 1).getTime();
    const next = computeNextDueDate(from, { frequence: 'quotidienne', intervalle: 3 });
    expect(new Date(next)).toEqual(new Date(2026, 0, 4));
  });

  it('avance d\'un mois pour une récurrence mensuelle', () => {
    const from = new Date(2026, 0, 31).getTime();
    const next = computeNextDueDate(from, { frequence: 'mensuelle', intervalle: 1 });
    // date-fns ramène au dernier jour de février s'il n'y a pas de 31.
    expect(new Date(next).getMonth()).toBe(1);
  });

  it('trouve le prochain jour choisi dans la même semaine', () => {
    // Jeudi 1er janvier 2026, jours choisis : lundi(1) et vendredi(5)
    const from = new Date(2026, 0, 1).getTime();
    const next = computeNextDueDate(from, {
      frequence: 'hebdomadaire',
      intervalle: 1,
      joursSemaine: [1, 5],
    });
    expect(new Date(next)).toEqual(new Date(2026, 0, 2)); // vendredi 2 janvier
  });

  it("saute à la semaine suivante quand aucun jour choisi ne reste cette semaine", () => {
    // Vendredi 2 janvier 2026, jours choisis : lundi(1) et vendredi(5)
    const from = new Date(2026, 0, 2).getTime();
    const next = computeNextDueDate(from, {
      frequence: 'hebdomadaire',
      intervalle: 1,
      joursSemaine: [1, 5],
    });
    expect(new Date(next)).toEqual(new Date(2026, 0, 5)); // lundi suivant
  });

  it('respecte un intervalle de plusieurs semaines', () => {
    const from = new Date(2026, 0, 2).getTime(); // vendredi
    const next = computeNextDueDate(from, {
      frequence: 'hebdomadaire',
      intervalle: 2,
      joursSemaine: [1],
    });
    // Semaine suivante = celle du 5 janvier (lundi), +1 semaine supplémentaire = 12 janvier
    expect(new Date(next)).toEqual(new Date(2026, 0, 12));
  });

  it('utilise addWeeks par défaut sans jour choisi', () => {
    const from = new Date(2026, 0, 1).getTime();
    const next = computeNextDueDate(from, { frequence: 'hebdomadaire', intervalle: 1 });
    expect(new Date(next)).toEqual(new Date(2026, 0, 8));
  });
});

describe('describeRecurrence', () => {
  it('retourne "Ponctuelle" pour null', () => {
    expect(describeRecurrence(null)).toBe('Ponctuelle');
  });

  it('décrit une récurrence quotidienne', () => {
    expect(describeRecurrence({ frequence: 'quotidienne', intervalle: 1 })).toBe('Tous les jours');
    expect(describeRecurrence({ frequence: 'quotidienne', intervalle: 2 })).toBe('Tous les 2 jours');
  });

  it('décrit une récurrence hebdomadaire avec jours', () => {
    expect(
      describeRecurrence({ frequence: 'hebdomadaire', intervalle: 1, joursSemaine: [1, 3, 5] }),
    ).toBe('Toutes les semaines (lun., mer., ven.)');
  });

  it('décrit une récurrence mensuelle', () => {
    expect(describeRecurrence({ frequence: 'mensuelle', intervalle: 1 })).toBe('Tous les mois');
  });
});
