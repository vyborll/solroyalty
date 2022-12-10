export interface CollectionStats {
	symbol: string;
	name: string;
	image: string;
	description: string;
	royalty_fee?: number;
	discord: string;
	twitter: string;
	website: string;
	stats: CollectionStat;
}

export interface Collection {
	symbol: string;
	name: string;
	image: string;
	description: string;
	royalty_fee?: number;
	discord: string;
	twitter: string;
	website: string;
}

export interface CollectionStat {
	sales: number;
	volume: number;
	unpaid: number;
	paid: number;
}

export interface Sale {
	token: { name: string };
	sol: number;
	royalty_fee: number;
	buyer: string;
	seller: string;
	marketplace: string;
	time: string;
}

export interface SalesChart {
	x: number;
	y: number;
	token: {
		name: string;
		marketplace: string;
		royalty_fee: number;
		buyer: string;
		seller: string;
	};
}

export interface MarketplacesChart {
	name: string;
	y: number;
}

export type PaidType = 'All' | 'Paid' | 'Unpaid';
