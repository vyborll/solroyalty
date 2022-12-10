import useSetting from '@/store/useSetting';
import useCollection from '@/store/useCollection';

const Overview = () => {
	const { solUsd } = useSetting();
	const { stats, chartPeriod } = useCollection();

	return (
		<div className="grid md:grid-cols-2 xl:grid-cols-4 md:gap-4 md:space-y-0 space-y-4">
			<div className="bg-dark-800 rounded border border-dark-700 p-4 space-y-1">
				<h6 className="text-primary-100 uppercase font-semibold">{chartPeriod} Sales</h6>
				<div className="flex flex-row items-center justify-between">
					<span className="text-xl font-bold">{stats.sales.toLocaleString()}</span>
				</div>
			</div>

			<div className="bg-dark-800 rounded border border-dark-700 p-4 space-y-1">
				<h6 className="text-primary-100 uppercase font-semibold">{chartPeriod} Volume</h6>
				<div className="flex flex-row items-center justify-between">
					<span className="text-xl font-bold">{stats.volume.toLocaleString('en', { maximumFractionDigits: 3 })}</span>
					<span className="text-sm text-green-300 font-semibold">${(stats.volume * solUsd).toLocaleString('en', { maximumFractionDigits: 2 })}</span>
				</div>
			</div>

			<div className="bg-dark-800 rounded border border-dark-700 p-4 space-y-1">
				<h6 className="text-primary-100 uppercase font-semibold">{chartPeriod} Paid Royalty</h6>
				<div className="flex flex-row items-center justify-between">
					<span className="text-xl font-bold">{stats.paid.toLocaleString('en', { maximumFractionDigits: 3 })} SOL</span>
					<span className="text-sm text-green-300 font-semibold">${(stats.paid * solUsd).toLocaleString('en', { maximumFractionDigits: 2 })}</span>
				</div>
			</div>

			<div className="bg-dark-800 rounded border border-dark-700 p-4 space-y-1">
				<h6 className="text-primary-100 uppercase font-semibold">{chartPeriod} Unpaid Royalty</h6>
				<div className="flex flex-row items-center justify-between">
					<span className="text-xl font-bold">{stats.unpaid.toLocaleString('en', { maximumFractionDigits: 3 })} SOL</span>
					<span className="text-sm text-red-300 font-semibold">-${(stats.unpaid * solUsd).toLocaleString('en', { maximumFractionDigits: 2 })}</span>
				</div>
			</div>
		</div>
	);
};

export default Overview;
