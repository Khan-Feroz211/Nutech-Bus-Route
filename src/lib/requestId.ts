import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { randomUUID } from 'crypto';

export function addRequestId(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || randomUUID();
  
  const response = NextResponse.next();
  response.headers.set('x-request-id', requestId);
  
  return response;
}

export function getRequestId(req: NextRequest): string {
  return req.headers.get('x-request-id') || randomUUID();
}

export interface RequestContext {
  requestId: string;
  timestamp: number;
  startTime: number;
}

export function createRequestContext(req: NextRequest): RequestContext {
  return {
    requestId: getRequestId(req),
    timestamp: Date.now(),
    startTime: Date.now(),
  };
}

export function logRequestContext(
  context: RequestContext,
  method: string,
  path: string,
  status: number
) {
  const duration = Date.now() - context.startTime;
  
  console.log(
    JSON.stringify({
      requestId: context.requestId,
      method,
      path,
      status,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    })
  );
}
