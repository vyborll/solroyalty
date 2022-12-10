import Redis from 'ioredis';

const redis = new Redis({
	host: process.env.REDIS_HOST,
	username: process.env.REDIS_USER,
	password: process.env.REDIS_PASS,
	maxRetriesPerRequest: null,
});

export default redis;
