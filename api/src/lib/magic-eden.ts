import type { MECollection, MEActivity, METoken } from '../types';
import axios from 'axios';

export default class MagicEden {
	public static api = axios.create({
		baseURL: 'https://api-mainnet.magiceden.dev/v2',
		headers: {
			'accept-encoding': '*',
		},
	});

	public static async getCollections(offset: number = 0, limit: number = 500) {
		return (
			await this.api.get<MECollection[]>('/collections', {
				params: {
					offset,
					limit,
				},
			})
		).data;
	}

	public static async getCollection(symbol: string) {
		try {
			return (await this.api.get<MECollection>(`/collections/${symbol}`)).data;
		} catch (err) {
			if (axios.isAxiosError(err)) {
				if (err.status === 404) {
					return null;
				}

				console.error(`An error occurred while fetching collection from magic eden`, err);
				throw err;
			}
		}
	}

	public static async getActivity(symbol: string, type: 'list' | 'buyNow', offset: number = 0, limit: number = 25) {
		try {
			return (await this.api.get<MEActivity[]>(`/collections/${symbol}/activities`, { params: { type, offset, limit } })).data;
		} catch (err) {
			console.error(`getActivity() failed for ${symbol}`, err);
			return null;
		}
	}

	public static async getToken(mint: string) {
		try {
			return (await this.api.get<METoken>(`/tokens/${mint}`)).data;
		} catch (err) {
			console.error(`getToken() failed for ${mint}`, err);
			return null;
		}
	}
}
