# Meta Visual do Jogo: Merendeira no Vermelho

Este documento descreve a meta de design visual e a experiência de jogo desejada para o mini-jogo **Merendeira no Vermelho**, aproximando o visual de um jogo arcade vibrante com a realidade da cozinha escolar pública.

---

## 1. Layout Geral da Tela (Mobile-First Canvas)
*   **Proporção**: Canvas vertical mobile-first com proporção de tela de 720x1080.
*   **Cabeçalho (HUD)**: Grande e legível, com contadores de Dia (calendário 1/30), Fôlego (coração/verde), Contas (boleto/vermelho), Caos (caveira/roxo), Estabilidade (estrela/amarelo), além de Score e Combo em destaque no topo da interface externa do Canvas.
*   **Controles e Informações de Apoio**:
    *   **Como Jogar**: Um painel com 5 passos claros (Toque para andar, Coletar ingredientes, Levar ao balcão para servir, Manter combo, Desviar de boletos).
    *   **Histórico de Eventos**: Área abaixo do canvas para mensagens de eventos dinâmicos (como salario atrasado, plantão extra).

---

## 2. Cenário da Cozinha Escolar (Canvas Background)
*   **Piso**: Lajotas ou azulejos cinza-escuro com linhas de grade bem demarcadas, dando perspectiva e profundidade tridimensional simples de cozinha profissional.
*   **Paredes**: Azulejaria branca/cinza com juntas escuras de rejunte, simulando cozinha industrial.
*   **Fogões e Panelões**: Desenhar panelas grandes de metal em cima de fogões industriais (esquerda e direita) com fumaça e vapores saindo das panelas (animações sutis de fervura).
*   **Balcão de Servir**: Área de entrega posicionada na parte superior central do cenário (cozinha interna), com uma janela de entrega de comida.
*   **Crianças/Alunos**: Silhuetas ou cabeças de crianças coloridas e felizes com expressões amigáveis surgindo atrás do balcão para receber as refeições.
*   **Cartazes e Placas nas Paredes**:
    *   Placa com escrita: `"COZINHA ESCOLAR"` ou `"A MERENDA É DIREITO"`.
    *   Faixa escrita: `"EDUCAÇÃO SE FAZ COM RESPEITO E VALORIZAÇÃO!"`.
    *   *Nota*: Não utilizar nenhum logo público real, marcas comerciais ou partidos políticos.

---

## 3. Personagem Principal: A Merendeira
*   **Vestimentas**:
    *   Touca/rede branca na cabeça, cobrindo o cabelo.
    *   Avental azul escuro sobreposto a uma camisa branca simples de uniforme.
    *   Calça cinza e calçados escuros confortáveis para trabalho pesado.
*   **Expressões Faciais**:
    *   `normal`: Sorridente e amigável.
    *   `tired` (Fôlego baixo < 24): Expressão de cansaço ou suor.
    *   `alert` (Caos alto > 70): Olhos arregalados e tensão.
    *   `happy` (Combo alto / Power-up ativo): Sorriso aberto e brilho.
*   **Animação**:
    *   Braços segurando uma bandeja com merenda servida (arroz, feijão e salada/legume).
    *   Animação de corrida (inclinação do corpo conforme se move e pequenos quadros de perna se movendo).
    *   Aura colorida dependendo do estado (ex: aura protetora de apoio azul, brilho de mutirão dourado).

---

## 4. Ingredientes (Recompensas)
*   **Visual de Recompensa**: Todos os ingredientes devem possuir uma borda externa suave e brilhante em tons de verde, amarelo ou azul, destacando-os no chão da cozinha.
*   **Itens representados**:
    *   `arroz`: Tigela cheia com arroz branco cozido.
    *   `feijao`: Tigela com feijão marrom brilhante.
    *   `legume`: Cenoura laranja e tomate vermelho.
    *   `fruta`: Banana amarela ou maçã.
    *   `leite`: Caixinha de leite azul clássica com desenho de vaca.
    *   `pao`: Pão francês dourado de padaria.
*   **Marmita**: Recipiente de marmita caseira prateada/azul (glorificada como salvação de energia).

---

## 5. Boletos e Ameaças (Inimigos)
*   **Visual Perigoso**: Boletos flutuantes com listras que lembram códigos de barras, brilhando intensamente em vermelho/laranja.
*   **Itens representados**:
    *   `aluguel`: Boleto com etiqueta "ALUGUEL" bem nítida.
    *   `luz`: Conta com símbolo de raio e etiqueta "LUZ".
    *   `mercado`: Boleto de compras com etiqueta "MERCADO".
    *   `juros`: Boleto pontiagudo com etiqueta "JUROS".
    *   `escala`: Placa ou boleto escrito "ESCALA".
*   **Efeito Visual**: Quando se aproximam do jogador, piscam levemente e deixam rastro vermelho.

---

## 6. Balcão e Estação de Servir
*   **Localização**: Quadrante superior central do canvas (`y: 200` a `y: 350`).
*   **Animação**:
    *   Bandejas metálicas de servir dispostas no balcão.
    *   Alunos esperando com os pratos vazios.
    *   Quando o jogador entra na área com ingredientes, um prato de comida é montado na bandeja e um texto vibrante `"PRATO SERVIDO!"` ou `"+COMBO!"` sobe na tela com partículas festivas.

---

## 7. Power-Ups
*   **Mutirão da Cozinha**: Efeito dourado limpando todos os boletos da tela com partículas de faísca dourada e fumaça limpadora.
*   **Apoio das Colegas**: Aura protetora azul ao redor da merendeira que amortece o caos e protege do próximo boleto.
*   **Marmita Garantida**: Recarrega o fôlego com ícone de coração subindo em cor verde.
*   **Escala Garantida**: Estabilidade sobe com uma estrela dourada de proteção.
*   **Organização Coletiva**: Congela o tempo e a descida dos boletos, deixando a tela num tom azulado e calmo.
*   **Feira Barata**: Reduz o impacto de mercado caro (aumento de contas).

---

## 8. Card Compartilhável
*   **Poster**: Proporção 4:5 vertical (1080x1350) simulando um cartaz impresso ou story.
*   **Personagem**: A merendeira em destaque sorridente, com as crianças no balcão de fundo.
*   **Dados e Conquistas**: O Rank final estampado com um brasão dourado (S, A, B, C ou D), o Score Final destacado, os Pratos Servidos e dias sobrevividos.
*   **Mensagem Forte**: `"O boleto veio, mas a cozinha resistiu."` com uma chamada atraente `"JOGUE TAMBÉM!"`.

---

## 9. Regras e Restrições Cruciais
*   **Sem Marcas**: Proibido usar logotipos reais de prefeituras, governos ou empresas reais.
*   **Sem Partidarismos**: Sem siglas de partidos, sem nomes de políticos, e sem qualquer pedido de voto.
*   **Aparência**: O jogo deve focar na luta diária da trabalhadora da merenda, destacando a importância da solidariedade e a luta com humor e estética arcade limpa.
