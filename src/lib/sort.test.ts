import { describe, expect, it } from 'vitest';
import type { Task } from '../types';
import { filterTasks, groupByStatus, isOverdue, sortTasks } from './sort';

function makeTask(overrides: Partial<Task>): Task {
  return {
    id: overrides.id ?? Math.random().toString(36).slice(2),
    householdId: 'h1',
    title: 'Tâche',
    description: '',
    category: 'Ménage',
    priority: 'normale',
    status: 'a_faire',
    assigneeId: null,
    createdBy: 'u1',
    createdAt: 1000,
    updatedAt: 1000,
    dueDate: null,
    recurrence: null,
    completedAt: null,
    completedBy: null,
    ...overrides,
  };
}

describe('sortTasks', () => {
  it('trie par priorité décroissante', () => {
    const tasks = [
      makeTask({ id: 'a', priority: 'basse' }),
      makeTask({ id: 'b', priority: 'urgente' }),
      makeTask({ id: 'c', priority: 'normale' }),
    ];
    expect(sortTasks(tasks).map((t) => t.id)).toEqual(['b', 'c', 'a']);
  });

  it('à priorité égale, trie par échéance la plus proche', () => {
    const tasks = [
      makeTask({ id: 'a', priority: 'haute', dueDate: 3000 }),
      makeTask({ id: 'b', priority: 'haute', dueDate: 1000 }),
      makeTask({ id: 'c', priority: 'haute', dueDate: 2000 }),
    ];
    expect(sortTasks(tasks).map((t) => t.id)).toEqual(['b', 'c', 'a']);
  });

  it('place les tâches sans échéance après celles qui en ont une', () => {
    const tasks = [
      makeTask({ id: 'a', priority: 'haute', dueDate: null }),
      makeTask({ id: 'b', priority: 'haute', dueDate: 1000 }),
    ];
    expect(sortTasks(tasks).map((t) => t.id)).toEqual(['b', 'a']);
  });
});

describe('filterTasks', () => {
  const tasks = [
    makeTask({ id: 'a', assigneeId: 'u1', category: 'Ménage', status: 'a_faire', priority: 'haute', title: 'Passer l\'aspirateur' }),
    makeTask({ id: 'b', assigneeId: null, category: 'Courses', status: 'en_cours', priority: 'basse', title: 'Acheter du pain' }),
    makeTask({ id: 'c', assigneeId: 'u2', category: 'Ménage', status: 'termine', priority: 'urgente', title: 'Vider le lave-vaisselle' }),
  ];

  it('filtre par membre assigné', () => {
    expect(filterTasks(tasks, { assigneeId: 'u1' }).map((t) => t.id)).toEqual(['a']);
  });

  it('filtre les tâches non affectées', () => {
    expect(filterTasks(tasks, { assigneeId: 'non_affectee' }).map((t) => t.id)).toEqual(['b']);
  });

  it('filtre par catégorie', () => {
    expect(filterTasks(tasks, { category: 'Ménage' }).map((t) => t.id).sort()).toEqual(['a', 'c']);
  });

  it('filtre par statut', () => {
    expect(filterTasks(tasks, { status: 'termine' }).map((t) => t.id)).toEqual(['c']);
  });

  it('filtre par recherche texte, insensible à la casse', () => {
    expect(filterTasks(tasks, { search: 'ASPIRATEUR' }).map((t) => t.id)).toEqual(['a']);
  });

  it('combine plusieurs filtres', () => {
    expect(
      filterTasks(tasks, { category: 'Ménage', status: 'a_faire' }).map((t) => t.id),
    ).toEqual(['a']);
  });
});

describe('groupByStatus', () => {
  it('répartit les tâches par statut', () => {
    const tasks = [
      makeTask({ id: 'a', status: 'a_faire' }),
      makeTask({ id: 'b', status: 'en_cours' }),
      makeTask({ id: 'c', status: 'termine' }),
      makeTask({ id: 'd', status: 'a_faire' }),
    ];
    const grouped = groupByStatus(tasks);
    expect(grouped.a_faire.map((t) => t.id)).toEqual(['a', 'd']);
    expect(grouped.en_cours.map((t) => t.id)).toEqual(['b']);
    expect(grouped.termine.map((t) => t.id)).toEqual(['c']);
  });
});

describe('isOverdue', () => {
  it('est en retard si la date est passée et la tâche non terminée', () => {
    const task = makeTask({ status: 'a_faire', dueDate: 1000 });
    expect(isOverdue(task, 2000)).toBe(true);
  });

  it("n'est pas en retard si terminée", () => {
    const task = makeTask({ status: 'termine', dueDate: 1000 });
    expect(isOverdue(task, 2000)).toBe(false);
  });

  it("n'est pas en retard sans échéance", () => {
    const task = makeTask({ status: 'a_faire', dueDate: null });
    expect(isOverdue(task, 2000)).toBe(false);
  });
});
