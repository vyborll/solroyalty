import type { CCSale } from '../../types';
import type { Job, JobsOptions } from 'bullmq';
import { Queue, Worker } from 'bullmq';
import { randomUUID } from 'crypto';
import moment from 'moment-timezone';

import config from '../../config.json';
import redis from '../../lib/redis';
import prisma from '../../lib/prisma';
import CoralCube from '../../lib/coral-cube';
import { addToQueue as addToBackfillQueue } from './sales-backfill-sync';

const LAMPORTS_PER_SOL = config['lamports-per-sol'];

type JobEvent = {
	symbol: string;
	update_authority: string;
};

export const queue = new Queue('sales-sync', {
	connection: redis.duplicate(),
	defaultJobOptions: {
		attempts: 10,
		backoff: 5000,
		removeOnComplete: true,
		removeOnFail: 50,
	},
});

export let worker: Worker | null;

if (config.workers['sales-sync'].enabled) {
	worker = new Worker(
		'sales-sync',
		async (job: Job<JobEvent>) => {
			const { symbol, update_authority } = job.data;

			const lastSale = await prisma.sale.findFirst({ where: { symbol }, orderBy: { created_at: 'desc' } });
			let hasNextPage = true;
			let before: string | undefined = undefined;
			let lastSaleSig: string | undefined = undefined;

			while (hasNextPage) {
				const sales = (await CoralCube.getSales(symbol, update_authority, 50, before)) as CCSale[];
				if (sales === undefined) return `could not fetch sales for ${symbol}`;
				if (sales === null) return `gateway timeout`;
				if (sales.length === 0) return 'no sales returned';
				if (sales[sales.length - 1].signature === lastSaleSig) return 'repeated sales';

				await prisma.token.createMany({
					data: sales.map((sale) => ({
						mint: sale.mint,
						name: sale.metadata.name,
						symbol,
						collection_symbol: sale.metadata.symbol,
						uri: sale.metadata.uri,
						seller_fee_basis_points: sale.metadata.seller_fee_basis_points,
					})),
					skipDuplicates: true,
				});

				await prisma.sale.createMany({
					data: sales.map((sale) => {
						const time = moment.utc(sale.time).toISOString();

						return {
							mint: sale.mint,
							signature: sale.signature,
							price: sale.price,
							sol: sale.price / LAMPORTS_PER_SOL,
							market_fee: sale.market_fee / LAMPORTS_PER_SOL,
							royalty_fee: sale.royalty_fee / LAMPORTS_PER_SOL,
							buyer: sale.buyer,
							seller: sale.seller,
							time,
							marketplace: sale.marketplace,
							symbol,
							created_at: time,
						};
					}),
					skipDuplicates: true,
				});

				await prisma.collection.update({
					where: { symbol },
					data: { royalty_fee: sales[0].metadata.seller_fee_basis_points || undefined },
				});

				if (!lastSale) {
					hasNextPage = false;
					break;
				}

				const exist = sales.find((x) => x.signature === lastSale.signature);
				if (exist) {
					hasNextPage = false;
					break;
				}

				before = moment(sales[sales.length - 1].time)
					.toISOString()
					.replace('Z', '');
				lastSaleSig = sales[sales.length - 1].signature;
			}

			const collection = await prisma.collection.findFirst({ where: { symbol } });
			if (collection && !collection.backfilled) {
				await addToBackfillQueue({ symbol, update_authority }, { jobId: `${symbol}:${update_authority}` });
			}
		},
		{
			connection: redis.duplicate(),
			concurrency: config.workers['sales-sync'].concurrency,
			limiter: {
				max: 1,
				duration: 2000,
			},
		},
	);
}

export const addToQueue = async (data: JobEvent, opts?: JobsOptions | undefined) => {
	await queue.add(randomUUID(), data, opts);
};
