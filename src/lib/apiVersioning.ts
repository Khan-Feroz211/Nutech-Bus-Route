import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function apiVersioning(req: NextRequest) {
  const url = req.nextUrl.clone();
  
  const apiPrefix = '/api';
  const currentVersion = 'v1';
  
  if (url.pathname.startsWith(`${apiPrefix}/`)) {
    const pathParts = url.pathname.split('/');
    
    if (pathParts[2] && !pathParts[2].startsWith('v')) {
      const versionedPath = [
        apiPrefix,
        currentVersion,
        ...pathParts.slice(2)
      ].join('/');
      
      url.pathname = versionedPath;
      
      const response = NextResponse.redirect(url);
      response.headers.set('API-Version', currentVersion);
      response.headers.set('Deprecation', 'true');
      response.headers.set('Sunset', 'Sat, 01 Jan 2025 00:00:00 GMT');
      
      return response;
    }
    
    if (pathParts[2]?.startsWith('v')) {
      const response = NextResponse.next();
      response.headers.set('API-Version', pathParts[2]);
      return response;
    }
  }
  
  return NextResponse.next();
}

export const apiVersions = {
  v1: {
    deprecated: false,
    sunset: null,
    docs: 'https://docs.nutech.edu.pk/api/v1',
  },
} as const;

export type ApiVersion = keyof typeof apiVersions;
