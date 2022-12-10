import type { PaidType } from '../types';
import type { Collection, Sale, SalesChart, CollectionStat, MarketplacesChart } from '../types';
import create from 'zustand';

type CollectionStore = {
	collections: Collection[];
	collection: Collection | null;
	periods: string[];
	chartPeriod: string;
	buyer: string;
	sales: Sale[];
	salesChart: SalesChart[];
	marketplacesChart: MarketplacesChart[];
	stats: CollectionStat;
	paid: PaidType;
};

type CollectionStoreMethods = {
	setCollections: (data: Partial<CollectionStore>) => void;
	setCollection: (collection: Collection) => void;
};

const useCollection = create<CollectionStore & CollectionStoreMethods>((set) => ({
	collections: [],
	collection: null,
	periods: ['1d', '3d', '7d'],
	chartPeriod: '7d',
	sales: [],
	salesChart: [],
	buyer: '',
	marketplacesChart: [],
	stats: { sales: 0, volume: 0, paid: 0, unpaid: 0 },
	paid: 'All',
	setCollections: (data) => set((state) => ({ ...state, ...data })),
	setCollection: (collection) => set((state) => ({ ...state, collection })),
}));

export default useCollection;
