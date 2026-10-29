# Refatoração PulseFit / Cesar Treinos

## Corrigido
- **Autenticação**: login, cadastro, saída e recuperação de senha agora usam Supabase Auth. O cadastro envia apenas `full_name` nos metadados; o papel nunca vem do cliente.
- **Papéis**: o papel é consultado em `profiles.role` para o `auth.uid()` da sessão. `coach` e `admin` habilitam a interface de treinador; as demais contas usam a interface de aluno. Não há mais `VITE_COACH_EMAILS`.
- **Configuração Supabase**: o cliente usa exclusivamente `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`. Sem ambas, o app mostra uma tela de configuração incompleta. Credenciais não são gravadas pelo app no `localStorage`.
- **Demos**: os botões e a função de acesso de demonstração só funcionam em desenvolvimento ou com `VITE_ALLOW_DEMO=true`.
- **Firebase**: código, configuração e dependências Firebase foram removidos. Login com Google está fora desta etapa.
- **Erros de autenticação**: e-mail não confirmado, credenciais incorretas, e-mail já cadastrado, senha fraca e falha de rede são apresentados em português.
- **Cadastro**: a trigger do banco cria o perfil como aluno. A atribuição de `coach`/`admin` é uma ação administrativa no banco, nunca feita pelo cliente.

## Configuração manual
1. Copie `.env.example` para `.env.local` e informe a URL do projeto Supabase e a chave pública `anon`/publishable. Não use a chave `service_role` no navegador.
2. Reinicie o servidor Vite após alterar as variáveis.
3. Habilite o provedor de e-mail/senha e revise as opções de confirmação e redirecionamento de e-mail no Supabase Auth.
4. Se necessário, atribua o papel de treinador/admin por uma operação administrativa confiável no banco. O app não oferece promoção de papel.
5. As migrations existentes já foram aplicadas; não as execute novamente por causa desta alteração.

O botão de teste do modal faz uma leitura simples da tabela `students`; ele não reaplica migrations.

## Novo
Tema Dark Neon, Calculadora de IMC, Calendário de frequência, Anamnese guiada (sugere fichas "pendentes"), `ImageWithFallback`.

## Limites que você precisa conhecer
1. **Os dados de treinos desta interface continuam no navegador** (`localStorage` por usuário); a autenticação Supabase não sincroniza automaticamente esses dados com as tabelas do banco.
2. **RLS protege as tabelas do Supabase**, mas os papéis continuam separando a interface e não substituem a autorização das próprias operações no servidor.
3. **A anamnese não chama IA**: gera a ficha por regras. Para usar Gemini/Claude, chame uma função de servidor; nunca coloque a chave no código do navegador.
4. **Falta**: tela de aprovação/edição das fichas pelo professor e selo "pendente" na lista de fichas.
