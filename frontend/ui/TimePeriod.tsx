import { Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

import useCollection from '@/store/useCollection';
import api from '@/utils/api';

const TimePeriod = () => {
	const { collection, periods, chartPeriod, setCollections } = useCollection();

	const onChangePeriod = async (period: typeof periods[number]) => {
		try {
			const overview = await api.get('/collections/overview', { params: { symbol: collection?.symbol, period } });

			setCollections({
				overview: overview.data.stats,
				salesChart: overview.data.sales,
				marketplacesChart: overview.data.marketplaces,
				chartPeriod: period,
			});
		} catch (err) {
			console.error(err);
		}

		setCollections({ chartPeriod: period });
	};

	return (
		<div className="w-24">
			<Listbox value={chartPeriod} onChange={onChangePeriod}>
				<div className="relative mt-1">
					<Listbox.Button className="relative w-full cursor-default rounded bg-dark-900 border border-dark-700 py-2 pl-3 pr-10 text-left shadow-md focus:outline-none sm:text-sm">
						<span className="block truncate">{chartPeriod}</span>
						<span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
							<ChevronDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
						</span>
					</Listbox.Button>
					<Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
						<Listbox.Options className="z-10 absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-dark-900 border border-dark-700 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
							{periods.map((period, idx) => (
								<Listbox.Option
									key={idx}
									className={({ active }) => `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'text-white' : 'text-primary-100'}`}
									value={period}
								>
									{({ selected }) => (
										<>
											<span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>{period}</span>
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

export default TimePeriod;
