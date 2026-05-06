'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { Search, ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight, Download } from 'lucide-react'

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Patient {
  id: string
  fullName: string
  email: string
  phone: string | null
  dni: string | null
  birthDate: string | null
  createdAt: string
}

interface PatientsResponse {
  data: Patient[]
  page: number
  per_page: number
}

type SortField = 'fullName' | 'createdAt'
type SortDir = 'asc' | 'desc'

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatDateShort(dateStr: string): string {
  try {
    return format(parseISO(dateStr), "d MMM yyyy", { locale: es })
  } catch {
    return '—'
  }
}

function exportToCSV(patients: Patient[]) {
  const headers = ['Nombre', 'Email', 'Teléfono', 'DNI', 'Fecha de nacimiento', 'Registrado']
  const rows = patients.map((p) => [
    p.fullName,
    p.email,
    p.phone ?? '',
    p.dni ?? '',
    p.birthDate ? formatDateShort(p.birthDate) : '',
    formatDateShort(p.createdAt),
  ])
  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `pacientes-${format(new Date(), 'yyyy-MM-dd')}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// ─── Sort button ───────────────────────────────────────────────────────────────

function SortButton({
  field,
  label,
  sortField,
  sortDir,
  onSort,
}: {
  field: SortField
  label: string
  sortField: SortField
  sortDir: SortDir
  onSort: (field: SortField) => void
}) {
  const active = sortField === field
  const Icon = active ? (sortDir === 'asc' ? ChevronUp : ChevronDown) : ChevronsUpDown

  return (
    <button
      type="button"
      onClick={() => onSort(field)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: 0,
        fontFamily: 'var(--font-body)',
        fontSize: '0.75rem',
        fontWeight: 600,
        color: active ? 'var(--color-terracota)' : 'var(--text-tertiary)',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
      }}
    >
      {label}
      <Icon size={12} />
    </button>
  )
}

// ─── Row skeleton ──────────────────────────────────────────────────────────────

function RowSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i} style={{ borderBottom: '1px solid var(--border-color)' }}>
          {Array.from({ length: 7 }).map((_, j) => (
            <td key={j} style={{ padding: '0.875rem 0.75rem' }}>
              <div
                style={{
                  height: 12,
                  backgroundColor: 'var(--bg-tertiary)',
                  borderRadius: 4,
                  width: j === 6 ? 64 : j === 0 ? '70%' : j === 1 ? '85%' : '60%',
                  animation: 'pulse 1.5s ease-in-out infinite',
                }}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────

const PER_PAGE = 20

export function PatientsTable() {
  const router = useRouter()

  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [page, setPage] = useState(1)
  const [sortField, setSortField] = useState<SortField>('fullName')
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(false)

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Debounce search query
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(query)
      setPage(1) // reset to page 1 on new search
    }, 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query])

  const fetchPatients = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        per_page: String(PER_PAGE),
      })
      if (debouncedQuery) params.set('q', debouncedQuery)

      const res = await fetch(`/api/admin/patients?${params.toString()}`)
      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error((json as { error?: string }).error ?? `HTTP ${res.status}`)
      }
      const data: PatientsResponse = await res.json()

      // Sort client-side (API sorts by fullName asc only)
      const sorted = [...data.data].sort((a, b) => {
        let cmpA: string
        let cmpB: string
        if (sortField === 'fullName') {
          cmpA = a.fullName.toLowerCase()
          cmpB = b.fullName.toLowerCase()
        } else {
          cmpA = a.createdAt
          cmpB = b.createdAt
        }
        const cmp = cmpA < cmpB ? -1 : cmpA > cmpB ? 1 : 0
        return sortDir === 'asc' ? cmp : -cmp
      })

      setPatients(sorted)
      setHasMore(data.data.length === PER_PAGE)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al cargar pacientes')
    } finally {
      setLoading(false)
    }
  }, [page, debouncedQuery, sortField, sortDir])

  useEffect(() => {
    fetchPatients()
  }, [fetchPatients])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDir('asc')
    }
    setPage(1)
  }

  const handleExportCSV = async () => {
    // Export all matching records (up to 500)
    try {
      const params = new URLSearchParams({ per_page: '500' })
      if (debouncedQuery) params.set('q', debouncedQuery)
      const res = await fetch(`/api/admin/patients?${params.toString()}`)
      if (!res.ok) throw new Error('Error al obtener datos')
      const data: PatientsResponse = await res.json()
      exportToCSV(data.data)
      toast.success(`${data.data.length} pacientes exportados`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al exportar')
    }
  }

  const isEmpty = !loading && patients.length === 0

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-primary)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
      }}
    >
      {/* Toolbar */}
      <div
        style={{
          padding: '1rem 1.25rem',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          flexWrap: 'wrap',
        }}
      >
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 240px', maxWidth: 360 }}>
          <Search
            size={15}
            style={{
              position: 'absolute',
              left: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-tertiary)',
              pointerEvents: 'none',
            }}
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre, email o DNI..."
            aria-label="Buscar pacientes"
            style={{
              width: '100%',
              paddingLeft: 34,
              paddingRight: 12,
              paddingTop: 8,
              paddingBottom: 8,
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-base)',
              backgroundColor: 'var(--bg-canvas)',
              fontFamily: 'var(--font-body)',
              fontSize: '0.875rem',
              color: 'var(--text-emphasis)',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Export button */}
        <button
          type="button"
          onClick={handleExportCSV}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '7px 14px',
            borderRadius: 'var(--radius-base)',
            border: '1px solid var(--border-color)',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            fontFamily: 'var(--font-body)',
            fontSize: '0.8125rem',
            fontWeight: 500,
            color: 'var(--text-secondary)',
            transition: 'background-color 0.15s',
          }}
        >
          <Download size={14} />
          Exportar CSV
        </button>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontFamily: 'var(--font-body)',
            fontSize: '0.875rem',
          }}
        >
          <thead>
            <tr
              style={{
                backgroundColor: 'var(--bg-canvas)',
                borderBottom: '1px solid var(--border-color)',
              }}
            >
              <th
                style={{
                  padding: '0.625rem 0.75rem',
                  textAlign: 'left',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                }}
              >
                <SortButton
                  field="fullName"
                  label="Nombre"
                  sortField={sortField}
                  sortDir={sortDir}
                  onSort={handleSort}
                />
              </th>
              <th
                style={{
                  padding: '0.625rem 0.75rem',
                  textAlign: 'left',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'var(--text-tertiary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Email
                </span>
              </th>
              <th
                style={{
                  padding: '0.625rem 0.75rem',
                  textAlign: 'left',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'var(--text-tertiary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Teléfono
                </span>
              </th>
              <th
                style={{
                  padding: '0.625rem 0.75rem',
                  textAlign: 'left',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'var(--text-tertiary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  DNI
                </span>
              </th>
              <th
                style={{
                  padding: '0.625rem 0.75rem',
                  textAlign: 'left',
                  whiteSpace: 'nowrap',
                }}
              >
                <SortButton
                  field="createdAt"
                  label="Registrado"
                  sortField={sortField}
                  sortDir={sortDir}
                  onSort={handleSort}
                />
              </th>
              <th
                style={{
                  padding: '0.625rem 0.75rem',
                  textAlign: 'right',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: 'var(--text-tertiary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Acciones
                </span>
              </th>
            </tr>
          </thead>

          <tbody>
            {loading && <RowSkeleton />}

            {!loading && isEmpty && (
              <tr>
                <td
                  colSpan={6}
                  style={{
                    padding: '3rem',
                    textAlign: 'center',
                    color: 'var(--text-tertiary)',
                    fontFamily: 'var(--font-body)',
                    fontSize: '0.875rem',
                  }}
                >
                  Aún no hay pacientes registrados
                </td>
              </tr>
            )}

            {!loading &&
              patients.map((patient) => (
                <tr
                  key={patient.id}
                  onClick={() => router.push(`/admin/pacientes/${patient.id}`)}
                  style={{
                    borderBottom: '1px solid var(--border-color)',
                    cursor: 'pointer',
                    transition: 'background-color 0.1s',
                  }}
                  onMouseEnter={(e) => {
                    ;(e.currentTarget as HTMLTableRowElement).style.backgroundColor =
                      'var(--bg-secondary)'
                  }}
                  onMouseLeave={(e) => {
                    ;(e.currentTarget as HTMLTableRowElement).style.backgroundColor = 'transparent'
                  }}
                >
                  {/* Nombre */}
                  <td
                    style={{
                      padding: '0.875rem 0.75rem',
                      fontWeight: 500,
                      color: 'var(--text-emphasis)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {patient.fullName}
                  </td>

                  {/* Email */}
                  <td
                    style={{
                      padding: '0.875rem 0.75rem',
                      color: 'var(--text-secondary)',
                      maxWidth: 200,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {patient.email}
                  </td>

                  {/* Teléfono */}
                  <td
                    style={{
                      padding: '0.875rem 0.75rem',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    {patient.phone ?? (
                      <span style={{ color: 'var(--text-tertiary)' }}>—</span>
                    )}
                  </td>

                  {/* DNI */}
                  <td
                    style={{
                      padding: '0.875rem 0.75rem',
                      color: 'var(--text-secondary)',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {patient.dni ?? (
                      <span style={{ color: 'var(--text-tertiary)' }}>—</span>
                    )}
                  </td>

                  {/* Registrado */}
                  <td
                    style={{
                      padding: '0.875rem 0.75rem',
                      color: 'var(--text-tertiary)',
                      fontVariantNumeric: 'tabular-nums',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {formatDateShort(patient.createdAt)}
                  </td>

                  {/* Acciones */}
                  <td
                    style={{
                      padding: '0.875rem 0.75rem',
                      textAlign: 'right',
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => router.push(`/admin/pacientes/${patient.id}`)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '4px 12px',
                        borderRadius: 'var(--radius-base)',
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--bg-canvas)',
                        cursor: 'pointer',
                        fontFamily: 'var(--font-body)',
                        fontSize: '0.8125rem',
                        fontWeight: 500,
                        color: 'var(--text-secondary)',
                        transition: 'background-color 0.15s, color 0.15s',
                      }}
                    >
                      Ver
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && (page > 1 || hasMore) && (
        <div
          style={{
            padding: '0.875rem 1.25rem',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.75rem',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.8125rem',
              color: 'var(--text-tertiary)',
            }}
          >
            Página {page}
          </span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              aria-label="Página anterior"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 32,
                height: 32,
                borderRadius: 'var(--radius-base)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'transparent',
                cursor: page === 1 ? 'not-allowed' : 'pointer',
                opacity: page === 1 ? 0.4 : 1,
                color: 'var(--text-secondary)',
              }}
            >
              <ChevronLeft size={15} />
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => p + 1)}
              disabled={!hasMore}
              aria-label="Página siguiente"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 32,
                height: 32,
                borderRadius: 'var(--radius-base)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'transparent',
                cursor: !hasMore ? 'not-allowed' : 'pointer',
                opacity: !hasMore ? 0.4 : 1,
                color: 'var(--text-secondary)',
              }}
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
