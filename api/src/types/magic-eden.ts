export interface MECollection {
	symbol: string;
	name: string;
	description: string;
	image: string;
	twitter: string;
	discord: string;
	website: string;
	categories: string[];
	isBadged: boolean;
	isFlagged?: boolean;
	flagMessage?: string;
}

export interface MEActivity {
	signature: string;
	type: string;
	source: string;
	tokenMint: string | null;
	collection: string;
	collection_symbol: string;
	slot: number;
	blockTime: number;
	buyer?: string | null;
	buyerReferral: string;
	sellerReferral: string;
	seller?: string;
	price: number;
	image?: string;
}

export interface METoken {
	mintAddress: string;
	owner: string;
	supply: number;
	collection: string;
	name: string;
	updateAuthority: string;
	primarySaleHappened: number;
	sellerFeeBasisPoints: number;
	image: string;
	animationUrl: string;
	externalUrl: string;
	attributes: { trait_type: string; value: string }[];
	properties: {
		files: { uri: string; type: string }[];
		category: string;
		creators: { address: string; share: number }[];
	};
}
