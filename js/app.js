// ============================================================
// SHAPE 25/12 — app principal (roteamento + telas)
// ============================================================
import { WORKOUTS, SPLITS, DEFAULT_DAYS, WEEKDAYS, WEEKDAYS_FULL, WEEKEND_RULES, SCIENCE_NOTES, FOODS, SWAPS, MEAL_TEMPLATES } from './data.js';
import { nutrition, mealPlan, isTrainDay, workoutFor, formatItem, equivalent, macrosOf, weeklyCheck, avgWeight, iso, daysUntil, ACTIVITY, DEFICITS } from './calc.js';
import { get, update, save, dayLog, lastSets, dietStreak, exportJSON, importJSON, reset } from './store.js';
import { startTicker, onToast, requestPermission, testNotification, buildICS, scheduleFor, nextEvent } from './notify.js';

const $ = (s, el = document) => el.querySelector(s);
const main = $('#view');
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = (n, d = 0) => Number(n).toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d });

// ------------------------------------------------------------ ícones
const I = {
  home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>',
  dumbbell: '<path d="M6.5 6.5v11M17.5 6.5v11M3 9v6M21 9v6M6.5 12h11"/>',
  food: '<path d="M7 3v8M4 3v5a3 3 0 0 0 6 0V3M7 11v10M17 3c-2 1-3 3.5-3 7h3v11"/>',
  chart: '<path d="M3 3v18h18M7 15l4-4 3 3 6-7"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>',
  bell: '<path d="M6 8a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8M10 21h4"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  swap: '<path d="M7 4 3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  flame: '<path d="M12 3c1 4 5 5.5 5 10a5 5 0 0 1-10 0c0-2.5 1.5-3.5 2-5 1 1.5 2 2 2 2s-1-4 1-7"/>',
  drop: '<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11"/>',
  timer: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5M9 2h6"/>',
  cal: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  chev: '<path d="m9 6 6 6-6 6"/>',
  shield: '<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><path d="m9 12 2 2 4-4"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
  cart: '<path d="M3 4h2l2.5 11h11L21 7H6.5"/><circle cx="9" cy="19.5" r="1.5"/><circle cx="17" cy="19.5" r="1.5"/>',
};
const icon = (n, cls = '') => `<svg class="ic ${cls}" viewBox="0 0 24 24" aria-hidden="true">${I[n]}</svg>`;

// ------------------------------------------------------------ helpers de UI
function ring(pct, size = 64, stroke = 7, label = '', color = 'var(--accent)') {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r, v = Math.max(0, Math.min(1, pct));
  return `<div class="ring" style="width:${size}px;height:${size}px">
    <svg viewBox="0 0 ${size} ${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${r}" stroke-width="${stroke}" class="ring-bg"/>
    <circle cx="${size / 2}" cy="${size / 2}" r="${r}" stroke-width="${stroke}" stroke="${color}" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - v)}" class="ring-fg"/></svg>
    <span>${label}</span></div>`;
}
function bar(label, val, max, unit, color) {
  const pct = max ? Math.min(100, (val / max) * 100) : 0;
  return `<div class="macro"><div class="macro-top"><span>${label}</span><b>${fmt(val)}<small>/${fmt(max)}${unit}</small></b></div>
    <div class="bar"><i style="width:${pct}%;background:${color}"></i></div></div>`;
}
let toastTimer;
function toast(title, body = '') {
  const el = $('#toast');
  el.innerHTML = `<b>${esc(title)}</b>${body ? `<span>${esc(body)}</span>` : ''}`;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 4500);
}
function sheet(html) {
  const s = $('#sheet');
  s.querySelector('.sheet-body').innerHTML = html;
  s.showModal();
}
const closeSheet = () => $('#sheet').close();

// ------------------------------------------------------------ estado da UI
const ui = { dietDay: null, trainDate: null };
const today = () => new Date();

