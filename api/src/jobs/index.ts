import './collections';
import './sales';
import './tokens';

import * as CollectionsSync from './collections/collections-sync';
import * as SalesBackfillSync from './sales/sales-backfill-sync';
import * as SalesSync from './sales/sales-sync';
import * as TokenSync from './tokens/tokens-sync';

export const jobs = {
	CollectionsSync,
	SalesBackfillSync,
	SalesSync,
	TokenSync,
};

export const queues = Object.values(jobs).map(({ queue }) => queue);
