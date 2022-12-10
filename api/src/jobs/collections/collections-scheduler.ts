import { Job, scheduleJob } from 'node-schedule';

import config from '../../config.json';
import prisma from '../../lib/prisma';
import MagicEden from '../../lib/magic-eden';

export default class CollectionsScheduler {
	private job: Job;

	public loading = false;

	constructor() {
		this.run = this.run.bind(this);
		this.job = scheduleJob(config.schedulers['collections-scheduler'].rule, this.run);
	}

	async run() {
		if (this.loading) return;
		this.loading = true;

		try {
			const collections = await MagicEden.getCollections(0, 200);

			await prisma.collection.createMany({
				data: collections.map((collection) => ({
					track: collection.isBadged ? true : false,
					symbol: collection.symbol,
					image: collection.image || '',
					name: collection.name || '',
					description: collection.description || '',
					twitter: collection.twitter || '',
					discord: collection.discord || '',
					website: collection.website || '',
				})),
				skipDuplicates: true,
			});
		} catch (err) {
			console.error(`failed to schedule collections`, err);
		} finally {
			this.loading = false;
		}
	}
}