// ============================================================ TELAS
const views = {
  hoje() {
    const { profile: p } = get();
    const d = today();
    const k = iso(d);
    const log = dayLog(d);
    const nut = nutrition(p);
    const train = isTrainDay(p, d);
    const D = train ? nut.train : nut.rest;
    const meals = mealPlan(p, d, get().swaps);
    const eaten = macrosOf(meals.filter((m) => log.meals[m.id]).flatMap((m) => m.items));
    const left = daysUntil(p.goalDate, d);
    const total = Math.max(1, daysUntil(p.goalDate, new Date(p.startDate + 'T12:00:00')));
    const wk = workoutFor(p, d);
    const w = wk ? WORKOUTS[wk] : null;
    const wDone = log.workout?.done;
    const next = nextEvent(d);
    const streak = dietStreak(meals.map((m) => m.id), d);
    const cur = avgWeight(get().weights, d, 7) ?? p.weight;
    const dow = d.getDay();
    const weekend = dow === 0 || dow === 5 || dow === 6;
    const hour = d.getHours();
    const hello = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
    const glasses = Math.round(nut.water / 250);

    return `
    <header class="hero">
      <div>
        <p class="eyebrow">${WEEKDAYS_FULL[dow]} · ${d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</p>
        <h1>${hello}, ${esc(p.name)}.</h1>
        <p class="muted">${left > 0 ? `Faltam <b class="accent">${left} dias</b> para o shape de 25/12.` : left === 0 ? '<b class="accent">É hoje!</b> Mostra o shape.' : 'Prazo concluído. Bora para o próximo objetivo.'}</p>
      </div>
      ${ring(1 - left / total, 84, 8, `<b>${Math.max(0, left)}</b><small>dias</small>`)}
    </header>

    <section class="stats3">
      <div class="stat"><small>Peso (média 7d)</small><b>${fmt(cur, 1)}<i>kg</i></b><em>meta ${fmt(p.goalWeight, 1)}</em></div>
      <div class="stat"><small>Sequência dieta</small><b>${streak}<i>${streak === 1 ? 'dia' : 'dias'}</i></b><em>${streak >= 3 ? 'não quebra!' : '100% = conta'}</em></div>
      <div class="stat"><small>Hoje é dia de</small><b class="sm">${train ? 'Treino' : 'Descanso'}</b><em>${train ? 'carbo alto' : 'carbo baixo'}</em></div>
    </section>

    ${next ? `<a class="card next" href="#/dieta">${icon('bell')}<div><small>Próximo alerta · ${next.time}</small><b>${esc(next.title.replace(/ — \d\d:\d\d$/, ''))}</b></div>${icon('chev', 'dim')}</a>` : ''}

    <section class="card">
      <div class="card-h"><h2>${icon('flame')} Macros de hoje</h2><span class="pill">${fmt(D.kcal)} kcal</span></div>
      <div class="macros">
        ${bar('Calorias', eaten.kcal, D.kcal, '', 'var(--accent)')}
        ${bar('Proteína', eaten.p, D.p, 'g', 'var(--prot)')}
        ${bar('Carboidrato', eaten.c, D.c, 'g', 'var(--carb)')}
        ${bar('Gordura', eaten.g, D.g, 'g', 'var(--fat)')}
      </div>
    </section>

    <section class="card">
      <div class="card-h"><h2>${icon('food')} Refeições</h2><a class="link" href="#/dieta">ver plano</a></div>
      <ul class="checklist">
        ${meals.map((m) => `<li><button class="check ${log.meals[m.id] ? 'on' : ''}" data-act="meal" data-id="${m.id}" aria-pressed="${!!log.meals[m.id]}">
          <span class="box">${icon('check')}</span><span class="t">${m.time}</span><span class="n">${m.icone} ${m.nome}</span><span class="k">${fmt(m.macros.kcal)} kcal</span></button></li>`).join('')}
      </ul>
    </section>

    <section class="card ${wDone ? 'done' : ''}">
      <div class="card-h"><h2>${icon('dumbbell')} Treino</h2>${w ? `<span class="pill">${p.trainTime}</span>` : ''}</div>
      ${w ? `<h3>${w.nome}</h3><p class="muted">${w.foco} · ${w.ex.length} exercícios · ~${Math.round(w.ex.reduce((a, e) => a + e.series * (e.desc + 45), 0) / 60)} min</p>
        <a class="btn ${wDone ? 'ghost' : 'primary'}" href="#/treino">${wDone ? 'Treino concluído ✓ — revisar' : 'Começar treino'}</a>`
      : `<h3>Descanso ativo</h3><p class="muted">Caminhada de 30–45 min e ${fmt(p.stepsGoal)} passos. Recuperar também constrói o shape.</p>
        <button class="check wide ${log.cardio ? 'on' : ''}" data-act="cardio"><span class="box">${icon('check')}</span><span class="n">Caminhada feita</span></button>`}
    </section>

    <section class="card">
      <div class="card-h"><h2>${icon('drop')} Hábitos</h2></div>
      <div class="habit">
        <div><b>Água</b><small>${fmt(log.water * 0.25, 2)} / ${fmt(nut.water / 1000, 1)} L</small></div>
        <div class="glasses">${Array.from({ length: glasses }, (_, i) => `<i class="${i < log.water ? 'on' : ''}"></i>`).join('')}</div>
        <div class="stepper"><button data-act="water" data-v="-1" aria-label="menos água">${icon('minus')}</button><button data-act="water" data-v="1" aria-label="mais água">${icon('plus')}</button></div>
      </div>
      <div class="habit">
        <div><b>Passos</b><small>meta ${fmt(p.stepsGoal)}</small></div>
        <input type="number" inputmode="numeric" class="inp" data-field="steps" value="${log.steps || ''}" placeholder="0">
      </div>
      <div class="habit">
        <div><b>Sono</b><small>meta 7–9 h</small></div>
        <input type="number" inputmode="decimal" step="0.5" class="inp" data-field="sleep" value="${log.sleep || ''}" placeholder="h">
      </div>
      ${train ? `<div class="habit"><div><b>Cardio leve</b><small>20 min pós-treino (opcional)</small></div>
        <button class="check sq ${log.cardio ? 'on' : ''}" data-act="cardio" aria-label="cardio"><span class="box">${icon('check')}</span></button></div>` : ''}
    </section>

    ${weekend ? weekendCard(dow) : ''}
    `;
  },

  treino() {
    const { profile: p } = get();
    const n = p.trainDays.length;
    const split = SPLITS[n];
    const date = ui.trainDate ? new Date(ui.trainDate + 'T12:00:00') : today();
    const k = iso(date);
    const wk = workoutFor(p, date) || ui.pickWorkout;
    const log = dayLog(date);

    const week = [1, 2, 3, 4, 5, 6, 0].map((dow) => {
      const dd = new Date(today());
      dd.setDate(dd.getDate() + ((dow - dd.getDay() + 7) % 7));
      const w = workoutFor(p, dd);
      return `<li class="${dow === today().getDay() ? 'today' : ''}"><span>${WEEKDAYS[dow]}</span><b>${w ? WORKOUTS[w].nome : 'Descanso ativo'}</b></li>`;
    }).join('');

    let session = '';
    if (wk) {
      const w = WORKOUTS[wk];
      if (!log.workout || log.workout.key !== wk) log.workout = { key: wk, sets: {}, done: false };
      const doneSets = Object.values(log.workout.sets).flat().filter((s) => s.done).length;
      const totalSets = w.ex.reduce((a, e) => a + e.series, 0);
      session = `
      <section class="card session">
        <div class="card-h"><div><p class="eyebrow">${WEEKDAYS_FULL[date.getDay()]} · ${date.toLocaleDateString('pt-BR')}</p><h2 class="lg">${w.nome}</h2><p class="muted">${w.foco}</p></div>
          ${ring(doneSets / totalSets, 60, 6, `<b>${doneSets}</b><small>/${totalSets}</small>`)}</div>
        <div class="tipbox">${icon('info')} <span>Deixe <b>1–2 repetições na reserva</b> (RIR). Bateu o topo da faixa em todas as séries? <b>Suba 2,5 kg</b> na próxima. No déficit, a meta é <b>manter as cargas</b>.</span></div>
      </section>
      ${w.ex.map((e, i) => exerciseCard(e, i, log, k)).join('')}
      <button class="btn ${log.workout.done ? 'ghost' : 'primary'} block" data-act="finish">${log.workout.done ? 'Treino concluído ✓' : 'Finalizar treino'}</button>`;
    } else {
      session = `<section class="card"><h3>Hoje é descanso ativo 🚶</h3>
        <p class="muted">Caminhada 30–45 min em jejum ou após o café + ${fmt(p.stepsGoal)} passos. Quer treinar mesmo assim? Escolha um treino extra:</p>
        <div class="chips">${split.seq.map((s) => `<button class="chip" data-act="pick" data-w="${s}">${WORKOUTS[s].nome}</button>`).join('')}</div></section>`;
    }

    return `
    <header class="page-h"><h1>Treino</h1><p class="muted">Hipertrofia em déficit: cargas altas, volume enxuto, abdômen 3–4x/semana.</p></header>

    <section class="card">
      <div class="card-h"><h2>${icon('cal')} Quantos dias por semana?</h2></div>
      <div class="seg">${[2, 3, 4, 5, 6].map((x) => `<button class="${x === n ? 'on' : ''}" data-act="days" data-n="${x}">${x}x</button>`).join('')}</div>
      <p class="muted sm">Divisão: <b>${split?.nome ?? '—'}</b>. Toque nos dias para escolher quais:</p>
      <div class="weekpick">${[1, 2, 3, 4, 5, 6, 0].map((dw) => `<button class="${p.trainDays.includes(dw) ? 'on' : ''}" data-act="toggleDay" data-d="${dw}">${WEEKDAYS[dw]}</button>`).join('')}</div>
      <ul class="week">${week}</ul>
    </section>

    ${session}

    <section class="card">
      <div class="card-h"><h2>${icon('flame')} Cardio para o tanquinho</h2></div>
      <ul class="bullets">
        <li><b>${fmt(p.stepsGoal)} passos/dia</b> — o cardio que mais queima gordura sem roubar recuperação.</li>
        <li><b>2–3x por semana:</b> 20–30 min de esteira inclinada (10–12%, 5 km/h) após o treino.</li>
        <li><b>Abdômen</b> já está nos treinos. Tanquinho aparece com <b>~10–12% de gordura</b>: quem revela é a dieta.</li>
      </ul>
    </section>`;
  },

  dieta() {
    const { profile: p, swaps } = get();
    const nut = nutrition(p);
    const d = today();
    const isTrain = ui.dietDay ?? isTrainDay(p, d);
    // Data de referência com o tipo de dia selecionado
    const ref = new Date(d);
    for (let i = 0; i < 7 && isTrainDay(p, ref) !== isTrain; i++) ref.setDate(ref.getDate() + 1);
    const showingToday = iso(ref) === iso(d);
    const meals = mealPlan(p, ref, swaps);
    const D = isTrain ? nut.train : nut.rest;
    const log = dayLog(d);
    const sched = scheduleFor(d);
    const notifOn = get().settings.notifications && 'Notification' in window && Notification.permission === 'granted';

    return `
    <header class="page-h"><h1>Dieta</h1><p class="muted">Déficit com proteína alta e carb cycling. Pese os alimentos <b>prontos</b>.</p></header>

    <section class="card">
      <div class="seg">
        <button class="${isTrain ? 'on' : ''}" data-act="dietDay" data-v="1">Dia de treino</button>
        <button class="${!isTrain ? 'on' : ''}" data-act="dietDay" data-v="0">Dia de descanso</button>
      </div>
      <div class="kcal-big"><b>${fmt(D.kcal)}</b><span>kcal</span></div>
      <div class="mgrid">
        <div style="--c:var(--prot)"><b>${D.p}g</b><small>Proteína</small></div>
        <div style="--c:var(--carb)"><b>${D.c}g</b><small>Carbo</small></div>
        <div style="--c:var(--fat)"><b>${D.g}g</b><small>Gordura</small></div>
      </div>
      <p class="muted sm center">Gasto estimado ${fmt(nut.tdee)} kcal · déficit médio ${fmt(nut.tdee - nut.target)} kcal/dia · ~${fmt(nut.weeklyLossKg, 2)} kg/semana</p>
    </section>

    ${meals.map((m) => `
      <section class="card meal ${showingToday && log.meals[m.id] ? 'done' : ''}">
        <div class="card-h">
          <div class="meal-t"><span class="emoji">${m.icone}</span><div><h3>${m.nome}</h3><input type="time" class="time" value="${m.time}" data-act="mealTime" data-id="${m.id}" aria-label="horário"></div></div>
          ${showingToday ? `<button class="check sq ${log.meals[m.id] ? 'on' : ''}" data-act="meal" data-id="${m.id}" aria-label="marcar refeição"><span class="box">${icon('check')}</span></button>` : ''}
        </div>
        <ul class="items">${m.items.map(([f, g]) => {
          const slot = Object.entries(m.slots).find(([, orig]) => orig && (swaps[`${m.id}:${orig}`] || orig) === f);
          const orig = slot?.[1];
          return `<li><span>${esc(formatItem([f, g]))}</span>${SWAPS[f] && orig ? `<button class="icon-btn" data-act="swap" data-meal="${m.id}" data-orig="${orig}" data-food="${f}" data-g="${g}" aria-label="trocar">${icon('swap')}</button>` : ''}</li>`;
        }).join('')}</ul>
        <div class="meal-m"><span>${fmt(m.macros.kcal)} kcal</span><span class="p">P ${fmt(m.macros.p)}g</span><span class="c">C ${fmt(m.macros.c)}g</span><span class="g">G ${fmt(m.macros.g)}g</span></div>
      </section>`).join('')}

    <section class="card alerts">
      <div class="card-h"><h2>${icon('bell')} Alertas da dieta</h2><span class="pill ${notifOn ? 'ok' : 'warn'}">${notifOn ? 'ativos' : 'desligados'}</span></div>
      <p class="muted sm">Alertas 15 min antes de cada refeição, no horário, de água, treino, sono — e reforço extra na <b>sexta, sábado e domingo</b>.</p>
      <div class="btns">
        <button class="btn primary" data-act="notif">${notifOn ? 'Testar alerta' : 'Ativar notificações'}</button>
        <button class="btn ghost" data-act="ics">${icon('cal')} Alarmes no calendário</button>
      </div>
      <p class="muted xs">As notificações funcionam com o app aberto/em segundo plano. Para alarme garantido com o celular bloqueado, adicione o calendário (.ics): ele cria alarmes recorrentes até ${new Date(p.goalDate + 'T12:00').toLocaleDateString('pt-BR')}.</p>
      <details><summary>Agenda de hoje (${sched.length} alertas)</summary>
        <ul class="sched">${sched.map((e) => `<li><time>${e.time}</time><span>${esc(e.title.replace(/ — \d\d:\d\d$/, ''))}</span></li>`).join('')}</ul>
      </details>
    </section>

    ${weekendCard(6, true)}

    <section class="card">
      <div class="card-h"><h2>${icon('cart')} Lista de compras (7 dias)</h2></div>
      ${shoppingList()}
    </section>

    <section class="card">
      <div class="card-h"><h2>${icon('info')} Liberados à vontade</h2></div>
      <p class="muted sm">Folhas, pepino, tomate, abobrinha, brócolis, couve-flor · café sem açúcar · chá · água com gás · adoçante · temperos naturais, limão, vinagre · refrigerante zero (com moderação).</p>
    </section>`;
  },

  progresso() {
    const { profile: p, weights, waist } = get();
    const d = today();
    const k = iso(d);
    const todayW = weights.find((w) => w.date === k);
    const todayWaist = waist.find((w) => w.date === k);
    const check = weeklyCheck(weights, d);
    const cur = avgWeight(weights, d, 7);
    const first = weights.length ? [...weights].sort((a, b) => a.date.localeCompare(b.date))[0] : null;
    const lost = first && cur ? first.kg - cur : 0;
    const left = daysUntil(p.goalDate, d);
    const needed = cur && left > 0 ? ((cur - p.goalWeight) / (left / 7)) : null;
    const logs = get().logs;
    const keys = Object.keys(logs).filter((x) => x >= p.startDate && x <= k);
    const workouts = keys.filter((x) => logs[x].workout?.done).length;
    const mealIds = MEAL_TEMPLATES.map((m) => m.id);
    const totalMeals = keys.length * mealIds.length;
    const eaten = keys.reduce((a, x) => a + mealIds.filter((id) => logs[x].meals?.[id]).length, 0);
    const adherence = totalMeals ? Math.round((eaten / totalMeals) * 100) : 0;
    const waistSorted = [...waist].sort((a, b) => a.date.localeCompare(b.date));

    return `
    <header class="page-h"><h1>Progresso</h1><p class="muted">Pese-se todo dia em jejum. Decida pela <b>média semanal</b>, nunca por um dia.</p></header>

    <section class="card">
      <div class="logrow">
        <label><small>Peso hoje (kg)</small><input type="number" inputmode="decimal" step="0.1" class="inp lg" id="wIn" value="${todayW?.kg ?? ''}" placeholder="${fmt(cur ?? p.weight, 1)}"></label>
        <label><small>Cintura (cm)</small><input type="number" inputmode="decimal" step="0.5" class="inp lg" id="cIn" value="${todayWaist?.cm ?? ''}" placeholder="umbigo"></label>
        <button class="btn primary" data-act="logWeight">Salvar</button>
      </div>
      ${chart(p, weights)}
    </section>

    ${check ? `<section class="card checkin ${check.tone}">
      <div class="card-h"><h2>${icon('shield')} Check-in semanal</h2><span class="pill ${check.tone}">${fmt(check.rate, 2)}%/sem</span></div>
      <p>Média: <b>${fmt(check.prev, 1)} → ${fmt(check.cur, 1)} kg</b>. ${check.advice}</p>
      ${check.adjust ? `<button class="btn primary" data-act="adjust" data-v="${check.adjust}">Aplicar ${check.adjust > 0 ? '+' : ''}${check.adjust} kcal</button>` : ''}
      ${p.kcalAdjust ? `<p class="muted xs">Ajuste acumulado: ${p.kcalAdjust > 0 ? '+' : ''}${p.kcalAdjust} kcal · <button class="link" data-act="adjustReset">zerar</button></p>` : ''}
    </section>` : `<section class="card"><p class="muted">${icon('info')} O check-in semanal aparece após 2 semanas de pesagens. Ele ajusta as calorias automaticamente para manter a perda em 0,5–1%/semana.</p></section>`}

    <section class="grid2">
      <div class="stat card"><small>Perdido</small><b>${fmt(Math.max(0, lost), 1)}<i>kg</i></b></div>
      <div class="stat card"><small>Faltam p/ meta</small><b>${cur ? fmt(Math.max(0, cur - p.goalWeight), 1) : '—'}<i>kg</i></b></div>
      <div class="stat card"><small>Ritmo necessário</small><b>${needed != null ? fmt(Math.max(0, needed), 2) : '—'}<i>kg/sem</i></b>${needed != null && cur && needed / cur > 0.012 ? '<em class="warn">meta agressiva — foque em cintura</em>' : ''}</div>
      <div class="stat card"><small>Cintura</small><b>${waistSorted.length ? fmt(waistSorted.at(-1).cm, 1) : '—'}<i>cm</i></b>${waistSorted.length > 1 ? `<em>${fmt(waistSorted.at(-1).cm - waistSorted[0].cm, 1)} cm</em>` : ''}</div>
      <div class="stat card"><small>Treinos feitos</small><b>${workouts}</b></div>
      <div class="stat card"><small>Adesão à dieta</small><b>${adherence}<i>%</i></b><em>${adherence >= 90 ? 'excelente' : 'meta: 90%+'}</em></div>
    </section>

    <section class="card">
      <div class="card-h"><h2>${icon('info')} Por que o plano é assim</h2></div>
      <dl class="science">${SCIENCE_NOTES.map(([t, x]) => `<dt>${t}</dt><dd>${x}</dd>`).join('')}</dl>
    </section>`;
  },

  perfil() {
    const { profile: p } = get();
    const nut = nutrition(p);
    const onboarding = !p.onboarded;
    const f = (id, label, val, attrs = '') => `<label class="fld"><small>${label}</small><input class="inp" data-prof="${id}" value="${esc(val)}" ${attrs}></label>`;
    return `
    <header class="page-h">${onboarding ? `<p class="eyebrow">Bem-vindo</p><h1>Vamos montar seu shape até 25/12</h1>
      <p class="muted">Preencha seus dados reais — calorias, macros e quantidades de cada refeição são calculadas a partir deles.</p>` : '<h1>Perfil e metas</h1>'}</header>

    <section class="card">
      <div class="card-h"><h2>${icon('user')} Seus dados</h2></div>
      <div class="form">
        ${f('name', 'Nome', p.name)}
        <label class="fld"><small>Sexo</small><select class="inp" data-prof="sex"><option value="M" ${p.sex === 'M' ? 'selected' : ''}>Masculino</option><option value="F" ${p.sex === 'F' ? 'selected' : ''}>Feminino</option></select></label>
        ${f('age', 'Idade', p.age, 'type="number" inputmode="numeric"')}
        ${f('height', 'Altura (cm)', p.height, 'type="number" inputmode="numeric"')}
        ${f('weight', 'Peso atual (kg)', p.weight, 'type="number" step="0.1" inputmode="decimal"')}
        ${f('bf', '% gordura (opcional)', p.bf || '', 'type="number" step="0.5" inputmode="decimal"')}
        ${f('goalWeight', 'Peso meta (kg)', p.goalWeight, 'type="number" step="0.1" inputmode="decimal"')}
        ${f('goalDate', 'Data do shape', p.goalDate, 'type="date"')}
      </div>
    </section>

    <section class="card">
      <div class="card-h"><h2>${icon('flame')} Nível de atividade</h2></div>
      <div class="opts">${ACTIVITY.map((a) => `<button class="opt ${p.activity === a.v ? 'on' : ''}" data-act="prof" data-k="activity" data-v="${a.v}"><b>${a.label}</b><small>${a.desc}</small></button>`).join('')}</div>
      <div class="card-h mt"><h2>${icon('chart')} Velocidade do cutting</h2></div>
      <div class="opts">${DEFICITS.map((a) => `<button class="opt ${p.deficit === a.v ? 'on' : ''}" data-act="prof" data-k="deficit" data-v="${a.v}"><b>${a.label}</b><small>${a.desc}</small></button>`).join('')}</div>
    </section>

    <section class="card">
      <div class="card-h"><h2>${icon('timer')} Rotina</h2></div>
      <div class="form">
        ${f('wakeTime', 'Acordo às', p.wakeTime, 'type="time"')}
        ${f('trainTime', 'Treino às', p.trainTime, 'type="time"')}
        ${f('sleepTime', 'Durmo às', p.sleepTime, 'type="time"')}
        ${f('stepsGoal', 'Meta de passos', p.stepsGoal, 'type="number" inputmode="numeric"')}
      </div>
      <p class="muted xs">Dias de treino e horários de cada refeição são ajustados nas abas Treino e Dieta.</p>
    </section>

    <section class="card summary">
      <div class="card-h"><h2>${icon('shield')} Seu plano calculado</h2></div>
      <div class="sumgrid">
        <div><small>Metabolismo basal</small><b>${fmt(nut.bmr)} kcal</b></div>
        <div><small>Gasto diário</small><b>${fmt(nut.tdee)} kcal</b></div>
        <div><small>Meta média</small><b class="accent">${fmt(nut.target)} kcal</b></div>
        <div><small>Proteína</small><b>${nut.train.p} g/dia</b></div>
        <div><small>Treino / Descanso</small><b>${fmt(nut.train.kcal)} / ${fmt(nut.rest.kcal)}</b></div>
        <div><small>Projeção até a data</small><b>−${fmt(nut.weeklyLossKg * Math.max(0, daysUntil(p.goalDate)) / 7, 1)} kg</b></div>
      </div>
      ${onboarding ? `<button class="btn primary block" data-act="onboard">Gerar meu plano 🚀</button>` : ''}
    </section>

    ${onboarding ? '' : `<section class="card">
      <div class="card-h"><h2>Backup</h2></div>
      <p class="muted sm">Seus dados ficam só neste aparelho. Faça backup antes de trocar de celular.</p>
      <div class="btns"><button class="btn ghost" data-act="export">Exportar</button><label class="btn ghost">Importar<input type="file" accept="application/json" hidden id="importIn"></label><button class="btn danger" data-act="reset">Apagar tudo</button></div>
    </section>`}
    <p class="muted xs center">Este app não substitui acompanhamento de nutricionista/médico. Em caso de doença, medicação ou dúvida, consulte um profissional.</p>`;
  },
};

