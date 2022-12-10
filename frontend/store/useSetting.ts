import create from 'zustand';

type SettingStore = {
	solUsd: number;
	setSolUsd: (sol: number) => void;
};

const useSetting = create<SettingStore>((set) => ({
	solUsd: 0,
	setSolUsd: (sol) => set((state) => ({ ...state, solUsd: sol })),
}));

export default useSetting;
