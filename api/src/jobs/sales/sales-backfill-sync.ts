import type { Job, JobsOptions } from 'bullmq';
import { Queue, Worker } from 'bullmq';
import { randomUUID } from 'crypto';
import moment from 'moment-timezone';

import config from '../../config.json';
import redis from '../../lib/redis';
import prisma from '../../lib/prisma';
import wait from '../../utils/wait';
import CoralCube from '../../lib/coral-cube';

const LAMPORTS_PER_SOL = config['lamports-per-sol'];

type JobBackfill = {
	symbol: string;
	update_authority: string;
};

export const queue = new Queue('sales-backfill-sync', {
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
		'sales-backfill-sync',
		async (job: Job<JobBackfill>) => {
			const { symbol, update_authority } = job.data;

			const collection = await prisma.collection.findUnique({ where: { symbol } });
			if (collection && collection.backfilled) return 'collection is already backfilled';

			const oldestSale = await prisma.sale.findFirst({
				where: { symbol },
				orderBy: { created_at: 'asc' },
			});

			let hasNextPage: boolean = true;
			let before: string | undefined = oldestSale ? moment.utc(oldestSale.created_at).toISOString().replace('Z', '') : undefined;
			let lastSaleSig: string | undefined = undefined;
			const limit: number = 50;

			while (hasNextPage) {
				const sales = await CoralCube.getSales(symbol, update_authority, limit, before);
				if (sales === null) {
					hasNextPage = false;
					break;
				}

				if (sales === undefined) {
					hasNextPage = false;
					break;
				}

				if (sales.length === 0) {
					await prisma.collection.update({ where: { symbol }, data: { backfilled: true } });
					hasNextPage = false;
					break;
				}

				if (sales[sales.length - 1].signature === lastSaleSig) {
					await prisma.collection.update({ where: { symbol }, data: { backfilled: true } });
					hasNextPage = false;
					break;
				}

				await prisma.token.createMany({
					data: sales.map((sale) => ({
						mint: sale.mint,
						collection_symbol: sale.metadata.symbol,
						name: sale.metadata.name,
						symbol,
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
							time: sale.time,
							marketplace: sale.marketplace,
							symbol,
							created_at: time,
						};
					}),
					skipDuplicates: true,
				});

				if (moment(sales[sales.length - 1].time).diff(moment(), 'days') > 14) {
					await prisma.collection.update({
						where: { symbol },
						data: { backfilled: true, royalty_fee: sales[0].metadata.seller_fee_basis_points || undefined },
					});

					hasNextPage = false;
					break;
				} else {
					await prisma.collection.update({
						where: { symbol },
						data: { royalty_fee: sales[0].metadata.seller_fee_basis_points || undefined },
					});
				}

				const lastSaleTime = sales[sales.length - 1].time;
				before = moment.utc(lastSaleTime).toISOString().replace('Z', '');
				await wait(1500);
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

	worker.on('error', (err) => console.error(`sales-backfill-sync`, err));
}

export const addToQueue = async (data: JobBackfill, opts?: JobsOptions | undefined) => {
	await queue.add(randomUUID(), data, opts);
};
