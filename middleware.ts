// middleware.ts
import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get('host') || '';

  const isProd = process.env.NODE_ENV === 'production';
  
  // Set proper root domain for cookies
  // Replace 'africompound.com' with your actual custom domain when connected
  const rootDomains = ['africompound.vercel.app', 'localhost:3000', 'localhost'];
  const cookieDomain = isProd ? '.africompound.vercel.app' : '.localhost';

  let res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  // 1. Supabase SSR Session Refresh
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
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

  await supabase.auth.getUser();

  // 2. Extract Subdomain Safely
  const currentHost = hostname.replace(/:\d+$/, ''); // Strip port numbers

  // Check if current host is directly visiting the root domain
  const isRootDomain = rootDomains.includes(currentHost);

  if (isRootDomain) {
    // Serve normal marketing / sign-up routes
    return res;
  }

  // Calculate the subdomain (e.g., "bismark" from "bismark.africompound.com")
  let subdomain = currentHost;
  rootDomains.forEach(domain => {
    subdomain = subdomain.replace(`.${domain}`, '');
  });

  // 3. Prevent duplicate '/owners' path prefixes
  const cleanPathname = url.pathname.startsWith('/owners')
    ? url.pathname.replace('/owners', '')
    : url.pathname;

  const rewriteUrl = new URL(`/owners/${subdomain}${cleanPathname}${url.search}`, req.url);

  const rewrittenResponse = NextResponse.rewrite(rewriteUrl, {
    request: {
      headers: req.headers,
    }
  });

  // Copy refreshed cookies over to rewritten response
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

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};