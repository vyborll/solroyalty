import { Job, scheduleJob } from 'node-schedule';

import config from '../../config.json';
import prisma from '../../lib/prisma';
import { addToQueue as addToCollectionQueue } from '../collections/collections-sync';
import { addToQueue as addToSalesQueue } from './sales-sync';

export default class SalesScheduler {
	private job: Job;

	public loading = false;

	constructor() {
		this.run = this.run.bind(this);
		this.job = scheduleJob(config.schedulers['sales-scheduler'].rule, this.run);
	}

	stop() {
		this.job.cancel();
	}

	async run() {
		if (this.loading) return;
		this.loading = true;

		try {
			const collections = await prisma.collection.findMany({ where: { track: true } });

			for (const collection of collections) {
				if (!collection.update_authority) {
					await addToCollectionQueue({ symbol: collection.symbol }, { jobId: collection.symbol });
					continue;
				}

				await addToSalesQueue(
					{ symbol: collection.symbol, update_authority: collection.update_authority },
					{ jobId: `${collection.symbol}:${collection.update_authority}` },
				);
			}
		} catch (err) {
			console.error(`Failed to schedule sales`, err);
		} finally {
			this.loading = false;
		}
	}
}
