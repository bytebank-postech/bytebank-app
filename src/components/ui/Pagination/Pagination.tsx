'use client'
import styles from './Pagination.module.scss'
import { getClassnames } from '@/utils'
import { PaginationProps } from './Pagination.types'
import { createPageRange, getTotalPages } from './Pagination.utils'
import Button from '../Button/Button'
import {
  MdNavigateNext,
  MdNavigateBefore,
  MdFirstPage,
  MdLastPage,
} from 'react-icons/md'
export default function Pagination({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,

  siblingCount = 1,
  boundaryCount = 1,

  showFirstLast = true,
  showPrevNext = true,

  disabled = false,
  loading = false,

  ariaLabel = 'Pagination',
}: PaginationProps) {
  const classnames = getClassnames(
    styles.pagination,
    disabled && styles.disabled
  )
  const totalPages = getTotalPages(totalItems, pageSize)

  const pages = createPageRange(
    currentPage,
    totalPages,
    siblingCount,
    boundaryCount
  )

  const canGoPrevious = currentPage > 1
  const canGoNext = currentPage < totalPages

  const isDisabled = disabled || loading

  return (
    <nav aria-label={ariaLabel} className={classnames}>
      {showFirstLast && (
        <Button
          disabled={!canGoPrevious || isDisabled}
          onClick={() => onPageChange(1)}
        >
          <MdFirstPage color="#fff" size={20} />
        </Button>
      )}

      {showPrevNext && (
        <Button
          disabled={!canGoPrevious || isDisabled}
          onClick={() => onPageChange(currentPage - 1)}
        >
          <MdNavigateBefore color="#fff" size={20} />
        </Button>
      )}

      {pages.map((page, index) =>
        page === '...' ? (
          <Button key={index} disabled>
            ...
          </Button>
        ) : (
          <Button
            key={page}
            disabled={isDisabled}
            aria-current={page === currentPage ? 'page' : undefined}
            onClick={() => onPageChange(page)}
            className={page === currentPage ? styles.active : ''}
          >
            {page.toString()}
          </Button>
        )
      )}

      {showPrevNext && (
        <Button
          disabled={!canGoNext || isDisabled}
          onClick={() => onPageChange(currentPage + 1)}
        >
          <MdNavigateNext color="#fff" size={20} />
        </Button>
      )}

      {showFirstLast && (
        <Button
          disabled={!canGoNext || isDisabled}
          onClick={() => onPageChange(totalPages)}
        >
          <MdLastPage color="#fff" size={20} />
        </Button>
      )}
    </nav>
  )
}
