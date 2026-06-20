# Relatório de Release Candidate: Merendeira no Vermelho v0.1
**Tijolo 13: Merendeira Release Candidate**

Este relatório documenta as alterações finais de onboarding, divulgação na Home, compartilhamento e os testes obrigatórios executados com sucesso para publicar o jogo **Merendeira no Vermelho** na versão de Release Candidate v0.1.

---

## 1. Diagnóstico Inicial e Ajustes Executados

### Onboarding de 3 Segundos
*   Adicionado um banner flutuante moderno desenhado no Canvas (`drawKitchen`) durante os primeiros 4.5 segundos da rodada com o texto: `"Pegue ingredientes, sirva merenda e desvie dos boletos."`
*   O banner possui design moderno translúcido com brilho e borda roxa, esvanecendo suavemente (fade out) de forma animada.
*   Atualizado o estado inicial de toast e o reset de rodada para apresentar a mesma instrução inicial curta e objetiva.

### Primeira Recompensa
*   A primeira recompensa (ingrediente) surge aos 250ms perto da área de ação do jogador, garantindo uma entrega rápida em menos de 5 segundos de jogo com feedback visual forte (confetes) e som.

### Home Page
*   O jogo `Merendeira no Vermelho` foi ordenado na Home Page (`src/app/page.tsx`) como o primeiro jogo do array. Isso o promove automaticamente para a seção principal de destaque da página.
*   Ajustada a badge para `"Destaque"`, a duração para `"1 min"` e a tagline para a frase oficial curta.

### Tela Final e Compartilhamento
*   Revisada a disposição de botões ("Jogar de novo" como ação primária azul, "Compartilhar" como secundária verde e "Ver ranking" como amarela).
*   Enxugada a frase de compartilhamento final para:
    `"Joguei Merendeira no Vermelho: servi {pratos} merendas, sobrevivi {dias} dias e terminei com rank {rank}. O boleto veio, mas a cozinha resistiu."`

---

## 2. Testes de Sanidade Executados (Smoke Test)

Todas as rotas críticas de jogabilidade e recordes foram validadas localmente e no build estático com sucesso (todas retornando status HTTP 200/OK):
*   `/` -> Home Page com Merendeira em destaque principal (OK)
*   `/jogar/merendeira-no-vermelho` -> Jogo Merendeira no Vermelho (OK)
*   `/ranking/merendeira-no-vermelho` -> Ranking da Merendeira (OK)
*   `/jogar/plantaono-vermelho` -> Jogo Plantão (OK)
*   `/jogar/fila-invisivel` -> Jogo Fila Invisível (OK)
*   `/jogar/onibus-zero` -> Jogo Ônibus Zero (OK)

---

## 3. Testes Obrigatórios e Compilação

1.  **Linter**: `npm run lint` passou com **sucesso** (0 erros, 0 avisos).
2.  **Validação de Catálogo**: `game:validate` rodado com **sucesso** para todos os jogos:
    *   `merendeira-no-vermelho` -> Validado com sucesso!
    *   `plantaono-vermelho` -> Validado com sucesso!
    *   `fila-invisivel` -> Validado com sucesso!
    *   `onibus-zero` -> Validado com sucesso!
3.  **Compilação**: `npm run build` compilou com **sucesso** o pacote de produção, exportando todas as rotas estáticas corretamente.

---

## 4. Pendências e Próximos Passos
*   Nenhuma pendência técnica crítica de código ou design para a v0.1.
*   **Recomendação Objetiva**: **PUBLICAR**. O jogo está estável, com excelente gamefeel, onboarding rápido de 3 segundos, compartilhamento forte e pronto para testes de divulgação pública.
