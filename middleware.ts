import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Example middleware - you can customize this as needed
  console.log('Incoming request:', request.url);
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};