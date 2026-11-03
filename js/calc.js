// ============================================================
// Cálculos: gasto energético, macros, carb cycling, plano de refeições
// ============================================================
import { FOODS, MEAL_TEMPLATES, SPLITS } from './data.js';

export const ACTIVITY = [
  { v: 1.375, label: 'Leve', desc: 'Trabalho sentado, treino 2–3x' },
  { v: 1.55, label: 'Moderado', desc: 'Treino 4–5x, ~7 mil passos' },
  { v: 1.65, label: 'Alto', desc: 'Treino 5–6x, 10 mil+ passos' },
  { v: 1.8, label: 'Muito alto', desc: 'Trabalho físico + treino diário' },
];

export const DEFICITS = [
  { v: 0.15, label: 'Moderado', desc: '−15% · perda ~0,5%/sem · máximo de músculo' },
  { v: 0.2, label: 'Firme', desc: '−20% · perda ~0,7%/sem · equilíbrio ideal' },
  { v: 0.25, label: 'Agressivo', desc: '−25% · perda ~1%/sem · prazo curto' },
];

const r5 = (n) => Math.max(0, Math.round(n / 5) * 5);

export function bmr(p) {
  if (p.bf && p.bf > 3 && p.bf < 60) {
    const lbm = p.weight * (1 - p.bf / 100);
    return 370 + 21.6 * lbm; // Katch-McArdle (mais preciso com % de gordura)
  }
  const base = 10 * p.weight + 6.25 * p.height - 5 * p.age;
  return p.sex === 'F' ? base - 161 : base + 5; // Mifflin-St Jeor
}

export function nutrition(p) {
  const b = bmr(p);
  const tdee = b * p.activity;
  let target = tdee * (1 - p.deficit) + (p.kcalAdjust || 0);
  target = Math.max(target, b, p.sex === 'F' ? 1200 : 1500);
  target = Math.round(target);

  const protein = Math.round(p.weight * (p.proteinPerKg || 2.2));
  const fat = Math.round(Math.max(p.weight * 0.8, (target * 0.2) / 9));

  // Carb cycling: mais carbo em dia de treino, menos no descanso. Média semanal = alvo.
  const n = p.trainDays.length;
  const swing = target * 0.15;
  const train = Math.round(target + (swing * (7 - n)) / 7);
  const rest = Math.round(target - (swing * n) / 7);
  const day = (kcal) => ({
    kcal,
    p: protein,
    g: fat,
    c: Math.max(50, Math.round((kcal - protein * 4 - fat * 9) / 4)),
  });

  const dailyDeficit = tdee - target;
  return {
    bmr: Math.round(b),
    tdee: Math.round(tdee),
    target,
    train: n === 0 || n === 7 ? day(target) : day(train),
    rest: n === 7 || n === 0 ? day(target) : day(rest),
    water: Math.round((p.weight * 40) / 250) * 250,
    weeklyLossKg: (dailyDeficit * 7) / 7700,
  };
}

export function isTrainDay(p, date) {
  return p.trainDays.includes(date.getDay());
}

export function workoutFor(p, date) {
  const days = [...p.trainDays].sort((a, b) => a - b);
  const idx = days.indexOf(date.getDay());
  if (idx < 0) return null;
  const split = SPLITS[days.length] || SPLITS[5];
  return split.seq[idx % split.seq.length];
}

function add(t, food, grams) {
  const f = FOODS[food];
  t.kcal += (f.kcal * grams) / 100;
  t.p += (f.p * grams) / 100;
  t.c += (f.c * grams) / 100;
  t.g += (f.g * grams) / 100;
}

export function macrosOf(items) {
  const t = { kcal: 0, p: 0, c: 0, g: 0 };
  items.forEach(([food, grams]) => add(t, food, grams));
  return t;
}

