// ============================================================
// Base de dados: alimentos (por 100 g) e biblioteca de treinos
// Valores nutricionais aproximados (TACO/USDA) — alimentos pesados prontos.
// ============================================================

export const FOODS = {
  frango:   { nome: 'Peito de frango grelhado', kcal: 159, p: 32, c: 0, g: 2.5 },
  patinho:  { nome: 'Patinho moído/grelhado', kcal: 219, p: 35.9, c: 0, g: 7.3 },
  tilapia:  { nome: 'Tilápia grelhada', kcal: 128, p: 26, c: 0, g: 2.7 },
  ovo:      { nome: 'Ovo inteiro', kcal: 143, p: 13, c: 1, g: 9.5, unidade: 50, un: 'ovo(s)' },
  clara:    { nome: 'Clara de ovo', kcal: 52, p: 11, c: 0.7, g: 0.2 },
  whey:     { nome: 'Whey protein', kcal: 400, p: 80, c: 8, g: 6, unidade: 30, un: 'scoop(s)' },
  iogurte:  { nome: 'Iogurte natural desnatado', kcal: 41, p: 4, c: 6, g: 0.2 },
  cottage:  { nome: 'Queijo cottage', kcal: 98, p: 11, c: 3.4, g: 4.3 },
  arroz:    { nome: 'Arroz cozido', kcal: 128, p: 2.5, c: 28, g: 0.2 },
  feijao:   { nome: 'Feijão cozido', kcal: 76, p: 4.8, c: 13.6, g: 0.5 },
  batata:   { nome: 'Batata-doce cozida', kcal: 77, p: 0.6, c: 18.4, g: 0.1 },
  mandioca: { nome: 'Mandioca cozida', kcal: 125, p: 0.6, c: 30, g: 0.3 },
  macarrao: { nome: 'Macarrão integral cozido', kcal: 124, p: 5.3, c: 26.5, g: 0.5 },
  aveia:    { nome: 'Aveia em flocos', kcal: 394, p: 13.9, c: 66.6, g: 8.5 },
  pao:      { nome: 'Pão integral', kcal: 253, p: 9.4, c: 49.9, g: 3.7, unidade: 25, un: 'fatia(s)' },
  tapioca:  { nome: 'Goma de tapioca', kcal: 240, p: 0, c: 60, g: 0 },
  banana:   { nome: 'Banana', kcal: 98, p: 1.3, c: 26, g: 0.1 },
  frutas:   { nome: 'Morango / frutas vermelhas', kcal: 30, p: 0.9, c: 6.8, g: 0.3 },
  maca:     { nome: 'Maçã', kcal: 56, p: 0.3, c: 15, g: 0.2 },
  azeite:   { nome: 'Azeite extra virgem', kcal: 884, p: 0, c: 0, g: 100 },
  amendoim: { nome: 'Pasta de amendoim', kcal: 588, p: 25, c: 20, g: 50 },
  salada:   { nome: 'Salada / legumes à vontade', kcal: 25, p: 1.5, c: 4, g: 0.2 },
  alcatra:  { nome: 'Alcatra/fraldinha grelhada (sem gordura)', kcal: 241, p: 31.9, c: 0, g: 11.6 },
  acai:     { nome: 'Polpa de açaí sem açúcar', kcal: 58, p: 0.8, c: 6.2, g: 3.9 },
  paoHamb:  { nome: 'Pão de hambúrguer', kcal: 270, p: 9, c: 49, g: 4, unidade: 60, un: 'pão(es)' },
  queijo:   { nome: 'Queijo muçarela light', kcal: 250, p: 25, c: 2, g: 15, unidade: 20, un: 'fatia(s)' },
};

// Grupos de substituição (troca por macro principal equivalente)
export const SWAPS = {
  frango: ['patinho', 'tilapia', 'clara'],
  patinho: ['frango', 'tilapia'],
  tilapia: ['frango', 'patinho'],
  arroz: ['batata', 'mandioca', 'macarrao', 'feijao'],
  batata: ['arroz', 'mandioca', 'macarrao'],
  mandioca: ['arroz', 'batata'],
  pao: ['tapioca', 'aveia'],
  tapioca: ['pao', 'aveia'],
  aveia: ['pao', 'tapioca', 'banana'],
  banana: ['maca', 'frutas', 'aveia'],
  frutas: ['maca', 'banana'],
  maca: ['frutas', 'banana'],
  iogurte: ['cottage'],
  cottage: ['iogurte'],
  azeite: ['amendoim'],
  amendoim: ['azeite'],
  alcatra: ['frango', 'patinho', 'tilapia'],
  paoHamb: ['pao', 'tapioca', 'batata'],
};

