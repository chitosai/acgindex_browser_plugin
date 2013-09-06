// 
// 这里负责定义一些无关主题的方法，省得main看着乱
// 
var utility = {
	// 检查对象是否为空
	is_object_empty : function(obj) {
		for( key in obj ) 
			return false;
		return true;
	},

	// 显示消息用的
	hide_msg_delay : 1000,
	hide_msg_timeout : null,
	show_msg : function( input ) {
		clearTimeout(utility.hide_msg_timeout);
		if( typeof(input) == 'object' ) {
			// 自动从DOM上获取提示文本
			flag = $(this).attr('class');
			msg = $(this).data('msg');
		} else {
			// 人工传入文本
			msg = input;
			flag = 'acgindex_msg_active';
		}
		var mbox = $('#acgindex_msg'), text_len = msg.length;
		mbox.text(msg).css({
			'left': (275-mbox.width())/2 + 'px' 
		}).attr('class', flag);
	},
	hide_msg : function( immediately ) {
		utility.hide_msg_timeout = setTimeout(function(){
			$('#acgindex_msg').attr('class', '');
		}, (immediately === true ? 1 : utility.hide_msg_delay));
		
	},

	// 全局状态
	enable_ext : function() {
		$('.acgindex_global_disabled').removeClass('acgindex_global_disabled');
		$('.acgindex_msg_active_flag').removeClass('acgindex_msg_active_flag').addClass('acgindex_msg_active');

		utility.hide_msg(true);
	},
	disable_ext : function( msg ) {
		$('#acgindex_link a').addClass('acgindex_global_disabled');
		$('.acgindex_msg_active').removeClass('acgindex_msg_active').addClass('acgindex_msg_active_flag');

		if( typeof(msg) == 'string' ) utility.show_msg(msg)
	}

}