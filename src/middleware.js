import { NextResponse } from 'next/server'

/**
 *
 * @param {import('next/server').NextRequest} request
 */
export function middleware (request) {
  const response = NextResponse.next()
  const clientIp = request.headers?.get('x-real-ip') || request.headers?.get('x-forwarded-for')
  console.log(`${clientIp ?? '?'} [${new Date().toISOString()}] ${request.method} ${request.url} ${response.status}`)
  return response
}
