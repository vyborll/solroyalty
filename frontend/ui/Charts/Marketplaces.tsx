import { useEffect, useRef, useState } from 'react';
import Highcharts from 'highcharts';
import HighchartsExporting from 'highcharts/modules/exporting';
import HighchartsReact from 'highcharts-react-official';

import useCollection from '@/store/useCollection';

if (typeof Highcharts === 'object') {
	HighchartsExporting(Highcharts);
}

const Marketplaces = () => {
	const { marketplacesChart } = useCollection();
	const chartComponentRef = useRef<HighchartsReact.RefObject>(null);
	const [options, setOptions] = useState<Highcharts.Options>({
		chart: { height: 350, backgroundColor: '#1a1a1a' },
		credits: { enabled: false },
		exporting: { enabled: false },
		title: { text: undefined },
		plotOptions: {
			pie: {
				dataLabels: {
					enabled: true,
					format: '<b>{point.name}</b> - {point.y} Sales',
				},
			},
		},
		series: [
			{
				type: 'pie',
				name: 'Marketplaces',
				colorByPoint: true,
				data: marketplacesChart.map((m) => m),
			},
		],
	});

	useEffect(() => {
		setOptions({
			...options,
			series: [
				{
					type: 'pie',
					name: 'Marketplaces',
					colorByPoint: true,
					data: marketplacesChart.map((m) => m),
				},
			],
		});
	}, [marketplacesChart]);

	return (
		<div className="space-y-6 rounded bg-dark-800 border border-dark-700 p-4">
			<div className="flex flex-row items-center justify-between">
				<div>
					<h3 className="text-xl font-bold">Marketplaces</h3>
					<p className="text-sm text-primary-100">{marketplacesChart.reduce((p, c) => p + c.y, 0)} sales</p>
				</div>
			</div>
			<HighchartsReact highcharts={Highcharts} options={options} ref={chartComponentRef} />
		</div>
	);
};

export default Marketplaces;
