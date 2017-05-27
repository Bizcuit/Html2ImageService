
module.exports = {
	env: 'dev',
	serverPort: (process.env.NODE_ENV === 'production' ? process.env.PORT : 8080),
	
	redisConnection: (process.env.NODE_ENV === 'production' ? process.env.REDIS_URL : null),
	
	hashingSolt: (process.env.NODE_ENV === 'production' ? process.env.APP_HASHING_SOLT : 'querty'),

	googlecloudBucket: 'html2image',
	googlecloudConnection: {
		projectId:		'html2imageservice',
		credentials:	(process.env.NODE_ENV === 'production' ? JSON.parse(process.env.APP_GOOGLECLOUD_CREDENTIALS) : null),
		keyFilename:	(process.env.NODE_ENV === 'production' ? null : rootPath + '/googlecloud-connection.json'),
	}
}