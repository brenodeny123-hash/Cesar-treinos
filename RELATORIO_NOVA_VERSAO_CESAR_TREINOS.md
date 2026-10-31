# Cesar Treinos — versão de testes locais

## Alterações incluídas
- Identidade visual renomeada para Cesar Treinos, mantendo #TeamCesar.
- Caricatura enviada aplicada ao painel inicial com animação CSS suave.
- Calendário de frequência com brilho neon animado.
- Cronograma semanal calculado a partir da semana real (segunda a domingo) e marcado conforme os registros de treino da conta.
- Painel de treino com cronômetro de execução configurável; ao zerar, marca a próxima série pendente e inicia o descanso padrão do exercício.
- Campo de descanso ajustável e ação para iniciar descanso manualmente; botão para pular descanso ativo.
- Imagem de referência anatômica enviada exibida quando o nome do exercício contém agachamento/squat.

## Limitações que ainda precisam de validação
- A persistência dos dados segue o mecanismo existente por usuário no navegador (localStorage). A sincronização entre dispositivos exige implementar e validar persistência remota por usuário no Supabase; não foi alterado o banco.
- A imagem anatômica fornecida é uma referência de variações de agachamento, portanto só é exibida para exercícios identificados como agachamento. Ainda falta uma biblioteca de ilustrações específicas para os demais exercícios.
- O cronômetro de execução é uma contagem regressiva de duração configurável; a conclusão da série ocorre quando zera. O descanso automático usa o tempo padrão cadastrado no exercício.
- Não foi possível executar `npm install`/`npm run build` neste ambiente porque as dependências do projeto não estão instaladas. Faça a validação no computador local antes de publicar.
- Nenhuma publicação, push ou alteração no Supabase foi realizada.
