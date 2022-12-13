import type { Collection } from '../../types';
import { Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

import useCollection from '@/store/useCollection';
import usePagination from '@/store/usePagination';
import api from '@/utils/api';

const Collections = () => {
	const { collections, collection, chartPeriod, paid, setCollections } = useCollection();
	const { setPagination } = usePagination();

	const onChangeCollection = async (c: Collection) => {
		const overview = await api.get('/collections/overview', { params: { symbol: c.symbol, period: chartPeriod } });
		const stats = await api.get('/collections/stats', { params: { symbol: c.symbol } });
		const sales = await api.get('/collections/sales', {
			params: { symbol: c.symbol, page: 1, ...(paid === 'Paid' ? { paid: true } : paid === 'Unpaid' ? { paid: false } : undefined) },
		});
		setCollections({
			collection: c,
			buyer: '',
			stats: stats.data.stats,
			overview: overview.data.stats,
			salesChart: overview.data.sales,
			marketplacesChart: overview.data.marketplaces,
			sales: sales.data.sales,
		});

		setPagination({
			page: sales.data.page,
			maxPages: sales.data.maxPages,
		});
	};

	return collection ? (
		<div className="w-52">
			<Listbox value={collection} onChange={onChangeCollection}>
				<div className="relative mt-1">
					<Listbox.Button className="relative w-full cursor-default rounded bg-dark-700 py-2 pl-3 pr-10 text-left shadow-md focus:outline-none sm:text-sm">
						<span className="block truncate font-bold">{collection.name}</span>
						<span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
							<ChevronDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
						</span>
					</Listbox.Button>
					<Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
						<Listbox.Options className="z-10 absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-dark-700 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
							{collections.map((collection, idx) => (
								<Listbox.Option
									key={idx}
									className={({ active }) => `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-dark-600' : 'text-white'}`}
									value={collection}
								>
									{({ selected }) => (
										<>
											<span className={`block truncate ${selected ? 'font-medium text-white' : 'font-normal text-primary-100'}`}>
												{collection.name}
											</span>
											{selected ? (
												<span className="absolute inset-y-0 left-0 flex items-center pl-3 text-white">
													<CheckIcon className="h-5 w-5" aria-hidden="true" />
												</span>
											) : null}
										</>
									)}
								</Listbox.Option>
							))}
						</Listbox.Options>
					</Transition>
				</div>
			</Listbox>
		</div>
	) : null;
};

export default Collections;
