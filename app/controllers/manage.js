var express 	= require('express');
var router 		= express.Router();
var utils		= requireRoot('modules/utils');
var bodyParser	= require('body-parser');

var urlencodedParser = bodyParser.urlencoded({ extended: true })

var sendApiError = function(res, message){
	res.json({status: 'ERROR', message: message});
	console.log('ERROR: ' + message);
};

var getTemplate = function(data){
	var regexWord = /^\w+$/;
	var templateKey = utils.getTemplateKey(`${data.company}_${data.template}`);
	
	return new Promise((resolve, reject) => {
		if(!regexWord.test(data.company) || !regexWord.test(data.template)){
			reject('Incorrect company name or template name');
			return;
		}

		utils.getData(templateKey).then(function(template){
			if(!template || template.password == data.password){
				resolve(template);
			}
			else{
				reject('Incorrect password for the existing template');
			}
		});
	}); 
};

router.get('/', function(req, res){
	res.render('manage/index.pug');
});

router.post('/template/get', urlencodedParser, function(req, res){
	var input = {
		company: 	req.body.company,
		template: 	req.body.template,
		password: 	utils.hashCreate(req.body.password),
	};
	var output = null;

	var templateKey = utils.getTemplateKey(`${input.company}_${input.template}`);

	getTemplate(input)
	.then(function(template){
		output = template ? template : input;
		return utils.saveData(templateKey, output);
	})
	.then(function(){
		res.json(output);
	})
	.catch((err) => {
		sendApiError(res, err);
	});
});

router.post('/template/save', urlencodedParser, function(req, res){
	var input = {
		company: 	req.body.company,
		template: 	req.body.template,
		password: 	utils.hashCreate(req.body.password),
		html: 		req.body.html
	};

	var templateKey = utils.getTemplateKey(`${input.company}_${input.template}`);

	getTemplate(input)
	.then((data) => {
		return utils.saveData(templateKey, input);
	})
	.then((data) => {
		var result = {
			status: data,
			message: data == 'OK' ? 'Your templated has been successfully saved' : '?'
		};

		res.json(result);
	})
	.catch((err) => {
		sendApiError(res, err);
	});

});



module.exports = router;