# Estratégia de cache

## Escopo e compatibilidade

A estratégia mantém os hooks, Redux, casos de uso, repositórios, navegação
entre MFEs e operações de transações/anexos existentes. O cache do cliente
é separado do cache HTTP. Não há novo serviço, dependência ou modo offline.

## Cache de consultas no cliente

`packages/shared/src/providers/AppProviders.tsx` cria um QueryClient por MFE:

- `staleTime: 30_000`: consultas são consideradas recentes por 30 segundos.
- `gcTime: 5 * 60_000`: consultas inativas podem permanecer por 5 minutos.
- `transactionsSlice.ts` executa `fetchQuery` para coleções completas e páginas.
- Chaves incluem o usuário; páginas também incluem paginação e filtros.
- O QueryClient não sobrevive à navegação completa para outro MFE.

`transactionsListeners.ts` invalida as chaves do usuário após criação, edição,
exclusão e remoção de anexo. Uma exclusão rejeitada também invalida o cache
para permitir a reconciliação após rollback. O fluxo de recarga existente é
preservado; invalidar não significa que todas as consultas imperativas sejam
imediatamente executadas outra vez.

`sessionListeners.ts` limpa o QueryClient e as transações no início do logout
e após login/cadastro bem-sucedidos. As chaves por usuário segregam o cache
do cliente, mas não substituem autorização no servidor.

## Antecipação entre MFEs

O handoff de `transactionNavigationCache.ts` usa `sessionStorage` da mesma
origem e aba. É limitado à primeira página padrão (10 itens), identificado
por usuário, válido por 30 segundos e consumido uma vez. Ele complementa o
QueryClient; não o torna compartilhado entre aplicações.

Somente hover/foco no menu da Home dispara a consulta antecipada. Mutações
e mudanças de sessão limpam o handoff e abortam sua requisição pendente.
Falhas de rede/armazenamento e cache expirado permitem a consulta normal.

## Política HTTP de transações e anexos

O shell declara `Cache-Control: private, no-store` para
`/api/transactions/:path*`, incluindo a coleção e os endpoints de detalhe,
metadados e conteúdo dos anexos. A regra não altera payloads, status ou
regras de negócio; instrui navegadores e proxies a não armazenar respostas
dessas APIs. O cache explícito do React Query e o handoff de sessão continuam
funcionando, pois são controlados pela aplicação.

A política não deve ser substituída por `public` ou `s-maxage` em CDN/reverse
proxy para esses endpoints. Os assets versionados dos MFEs continuam com a
política existente do Next.js; a regra não abrange páginas nem arquivos estáticos.

Após alterar `next.config.ts`, reiniciar o shell. Validar através do shell
com sessão autenticada, não pelas portas internas dos MFEs. No painel Network,
conferir o cabeçalho em:

- `GET /api/transactions` e `GET /api/transactions?page=1&pageSize=10`;
- `GET /api/transactions/<id>`;
- `GET /api/transactions/<id>/attachments`;
- abertura de um anexo existente em `/api/transactions/<id>/attachments/<attachmentId>`.

O build valida a configuração e gera a regra em `.next/routes-manifest.json`.
A confirmação no ambiente publicado deve verificar o cabeçalho efetivo após
CDN/proxy, além da configuração local.

## Decisões sobre cache adicional

**Anexos:** o fluxo atual não declara `ETag` nem valida `If-None-Match`.
Não foi introduzido cache condicional. Isso exigiria definir um validador
estável de conteúdo, responder `304` e garantir autorização antes da
revalidação. Até existir esse contrato, anexos seguem `private, no-store`.

**Persistência:** não adicionar persistência geral de consultas em
`localStorage`, IndexedDB ou service worker sem requisito de modo offline.
O único armazenamento de respostas entre MFEs continua sendo o handoff curto
já implementado. Persistir toda a coleção exigiria novas regras de expiração,
limpeza de sessão e sincronização após mutações.

## Verificação de regressão

Os testes existentes continuam cobrindo coleções, filtros, mutações e sessão;
os testes do handoff cobrem expiração, usuário, uso único e invalidação.
Para confirmar o comportamento em produção, repetir login, navegação,
criação/edição/exclusão e abertura/remoção de anexos. Comparar requisições
dentro e fora dos 30 segundos sem desabilitar o cache no DevTools durante
a avaliação de cache HTTP.
