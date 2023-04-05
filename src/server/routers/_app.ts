import { z } from 'zod';
import { procedure, router } from '../trpc';

export const appRouter = router({
  ping: procedure
    .input(
      z.object({
        text: z.string(),
      }),
    )
    .query(({ input }) => {
      return {
        res: input.text === 'ping' ? new Date().toLocaleTimeString() : 'err',
      };
    }),
});

// export type definition of API
export type AppRouter = typeof appRouter;