import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";
import type { AppProps } from "next/app";
import Head from "next/head";

import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  BackpackWalletAdapter,
} from "@solana/wallet-adapter-wallets";

import "tailwindcss/tailwind.css";
import "@solana/wallet-adapter-react-ui/styles.css";
import "../styles/globals.css";
import { useMemo } from "react";

export default function App({ Component, pageProps }: AppProps) {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new BackpackWalletAdapter(),
    ],
    []
  );

  return (
    <>
      <Head>
        <title>LockdIn</title>
        <meta name="description" content="Manage your tasks on Solana" />
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/favicon.svg" />
      </Head>

      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <div className="min-h-screen bg-black">
            <Component {...pageProps} />
          </div>
        </WalletModalProvider>
      </WalletProvider>
    </>
  );
}