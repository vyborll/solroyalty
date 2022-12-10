import type { InferGetServerSidePropsType, NextPage } from 'next';
import React, { useEffect } from 'react';
import toast from 'react-hot-toast';
import moment from 'moment-timezone';

import useSetting from '@/store/useSetting';
import useCollection from '@/store/useCollection';
import usePagination from '@/store/usePagination';
import api from '@/utils/api';

import Layout from '@/ui/Layout';
import Collections from '@/ui/Dropdown/Collections';
import Filter from '@/ui/Dropdown/Filter';
import Overview from '@/ui/Overview';
import SalesChart from '@/ui/Charts/Sales';
import MarketplacesChart from '@/ui/Charts/Marketplaces';
import Pagination from '@/ui/Pagination';

const Home: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = ({
	collections,
	collection,
	stats,
	salesChart,
	marketplacesChart,
	sales,
	pagination,
}) => {
	const { collection: c, buyer, paid, setCollections } = useCollection();
	const { setPagination } = usePagination();

	useEffect(() => {
		setCollections({
			collections,
			collection,
			salesChart,
			marketplacesChart,
			sales,
			stats,
		});

		setPagination({ ...pagination });
	}, []);

	const onSearch = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		const res = await api.get('/collections/sales', {
			params: {
				symbol: c?.symbol,
				page: 1,
				...(paid === 'Paid' ? { paid: true } : paid === 'Unpaid' ? { paid: false } : undefined),
				...(buyer && buyer !== '' ? { buyer } : undefined),
			},
		});

		setCollections({ sales: res.data.sales });
		setPagination({ page: res.data.page, maxPages: res.data.maxPages });
	};

	const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setCollections({ ...collections, buyer: e.target.value });
	};

	return (
		<Layout>
			<Collections />

			{!c ? (
				<div className="border-b border-dark-700 space-y-2 pb-4">
					<div className="flex flex-row items-center space-x-4">
						<img className="h-20 w-20 rounded border border-dark-700 bg-dark-800" src={collection.image} />
						<div>
							<h1 className="text-xl font-bold">{collection.name}</h1>
							<div className="flex flex-row space-x-2">
								<span>{collection.royalty_fee}</span>
							</div>
						</div>
					</div>
					<div className="text-primary-100">{collection.description}</div>
				</div>
			) : (
				<div className="border-b border-dark-700 space-y-2 pb-4">
					<div className="flex flex-row items-center space-x-4">
						<img className="h-20 w-20 rounded border border-dark-700 bg-dark-800" src={c.image} />
						<div className="space-y-1">
							<h1 className="text-xl font-bold">{c.name}</h1>
							<div className="flex flex-row space-x-2">
								<span className="text-sm font-bold bg-blue-500 rounded px-3 py-0.5">
									{((c.royalty_fee || 0) / 10000).toLocaleString('en', { style: 'percent' })} Royalty
								</span>
							</div>
						</div>
					</div>
					<div className="text-primary-100">{c.description}</div>
				</div>
			)}

			<Overview />

			<div className="grid md:grid-cols-2 gap-0 md:gap-4 space-y-4 md:space-y-0">
				<div>
					<SalesChart />
				</div>
				<div>
					<MarketplacesChart />
				</div>
			</div>

			<div className="space-y-4">
				<div className="flex flex-row items-center justify-between">
					<h1 className="text-xl font-bold">Sales History</h1>
					<div className="flex flex-row items-center space-x-4">
						<form className="space-x-4" onSubmit={onSearch}>
							<input
								className="h-[35px] bg-dark-700 rounded px-3 focus:outline-none"
								placeholder="Search Buyer..."
								value={buyer}
								onChange={onInputChange}
							/>
						</form>
						<Filter />
					</div>
				</div>
				<SalesTable />
			</div>
		</Layout>
	);
};

