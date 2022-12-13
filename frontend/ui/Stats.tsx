import useSetting from '@/store/useSetting';
import useCollection from '@/store/useCollection';

const Stats = () => {
	const { solUsd } = useSetting();
	const { stats } = useCollection();

	return (
		<div className="grid md:grid-cols-2 xl:grid-cols-4 md:gap-4 md:space-y-0 space-y-4">
			<div className="bg-dark-800 rounded border border-dark-700 p-4 space-y-1">
				<h6 className="text-primary-100 uppercase font-semibold">Volume</h6>
				<div className="flex flex-row items-center justify-between">
					<span className="text-xl font-bold">{stats.volume.toLocaleString('en', { maximumFractionDigits: 3 })} SOL</span>
					<span className="text-sm text-green-300 font-semibold">${(stats.volume * solUsd).toLocaleString('en', { maximumFractionDigits: 2 })}</span>
				</div>
			</div>

			<div className="bg-dark-800 rounded border border-dark-700 p-4 space-y-1">
				<h6 className="text-primary-100 uppercase font-semibold">Royalty Paid</h6>
				<div className="flex flex-row items-center justify-between">
					<span className="text-xl font-bold">{stats.royalty_paid.toLocaleString('en', { maximumFractionDigits: 3 })} SOL</span>
					<span className="text-sm text-green-300 font-semibold">
						${(stats.royalty_paid * solUsd).toLocaleString('en', { maximumFractionDigits: 2 })}
					</span>
				</div>
			</div>

			<div className="bg-dark-800 rounded border border-dark-700 p-4 space-y-1">
				<h6 className="text-primary-100 uppercase font-semibold"># Sales</h6>
				<div className="flex flex-row items-center justify-between">
					<span className="text-xl font-bold">{stats.sales.toLocaleString('en')}</span>
					<span className="text-sm text-red-300 font-semibold">
						{(((stats.sales - stats.sales_paid) / stats.sales) * 100).toLocaleString('en', { maximumFractionDigits: 2 })}% Unpaid
					</span>
				</div>
			</div>

			<div className="bg-dark-800 rounded border border-dark-700 p-4 space-y-1">
				<h6 className="text-primary-100 uppercase font-semibold"># Sales Paid Royalty</h6>
				<div className="flex flex-row items-center justify-between">
					<span className="text-xl font-bold">{stats.sales_paid.toLocaleString('en')}</span>
					<span className="text-sm text-green-300 font-semibold">
						{((stats.sales_paid / stats.sales) * 100).toLocaleString('en', { maximumFractionDigits: 2 })}% Paid
					</span>
				</div>
			</div>
		</div>
	);
};

export default Stats;