// Modelos de refeição. pct = fração dos macros do dia.
// prot/carb/fat = alimento que "fecha" o macro; fixos = itens com quantidade fixa.
export const MEAL_TEMPLATES = [
  { id: 'cafe', nome: 'Café da manhã', icone: '☀️', pct: { p: 0.2, c: 0.2, g: 0.25 },
    fixos: [['ovo', 150]], prot: 'clara', carb: 'pao', extraCarb: ['frutas', 100], fat: null },
  { id: 'lanche1', nome: 'Lanche da manhã', icone: '🥣', pct: { p: 0.15, c: 0.1, g: 0.1 },
    fixos: [['iogurte', 170]], prot: 'whey', carb: 'banana', fat: 'amendoim' },
  { id: 'almoco', nome: 'Almoço', icone: '🍛', pct: { p: 0.25, c: 0.3, g: 0.3 },
    fixos: [['feijao', 100], ['salada', 200]], prot: 'frango', carb: 'arroz', fat: 'azeite' },
  { id: 'pre', nome: 'Pré-treino', icone: '⚡', pct: { p: 0.15, c: 0.25, g: 0.05 },
    fixos: [], prot: 'whey', carb: 'aveia', extraCarb: ['banana', 100], fat: null, treino: true },
  { id: 'jantar', nome: 'Jantar (pós-treino)', icone: '🍽️', pct: { p: 0.25, c: 0.15, g: 0.3 },
    fixos: [['salada', 200]], prot: 'patinho', carb: 'batata', fat: 'azeite' },
];

// Cardápio de fim de semana: mesmos horários e macros, comida com cara de "fim de semana".
// Mesmos ids das refeições da semana → alertas e checklist continuam funcionando.
export const WEEKEND_TEMPLATES = [
  { id: 'cafe', nome: 'Brunch: crepioca', icone: '🥞', pct: { p: 0.2, c: 0.2, g: 0.25 },
    fixos: [['ovo', 100], ['queijo', 20]], prot: 'clara', carb: 'tapioca', extraCarb: ['frutas', 100], fat: null },
  { id: 'lanche1', nome: 'Açaí fit', icone: '🍇', pct: { p: 0.15, c: 0.1, g: 0.1 },
    fixos: [['acai', 150]], prot: 'whey', carb: 'banana', fat: null },
  { id: 'almoco', nome: 'Churrasco inteligente', icone: '🥩', pct: { p: 0.25, c: 0.3, g: 0.3 },
    fixos: [['salada', 250]], prot: 'alcatra', carb: 'mandioca', fat: null },
  { id: 'pre', nome: 'Panqueca de banana', icone: '🍌', pct: { p: 0.15, c: 0.25, g: 0.05 },
    fixos: [['ovo', 50]], prot: 'whey', carb: 'aveia', extraCarb: ['banana', 100], fat: null, treino: true },
  { id: 'jantar', nome: 'Hambúrguer caseiro', icone: '🍔', pct: { p: 0.25, c: 0.15, g: 0.3 },
    fixos: [['salada', 100], ['queijo', 20]], prot: 'patinho', carb: 'paoHamb', fat: null },
];

export const WEEKEND_TIPS = {
  cafe: 'Massa: 1 ovo + claras + goma na frigideira antiaderente. Recheio: queijo + frutas por cima ou do lado.',
  lanche1: 'Bata a polpa com whey e banana congelada. Sem granola, leite condensado ou xarope.',
  almoco: 'Vale para churrasco fora: pese a carne no olho (palma da mão ≈ 120 g). Mandioca cozida, não frita. Vinagrete à vontade.',
  pre: 'Amasse a banana, misture ovo, aveia e whey. Frigideira antiaderente, 2 min de cada lado.',
  jantar: 'Patinho moído temperado em disco, grelhado. Alface, tomate, cebola, mostarda ou ketchup zero. Sem batata frita.',
};

