var config		= requireRoot('config');
var express 	= require('express');
var app 		= express();
var wkhtmltox 	= require('wkhtmltox');

global.converter = new wkhtmltox();

app.set('view engine', 'pug');
app.set('views', rootPath + '/app/views');

app.use('/do', requireRoot('controllers/do'));
app.use('/manage', requireRoot('controllers/manage'));
app.use('/public', express.static(rootPath + '/public'))


app.listen(config.serverPort, function() {
	console.log('Application started: ' + (new Date()));
})