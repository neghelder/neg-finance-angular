# Imposto de renda

A página lazy `/income-tax`, disponível na barra lateral, consulta
`GET /income-tax/assets?calendar_year=2025` ou `2026`. A
[especificação canônica da API](../../neg-finance-api/docs/specs/income-tax-assets.spec.md)
define cortes, cálculo dos custos registrados, classificação e pendências.

O ano inicial é 2025, exercício 2026. O relatório de 2026 mostra a data efetiva
informada pela API e um aviso enquanto for prévia. A interface não calcula
posições históricas, câmbio ou impostos e não importa informes PDF.

O grid compartilhado apresenta a lista, incluindo posições encerradas e
categorias arquivadas recebidas da API. Mercado, classe e busca por ticker/nome
filtram a lista. A seleção de uma linha abre seus detalhes; o primeiro resultado
filtrado é exibido inicialmente. Os detalhes contêm as duas posições, quantidade,
preço médio com até oito casas, custos na moeda original, situação fiscal em BRL,
CNPJ, grupo/código, origem dos dados, discriminação e observações.

`null` aparece como **Indisponível**, enquanto zero permanece zero. CNPJ
estrangeiro não aplicável aparece como **Não se aplica**. Os custos nativos do
exterior continuam visíveis quando a conversão fiscal em reais estiver pendente.
As mensagens da API distinguem encerramento de posição de dados desconhecidos.

É possível copiar cada campo conhecido, a discriminação ou uma linha completa.
A falha de permissão da área de transferência apresenta orientação para selecionar
o texto e copiar manualmente. O texto permanece selecionável. A exportação usa
somente as linhas filtradas: CSV UTF-8 com BOM, separador `;`, números PT-BR,
moedas, datas, origens e pendências explícitas. As células recebem escape de
aspas e proteção contra fórmulas de planilha.

Falhas HTTP apresentam erro e botão para repetir, sem mostrar posições antigas
como se fossem dados do ano solicitado. Existem estados separados para
carregamento, ausência de ativos e filtros sem resultados. A troca de ano cancela
a requisição anterior; o componente também a cancela ao sair da página.

Os testes Jest próximos a `src/app/income-tax` cobrem o contrato HTTP e o
template, filtros, prévia, zeros/ausências, cópia e CSV. O fluxo real com API e
SQLite sintéticos está descrito em [e2e/README.md](../e2e/README.md).
