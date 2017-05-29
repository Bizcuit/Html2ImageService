var utils 		= requireRoot('modules/utils');
var extend 		= require('util')._extend;

function ImageInfo(props, query){
	this.width 			= parseInt(props.width);
	this.height 		= parseInt(props.height);
	this.company		= props.company;
	this.template		= props.template;
	this.format 		= props.format;
	this.query 			= query;


	this.tempateDataObject	= extend({
		_screenWidth: 	this.width,
		_screenHeight: 	this.height
	}, this.query);

	this.imageFileName			= `${this.company}_${this.template}_${utils.hashCreate(this.tempateDataObject)}.${this.format}`;

	this.templateKey 	= utils.getTemplateKey(this.company, this.template);
	this.key			= utils.getImageKey(this.imageFileName);

	this.wkhtmlParameters = {
		'disable-smart-width': null,
		'encoding':	'utf-8',
		'format': 	this.format,
		'width':	this.width,
		'height': 	this.height,
		'crop-w': 	this.width,
		'crop-h': 	this.height,
		'crop-x': 	0,
		'crop-y': 	0
	}
}

module.exports = ImageInfo;