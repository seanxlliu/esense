import { type NextPage } from 'next';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import Router from 'next/router';
import { trpc } from '~/lib/hooks/trpc';

type AuthUser = { id: string; email?: string | null };

const Welcome = ({ user }: { user: AuthUser }) => {
    async function onSignout() {
        await signOut({ redirect: false });
        await Router.push('/signin');
    }
    return (
        <div className="flex gap-4">
            <h3 className="text-lg">Welcome back, {user?.email}</h3>
            <button className="text-gray-300 underline" onClick={() => void onSignout()}>
                Signout
            </button>
        </div>
    );
};

const SigninSignup = () => {
    return (
        <div className="flex gap-4 text-2xl">
            <Link href="/signin" className="rounded-lg border px-4 py-2">
                Signin
            </Link>
            <Link href="/signup" className="rounded-lg border px-4 py-2">
                Signup
            </Link>
        </div>
    );
};

const Home: NextPage = () => {
    const { data: session, status } = useSession();
    const ping = trpc.ping.useQuery({ text: 'ping' });

    if (status === 'loading') return <p>Loading ...</p>;
    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
            <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 text-white">
                <h1 className="text-5xl font-extrabold">eSense #_#</h1>
                <h2 className="text-2xl font-extrabold">Boost your sales and customer loyalty with AI-driven CRM solutions!</h2>

                {session?.user ? (
                    // welcome & blog posts
                    <div className="flex flex-col">
                        <Welcome user={session.user} />
                        <section className="mt-10">
                        </section>
                    </div>
                ) : (
                    // if not logged in
                    <SigninSignup />
                )}
                <div>
                    <p>{ping.data?.res || 'Loading...'}</p>
                </div>
            </div>
        </main>
    );
};

export default Home;