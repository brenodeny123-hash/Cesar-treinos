# Cesar Treinos — V4

## Finalizar treino (corrigido)
- Causa 1: ao salvar, o treino ativo era zerado e a tela de resumo (que vivia dentro do mesmo componente) desaparecia junto, parecendo que nada foi salvo. Agora o resumo aparece mesmo depois de encerrar.
- Causa 2: o ID do registro usava `crypto.randomUUID()`, que não existe em páginas http (ex.: celular na rede local) e travava o salvamento. Agora há um gerador seguro com alternativa.
- Só permite salvar com pelo menos 1 série feita; erros aparecem na tela em vez de falhar em silêncio.
- Calendário, cronograma, sequência e gráficos passam a refletir o treino salvo.

## Guia visual de execução
- Boneco anatômico claro (frente e costas) com músculo principal em vermelho e auxiliares em laranja, nome dos músculos, passo a passo, dica e erros a evitar.
- Todos os exercícios da biblioteca e das fichas têm guia (testado); exercícios personalizados usam um guia pelo grupo muscular.
- Fotos próprias: `public/exercicios/<nome-do-exercicio>.png` aparecem abaixo do guia (hoje, agachamento).

## Tema claro como padrão
- App abre claro; botão sol/lua alterna e lembra a escolha.
- Revisão de contraste: textos, bordas, gradientes, campos, botões e sobreposições.
- Painel inicial sem números fixos: frequência, volume e peso vêm dos treinos/medidas reais.

## Não validado aqui
Sem `npm install`/build neste ambiente. Rode `npm install && npm run dev` e teste um treino completo. Testes unitários: 23/23.
