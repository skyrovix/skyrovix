import { createMiddleware } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';
import { verifyJwtToken } from '@/lib/mysql-auth.server';
import { supabase } from './client';

export const requireSupabaseAuth = createMiddleware({ type: 'function' }).server(
  async ({ next }) => {
    const request = getRequest();

    if (!request?.headers) {
      throw new Error('Unauthorized: No request headers available');
    }

    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Unauthorized: No bearer token provided');
    }

    const token = authHeader.replace('Bearer ', '').trim();
    const claims = verifyJwtToken(token);
    if (!claims || !claims.sub) {
      throw new Error('Unauthorized: Invalid or expired token');
    }

    return next({
      context: {
        supabase,
        userId: claims.sub,
        claims,
      },
    });
  },
);
