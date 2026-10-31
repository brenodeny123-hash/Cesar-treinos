# Cesar Treinos — melhorias V3

- Alunos fictícios removidos: a demonstração tem só o Lucas. Dados de demo antigos salvos no navegador são descartados automaticamente (versão `3-lucas-only`).
- Alertas críticos: aparecem só quando a ficha vence em até 3 dias (ou já venceu). Novo campo "Vencimento da ficha" no cadastro do aluno (padrão: 28 dias). Sem ficha perto de vencer, o card some. Removidos números fixos de check-ins, "95% pago" e "4 fichas".
- Imagens de execução: painel grande e inteiro (sem corte), toque para ampliar. Para cada exercício, salve a imagem em `public/exercicios/<nome-do-exercicio>.png` (minúsculas, sem acento, hífens; ex.: `supino-reto-com-barra.png`). Hoje só o agachamento tem imagem.
- Tema claro/escuro: botão sol/lua no topo e na tela de login; escolha fica salva no aparelho.
- Calendário: caricatura do Cesar como papel de parede; brilhos neon animados removidos.
- Cronograma: dias antes da data de início do treino não contam como treinados; selo "Semana 1/4" (ciclo de 4 semanas) no canto. Frequência, sequência e total também só contam a partir do início.
- Caricatura como ponto focal: banner grande no Início, rosto grande na tela de login e miniatura no topo.

## Não validado aqui
Sem `npm install`/build neste ambiente: rode `npm install && npm run dev` e confira os dois temas. Testes unitários de data: 21/21 passando.
