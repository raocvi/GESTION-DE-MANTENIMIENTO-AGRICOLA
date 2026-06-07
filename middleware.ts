import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// ⚠️ AUTENTICACIÓN DESACTIVADA TEMPORALMENTE
// Para reactivar: restaurar la verificación de token JWT
export function middleware(request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico).*)'],
}
