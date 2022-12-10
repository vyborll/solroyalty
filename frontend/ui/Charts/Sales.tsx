import { useEffect, useRef, useState } from 'react';
import Highcharts from 'highcharts';
import HighchartsExporting from 'highcharts/modules/exporting';
import HighchartsReact from 'highcharts-react-official';
import moment from 'moment-timezone';

import useCollection from '@/store/useCollection';

import TimePeriod from '@/ui/TimePeriod';

if (typeof Highcharts === 'object') {
	HighchartsExporting(Highcharts);
}

const Sales = () => {
	const { chartPeriod, salesChart } = useCollection();
	const chartComponentRef = useRef<HighchartsReact.RefObject>(null);
	const [options, setOptions] = useState<Highcharts.Options>({
		chart: { type: 'scatter', backgroundColor: '#1a1a1a', height: 350 },
		boost: { useGPUTranslations: true, usePreallocated: true },
		credits: { enabled: false },
		exporting: { enabled: false },
		title: { text: undefined },
		xAxis: {
			type: 'datetime',
			max: moment.utc().valueOf(),
			tickInterval: chartPeriod === '1d' ? 1 * 3600 * 1000 : chartPeriod === '3d' ? 6 * 3600 * 1000 : 24 * 3600 * 1000,
			lineColor: '#2b2b2b',
			gridLineColor: '#2b2b2b',
		},
		yAxis: {
			type: 'logarithmic',
			endOnTick: true,
			title: { text: undefined },
			lineColor: '#2b2b2b',
			gridLineColor: '#2b2b2b',
		},
		legend: { itemStyle: { color: '#fff' }, itemHoverStyle: { color: '#fff' } },
		tooltip: {
			useHTML: true,
			borderColor: '#0bf894',
			backgroundColor: 'rgba(26, 26, 26, 0.9)',
			style: { color: '#fff' },
			formatter: function (this: Highcharts.TooltipFormatterContextObject) {
				return `
        <div style="color: #0bf894; font-weight: 600; margin-bottom: 10px;">
        ${moment.utc(this.point.x).format('lll')} (UTC)
        </div>
        <div style="display: flex; flex-direction: column; flex: 1;">
          <div>
            ${
							(this.point as any).token?.royalty_fee > 0
								? '<span style="color: #0bf894;">Paid Royalty</span>'
								: '<span style="color: #f87171;">Unpaid Royalty</span>'
						}
          </div>
          <div>
            Name: ${(this.point as any).token?.name}
          </div>
          <div>
            Marketplace: ${(this.point as any).token?.marketplace}
          </div>
          <div>
            Price: ${this.point.y?.toLocaleString('en', { maximumFractionDigits: 3 })} SOL
          </div>
          <div>
            Royalty Fee: ${(this.point as any).token?.royalty_fee.toLocaleString('en', { maximumFractionDigits: 3 })} SOL
          </div>
					<div>
						Buyer: ${(this.point as any).token?.buyer}
					</div>
        </div>
        `;
			},
		},
		series: [
			{
				type: 'scatter',
				name: 'Paid Royalty',
				color: '#0bf894',
				marker: { color: '#0bf894', symbol: 'diamond' },
				data: salesChart.filter((x) => x.token.royalty_fee > 0),
				turboThreshold: 0,
			},
			{
				type: 'scatter',
				name: 'Unpaid Royalty',
				color: '#f87171',
				marker: { color: '#f87171', symbol: 'circle' },
				data: salesChart.filter((x) => x.token.royalty_fee === 0),
				turboThreshold: 0,
			},
		],
	});

	useEffect(() => {
		setOptions({
			...options,
			series: [
				{
					type: 'scatter',
					name: 'Paid Royalty',
					color: '#0bf894',
					marker: { color: '#0bf894', symbol: 'diamond' },
					data: salesChart.filter((x) => x.token.royalty_fee > 0),
					turboThreshold: 0,
				},
				{
					type: 'scatter',
					name: 'Unpaid Royalty',
					color: '#f87171',
					marker: { color: '#f87171', symbol: 'circle' },
					data: salesChart.filter((x) => x.token.royalty_fee === 0),
					turboThreshold: 0,
				},
			],
		});
	}, [salesChart]);

	return (
		<div className="space-y-6 rounded bg-dark-800 border border-dark-700 p-4">
			<div className="flex flex-row items-center justify-between">
				<div>
					<h3 className="text-xl font-bold">Sales</h3>
					<p className="text-sm text-primary-100">{salesChart.length} sales</p>
				</div>
				<div>
					<TimePeriod />
				</div>
			</div>
			<HighchartsReact highcharts={Highcharts} options={options} ref={chartComponentRef} />
		</div>
	);
};

export default Sales;
