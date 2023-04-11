import { type NextPage } from "next"
import { trpc } from "~lib/hooks/trpc"

import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";


const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <Component {...pageProps} />
    </SessionProvider>
  );
};

trpc.withTRPC(MyApp);

const Home: NextPage = () => {
  const ping = trpc.ping.useQuery({ text: 'ping' });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        padding: 16
      }}>
      <h1>
        Welcome to eSense alpha!
      </h1>
      <div>
        <p>{ping.data?.res || 'Loading...'}</p>
      </div>
    </div>
  )
}

function IndexPopup() {
  return (<Home />)
}

export default IndexPopup
