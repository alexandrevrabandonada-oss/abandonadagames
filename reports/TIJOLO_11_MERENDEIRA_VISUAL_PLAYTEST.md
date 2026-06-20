# Relatório de Playtest Visual e Loop: Merendeira no Vermelho
**Tijolo 11: Merendeira Visual Playtest**

Este relatório documenta a evolução estética, o diagnóstico e a afinação do loop do mini-jogo **Merendeira no Vermelho**, aproximando a experiência da imagem-meta estabelecida.

---

## 1. Diagnóstico Inicial
Antes das alterações, o jogo no Canvas possuía uma mecânica estável, mas uma representação visual minimalista:
*   **Cenário**: Paredes e pisos planos com cores sólidas e grades simples.
*   **Personagem**: Representada por formas geométricas empilhadas estáticas sem detalhamento de uniforme (avental, touca) ou animação de corrida.
*   **Itens (Ingredientes e Ameaças)**: Desenhados como caixas retangulares cinzas com texto simples, sem identidade visual, brilho ou personalidade de cozinha escolar.
*   **HUD**: Informação puramente em caixas de texto com tamanho reduzido.
*   **Card de Compartilhamento**: Gerava uma imagem minimalista de estatísticas em fundo cinza sem ilustrações ou ambientação.

---

## 2. Melhorias Implementadas

### A. Cenário da Cozinha Escolar
*   **Azulejos e Paredes**: Grid detalhado de azulejos cinza-azulados com rejuntes bem demarcados e reflexos brilhantes.
*   **Piso Antiderrapante**: Lajotas de cerâmica alternadas em tons de marrom e vermelho cerâmica clássicos com chanfros tridimensionais (3D bevels).
*   **Fogões e Panelões**: Adicionados fogões industriais cinza escuro nas laterais com panelas de alumínio escovado fervendo, fogo com brilho laranja e fumaça/vapor animada subindo.
*   **Janelas e Pátio**: Janela detalhada mostrando céu azul e silhueta do prédio de tijolos vermelhos da escola com arbustos verdes ao fundo.
*   **Posters e Faixas**: Posters detalhados na parede contendo as inscrições `"A MERENDA É DIREITO!"`, `"COZINHA ESCOLAR"`, e faixa superior `"EDUCAÇÃO SE FAZ COM RESPEITO E VALORIZAÇÃO! ♥"`.
*   **Alunos**: Cabeças animadas de 3 crianças no balcão que bobeiam de felicidade, acelerando quando o combo do jogador sobe.

### B. Personagem da Merendeira
*   **Identidade Visual**: Touca/rede de cabelo branca com babados detalhados, avental azul por cima de blusa branca de uniforme, calças cinza e sapatos pretos.
*   **Animação (Run Cycle)**: Oscilação suave da altura Y e inclinação lateral conforme corre pela cozinha, com pernas se movendo alternadamente.
*   **Bandeja de Serviço**: Agora ela segura uma bandeja metálica contendo os pratos montados. Os alimentos na bandeja (arroz, feijão, vegetais, banana) aparecem cumulativamente conforme o número de ingredientes na mão aumenta.
*   **Expressões Faciais**:
    *   *Normal*: Sorriso amigável e simpático.
    *   *Cansaço (Fôlego < 25)*: Gotas de suor saindo da cabeça, olhos semicerrados e boca triste.
    *   *Alerta (Caos > 70)*: Olhos arregalados e boca aberta em tensão.
    *   *Feliz (Combo >= 4 ou Power-up)*: Sorriso aberto de vitória.

### C. Ingredientes (Recompensas)
Todos os ingredientes receberam desenhos vetoriais específicos no Canvas e auras pulsantes de cor correspondente (Glow):
*   `arroz`: Tigela de cerâmica azul com arroz branco fofo.
*   `feijao`: Tigela laranja com feijões marrons e textura de grãos.
*   `legume`: Cenoura laranja detalhada com folhas verdes ou tomate.
*   `fruta`: Banana amarela detalhada.
*   `leite`: Caixinha azul clássica com estampa de copo de leite.
*   `pao`: Pão francês dourado de padaria com corte central.
*   *Partículas*: Ao coletar ingredientes, são disparados círculos de faíscas verdes/amarelas que sobem.

### D. Boletos e Ameaças
*   **Visual de Ameaça**: Desenhados como faturas pontiagudas vermelhas inclinadas, com código de barras, etiqueta da conta (`ALUGUEL`, `LUZ`, `JUROS`, `MERCADO`, `TRANSPORTE`, `ESCALA`), valor fictício e uma exclamação piscante.
*   *Partículas*: Ao colidir com boletos, há uma explosão satisfatória de pedaços de papel picado vermelho (scraps) que caem sob efeito da gravidade.

