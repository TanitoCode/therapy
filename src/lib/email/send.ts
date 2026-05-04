// Email stubs — implemented in T26-EMAIL-CORE with Resend + react-email templates

export interface BookingConfirmationParams {
  to: string
  patientName: string
  serviceName: string
  startAt: Date
  appointmentId: string
  confirmationToken: string
  cancelToken: string
}

export interface AdminNewBookingParams {
  patientName: string
  patientEmail: string
  serviceName: string
  startAt: Date
  appointmentId: string
}

export async function sendBookingConfirmation(
  _params: BookingConfirmationParams,
): Promise<void> {
  // T26: send via Resend with booking-confirmation.tsx template
}

export async function sendAdminNewBooking(_params: AdminNewBookingParams): Promise<void> {
  // T26: send via Resend with admin-new-booking.tsx template
}

export async function sendBookingCancelled(_params: {
  to: string
  patientName: string
  serviceName: string
  startAt: Date
}): Promise<void> {
  // T26: send via Resend with booking-cancelled.tsx template
}

export async function sendAdminCancellation(_params: {
  patientName: string
  serviceName: string
  startAt: Date
  appointmentId: string
}): Promise<void> {
  // T26: send via Resend with admin-cancellation.tsx template
}
