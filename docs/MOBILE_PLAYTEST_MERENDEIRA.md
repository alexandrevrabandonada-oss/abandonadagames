# Checklist de Teste Móvel Manual (QA Mobile)
**Jogo: Merendeira no Vermelho**

Este documento serve como guia para a equipe de QA validar a experiência de jogo móvel (responsividade, área de toque e renderização) em dispositivos físicos ou emulador de navegador.

---

## 1. Viewports e Dispositivos Obrigatórios

Os testes devem ser executados nos seguintes viewports simulados/reais:
*   **360x800** (Ex: Samsung Galaxy S20/S22)
*   **390x844** (Ex: iPhone 12/13/14 Pro)
*   **412x915** (Ex: Google Pixel 6/7)
*   **430x932** (Ex: iPhone 14/15 Pro Max)
*   **768x1024** (Ex: iPad Mini/Tablet)
*   **1366x768** (Ex: Desktop/Landscape baselines)

---

## 2. Checklist de Qualidade do Jogo

| Item | Ação Esperada | Situação (Passou/Falhou) |
| :--- | :--- | :--- |
| **Abertura Vertical** | O jogo carrega na orientação vertical sem quebras visuais ou barras horizontais. | [ ] |
| **HUD Legível** | As barras de fôlego, contas, caos e estabilidade possuem textos visíveis e cores fortes. | [ ] |
| **Toque e Movimento** | Ao tocar e arrastar o dedo na tela, a personagem se move fluidamente em direção ao toque. | [ ] |
| **Resposta Rápida** | Não há lag perceptível entre o input de toque e a movimentação da merendeira. | [ ] |
| **Ingredientes Nítidos** | Os ingredientes vetoriais (arroz, feijão, etc.) são fáceis de reconhecer no piso antiderrapante. | [ ] |
| **Faturas Visíveis** | Os boletos de ameaça vermelhos/piscantes com etiquetas de cobrança se destacam no fundo escuro. | [ ] |
| **Instrução Onboarding** | Ao iniciar a rodada, a instrução central "Pegue ingredientes..." é legível e esvanece suavemente. | [ ] |
| **Fim de Jogo Claro** | A tela final mostra claramente o score, rank, medalha metálica e estatísticas. | [ ] |
| **Reinício Rápido** | O botão "Jogar de novo" reseta o estado e inicia uma nova rodada instantaneamente. | [ ] |
| **Compartilhamento** | O botão "Compartilhar" copia o texto final correto ou abre o Web Share nativo sem travar. | [ ] |
| **Visualização do Ranking** | O botão "Ver ranking" direciona o usuário corretamente para a página de recordes do jogo. | [ ] |
| **Estabilidade Geral** | A animação e a taxa de quadros (FPS) permanecem estáveis e suaves do início ao fim. | [ ] |
