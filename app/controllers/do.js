var express 	= require('express');
var utils		= requireRoot('modules/utils');
var mustache	= require('mustache');
var extend 		= require('util')._extend;
var fs 			= require('fs');

var router 		= express.Router();

/* 
	URL fomat: /[company]/[template]_[width]x[height].[format]?[template variables]
	Example: /salesforce/tmp1_120x80.jpg?name=Sergey
*/

router.get(/^\/([a-z0-9]+)\/([a-z0-9]+)_(\d+)x(\d+)\.(jpg|png)$/, function(req, res){
	var company 	= req.params[0];
	var template 	= req.params[1];
	var width 		= parseInt(req.params[2]);
	var height 		= parseInt(req.params[3]);
	var format 		= req.params[4];
	
	var contentDir 		= `${rootPath}/content/${company}/${template}/`;
	
	var templatePath	= contentDir + 'index.html';
	var templateData	= extend({
		screenWidth: width,
		screenHeight: height
	}, req.query);

	var imageDir		= contentDir + 'img';
	var imageName		= utils.hashCreate(templateData) + '.' + format;
	var imagePath		= imageDir + '/' + imageName;

	res.type(format);

	//if image already exists - return image and stop
	if(fs.existsSync(imagePath)){
		res.sendFile(imagePath);
		return;
	}
	
	//if image doesn't exist
	utils.fileRead(templatePath)
	.then((templateContent) => {
		var html = mustache.render(templateContent, templateData);
		var options = {
			'format': format,
			'width': width,
			'height': height,
			'crop-w': width,
			'crop-h': height,
			'disable-smart-width': null,
			'crop-x': 0,
			'crop-y': 0
		}

		return utils.render(html, imagePath, options);
	})
	.then((imagePath) => {
		res.type(format);
		res.sendFile(imagePath);
	})
	.catch((error) => {
		//smth went wrong. return empty one pixel image
		console.log('Error: ' + error);
		imagePath = `${rootPath}/public/img/empty.png`;
		res.type('png');
		res.sendFile(imagePath);
	});	
});

module.exports = router;