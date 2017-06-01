var Html2Image = {
	currentTemplate: null,

	templateSave: function(data){
		var that = this;
		
		Popup.open({
			title: 'Saving template', 
			message: 'Please wait...', 
			wait: true
		});

		jQuery.post('/manage/template/save', data)
		.always(function(resp){
			Popup.open({
				title: 'Saving complete ', 
				message: resp.status + ': ' + resp.message
			});

			that.templatePreview();
		});
	},

	templateOpen: function(data){
		var that = this;
		
		this.currentTemplate = null;

		$('#bl_TemplateInfo .company').text('-');
		$('#bl_TemplateInfo .template').text('-');

		Popup.open({
			title: 'Opening template', 
			message: 'Please wait...', 
			wait: true
		});

		jQuery.post('/manage/template/get', data)
		.always(function(resp){
			if(resp.status && resp.status == 'ERROR'){
				Popup.open({
					title: 'Failed to opening template',
					message: resp.status + ': ' + resp.message
				});
			}
			else{
				Popup.close();
				that.currentTemplate = resp;
				
				$('#tb_Editor').val(resp.html);
				$('#bl_Editor').show();
				$('#bl_OpenCreate').hide();
				$('#bl_TemplateInfo .company').text(that.currentTemplate.company);
				$('#bl_TemplateInfo .template').text(that.currentTemplate.template);
				
				that.templatePreview();
			}
		});
	},

	templatePreview: function(){
		var imgPreviewLink = this.templateGetUrl();
		$('#img_Preview').attr('src', imgPreviewLink + (new Date()));
		$('#bl_Preview').width($('#tb_ImgWidth').val() + 'px');
		$('#bl_Preview').height($('#tb_ImgHeight').val() + 'px');

		var doc = $('#bl_Preview').get(0).contentWindow.document;
		doc.open();
		doc.write($('#tb_Editor').val());
		doc.close();
	},

	templateGetParameters: function(){
		var regexParameter = /\{\{([\w\.]+)\}\}/ig;
		var m = null;
		var result = [];
		while(m = regexParameter.exec(this.currentTemplate.html)){
			result.push(m[1]);
		}
		return result;
	},

	templateGetUrl: function(){
		var parameters = this.templateGetParameters();
		var link = window.location.protocol + '//'
			+ window.location.host
			+ '/do/' + this.currentTemplate.company + '/'
			+ this.currentTemplate.template + '-'
			+ $('#tb_ImgWidth').val() + 'x'
			+ $('#tb_ImgHeight').val() + '.'
			+ $('#dd_ImgType').val() + '?';
		
		for(var i = 0; i < parameters.length; i++){
			link += parameters[i] + '=test_val_for_' + parameters[i] + '&' 
		}

		
		$('#tb_ImgLink').val(link);

		return link;
	}
};

var Popup = {
	popup:		null,
	title: 		null,
	message:		null,
	btnClose: 	null,
	wait:		null,

	init: function(){
		this.title 		= $('#popup .title');
		this.message 		= $('#popup .message p');
		this.btnClose	= $('#popup #btn_PopupClose');
		this.popup		= $('#popup');
		this.wait		= $('#popup .wait');

		var that = this;

		this.btnClose.click(function(){
			that.close();
		});

		this.popup.keydown(function(e){
			if (e.keyCode == 27) {
				that.close();
			}
		});
	},

	open: function(config){

		//{title, message, wait, messageClass}
		this.title.text(config.title);
		this.message.html(config.message);
		this.message.removeClass();
		this.message.addClass(config.messageClass);

		if(config.wait){
			this.wait.show();
			this.btnClose.hide();
		}
		else{
			this.wait.hide();
			this.btnClose.show();
		}
		
		this.popup.stop();
		this.popup.fadeIn('fast');
	},

	close: function(){
		this.popup.stop();
		this.popup.fadeOut('fast');
	}
}

$(document).ready(function(){
	Popup.init();
	$('#bl_Editor').hide();

	$('#btn_SaveTemplate').click(function(){
		var data = {
			company: 	$('#tb_Company').val(),
			template:	$('#tb_TemplateName').val(),
			password:	$('#tb_TemplatePassword').val(),
			html: 		$('#tb_Editor').val()
		};
		Html2Image.templateSave(data);
	});

	$('#btn_OpenTemplate').click(function(){
		var data = {
			company: 	$('#tb_Company').val(),
			template:	$('#tb_TemplateName').val(),
			password:	$('#tb_TemplatePassword').val(),
		};

		Html2Image.templateOpen(data);
	});

	$('#btn_NewTemplate').click(function(){
		if(confirm('Your current work may be lost. Are you sure?')){
			window.location.reload();
		}
	});

	$('#btn_PreviewTemplate').click(function(){
		Html2Image.templatePreview();
	});
});