import config from '../../config.json';
import CollectionsScheduler from './collections-scheduler';

import './collections-sync';

if (config.schedulers['collections-scheduler'].enabled) {
	new CollectionsScheduler();
}
