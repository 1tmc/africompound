// middleware.ts
import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get('host') || '';

  // Determine the correct cookie domain for cross-subdomain authentication sharing
  const isProd = process.env.NODE_ENV === 'production';
  const cookieDomain = isProd ? '.africompound.vercel.app' : '.localhost';

  // 1. Create an initial NextResponse to modify and pass along
  let res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  // 2. Initialize Supabase SSR to sync, write, and refresh session cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            const modifiedOptions = { ...options, domain: cookieDomain };
            req.cookies.set(name, value);
          });
          
          res = NextResponse.next({
            request: {
              headers: req.headers,
            },
          });
          
          cookiesToSet.forEach(({ name, value, options }) => {
            const modifiedOptions = { ...options, domain: cookieDomain };
            res.cookies.set(name, value, modifiedOptions);
          });
        },
      },
    }
  );

  // This operation updates and refreshes the cookies on the response object
  await supabase.auth.getUser();

  // Local development ports and live staging domains
  const rootDomains = ['africompound.vercel.app', 'localhost:3000'];
  
  let currentHost = hostname;
  rootDomains.forEach(domain => {
    currentHost = currentHost.replace(`.${domain}`, '');
  });

  // If hitting the base domain directly, serve the public marketing page
  if (rootDomains.includes(hostname)) {
    return res;
  }

  // 3. Perform the subdomain rewrite
  // If the pathname already contains '/owners', strip it out temporarily
  // so we don't end up with duplicate folders like /owners/bismark-house/owners/...
  const cleanPathname = url.pathname.startsWith('/owners')
    ? url.pathname.replace('/owners', '')
    : url.pathname;

  const rewriteUrl = new URL(`/owners/${currentHost}${cleanPathname}`, req.url);
  
  // Clone response headers and cookies to ensure the rewrite carries the session
  const rewrittenResponse = NextResponse.rewrite(rewriteUrl, {
    request: {
      headers: req.headers,
    }
  });

  // Copy the updated Supabase cookies (including the new domain attribute) to the rewritten response
  res.cookies.getAll().forEach((cookie) => {
    rewrittenResponse.cookies.set({
      name: cookie.name,
      value: cookie.value,
      domain: cookieDomain,
      path: '/',
      sameSite: 'lax',
      secure: isProd,
    });
  });

  return rewrittenResponse;
}

// Ensure the middleware runs on all paths except internal assets
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};