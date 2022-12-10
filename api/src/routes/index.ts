import { Router } from 'express';

import collections from './collections';

const router = Router();

router.get('/', (req, res) => {
	return res.send('0x');
});

router.use('/collections', collections);

export default router;