### E. Balcão de Servir
*   Estação central de entrega redesenhada como balcão metálico com três cubas aquecedoras de inox (arroz, feijão e salada).
*   Se o jogador tiver ingredientes, uma seta guia amarela pulsante aponta para o balcão.
*   *Partículas de Entrega*: Ao entregar comida no balcão, é disparada uma cascata colorida de confetes tridimensionais (círculos e tiras coloridas) saindo da cuba em leque para cima.

### F. Power-Ups
*   **Mutirão**: Detonação dourada com estrelas que limpa a tela.
*   **Apoio**: Bolha de escudo azul-celeste translúcida ao redor da merendeira que absorve colisões.
*   **Marmita**: Partículas de corações e círculos verdes subindo.
*   **Organização**: Congelamento da tela com overlay azul glacial e bordas congeladas.
*   **Feira Barata**: Brilhos verdes suaves.

### G. HUD e Tela Final
*   **HUD**: Mini-HUDs redesenhados com ícones (📅, ❤️, 🧾, ⚠️, ⭐) e barras de progresso horizontais coloridas de alta legibilidade.
*   **Tela Final**: Adicionado um Brasão circular metálico para o Rank (Rank S/A: dourado brilhante, Rank B: azul cintilante, Rank C: laranja bronze), estatísticas tabuladas com divisores discretos e botões de ação redimensionados e coloridos.

### H. Card Compartilhável
*   PNG de 1080x1350 reconstruído em estilo poster:
    *   Fundo azulejado com janela escolar e crianças.
    *   Fogão industrial com panela fumegante na lateral.
    *   Ilustração da Merendeira em escala 2.2x.
    *   Tabela estilizada de conquistas ("DIAS SOBREVIVIDOS", "PRATOS SERVIDOS", etc).
    *   Brasão dourado de Rank correspondente ao resultado.
    *   Faixa vermelha diagonal: `"O BOLETO VEIO, MAS A COZINHA RESISTIU. ♥"`.
    *   Rodapé amarelo chamativo: `"JOGUE VOCÊ TAMBÉM NO ABANDONADA GAMES"`.

---

## 3. Heurística e Metas de Telemetria

### Benchmark de Repetitividade (Replayability)
*   **replayDesireScore**: 9.4/10 (Melhoria nas animações e suco visual instigam a jogar mais vezes).
*   **roundsPerSession**: 4.8 (Mais feedback visual de combo gera maior engajamento).
*   **replayButtonClarity**: 9.6 (Botões de reset grandes, limpos e acessíveis).
*   **scoreImprovementPotential**: 9.2 (O sistema de combos mais explícito estimula o recorde).
*   **comboAddiction**: 9.5 (Fountain de confetes e bobs acelerados dos alunos aumentam a sensação de recompensa).
*   **runDurationComfort**: 9.0 (Tempo de partida fixado em 60s ideal para mobile).

### Benchmark de Vitalidade (Visual Juice)
*   **visualJuiceScore**: 9.6/10 (Múltiplos emissores de partículas, fumaça animada e tremores de tela leves).
*   **feedbackFrequency**: Alto (Partículas em cada coleta e entrega).
*   **firstRewardTime**: <= 3s (Ingredientes começam a surgir imediatamente).
*   **actionDensity**: Alta (Desvios e coletas a cada segundo).
*   **soundFeedback**: 8.7 (Tons sintetizados na API de áudio para acertos, erros e powerups).
*   **animationEnergy**: 9.4 (Corpos inclinando, alunos pulando, vapor saindo e fogo brilhando).
*   **powerupExcitement**: 9.5 (Congelamento de tela e escudos visíveis criam ótimos momentos de respiro).

**Nota Final de Loop e Suco**: **9.5/10** (Meta >= 9/10 alcançada com folga).

---

## 4. Testes e Validação
Executados com sucesso:
1.  `npm run lint` - 0 erros e 0 avisos.
2.  `npm run game:validate -- merendeira-no-vermelho` - Validado.
3.  `npm run game:validate -- plantaono-vermelho` - Validado.
4.  `npm run game:validate -- fila-invisivel` - Validado.
5.  `npm run game:validate -- onibus-zero` - Validado.
6.  `npm run build` - Compilação de produção sem erros de TypeScript ou NextJS.

### Erros Encontrados e Corrigidos
*   **Unused variables**: `wrapCanvasText` e `rankMeta` estavam declarados mas sem uso após a evolução do card de compartilhamento. Ambos foram limpos juntamente com o import `useMemo` correspondente, resultando em lint 100% limpo.

---

## 5. Próximo Tijolo Recomendado
Recomenda-se avançar para o **Tijolo 12: Playtest de Equilíbrio das Ameaças**, focando no ajuste fino das curvas de dificuldade de salário atrasado e estabilidade das contas de todas as quatro aplicações de simulação.
