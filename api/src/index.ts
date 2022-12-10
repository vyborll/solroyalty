import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import cors from 'cors';

import { jobs, queues } from './jobs';
import routes from './routes';

const HTTP_PORT: number = parseInt(process.env.HTTP_PORT || '3001');

async function main() {
	const app = express();
	const server = createServer(app);
	const serverAdapter = new ExpressAdapter();

	if (process.env.NODE_ENV !== 'production') {
		createBullBoard({
			queues: queues.map((queue) => new BullMQAdapter(queue)),
			serverAdapter,
		});

		serverAdapter.setBasePath('/admin/queues');
		app.use('/admin/queues', serverAdapter.getRouter());
	}

	app.use(express.json());
	app.use(express.urlencoded({ extended: false }));
	app.use(cors({ origin: 'http://localhost:3000' }));
	app.use(routes);

	server.listen(HTTP_PORT, () => {
		console.log(`Server is now listening on port ${HTTP_PORT}`);
	});
}

process.on('SIGINT', shutdown).on('SIGTERM', shutdown);

async function shutdown() {
	console.log('Shutting down all workers');

	for (const job of Object.values(jobs)) {
		await job.worker?.close();
	}

	console.log('All workers shutdown');
	process.exit(0);
}

main();
