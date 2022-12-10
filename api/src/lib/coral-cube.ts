import type { CCSale } from '../types';
import axios from 'axios';

export default class CoralCube {
	public static api = axios.create({
		baseURL: 'https://api.coralcube.cc/0dec5037-f67d-4da8-9eb6-97e2a09ffe9a',
		timeout: 75000,
		headers: { 'accept-encoding': '*' },
	});

	public static async getSales(collection_symbol: string, update_authority: string, limit: number = 25, before?: string) {
		try {
			return (
				await this.api.get<CCSale[]>('/inspector/getMintActivities', {
					params: {
						collection_symbol,
						update_authority,
						limit,
						...(before && { before }),
					},
				})
			).data;
		} catch (err) {
			if (axios.isAxiosError(err)) {
				if (err.status === 504) {
					console.error(`Gateway Timeout, failed to fetch royalty sales for ${collection_symbol}, ${update_authority}`);
					return null;
				}

				console.error(`[${err.response?.status}] Failed to fetch royalty sales for ${collection_symbol}, ${update_authority}`);
				return null;
			}

			console.error(`Failed to fetch royalty sales for ${collection_symbol}, ${update_authority}`, err);
			return undefined;
		}
	}
}
