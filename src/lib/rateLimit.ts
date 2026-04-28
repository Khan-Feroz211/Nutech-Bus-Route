import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 100;

function cleanupExpired() {
  const now = Date.now();
  Object.keys(store).forEach(key => {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  });
}

setInterval(cleanupExpired, 60 * 1000);

export function rateLimit(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const key = identifier;
  
  if (!store[key] || store[key].resetTime < now) {
    store[key] = {
      count: 1,
      resetTime: now + WINDOW_MS,
    };
    return { allowed: true, remaining: MAX_REQUESTS - 1, resetTime: store[key].resetTime };
  }
  
  store[key].count++;
  
  if (store[key].count > MAX_REQUESTS) {
    return { allowed: false, remaining: 0, resetTime: store[key].resetTime };
  }
  
  return { 
    allowed: true, 
    remaining: MAX_REQUESTS - store[key].count, 
    resetTime: store[key].resetTime 
  };
}

export function withRateLimit(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 
             req.headers.get('x-real-ip') || 
             'unknown';
  
  const identifier = `${ip}:${req.nextUrl.pathname}`;
  const result = rateLimit(identifier);
  
  const response = NextResponse.next();
  
  response.headers.set('X-RateLimit-Limit', String(MAX_REQUESTS));
  response.headers.set('X-RateLimit-Remaining', String(result.remaining));
  response.headers.set('X-RateLimit-Reset', String(Math.ceil(result.resetTime / 1000)));
  
  if (!result.allowed) {
    return new NextResponse('Too Many Requests', {
      status: 429,
      headers: {
        'Retry-After': String(Math.ceil((result.resetTime - Date.now()) / 1000)),
      },
    });
  }
  
  return response;
}

export function authRateLimit(identifier: string): { allowed: boolean; remaining: number } {
  const key = `auth:${identifier}`;
  const now = Date.now();
  const AUTH_WINDOW_MS = 15 * 60 * 1000;
  const AUTH_MAX_REQUESTS = 5;
  
  if (!store[key] || store[key].resetTime < now) {
    store[key] = {
      count: 1,
      resetTime: now + AUTH_WINDOW_MS,
    };
    return { allowed: true, remaining: AUTH_MAX_REQUESTS - 1 };
  }
  
  store[key].count++;
  
  if (store[key].count > AUTH_MAX_REQUESTS) {
    return { allowed: false, remaining: 0 };
  }
  
  return { allowed: true, remaining: AUTH_MAX_REQUESTS - store[key].count };
}
