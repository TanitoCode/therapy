'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { Wrench, Plus, Pencil, Trash2, RefreshCw } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { ServiceForm, type Service } from '@/components/admin/service-form'

export default function ServiciosPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | undefined>(undefined)

  const fetchServices = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/services')
      if (!res.ok) return
      const json = await res.json() as { data: Service[] }
      setServices(json.data ?? [])
    } catch {
      toast.error('Error al cargar servicios')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void fetchServices() }, [fetchServices])

  const handleDelete = async (svc: Service) => {
    if (!window.confirm(`¿Desactivar el servicio "${svc.name}"?`)) return
    try {
      const res = await fetch(`/api/admin/services/${svc.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: false }),
      })
      if (res.ok) {
        toast.success('Servicio desactivado')
        await fetchServices()
      } else {
        const json = await res.json().catch(() => ({}))
        toast.error((json as { error?: string }).error ?? 'Error al desactivar')
      }
    } catch {
      toast.error('Error de red')
    }
  }

  const handleFormSuccess = async () => {
    setDialogOpen(false)
    setEditingService(undefined)
    await fetchServices()
  }

  const headingStyle: React.CSSProperties = {
    fontFamily: 'var(--font-display)',
    fontSize: 'var(--text-2xl)',
    fontWeight: 400,
    color: 'var(--text-emphasis)',
    letterSpacing: '-0.02em',
    margin: 0,
  }

  const thStyle: React.CSSProperties = {
    fontFamily: 'var(--font-body)',
    fontSize: '0.6875rem',
    fontWeight: 600,
    color: 'var(--text-tertiary)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    padding: '0.5rem 0.875rem',
    textAlign: 'left',
    whiteSpace: 'nowrap',
    borderBottom: '1px solid var(--border-color)',
  }

  const tdStyle: React.CSSProperties = {
    fontFamily: 'var(--font-body)',
    fontSize: '0.875rem',
    color: 'var(--text-primary)',
    padding: '0.75rem 0.875rem',
    verticalAlign: 'middle',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={headingStyle}>Servicios</h1>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>
            Gestioná las categorías de servicio del consultorio
          </p>
        </div>
        <button
          type="button"
          onClick={() => { setEditingService(undefined); setDialogOpen(true) }}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 16px', border: 'none',
            borderRadius: 'var(--radius-base)',
            backgroundColor: 'var(--color-terracota)', color: '#fff',
            fontFamily: 'var(--font-body)', fontSize: '0.8125rem', fontWeight: 500,
            cursor: 'pointer', flexShrink: 0,
          }}
        >
          <Plus size={15} /> Nuevo servicio
        </button>
      </div>

      <div style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <RefreshCw size={20} style={{ color: 'var(--text-tertiary)', margin: '0 auto 8px', display: 'block' }} />
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.875rem', color: 'var(--text-tertiary)', margin: 0 }}>Cargando...</p>
          </div>
        ) : services.length === 0 ? (
          <div style={{ padding: '3.5rem', textAlign: 'center' }}>
            <Wrench size={32} style={{ color: 'var(--text-tertiary)', opacity: 0.4, margin: '0 auto 8px', display: 'block' }} />
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-base)', color: 'var(--text-secondary)', margin: 0 }}>
              Sin servicios registrados
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-canvas)' }}>
                  <th style={{ ...thStyle, width: 32 }}>Color</th>
                  <th style={thStyle}>Nombre</th>
                  <th style={thStyle}>Duración</th>
                  <th style={thStyle}>Estado</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {services.map((svc, idx) => (
                  <tr key={svc.id} style={{ borderTop: idx === 0 ? undefined : '1px solid var(--border-color-subtle,var(--border-color))' }}>
                    <td style={tdStyle}>
                      <span
                        style={{
                          display: 'inline-block', width: 20, height: 20,
                          borderRadius: '50%', backgroundColor: svc.color,
                          border: '2px solid rgba(0,0,0,0.08)',
                        }}
                        title={svc.color}
                      />
                    </td>
                    <td style={tdStyle}>
                      <p style={{ fontWeight: 600, margin: 0 }}>{svc.name}</p>
                      {svc.description && (
                        <p style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)', margin: '2px 0 0', maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {svc.description}
                        </p>
                      )}
                    </td>
                    <td style={tdStyle}>{svc.durationMin} min</td>
                    <td style={tdStyle}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center',
                        padding: '2px 8px', borderRadius: 999,
                        fontSize: '0.75rem', fontWeight: 500, fontFamily: 'var(--font-body)',
                        backgroundColor: svc.active ? 'var(--color-success-bg)' : 'var(--bg-secondary)',
                        color: svc.active ? 'var(--color-success)' : 'var(--text-tertiary)',
                        border: `1px solid ${svc.active ? 'var(--color-success)' : 'var(--border-color)'}`,
                      }}>
                        {svc.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          onClick={() => { setEditingService(svc); setDialogOpen(true) }}
                          aria-label={`Editar ${svc.name}`}
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: 'var(--radius-base)', border: '1px solid var(--border-color)', background: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
                        >
                          <Pencil size={13} />
                        </button>
                        {svc.active && (
                          <button
                            type="button"
                            onClick={() => void handleDelete(svc)}
                            aria-label={`Desactivar ${svc.name}`}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: 'var(--radius-base)', border: '1px solid var(--border-color)', background: 'none', cursor: 'pointer', color: 'var(--color-error,#dc2626)' }}
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) { setDialogOpen(false); setEditingService(undefined) } }}>
        <DialogContent className="sm:max-w-[480px]" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', padding: 0, overflow: 'hidden' }}>
          <DialogHeader style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-canvas)' }}>
            <DialogTitle style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', fontWeight: 400, color: 'var(--text-emphasis)', letterSpacing: '-0.01em' }}>
              {editingService ? 'Editar servicio' : 'Nuevo servicio'}
            </DialogTitle>
            <DialogDescription style={{ display: 'none' }}>
              {editingService ? 'Editá los datos del servicio' : 'Creá un nuevo servicio'}
            </DialogDescription>
          </DialogHeader>
          <div style={{ padding: '20px 24px' }}>
            <ServiceForm
              service={editingService}
              onSuccess={handleFormSuccess}
              onCancel={() => { setDialogOpen(false); setEditingService(undefined) }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
