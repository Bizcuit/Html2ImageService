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
	var _width 		= parseInt(req.params[2]);
	var _height 	= parseInt(req.params[3]);
	var _company	= req.params[0];
	var _template	= req.params[1];
	var _format 	= req.params[4];
	
	var templateData	= extend({
		screenWidth: 	_width,
		screenHeight: 	_height
	}, req.query);

	var imgInfo = {
		company: 		_company,
		template: 		_template,
		format:			_format,
		width:			_width,
		height:			_height,

		getTemplateDir:		function() { return `${this.company}/${this.template}`; },
		getTemplatePath:	function() { return this.getTemplateDir() + '/index.html' },
		getImgFilename:		function() { return utils.hashCreate(templateData) + '.' + this.format; },
		getImgPath:			function() { return this.getTemplateDir() + '/img/' + this.getImgFilename(); },
		getLocalImgPath:	function() { return rootPath + '/content/' + this.getImgPath(); }
	};

	res.type(imgInfo.format);

	//if image already exists - return image and stop
	if(fs.existsSync(imgInfo.getLocalImgPath())){
		res.sendFile(imgInfo.getLocalImgPath());
		return;
	}
	
	//if image doesn't exist
	utils.fileRead(imgInfo.getTemplatePath())
	.then((templateContent) => {
		var html = mustache.render(templateContent.toString(), templateData);
		var options = {
			'disable-smart-width': null,
			'format': 	imgInfo.format,
			'width': 	imgInfo.width,
			'height': 	imgInfo.height,
			'crop-w': 	imgInfo.width,
			'crop-h': 	imgInfo.height,
			'crop-x': 	0,
			'crop-y': 	0
		}

		return utils.render(html, imgInfo, options);
	})
	.then((imagePath) => {
		res.type(_format);
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