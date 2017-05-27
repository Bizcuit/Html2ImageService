var fs 			= require("fs");
var readable	= require('stream').Readable;
var path 		= require('path');
var crypto 		= require('crypto');
var config		= requireRoot('config');
var gcs			= require('@google-cloud/storage')(config.googlecloudConnection);
var redis 		= require('redis');

var client = redis.createClient(config.redisConnection);


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

	getTemplateKey: function(name){
		return this.getDatabaseKey('TMPL', name);
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

	pathExists: function(path){
		return new Promise((resolve, reject) =>{
			fs.access(path, fs.constants.R_OK, (err) => {
				if(err){
					reject();
				}
				else{
					resolve();
				}
			});			
		});
	},

	

	fileRead: function(path){
		var bucket = gcs.bucket(config.googlecloudBucket);

		console.log(`Template requested: ${path}`);

		var file = bucket.file(path);
		return file.download();
	},

	fileUpload: function(path){
		return new Promise((resolve, reject) => {
			var bucket = gcs.bucket(config.googlecloudBucket);
			bucket.upload(path, function(err, file, apiResponse) {
				if(!err){
					resolve(file);
				}
				else{
					reject(err);
				}
			});
		});
	},

	render: function(html, imgInfo, options){
		return new Promise((resolve, reject) => {
			var outputPath = imgInfo.imageFilePathLocal;
			var dir = path.dirname(outputPath);
			
			if (!fs.existsSync(dir)){
				fs.mkdirSync(dir);
			}		
			
			var stream = new readable();
			stream.push(html);
			stream.push(null); 

			converter.image(stream, options)
			.pipe(fs.createWriteStream(outputPath))
			.on('finish', () => {
				this.fileUpload(imgInfo.imageFilePath);
				resolve(outputPath);
			});
		});
	}
}