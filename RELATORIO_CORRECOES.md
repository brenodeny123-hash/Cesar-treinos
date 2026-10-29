# Relatório de correções — PulseFit

## Alterações

- Resolvida a incompatibilidade de dependências sem instalar com `--force` ou `--legacy-peer-deps`: `dotenv` e `drizzle-kit` foram movidos para dependências de desenvolvimento, os tipos de `canvas-confetti` foram declarados e a dependência direta redundante de `esbuild` foi removida. O `package-lock.json` foi sincronizado.
- O script `clean` passou a funcionar no Windows e no macOS/Linux.
- O Vite agora detecta chaves Supabase `service_role`/`secret` configuradas para o navegador e interrompe o build. O cliente também se recusa a usá-las.
- O teste de conexão do Supabase consulta o endpoint de saúde, sem depender de acesso de leitura a uma tabela protegida por RLS; respostas de configuração, autorização, indisponibilidade, rede e timeout são diferenciadas.
- O login distingue falhas de rede e timeout de erros de configuração/chave, domínio de redirecionamento, provedor, credenciais, conta não confirmada, limite de tentativas, autorização, serviço indisponível e perfil ausente.
- Falhas de autenticação registram somente operação, categoria, código, status HTTP, nome do erro e metadados não secretos da configuração Supabase (host e tipo de chave). E-mail, senha, chave, token e corpo da resposta não são registrados.
- A configuração de viewport voltou a permitir zoom, preservando a acessibilidade.

## Validação local

- `npm ci`: concluído com o lockfile atualizado.
- `npm run lint`: aprovado.
- `npm run build`: aprovado. O Vite emite somente o aviso existente de que o bundle JavaScript excede 500 kB.
- `npm audit --omit=dev`: nenhuma vulnerabilidade de dependência de produção.
- `npm audit`: aponta avisos moderados em dependências de desenvolvimento transitivas de `drizzle-kit`/`@esbuild-kit`, incluindo `esbuild` antigo. A versão mais recente publicada de `drizzle-kit` continua usando essas dependências; não foi aplicado downgrade nem override incompatível.
- Com a configuração local, o endpoint de saúde respondeu HTTP 200. Um login de teste com credenciais sintéticas chegou a `/auth/v1/token` e recebeu HTTP 400 / `invalid_credentials`; não foi simulado sucesso.
- Testes no navegador com respostas de erro simuladas confirmaram mensagens separadas para chave inválida, provedor desabilitado, e-mail não confirmado, permissão, HTTP 503 e falha de rede.

## Pendências externas

- **Diagnóstico de produção (29/10/2026):** em `https://cesar-treinos.vercel.app`, uma tentativa com credenciais sintéticas falhou antes de receber resposta HTTP. O navegador reportou `net::ERR_NAME_NOT_RESOLVED` para `POST dgxvqloicwagrebqhdul.supabase.co/auth/v1/token`; não houve status nem código de resposta do servidor. O log sanitizado confirmou configuração presente e chave do tipo publishable. O host Supabase compilado em produção foi diferente do host em `.env.local`; uma consulta DNS independente retornou `DNS_ERROR_RCODE_NAME_ERROR` para o host de produção e resolveu o host local `iqrydmisghqyxexaphcy.supabase.co`. Isso confirma falha de resolução do hostname configurado no deploy, não falha de senha, RLS ou resposta do Auth. A causa de a variável apontar para esse host (valor incorreto, projeto removido ou DNS externo) ainda não foi verificada no painel.
- **Ação necessária no deploy:** em Vercel > projeto `Cesar-treinos` > Settings > Environment Variables, confira `VITE_SUPABASE_URL` nos ambientes Production e Preview. Defina-a como a Project URL copiada de Supabase > projeto pretendido > Settings > API, confirme que seu hostname resolve, e faça um novo deploy de produção. Só use o projeto correspondente aos dados e usuários esperados; não copie automaticamente o host local sem confirmar que é o mesmo projeto. Verifique também `VITE_SUPABASE_ANON_KEY` nesse ambiente e que seja uma chave publicável do mesmo projeto, sem a registrar ou compartilhar.
- O acesso autenticado ao painel/configuração Vercel não estava disponível durante esta execução; a existência dos valores de produção não pôde ser consultada diretamente. A origem e o host compilados foram obtidos do próprio diagnóstico sanitizado em runtime.
- O login real não foi testado com uma conta autorizada. A tentativa de produção acima usou somente credenciais sintéticas e confirma o bloqueio DNS antes do Auth; após corrigir o deploy, teste com uma conta autorizada. O registro `[PulseFit auth] request failed` mostra host, disponibilidade da configuração, tipo de chave, código e status, sem dados de autenticação.
- Para o deploy, confirme em Vercel > Settings > Environment Variables as variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` e faça um novo deploy. No Supabase, confira Authentication > Sign In / Providers (Email habilitado) e Authentication > URL Configuration (URL/site permitido); para falha após autenticação, confira as políticas RLS de `profiles`.
- Nenhuma migration de banco foi executada durante esta publicação.
