var Html2Image = {
	templateSave: function(data){
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
		});
	},

	templateOpen: function(data){
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
				$('#tb_Editor').val(resp.html);
				$('#bl_Editor').show();
				$('#bl_OpenCreate').hide();
			}
		});
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
		
		this.popup.show();
	},

	close: function(){
		this.popup.hide();
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
});