import { z } from 'zod';

export function validateRequest<T extends z.ZodType>(
  schema: T,
  data: unknown
): { success: true; data: z.infer<T> } | { success: false; error: string } {
  const result = schema.safeParse(data);
  
  if (!result.success) {
    const errors = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
    return { success: false, error: errors.join(', ') };
  }
  
  return { success: true, data: result.data };
}

export function validateBody<T extends z.ZodType>(
  schema: T,
  body: unknown
): { success: true; data: z.infer<T> } | { success: false; error: string; status: number } {
  const result = schema.safeParse(body);
  
  if (!result.success) {
    const errors = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
    return { success: false, error: errors.join(', '), status: 400 };
  }
  
  return { success: true, data: result.data };
}

export function validateQuery<T extends z.ZodType>(
  schema: T,
  query: unknown
): { success: true; data: z.infer<T> } | { success: false; error: string; status: number } {
  const result = schema.safeParse(query);
  
  if (!result.success) {
    const errors = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
    return { success: false, error: errors.join(', '), status: 400 };
  }
  
  return { success: true, data: result.data };
}