// Gera o plano do dia distribuindo macros em 5 refeições com alimentos brasileiros.
export function mealPlan(p, date, swaps = {}) {
  const nut = nutrition(p);
  const trainDay = isTrainDay(p, date);
  const D = trainDay ? nut.train : nut.rest;

  return MEAL_TEMPLATES.map((tpl) => {
    const T = { p: D.p * tpl.pct.p, c: D.c * tpl.pct.c, g: D.g * tpl.pct.g };
    const items = tpl.fixos.map(([f, g]) => [f, g]);
    if (tpl.extraCarb) items.push([...tpl.extraCarb]);
    const sw = (k) => (k ? swaps[`${tpl.id}:${k}`] || k : null);

    const cur = () => macrosOf(items);

    const prot = sw(tpl.prot);
    if (prot) {
      const need = T.p - cur().p;
      const g = r5((need / FOODS[prot].p) * 100);
      if (g > 0) items.push([prot, g]);
    }
    const carb = sw(tpl.carb);
    if (carb) {
      const need = T.c - cur().c;
      const g = r5((need / FOODS[carb].c) * 100);
      if (g > 0) items.push([carb, g]);
    }
    const fat = sw(tpl.fat);
    if (fat) {
      const need = T.g - cur().g;
      const g = Math.max(0, Math.round((need / FOODS[fat].g) * 100));
      if (g >= 3) items.push([fat, g]);
    }

    const nome = tpl.treino && !trainDay ? 'Lanche da tarde' : tpl.nome;
    const time = p.mealTimes[tpl.id];
    return { id: tpl.id, nome, icone: tpl.icone, time, items, macros: cur(), slots: { prot: tpl.prot, carb: tpl.carb, fat: tpl.fat } };
  });
}

export function formatItem([food, grams]) {
  const f = FOODS[food];
  if (f.unidade) {
    const u = grams / f.unidade;
    const un = Math.round(u * 2) / 2;
    return `${f.nome} — ${un.toString().replace('.', ',')} ${f.un} (${grams} g)`;
  }
  if (food === 'azeite') return `${f.nome} — ${grams} g (~${Math.max(1, Math.round(grams / 8))} colher(es) de chá)`;
  return `${f.nome} — ${grams} g`;
}

// Equivalência: quantos gramas do substituto entregam o mesmo macro principal
export function equivalent(fromFood, grams, toFood) {
  const a = FOODS[fromFood], b = FOODS[toFood];
  const key = a.p >= a.c && a.p >= a.g ? 'p' : a.c >= a.g ? 'c' : 'g';
  if (!b[key]) return 0;
  return r5((a[key] * grams) / b[key]);
}

// ------------------------------------------------------------
// Progresso
// ------------------------------------------------------------
export function avgWeight(weights, endDate, days = 7) {
  const end = new Date(endDate);
  const start = new Date(end);
  start.setDate(start.getDate() - days + 1);
  const s = iso(start), e = iso(end);
  const list = weights.filter((w) => w.date >= s && w.date <= e);
  if (!list.length) return null;
  return list.reduce((a, b) => a + b.kg, 0) / list.length;
}

export function weeklyCheck(weights, today = new Date()) {
  const cur = avgWeight(weights, today, 7);
  const prevEnd = new Date(today);
  prevEnd.setDate(prevEnd.getDate() - 7);
  const prev = avgWeight(weights, prevEnd, 7);
  if (cur == null || prev == null) return null;
  const rate = ((prev - cur) / prev) * 100; // % perdido na semana
  let advice, adjust = 0, tone = 'ok';
  if (rate < 0.3) {
    advice = 'Perda abaixo do ideal. Reduza 150 kcal (sai do carboidrato) e some 2 mil passos/dia.';
    adjust = -150; tone = 'warn';
  } else if (rate > 1.2) {
    advice = 'Perdendo rápido demais — risco de perder músculo. Adicione 100 kcal de carboidrato.';
    adjust = 100; tone = 'warn';
  } else {
    advice = 'Ritmo perfeito. Mantenha tudo exatamente como está.';
  }
  return { cur, prev, rate, advice, adjust, tone };
}

export function iso(d) {
  const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return z.toISOString().slice(0, 10);
}

export function daysUntil(target, from = new Date()) {
  const a = new Date(iso(from) + 'T00:00:00');
  const b = new Date(target + 'T00:00:00');
  return Math.round((b - a) / 86400000);
}
