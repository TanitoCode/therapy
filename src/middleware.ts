import { NextRequest, NextResponse } from 'next/server'

const ADMIN_PATHS = ['/admin']
const PUBLIC_ADMIN_PATHS = ['/admin/login']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isAdminPath = ADMIN_PATHS.some((p) => pathname.startsWith(p))
  const isPublicAdminPath = PUBLIC_ADMIN_PATHS.some((p) => pathname.startsWith(p))

  if (isAdminPath && !isPublicAdminPath) {
    // Better Auth usa cookie: "better-auth.session_token" (prefijo por defecto: "better-auth")
    // En producción HTTPS la cookie se llama "__Secure-better-auth.session_token"
    const sessionCookie =
      request.cookies.get('better-auth.session_token') ??
      request.cookies.get('__Secure-better-auth.session_token')

    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