const SalesTable = () => {
	const { solUsd } = useSetting();
	const { sales } = useCollection();

	const copyToClipboard = (text: string): void => {
		navigator.clipboard.writeText(text);
		toast.success('Copied address to clipboard', {
			duration: 2000,
			position: 'top-right',
			style: {
				background: '#2b2b2b',
				color: '#fff',
			},
		});
	};

	return (
		<>
			<div className="overflow-x-auto rounded border border-dark-700">
				<table className="min-w-full">
					<thead className="bg-dark-800 border-b border-dark-700">
						<tr>
							<th scope="col" className="whitespace-nowrap px-6 py-3 text-left font-bold uppercase text-sm tracking-wide">
								NFT
							</th>
							<th scope="col" className="whitespace-nowrap px-6 py-3 text-left font-bold uppercase text-sm tracking-wide">
								Royalty
							</th>
							<th scope="col" className="whitespace-nowrap px-6 py-3 text-left font-bold uppercase text-sm tracking-wide">
								Price
							</th>
							<th scope="col" className="whitespace-nowrap px-6 py-3 text-left font-bold uppercase text-sm tracking-wide">
								Buyer
							</th>
							<th scope="col" className="whitespace-nowrap px-6 py-3 text-left font-bold uppercase text-sm tracking-wide">
								Seller
							</th>
							<th scope="col" className="whitespace-nowrap px-6 py-3 text-left font-bold uppercase text-sm tracking-wide">
								Date
							</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-dark-700">
						{sales.map((sale, i) => (
							<tr key={i} className="hover:bg-dark-800">
								<td className="whitespace-nowrap px-6 py-3">
									<div className="flex flex-row items-center space-x-4">
										<div>
											<p className="text-sm font-semibold">{sale.token.name}</p>
											<p className="text-sm text-primary-100">{sale.marketplace}</p>
										</div>
									</div>
								</td>

								<td className="whitespace-nowrap px-6 py-3">
									{sale.royalty_fee > 0 ? (
										<div>
											<p className="text-sm font-semibold">{sale.royalty_fee} SOL</p>
											<p className="text-sm text-green-400 font-bold uppercase">Paid</p>
										</div>
									) : (
										<div>
											<p className="text-sm font-semibold">{sale.royalty_fee} SOL</p>
											<p className="text-sm text-red-400 font-bold uppercase">Unpaid</p>
										</div>
									)}
								</td>

								<td className="whitespace-nowrap px-6 py-3">
									<div>
										<span className="text-sm font-semibold">{sale.sol.toLocaleString('en', { maximumFractionDigits: 3 })} SOL</span>
									</div>
									<div>
										<span className="text-green-300 text-sm font-medium">
											${(sale.sol * solUsd).toLocaleString('en', { maximumFractionDigits: 2 })}
										</span>
									</div>
								</td>

								<td className="whitespace-nowrap px-6 py-3">
									<div className="has-tooltip cursor-pointer" onClick={() => copyToClipboard(sale.buyer)}>
										<span className="tooltip rounded text-center translate-x-[-40%] bg-dark-700 border border-dark-600 -mt-12 p-2 shadow-lg">
											{sale.buyer}
										</span>
										<p className="text-sm font-semibold">
											{sale.buyer.slice(0, 6)}...{sale.buyer.slice(-6)}
										</p>
									</div>
								</td>

								<td className="whitespace-nowrap px-6 py-3">
									<div className="has-tooltip cursor-pointer" onClick={() => copyToClipboard(sale.seller)}>
										<span className="tooltip rounded text-center translate-x-[-40%] bg-dark-700 border border-dark-600 -mt-12 p-2 shadow-lg">
											{sale.seller}
										</span>
										<p className="text-sm v">
											{sale.seller.slice(0, 6)}...{sale.seller.slice(-6)}
										</p>
									</div>
								</td>

								<td className="whitespace-nowrap px-6 py-3">
									<p className="text-sm">{moment.utc(sale.time).fromNow()}</p>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
			<Pagination />
		</>
	);
};

export const getServerSideProps = async () => {
	const collections = await api.get('/collections');
	const collection = collections.data.collections[0];
	const overview = await api.get('/collections/overview', { params: { symbol: collection.symbol, period: '7d' } });
	const sales = await api.get('/collections/sales', { params: { symbol: collection.symbol, page: 1 } });

	return {
		props: {
			collections: collections.data.collections,
			collection,
			stats: overview.data.stats,
			salesChart: overview.data.sales,
			marketplacesChart: overview.data.marketplaces,
			sales: sales.data.sales,
			pagination: { page: sales.data.page, maxPages: sales.data.maxPages },
		},
	};
};

export default Home;
