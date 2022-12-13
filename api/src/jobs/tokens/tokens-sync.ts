import type { Job, JobsOptions } from 'bullmq';
import { Queue, Worker } from 'bullmq';
import { randomUUID } from 'crypto';
import axios from 'axios';

import config from '../../config.json';
import redis from '../../lib/redis';
import prisma from '../../lib/prisma';
import { fetch } from '../../lib/ipfs';

type JobToken = {
	mint: string;
	uri: string;
};

export const queue = new Queue('tokens-sync', {
	connection: redis.duplicate(),
	defaultJobOptions: {
		attempts: 10,
		backoff: {
			type: 'exponential',
			delay: 5000,
		},
		removeOnComplete: true,
		removeOnFail: 50,
	},
});

export let worker: Worker | null;

if (config.workers['tokens-sync'].enabled) {
	worker = new Worker(
		'tokens-sync',
		async (job: Job<JobToken>) => {
			const { mint, uri } = job.data;

			try {
				const token = await prisma.token.findUnique({ where: { mint } });
				if (token && token.image) return true;

				const { image } = await fetch(uri);

				if (image) {
					await prisma.token.update({
						where: { mint },
						data: {
							image,
						},
					});
				}
			} catch (err) {
				console.error(`tokens-sync, error trying to fetch token uri, ${mint}`);
				throw err;
			}
		},
		{
			connection: redis.duplicate(),
			concurrency: config.workers['tokens-sync'].concurrency,
			limiter: {
				max: 175,
				duration: 60000,
			},
		},
	);
}

export const addToQueue = async (data: JobToken, opts?: JobsOptions) => {
	await queue.add(randomUUID(), data, opts);
};
