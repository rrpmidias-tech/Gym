// ============================================================
// Cardio: plano progressivo até a data-alvo, prescrição do dia, gasto estimado
// Princípio: cardio é ferramenta de déficit, não substitui a dieta e não pode
// atrapalhar a recuperação do treino de força. Por isso: LISS como base,
// pouco HIIT (1x/sem a partir da 5ª semana), passos diários sempre.
// ============================================================
import { iso } from './calc.js';

// MET (Compendium of Physical Activities) → kcal = MET × kg × horas
export const CARDIO_TYPES = {
  esteira:   { nome: 'Esteira inclinada', met: 6.0, icone: '⛰️', como: 'Inclinação 10–12%, 5–5,5 km/h, sem segurar no apoio.' },
  caminhada: { nome: 'Caminhada ao ar livre', met: 3.8, icone: '🚶', como: 'Ritmo de quem está atrasado, mas consegue conversar.' },
  bike:      { nome: 'Bike ergométrica', met: 5.5, icone: '🚴', como: 'Carga moderada, 70–80 rpm.' },
  eliptico:  { nome: 'Elíptico / Transport', met: 5.0, icone: '🔁', como: 'Resistência média, braços participando.' },
  escada:    { nome: 'Escada (simulador)', met: 8.0, icone: '🪜', como: 'Ritmo constante, sem apoiar o peso nos braços.' },
  corrida:   { nome: 'Corrida leve', met: 8.3, icone: '🏃', como: 'Trote em que dá para falar frases curtas.' },
  hiit:      { nome: 'HIIT na bike', met: 8.5, icone: '🔥', como: '3 min aquecimento · 8× (30 s forte + 90 s leve) · 3 min desaquecimento.' },
};

// Fases do cutting (semanas desde o início do plano)
const PHASES = [
  { ate: 2, liss: 2, min: 25, hiit: 0, nome: 'Adaptação' },
  { ate: 4, liss: 3, min: 30, hiit: 0, nome: 'Construção' },
  { ate: 6, liss: 3, min: 30, hiit: 1, nome: 'Aceleração' },
  { ate: 99, liss: 4, min: 35, hiit: 1, nome: 'Reta final' },
];

export function weekIndex(p, date) {
  const start = new Date((p.startDate || iso(date)) + 'T12:00:00');
  return Math.max(0, Math.floor((new Date(iso(date) + 'T12:00:00') - start) / (7 * 864e5)));
}

export function phaseFor(p, date) {
  const w = weekIndex(p, date);
  return { ...PHASES.find((ph) => w < ph.ate), semana: w + 1 };
}

export function heartZones(age) {
  const max = Math.round(208 - 0.7 * age); // Tanaka et al., 2001
  return { max, liss: [Math.round(max * 0.6), Math.round(max * 0.7)], hiit: [Math.round(max * 0.85), Math.round(max * 0.92)] };
}

// Prescrição de cardio para cada dia da semana
export function weekCardio(p, date) {
  const ph = phaseFor(p, date);
  const plan = {}; // dow → [{tipo, min, quando}]
  const train = [1, 2, 3, 4, 5, 6, 0].filter((d) => p.trainDays.includes(d));
  const rest = [1, 2, 3, 4, 5, 6, 0].filter((d) => !p.trainDays.includes(d));
  const tipo = p.cardioType || 'esteira';

  // LISS pós-treino distribuído nos dias de treino
  const n = Math.min(ph.liss, train.length);
  for (let i = 0; i < n; i++) {
    const d = train[Math.round((i * train.length) / n) % train.length];
    (plan[d] = plan[d] || []).push({ tipo, min: ph.min, quando: 'pós-treino' });
  }
  // Dias de descanso: caminhada (descanso ativo); HIIT no 1º descanso a partir da fase 3
  rest.forEach((d, i) => {
    plan[d] = plan[d] || [];
    if (ph.hiit && i === 0) plan[d].push({ tipo: 'hiit', min: 22, quando: 'manhã' });
    plan[d].push({ tipo: 'caminhada', min: 40, quando: i === 0 && ph.hiit ? 'tarde (opcional)' : 'manhã' });
  });
  return { phase: ph, plan };
}

export function cardioToday(p, date) {
  return weekCardio(p, date).plan[date.getDay()] || [];
}

export const kcalOf = (tipo, min, kg) => Math.round(CARDIO_TYPES[tipo].met * kg * (min / 60));

// Resumo da semana corrente (seg → dom)
export function weekSummary(p, logs, date) {
  const d = new Date(date);
  const back = (d.getDay() + 6) % 7; // dias desde segunda
  d.setDate(d.getDate() - back);
  let min = 0, kcal = 0, sessions = 0, target = 0;
  const { plan } = weekCardio(p, date);
  Object.values(plan).flat().forEach((s) => { if (!s.quando.includes('opcional')) target += s.min; });
  for (let i = 0; i < 7; i++) {
    const l = logs[iso(d)];
    (l?.cardioSessions || []).forEach((s) => { min += s.min; kcal += s.kcal; sessions++; });
    d.setDate(d.getDate() + 1);
  }
  return { min, kcal, sessions, target };
}

// Fases do timer HIIT
export function hiitPhases() {
  const ph = [{ sec: 180, label: 'Aquecimento' }];
  for (let i = 1; i <= 8; i++) {
    ph.push({ sec: 30, label: `🔥 FORTE ${i}/8`, hot: true });
    ph.push({ sec: 90, label: `Leve ${i}/8` });
  }
  ph.push({ sec: 180, label: 'Desaquecimento' });
  return ph;
}
