var fs 			= require("fs");
var readable	= require('stream').Readable;
var path 		= require('path');
var crypto 		= require('crypto');

module.exports = {
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

	hashCreate: function(input){
		var inputString = typeof input == 'object' ? JSON.stringify(input) : input;
		return crypto.createHash('md5').update(inputString).digest('hex')
	},

	fileRead: function(path){
		return new Promise((resolve, reject) => {
			fs.readFile(path, 'utf8', function (err,data) {
				if (err) {
					reject(err);
				}
				resolve(data);
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
				resolve(outputPath);
			});
		});
	}
}