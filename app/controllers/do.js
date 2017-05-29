var express 		= require('express');
var utils			= requireRoot('modules/utils');
var ImageInfo		= requireRoot('modules/ImageInfo');
var mustache		= require('mustache');

var router 			= express.Router();

/* 
	URL fomat: /[company]/[template]-[width]x[height].[format]?[template variables]
	Example: /salesforce/tmp1-120x80.jpg?name=Sergey
*/

function imageCreate(imgInfo){
	return utils.getData(imgInfo.templateKey)
	.then((template) => {

		if(!template || !template.html){
			throw `Template does not exist or empty. Templatekey=${imgInfo.templateKey}`;
		}

		return utils.render(
			mustache.render(template.html, imgInfo.tempateDataObject), 
			imgInfo.wkhtmlParameters
		)
		.then((buffer) => {
			
			utils.saveData(imgInfo.key, {
				data: buffer.toString('base64')
			});
			return new Promise((resolve, reject) => {
				resolve(buffer);
			});
		});
	});
}

function imageRead(imgInfo){
	return utils.getData(imgInfo.key)
	.then((img) => {
		if(img && img.data){
			console.log('Image reading: ' + imgInfo.key);
			return new Promise((resolve, reject) => {
				resolve(new Buffer(img.data, 'base64'));
			});
		}
		else{
			console.log('Image creating: ' + imgInfo.key);
			return imageCreate(imgInfo);
		}
	});
}

router.get('/:company(\\w+)/:template(\\w+)-:width(\\d+)x:height(\\d+).:format(\\w{3})', function(req, res){
	var imgInfo = new ImageInfo(req.params, req.query);
	res.type(imgInfo.format);

	imageRead(imgInfo)
	.then((buffer) => {
		res.type(imgInfo.format);
		res.end(buffer);
	})
	.catch((error) => {
		res.type('png');
		res.sendFile(`${rootPath}/public/img/empty.png`);
		console.log('Error: ' + error);
	});
});

module.exports = router;