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

- O login real não foi testado com uma conta autorizada. A configuração verificada é a cópia local; variáveis do deploy podem apontar para outro projeto. Confira no Console do navegador o registro `[PulseFit auth] request failed` após uma tentativa real. Ele informa host do projeto, disponibilidade da configuração, tipo de chave, código e status, sem dados de autenticação.
- Para o deploy, confirme em Vercel > Settings > Environment Variables as variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` e faça um novo deploy. No Supabase, confira Authentication > Sign In / Providers (Email habilitado) e Authentication > URL Configuration (URL/site permitido); para falha após autenticação, confira as políticas RLS de `profiles`.
- Nenhuma migration de banco foi executada durante esta publicação.
