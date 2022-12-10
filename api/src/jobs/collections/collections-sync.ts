import type { Job, JobsOptions } from 'bullmq';
import { Queue, Worker } from 'bullmq';
import { randomUUID } from 'crypto';

import config from '../../config.json';
import prisma from '../../lib/prisma';
import redis from '../../lib/redis';
import wait from '../../utils/wait';
import MagicEden from '../../lib/magic-eden';
import { addToQueue as addToSalesQueue } from '../sales/sales-sync';

type JobCollection = {
	symbol: string;
};

export const queue = new Queue('collections-sync', {
	connection: redis.duplicate(),
	defaultJobOptions: {
		attempts: 3,
		backoff: 5000,
		removeOnComplete: 25,
		removeOnFail: 50,
	},
});

export let worker: Worker | null;

if (config.workers['collections-sync'].enabled) {
	worker = new Worker(
		'collections-sync',
		async (job: Job<JobCollection>) => {
			const { symbol } = job.data;

			const exist = await prisma.collection.findUnique({ where: { symbol } });

			if (!exist) {
				const collection = await MagicEden.getCollection(symbol);
				if (!collection) return 'collection does not exist';

				const tokens = await MagicEden.getActivity(symbol, 'list');
				if (tokens === null) return 'err getting tokens from me';
				if (tokens.length === 0) return 'no tokens';

				const mint = tokens[0].tokenMint;
				if (!mint) throw 'no tokenMint returned';

				const token = await MagicEden.getToken(mint);
				if (!token) throw 'no token returned';

				const update_authority = token.updateAuthority;

				await prisma.collection.update({
					where: { symbol: collection.symbol },
					data: { update_authority },
				});

				await addToSalesQueue({ symbol: collection.symbol, update_authority }, { jobId: `${collection.symbol}:${update_authority}` });
				return wait(2500);
			} else {
				if (!exist.update_authority) {
					const tokens = await MagicEden.getActivity(symbol, 'list');
					if (tokens === null) return 'error getting tokens from me';
					if (tokens.length === 0) return 'no tokens';

					const mint = tokens[0].tokenMint;
					if (!mint) return 'no tokenMint returned';

					const token = await MagicEden.getToken(mint);
					if (!token) return 'no token returned';

					await prisma.collection.update({
						where: { symbol },
						data: {
							track: true,
							update_authority: token.updateAuthority,
						},
					});

					await addToSalesQueue(
						{
							symbol,
							update_authority: token.updateAuthority,
						},
						{
							jobId: `${symbol}:${token.updateAuthority}`,
						},
					);
				} else {
					await addToSalesQueue(
						{
							symbol,
							update_authority: exist.update_authority,
						},
						{
							jobId: `${symbol}:${exist.update_authority}`,
						},
					);
				}
			}
		},
		{
			connection: redis.duplicate(),
			concurrency: config.workers['collections-sync'].concurrency,
			limiter: {
				max: 20,
				duration: 65000,
			},
		},
	);
}

export const addToQueue = async (job: JobCollection, opts?: JobsOptions | undefined) => {
	await queue.add(randomUUID(), job, opts);
};
