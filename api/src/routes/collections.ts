import { Router } from 'express';
import { Prisma } from '@prisma/client';
import Joi from 'joi';
import moment from 'moment-timezone';

import prisma from '../lib/prisma';
import validate from '../utils/validate';

const router = Router();

const getCollectionOverviewSchema = Joi.object({
	symbol: Joi.string().required(),
	period: Joi.string().required(),
});

const getCollectionCharts = Joi.object({
	symbol: Joi.string().required(),
	period: Joi.string().required(),
});

const getCollectionSaleSchema = Joi.object({
	symbol: Joi.string().required(),
	page: Joi.number().required().min(1),
	buyer: Joi.string().optional(),
	paid: Joi.boolean().optional(),
});

const collectionSelect = Prisma.validator<Prisma.CollectionSelect>()({
	symbol: true,
	name: true,
	image: true,
	description: true,
	royalty_fee: true,
	discord: true,
	twitter: true,
	website: true,
});

const saleSelect = Prisma.validator<Prisma.SaleSelect>()({
	token: { select: { name: true } },
	sol: true,
	royalty_fee: true,
	buyer: true,
	seller: true,
	marketplace: true,
	time: true,
});

const periods = ['1d', '3d', '7d', '14d'];

router.get('/', async (req, res) => {
	try {
		const collections = await prisma.collection.findMany({
			where: { track: true },
			select: collectionSelect,
			orderBy: { name: 'asc' },
		});

		return res.status(200).json({ success: true, collections });
	} catch (err) {
		console.error('/collections', err);
		return res.status(500).json({ success: false, message: 'Server Error' });
	}
});

router.get('/overview', validate(getCollectionOverviewSchema, 'query'), async (req, res) => {
	const symbol = req.query.symbol as string;
	const period = req.query.period as string;

	if (!periods.includes(period)) return res.status(400).json({ success: false, message: 'Invalid Period' });

	try {
		const { iso } = getTimePeriod(period);
		const collection = await prisma.collection.findUnique({ where: { symbol }, select: collectionSelect });
		if (!collection) return res.status(404).json({ success: false, message: 'Collection was not found' });

		const sales = await prisma.sale.findMany({
			where: { symbol, created_at: { gte: iso } },
			select: {
				token: { select: { name: true } },
				marketplace: true,
				royalty_fee: true,
				buyer: true,
				seller: true,
				sol: true,
				time: true,
			},
		});

		const names = Array.from(new Set(sales.map((sale) => sale.marketplace)));
		const marketplaces = names.map((marketplace) => ({
			name: marketplace,
			y: sales.filter((s) => s.marketplace === marketplace).length,
		}));

		const royalty = (collection?.royalty_fee || 0) / 10_000;

		const stats = {
			sales: sales.length,
			volume: sales.reduce((p, c) => c.sol + p, 0),
			paid: sales.reduce((p, c) => c.royalty_fee + p, 0),
			unpaid: sales.reduce((p, c) => (c.royalty_fee === 0 ? c.sol + p : p), 0) * royalty,
		};

		return res.status(200).json({
			success: true,
			collection: {
				symbol: collection?.symbol,
				name: collection?.name,
				image: collection?.image,
				description: collection?.description,
				royalty_fee: collection?.royalty_fee,
				discord: collection?.discord,
				twitter: collection?.twitter,
				website: collection?.website,
			},
			stats,
			sales: sales.map((sale) => ({
				x: moment(sale.time).valueOf(),
				y: sale.sol,
				token: { name: sale.token?.name, marketplace: sale.marketplace, royalty_fee: sale.royalty_fee, seller: sale.seller, buyer: sale.buyer },
			})),
			marketplaces,
		});
	} catch (err) {
		console.error(`/collections/overview - ${symbol}`, err);
		return res.status(500).json({ success: false, message: 'Server Error' });
	}
});

router.get('/charts', validate(getCollectionCharts, 'query'), async (req, res) => {
	const symbol = req.query.symbol as string;
	const period = req.query.period as string;

	if (!periods.includes(period)) return res.status(400).json({ success: false, message: 'Invalid Period' });

	try {
		const { iso } = getTimePeriod(period);

		const sales = await prisma.sale.findMany({
			where: { symbol, created_at: { gte: iso } },
			select: {
				token: { select: { name: true } },
				marketplace: true,
				royalty_fee: true,
				buyer: true,
				seller: true,
				sol: true,
				time: true,
			},
		});

		const names = Array.from(new Set(sales.map((sale) => sale.marketplace)));
		const marketplaces = names.map((marketplace) => ({
			name: marketplace,
			y: sales.filter((s) => s.marketplace === marketplace).length,
		}));

		return res.status(200).json({
			success: true,
			stats: {
				sales: sales.length,
				volume: sales.reduce((p, c) => c.sol + p, 0),
				paid: sales.reduce((p, c) => (c.royalty_fee > 0 ? c.royalty_fee : 0), 0),
			},
			sales: sales.map((sale) => ({
				x: moment(sale.time).valueOf(),
				y: sale.sol,
				token: { name: sale.token?.name, marketplace: sale.marketplace, royalty_fee: sale.royalty_fee, seller: sale.seller, buyer: sale.buyer },
			})),
			marketplaces,
		});
	} catch (err) {
		console.error(`/collections/charts - ${symbol}`, err);
		return res.status(500).json({ success: false, message: 'Server Error' });
	}
});

router.get('/sales', validate(getCollectionSaleSchema, 'query'), async (req, res) => {
	const symbol = req.query.symbol as string;
	const page = parseInt(req.query.page as string);
	const buyer = req.query.buyer as string | undefined;
	const paid = req.query.paid as string;

	try {
		const query: Prisma.SaleWhereInput = {
			symbol,
			...(paid && paid === 'true' && { royalty_fee: { gt: 0 } }),
			...(paid && paid === 'false' && { royalty_fee: { equals: 0 } }),
			...(buyer && buyer !== '' ? { buyer: { equals: buyer, mode: 'insensitive' } } : undefined),
		};

		const [sales, count] = await prisma.$transaction([
			prisma.sale.findMany({
				where: query,
				orderBy: { created_at: 'desc' },
				select: saleSelect,
				skip: (page - 1) * 25,
				take: 25,
			}),
			prisma.sale.count({
				where: query,
			}),
		]);

		return res.status(200).json({ success: true, sales, page, maxPages: Math.ceil(count / 25) });
	} catch (err) {
		console.error(`/collections/sales - ${symbol}`, err);
		return res.status(500).json({ success: false, message: 'Server Error' });
	}
});

const getTimePeriod = (period: string) => {
	let start: { str: string; iso: string } | undefined = undefined;

	switch (period) {
		case '1d':
			start = { str: '1 day', iso: moment.utc().subtract(1, 'day').toISOString() };
			break;
		case '3d':
			start = { str: '3 days', iso: moment.utc().subtract(3, 'days').toISOString() };
			break;
		case '7d':
			start = { str: '7 days', iso: moment.utc().subtract(7, 'days').toISOString() };
			break;
		default:
			start = { str: '1 day', iso: moment.utc().subtract(1, 'day').toISOString() };
	}

	return start;
};

export default router;
