'use client'

import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'
import type { ChartProps } from '@bytebank/ui'
import styles from '../app/page.module.scss'

const Chart = dynamic(
  () => import('@bytebank/ui').then((module) => module.Chart),
  {
    ssr: false,
    loading: () => <ChartPlaceholder />,
  }
)

type LazyChartProps = ChartProps & {
  placeholderHeight?: number
  enabled?: boolean
}

function ChartPlaceholder({ height = 320 }: { height?: number }) {
  return (
    <div
      className={styles.chartPlaceholder}
      style={{ minHeight: height }}
      role="status"
      aria-label="Carregando gráfico"
    />
  )
}

export default function LazyChart({
  placeholderHeight = 320,
  enabled = true,
  ...chartProps
}: LazyChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [shouldLoad, setShouldLoad] = useState(false)
  const supportsIntersectionObserver =
    typeof IntersectionObserver !== 'undefined'

  useEffect(() => {
    const container = containerRef.current
    if (!container || shouldLoad || !enabled) return
    if (!supportsIntersectionObserver) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setShouldLoad(true)
        observer.disconnect()
      },
      { rootMargin: '200px 0px' }
    )

    observer.observe(container)
    return () => observer.disconnect()
  }, [enabled, shouldLoad, supportsIntersectionObserver])

  return (
    <div ref={containerRef} style={{ width: '100%', minWidth: 0 }}>
      {enabled && (shouldLoad || !supportsIntersectionObserver) ? (
        <Chart {...chartProps} />
      ) : enabled ? (
        <ChartPlaceholder height={placeholderHeight} />
      ) : null}
    </div>
  )
}
