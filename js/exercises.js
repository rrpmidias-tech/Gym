// Nome efetivo do exercício (considera trocas feitas pelo usuário para os aparelhos da academia)
import { WORKOUTS } from './data.js';

export const exName = (p, wk, i) => p.exSwaps?.[`${wk}:${i}`] || WORKOUTS[wk].ex[i].nome;
export const isSwapped = (p, wk, i) => Boolean(p.exSwaps?.[`${wk}:${i}`]);
