# Relatório de correções — PulseFit

## Alterações

- Resolvida a incompatibilidade de dependências sem instalar com `--force` ou `--legacy-peer-deps`: `dotenv` e `drizzle-kit` foram movidos para dependências de desenvolvimento, os tipos de `canvas-confetti` foram declarados e a dependência direta redundante de `esbuild` foi removida. O `package-lock.json` foi sincronizado.
- O script `clean` passou a funcionar no Windows e no macOS/Linux.
- O Vite agora detecta chaves Supabase `service_role`/`secret` configuradas para o navegador e interrompe o build. O cliente também se recusa a usá-las.
- O teste de conexão do Supabase consulta o endpoint de saúde, sem depender de acesso de leitura a uma tabela protegida por RLS; respostas de configuração, autorização, indisponibilidade, rede e timeout são diferenciadas.
- O login distingue falhas de rede de erros de configuração, redirecionamento, provedor, credenciais, limite de tentativas, autorização e perfil ausente.
- A configuração de viewport voltou a permitir zoom, preservando a acessibilidade.

## Validação local

- `npm ci`: concluído com o lockfile atualizado.
- `npm run lint`: aprovado.
- `npm run build`: aprovado. O Vite emite somente o aviso existente de que o bundle JavaScript excede 500 kB.
- `npm audit --omit=dev`: nenhuma vulnerabilidade de dependência de produção.
- `npm audit`: aponta avisos moderados em dependências de desenvolvimento transitivas de `drizzle-kit`/`@esbuild-kit`, incluindo `esbuild` antigo. A versão mais recente publicada de `drizzle-kit` continua usando essas dependências; não foi aplicado downgrade nem override incompatível.

## Pendências externas

- O login real não foi testado com uma conta autorizada; o resultado do build não comprova autenticação funcional.
- As variáveis e configurações do projeto Supabase, URLs de redirecionamento e políticas RLS precisam ser confirmadas no ambiente publicado.
- Nenhuma migration de banco foi executada durante esta publicação.
