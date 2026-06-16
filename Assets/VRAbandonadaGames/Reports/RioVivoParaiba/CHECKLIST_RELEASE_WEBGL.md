# CHECKLIST Release WebGL Rio Vivo Paraiba

Generated: 2026-06-16 20:10:00Z

## Escopo
- Cena principal: `Assets/VRAbandonadaGames/Scenes/Games/RioVivoParaiba/RioVivoParaiba_Main.unity`
- Build alvo: `Builds/WebGL/RioVivoParaiba_Test`
- Relatorio base: `TIJOLO_08_WEBGL_FINALIZER_REPORT.md`

## Status tecnico atual
- Build WebGL gerado com sucesso.
- Hub abre no navegador.
- Erro critico de input do WebGL nao se repetiu na ultima validacao.
- TouchHUD, HUD, camera, player, NPC, residuos, recovery points e beacons validados por automacao T08.

## Criterios de aceite
- Hub carrega sem tela de erro.
- Botao ou entrada para `Rio Vivo Paraiba` funciona.
- Cena `Rio Vivo Paraiba` abre sem travar.
- Player se move por teclado no desktop WebGL.
- Interacao com `E` funciona com a moradora.
- HUD mostra objetivo, residuos, pontos recuperados e saude do rio.
- TouchHUD nao polui a tela indevidamente.
- Existem 8 residuos coletaveis no loop.
- Existem 3 pontos de recuperacao funcionais no loop.
- Painel final aparece ao concluir o fluxo.
- Retorno ao hub funciona ao final.
- Nao ha material magenta visivel.
- Nao ha shader de erro visivel.
- Leitura do HUD continua aceitavel em `1280x720` e `1366x768`.

## Passos de QA manual
1. Abrir o build WebGL.
2. Confirmar carregamento completo do hub.
3. Entrar em `Rio Vivo Paraiba`.
4. Testar movimento com `WASD` e setas.
5. Aproximar da moradora e pressionar `E`.
6. Validar troca do objetivo para coleta de residuos.
7. Coletar alguns residuos e observar atualizacao do HUD.
8. Ativar os 3 pontos de recuperacao.
9. Confirmar painel de conclusao.
10. Confirmar retorno ao hub.

## Riscos residuais
- A navegacao do hub para a cena nao ficou totalmente automatizada via browser tool porque a UI do Unity WebGL esta em canvas.
- O build depende de servir arquivos Brotli com `Content-Encoding` correto.
- Se houver lockfile residual da Unity, novos batch builds podem falhar ate limpeza do `Temp/UnityLockfile`.
- Existem warnings de obsolescencia em `RioVivoObjectiveBeacon.cs`, sem impacto bloqueante no build atual.

## Recomendacao de publicacao
- Publicar somente apos uma rodada manual curta no navegador.
- Manter o mesmo empacotamento Brotli do build validado.
- Preservar `Hub` e `Rio Vivo` nos Build Settings.
- Nao reabrir escopo antes da publicacao; focar apenas em regressao e conferência final.

## Resultado esperado para aceite
- Build abre.
- Hub abre.
- Rio Vivo entra.
- Loop completo fecha.
- Sem erro critico no console.
