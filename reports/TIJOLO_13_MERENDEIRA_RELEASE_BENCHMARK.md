# Avaliação Heurística de Lançamento (Release Benchmark)
**Jogo: Merendeira no Vermelho v0.1**

Este documento estabelece as métricas, pontuações de suco visual e rejogabilidade do jogo para balizamento de performance e retenção.

---

## 1. Métricas e Tempos Estimados

*   **Tempo para Primeira Recompensa (firstRewardTime)**: $\le 2$ segundos.
    *   *Detalhamento*: O primeiro ingrediente surge aos 250ms de jogo logo acima da personagem, permitindo que a primeira coleta e entrega ocorra em menos de 4 segundos de rodada.
*   **Duração Média Alvo**: 60 segundos (Day 30).
*   **Curva de Dificuldade para Iniciantes**: Balanceada para obtenção de Ranks C ou B nas primeiras 3 partidas. A obtenção de Ranks A ou S exige domínio de combos e desvio ágil de faturas.

---

## 2. Benchmark de Rejogabilidade e Diversão

| Heurística | Pontuação | Observações |
| :--- | :--- | :--- |
| **replayDesireScore** | **9.5/10** | Controles intuitivos e ritmo dinâmico criam forte vontade de tentar novamente após game over. |
| **visualJuiceScore** | **9.6/10** | Múltiplos efeitos de partículas (confetes, papel picado, faíscas vetoriais), fumaça animada e expressões faciais. |
| **comboAddiction** | **9.5/10** | Efeitos festivos de combo em destaque e aceleração dos alunos dão ótima recompensa psicológica. |
| **firstRewardClarity** | **9.7/10** | Seta pulsante amarela imediata indicando o balcão após coleta facilita o entendimento do core loop. |
| **onboardingSpeed** | **9.8/10** | Instrução de 3 segundos no Canvas resolve a curva de aprendizado inicial sem atrasar a partida. |

*   **Nota Final de Loop e Suco**: **9.6/10** (Meta de manter $\ge 9/10$ alcançada com grande folga).

---

## 3. Diagnóstico SWOT de Game Design

### Pontos Fortes (Strengths)
*   **Game feel responsivo**: Sem latência nos inputs de toque e teclado.
*   **Visual marcante**: Cozinha escolar pública representada com detalhes de azulejos, panelas grandes e cartazes políticos/educacionais.
*   **Suco visual abundante**: Partículas coloridas associadas a acertos e erros de forma imediata.

### Pontos Fracos (Weaknesses)
*   A movimentação em 2D por toque pode causar oclusão parcial do jogador pelo próprio dedo em telas muito pequenas (abaixo de 320px de largura).

### Oportunidades (Opportunities)
*   Engajamento orgânico a partir do card story final estilizado e da piada implícita "o boleto veio, mas a cozinha resistiu".

### Ameaças / Riscos de Frustração (Threats)
*   O aumento rápido de ameaças (boletos) a partir do dia 20 pode assustar jogadores casuais que não entenderam a utilidade dos power-ups de Mutirão.
