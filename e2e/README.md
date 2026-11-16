# Imposto de renda no navegador

Execute `yarn install` e, na pasta Angular, `npm run test:e2e`.
É necessário Chrome instalado, `uv` e o ambiente Python do projeto API.
O Playwright inicia Angular em 4201 e a API de teste em 18000; as portas devem
estar livres. Não reutiliza servidores pessoais.

O teste usa a rota e os modelos reais da API com uma base SQLite temporária,
sem executar o lifespan de produção. Inclui categoria arquivada, venda total,
fração em USD, histórico ausente e compra em 2026. O relógio da base de teste
fica em 16/11/2026. As chamadas dessa página são encaminhadas à API de teste;
nenhuma resposta financeira é substituída por JSON fixo no cenário principal.

O fluxo verifica navegação, anos/datas, distinção entre posição ausente e zero,
pendência de conversão, cópia e download CSV das linhas filtradas. Um segundo
cenário injeta um erro HTTP para verificar a recuperação pela interface.