// ------------------------------------------------------------ componentes
function weekendCard(dow, always = false) {
  const title = dow === 5 ? 'Sexta: prepare o fim de semana' : always ? 'Protocolo fim de semana blindado' : 'Fim de semana blindado';
  return `<section class="card weekend">
    <div class="card-h"><h2>${icon('shield')} ${title}</h2></div>
    <ul class="bullets">${WEEKEND_RULES.map((r) => `<li>${r}</li>`).join('')}</ul>
    <p class="muted xs">1 fim de semana livre ≈ 3.000–5.000 kcal extras ≈ metade do déficit da semana. Com ${Math.max(0, daysUntil(get().profile.goalDate))} dias, cada um conta.</p>
  </section>`;
}

function exerciseCard(e, i, log, dateKey) {
  const sets = log.workout.sets[e.nome] || Array.from({ length: e.series }, () => ({ w: '', r: '', done: false }));
  const last = lastSets(e.nome, dateKey);
  const top = parseInt(String(e.reps).split('-')[1] || e.reps, 10);
  const lastTxt = last ? last.sets.map((s) => `${s.w}×${s.r}`).join(' · ') : null;
  const progress = last && !isNaN(top) && last.sets.length >= e.series && last.sets.every((s) => Number(s.r) >= top);
  const allDone = sets.every((s) => s.done);
  return `<section class="card ex ${allDone ? 'done' : ''}" data-ex="${i}">
    <div class="ex-h"><span class="num">${i + 1}</span><div><h3>${esc(e.nome)}</h3><p class="muted xs">${e.grupo} · ${e.series}×${e.reps} · descanso ${e.desc >= 60 ? `${Math.floor(e.desc / 60)}min${e.desc % 60 ? e.desc % 60 + 's' : ''}` : e.desc + 's'}</p></div></div>
    ${e.dica ? `<p class="dica">${esc(e.dica)}</p>` : ''}
    ${lastTxt ? `<p class="last">Última: <b>${lastTxt}</b>${progress ? ' <span class="up">↑ suba a carga</span>' : ''}</p>` : ''}
    <div class="sets">
      <div class="set head"><span>Série</span><span>kg</span><span>reps</span><span></span></div>
      ${sets.map((s, j) => `<div class="set ${s.done ? 'on' : ''}"><span>${j + 1}</span>
        <input class="inp" type="number" inputmode="decimal" step="0.5" placeholder="${last?.sets[j]?.w ?? 'kg'}" value="${s.w}" data-set="${j}" data-k="w" data-name="${esc(e.nome)}">
        <input class="inp" type="number" inputmode="numeric" placeholder="${e.reps}" value="${s.r}" data-set="${j}" data-k="r" data-name="${esc(e.nome)}">
        <button class="check sq ${s.done ? 'on' : ''}" data-act="set" data-set="${j}" data-name="${esc(e.nome)}" data-rest="${e.desc}" data-n="${e.series}" aria-label="série feita"><span class="box">${icon('check')}</span></button></div>`).join('')}
    </div>
  </section>`;
}

