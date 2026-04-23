'use client'

import { getClassnames } from '@/utils'
import styles from './Select.module.scss'
import { SelectProps } from './Select.types'
import { useEffect, useId, useMemo, useRef, useState } from 'react'

export default function Select({
  options,
  placeholder = 'Selecione uma opção...',
  disabled = false,
  className,
  value,
  defaultValue,
  onChange,
  ...props
}: SelectProps) {
  const id = useId()
  const rootRef = useRef<HTMLDivElement | null>(null)
  const [open, setOpen] = useState(false)
  const [internalValue, setInternalValue] = useState(defaultValue ?? '')

  const currentValue = value ?? internalValue
  const selected = useMemo(
    () => options.find((o) => o.value === currentValue) ?? null,
    [options, currentValue]
  )
  const isPlaceholder = !selected

  const classnames = getClassnames(
    styles.select,
    className,
    disabled && styles.disabled,
    open && styles.open
  )

  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (!open) return
      const root = rootRef.current
      if (!root) return
      if (e.target instanceof Node && root.contains(e.target)) return
      setOpen(false)
    }

    window.addEventListener('pointerdown', onPointerDown)
    return () => window.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  function commit(nextValue: string) {
    if (value === undefined) setInternalValue(nextValue)
    onChange?.(nextValue)
  }

  return (
    <div ref={rootRef} {...props} className={classnames}>
      <button
        type="button"
        className={styles.trigger}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-listbox`}
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
      >
        <span
          className={getClassnames(
            styles.triggerText,
            isPlaceholder && styles.placeholder
          )}
        >
          {selected?.label ?? placeholder}
        </span>
        <span className={styles.caret} aria-hidden="true" />
      </button>

      {open ? (
        <div
          id={`${id}-listbox`}
          role="listbox"
          className={styles.menu}
          aria-label="Opções"
        >
          {options.map((opt) => {
            const isSelected = opt.value === currentValue
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                className={getClassnames(
                  styles.option,
                  isSelected && styles.optionSelected
                )}
                onClick={() => {
                  commit(opt.value)
                  setOpen(false)
                }}
              >
                {opt.label}
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
