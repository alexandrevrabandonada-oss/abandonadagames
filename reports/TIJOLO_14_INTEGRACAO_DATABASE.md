# Relatório de Integração com Banco de Dados Supabase
**Tijolo 14: Integração com Banco de Dados Supabase**

Este relatório documenta a persistência real dos scores dos quatro jogos do catálogo do **Abandonada Games** utilizando a plataforma Supabase.

---

## 1. Configurações de Ambiente
Criamos o arquivo local [.env.local](file:///c:/Projetos/GamesCampanha/.env.local) contendo as credenciais fornecidas pelo usuário:
*   `NEXT_PUBLIC_SUPABASE_URL`: Ponto de acesso REST do Supabase.
*   `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Chave anônima para requisições seguras pelo cliente.
*   `DATABASE_URL`: URI de conexão Postgres utilizada exclusivamente para a inicialização e migração do banco.

*Nota de segurança*: Variações de senha contendo caracteres especiais foram devidamente URL-encodadas no `DATABASE_URL` (Ex: `+` -> `%2B`, `*` -> `%2A`, `/` -> `%2F`) para evitar falhas de autenticação com o driver TCP.

---

## 2. Modelagem do Banco e Inicialização SQL
Escrevemos o arquivo de definição de banco de dados [create_scores_table.sql](file:///c:/Projetos/GamesCampanha/scripts/create_scores_table.sql) contendo a criação da tabela de recordes `scores` e suas políticas de segurança de linha (RLS):
*   `scores`: Armazena a slug do jogo, o nome do jogador, pontuação, duração em milissegundos, número de eventos tratados e carimbo de data/hora padrão UTC.
*   **Row Level Security (RLS)**:
    *   *Allow anonymous read*: Permite que qualquer usuário anônimo consulte pontuações (SELECT).
    *   *Allow anonymous insert*: Permite que qualquer usuário anônimo insira uma nova pontuação (INSERT) sem privilégios administrativos.

Criamos o inicializador de banco de dados [init-db.ts](file:///c:/Projetos/GamesCampanha/scripts/init-db.ts). A conexão foi estabelecida via driver seguro `pg` com criptografia SSL (`rejectUnauthorized: false`), criando a tabela e aplicando as políticas com sucesso no banco Supabase.

---

## 3. Arquitetura da Camada de Recordes
Refatoramos o repositório de pontuações em [mockRankingStore.ts](file:///c:/Projetos/GamesCampanha/src/lib/server/mockRankingStore.ts):
1.  **Leitura Dinâmica**: O método `getApiRankingForGame(slug)` tenta ler diretamente os 10 melhores registros do Supabase ordenados por maior pontuação. Se a conexão ou configuração falhar, ele ativa o backup local e retorna o arquivo JSON local.
2.  **Gravação Dupla**: O método `appendMockScore` insere o registro assincronamente no Supabase e, em seguida, faz o espelhamento no arquivo JSON local como redundância de segurança.
3.  **Renderização Dinâmica**:
    *   Marcamos a página de classificação [page.tsx](file:///c:/Projetos/GamesCampanha/src/app/ranking/[slug]/page.tsx) com `export const dynamic = "force-dynamic"`. Isso força o Next.js a ignorar otimizações de build estático e puxar os rankings atualizados do banco de dados a cada requisição de usuário.
    *   Substituímos a leitura de dados mockados estáticos pela camada dinâmica do ranking.

---

## 4. Testes e Validações

*   **Testes de Conexão**: O script de testes `scripts/test-db.ts` foi executado e retornou com sucesso a leitura da tabela vazia.
*   **Linter**: O linter `npm run lint` passou com 0 erros/avisos.
*   **Validação do Catálogo**: `game:validate` validou todos os quatro jogos com sucesso.
*   **Build**: O build de produção do Next.js compila sem falhas de rotas estáticas ou imports.
