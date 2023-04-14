import { z } from 'zod';
import { procedure, router } from '../trpc';
import { ChatMessage, chat } from '~server/aiengine';

export const appRouter = router({
  ping: procedure
    .input(
      z.object({
        text: z.string()
      })
    )
    .query(({ input }) => {
      return {
        res: input.text === 'ping' ? new Date().toLocaleTimeString() : 'err'
      };
    }),
  chat: procedure
    .input(
      z.object({
        messages: z.array(
          z.object({
            role: z.string(),
            content: z.string()
          })
        )
      })
    )
    .query(async ({ input }) => {
      const messages = input.messages.map((message) => ({
        role: message.role,
        content: message.content
      } as ChatMessage));
      return {
        message: await chat(messages)
      }
    })
});

// export type definition of API
export type AppRouter = typeof appRouter;
