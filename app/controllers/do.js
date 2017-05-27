var express 		= require('express');
var utils			= requireRoot('modules/utils');
var ImageInfo		= requireRoot('modules/ImageInfo');
var mustache		= require('mustache');
var fs 				= require('fs');

var router 			= express.Router();

/* 
	URL fomat: /[company]/[template]-[width]x[height].[format]?[template variables]
	Example: /salesforce/tmp1-120x80.jpg?name=Sergey
*/

router.get('/:company(\\w+)/:template(\\w+)-:width(\\d+)x:height(\\d+).:format(\\w{3})', function(req, res){
	var imgInfo = new ImageInfo(req.params, req.query);
	
	res.type(imgInfo.format);

	//if image already exists - return image and stop
	if(fs.existsSync(imgInfo.imageFilePathLocal)){
		res.sendFile(imgInfo.imageFilePathLocal);
		return;
	}
	
	//if image doesn't exist
	utils.fileRead(imgInfo.templateFilePath)
	.then((templateContent) => {
		var html = mustache.render(templateContent.toString(), imgInfo.tempateDataObject);

		return utils.render(html, imgInfo, imgInfo.wkhtmlParameters);
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