function shoppingList() {
  const { profile: p, swaps } = get();
  const tot = {};
  const d = new Date();
  for (let i = 0; i < 7; i++) {
    mealPlan(p, d, swaps).forEach((m) => m.items.forEach(([f, g]) => { if (f !== 'salada') tot[f] = (tot[f] || 0) + g; }));
    d.setDate(d.getDate() + 1);
  }
  const rows = Object.entries(tot).sort((a, b) => b[1] - a[1]).map(([f, g]) => {
    const F = FOODS[f];
    let q = g >= 1000 ? `${fmt(g / 1000, 1)} kg` : `${fmt(g)} g`;
    if (f === 'ovo') q = `${Math.ceil(g / 50)} ovos`;
    if (f === 'whey') q = `${Math.ceil(g / 30)} scoops (${fmt(g)} g)`;
    const raw = ['frango', 'patinho', 'tilapia'].includes(f) ? ' <small>(cru ≈ ' + fmt((g * 1.35) / 1000, 1) + ' kg)</small>' : ['arroz', 'macarrao'].includes(f) ? ' <small>(cru ≈ ' + fmt(g / 2.6) + ' g)</small>' : '';
    return `<li><span>${F.nome}</span><b>${q}${raw}</b></li>`;
  }).join('');
  return `<ul class="shop">${rows}<li><span>Folhas e legumes</span><b>à vontade (~3 kg)</b></li></ul>`;
}

