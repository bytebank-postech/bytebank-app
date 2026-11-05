import type { QueryClient, QueryKey } from '@tanstack/react-query'

// O thunk controla a vida da leitura, inclusive quando há cache no QueryClient.
export async function fetchTransactionQuery<T>(
  queryClient: QueryClient | undefined,
  queryKey: QueryKey,
  signal: AbortSignal,
  execute: (signal: AbortSignal) => Promise<T>
): Promise<T> {
  signal.throwIfAborted()
  if (!queryClient) return execute(signal)
  const cancel = () => { void queryClient.cancelQueries({ queryKey, exact: true }) }
  signal.addEventListener('abort', cancel, { once: true })
  try {
    return await queryClient.fetchQuery({
      queryKey,
      queryFn: ({ signal: querySignal }) => execute(AbortSignal.any([signal, querySignal])),
    })
  } finally {
    signal.removeEventListener('abort', cancel)
  }
}
