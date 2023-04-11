import { createChromeHandler } from 'trpc-chrome/adapter';
import { chromeLink } from 'trpc-chrome/link';
import { type AppRouter, appRouter } from '~server/routers/_app';
import { createTRPCNext } from '@trpc/next';





createChromeHandler({ router: appRouter });
const port = chrome.runtime.connect();
export const trpc = createTRPCNext<AppRouter>({
  config({ ctx }) {
    return {
      links: [chromeLink({ port })],
    };
  },
  /**
   * @link https://trpc.io/docs/ssr
   * */
  ssr: false,
});


