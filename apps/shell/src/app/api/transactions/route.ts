import { NextResponse } from 'next/server'
import { Transaction } from '@bytebank/shared'

import { transactions } from '@/data/inmemory'

function normalize(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const pageParam = searchParams.get('page')
  if (!pageParam) return NextResponse.json(transactions)

  const page = Math.max(1, Number(pageParam) || 1)
  const pageSize = Math.min(50, Math.max(1, Number(searchParams.get('pageSize')) || 10))
  const search = normalize(searchParams.get('search') ?? '')
  const type = searchParams.get('type')
  const month = searchParams.get('month')
  const filtered = transactions.filter((transaction) => {
    const matchesSearch =
      !search ||
      normalize(transaction.name).includes(search) ||
      normalize(transaction.type).includes(search) ||
      normalize(transaction.category ?? '').includes(search)
    const matchesType = !type || transaction.type === type
    const matchesMonth = !month || transaction.date.startsWith(`${month}-`)
    return matchesSearch && matchesType && matchesMonth
  }).sort((first, second) => second.date.localeCompare(first.date))
  const total = filtered.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const currentPage = Math.min(page, totalPages)
  const start = (currentPage - 1) * pageSize

  return NextResponse.json({
    items: filtered.slice(start, start + pageSize),
    total,
    page: currentPage,
    pageSize,
    totalPages,
  })
}

export async function POST(request: Request) {
  const body = await request.json()
  const newTransaction: Transaction = {
    ...body,
    id: crypto.randomUUID(),
    attachments: [],
  }
  transactions.push(newTransaction)
  return NextResponse.json(newTransaction, { status: 201 })
}
