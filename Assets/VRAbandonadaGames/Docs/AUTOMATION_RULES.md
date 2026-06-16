# Automation Rules

Fluxo obrigatorio:

1. DIAG: inspecionar estrutura, riscos, dependencias e estado atual.
2. PATCH: alterar apenas o necessario, mantendo a base reutilizavel.
3. VERIFY: executar validacoes, revisar erros e registrar limites da verificacao.
4. REPORT: gerar markdown com resultado, pendencias e proximo passo.

Cada tijolo deve:

- criar arquivos de forma organizada
- evitar destruir sistemas existentes
- registrar mudancas importantes
- deixar rastreio claro para o proximo agente

Relatorios devem conter diagnostico, arquivos criados, arquivos modificados, validacoes, erros, pendencias e prompt seguinte recomendado.

Para evitar quebrar o projeto:

- nao apagar assets, cenas ou scripts sem backup
- isolar codigo de editor com `#if UNITY_EDITOR`
- manter modulos pequenos e reaproveitaveis
- validar pastas, cena hub e manifesto de assets em cada entrega