function chart(p, weights) {
  const W = 340, H = 170, pad = { l: 34, r: 10, t: 12, b: 22 };
  const start = new Date(p.startDate + 'T12:00:00');
  const end = new Date(p.goalDate + 'T12:00:00');
  const sorted = [...weights].sort((a, b) => a.date.localeCompare(b.date)).filter((w) => w.date >= iso(start) || true);
  const vals = [...sorted.map((w) => w.kg), p.goalWeight, p.weight];
  const lo = Math.floor(Math.min(...vals) - 1), hi = Math.ceil(Math.max(...vals) + 1);
  const x0 = Math.min(start.getTime(), sorted.length ? new Date(sorted[0].date + 'T12:00:00').getTime() : start.getTime());
  const X = (t) => pad.l + ((t - x0) / (end.getTime() - x0)) * (W - pad.l - pad.r);
  const Y = (v) => pad.t + ((hi - v) / (hi - lo)) * (H - pad.t - pad.b);
  const T = (ds) => new Date(ds + 'T12:00:00').getTime();
  const avg = sorted.map((w) => [T(w.date), avgWeight(sorted, new Date(w.date + 'T12:00:00'), 7)]);
  const path = avg.map(([t, v], i) => `${i ? 'L' : 'M'}${X(t).toFixed(1)},${Y(v).toFixed(1)}`).join('');
  const ticks = [lo, Math.round((lo + hi) / 2), hi];
  const startW = sorted.length ? sorted[0].kg : p.weight;
  const startT = sorted.length ? T(sorted[0].date) : start.getTime();
  return `<figure class="chart">
    <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Evolução do peso">
      ${ticks.map((v) => `<line x1="${pad.l}" x2="${W - pad.r}" y1="${Y(v)}" y2="${Y(v)}" class="grid"/><text x="${pad.l - 6}" y="${Y(v) + 3}" class="ax" text-anchor="end">${v}</text>`).join('')}
      <line x1="${X(startT)}" y1="${Y(startW)}" x2="${X(end.getTime())}" y2="${Y(p.goalWeight)}" class="goal-line"/>
      <circle cx="${X(end.getTime())}" cy="${Y(p.goalWeight)}" r="4" class="goal-dot"/>
      <text x="${X(end.getTime()) - 4}" y="${Y(p.goalWeight) - 8}" class="ax" text-anchor="end">25/12 · ${fmt(p.goalWeight, 1)}</text>
      ${sorted.map((w) => `<circle cx="${X(T(w.date)).toFixed(1)}" cy="${Y(w.kg).toFixed(1)}" r="2.4" class="pt"/>`).join('')}
      ${path ? `<path d="${path}" class="avg"/>` : ''}
      <text x="${pad.l}" y="${H - 6}" class="ax">${start.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</text>
      <text x="${W - pad.r}" y="${H - 6}" class="ax" text-anchor="end">${end.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</text>
    </svg>
    <figcaption><span class="lg-pt"></span>pesagem <span class="lg-avg"></span>média 7 dias <span class="lg-goal"></span>rota até a meta</figcaption>
  </figure>`;
}

