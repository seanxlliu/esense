import { type AppType } from 'next/app';
import { type Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';
import { trpc } from '~lib/hooks/trpc';
import { CssVarsProvider } from '@mui/joy';
import '~styles/globals.css';

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps }
}) => {
  return (
    <SessionProvider session={session}>
      <CssVarsProvider defaultMode="system">
        <Component {...pageProps} />
      </CssVarsProvider>;
    </SessionProvider>
  );
};

export default trpc.withTRPC(MyApp);
