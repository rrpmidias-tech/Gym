# Shape 25/12 💪

App pessoal (PWA) de **hipertrofia + cutting** do Rafael, com prazo em **25 de dezembro de 2026**.
Instala no celular como app, funciona offline e guarda tudo só no aparelho.

## O que tem

| Aba | Funções |
|---|---|
| **Hoje** | Contagem regressiva, macros consumidos x meta, checklist das refeições, treino do dia, água/passos/sono, sequência de dias com dieta 100%, próximo alerta |
| **Treino** | Escolha 2–6 dias/semana e quais dias → divisão automática (Full Body, Superior/Inferior, UL+PPL, PPL 2x). Registro de carga/reps por série, "última vez", aviso de progressão de carga, timer de descanso com vibração e som |
| **Dieta** | Calorias e macros calculados pelo seu perfil, **carb cycling** (mais carbo no dia de treino), 5 refeições com alimentos brasileiros e gramas exatas, **trocas equivalentes** (frango ↔ patinho ↔ tilápia, arroz ↔ batata-doce ↔ mandioca…), horários editáveis, lista de compras da semana |
| **Alertas** | 15 min antes e na hora de cada refeição, água, treino, pesagem, sono — e reforço na **sexta, sábado e domingo** (+ meal prep no domingo). Exporta `.ics` com alarmes recorrentes até 25/12 para o calendário do celular |
| **Progresso** | Peso diário + média de 7 dias, cintura, gráfico com rota até a meta, **check-in semanal** que sugere ajuste de calorias (mantém a perda em 0,5–1%/semana) |
| **Perfil** | Dados, nível de atividade, velocidade do cutting, rotina, backup/restauração |

## Base científica do plano

- Proteína **2,2 g/kg** em déficit para preservar massa magra
- Déficit de 15–25% (perda de ~0,5–1% do peso/semana)
- Treino pesado mantido (1–2 reps na reserva), 10–16 séries/grupo/semana, abdômen 3–4x
- 8–10 mil passos/dia como cardio principal; 7–9 h de sono
- Gasto: Katch-McArdle (com % de gordura) ou Mifflin-St Jeor

> Não substitui nutricionista/médico.

## Como usar no celular

1. Ative o GitHub Pages: **Settings → Pages → Source: GitHub Actions**. O workflow `.github/workflows/pages.yml` publica a cada push.
2. Abra o link no celular → **Adicionar à tela inicial** (iPhone: Compartilhar → Adicionar à Tela de Início).
3. Preencha o perfil com seus dados reais e toque em **Gerar meu plano**.
4. Na aba **Dieta**: *Ativar notificações* e *Alarmes no calendário* (garante o alarme com o celular bloqueado).

## Rodar localmente

```bash
python3 -m http.server 8000   # abra http://localhost:8000
```

Sem build, sem dependências: HTML + CSS + JavaScript (módulos ES).

```
index.html            shell + tab bar
css/styles.css        design system (dark, accent lima)
js/data.js            alimentos, treinos, divisões, regras de fim de semana
js/calc.js            TMB/TDEE, macros, carb cycling, plano de refeições
js/store.js           persistência local
js/notify.js          agenda de alertas + exportação .ics
js/app.js             telas e interações
sw.js                 offline + clique na notificação
```
