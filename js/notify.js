// ============================================================
// Alertas: agenda diária (refeições, água, treino, sono, fim de semana)
// - Notificações do sistema enquanto o app/aba estiver aberto
// - Exportação .ics com alarmes recorrentes (funciona com o celular bloqueado)
// ============================================================
import { mealPlan, isTrainDay, workoutFor, nutrition, iso, formatItem } from './calc.js';
import { exName } from './exercises.js';
import { WORKOUTS, WEEKDAYS } from './data.js';
import { get, update, dayLog } from './store.js';

const toMin = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
const toHHMM = (m) => `${String(Math.floor(m / 60) % 24).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;

export function scheduleFor(date = new Date()) {
  const { profile: p } = get();
  const dow = date.getDay();
  const weekend = dow === 0 || dow === 6;
  const ev = [];
  const meals = mealPlan(p, date, get().swaps);

  meals.forEach((m) => {
    ev.push({
      id: `meal:${m.id}`, time: m.time, kind: 'meal', mealId: m.id,
      title: `${m.icone} ${m.nome} — ${m.time}`,
      body: m.items.map((i) => formatItem(i).split(' — ')[0]).join(', '),
    });
    // Aviso 15 min antes para preparar/levar a marmita
    ev.push({ id: `prep:${m.id}`, time: toHHMM(toMin(m.time) - 15), kind: 'prep', mealId: m.id,
      title: `Em 15 min: ${m.nome}`, body: 'Separe a refeição agora. Sem improviso = sem escapada.' });
  });

  const nut = nutrition(p);
  const glasses = Math.round(nut.water / 250);
  [9, 11, 14, 16, 18, 20].forEach((h, i) => {
    ev.push({ id: `water:${h}`, time: toHHMM(h * 60 + 15), kind: 'water',
      title: '💧 Bebe água', body: `Meta do dia: ${(nut.water / 1000).toFixed(1).replace('.', ',')} L (${glasses} copos). Alvo até agora: ${Math.round(((i + 1) / 6) * glasses)} copos.` });
  });

  if (isTrainDay(p, date)) {
    const w = WORKOUTS[workoutFor(p, date)];
    ev.push({ id: 'train', time: toHHMM(toMin(p.trainTime) - 30), kind: 'train',
      title: `🏋️ Treino em 30 min: ${w.nome}`, body: `${w.foco}. Pré-treino feito? Bora!` });
  } else {
    ev.push({ id: 'cardio', time: toHHMM(toMin(p.wakeTime) + 30), kind: 'train',
      title: '🚶 Dia de descanso ativo', body: `Caminhada 40 min + meta de ${p.stepsGoal.toLocaleString('pt-BR')} passos. Carbo mais baixo hoje.` });
  }

  if (dow === 1) ev.push({ id: 'weigh', time: p.wakeTime, kind: 'check', title: '⚖️ Pesagem da semana', body: 'Em jejum, após o banheiro. Registre no app + medida da cintura.' });
  else ev.push({ id: 'weigh', time: p.wakeTime, kind: 'check', title: '⚖️ Peso do dia', body: 'Em jejum. A média semanal é o que importa.' });

  ev.push({ id: 'sleep', time: toHHMM(toMin(p.sleepTime) - 30), kind: 'sleep', title: '😴 Desliga as telas', body: 'Dormir 7–9 h protege o músculo no déficit.' });

  if (dow === 5) ev.push({ id: 'fri', time: '17:30', kind: 'weekend', title: '🔥 Sexta: o shape é feito no fim de semana', body: 'Já planeje: onde você vai comer sábado e domingo? Marmitas prontas?' });
  if (weekend) ev.push({ id: 'wknd', time: '09:30', kind: 'weekend', title: dow === 6 ? '🛡️ Sábado blindado' : '🛡️ Domingo blindado',
    body: 'Mesmos horários, mesmas refeições. Cada fim de semana fora da dieta apaga 2–3 dias de déficit.' });
  if (weekend) ev.push({ id: 'wknd-night', time: '19:30', kind: 'weekend', title: '🌙 Noite de fim de semana', body: 'Saiu? Proteína + salada, zero sobremesa, máx. 2 doses. Você tem um prazo.' });
  if (dow === 0) ev.push({ id: 'prep-week', time: '16:00', kind: 'weekend', title: '🥡 Meal prep da semana', body: 'Cozinhe frango, patinho, arroz e batata-doce para 3–4 dias. Semana preparada = dieta cumprida.' });

  return ev.sort((a, b) => toMin(a.time) - toMin(b.time));
}

// ------------------------------------------------------------
// Disparo enquanto o app está aberto
// ------------------------------------------------------------
let toastFn = () => {};
export function onToast(fn) { toastFn = fn; }

export async function requestPermission() {
  if (!('Notification' in window)) return 'unsupported';
  const r = await Notification.requestPermission();
  update((s) => { s.settings.notifications = r === 'granted'; });
  return r;
}

async function show(title, body, tag) {
  toastFn(title, body);
  if (navigator.vibrate) navigator.vibrate([120, 60, 120]);
  if (!get().settings.notifications || !('Notification' in window) || Notification.permission !== 'granted') return;
  try {
    const reg = await navigator.serviceWorker?.getRegistration();
    if (reg) reg.showNotification(title, { body, tag, icon: 'icons/icon-192.png', badge: 'icons/icon-192.png', vibrate: [120, 60, 120] });
    else new Notification(title, { body, tag });
  } catch { /* ignore */ }
}

export function tick(now = new Date()) {
  const key = iso(now);
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const log = dayLog(now);
  const sent = get().notified[key] || [];
  const due = scheduleFor(now).filter((e) => {
    const t = toMin(e.time);
    if (sent.includes(e.id) || t > nowMin || nowMin - t > 20) return false;
    if ((e.kind === 'meal' || e.kind === 'prep') && log.meals[e.mealId]) return false; // já comeu
    if (e.kind === 'water') {
      const target = Math.round((nutrition(get().profile).water / 250) * ((t - 480) / 720));
      if (log.water >= target) return false;
    }
    return true;
  });
  if (!due.length) return;
  update((s) => {
    // guarda só os últimos 3 dias
    Object.keys(s.notified).filter((k) => k < iso(new Date(now.getTime() - 3 * 864e5))).forEach((k) => delete s.notified[k]);
    s.notified[key] = [...sent, ...due.map((e) => e.id)];
  });
  due.forEach((e) => show(e.title, e.body, e.id));
}

export function startTicker() {
  tick();
  setInterval(tick, 30000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) tick(); });
}

export function testNotification() {
  show('✅ Alertas ativos', 'É assim que você vai ser lembrado de cada refeição — inclusive sábado e domingo.', 'test');
}

// ------------------------------------------------------------
// Calendário .ics — alarmes nativos do celular até a data-alvo
// ------------------------------------------------------------
export function buildICS() {
  const { profile: p } = get();
  const until = p.goalDate.replace(/-/g, '') + 'T235900';
  const start = new Date();
  start.setDate(start.getDate() + 1);
  const ds = iso(start).replace(/-/g, '');
  const stamp = new Date().toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z';
  const BYDAY = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
  const esc = (s) => s.replace(/[\\,;]/g, (m) => '\\' + m).replace(/\n/g, '\\n');
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Shape25//PT-BR', 'CALSCALE:GREGORIAN', 'X-WR-CALNAME:Shape 25/12'];
  let n = 0;
  const vevent = (title, body, time, rrule, dur = 15) => {
    const [h, m] = time.split(':');
    const st = `${ds}T${h}${m}00`;
    const endMin = toMin(time) + dur;
    const et = `${ds}T${toHHMM(endMin).replace(':', '')}00`;
    lines.push('BEGIN:VEVENT', `UID:shape25-${n++}-${ds}@shape25`, `DTSTAMP:${stamp}`, `DTSTART:${st}`, `DTEND:${et}`,
      `RRULE:${rrule};UNTIL=${until}`, `SUMMARY:${esc(title)}`, `DESCRIPTION:${esc(body)}`,
      'BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${esc(title)}`, 'TRIGGER:PT0M', 'END:VALARM', 'END:VEVENT');
  };

  // Refeições: agrupa dias com plano idêntico (treino, descanso, fim de semana) em uma regra
  const groups = new Map();
  for (let dow = 0; dow < 7; dow++) {
    const date = new Date();
    while (date.getDay() !== dow) date.setDate(date.getDate() + 1);
    mealPlan(p, date, get().swaps).forEach((m) => {
      const key = `${m.nome}|${m.time}|${JSON.stringify(m.items)}`;
      if (!groups.has(key)) groups.set(key, { m, days: [] });
      groups.get(key).days.push(BYDAY[dow]);
    });
  }
  groups.forEach(({ m, days }) => {
    vevent(`${m.icone} ${m.nome}`, m.items.map(formatItem).join('\n'), m.time, `FREQ=WEEKLY;BYDAY=${days.join(',')}`);
  });

  // Treinos por dia da semana
  p.trainDays.forEach((d) => {
    const date = new Date();
    while (date.getDay() !== d) date.setDate(date.getDate() + 1);
    const w = WORKOUTS[workoutFor(p, date)];
    vevent(`🏋️ Treino: ${w.nome}`, w.ex.map((e, i) => `${exName(p, workoutFor(p, date), i)} ${e.series}x${e.reps}`).join('\n'), p.trainTime, `FREQ=WEEKLY;BYDAY=${BYDAY[d]}`, 75);
  });

  vevent('💧 Água', 'Bebe 500 ml agora.', '10:45', 'FREQ=DAILY', 5);
  vevent('💧 Água', 'Bebe 500 ml agora.', '15:15', 'FREQ=DAILY', 5);
  vevent('⚖️ Pesagem semanal + cintura', 'Em jejum, registre no app.', p.wakeTime, 'FREQ=WEEKLY;BYDAY=MO', 5);
  vevent('😴 Desliga as telas', 'Dormir bem protege o músculo.', toHHMM(toMin(p.sleepTime) - 30), 'FREQ=DAILY', 5);
  vevent('🔥 Sexta: planeje o fim de semana', 'Marmitas, onde vai comer, zero improviso.', '17:30', 'FREQ=WEEKLY;BYDAY=FR', 5);
  vevent('🛡️ Fim de semana blindado', 'Mesmos horários e refeições. O shape é feito no sábado e domingo.', '09:30', 'FREQ=WEEKLY;BYDAY=SA,SU', 5);
  vevent('🥡 Meal prep da semana', 'Frango, patinho, arroz e batata-doce para 3–4 dias.', '16:00', 'FREQ=WEEKLY;BYDAY=SU', 60);
  lines.push('END:VCALENDAR');
  // Quebra de linhas longas (RFC 5545: 75 octetos) — simplificado por caracteres
  return lines.map((l) => (l.length > 60 ? l.match(/.{1,60}/gu).join('\r\n ') : l)).join('\r\n');
}

export function nextEvent(now = new Date()) {
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const log = dayLog(now);
  return scheduleFor(now).find((e) => toMin(e.time) > nowMin && e.kind !== 'prep' && e.kind !== 'water' && !(e.kind === 'meal' && log.meals[e.mealId]));
}

export { WEEKDAYS };