// ------------------------------------------------------------ timer de descanso
const timer = { end: 0, id: null };
function startRest(sec) {
  timer.end = Date.now() + sec * 1000;
  $('#rest').classList.add('show');
  clearInterval(timer.id);
  const tickT = () => {
    const left = Math.max(0, Math.round((timer.end - Date.now()) / 1000));
    $('#rest .rest-t').textContent = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`;
    $('#rest .rest-bar i').style.width = `${(left / sec) * 100}%`;
    if (left <= 0) {
      clearInterval(timer.id);
      beep();
      if (navigator.vibrate) navigator.vibrate([300, 100, 300]);
      $('#rest .rest-t').textContent = 'Bora!';
      setTimeout(() => $('#rest').classList.remove('show'), 2500);
    }
  };
  tickT();
  timer.id = setInterval(tickT, 250);
}
function beep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [0, 0.25].forEach((t) => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.frequency.value = 880; o.connect(g); g.connect(ctx.destination);
      g.gain.setValueAtTime(0.25, ctx.currentTime + t); g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.2);
      o.start(ctx.currentTime + t); o.stop(ctx.currentTime + t + 0.2);
    });
  } catch { /* sem áudio */ }
}

// ============================================================ roteamento
const ROUTES = ['hoje', 'treino', 'dieta', 'progresso', 'perfil'];
function route() {
  const r = location.hash.replace('#/', '') || 'hoje';
  return ROUTES.includes(r) ? r : 'hoje';
}

function render(keepScroll = true) {
  const r = get().profile.onboarded ? route() : 'perfil';
  const y = window.scrollY;
  const paint = () => {
    main.innerHTML = views[r]();
    document.querySelectorAll('.tabbar a').forEach((a) => a.classList.toggle('on', a.dataset.r === r));
    document.body.dataset.route = r;
    document.querySelector('.tabbar').hidden = !get().profile.onboarded;
    if (keepScroll) window.scrollTo(0, y); else window.scrollTo(0, 0);
  };
  if (!keepScroll && document.startViewTransition) { const vt = document.startViewTransition(paint); vt.ready.catch(() => {}); vt.finished.catch(() => {}); }
  else paint();
}

// ============================================================ eventos
document.addEventListener('click', async (ev) => {
  const b = ev.target.closest('[data-act]');
  if (!b) return;
  const a = b.dataset.act;
  const { profile: p } = get();

  switch (a) {
    case 'meal': {
      update(() => { const l = dayLog(); l.meals[b.dataset.id] = !l.meals[b.dataset.id]; });
      const l = dayLog();
      if (l.meals[b.dataset.id]) {
        const all = MEAL_TEMPLATES.every((m) => l.meals[m.id]);
        toast(all ? '🏆 Dieta 100% hoje!' : 'Refeição registrada ✓', all ? 'Mais um dia mais perto do tanquinho.' : '');
      }
      break;
    }
    case 'cardio': update(() => { const l = dayLog(); l.cardio = !l.cardio; }); break;
    case 'water': update(() => { const l = dayLog(); l.water = Math.max(0, l.water + Number(b.dataset.v)); }); break;
    case 'days': update((s) => { const n = Number(b.dataset.n); s.profile.trainDays = [...DEFAULT_DAYS[n]]; }); break;
    case 'toggleDay': {
      const dd = Number(b.dataset.d);
      const has = p.trainDays.includes(dd);
      if (has && p.trainDays.length <= 2) return toast('Mínimo de 2 dias de treino');
      if (!has && p.trainDays.length >= 6) return toast('Máximo de 6 dias', 'Pelo menos 1 dia de descanso para recuperar.');
      update((s) => { s.profile.trainDays = has ? s.profile.trainDays.filter((x) => x !== dd) : [...s.profile.trainDays, dd].sort(); });
      break;
    }
    case 'pick': ui.pickWorkout = b.dataset.w; break;
    case 'set': {
      const name = b.dataset.name, j = Number(b.dataset.set), n = Number(b.dataset.n);
      let nowDone = false;
      update(() => {
        const l = dayLog(ui.trainDate || iso(today()));
        const sets = l.workout.sets[name] || Array.from({ length: n }, () => ({ w: '', r: '', done: false }));
        const row = b.closest('.set');
        const ex = WORKOUTS[l.workout.key].ex.find((e) => e.nome === name);
        sets[j].w = row.querySelector('[data-k="w"]').value || row.querySelector('[data-k="w"]').placeholder.replace('kg', '');
        sets[j].r = row.querySelector('[data-k="r"]').value || String(ex.reps).split('-')[0].replace(/\D.*$/, '');
        sets[j].done = !sets[j].done;
        nowDone = sets[j].done;
        l.workout.sets[name] = sets;
      });
      if (nowDone) startRest(Number(b.dataset.rest));
      break;
    }
    case 'finish':
      update(() => { const l = dayLog(ui.trainDate || iso(today())); l.workout.done = !l.workout.done; });
      if (dayLog(ui.trainDate || iso(today())).workout.done) toast('💪 Treino concluído!', 'Agora: jantar pós-treino no horário.');
      break;
    case 'dietDay': ui.dietDay = b.dataset.v === '1'; break;
    case 'swap': return openSwap(b.dataset);
    case 'doSwap':
      update((s) => {
        const key = `${b.dataset.meal}:${b.dataset.orig}`;
        if (b.dataset.to === b.dataset.orig) delete s.swaps[key]; else s.swaps[key] = b.dataset.to;
      });
      closeSheet();
      break;
    case 'closeSheet': return closeSheet();
    case 'notif': {
      if (get().settings.notifications && Notification?.permission === 'granted') { testNotification(); return; }
      const r = await requestPermission();
      if (r === 'granted') testNotification();
      else if (r === 'unsupported') toast('Notificações não suportadas aqui', 'No iPhone: Compartilhar → Adicionar à Tela de Início, e abra pelo ícone.');
      else toast('Permissão negada', 'Ative nas configurações do navegador ou use os alarmes do calendário.');
      break;
    }
    case 'ics': {
      download('shape-25-12-alarmes.ics', buildICS(), 'text/calendar');
      toast('Calendário gerado', 'Abra o arquivo para adicionar os alarmes ao seu calendário.');
      return;
    }
    case 'logWeight': {
      const kg = parseFloat($('#wIn').value.replace(',', '.'));
      const cm = parseFloat($('#cIn').value.replace(',', '.'));
      const k = iso(today());
      if (!kg && !cm) return toast('Digite o peso ou a cintura');
      update((s) => {
        if (kg) { s.weights = s.weights.filter((w) => w.date !== k); s.weights.push({ date: k, kg }); s.profile.weight = Math.round((avgWeight(s.weights, today(), 7) ?? kg) * 10) / 10; }
        if (cm) { s.waist = s.waist.filter((w) => w.date !== k); s.waist.push({ date: k, cm }); }
      });
      toast('Registrado ✓', 'As calorias se ajustam ao seu peso médio.');
      break;
    }
    case 'adjust': update((s) => { s.profile.kcalAdjust = (s.profile.kcalAdjust || 0) + Number(b.dataset.v); }); toast('Ajuste aplicado', 'As refeições foram recalculadas.'); break;
    case 'adjustReset': update((s) => { s.profile.kcalAdjust = 0; }); break;
    case 'prof': update((s) => { s.profile[b.dataset.k] = Number(b.dataset.v); }); break;
    case 'onboard':
      update((s) => {
        s.profile.onboarded = true;
        s.profile.startDate = iso(today());
        if (!s.weights.length) s.weights.push({ date: iso(today()), kg: s.profile.weight });
      });
      location.hash = '#/hoje';
      toast(`Plano pronto, ${p.name}! 🔥`, 'Ative os alertas na aba Dieta.');
      return render(false);
    case 'export': return download(`shape25-backup-${iso(today())}.json`, exportJSON(), 'application/json');
    case 'reset':
      if (confirm('Apagar todos os dados e recomeçar?')) { reset(); location.hash = ''; render(false); }
      return;
    default: return;
  }
  render();
});

document.addEventListener('change', (ev) => {
  const t = ev.target;
  if (t.dataset.field) { update(() => { dayLog()[t.dataset.field] = Number(t.value) || 0; }); return; }
  if (t.dataset.set !== undefined && t.dataset.name) {
    update(() => {
      const l = dayLog(ui.trainDate || iso(today()));
      const ex = WORKOUTS[l.workout.key].ex.find((e) => e.nome === t.dataset.name);
      const sets = l.workout.sets[t.dataset.name] || Array.from({ length: ex.series }, () => ({ w: '', r: '', done: false }));
      sets[Number(t.dataset.set)][t.dataset.k] = t.value;
      l.workout.sets[t.dataset.name] = sets;
    });
    return;
  }
  if (t.dataset.act === 'mealTime') { update((s) => { s.profile.mealTimes[t.dataset.id] = t.value; }); toast('Horário atualizado', 'Os alertas foram reprogramados.'); return render(); }
  if (t.dataset.prof) {
    const k = t.dataset.prof;
    const numeric = ['age', 'height', 'weight', 'bf', 'goalWeight', 'stepsGoal'];
    update((s) => { s.profile[k] = numeric.includes(k) ? (parseFloat(String(t.value).replace(',', '.')) || 0) : t.value; });
    return render();
  }
  if (t.id === 'importIn' && t.files[0]) {
    t.files[0].text().then((txt) => { try { importJSON(txt); toast('Backup restaurado ✓'); render(false); } catch (e) { toast('Erro ao importar', e.message); } });
  }
});

function openSwap({ meal, orig, food, g }) {
  g = Number(g);
  const opts = [food, ...(SWAPS[food] || [])].filter((x, i, arr) => arr.indexOf(x) === i);
  if (orig !== food && !opts.includes(orig)) opts.push(orig);
  sheet(`<h2>Trocar ${esc(FOODS[food].nome.toLowerCase())}</h2>
    <p class="muted sm">Quantidades equivalentes no macro principal. A refeição é recalculada automaticamente.</p>
    <ul class="swaplist">${opts.map((f) => `<li><button class="opt ${f === food ? 'on' : ''}" data-act="doSwap" data-meal="${meal}" data-orig="${orig}" data-to="${f}">
      <b>${esc(FOODS[f].nome)}</b><small>${f === food ? `${g} g (atual)` : `≈ ${equivalent(food, g, f)} g`}</small></button></li>`).join('')}</ul>
    <button class="btn ghost block" data-act="closeSheet">Fechar</button>`);
}

function download(name, text, type) {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const aEl = Object.assign(document.createElement('a'), { href: url, download: name });
  document.body.appendChild(aEl); aEl.click(); aEl.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

// ============================================================ boot
window.addEventListener('hashchange', () => render(false));
$('#rest [data-rest="+15"]').addEventListener('click', () => { timer.end += 15000; });
$('#rest [data-rest="skip"]').addEventListener('click', () => { timer.end = Date.now(); });
$('#sheet').addEventListener('click', (e) => { if (e.target.id === 'sheet') closeSheet(); });

if (!get().profile.startDate) update((s) => { s.profile.startDate = iso(today()); });
onToast(toast);
render(false);
startTicker();
// Re-renderiza a tela "Hoje" a cada minuto (próximo alerta, saudação)
setInterval(() => { if (route() === 'hoje' && !document.activeElement?.matches('input')) render(); }, 60000);

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}