// Alternativas por padrão de movimento — para adaptar aos aparelhos da sua academia
export const EX_ALTS = {
  'Agachamento': ['Agachamento livre', 'Agachamento hack', 'Agachamento hack / búlgaro', 'Leg press 45°', 'Agachamento no Smith', 'Agachamento goblet', 'Pêndulo / Belt squat', 'Leg press horizontal'],
  'Dobradiça de quadril': ['Levantamento terra romeno (RDL)', 'Stiff com barra', 'Stiff com halteres', 'Stiff no Smith', 'Good morning', 'Hip thrust', 'Glúteo na máquina / polia'],
  'Supino horizontal': ['Supino reto com barra', 'Supino reto com halteres', 'Supino máquina / Crucifixo', 'Supino máquina', 'Supino reto no Smith', 'Flexão de braço (com carga)'],
  'Supino inclinado': ['Supino inclinado com barra', 'Supino inclinado com halteres', 'Supino inclinado no Smith', 'Supino inclinado máquina'],
  'Crucifixo': ['Crucifixo / Peck deck', 'Crossover polia alta→baixa', 'Peck deck', 'Crucifixo com halteres', 'Crossover polia baixa→alta'],
  'Desenvolvimento': ['Desenvolvimento com halteres', 'Desenvolvimento militar', 'Desenvolvimento máquina', 'Desenvolvimento no Smith', 'Desenvolvimento Arnold'],
  'Elevação lateral': ['Elevação lateral', 'Elevação lateral na polia', 'Elevação lateral máquina', 'Elevação lateral sentado'],
  'Puxada vertical': ['Barra fixa / Puxada frente', 'Barra fixa (ou puxada)', 'Barra fixa / Puxada pronada', 'Puxada frente pegada aberta', 'Puxada frente pegada neutra', 'Pulldown unilateral', 'Barra fixa graviton', 'Puxada articulada (máquina)'],
  'Remada': ['Remada curvada', 'Remada cavalinho', 'Remada sentada na polia', 'Remada unilateral com halter', 'Remada máquina articulada', 'Remada no Smith', 'Remada apoiada no banco (halteres)'],
  'Ombro posterior': ['Face pull', 'Crucifixo inverso', 'Peck deck inverso', 'Crucifixo inverso na polia'],
  'Bíceps': ['Rosca direta', 'Rosca direta com barra W', 'Rosca inclinada com halteres', 'Rosca martelo', 'Rosca concentrada', 'Rosca Scott', 'Rosca na polia', 'Rosca alternada'],
  'Tríceps': ['Tríceps corda', 'Tríceps francês', 'Tríceps testa', 'Mergulho nas paralelas', 'Tríceps barra reta na polia', 'Tríceps coice na polia', 'Tríceps máquina'],
  'Braços (bi-set)': ['Rosca martelo + Tríceps francês (bi-set)', 'Rosca direta + Tríceps corda (bi-set)', 'Rosca Scott + Tríceps testa (bi-set)'],
  'Extensora': ['Cadeira extensora', 'Sissy squat', 'Extensora unilateral'],
  'Flexora': ['Cadeira flexora', 'Mesa flexora', 'Flexora em pé (unilateral)', 'Flexão nórdica'],
  'Afundo': ['Afundo búlgaro', 'Passada / Avanço', 'Afundo no Smith', 'Step-up no banco'],
  'Panturrilha': ['Panturrilha em pé', 'Panturrilha sentado', 'Panturrilha no leg press', 'Panturrilha no Smith'],
  'Abdômen': ['Abdominal na polia (crunch)', 'Elevação de pernas suspenso', 'Roda abdominal', 'Prancha frontal', 'Abdominal infra no banco', 'Prancha lateral', 'Abdominal máquina', 'Dead bug', 'Elevação de pernas no banco'],
};

export function altsFor(name) {
  const entry = Object.entries(EX_ALTS).find(([, list]) => list.includes(name));
  return entry ? { padrao: entry[0], list: entry[1] } : null;
}

// ------------------------------------------------------------
// Exercícios: [nome, séries, reps, descanso(s), grupo, dica]
// ------------------------------------------------------------
const E = (nome, series, reps, desc, grupo, dica = '') => ({ nome, series, reps, desc, grupo, dica });

