# Linha de base de performance

Este documento registra a referência para as melhorias de performance. Ele não
altera o comportamento da aplicação: as medições devem ser repetidas antes e
depois de cada mudança de otimização.

## Escopo crítico

- `/auth`: autenticação.
- `/`: dashboard, criação de transação, extrato e gráficos.
- `/transactions`: listagem, busca, filtros e paginação.

As rotas devem ser acessadas pelo `shell` em `http://localhost:3000`, pois ele
é o gateway que aplica os rewrites dos microfrontends.

## Referência inicial

Coletada em 04/11/2026, após `corepack yarn build`, com Node.js 22.18.0 e Yarn
3.5.0. Os valores são a soma dos arquivos JavaScript e CSS emitidos em
`apps/<app>/.next/static`; são **não comprimidos** e representam o volume
estático total do aplicativo, não o payload de uma rota individual.

| Aplicativo | JavaScript | CSS | Total estático |
| --- | ---: | ---: | ---: |
| `shell` | 612,6 KB | 0 KB | 612,6 KB |
| `mfe-auth` | 1.132,6 KB | 25,7 KB | 1.158,3 KB |
| `mfe-home` | 1.243,1 KB | 30,6 KB | 1.273,7 KB |
| `mfe-transactions` | 1.144,7 KB | 26,2 KB | 1.170,9 KB |

O total estático não deve ser usado como tamanho da primeira navegação: há
chunks compartilhados, carregamento sob demanda e compressão HTTP. A inspeção
por rota no Lighthouse é a métrica decisória.

## Metas de aceitação

Medir em Lighthouse no perfil **mobile**, com cache desabilitado e três
execuções por rota. Usar a mediana das três execuções.

| Métrica | Meta |
| --- | ---: |
| Performance Lighthouse | >= 90 |
| LCP | <= 2,5 s |
| INP | <= 200 ms |
| CLS | <= 0,10 |
| JavaScript transferido na navegação inicial | <= 300 KB gzip/Brotli |

As metas de campo (LCP, INP e CLS) devem ser acompanhadas separadamente das
medições de laboratório quando a aplicação tiver ambiente publicado e tráfego
real.

## Procedimento de medição

1. Executar `corepack yarn build`.
2. Iniciar os quatro serviços com `corepack yarn start`.
3. Autenticar com a conta de demonstração e manter uma sessão válida.
4. No Chrome DevTools, abrir uma janela anônima, selecionar o perfil Mobile,
   desabilitar o cache e executar o Lighthouse três vezes para `/`,
   `/transactions` e `/auth`.
5. Registrar mediana de Performance, LCP, INP, CLS, TBT, tamanho transferido e
   quantidade de requisições.
6. Repetir a medição para uma navegação de `/` para `/transactions` e para a
   busca com debounce em `/transactions`.

Para comparar mudanças, usar a mesma máquina, navegador, perfil de rede e
estado de autenticação. Não comparar uma medição feita em desenvolvimento com
uma feita após `build`.

## Orçamento de bundle

A política de consultas, handoff entre MFEs e respostas HTTP está documentada
em [CACHE_STRATEGY.md](./CACHE_STRATEGY.md).

Uma alteração não deve aumentar o JavaScript estático total de seu MFE em mais
de 10% sem justificativa registrada. A validação definitiva do orçamento deve
ser feita pelo payload transferido da rota crítica, e não apenas por esta soma
de artefatos.

## Próxima automação

### Pré-carregamento entre microfrontends

O menu mantém links HTML e navegação completa entre Home e Transações. Na
Home, a visibilidade do link de Transações insere um hint `rel="prefetch"`
para o documento. O navegador pode ignorá-lo; não há bloqueio do clique nem
pré-carregamento explícito dos gráficos.

Hover ou foco no link antecipa somente a página 1 com 10 itens, sem filtros.
A resposta fica em `sessionStorage`, por usuário, por até 30 segundos, e é
consumida uma vez pelo MFE de destino. A coleção não é carregada por viewport.
Mutações e mudanças de sessão limpam esse handoff e abortam o prefetch pendente.
Falhas de rede, armazenamento bloqueado ou cache expirado preservam a consulta
normal. O QueryClient continua independente em cada MFE.

Os testes automatizados cobrem o handoff após recriar o módulo, filtros,
isolamento por usuário, expiração e invalidação de resposta pendente. Para
validar no navegador pelo shell: passar o mouse sobre Transações, esperar a
consulta `page=1&pageSize=10` terminar e clicar. A primeira página deve ser
reutilizada; após 30 segundos, deve ocorrer a consulta normal. Voltar à Home
deve continuar usando o destino `/`, sem prefixo `/transactions`.

Adicionar uma auditoria Lighthouse em CI e falhar o pipeline quando as metas
acima forem ultrapassadas. A automação deve usar build de produção, iniciar os
MFEs e produzir relatórios versionados como artefatos do pipeline, sem incluir
arquivos `.next` no Git.
