import { FC, ReactNode } from 'react';
import Head from 'next/head';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

interface AppLayoutProps {
  children: ReactNode;
}

export const AppLayout: FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-900">
      <Head>
        <title>LockdIn</title>
        <meta name="description" content="Decentralized Task Management on Solana" />
      </Head>

      {/* Navigation */}
      <nav className="bg-slate-800 p-4 shadow-lg">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="text-3xl font-bold text-white">
              Lock<span className="text-blue-500">d</span>In
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <WalletMultiButton />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-gray-400 py-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p>Built on Solana</p>
        </div>
      </footer>
    </div>
  );
};