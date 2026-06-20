# Notas de Lançamento: Merendeira no Vermelho v0.1 (Release Candidate)

Esta é a versão inicial v0.1 para testes públicos e demonstração de jogabilidade do mini-jogo **Merendeira no Vermelho**, integrado ao catálogo de jogos de simulação social **Abandonada Games**.

---

## 1. O que é o Jogo?
**Merendeira no Vermelho** é um jogo arcade de sobrevivência em que o jogador encarna uma merendeira de escola pública. A personagem enfrenta as dificuldades do contrato intermitente e salário atrasado enquanto gerencia o fôlego diário, os boletos acumulados e a satisfação/caos da cozinha da escola.

---

## 2. Como Jogar e Controles
*   **Movimentação**: Toque e arraste o dedo (dispositivos móveis) ou clique com o mouse no Canvas para mover a merendeira. No teclado, utilize as teclas `W`, `A`, `S`, `D` ou as setas direcionais.
*   **Coleta**: Aproxime-se dos ingredientes (tigelas de arroz, feijão, vegetais, leite, frutas) para recolhê-los. Evite os boletos financeiros que flutuam na cozinha.
*   **Serviço**: Após coletar ingredientes, uma seta indicadora guiará você até o balcão superior. Aproxime-se e pressione a barra de `Espaço` ou a tecla `Enter` (ou posicione-se no balcão) para servir os pratos.
*   **Power-ups**: Colete marmitas para recuperar fôlego e ative mutirões para limpar boletos da tela temporariamente.

---

## 3. Mecânicas Principais e Objetivos
*   **Duração da Rodada**: Cada partida representa 30 dias (1 mês completo de sobrevivência) e dura 60 segundos de tempo real.
*   **Condições de Derrota**:
    *   Fôlego cair para 0% (exaustão).
    *   Boletos/Contas acumuladas chegarem a 100%.
    *   Caos da cozinha alcançar 100% (alunos insatisfeitos).
    *   Estabilidade da cozinha zerar.
*   **Onboarding**: Banner inicial de 4.5 segundos guiando o jogador no básico da mecânica.

---

## 4. Limitações Conhecidas na v0.1
*   Áudio sintetizado via Web Audio API pode não tocar em alguns navegadores móveis antigos sem interação prévia com a tela (restrição de segurança do navegador).
*   Visualizador do card de compartilhamento pode apresentar pequena distorção de fonte caso a fonte `"Geist"` demore a ser carregada pelo navegador na renderização do canvas em tempo real.

---

## 5. Próximos Passos
*   Implementar ranking global conectado ao banco de dados Supabase para competição social.
*   Adicionar novas receitas e eventos de salário para aumentar a variedade e rejogabilidade.
