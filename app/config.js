
module.exports = {
	serverPort: (process.env.NODE_ENV === 'production' ? process.env.PORT : 8080),
	
	redisConnection: (process.env.NODE_ENV === 'production' ? process.env.REDIS_URL : null),
	
	hashingSolt: (process.env.NODE_ENV === 'production' ? process.env.APP_HASHING_SOLT : 'querty'),
}