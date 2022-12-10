import type { PaidType } from '../../types';
import type { AxiosRequestConfig } from 'axios';
import { Fragment, useState } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

import useCollection from '@/store/useCollection';
import usePagination from '@/store/usePagination';
import api from '@/utils/api';

const filters: PaidType[] = ['All', 'Paid', 'Unpaid'];

const Filter = () => {
	const [selected, setSelected] = useState(filters[0]);
	const { collection, buyer, setCollections } = useCollection();
	const { setPagination } = usePagination();

	const onChangeFilter = async (filter: PaidType) => {
		const config: AxiosRequestConfig = {
			params: {
				symbol: collection?.symbol,
				page: 1,
				...(filter === 'Paid' ? { paid: true } : filter === 'Unpaid' ? { paid: false } : undefined),
				...(buyer && buyer !== '' ? { buyer } : undefined),
			},
		};

		const sales = await api.get('/collections/sales', config);
		setCollections({ sales: sales.data.sales, paid: filter });
		setPagination({ page: sales.data.page, maxPages: sales.data.maxPages });
		setSelected(filter);
	};

	return (
		<div className="w-36">
			<Listbox value={selected} onChange={onChangeFilter}>
				<div className="relative">
					<Listbox.Button className="relative w-full cursor-default rounded bg-dark-700 h-[35px] pl-3 pr-10 text-left shadow-md focus:outline-none sm:text-sm">
						<span className="block truncate font-bold">{selected}</span>
						<span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
							<ChevronDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
						</span>
					</Listbox.Button>
					<Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
						<Listbox.Options className="z-10 absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-dark-700 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
							{filters.map((filter, idx) => (
								<Listbox.Option
									key={idx}
									className={({ active }) => `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-dark-600' : 'text-white'}`}
									value={filter}
								>
									{({ selected }) => (
										<>
											<span className={`block truncate ${selected ? 'font-medium text-white' : 'font-normal text-primary-100'}`}>{filter}</span>
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
	);
};

export default Filter;
