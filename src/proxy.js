import { auth0 } from '../lib/auth0'

/**
 *
 * @param {import('next/server').NextRequest} request
 */
export async function proxy (request) {
  const response = await auth0.middleware(request)

  const clientIp = request.headers?.get('x-real-ip') || request.headers?.get('x-forwarded-for')
  console.log(`${clientIp ?? '???'} [${new Date().toISOString()}] ${request.method} ${request.nextUrl.pathname ?? '???'} ${response.status}`)
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)'
  ]
}