export const WORKOUTS = {
  fullA: { nome: 'Full Body A', foco: 'Corpo todo · ênfase empurrar', ex: [
    E('Agachamento livre', 4, '6-8', 150, 'Quadríceps', 'Desça até a coxa paralela, tronco firme.'),
    E('Supino reto com barra', 4, '6-8', 150, 'Peito', 'Escápulas retraídas, pés firmes no chão.'),
    E('Remada curvada', 3, '8-10', 120, 'Costas', 'Puxe em direção ao umbigo.'),
    E('Desenvolvimento com halteres', 3, '8-10', 90, 'Ombros'),
    E('Cadeira flexora', 3, '10-12', 75, 'Posterior'),
    E('Elevação lateral', 3, '12-15', 60, 'Ombros', 'Sem roubar: controle a descida.'),
    E('Abdominal na polia (crunch)', 3, '10-15', 60, 'Abdômen', 'Enrole a coluna, não puxe com os braços.'),
  ]},
  fullB: { nome: 'Full Body B', foco: 'Corpo todo · ênfase puxar', ex: [
    E('Levantamento terra romeno (RDL)', 4, '6-8', 150, 'Posterior', 'Quadril para trás, coluna neutra.'),
    E('Barra fixa / Puxada frente', 4, '6-10', 120, 'Costas'),
    E('Supino inclinado com halteres', 3, '8-10', 120, 'Peito'),
    E('Leg press 45°', 3, '10-12', 120, 'Quadríceps'),
    E('Remada sentada na polia', 3, '10-12', 90, 'Costas'),
    E('Rosca direta', 3, '8-12', 60, 'Bíceps'),
    E('Tríceps corda', 3, '10-12', 60, 'Tríceps'),
    E('Elevação de pernas suspenso', 3, '10-15', 60, 'Abdômen', 'Eleve o quadril, não só as pernas.'),
  ]},
  fullC: { nome: 'Full Body C', foco: 'Corpo todo · volume/metabólico', ex: [
    E('Agachamento hack / búlgaro', 3, '8-10', 120, 'Quadríceps'),
    E('Supino inclinado com barra', 3, '8-10', 120, 'Peito'),
    E('Remada cavalinho', 3, '8-10', 90, 'Costas'),
    E('Stiff com halteres', 3, '10-12', 90, 'Posterior'),
    E('Elevação lateral na polia', 3, '12-15', 60, 'Ombros'),
    E('Rosca martelo + Tríceps francês (bi-set)', 3, '10-12', 75, 'Braços'),
    E('Panturrilha em pé', 4, '10-15', 60, 'Panturrilha'),
    E('Roda abdominal', 3, '8-12', 60, 'Abdômen'),
  ]},
  upperA: { nome: 'Superior A', foco: 'Força · peito, costas, ombros', ex: [
    E('Supino reto com barra', 4, '6-8', 150, 'Peito', 'Mantenha a carga pesada no cutting: é o sinal para preservar músculo.'),
    E('Remada curvada', 4, '6-8', 150, 'Costas'),
    E('Desenvolvimento com halteres', 3, '8-10', 90, 'Ombros'),
    E('Puxada frente pegada aberta', 3, '8-12', 90, 'Costas'),
    E('Elevação lateral', 3, '12-15', 60, 'Ombros'),
    E('Rosca direta', 2, '10-12', 60, 'Bíceps'),
    E('Tríceps corda', 2, '10-12', 60, 'Tríceps'),
    E('Abdominal na polia (crunch)', 3, '10-15', 60, 'Abdômen'),
  ]},
  lowerA: { nome: 'Inferior A', foco: 'Força · quadríceps', ex: [
    E('Agachamento livre', 4, '6-8', 180, 'Quadríceps'),
    E('Stiff com barra', 3, '8-10', 120, 'Posterior'),
    E('Leg press 45°', 3, '10-12', 120, 'Quadríceps'),
    E('Cadeira flexora', 3, '10-12', 75, 'Posterior'),
    E('Panturrilha em pé', 4, '10-15', 60, 'Panturrilha', 'Pausa de 1s no alongamento.'),
    E('Prancha frontal', 3, '45-60s', 45, 'Abdômen'),
  ]},
  upperB: { nome: 'Superior B', foco: 'Hipertrofia · ênfase costas/ombros', ex: [
    E('Supino inclinado com halteres', 4, '8-10', 120, 'Peito'),
    E('Barra fixa / Puxada pronada', 4, '6-10', 120, 'Costas'),
    E('Remada sentada na polia', 3, '10-12', 90, 'Costas'),
    E('Crucifixo / Peck deck', 3, '12-15', 60, 'Peito'),
    E('Elevação lateral na polia', 3, '12-15', 60, 'Ombros'),
    E('Face pull', 2, '12-15', 60, 'Ombro posterior'),
    E('Rosca martelo', 3, '10-12', 60, 'Bíceps'),
    E('Tríceps francês', 3, '10-12', 60, 'Tríceps'),
    E('Elevação de pernas suspenso', 3, '10-15', 60, 'Abdômen'),
  ]},
  lowerB: { nome: 'Inferior B', foco: 'Hipertrofia · ênfase posterior/glúteo', ex: [
    E('Levantamento terra romeno (RDL)', 4, '6-8', 150, 'Posterior'),
    E('Agachamento hack', 3, '8-10', 120, 'Quadríceps'),
    E('Afundo búlgaro', 3, '10/perna', 90, 'Quadríceps/Glúteo'),
    E('Cadeira extensora', 3, '12-15', 60, 'Quadríceps'),
    E('Mesa flexora', 3, '10-12', 60, 'Posterior'),
    E('Panturrilha sentado', 4, '12-15', 60, 'Panturrilha'),
    E('Abdominal infra no banco', 3, '12-15', 60, 'Abdômen'),
  ]},
  push: { nome: 'Push (Empurrar)', foco: 'Peito, ombros, tríceps', ex: [
    E('Supino inclinado com barra', 4, '6-8', 150, 'Peito'),
    E('Desenvolvimento militar', 3, '6-8', 150, 'Ombros'),
    E('Supino máquina / Crucifixo', 3, '10-12', 90, 'Peito'),
    E('Elevação lateral', 4, '12-20', 60, 'Ombros', 'Ombro largo = cintura visualmente menor.'),
    E('Tríceps testa', 3, '8-12', 75, 'Tríceps'),
    E('Tríceps corda', 2, '12-15', 60, 'Tríceps'),
    E('Abdominal na polia (crunch)', 3, '10-15', 60, 'Abdômen'),
  ]},
  pull: { nome: 'Pull (Puxar)', foco: 'Costas, bíceps, posterior de ombro', ex: [
    E('Barra fixa (ou puxada)', 4, '6-10', 150, 'Costas'),
    E('Remada cavalinho', 3, '8-10', 120, 'Costas'),
    E('Pulldown unilateral', 3, '10-12', 75, 'Costas'),
    E('Face pull', 3, '12-15', 60, 'Ombro posterior'),
    E('Rosca inclinada com halteres', 3, '8-12', 60, 'Bíceps'),
    E('Rosca martelo', 2, '10-12', 60, 'Bíceps'),
    E('Roda abdominal', 3, '8-12', 60, 'Abdômen'),
  ]},
  legs: { nome: 'Legs (Pernas)', foco: 'Quadríceps, posterior, panturrilha', ex: [
    E('Agachamento livre', 4, '5-8', 180, 'Quadríceps'),
    E('Leg press 45°', 3, '10-12', 120, 'Quadríceps'),
    E('Stiff com barra', 3, '8-10', 120, 'Posterior'),
    E('Cadeira extensora', 3, '12-15', 60, 'Quadríceps'),
    E('Cadeira flexora', 3, '10-12', 60, 'Posterior'),
    E('Panturrilha em pé', 4, '10-15', 60, 'Panturrilha'),
    E('Elevação de pernas suspenso', 3, '10-15', 60, 'Abdômen'),
  ]},
  pushB: { nome: 'Push B', foco: 'Ombros e peito superior', ex: [
    E('Desenvolvimento com halteres', 4, '8-10', 120, 'Ombros'),
    E('Supino reto com halteres', 3, '8-10', 120, 'Peito'),
    E('Crossover polia alta→baixa', 3, '12-15', 60, 'Peito'),
    E('Elevação lateral na polia', 4, '12-15', 60, 'Ombros'),
    E('Mergulho nas paralelas', 3, '8-12', 90, 'Tríceps'),
    E('Tríceps francês', 2, '10-12', 60, 'Tríceps'),
    E('Prancha lateral', 3, '30-45s', 45, 'Abdômen (oblíquos)'),
  ]},
  pullB: { nome: 'Pull B', foco: 'Espessura de costas', ex: [
    E('Remada curvada', 4, '6-8', 150, 'Costas'),
    E('Puxada frente pegada neutra', 3, '8-12', 90, 'Costas'),
    E('Remada unilateral com halter', 3, '10-12', 75, 'Costas'),
    E('Crucifixo inverso', 3, '12-15', 60, 'Ombro posterior'),
    E('Rosca direta com barra W', 3, '8-12', 60, 'Bíceps'),
    E('Rosca concentrada', 2, '12-15', 45, 'Bíceps'),
    E('Abdominal na polia (crunch)', 3, '10-15', 60, 'Abdômen'),
  ]},
  legsB: { nome: 'Legs B', foco: 'Posterior e glúteo', ex: [
    E('Levantamento terra romeno (RDL)', 4, '6-8', 150, 'Posterior'),
    E('Agachamento hack', 3, '8-10', 120, 'Quadríceps'),
    E('Afundo búlgaro', 3, '10/perna', 90, 'Quadríceps/Glúteo'),
    E('Mesa flexora', 3, '10-12', 60, 'Posterior'),
    E('Cadeira extensora', 2, '15-20', 60, 'Quadríceps'),
    E('Panturrilha sentado', 4, '12-15', 60, 'Panturrilha'),
    E('Abdominal infra no banco', 3, '12-15', 60, 'Abdômen'),
  ]},
};

