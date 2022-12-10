import create from 'zustand';

type PaginationStore = {
	page: number;
	maxPages: number;
};

type PaginationMethods = {
	setPagination: (data: Partial<PaginationStore>) => void;
};

const usePagination = create<PaginationStore & PaginationMethods>((set) => ({
	page: 1,
	maxPages: 1,
	setPagination: (data) => set((state) => ({ ...state, ...data })),
}));

export default usePagination;
