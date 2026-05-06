import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { requireAdmin } from '@/lib/auth-server'
import { db } from '@/db'
import { patients } from '@/db/schema/patients'
import { eq } from 'drizzle-orm'
import { PatientDetail } from '@/components/admin/patient-detail'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  try {
    await requireAdmin()
    const [patient] = await db
      .select({ fullName: patients.fullName })
      .from(patients)
      .where(eq(patients.id, id))
      .limit(1)

    return {
      title: patient
        ? `${patient.fullName} — Therapy Admin`
        : 'Paciente — Therapy Admin',
      robots: { index: false },
    }
  } catch {
    return { title: 'Paciente — Therapy Admin', robots: { index: false } }
  }
}

export default async function PatientPage({ params }: Props) {
  const { id } = await params

  try {
    await requireAdmin()
  } catch (err) {
    const e = err as Error
    if (e.message === 'UNAUTHORIZED' || e.message === 'FORBIDDEN') {
      notFound()
    }
    throw err
  }

  const [patient] = await db.select().from(patients).where(eq(patients.id, id)).limit(1)
  if (!patient) notFound()

  return (
    <PatientDetail
      patient={{
        id: patient.id,
        fullName: patient.fullName,
        email: patient.email,
        phone: patient.phone,
        dni: patient.dni,
        birthDate: patient.birthDate,
        notes: patient.notes,
        medicalHistory: patient.medicalHistory,
        createdAt: patient.createdAt.toISOString(),
        updatedAt: patient.updatedAt.toISOString(),
      }}
    />
  )
}
