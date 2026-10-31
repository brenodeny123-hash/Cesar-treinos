# Relatório de revisão e correções — 30/10/2026

## Arquivo analisado
- Pacote recebido: `Cesar-treinos-main.zip`
- Projeto: `Cesar-treinos-main`
- O ZIP não contém a pasta `.git`; portanto, não foi possível confirmar branch, commit remoto ou publicar alterações no GitHub.

## Correções aplicadas

### 1. Fuso horário de Fortaleza
- Centralizados o parsing de datas civis e a formatação em `src/lib/time.ts`:
  - `parseFortalezaDate` valida datas no formato `YYYY-MM-DD` e rejeita datas inexistentes.
  - `formatFortalezaDate` aplica `America/Fortaleza` por último, impedindo que opções externas sobrescrevam o fuso.
- Removidos os offsets fixos `-03:00` dos históricos de treinos e medidas.
- Atualizadas as datas exibidas em `WeeklyCharts.tsx`, `BodyProgress.tsx` e `WorkoutContext.tsx`.

### 2. Validação de entrada do IMC
- O parser agora rejeita texto parcialmente numérico (por exemplo, `1,75abc`) em vez de aceitar silenciosamente o prefixo numérico.
- Continua aceitando vírgula ou ponto decimal.

## Validações executadas nesta revisão
- Transpilação sintática de todos os arquivos `.ts` e `.tsx`: sem erros de sintaxe.
- Teste do helper real de datas:
  - `2026-10-30` formatado como `30/10/2026` em Fortaleza.
  - Tentativa de sobrescrever o fuso com `UTC` não altera o resultado.
  - `todayFortaleza` para `2026-10-30T02:00:00Z` retorna `2026-10-29`, corretamente considerando o horário local de Fortaleza.
  - início da semana de `2026-10-30`: `2026-10-26`.
  - data impossível `2026-02-30`: rejeitada.
- Busca estática: nenhum `-03:00` restante no código-fonte `src`.

## Validações pendentes / limitações
- `npm ci` não concluiu dentro do limite de execução disponível.
- `tsc --noEmit` não pôde ser concluído porque a instalação parcial não disponibilizou `vite/client`.
- Consequentemente, lint e build completos não estão certificados nesta revisão.
- O ZIP não contém credenciais de produção nem acesso ao painel Vercel/Supabase. A URL de produção/DNS deve ser conferida nas variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` do projeto correto no Vercel. Não foi inventada nem alterada nenhuma URL.
- Nenhuma migration SQL foi executada no banco. As migrations devem ser aplicadas e verificadas no projeto Supabase correto antes de qualquer mudança de produção.

## Próximo passo para publicação
1. Conferir as variáveis públicas do Supabase no Vercel.
2. Fazer a instalação limpa em uma máquina com acesso funcional ao registry npm e executar `npm ci`, `npm run lint` e `npm run build`.
3. Revisar o diff no checkout Git oficial, criar commit e publicar.
4. Testar login com uma conta autorizada no domínio de produção.
