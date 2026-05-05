import { create } from 'zustand'

export interface ServiceItem {
  id: string
  name: string
  slug: string
  description: string | null
  durationMin: number
  color: string
}

export interface SlotItem {
  start_at: string
  end_at: string
  available: boolean
}

export type BookingStep = 1 | 2 | 3 | 4

interface BookingStore {
  step: BookingStep
  selectedService: ServiceItem | null
  selectedDate: string | null  // YYYY-MM-DD
  selectedSlot: SlotItem | null

  setService: (service: ServiceItem) => void
  setDate: (date: string) => void
  setSlot: (slot: SlotItem) => void
  nextStep: () => void
  prevStep: () => void
  reset: () => void
}

export const useBookingState = create<BookingStore>((set) => ({
  step: 1,
  selectedService: null,
  selectedDate: null,
  selectedSlot: null,

  // Selecting a service clears date/slot and advances to step 2
  setService: (service) =>
    set({ selectedService: service, step: 2, selectedDate: null, selectedSlot: null }),
  setDate: (date) => set({ selectedDate: date, selectedSlot: null }),
  setSlot: (slot) => set({ selectedSlot: slot }),
  nextStep: () => set((s) => ({ step: Math.min(s.step + 1, 4) as BookingStep })),
  prevStep: () => set((s) => ({ step: Math.max(s.step - 1, 1) as BookingStep })),
  reset: () => set({ step: 1, selectedService: null, selectedDate: null, selectedSlot: null }),
}))
