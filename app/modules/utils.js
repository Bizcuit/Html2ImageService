var fs 			= require("fs");
var readable	= require('stream').Readable;
var path 		= require('path');
var crypto 		= require('crypto');
var config		= requireRoot('config');
var gcs			= require('@google-cloud/storage')(config.googlecloudConnection);

module.exports = {
	hashCreate: function(input){
		var inputString = typeof input == 'object' ? JSON.stringify(input) : input;
		return crypto.createHash('md5').update(inputString).digest('hex')
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
		var bucket = gcs.bucket('html2image');
		var file = bucket.file(path);
		return file.download();
	},

	fileUpload: function(path){
		return new Promise((resolve, reject) => {
			var bucket = gcs.bucket('html2image');
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

	render: function(html, outputPath, options){
		return new Promise((resolve, reject) => {
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
				this.fileUpload(outputPath);
				resolve(outputPath);
			});
		});
	}
}