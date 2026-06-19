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

## Terceira iteracao visual

- Fachada hospitalar redesenhada com mais detalhes: pessoas, fila, bancos, ambulancia, palmeira, placas e area de emergencia.
- Enfermeiro de costas ganhou proporcao mais humana, pele/cabelo e luz de uniforme.
- Painel esquerdo ganhou retrato proprio do enfermeiro.
- Energia, saldo e botoes de acao passaram a usar PNGs proprios em vez de texto/simbolos soltos.
- A linguagem visual ficou mais perto de HUD arcade, embora ainda falte acabamento pictorico/realista.

## Quarta iteracao de jogabilidade

- As decisoes laterais agora avancam a sobrevivencia do mes, aproximando a mecanica da referencia.
- O jogo registra `plantoes trabalhados`, `essenciais comprados`, `gastos evitados`, `cuidado mental` e `decisoes tomadas`.
- Objetivos do dia agora respondem diretamente as escolhas do jogador, nao apenas ao score.
- Cada acao continua tendo trade-off: dinheiro/contas versus energia/caos.
- Painel lateral mostra quantas decisoes foram tomadas e reforca a regra: cada escolha cobra do corpo ou das contas.

## Quinta iteracao visual

- O titulo principal passou a ser um PNG proprio, com contorno, sombra e linha de energia, mais proximo de logo arcade.
- Opcoes e conquistas deixaram de usar caracteres soltos e ganharam icones PNG.
- Todas as necessidades do painel inferior agora usam icones PNG: alimentacao, transporte, saude, lazer, sono e saude mental.
- O HUD ficou menos dependente de texto cru e mais proximo da linguagem visual da referencia.

## Sexta iteracao de feedback

- A cena agora reage ao estado do jogador com vinheta vermelha quando caos/pressao sobem.
- Energia baixa adiciona pulso visual de perigo.
- Cada decisao mostra um card temporario no centro da cena, reforcando causa e consequencia.
- Botoes de acao exibem trade-off direto antes do clique.
- Enfermeiro ganhou sombra/halo para se integrar melhor ao chao do hospital.
- A cena central ganhou uma faixa contextual de entrada do hospital para aproximar mundo e mecanica.

## Setima iteracao mobile-first

- No mobile, a primeira tela agora preserva a cena: hospital, logo, enfermeiro e status compacto aparecem antes dos paineis.
- O layout deixa de abrir com o HUD inteiro empilhado, aproximando a experiencia inicial da imagem-meta.
- Status essenciais (`dia`, `energia`, `saldo`) aparecem como chips sobre a cena.
- Acoes viraram grade 2x2 no celular, reduzindo rolagem e reforcando a sensacao de controle arcade.
- O canvas arcade fica invisivel como camada tecnica no visual principal mobile, evitando voltar ao aspecto de prototipo vertical.

## Oitava iteracao de arte

- Fachada hospitalar regenerada com mais gradientes, textura de asfalto, reflexos de janela, fila maior e sombras.
- Cena ganhou luz diagonal e vinheta mais pictorica para reduzir a sensacao de formas chapadas.
- Enfermeiro de costas ganhou mais volume no uniforme, luz lateral e separacao de torso/pernas.
- Ainda falta o salto final de qualidade: assets continuam procedurais/vetoriais, enquanto a meta usa pintura/render com acabamento semi-realista.

## Nona iteracao de sistema

- O icone de conquistas agora reflete progresso real (`x/4`).
- Adicionado painel de conquistas com estados bloqueado/desbloqueado.
- Adicionado `evento do dia`, mudando conforme o avanco do mes.
- A jogabilidade ganha mais estrutura de survival: o jogador entende fase do mes, metas e recompensas alem do score.

## Proximas iteracoes

- Trocar fundo hospitalar por arte mais rica em 16:9/vertical com fachada e emergencia.
- Criar sprites de itens em PNG para boleto, marmita, mutirao e juros.
- Substituir alguns emojis/simbolos por iconografia propria em PNG/SVG.
- Ajustar balanceamento dos botoes para impedir estrategia dominante.
- Playtest mobile: verificar se HUD nao empurra o jogo para baixo demais.
- Adicionar modo compacto do painel de contas durante a rodada.
