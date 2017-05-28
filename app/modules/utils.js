var readable	= require('stream').Readable;
var crypto 		= require('crypto');
var config		= requireRoot('config');
var redis 		= require('redis');
var client 		= redis.createClient(config.redisConnection);


module.exports = {
	hashCreate: function(input, solt){
		if(!solt){
			solt = config.hashingSolt;
		}
		var inputString = typeof input == 'object' ? JSON.stringify(input) : input;
		return crypto.createHash('sha256').update(inputString + solt).digest('hex')
	},

	getDatabaseKey: function(type, name){
		return type + '_' + name;
	},

	getTemplateKey: function(company, name){
		return this.getDatabaseKey('TMPL', `${company}_${name}`);
	},

	getImageKey: function(name){
		return this.getDatabaseKey('IMG', name);
	},

	saveData: function(key, data){
		return new Promise((resolve, reject) => {
			client.set(key, JSON.stringify(data), function(err, resp){
				if(err){
					reject(err);
				}
				else{
					resolve(resp);
				}
			});
		});
	},

	getData: function(key){
		return new Promise((resolve, reject) => {
			client.get(key, function(err, resp){
				if(err){
					reject(err);
				}
				else{
					resolve(JSON.parse(resp));
				}
			});
		});
	},

	render: function(html, options){
		return new Promise((resolve, reject) => {
			var stream = new readable();
			stream.push(html);
			stream.push(null); 

			var chunks = [];

			converter.image(stream, options)
			.on('data', (chunk) => {
				chunks.push(chunk);
			})
			.on('finish', () => {
				resolve(Buffer.concat(chunks));
			});
		});
	}
}