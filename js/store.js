// ============================================================
// Persistência local (localStorage) — tudo fica no seu celular
// ============================================================
import { iso } from './calc.js';

const KEY = 'shape25:v1';

export const DEFAULT_PROFILE = {
  name: 'Rafael',
  sex: 'M',
  age: 30,
  height: 178,
  weight: 85,
  bf: 20,
  goalWeight: 78,
  goalDate: '2026-12-25',
  activity: 1.55,
  deficit: 0.2,
  proteinPerKg: 2.2,
  kcalAdjust: 0,
  trainDays: [1, 2, 3, 4, 5],
  trainTime: '18:00',
  wakeTime: '06:30',
  sleepTime: '22:30',
  stepsGoal: 10000,
  mealTimes: { cafe: '07:00', lanche1: '10:00', almoco: '12:30', pre: '16:30', jantar: '20:00' },
  onboarded: false,
};

const DEFAULT = {
  profile: DEFAULT_PROFILE,
  logs: {},
  weights: [],
  waist: [],
  swaps: {},
  notified: {},
  settings: { notifications: false, sound: true },
};

let state = load();
const listeners = new Set();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return structuredClone(DEFAULT);
    const s = JSON.parse(raw);
    return {
      ...structuredClone(DEFAULT),
      ...s,
      profile: { ...DEFAULT_PROFILE, ...s.profile, mealTimes: { ...DEFAULT_PROFILE.mealTimes, ...(s.profile?.mealTimes || {}) } },
      settings: { ...DEFAULT.settings, ...(s.settings || {}) },
    };
  } catch {
    return structuredClone(DEFAULT);
  }
}

export function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* storage cheio/bloqueado */ }
  listeners.forEach((fn) => fn(state));
}

export const get = () => state;
export const subscribe = (fn) => listeners.add(fn);

export function update(fn) {
  fn(state);
  save();
}

export function dayLog(date = new Date()) {
  const k = typeof date === 'string' ? date : iso(date);
  if (!state.logs[k]) state.logs[k] = { meals: {}, water: 0, steps: 0, sleep: 0, workout: null, cardio: false };
  return state.logs[k];
}

export function exportJSON() {
  return JSON.stringify(state, null, 2);
}

export function importJSON(text) {
  const s = JSON.parse(text);
  if (!s.profile) throw new Error('Arquivo inválido');
  localStorage.setItem(KEY, JSON.stringify(s));
  state = load();
  save();
}

export function reset() {
  localStorage.removeItem(KEY);
  state = load();
  save();
}

// Histórico de cargas: última vez que o exercício foi feito (antes de hoje)
export function lastSets(exName, beforeDate) {
  const dates = Object.keys(state.logs).filter((d) => d < beforeDate).sort().reverse();
  for (const d of dates) {
    const w = state.logs[d].workout;
    const sets = w?.sets?.[exName];
    if (sets && sets.some((s) => s.done)) return { date: d, sets: sets.filter((s) => s.done) };
  }
  return null;
}

// Sequência de dias com dieta 100% cumprida
export function dietStreak(mealIds, today = new Date()) {
  let n = 0;
  const d = new Date(today);
  // Hoje conta só se já estiver completo
  const isFull = (k) => mealIds.every((id) => state.logs[k]?.meals?.[id]);
  if (isFull(iso(d))) n++;
  d.setDate(d.getDate() - 1);
  while (isFull(iso(d))) { n++; d.setDate(d.getDate() - 1); }
  return n;
}
