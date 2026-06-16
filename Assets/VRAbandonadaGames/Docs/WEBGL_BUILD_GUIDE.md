# WebGL Build Guide

## Cena inicial recomendada
- Inicie pelo hub: `Assets/VRAbandonadaGames/Scenes/VRA_Games_PrototypeHub.unity`
- Mantenha `RioVivoParaiba_Main.unity` habilitada nos Build Settings.

## Como gerar build WebGL
1. Abra `File > Build Profiles`.
2. Selecione `WebGL`.
3. Confirme que o hub e `RioVivoParaiba_Main` estao habilitados.
4. Use pasta de saida separada, por exemplo `Builds/WebGL`.
5. Gere primeiro em modo de desenvolvimento apenas para smoke test.

## Cuidados com peso
- Priorize as qualidades `Low` ou `Medium` para publicacao inicial.
- Evite adicionar texturas novas acima de 2 MB sem compressao adequada.
- Prefira audio curto/comprimido e loops simples.
- Reuse prefabs importados e materiais ja auditados.

## Cuidados com audio
- Teste autoplay no navegador; alguns navegadores exigem interacao do usuario antes do audio.
- Mantenha fallback silencioso no runtime.
- Prefira `.wav` curtos ou assets comprimidos depois da validacao funcional.

## Cuidados com navegador
- Teste Chrome e Firefox desktop primeiro.
- Em mobile web, valide memoria e toque antes de publicar amplamente.
- Monitore loading inicial, travamentos e consumo de memoria.

## Proximos passos para publicar no site
- Medir tamanho final do build.
- Testar carregamento em hospedagem estatica.
- Definir tela inicial e mensagem de carregamento.
- Validar copy, compartilhamento e retorno ao hub no navegador real.
