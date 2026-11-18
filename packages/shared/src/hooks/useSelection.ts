'use client'

import { useCallback, useEffect, useMemo, useReducer } from 'react'

type SelectionState = {
  active: boolean
  ids: Record<string, boolean>
}

type SelectionAction =
  | { type: 'enable' }
  | { type: 'disable' }
  | { type: 'toggle'; id: string; selected: boolean }
  | { type: 'replace'; ids: string[] }
  | { type: 'clear' }

const initialState: SelectionState = { active: false, ids: {} }

function selectionReducer(
  state: SelectionState,
  action: SelectionAction
): SelectionState {
  switch (action.type) {
    case 'enable':
      return { active: true, ids: {} }
    case 'disable':
      return initialState
    case 'toggle':
      return { ...state, ids: { ...state.ids, [action.id]: action.selected } }
    case 'replace':
      return {
        ...state,
        ids: Object.fromEntries(action.ids.map((id) => [id, true])),
      }
    case 'clear':
      return { ...state, ids: {} }
    default:
      return state
  }
}

export function useSelection(availableIds: string[]) {
  const [state, dispatch] = useReducer(selectionReducer, initialState)

  const availableKey = availableIds.join(',')

  useEffect(() => {
    dispatch({ type: 'clear' })
  }, [availableKey])

  const selectedIds = useMemo(
    () => availableIds.filter((id) => state.ids[id]),
    [availableIds, state.ids]
  )

  const allSelected =
    availableIds.length > 0 && selectedIds.length === availableIds.length

  const handleEnable = useCallback(() => dispatch({ type: 'enable' }), [])
  const handleDisable = useCallback(() => dispatch({ type: 'disable' }), [])

  const handleToggle = useCallback((id: string, selected: boolean) => {
    dispatch({ type: 'toggle', id, selected })
  }, [])

  const handleToggleAll = useCallback(
    (selected: boolean) => {
      dispatch(
        selected ? { type: 'replace', ids: availableIds } : { type: 'clear' }
      )
    },
    [availableIds]
  )

  return {
    isActive: state.active,
    selectedIds,
    selectedCount: selectedIds.length,
    allSelected,
    isSelected: (id: string) => Boolean(state.ids[id]),
    handleEnable,
    handleDisable,
    handleToggle,
    handleToggleAll,
  }
}
