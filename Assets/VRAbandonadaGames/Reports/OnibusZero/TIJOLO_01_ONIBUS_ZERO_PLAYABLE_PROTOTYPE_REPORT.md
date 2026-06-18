# TIJOLO 01 Onibus Zero Playable Prototype Report

Generated: 2026-06-18 13:51:21Z

## Diagnostico inicial
- Rio Vivo provou pipeline tecnico, entao este tijolo prioriza arcade, ritmo, replay curto e leitura imediata.
- A base do projeto ja tinha hub, build settings, definicao de experiencia e assets urbanos reaproveitaveis.

## Assets reaproveitados
- Materiais urbanos: Asphalt002, Concrete010 e Ground037.
- Predios importados da pasta Urban.
- Estrutura do hub e GameExperienceDefinition existentes.

## Scripts criados
- OnibusZeroGameManager.cs
- OnibusZeroBusController.cs
- OnibusZeroCameraFollow.cs
- OnibusZeroPassengerStop.cs
- OnibusZeroPassenger.cs
- OnibusZeroObstacle.cs
- OnibusZeroRouteCheckpoint.cs
- OnibusZeroHUD.cs
- OnibusZeroResultPanel.cs
- OnibusZeroSceneBuilder.cs

## Cena criada
- Circuito urbano em loop com 4 lados jogaveis e leitura top-down/isometrica.
- Onibus placeholder bonito com primitivas e cor forte.
- 4 pontos de onibus, 8 passageiros, 8 obstaculos e 6 checkpoints.

## Mecanicas implementadas
- Partida curta de 90 segundos.
- Coleta de passageiros em baixa velocidade com tecla E.
- Checkpoints reduzem tarifa e aumentam bairros conectados.
- Colisao com obstaculos quebra combo e tira tempo.

## HUD
- Tempo, passageiros, tarifa, apoio popular, combo, objetivo e mensagem rapida.
- Barra visual de apoio popular.

## Sistema de combo
- Combo cresce com pickups, checkpoints e acoes limpas.
- Combo maximo e exibido no painel final.

## Sistema de tarifa
- Tarifa comeca em R$ 5.00 e cai conforme checkpoints e eficiencia.
- Ranking final depende da combinacao de tarifa e apoio.

## Obstaculos
- Obstaculos simples de rua com feedback visual no impacto.
- Colisao reduz apoio e tempo restante.

## Pontos de onibus
- Cada ponto recebe passageiros visuais e trigger de coleta.
- Pickup ativa feedback curto e acelera o ritmo de progressao.

## Resultado compartilhavel
- Frase curta gerada com passageiros, bairros, tarifa final e rank.

## Validacao
- Cena existe e compoe com onibus, camera, HUD e GameManager.
- Contagem minima de stops, passageiros, obstaculos e checkpoints atendida.
- Painel final e botoes principais presentes.
- Cena incluida no Build Settings.

## Erros encontrados
- Nenhum erro bloqueante detectado pelo validador do tijolo.

## Erros corrigidos
- Arquitetura inicial do novo jogo criada sem alterar o loop de Rio Vivo.
- Hub preparado para expor o Onibus Zero por metodo dedicado.

## Pendencias
- Audio arcade ainda nao foi adicionado neste primeiro tijolo.
- Mobile HUD ficou apenas preparado na arquitetura geral, nao finalizado.
- Pode haver ajuste fino futuro de sensacao de direcao e densidade de props.

## Proximo prompt recomendado
`Tijolo 02 — Onibus Zero juice pass: deixar a corrida mais gostosa, com audio, FX, celebracao de pickup, melhor curva de combo e mais polish visual.`
