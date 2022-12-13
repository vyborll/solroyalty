import 'dotenv/config';

import prisma from './lib/prisma';
import { addToQueue } from './jobs/tokens/tokens-sync';

async function seed() {
	const tokens = await prisma.token.findMany({
		where: {
			image: null,
		},
	});

	for (const token of tokens) {
		await addToQueue(
			{
				mint: token.mint,
				uri: token.uri,
			},
			{
				jobId: token.mint,
			},
		);
	}
}

seed();
