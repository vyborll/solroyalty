import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import axios from 'axios';

import useSetting from '@/store/useSetting';

import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
	const { setSolUsd } = useSetting();

	useEffect(() => {
		const getSolUsd = async () => {
			const res = await axios.get<{ solana: { usd: number } }>('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
			setSolUsd(res.data.solana.usd);
		};

		getSolUsd().catch((err) => console.error(err));
	}, []);

	return (
		<>
			<Head>
				<title>SOL Royalty | Solana Royalty Tracker</title>
				<meta name="description" content="Solana Royalty Tracker" />
			</Head>
			<Component {...pageProps} />
			<Toaster />
		</>
	);
}
