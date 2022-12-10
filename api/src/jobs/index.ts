import './collections';
import './sales';

import * as CollectionsSync from './collections/collections-sync';
import * as SalesBackfillSync from './sales/sales-backfill-sync';
import * as SalesSync from './sales/sales-sync';

export const jobs = {
	CollectionsSync,
	SalesBackfillSync,
	SalesSync,
};

export const queues = Object.values(jobs).map(({ queue }) => queue);