// Divisão sugerida por número de dias/semana
export const SPLITS = {
  2: { nome: 'Full Body 2x', seq: ['fullA', 'fullB'] },
  3: { nome: 'Full Body 3x (A/B/C)', seq: ['fullA', 'fullB', 'fullC'] },
  4: { nome: 'Superior / Inferior', seq: ['upperA', 'lowerA', 'upperB', 'lowerB'] },
  5: { nome: 'Upper/Lower + PPL', seq: ['upperA', 'lowerA', 'push', 'pull', 'legs'] },
  6: { nome: 'Push / Pull / Legs 2x', seq: ['push', 'pull', 'legs', 'pushB', 'pullB', 'legsB'] },
};

// Dias da semana sugeridos para cada frequência (0 = domingo)
export const DEFAULT_DAYS = {
  2: [1, 4],
  3: [1, 3, 5],
  4: [1, 2, 4, 5],
  5: [1, 2, 3, 4, 5],
  6: [1, 2, 3, 4, 5, 6],
};

export const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
export const WEEKDAYS_FULL = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

// Regras de ouro para o fim de semana (o lugar onde o shape se perde)
export const WEEKEND_RULES = [
  'Mantenha os mesmos horários de refeição — o relógio não tira folga.',
  'Vai sair? Coma a refeição anterior completa (proteína alta) antes de ir.',
  'Churrasco: priorize picanha magra/fraldinha/frango, salada e vinagrete. Evite pão de alho, farofa e linguiça.',
  'Álcool trava a queima de gordura. Se for beber, prefira destilado com água com gás/zero e no máximo 2 doses.',
  'Faça a caminhada do sábado e do domingo de manhã: 40 min, antes do café.',
  'Pese-se só segunda — o peso de domingo à noite engana (sal + carboidrato).',
];

export const SCIENCE_NOTES = [
  ['Proteína alta', '2,2–2,6 g/kg/dia em déficit preserva massa magra (Helms et al., 2014; Morton et al., 2018).'],
  ['Ritmo de perda', '0,5–1,0% do peso por semana mantém força e músculo (Garthe et al., 2011).'],
  ['Treino pesado', 'Manter a intensidade (cargas altas, 1–3 reps da falha) é o principal sinal anti-catabólico.'],
  ['Volume', '10–16 séries por grupo muscular por semana é suficiente para manter/ganhar em déficit (Schoenfeld, 2017).'],
  ['Carb cycling', 'Mais carboidrato nos dias de treino melhora desempenho; a média semanal é o que define a perda.'],
  ['NEAT', '8–10 mil passos/dia aumentam o gasto sem atrapalhar a recuperação como cardio intenso.'],
  ['Sono', '7–9 h: dormir 5,5 h em déficit faz perder ~55% mais massa magra (Nedeltcheva et al., 2010).'],
];
