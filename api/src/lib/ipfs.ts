import axios from 'axios';

const ipfs_cloudflare_prefix = 'https://cloudflare-ipfs.com/ipfs/';
const ipfs_prefix = 'ipfs://';
const ipfs_io = 'https://ipfs.io/ipfs/';

export async function fetch(url: string) {
	const ipfs_url = url.includes(ipfs_cloudflare_prefix) ? url.replace(ipfs_cloudflare_prefix, ipfs_io) : url.replace(ipfs_prefix, ipfs_io);

	try {
		const res = await axios.get(ipfs_url, { timeout: 30000 });
		return { image: (res.data.image as string) || undefined };
	} catch (err) {
		console.error(`Ipfs, failed to fetch ipfs url ${url}`, err);
		throw err;
	}
}
