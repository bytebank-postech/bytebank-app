# Gerenciamento de estado — ByteBank

Camada de estado e programação reativa sobre a Clean Architecture do monorepo.

## Onde cada estado vive

| Estado                                                    | Onde              | Por quê                                           |
| --------------------------------------------------------- | ----------------- | ------------------------------------------------- |
| Transações (entidades, paginação, filtros, status)        | Redux             | Compartilhado entre telas e entre MFEs             |
| Sessão do usuário                                           | Redux             | Lido pelo header, pelos guards e pelas páginas     |
| Preferências de UI (`balanceVisible`)                      | Redux + persistido | Precisa sobreviver à navegação                    |
| Formulário de nova transação                               | `useReducer` local | Nenhuma outra tela consome                        |
| Modal aberto, busca expandida, seleção em massa            | `useState` local   | Efêmero, morre com o componente                   |

A regra prática: **vai para o store o que mais de um lugar lê, ou o que precisa
sobreviver à desmontagem.** O resto fica local.

## Estrutura

```text
packages/shared/src/
  store/
    makeStore.ts            fábrica do store (uma instância por requisição)
    createAppExtra.ts       composition root: injeta use cases nos thunks
    types.ts                AppExtra, AppDispatch, AppThunkConfig
    createAppAsyncThunk.ts  thunk tipado com o AppThunkConfig
    rootReducer.ts          combineReducers + RootState
    hooks.ts                useAppDispatch / useAppSelector
    StoreProvider.tsx       Provider + hidratação de preferências
    slices/                 transactions, session, preferences
    selectors/              seletores memoizados (createSelector)
    listeners/              efeitos reativos (debounce, invalidação, persistência)
    testing/                store de teste com dependências falsas
  hooks/                    facades consumidas pelas páginas (inclui useAuth)
  providers/
    AppProviders.tsx        ordem única de montagem
    SessionBootstrap.tsx    restaura a sessão no mount
    AuthGuard.tsx           segura a árvore enquanto a sessão é desconhecida
```

## Injeção de dependência

Os slices **não importam infraestrutura**. O store recebe as dependências no
`extraArgument` e os thunks as consomem por `thunkApi.extra`:

```ts
export type AppExtra = {
  transactions: TransactionUseCases
  session: SessionGateway
  toAttachmentUploads: (files: File[]) => Promise<AttachmentUpload[]>
}
```

`createAppExtra()` é o único arquivo da camada de estado que conhece
`@bytebank/infrastructure/client`. Nos testes, `createTestExtra()` troca tudo por
dublês e nenhuma requisição sai.

## Normalização

`createEntityAdapter` mantém a coleção normalizada por `id`. O state guarda
separadamente `visibleIds`, que é a ordem da visão atual:

- `view: 'page'` — lista paginada e filtrada (`mfe-transactions`)
- `view: 'all'` — coleção completa para saldo e gráficos (`mfe-home`)

Assim um `update` custa O(1) por id, e páginas já visitadas permanecem em cache
na coleção mesmo quando saem de `visibleIds`.

## Programação reativa

Todo o fluxo de recarga vive no `createListenerMiddleware`, não em `useEffect`.
A página apenas despacha a intenção.

```ts
startListening({
  matcher: isFilterChange,
  effect: async (action, listenerApi) => {
    listenerApi.cancelActiveListeners() // takeLatest

    if (setSearch.match(action)) {
      await listenerApi.delay(SEARCH_DEBOUNCE_MS) // debounce só na digitação
    }

    if (selectCollectionView(listenerApi.getState()) !== 'page') return

    await listenerApi.dispatch(loadTransactionPage())
  },
})
```

Um único listener entrega três comportamentos:

| Técnica            | Efeito                                                  |
| ------------------ | -------------------------------------------------------- |
| `cancelActiveListeners` | Só a última mudança de filtro sobrevive              |
| `delay`            | Digitar "aluguel" gera 1 requisição, não 7               |
| Guarda por `view`  | A visão completa não dispara requisição de página        |

Os outros listeners reativos:

- **Invalidação** — criar ou excluir revalida a visão paginada, porque contagem e
  recorte mudaram. Na visão completa o reducer já deixou tudo consistente.
- **Persistência** — alternar a visibilidade do saldo grava no `localStorage`
  sem que nenhum componente precise saber disso.
- **Troca de sessão** — login ou logout descarta a coleção em memória.

## Condição de corrida

`list.requestId` registra a última requisição de lista disparada. Respostas de
requisições superadas são descartadas no reducer, então um filtro antigo que
responde devagar nunca sobrescreve o filtro atual. Cancelamentos (`meta.aborted`)
não são tratados como erro.

## Atualização otimista

`deleteTransactions` remove o item no `pending`, guardando `{ transaction, index }`
em `pendingRemovals` por `requestId`. Se a API falhar, o `rejected` devolve o item
à posição original e restaura o total.

## Otimização de renderização

- Dados derivados (saldo, grupos por mês, fluxo mensal, distribuição por tipo)
  vivem em seletores memoizados, não em `useMemo` dentro da página. A memoização
  é compartilhada entre componentes e sobrevive ao re-render.
- As regras puras de derivação estão em `@bytebank/domain/analytics`; o seletor
  apenas as compõe.
- Seletores granulares (`selectSearchTerm`, `selectCurrentPage`) evitam assinar
  a slice inteira.
- Listas usam linhas memoizadas (`memo`) com callbacks estáveis (`useCallback`),
  então digitar na busca não re-renderiza a lista toda.

## Facades

As páginas não tocam em `dispatch` nem em seletores crus:

| Hook                       | Entrega                                             |
| -------------------------- | ----------------------------------------------------- |
| `useTransactionCollection` | Carrega a visão e devolve itens, grupos, status, totais |
| `useTransactionFilters`    | Filtros atuais + handlers de intenção                  |
| `useTransactionMutations`  | create / update / remove / removeAttachment             |
| `useDashboardAnalytics`    | Saldo, fluxo mensal, distribuição, extrato             |
| `useBalanceVisibility`     | Preferência persistida do saldo                        |
| `useSelection`             | Seleção em massa (estado local, `useReducer`)          |
| `useAuth`                  | Sessão: user, login, register, logout                  |

## SSR

`makeStore()` é fábrica, nunca singleton de módulo. `StoreProvider` cria a
instância com inicializador preguiçoso de `useState`, então cada requisição no
servidor e cada montagem no cliente ficam isoladas — sem vazamento de estado
entre usuários.

As preferências são hidratadas do `localStorage` em `useEffect`, depois da
montagem: ler durante o render quebraria a hidratação, já que o servidor não
enxerga o `localStorage`.

## Testes

```bash
cd packages/shared && yarn exec vitest run
```

Cobrem reducers, thunks (incluindo rollback otimista e corrida de requisições),
seletores derivados e o pipeline reativo de filtros — tudo com dependências
injetadas, sem rede.
