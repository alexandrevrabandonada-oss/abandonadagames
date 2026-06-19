# Tijolo 08 - Plantao no Vermelho visual target

## Objetivo visual

A referencia passa a ser um survival arcade com fantasia clara: enfermeiro em frente a um hospital publico, tentando chegar ao dia 30 com salario atrasado. A tela deve parecer jogo profissional, com HUD denso porem legivel, paineis de decisao e leitura imediata de energia, saldo, contas e necessidades.

## Direcao de mecanica

- Loop principal continua curto e mobile-first.
- O canvas segue como playfield arcade: desviar de contas e coletar apoios.
- O DOM passa a carregar a camada de sobrevivencia social: dia, saldo, energia, objetivos, contas, necessidades e acoes.
- Acoes atuais:
  - `Trabalhar`: aumenta score e reduz contas, mas consome energia.
  - `Fazer bico`: reduz mais contas, mas aumenta caos e cansa mais.
  - `Economizar`: reduz contas com custo menor de energia.
  - `Cuidar da saude`: recupera energia e reduz caos, com menor ganho de score.

## Direcao visual

- Fundo hospitalar deve evoluir de placa/corredor para fachada com profundidade, entrada de emergencia, ambulancia e fila.
- Personagem principal deve evoluir de sprite simbolico para enfermeiro em uniforme azul, visto de costas ou tres quartos.
- HUD deve mirar em paineis fortes, com contraste azul hospitalar, vermelho emergencia, verde saude e amarelo alerta.
- A tela deve ficar clara em screenshot: titulo, dia, energia, saldo, contas e acoes precisam ser reconheciveis sem ler texto longo.

## Primeira iteracao implementada

- Layout responsivo em tres zonas no desktop e stack no mobile.
- Painel de enfermeiro com nivel, dia, saldo, energia, score e missao.
- Objetivos do dia.
- Contas a pagar com total dinamico.
- Acoes laterais de sobrevivencia.
- Painel inferior de necessidades.
- Canvas mantido jogavel, com assets PNG hospital/enfermeiro ja integrados.

## Segunda iteracao visual

- A tela desktop passou a usar uma fachada hospitalar full-screen como mundo.
- O enfermeiro de costas virou elemento central da composicao.
- O canvas arcade vertical deixou de dominar a tela no desktop e permanece mais util no mobile.
- O titulo ganhou tratamento grande, centralizado e com contorno, mais proximo de tela de jogo.
- Acoes, dia, opcoes e conquistas foram concentrados na lateral direita.
- Painel de status, objetivos e contas permanece na esquerda, como na referencia.

## Comparacao contra a meta

- A composicao geral agora segue a meta: hospital ao fundo, personagem central, HUD nas bordas.
- Ainda falta arte de alto nivel: a fachada atual e o enfermeiro ainda sao vetoriais simples.
- Falta retrato do enfermeiro no painel esquerdo.
- Falta iconografia propria para botoes, necessidades, opcoes e conquistas.
- Falta profundidade/camera mais realista no fundo, incluindo pessoas, bancos, palmeiras e ambulancia mais detalhada.
- Falta fazer a versao mobile preservar a sensacao de cena, nao apenas empilhar paineis.

## Proximas iteracoes

- Trocar fundo hospitalar por arte mais rica em 16:9/vertical com fachada e emergencia.
- Criar sprites de itens em PNG para boleto, marmita, mutirao e juros.
- Substituir alguns emojis/simbolos por iconografia propria em PNG/SVG.
- Ajustar balanceamento dos botoes para impedir estrategia dominante.
- Playtest mobile: verificar se HUD nao empurra o jogo para baixo demais.
- Adicionar modo compacto do painel de contas durante a rodada.
