import { z } from 'zod';
import { insertTrekSchema, treks, itineraryDays } from './schema';

export const errorSchemas = {
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  treks: {
    list: {
      method: 'GET' as const,
      path: '/api/treks',
      responses: {
        200: z.array(z.custom<typeof treks.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/treks/:id',
      responses: {
        200: z.custom<typeof treks.$inferSelect & { itinerary: typeof itineraryDays.$inferSelect[] }>(),
        404: errorSchemas.notFound,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
