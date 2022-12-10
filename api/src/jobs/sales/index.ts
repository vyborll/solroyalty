import config from '../../config.json';
import SalesScheduler from './sales-scheduler';

import './sales-backfill-sync';
import './sales-sync';

if (config.schedulers['sales-scheduler'].enabled) {
	new SalesScheduler();
}
