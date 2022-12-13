import type { CollectionStat, PaidType, Collection, Sale, SalesChart, CollectionOverview, MarketplacesChart } from '../types';
import create from 'zustand';

type CollectionStore = {
	collections: Collection[];
	collection: Collection | null;
	periods: string[];
	chartPeriod: string;
	buyer: string;
	stats: CollectionStat;
	sales: Sale[];
	salesChart: SalesChart[];
	marketplacesChart: MarketplacesChart[];
	overview: CollectionOverview;
	paid: PaidType;
};

type CollectionStoreMethods = {
	setCollections: (data: Partial<CollectionStore>) => void;
	setCollection: (collection: Collection) => void;
};

const useCollection = create<CollectionStore & CollectionStoreMethods>((set) => ({
	collections: [],
	collection: null,
	periods: ['1d', '3d', '7d', '14d'],
	chartPeriod: '7d',
	stats: { sales: 0, royalty_paid: 0, sales_paid: 0, volume: 0 },
	sales: [],
	salesChart: [],
	buyer: '',
	marketplacesChart: [],
	overview: { sales: 0, volume: 0, paid: 0, unpaid: 0 },
	paid: 'All',
	setCollections: (data) => set((state) => ({ ...state, ...data })),
	setCollection: (collection) => set((state) => ({ ...state, collection })),
}));

export default useCollection;
