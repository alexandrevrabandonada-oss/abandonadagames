# Relatório de Playtest e Equilíbrio de Ameaças
**Tijolo 12: Playtest de Equilíbrio das Ameaças**

Este relatório documenta a calibração, correção de bugs de framerate e melhoria do ciclo de jogabilidade nos quatro mini-jogos do **Abandonada Games**.

---

## 1. Diagnóstico e Problemas Identificados

### A. Merendeira no Vermelho (`MerendeiraNoVermelhoGame.tsx`)
*   **Problema de Frame-rate**: O decremento/incremento passivo de status (fôlego, contas, caos, estabilidade) era executado diretamente a cada quadro dentro de um loop de `requestAnimationFrame`.
*   **Consequência**: Em telas de 60Hz, o fôlego e a estabilidade caiam tão rápido que o jogador era derrotado em menos de 3 segundos sem chance de reação.
*   **Correção**: Toda a lógica de decaimento foi migrada para taxas baseadas em tempo real (`dt` em segundos), garantindo uniformidade e jogabilidade estável em qualquer dispositivo/taxa de atualização.

### B. Plantão no Vermelho (`PlantaoNoVermelhoGame.tsx`)
*   **Vulnerabilidade de Spam**: O jogador podia clicar repetidamente nos botões de escolhas de sobrevivência ("Trabalhar", "Economizar", etc.) em rápida sucessão.
*   **Consequência**: Isso permitia avançar todos os 30 dias em 1 ou 2 segundos sem interagir com as faturas financeiras caindo na tela.
*   **Correção**: Adicionamos um bloqueio com base no estado `decisionFlash !== null` (cooldown de 1.3 segundos por escolha), desabilitando os botões e aplicando um estilo visual correspondente (`opacity-40` e `pointer-events-none`).

### C. Fila Invisível (`QueueChaosGame.tsx`)
*   A curva de paciência e velocidade de spawns foi auditada. A fórmula atual já escala corretamente com o tempo (`dt`) e com o nível de tensão (número de pessoas na fila), oferecendo um início generoso (primeiros 15 segundos) e aperto progressivo no final.

### D. Ônibus Zero (`OnibusZeroGame.tsx`)
*   Os spawns de obstáculos e velocidade do ônibus foram auditados. A reação mínima ao obstáculo na velocidade máxima é de 1.37 segundos, proporcionando desafio ágil sem ser injusto.

---

## 2. Parâmetros de Calibração Final (Merendeira)

Com a mudança para o cálculo baseado em tempo delta (`dt`), as taxas passivas de decaimento/incremento por segundo foram fixadas em:

| Status | Taxa Normal (por seg) | Taxa Grace Period (por seg) | Taxa com Efeito/Power-up (por seg) |
| :--- | :--- | :--- | :--- |
| **Fôlego** | `-1.5` | `-0.75` | *N/A* |
| **Contas** | `+1.5` | `+0.75` | `+0.18` (Congelado) |
| **Caos** | `+1.7` | `+0.85` | `+0.22` (Escudo) |
| **Estabilidade** | `-1.1` | `-0.55` | *N/A* |

*   **Duração da partida**: Próxima a 60 segundos se o jogador jogar de forma ativa.
*   **Grace Period**: Primeiros 8 segundos de jogo reduzem a agressividade de perda de status em 50%, garantindo uma ambientação suave para novos jogadores.
*   **Tempo de Sobrevivência Passiva**: Aproximadamente 65-70 segundos antes de atingir game over se o jogador não colidir com faturas e apenas ignorar os ingredientes.

---

## 3. Testes e Validação do Código

1.  **Linter**: `npm run lint` executado com **sucesso** (0 erros, 0 avisos).
2.  **Validador de Catálogo**: `game:validate` executado com **sucesso** para as quatro aplicações:
    *   `merendeira-no-vermelho` -> Validado!
    *   `plantaono-vermelho` -> Validado!
    *   `fila-invisivel` -> Validado!
    *   `onibus-zero` -> Validado!
3.  **Build de Produção**: O build do Next.js compila perfeitamente sem problemas de tipos ou módulos.
